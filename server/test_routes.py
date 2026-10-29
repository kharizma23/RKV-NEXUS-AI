import asyncio
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_login(email, password):
    resp = client.post("/api/v1/auth/login", json={"email": email, "password": password})
    print(f"Login {email}: status={resp.status_code}")
    if resp.status_code == 200:
        data = resp.json()
        token = data.get("access_token")
        role = data.get("role")
        print(f"  Role: {role}, token exists: {bool(token)}")
        return token
    else:
        print(f"  Error: {resp.text}")
        return None

print("--- Testing Logins ---")
admin_token = test_login("admin23@gmail.com", "ADMIN123")
faculty_token = test_login("faculty@platform.edu", "Faculty123")
student_token = test_login("student@platform.edu", "Student123")
