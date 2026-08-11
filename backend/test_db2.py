import sys
from sqlalchemy import text
from app.database import engine

def test_db():
    try:
        with engine.connect() as conn:
            print("Successfully connected to DB!")
            res = conn.execute(text("SELECT 1"))
            print("Query returned:", res.scalar())
    except Exception as e:
        print("Error connecting to DB:", e)
        sys.exit(1)

if __name__ == "__main__":
    test_db()
