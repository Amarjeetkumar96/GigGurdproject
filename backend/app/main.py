from fastapi import FastAPI, HTTPException, Depends, status, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from jose import JWTError, jwt
import os, sys, random, string
from datetime import datetime

from . import schemas, models, database, auth

# ML Models
sys.path.append(os.path.join(os.path.dirname(__file__), "..", ".."))
try:
    from ml_models.risk_assessment import generate_risk_score
except ImportError:
    def generate_risk_score(loc, inc): return round(random.uniform(0.1, 0.6), 2)

try:
    from ml_models.fraud_detection import compute_fraud_score, is_fraud_flagged, get_fraud_reason
except ImportError:
    def compute_fraud_score(d): return round(random.uniform(0, 0.3), 2)
    def is_fraud_flagged(s): return s > 0.45
    def get_fraud_reason(s, d): return "ML model unavailable"

SECRET_KEY = os.getenv("SECRET_KEY", "your-super-secret-key-for-gigguard-2024")
ALGORITHM = "HS256"

# Auto-create tables
models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(title="GigGuard API v2", description="Parametric Insurance for Gig Workers")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

# ─────────────────────────────────────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────────────────────────────────────

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(database.get_db)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    user = db.query(models.User).filter(models.User.email == email).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user

def require_admin(user: models.User = Depends(get_current_user)):
    if user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return user

def gen_reference():
    return "GGP-" + "".join(random.choices(string.ascii_uppercase + string.digits, k=8))

def _create_notification(db: Session, user_id: int, title: str, message: str, ntype: str = "info"):
    notif = models.Notification(user_id=user_id, title=title, message=message, type=ntype)
    db.add(notif)

# ─────────────────────────────────────────────────────────────────────────────
# Root
# ─────────────────────────────────────────────────────────────────────────────

@app.get("/")
def root():
    return {"message": "GigGuard API v2 - Fully Operational", "status": "ok"}

# ─────────────────────────────────────────────────────────────────────────────
# Auth
# ─────────────────────────────────────────────────────────────────────────────

@app.post("/auth/register", response_model=schemas.UserResponse)
def register(user_in: schemas.UserCreate, db: Session = Depends(database.get_db)):
    existing = db.query(models.User).filter(models.User.email == user_in.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_pw = auth.get_password_hash(user_in.password)
    new_user = models.User(email=user_in.email, hashed_password=hashed_pw, role=user_in.role)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    if user_in.role == "worker" and user_in.name:
        income = 5000.0
        tier = 40 if income <= 5000 else (70 if income <= 8000 else 100)
        new_worker = models.Worker(
            user_id=new_user.id,
            name=user_in.name,
            location=user_in.city or "Bangalore",
            city=user_in.city or "Bangalore",
            work_type=user_in.work_type or "Delivery",
            weekly_income=income,
            premium_tier=tier
        )
        db.add(new_worker)
        db.commit()

    return new_user

@app.post("/auth/login", response_model=schemas.Token)
def login(form_in: schemas.UserLogin, db: Session = Depends(database.get_db)):
    user = db.query(models.User).filter(models.User.email == form_in.email).first()
    if not user or not auth.verify_password(form_in.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = auth.create_access_token(data={"sub": user.email})
    return {"access_token": token, "token_type": "bearer", "role": user.role}

# ─────────────────────────────────────────────────────────────────────────────
# Worker - Dashboard
# ─────────────────────────────────────────────────────────────────────────────

@app.get("/me/dashboard")
def my_dashboard(db: Session = Depends(database.get_db), user: models.User = Depends(get_current_user)):
    db.refresh(user)
    worker = db.query(models.Worker).filter(models.Worker.user_id == user.id).first()

    if not worker:
        return {
            "userName": None, "policyActive": False, "premiumTier": 0,
            "recentClaims": [], "location": None, "weeklyIncome": 0,
            "workType": None, "totalPremiumPaid": 0, "fraudScore": 0.0
        }

    policy = db.query(models.Policy).filter(
        models.Policy.worker_id == worker.id, models.Policy.is_active == True
    ).first()

    claims = []
    if policy:
        db_claims = db.query(models.Claim).filter(
            models.Claim.policy_id == policy.id
        ).order_by(models.Claim.id.desc()).limit(10).all()

        for c in db_claims:
            claims.append({
                "id": c.id,
                "display_id": f"CLM-{c.id:04d}",
                "type": c.trigger_type.replace("_", " ").title(),
                "amount": f"₹ {int(c.amount):,}",
                "status": c.status,
                "fraud_score": c.fraud_score,
                "time": c.created_at.strftime("%d %b %H:%M") if c.created_at else "Recent"
            })

    return {
        "userName": worker.name,
        "policyActive": policy is not None,
        "premiumTier": worker.premium_tier,
        "recentClaims": claims,
        "location": worker.location,
        "weeklyIncome": worker.weekly_income,
        "workType": worker.work_type,
        "totalPremiumPaid": policy.total_premium_paid if policy else 0,
        "fraudScore": worker.fraud_score,
        "policyId": policy.id if policy else None,
        "policyStartDate": policy.created_at.strftime("%d %b %Y") if policy else None,
    }

@app.post("/me/enroll")
def my_enroll(worker_data: schemas.WorkerCreate, db: Session = Depends(database.get_db), user: models.User = Depends(get_current_user)):
    tier = 40 if worker_data.weekly_income <= 5000 else (70 if worker_data.weekly_income <= 8000 else 100)

    worker = db.query(models.Worker).filter(models.Worker.user_id == user.id).first()
    if not worker:
        worker = models.Worker(
            user_id=user.id, name=worker_data.name,
            location=worker_data.location, city=worker_data.location,
            work_type=worker_data.work_type or "Delivery",
            weekly_income=worker_data.weekly_income, premium_tier=tier
        )
        db.add(worker)
        db.commit()
        db.refresh(worker)
    else:
        worker.name = worker_data.name
        worker.location = worker_data.location
        worker.city = worker_data.location
        worker.work_type = worker_data.work_type or worker.work_type
        worker.weekly_income = worker_data.weekly_income
        worker.premium_tier = tier
        db.commit()

    existing_policy = db.query(models.Policy).filter(
        models.Policy.worker_id == worker.id, models.Policy.is_active == True
    ).first()
    if not existing_policy:
        new_policy = models.Policy(worker_id=worker.id, plan_type="weekly")
        db.add(new_policy)
        db.commit()
        _create_notification(db, user.id, "Policy Activated! 🎉",
                             f"Your weekly coverage of ₹{tier}/week is now active.", "success")
        db.commit()

    return {"message": "Policy enrolled successfully", "premium_tier": tier}

@app.post("/me/unsubscribe")
def unsubscribe(db: Session = Depends(database.get_db), user: models.User = Depends(get_current_user)):
    worker = db.query(models.Worker).filter(models.Worker.user_id == user.id).first()
    if not worker:
        raise HTTPException(status_code=404, detail="Worker not found")
    policy = db.query(models.Policy).filter(
        models.Policy.worker_id == worker.id, models.Policy.is_active == True
    ).first()
    if not policy:
        raise HTTPException(status_code=404, detail="No active policy")
    policy.is_active = False
    db.commit()
    _create_notification(db, user.id, "Policy Cancelled", "Your coverage has been deactivated.", "info")
    db.commit()
    return {"message": "Unsubscribed successfully"}

# ─────────────────────────────────────────────────────────────────────────────
# Worker - Payments
# ─────────────────────────────────────────────────────────────────────────────

@app.post("/me/pay-premium")
def pay_premium(db: Session = Depends(database.get_db), user: models.User = Depends(get_current_user)):
    worker = db.query(models.Worker).filter(models.Worker.user_id == user.id).first()
    if not worker:
        raise HTTPException(status_code=404, detail="Worker not found")
    policy = db.query(models.Policy).filter(
        models.Policy.worker_id == worker.id, models.Policy.is_active == True
    ).first()
    if not policy:
        raise HTTPException(status_code=400, detail="No active policy to pay for")

    amount = float(worker.premium_tier)
    ref = gen_reference()
    txn = models.Transaction(
        worker_id=worker.id, policy_id=policy.id,
        amount=amount, type="premium", status="Success", reference=ref
    )
    db.add(txn)
    policy.total_premium_paid += amount
    db.commit()

    _create_notification(db, user.id, "Premium Paid ✓",
                         f"₹{int(amount)} premium payment successful. Ref: {ref}", "success")
    db.commit()
    return {"message": "Payment successful", "amount": amount, "reference": ref}

@app.get("/me/transactions")
def my_transactions(db: Session = Depends(database.get_db), user: models.User = Depends(get_current_user)):
    worker = db.query(models.Worker).filter(models.Worker.user_id == user.id).first()
    if not worker:
        return []
    txns = db.query(models.Transaction).filter(
        models.Transaction.worker_id == worker.id
    ).order_by(models.Transaction.id.desc()).limit(20).all()
    return [
        {
            "id": t.id,
            "amount": t.amount,
            "type": t.type,
            "status": t.status,
            "reference": t.reference,
            "created_at": t.created_at.strftime("%d %b %Y %H:%M") if t.created_at else "—"
        }
        for t in txns
    ]

# ─────────────────────────────────────────────────────────────────────────────
# Worker - Notifications
# ─────────────────────────────────────────────────────────────────────────────

@app.get("/me/notifications")
def my_notifications(db: Session = Depends(database.get_db), user: models.User = Depends(get_current_user)):
    notifs = db.query(models.Notification).filter(
        models.Notification.user_id == user.id
    ).order_by(models.Notification.id.desc()).limit(20).all()
    return [
        {
            "id": n.id, "title": n.title, "message": n.message,
            "type": n.type, "is_read": n.is_read,
            "created_at": n.created_at.strftime("%d %b %H:%M") if n.created_at else "—"
        }
        for n in notifs
    ]

@app.post("/me/notifications/{notif_id}/read")
def mark_read(notif_id: int, db: Session = Depends(database.get_db), user: models.User = Depends(get_current_user)):
    notif = db.query(models.Notification).filter(
        models.Notification.id == notif_id, models.Notification.user_id == user.id
    ).first()
    if notif:
        notif.is_read = True
        db.commit()
    return {"message": "Marked as read"}

@app.post("/me/notifications/read-all")
def mark_all_read(db: Session = Depends(database.get_db), user: models.User = Depends(get_current_user)):
    db.query(models.Notification).filter(
        models.Notification.user_id == user.id
    ).update({"is_read": True})
    db.commit()
    return {"message": "All marked as read"}

# ─────────────────────────────────────────────────────────────────────────────
# Worker - Risk Score
# ─────────────────────────────────────────────────────────────────────────────

@app.get("/worker/risk")
def get_risk(location: str = "Bangalore", income: float = 5000.0, _: models.User = Depends(get_current_user)):
    score = generate_risk_score(location, income)
    return {
        "risk_score": round(score, 2),
        "level": "High" if score > 0.4 else ("Medium" if score > 0.2 else "Low"),
        "recommendation": "Consider higher premium for better coverage" if score > 0.3 else "Standard coverage recommended"
    }

# ─────────────────────────────────────────────────────────────────────────────
# Mock Weather / AQI API
# ─────────────────────────────────────────────────────────────────────────────

@app.get("/weather/mock")
def mock_weather(city: str = "Bangalore", _: models.User = Depends(get_current_user)):
    city_data = {
        "Bangalore": {"rainfall_mm": round(random.uniform(10, 80), 1), "aqi": random.randint(80, 280), "temp_c": round(random.uniform(24, 38), 1)},
        "Mumbai": {"rainfall_mm": round(random.uniform(20, 120), 1), "aqi": random.randint(100, 350), "temp_c": round(random.uniform(26, 40), 1)},
        "Delhi": {"rainfall_mm": round(random.uniform(5, 40), 1), "aqi": random.randint(200, 480), "temp_c": round(random.uniform(28, 47), 1)},
    }
    data = city_data.get(city, city_data["Bangalore"])
    alerts = []
    if data["rainfall_mm"] > 50: alerts.append({"type": "rainfall", "message": f"Heavy rainfall: {data['rainfall_mm']}mm"})
    if data["aqi"] > 400: alerts.append({"type": "aqi", "message": f"Hazardous AQI: {data['aqi']}"})
    if data["temp_c"] > 45: alerts.append({"type": "heat", "message": f"Heat wave: {data['temp_c']}°C"})
    return {**data, "city": city, "alerts": alerts, "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M")}

# ─────────────────────────────────────────────────────────────────────────────
# Trigger Engine
# ─────────────────────────────────────────────────────────────────────────────

def _fire_trigger(trigger_type: str, location: str, severity: float, description: str,
                  triggered_by: str, db: Session) -> dict:
    """Core trigger logic used by all trigger endpoints"""
    policies = db.query(models.Policy).filter(models.Policy.is_active == True).all()

    # Determine payout status and amount
    if severity >= 70:
        payout_status = "Approved"
    elif severity >= 50:
        payout_status = "Manual Review"
    else:
        payout_status = "Pending"

    payout_amount = round(min(1200.0, severity * 12), 2)

    # Log the trigger event
    tlog = models.TriggerLog(
        trigger_type=trigger_type, location=location, severity=severity,
        description=description, triggered_by=triggered_by,
        claims_created=len(policies)
    )
    db.add(tlog)
    db.commit()

    created = 0
    for policy in policies:
        worker = db.query(models.Worker).filter(models.Worker.id == policy.worker_id).first()
        if not worker:
            continue

        # Get worker's claim history for fraud check
        claim_count = db.query(models.Claim).filter(
            models.Claim.policy_id == policy.id
        ).count()

        import datetime as dt
        days_old = (datetime.now() - policy.created_at.replace(tzinfo=None)).days if policy.created_at else 30

        fraud_data = {
            "trigger_type": trigger_type,
            "amount": payout_amount,
            "worker_claim_count": claim_count,
            "trigger_value": severity,
            "days_since_policy_start": days_old
        }
        fscore = compute_fraud_score(fraud_data)
        flagged = is_fraud_flagged(fscore)

        if flagged and payout_status == "Approved":
            payout_status = "Manual Review"

        claim = models.Claim(
            policy_id=policy.id,
            trigger_type=trigger_type,
            trigger_value=severity,
            amount=payout_amount,
            status=payout_status,
            worker_name=worker.name if worker else "Unknown",
            fraud_score=fscore,
            is_fraud_flagged=flagged
        )
        db.add(claim)

        # Notify worker
        if worker.user_id:
            _create_notification(db, worker.user_id,
                                 f"Trigger Alert: {trigger_type.replace('_', ' ').title()}",
                                 f"{description}. A claim of ₹{int(payout_amount)} has been initiated. Status: {payout_status}",
                                 "alert" if flagged else "info")

        # Record payout transaction if approved
        if payout_status == "Approved":
            txn = models.Transaction(
                worker_id=worker.id, policy_id=policy.id,
                amount=payout_amount, type="payout", status="Processed",
                reference=gen_reference()
            )
            db.add(txn)
            if worker.user_id:
                _create_notification(db, worker.user_id, "Payout Processed 💰",
                                     f"₹{int(payout_amount)} has been credited to your account.", "success")

        # Update fraud score on worker
        worker.fraud_score = round((worker.fraud_score + fscore) / 2, 2)
        if claim_count > 5:
            worker.is_flagged = True

        created += 1

    db.commit()
    return {"message": f"Triggered {created} claim(s) | Status: {payout_status}", "count": created, "payout_per_claim": payout_amount}

@app.post("/admin/simulate-trigger")
def admin_simulate(event: schemas.TriggerEvent, db: Session = Depends(database.get_db), admin: models.User = Depends(require_admin)):
    return _fire_trigger(event.trigger_type, event.location, event.severity, event.description or "", admin.email, db)

@app.post("/triggers/rain")
def trigger_rain(db: Session = Depends(database.get_db), admin: models.User = Depends(require_admin)):
    severity = round(random.uniform(55, 120), 1)
    return _fire_trigger("heavy_rainfall", "Bangalore", severity,
                         f"Heavy rainfall of {severity}mm detected — exceeds 50mm threshold", admin.email, db)

@app.post("/triggers/aqi")
def trigger_aqi(db: Session = Depends(database.get_db), admin: models.User = Depends(require_admin)):
    severity = round(random.uniform(410, 500), 1)
    return _fire_trigger("aqi_hazard", "Delhi", severity,
                         f"Hazardous AQI of {severity} detected — exceeds 400 threshold", admin.email, db)

@app.post("/triggers/heat")
def trigger_heat(db: Session = Depends(database.get_db), admin: models.User = Depends(require_admin)):
    severity = round(random.uniform(46, 52), 1)
    return _fire_trigger("heat_wave", "Mumbai", severity,
                         f"Heat wave: {severity}°C recorded — exceeds 45°C threshold", admin.email, db)

@app.post("/triggers/restriction")
def trigger_restriction(db: Session = Depends(database.get_db), admin: models.User = Depends(require_admin)):
    return _fire_trigger("govt_restriction", "All Cities", 100.0,
                         "Government restriction: mandatory work stoppage order issued", admin.email, db)

# ─────────────────────────────────────────────────────────────────────────────
# Admin - Stats
# ─────────────────────────────────────────────────────────────────────────────

@app.get("/admin/stats")
def admin_stats(db: Session = Depends(database.get_db), _: models.User = Depends(require_admin)):
    active_policies = db.query(models.Policy).filter(models.Policy.is_active == True).count()
    total_premiums = db.query(func.sum(models.Transaction.amount)).filter(models.Transaction.type == "premium").scalar() or 0
    claim_count = db.query(models.Claim).count()
    worker_count = db.query(models.Worker).count()
    fraud_flags = db.query(models.Claim).filter(models.Claim.is_fraud_flagged == True).count()
    pending_claims = db.query(models.Claim).filter(models.Claim.status.in_(["Pending", "Manual Review"])).count()
    return {
        "activePolicies": active_policies,
        "weeklyPremiums": f"₹ {int(total_premiums):,}",
        "disruptions": db.query(models.TriggerLog).count(),
        "claimsProcessing": pending_claims,
        "totalWorkers": worker_count,
        "fraudFlags": fraud_flags,
        "totalClaims": claim_count,
        "totalPayouts": f"₹ {int(db.query(func.sum(models.Transaction.amount)).filter(models.Transaction.type == 'payout').scalar() or 0):,}",
    }

# ─────────────────────────────────────────────────────────────────────────────
# Admin - Claims
# ─────────────────────────────────────────────────────────────────────────────

@app.get("/admin/claims")
def admin_claims(db: Session = Depends(database.get_db), _: models.User = Depends(require_admin)):
    claims = db.query(models.Claim).order_by(models.Claim.id.desc()).limit(50).all()
    return [
        {
            "id": c.id,
            "display_id": f"CLM-{c.id:04d}",
            "worker": c.worker_name,
            "type": c.trigger_type.replace("_", " ").title(),
            "amount": f"₹ {int(c.amount):,}",
            "status": c.status,
            "fraud_score": c.fraud_score,
            "is_fraud_flagged": c.is_fraud_flagged,
            "admin_note": c.admin_note,
            "time": c.created_at.strftime("%d %b %H:%M") if c.created_at else "—"
        }
        for c in claims
    ]

@app.post("/admin/claims/{claim_id}/action")
def claim_action(claim_id: int, action_in: schemas.ClaimAction, db: Session = Depends(database.get_db), admin: models.User = Depends(require_admin)):
    claim = db.query(models.Claim).filter(models.Claim.id == claim_id).first()
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")

    claim.status = "Approved" if action_in.action == "approve" else "Rejected"
    claim.admin_note = action_in.note or ""
    db.commit()

    # Notify worker
    policy = db.query(models.Policy).filter(models.Policy.id == claim.policy_id).first()
    if policy:
        worker = db.query(models.Worker).filter(models.Worker.id == policy.worker_id).first()
        if worker and worker.user_id:
            if claim.status == "Approved":
                _create_notification(db, worker.user_id,
                                     "Claim Approved! 💰",
                                     f"Your claim CLM-{claim_id:04d} of {int(claim.amount):,} has been approved.", "success")
                txn = models.Transaction(worker_id=worker.id, policy_id=policy.id,
                                         amount=claim.amount, type="payout", status="Processed",
                                         reference=gen_reference())
                db.add(txn)
            else:
                _create_notification(db, worker.user_id,
                                     "Claim Rejected",
                                     f"Your claim CLM-{claim_id:04d} has been rejected. Reason: {action_in.note or 'Policy review'}.", "danger")
            db.commit()

    return {"message": f"Claim {action_in.action}d successfully"}

# ─────────────────────────────────────────────────────────────────────────────
# Admin - Workers
# ─────────────────────────────────────────────────────────────────────────────

@app.get("/admin/workers")
def admin_workers(db: Session = Depends(database.get_db), _: models.User = Depends(require_admin)):
    workers = db.query(models.Worker).all()
    result = []
    for w in workers:
        policy = db.query(models.Policy).filter(models.Policy.worker_id == w.id, models.Policy.is_active == True).first()
        claim_count = db.query(models.Claim).join(models.Policy).filter(models.Policy.worker_id == w.id).count()
        result.append({
            "id": w.id,
            "name": w.name,
            "location": w.location,
            "work_type": w.work_type,
            "weekly_income": w.weekly_income,
            "premium_tier": w.premium_tier,
            "policy_active": policy is not None,
            "claim_count": claim_count,
            "fraud_score": w.fraud_score,
            "is_flagged": w.is_flagged,
        })
    return result

# ─────────────────────────────────────────────────────────────────────────────
# Admin - Fraud
# ─────────────────────────────────────────────────────────────────────────────

@app.get("/admin/fraud-flags")
def fraud_flags(db: Session = Depends(database.get_db), _: models.User = Depends(require_admin)):
    flagged = db.query(models.Claim).filter(models.Claim.is_fraud_flagged == True).order_by(models.Claim.id.desc()).limit(30).all()
    return [
        {
            "claim_id": c.id,
            "display_id": f"CLM-{c.id:04d}",
            "worker": c.worker_name,
            "fraud_score": c.fraud_score,
            "trigger_type": c.trigger_type.replace("_", " ").title(),
            "amount": f"₹ {int(c.amount):,}",
            "status": c.status,
            "reason": get_fraud_reason(c.fraud_score, {"amount": c.amount, "trigger_type": c.trigger_type}),
            "time": c.created_at.strftime("%d %b %H:%M") if c.created_at else "—"
        }
        for c in flagged
    ]

@app.post("/admin/fraud-scan")
def fraud_scan(db: Session = Depends(database.get_db), _: models.User = Depends(require_admin)):
    """Re-run fraud detection on all pending claims"""
    pending = db.query(models.Claim).filter(models.Claim.status.in_(["Pending", "Manual Review"])).all()
    updated = 0
    for claim in pending:
        policy = db.query(models.Policy).filter(models.Policy.id == claim.policy_id).first()
        claim_count = db.query(models.Claim).filter(models.Claim.policy_id == claim.policy_id).count()
        days_old = 30
        if policy and policy.created_at:
            days_old = (datetime.now() - policy.created_at.replace(tzinfo=None)).days

        fscore = compute_fraud_score({
            "trigger_type": claim.trigger_type,
            "amount": claim.amount,
            "worker_claim_count": claim_count,
            "trigger_value": claim.trigger_value or 50,
            "days_since_policy_start": days_old
        })
        claim.fraud_score = fscore
        claim.is_fraud_flagged = is_fraud_flagged(fscore)
        updated += 1
    db.commit()
    return {"message": f"Fraud scan complete. {updated} claims re-evaluated."}

# ─────────────────────────────────────────────────────────────────────────────
# Admin - Transactions
# ─────────────────────────────────────────────────────────────────────────────

@app.get("/admin/transactions")
def admin_transactions(db: Session = Depends(database.get_db), _: models.User = Depends(require_admin)):
    txns = db.query(models.Transaction).order_by(models.Transaction.id.desc()).limit(50).all()
    return [
        {
            "id": t.id,
            "worker_id": t.worker_id,
            "amount": t.amount,
            "type": t.type,
            "status": t.status,
            "reference": t.reference,
            "created_at": t.created_at.strftime("%d %b %Y %H:%M") if t.created_at else "—"
        }
        for t in txns
    ]

# ─────────────────────────────────────────────────────────────────────────────
# Admin - Trigger Logs
# ─────────────────────────────────────────────────────────────────────────────

@app.get("/admin/trigger-logs")
def trigger_logs(db: Session = Depends(database.get_db), _: models.User = Depends(require_admin)):
    logs = db.query(models.TriggerLog).order_by(models.TriggerLog.id.desc()).limit(20).all()
    return [
        {
            "id": l.id,
            "trigger_type": l.trigger_type.replace("_", " ").title(),
            "location": l.location,
            "severity": l.severity,
            "description": l.description,
            "claims_created": l.claims_created,
            "triggered_by": l.triggered_by,
            "time": l.created_at.strftime("%d %b %H:%M") if l.created_at else "—"
        }
        for l in logs
    ]

# ─────────────────────────────────────────────────────────────────────────────
# Admin - Analytics
# ─────────────────────────────────────────────────────────────────────────────

@app.get("/admin/analytics")
def admin_analytics(db: Session = Depends(database.get_db), _: models.User = Depends(require_admin)):
    # Claims by trigger type
    from sqlalchemy import case
    trigger_counts = db.query(
        models.Claim.trigger_type, func.count(models.Claim.id)
    ).group_by(models.Claim.trigger_type).all()

    # Total payouts vs premiums
    total_premiums = db.query(func.sum(models.Transaction.amount)).filter(models.Transaction.type == "premium").scalar() or 0
    total_payouts = db.query(func.sum(models.Transaction.amount)).filter(models.Transaction.type == "payout").scalar() or 0

    # City distribution
    city_dist = db.query(models.Worker.location, func.count(models.Worker.id)).group_by(models.Worker.location).all()

    return {
        "trigger_breakdown": [{"type": t.replace("_", " ").title(), "count": c} for t, c in trigger_counts],
        "financial": {
            "total_premiums": round(total_premiums, 2),
            "total_payouts": round(total_payouts, 2),
            "net": round(total_premiums - total_payouts, 2),
        },
        "city_distribution": [{"city": city, "count": count} for city, count in city_dist],
    }
