import pymysql
import os
from dotenv import load_dotenv
from app import auth, models, database

basedir = os.path.abspath(os.path.dirname(__file__))
dotenv_path = os.path.join(basedir, '.env')
load_dotenv(dotenv_path)

USER = os.getenv("DB_USER", "root")
PASSWORD = os.getenv("DB_PASSWORD", "")
HOST = os.getenv("DB_HOST", "localhost")
PORT = os.getenv("DB_PORT", "3306")
NAME = os.getenv("DB_NAME", "gigguard")

def init_system():
    try:
        # 1. Ensure Database exists
        # Connect to MySQL server without specifying a database
        connection = pymysql.connect(
            host=HOST,
            user=USER,
            password=PASSWORD,
            port=int(PORT)
        )
        with connection.cursor() as cursor:
            cursor.execute(f"CREATE DATABASE IF NOT EXISTS {NAME}")
            print(f"Database '{NAME}' ensured.")
        connection.close()

        # 2. Create tables using SQLAlchemy
        # This will use the URL containing DB_NAME now that it exists
        models.Base.metadata.create_all(bind=database.engine)
        print("Tables created successfully.")

        # 3. Seed Admin
        db = next(database.get_db())
        admin_email = "admin@gigguard.com"
        existing_admin = db.query(models.User).filter(models.User.email == admin_email).first()
        
        if not existing_admin:
            hashed_pw = auth.get_password_hash("admin123")
            admin_user = models.User(email=admin_email, hashed_password=hashed_pw, role="admin")
            db.add(admin_user)
            db.commit()
            print(f"Admin user created: {admin_email} / admin123")
        else:
            print("Admin user already exists.")
            
    except Exception as e:
        print(f"Initialization Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    init_system()
