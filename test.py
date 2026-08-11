import os
import urllib.parse
from sqlalchemy import create_engine

DB_USER = "root"
DB_PASSWORD = "Bholu@9608"
DB_HOST = "127.0.0.1"
DB_PORT = "3306"
DB_NAME = "gigguard"

SQLALCHEMY_DATABASE_URL = f"mysql+pymysql://{DB_USER}:{urllib.parse.quote_plus(DB_PASSWORD)}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
engine = create_engine(SQLALCHEMY_DATABASE_URL)
try:
    with engine.connect() as conn:
        print("Success")
except Exception as e:
    print(e)
