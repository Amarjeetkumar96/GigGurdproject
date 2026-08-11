"""
Fraud Detection Module for GigGuard
Uses Isolation Forest algorithm for anomaly detection in claims
"""
import random
import math
from typing import Dict, Any

# Simple rule-based + statistical fraud detection
# In production, this would use a trained scikit-learn IsolationForest model

def compute_fraud_score(claim_data: Dict[str, Any]) -> float:
    """
    Compute a fraud score between 0.0 (clean) and 1.0 (highly suspicious)
    Based on multiple heuristic rules
    """
    score = 0.0
    
    trigger_type = claim_data.get("trigger_type", "")
    amount = claim_data.get("amount", 0)
    worker_claim_count = claim_data.get("worker_claim_count", 0)
    trigger_value = claim_data.get("trigger_value", 50)
    days_since_policy_start = claim_data.get("days_since_policy_start", 30)
    
    # Rule 1: Filing immediately after policy starts (within 3 days)
    if days_since_policy_start < 3:
        score += 0.3
    
    # Rule 2: Abnormally high claim amount
    if amount > 800:
        score += 0.25
    elif amount > 600:
        score += 0.10
    
    # Rule 3: Multiple claims in short time (> 3 claims is suspicious)
    if worker_claim_count > 5:
        score += 0.30
    elif worker_claim_count > 3:
        score += 0.15
    
    # Rule 4: Trigger value right at the threshold (suspicious edge case)
    thresholds = {
        "heavy_rainfall": 50,
        "aqi_hazard": 400,
        "heat_wave": 45,
        "govt_restriction": 1,
    }
    threshold = thresholds.get(trigger_type, 50)
    if trigger_value and abs(trigger_value - threshold) < 5:
        score += 0.15
    
    # Add small random noise to simulate ML model uncertainty
    score += random.uniform(0, 0.05)
    
    return min(round(score, 2), 1.0)

def is_fraud_flagged(score: float) -> bool:
    return score > 0.45

def get_fraud_reason(score: float, claim_data: Dict[str, Any]) -> str:
    if score < 0.2:
        return "No anomalies detected"
    
    reasons = []
    days = claim_data.get("days_since_policy_start", 30)
    count = claim_data.get("worker_claim_count", 0)
    amount = claim_data.get("amount", 0)
    
    if days < 3:
        reasons.append("Claim filed immediately after enrollment")
    if count > 3:
        reasons.append(f"Unusually high claim frequency ({count} claims)")
    if amount > 600:
        reasons.append("Payout amount above normal range")
    
    if not reasons:
        reasons.append("Mild statistical anomaly detected")
    
    return "; ".join(reasons)
