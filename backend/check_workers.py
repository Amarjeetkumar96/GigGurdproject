import os
import urllib.parse
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app import models

DB_USER = "root"
DB_PASSWORD = "Bholu@9608"
DB_HOST = "127.0.0.1"
DB_PORT = "3306"
DB_NAME = "gigguard"

SQLALCHEMY_DATABASE_URL = f"mysql+pymysql://{DB_USER}:{urllib.parse.quote_plus(DB_PASSWORD)}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

db = SessionLocal()
users = db.query(models.User).count()
workers = db.query(models.Worker).count()
print(f"Users: {users}")
print(f"Workers: {workers}")

for w in db.query(models.Worker).all():
    print(f"Worker: {w.name} in {w.city}")
