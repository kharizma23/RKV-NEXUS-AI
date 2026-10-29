import asyncio
import httpx
from app.database.session import AsyncSessionLocal
from sqlalchemy import text
from app.core.security import create_access_token

async def verify_everything():
    async with AsyncSessionLocal() as session:
        res = await session.execute(text("""
            SELECT u.id, u.email FROM users u 
            JOIN user_roles ur ON u.id = ur.user_id 
            JOIN roles r ON ur.role_id = r.id 
            WHERE r.name = 'ADMIN' LIMIT 1
        """))
        row = res.fetchone()
        admin_id = str(row[0])
        print("Admin ID:", admin_id)

    token = create_access_token(
        subject=admin_id,
        roles=["ADMIN"],
        permissions=["ALL"]
    )
    headers = {"Authorization": f"Bearer {token}"}

    async with httpx.AsyncClient(base_url="http://127.0.0.1:8000", timeout=10.0) as client:
        # 1. Stats
        r_stats = await client.get("/api/v1/admin/alumni/stats", headers=headers)
        print("[SUCCESS] GET /alumni/stats:", r_stats.status_code, r_stats.json())

        # 2. Notable
        r_notable = await client.get("/api/v1/admin/alumni/notable", headers=headers)
        print("[SUCCESS] GET /alumni/notable:", r_notable.status_code, f"{len(r_notable.json())} achievers returned")
        for item in r_notable.json():
            print(f"   * {item['name']} | {item['company']} | {item['role']} | {item['package_lpa']} LPA")

        # 3. Placement Rates
        r_rates = await client.get("/api/v1/admin/alumni/placement-rates", headers=headers)
        print("[SUCCESS] GET /alumni/placement-rates:", r_rates.status_code, r_rates.json())

        # 4. List All Alumni
        r_all = await client.get("/api/v1/admin/alumni", headers=headers)
        print("[SUCCESS] GET /alumni:", r_all.status_code, f"{len(r_all.json())} alumni in directory")

        # 5. List with filters: batch=2024&company=Google
        r_filter = await client.get("/api/v1/admin/alumni?batch=2024&company=Google", headers=headers)
        print("[SUCCESS] GET /alumni?batch=2024&company=Google:", r_filter.status_code, r_filter.json())

        # 6. POST new alumni
        new_payload = {
            "name": "Dhivya Dharshini",
            "batch_year": 2026,
            "company": "Google",
            "role": "Software Engineer II",
            "package_lpa": 42.0,
            "location": "Bengaluru, India",
            "degree": "B.E. Computer Science & Engineering",
            "is_notable": True
        }
        r_post = await client.post("/api/v1/admin/alumni", json=new_payload, headers=headers)
        print("[SUCCESS] POST /alumni:", r_post.status_code, r_post.json().get("status"))

        # 7. POST newsletter
        nl_payload = {
            "subject": "Annual Alumni Conclave 2026",
            "target_batch": "All",
            "message": "Welcome all alumni to the 2026 Conclave."
        }
        r_nl = await client.post("/api/v1/admin/alumni/newsletter", json=nl_payload, headers=headers)
        print("[SUCCESS] POST /alumni/newsletter:", r_nl.status_code, r_nl.json())

        # 8. Test AI Assistant for ECE
        r_ai_ece = await client.post("/api/v1/admin/ai-assistant", json={"query": "ece department students"}, headers=headers)
        print("[SUCCESS] AI Chatbot (ece department students):", r_ai_ece.status_code)
        resp_txt = r_ai_ece.json().get("response") if r_ai_ece.status_code == 200 else r_ai_ece.text
        print("   Snippet:", resp_txt[:200].encode('ascii', 'replace').decode('ascii'))

if __name__ == "__main__":
    asyncio.run(verify_everything())
