import asyncio
import uuid
from sqlalchemy import text
from app.database.session import AsyncSessionLocal
from app.core.security import hash_password

sample_ece_students = [
    {"name": "Ananya Sharma", "reg": "23ECE001", "email": "ananya.ece@rkv.edu", "sem": 4, "co": 89.4},
    {"name": "Karthik Venkatesh", "reg": "23ECE002", "email": "karthik.v.ece@rkv.edu", "sem": 4, "co": 84.2},
    {"name": "Meera Krishnan", "reg": "23ECE003", "email": "meera.k.ece@rkv.edu", "sem": 4, "co": 91.0},
    {"name": "Sanjay Varma", "reg": "23ECE004", "email": "sanjay.varma.ece@rkv.edu", "sem": 4, "co": 76.5},
    {"name": "Pooja Raman", "reg": "23ECE005", "email": "pooja.raman.ece@rkv.edu", "sem": 4, "co": 82.0},
]

async def seed_ece():
    async with AsyncSessionLocal() as session:
        # Check if ECE department exists
        res = await session.execute(text("SELECT id FROM departments WHERE code = 'ECE' OR name ILIKE '%electronics%' LIMIT 1"))
        dept_row = res.fetchone()
        if dept_row:
            dept_id = dept_row[0]
        else:
            dept_id = uuid.uuid4()
            await session.execute(text("INSERT INTO departments (id, name, code) VALUES (:id, 'Electronics & Communication Engineering', 'ECE')"), {"id": dept_id})
            await session.commit()
            print("Created ECE department")

        # Check student role id
        role_res = await session.execute(text("SELECT id FROM roles WHERE name = 'STUDENT' LIMIT 1"))
        student_role_id = role_res.scalar()

        pwd_hash = hash_password("Student@123")

        for stu in sample_ece_students:
            chk = await session.execute(text("SELECT id FROM users WHERE email = :email"), {"email": stu["email"]})
            row = chk.fetchone()
            if not row:
                u_id = uuid.uuid4()
                await session.execute(text("""
                    INSERT INTO users (id, email, password_hash, full_name, is_active, is_verified, is_approved, created_at, updated_at)
                    VALUES (:id, :email, :pwd, :name, true, true, true, NOW(), NOW())
                """), {"id": u_id, "email": stu["email"], "pwd": pwd_hash, "name": stu["name"]})
            else:
                u_id = row[0]
                
            if student_role_id:
                await session.execute(text("""
                    INSERT INTO user_roles (user_id, role_id) VALUES (:uid, :rid) ON CONFLICT DO NOTHING
                """), {"uid": u_id, "rid": student_role_id})
            
            await session.execute(text("""
                INSERT INTO student_profiles (id, user_id, department_id, target_semester, student_id_number, created_at, updated_at)
                VALUES (:id, :uid, :dept_id, :sem, :reg, NOW(), NOW())
                ON CONFLICT (student_id_number) DO NOTHING
            """), {"id": uuid.uuid4(), "uid": u_id, "dept_id": dept_id, "sem": stu["sem"], "reg": stu["reg"]})
        
        await session.commit()
        print("ECE Students seeded successfully!")

if __name__ == "__main__":
    asyncio.run(seed_ece())
