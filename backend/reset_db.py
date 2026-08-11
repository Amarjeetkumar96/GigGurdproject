import os
import sys
from sqlalchemy.orm import Session
from app import models, database, auth

def reset_db():
    print("=== GigGuard DB Reset (SQLite Mode) ===")
    
    # Simple check: delete old sqlite file if it exists
    if os.path.exists("./gigguard.db"):
        os.remove("./gigguard.db")
        print("Existing SQLite DB file removed.")

    # 1. Create tables
    models.Base.metadata.create_all(bind=database.engine)
    print("Tables created fresh.")

    # 2. Seed Admin
    db = next(database.get_db())
    admin_email = "admin@gigguard.com"
    hashed_pw = auth.get_password_hash("admin123")
    
    admin_user = models.User(
        email=admin_email, 
        hashed_password=hashed_pw, 
        role="admin"
    )
    db.add(admin_user)
    db.commit()
    print(f"Admin user created: {admin_email} / admin123")
    db.close()
    
    print("=== Reset Complete! ===")

if __name__ == "__main__":
    reset_db()
