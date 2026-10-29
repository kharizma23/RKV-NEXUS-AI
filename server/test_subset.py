import asyncio
import httpx
from app.main import app

async def test_subset():
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test", timeout=5.0) as client:
        resp_admin = await client.post("/api/v1/auth/login", json={"email": "admin23@gmail.com", "password": "ADMIN123"})
        admin_token = resp_admin.json()["access_token"]
        resp_fac = await client.post("/api/v1/auth/login", json={"email": "faculty@platform.edu", "password": "Faculty123"})
        fac_token = resp_fac.json()["access_token"]
        resp_stu = await client.post("/api/v1/auth/login", json={"email": "student@platform.edu", "password": "Student123"})
        stu_token = resp_stu.json()["access_token"]

        tokens = {"Admin": admin_token, "Faculty": fac_token, "Student": stu_token}

        routes = sorted([r.path for r in app.routes if hasattr(r, 'methods') and 'GET' in r.methods and '{' not in r.path and not r.path.startswith(('/docs', '/openapi', '/health')) and r.path != '/'])

        for idx in range(138, min(170, len(routes))):
            r = routes[idx]
            chosen_role = "Student" if "/student" in r else ("Faculty" if "/faculty" in r else "Admin")
            print(f"Testing [{idx}] {r} ({chosen_role})...", flush=True)
            token = tokens[chosen_role]
            headers = {"Authorization": f"Bearer {token}"}
            try:
                res = await client.get(r, headers=headers)
                print(f"  Result: {res.status_code}", flush=True)
                if res.status_code >= 500:
                    print(f"  ERROR BODY: {res.text[:200]}", flush=True)
            except Exception as e:
                print(f"  EXCEPTION: {type(e).__name__} {e}", flush=True)

if __name__ == "__main__":
    asyncio.run(test_subset())
