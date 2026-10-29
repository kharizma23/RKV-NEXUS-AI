import asyncio
import uuid
from datetime import datetime, UTC
from sqlalchemy import select
from app.database.session import AsyncSessionLocal
from app.core.security import hash_password
from app.modules.users.model import User, FacultyProfile, StudentProfile
from app.modules.roles.model import Role
from app.modules.institutions.model import Institution, Department
from app.modules.academics.model import Subject, Semester, Course

STAFF_DATA = [
    {
        "email": "prof.sharma@ait.edu",
        "full_name": "Dr. Rajesh Sharma",
        "employee_id": "FAC-AIT-001",
        "designation": "Professor & Head of Department",
        "password": "Password123!"
    },
    {
        "email": "prof.anitha@ait.edu",
        "full_name": "Dr. Anitha Raman",
        "employee_id": "FAC-AIT-002",
        "designation": "Associate Professor",
        "password": "Password123!"
    },
    {
        "email": "prof.karthik@ait.edu",
        "full_name": "Dr. Karthik Sundaram",
        "employee_id": "FAC-AIT-003",
        "designation": "Assistant Professor",
        "password": "Password123!"
    },
    {
        "email": "prof.priya@ait.edu",
        "full_name": "Dr. Priya Venkatesh",
        "employee_id": "FAC-AIT-004",
        "designation": "Senior Assistant Professor",
        "password": "Password123!"
    },
    {
        "email": "prof.vikram@ait.edu",
        "full_name": "Dr. Vikram Seth",
        "employee_id": "FAC-AIT-005",
        "designation": "Associate Professor",
        "password": "Password123!"
    }
]

STUDENT_DATA = [
    {
        "email": "student.arun@ait.edu",
        "full_name": "Arun Kumar",
        "student_id_number": "22CS101",
        "target_batch": "2022-2026",
        "target_semester": 6,
        "password": "Password123!"
    },
    {
        "email": "student.divya@ait.edu",
        "full_name": "Divya Bharathi",
        "student_id_number": "22CS102",
        "target_batch": "2022-2026",
        "target_semester": 6,
        "password": "Password123!"
    },
    {
        "email": "student.rahul@ait.edu",
        "full_name": "Rahul Verma",
        "student_id_number": "22CS103",
        "target_batch": "2022-2026",
        "target_semester": 6,
        "password": "Password123!"
    },
    {
        "email": "student.sneha@ait.edu",
        "full_name": "Sneha Reddy",
        "student_id_number": "22CS104",
        "target_batch": "2022-2026",
        "target_semester": 6,
        "password": "Password123!"
    },
    {
        "email": "student.vikas@ait.edu",
        "full_name": "Vikas Pillai",
        "student_id_number": "22CS105",
        "target_batch": "2022-2026",
        "target_semester": 6,
        "password": "Password123!"
    }
]

async def seed_cohort():
    async with AsyncSessionLocal() as session:
        # 1. Fetch Apex Institute of Technology and CSE Department
        inst = (await session.execute(select(Institution).where(Institution.code == "AIT"))).scalars().first()
        if not inst:
            inst = (await session.execute(select(Institution).limit(1))).scalars().first()
        
        dept = (await session.execute(
            select(Department).where(Department.institution_id == inst.id, Department.code == "CSE")
        )).scalars().first()
        if not dept:
            dept = (await session.execute(
                select(Department).where(Department.institution_id == inst.id)
            )).scalars().first()
            
        print(f"Target Institution: {inst.name} ({inst.code}) [ID: {inst.id}]")
        print(f"Target Department: {dept.name} ({dept.code}) [ID: {dept.id}]")

        # 2. Get Roles
        faculty_role = (await session.execute(select(Role).where(Role.name == "FACULTY"))).scalars().first()
        student_role = (await session.execute(select(Role).where(Role.name == "STUDENT"))).scalars().first()

        # 3. Seed 5 Faculty
        print("\n--- Seeding 5 Staff/Faculty Members ---")
        for s in STAFF_DATA:
            existing = (await session.execute(select(User).where(User.email == s["email"]))).scalars().first()
            if not existing:
                u = User(
                    email=s["email"],
                    password_hash=hash_password(s["password"]),
                    full_name=s["full_name"],
                    is_active=True,
                    is_verified=True,
                    is_approved=True,
                    account_status="ACTIVE",
                    roles=[faculty_role] if faculty_role else []
                )
                session.add(u)
                await session.flush()
                
                fp = FacultyProfile(
                    user_id=u.id,
                    employee_id=s["employee_id"],
                    designation=s["designation"],
                    institution_id=inst.id,
                    department_id=dept.id,
                    approval_status="APPROVED"
                )
                session.add(fp)
                print(f"Created Faculty: {s['full_name']} <{s['email']}> | EmpID: {s['employee_id']}")
            else:
                existing.is_active = True
                existing.is_verified = True
                existing.is_approved = True
                existing.password_hash = hash_password(s["password"])
                if faculty_role and faculty_role not in existing.roles:
                    existing.roles.append(faculty_role)
                print(f"Updated Faculty: {s['full_name']} <{s['email']}>")

        # 4. Seed 5 Students
        print("\n--- Seeding 5 Student Members ---")
        for st in STUDENT_DATA:
            existing = (await session.execute(select(User).where(User.email == st["email"]))).scalars().first()
            if not existing:
                u = User(
                    email=st["email"],
                    password_hash=hash_password(st["password"]),
                    full_name=st["full_name"],
                    is_active=True,
                    is_verified=True,
                    is_approved=True,
                    account_status="ACTIVE",
                    roles=[student_role] if student_role else []
                )
                session.add(u)
                await session.flush()
                
                sp = StudentProfile(
                    user_id=u.id,
                    student_id_number=st["student_id_number"],
                    institution_id=inst.id,
                    department_id=dept.id,
                    target_batch=st["target_batch"],
                    target_semester=st["target_semester"]
                )
                session.add(sp)
                print(f"Created Student: {st['full_name']} <{st['email']}> | Roll: {st['student_id_number']}")
            else:
                existing.is_active = True
                existing.is_verified = True
                existing.is_approved = True
                existing.password_hash = hash_password(st["password"])
                if student_role and student_role not in existing.roles:
                    existing.roles.append(student_role)
                print(f"Updated Student: {st['full_name']} <{st['email']}>")

        await session.commit()
        print("\nSuccessfully seeded 5 Staff and 5 Students under the exact same College and Department!")

if __name__ == "__main__":
    asyncio.run(seed_cohort())
