import asyncio
from app.database.session import AsyncSessionLocal
from sqlalchemy import text
from app.core.security import create_access_token
import httpx

async def test_with_real_admin():
    async with AsyncSessionLocal() as session:
        res = await session.execute(text("""
            SELECT u.id, u.email FROM users u 
            JOIN user_roles ur ON u.id = ur.user_id 
            JOIN roles r ON ur.role_id = r.id 
            WHERE r.name = 'ADMIN' LIMIT 1
        """))
        row = res.fetchone()
        if not row:
            print("No admin user found")
            return
        admin_id, admin_email = str(row[0]), row[1]
        print(f"Using admin user: {admin_email} ({admin_id})")

    token = create_access_token(
        subject=admin_id,
        roles=["ADMIN"],
        permissions=["ALL"]
    )
    headers = {"Authorization": f"Bearer {token}"}
    
    async with httpx.AsyncClient(base_url="http://127.0.0.1:8000") as client:
        # 1. GET /api/v1/admin/alumni/stats
        r1 = await client.get("/api/v1/admin/alumni/stats", headers=headers)
        print("1. /alumni/stats:", r1.status_code, r1.json())
        
        # 2. GET /api/v1/admin/alumni/notable
        r2 = await client.get("/api/v1/admin/alumni/notable", headers=headers)
        print("2. /alumni/notable:", r2.status_code, len(r2.json()), "items")
        for item in r2.json():
            print("   ->", item["name"], item["company"], item["package_lpa"], "LPA")
        
        # 3. GET /api/v1/admin/alumni/placement-rates
        r3 = await client.get("/api/v1/admin/alumni/placement-rates", headers=headers)
        print("3. /alumni/placement-rates:", r3.status_code, r3.json())
        
        # 4. GET /api/v1/admin/alumni (all)
        r4 = await client.get("/api/v1/admin/alumni", headers=headers)
        print("4. /alumni:", r4.status_code, len(r4.json()), "alumni returned")
        
        # 5. GET /api/v1/admin/alumni with filters
        r5 = await client.get("/api/v1/admin/alumni?batch=2024&company=Google", headers=headers)
        print("5. /alumni filter (2024, Google):", r5.status_code, len(r5.json()), "records")
        
        # 6. POST /api/v1/admin/alumni
        new_payload = {
            "name": "Nandhini Prakash",
            "batch_year": 2026,
            "company": "Google",
            "role": "Cloud AI Solutions Engineer",
            "package_lpa": 37.0,
            "location": "Hyderabad, India"
        }
        r6 = await client.post("/api/v1/admin/alumni", json=new_payload, headers=headers)
        print("6. POST /alumni:", r6.status_code, r6.json().get("status"))

if __name__ == "__main__":
    asyncio.run(test_with_real_admin())
