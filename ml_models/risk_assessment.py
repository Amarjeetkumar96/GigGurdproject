"""
Mock Random Forest implementation for Risk Assessment.
Estimates disruption probability.
"""

def generate_risk_score(location: str, weekly_income: float) -> float:
    # Placeholder logic
    base_risk = 0.05
    if location.lower() == "bangalore":
        base_risk += 0.15
        
    # Simulate slightly higher risk of missing hours if income dependency is high
    risk_score = base_risk + (weekly_income / 100000)
    
    return min(risk_score, 1.0)
