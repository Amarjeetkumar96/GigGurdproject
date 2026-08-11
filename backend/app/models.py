from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(50), default="worker")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    worker_profile = relationship("Worker", back_populates="user", uselist=False)
    notifications = relationship("Notification", back_populates="user")

class Worker(Base):
    __tablename__ = "workers"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    name = Column(String(255), index=True)
    city = Column(String(255))
    location = Column(String(255))  # Keep for backward compat
    work_type = Column(String(100), default="Delivery")  # Swiggy/Zomato/Uber/etc
    weekly_income = Column(Float)
    premium_tier = Column(Integer)
    fraud_score = Column(Float, default=0.0)
    is_flagged = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="worker_profile")
    policies = relationship("Policy", back_populates="worker")
    transactions = relationship("Transaction", back_populates="worker")

class Policy(Base):
    __tablename__ = "policies"
    id = Column(Integer, primary_key=True, index=True)
    worker_id = Column(Integer, ForeignKey("workers.id"))
    plan_type = Column(String(50), default="weekly")  # weekly/monthly
    is_active = Column(Boolean, default=True)
    total_premium_paid = Column(Float, default=0.0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    worker = relationship("Worker", back_populates="policies")
    claims = relationship("Claim", back_populates="policy")

class Claim(Base):
    __tablename__ = "claims"
    id = Column(Integer, primary_key=True, index=True)
    policy_id = Column(Integer, ForeignKey("policies.id"))
    trigger_type = Column(String(255))
    trigger_value = Column(Float, default=0.0)  # actual reading (mm rainfall, AQI, etc)
    amount = Column(Float)
    status = Column(String(255), default="Pending")
    worker_name = Column(String(255))
    fraud_score = Column(Float, default=0.0)
    is_fraud_flagged = Column(Boolean, default=False)
    admin_note = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    policy = relationship("Policy", back_populates="claims")

class Transaction(Base):
    __tablename__ = "transactions"
    id = Column(Integer, primary_key=True, index=True)
    worker_id = Column(Integer, ForeignKey("workers.id"))
    policy_id = Column(Integer, ForeignKey("policies.id"), nullable=True)
    amount = Column(Float)
    type = Column(String(50))  # "premium" or "payout"
    status = Column(String(50), default="Success")
    reference = Column(String(100), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    worker = relationship("Worker", back_populates="transactions")

class TriggerLog(Base):
    __tablename__ = "trigger_logs"
    id = Column(Integer, primary_key=True, index=True)
    trigger_type = Column(String(100))
    location = Column(String(100))
    severity = Column(Float)
    description = Column(String(500))
    claims_created = Column(Integer, default=0)
    triggered_by = Column(String(100), default="system")  # "admin" or "scheduler"
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Notification(Base):
    __tablename__ = "notifications"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    title = Column(String(255))
    message = Column(Text)
    type = Column(String(50), default="info")  # info/alert/success/danger
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="notifications")
