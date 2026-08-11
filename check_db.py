import pymysql
import os
from dotenv import load_dotenv

load_dotenv('backend/.env')

user = os.getenv("DB_USER", "root")
password = os.getenv("DB_PASSWORD", "Bholu@9608")
host = os.getenv("DB_HOST", "localhost")
port = int(os.getenv("DB_PORT", "3306"))
db_name = os.getenv("DB_NAME", "gigguard")

print(f"Connecting to {user}@{host}:{port}...")

try:
    # Try connecting without DB first
    connection = pymysql.connect(
        host=host,
        user=user,
        password=password,
        port=port
    )
    print("Connection successful!")
    
    with connection.cursor() as cursor:
        cursor.execute(f"CREATE DATABASE IF NOT EXISTS {db_name}")
        print(f"Database '{db_name}' checked/created.")
    
    connection.close()
except Exception as e:
    print(f"Error: {e}")
