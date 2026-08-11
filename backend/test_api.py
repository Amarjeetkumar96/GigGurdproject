import os
from dotenv import load_dotenv
import requests

basedir = os.path.abspath(os.path.dirname(__file__))
dotenv_path = os.path.join(basedir, '.env')
load_dotenv(dotenv_path)

# 1. Login to get token
login_data = {
    "email": "admin@gigguard.com",
    "password": "admin123"
}
res = requests.post("http://127.0.0.1:8000/auth/login", json=login_data)
if not res.ok:
    print(f"Login failed: {res.status_code} {res.text}")
    exit(1)

token = res.json()["access_token"]
print("Logged in successfully.")

headers = {
    "Authorization": f"Bearer {token}"
}

# 2. Fetch workers
res = requests.get("http://127.0.0.1:8000/admin/workers", headers=headers)
print(f"Status Code: {res.status_code}")
print(f"Response: {res.text}")
