from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

# ── Auth ─────────────────────────────────────────────────────────────────────

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    role: str = "worker"
    name: Optional[str] = None
    city: Optional[str] = "Bangalore"
    work_type: Optional[str] = "Delivery"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    email: str
    role: str
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    role: str

# ── Worker ───────────────────────────────────────────────────────────────────

class WorkerCreate(BaseModel):
    name: str
    location: str
    weekly_income: float
    work_type: Optional[str] = "Delivery"

class WorkerResponse(BaseModel):
    id: int
    name: str
    location: str
    weekly_income: float
    premium_tier: int
    work_type: Optional[str]
    fraud_score: Optional[float]
    is_flagged: Optional[bool]
    class Config:
        from_attributes = True

# ── Policy ───────────────────────────────────────────────────────────────────

class PolicyResponse(BaseModel):
    id: int
    plan_type: str
    is_active: bool
    total_premium_paid: float
    created_at: Optional[datetime]
    class Config:
        from_attributes = True

# ── Trigger ──────────────────────────────────────────────────────────────────

class TriggerEvent(BaseModel):
    trigger_type: str
    location: str
    severity: float
    description: Optional[str] = ""

class TriggerResponse(BaseModel):
    message: str
    count: int
    payout_per_claim: float

# ── Claims ───────────────────────────────────────────────────────────────────

class ClaimResponse(BaseModel):
    id: int
    display_id: str
    worker: str
    type: str
    amount: str
    status: str
    fraud_score: Optional[float]
    is_fraud_flagged: Optional[bool]
    time: str
    class Config:
        from_attributes = True

class ClaimAction(BaseModel):
    action: str  # 'approve' or 'reject'
    note: Optional[str] = ""

# ── Stats ─────────────────────────────────────────────────────────────────────

class Stats(BaseModel):
    activePolicies: int
    weeklyPremiums: str
    disruptions: int
    claimsProcessing: int
    totalWorkers: int
    fraudFlags: int

# ── Transaction ───────────────────────────────────────────────────────────────

class TransactionResponse(BaseModel):
    id: int
    amount: float
    type: str
    status: str
    reference: Optional[str]
    created_at: Optional[datetime]
    class Config:
        from_attributes = True

class PaymentRequest(BaseModel):
    amount: float

# ── Notification ──────────────────────────────────────────────────────────────

class NotificationResponse(BaseModel):
    id: int
    title: str
    message: str
    type: str
    is_read: bool
    created_at: Optional[datetime]
    class Config:
        from_attributes = True

# ── Fraud ─────────────────────────────────────────────────────────────────────

class FraudFlagResponse(BaseModel):
    claim_id: int
    worker: str
    fraud_score: float
    trigger_type: str
    amount: str
    reason: str

class ClaimActionIn(BaseModel):
    action: str
    note: Optional[str] = ""
