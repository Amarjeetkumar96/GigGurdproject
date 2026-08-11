import os
import pymysql
from dotenv import load_dotenv

basedir = os.path.abspath(os.path.dirname(__file__))
dotenv_path = os.path.join(basedir, '.env')
load_dotenv(dotenv_path)

connection = pymysql.connect(
    host=os.getenv("DB_HOST", "127.0.0.1"),
    user=os.getenv("DB_USER", "root"),
    password=os.getenv("DB_PASSWORD", ""),
    database=os.getenv("DB_NAME", "gigguard"),
    port=int(os.getenv("DB_PORT", 3306))
)

queries = [
    "ALTER TABLE workers ADD COLUMN city VARCHAR(255)",
    "ALTER TABLE workers ADD COLUMN work_type VARCHAR(100) DEFAULT 'Delivery'",
    "ALTER TABLE workers ADD COLUMN weekly_income FLOAT",
    "ALTER TABLE workers ADD COLUMN premium_tier INT",
    "ALTER TABLE workers ADD COLUMN fraud_score FLOAT DEFAULT 0.0",
    "ALTER TABLE workers ADD COLUMN is_flagged BOOLEAN DEFAULT 0",
]

with connection.cursor() as c:
    for q in queries:
        try:
            c.execute(q)
            print(f"Executed: {q}")
        except Exception as e:
            print(f"Ignored: {e}")
connection.commit()
connection.close()
