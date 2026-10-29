import asyncio
import httpx
from app.database.session import AsyncSessionLocal
from sqlalchemy import text
from app.core.security import create_access_token

async def test_core_exam_endpoints():
    async with AsyncSessionLocal() as session:
        res = await session.execute(text("""
            SELECT u.id, u.email FROM users u 
            JOIN user_roles ur ON u.id = ur.user_id 
            JOIN roles r ON ur.role_id = r.id 
            WHERE r.name = 'FACULTY' LIMIT 1
        """))
        row = res.fetchone()
        faculty_id = str(row[0]) if row else "00000000-0000-0000-0000-000000000002"

    token = create_access_token(
        subject=faculty_id,
        roles=["FACULTY"],
        permissions=["ALL"]
    )
    headers = {"Authorization": f"Bearer {token}"}

    async with httpx.AsyncClient(base_url="http://127.0.0.1:8000", timeout=10.0) as client:
        # 1. Proctoring Active Sessions
        r1 = await client.get("/api/v1/proctoring/active-sessions", headers=headers)
        print("[TEST 1] /proctoring/active-sessions:", r1.status_code, f"{len(r1.json())} sessions returned")
        for s in r1.json()[:2]:
            print(f"   Candidate: {s['student_name']} ({s['student_reg']}) | Risk: {s['risk_score']} | Flag: {s['current_flag']}")

        # 2. Group Cohorts
        r2 = await client.get("/api/v1/groups", headers=headers)
        print("[TEST 2] GET /groups:", r2.status_code, f"{len(r2.json())} groups returned")
        for g in r2.json()[:2]:
            print(f"   Squad: {g['name']} | Attainment: {g['co_attainment']}% | Members: {g['members']}")

        r2_post = await client.post("/api/v1/groups", json={
            "name": "Squad Nexus (Full Stack)",
            "members": ["Dharshini R", "Vasudev K", "Kharizma R"],
            "department": "Computer Science & Engineering",
            "co_attainment": 92.5
        }, headers=headers)
        print("[TEST 2] POST /groups:", r2_post.status_code, r2_post.json().get("status"))

        # 3. Flexible Windows
        r3 = await client.get("/api/v1/exams/windows", headers=headers)
        print("[TEST 3] GET /exams/windows:", r3.status_code, f"{len(r3.json())} exam windows returned")
        for w in r3.json()[:3]:
            print(f"   Window: {w['title']} | Status: {w['status']} | Duration: {w['duration_minutes']}m")

        r3_post = await client.post("/api/v1/exams/windows", json={
            "title": "Cloud Computing & Kubernetes Adaptive Window",
            "duration_minutes": 90,
            "description": "Adaptive window on container orchestration and pods"
        }, headers=headers)
        print("[TEST 3] POST /exams/windows:", r3_post.status_code, r3_post.json().get("status"))

if __name__ == "__main__":
    asyncio.run(test_core_exam_endpoints())
