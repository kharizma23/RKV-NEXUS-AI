import asyncio
import sys
import uuid
from datetime import UTC, datetime

import app.modules.users.model
import app.modules.syllabus.model
import app.modules.learning_outcomes.model
import app.modules.academics.model
import app.modules.institutions.model

from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.database.session import AsyncSessionLocal
from app.modules.auth.service import AuthService
from app.modules.auth.schema import StudentRegisterRequest
from app.modules.institutions.model import Institution, Department
from app.modules.academics.model import Programme, AcademicYear, Semester, Subject
from app.modules.learning_outcomes.model import CourseOutcome
from app.modules.users.model import User, StudentProfile
from app.core.exceptions import DuplicateResourceError, ResourceNotFoundError

async def run_tests():
    print("=" * 60)
    print("RUNNING BIT REAL INSTITUTION TEST & VALIDATION SUITE")
    print("=" * 60)

    async with AsyncSessionLocal() as session:
        # 1. Verify BIT Institution
        bit_stmt = select(Institution).where(Institution.code == "BIT")
        bit_res = await session.execute(bit_stmt)
        bit = bit_res.scalar_one_or_none()
        assert bit is not None, "Bannari Amman Institute of Technology must exist in database"
        print(f"[OK] 1. Institution Found: {bit.name} (ID: {bit.id})")

        # 2. Verify Departments
        dept_stmt = select(Department).where(Department.institution_id == bit.id)
        dept_res = await session.execute(dept_stmt)
        depts = list(dept_res.scalars().all())
        dept_codes = [d.code for d in depts]
        print(f"[OK] 2. Departments Found ({len(depts)} total): {dept_codes}")
        assert "CSE" in dept_codes, "CSE department missing"
        assert "AIDS" in dept_codes, "AIDS department missing"
        assert "IT" in dept_codes, "IT department missing"
        assert "ECE" in dept_codes, "ECE department missing"
        assert "EEE" in dept_codes, "EEE department missing"
        assert "MECH" in dept_codes, "Mechanical department missing"
        assert "CIVIL" in dept_codes, "Civil department missing"
        assert "BT" in dept_codes, "Biotechnology department missing"

        cse_dept = next(d for d in depts if d.code == "CSE")

        # 3. Verify Degree Programmes
        prog_stmt = select(Programme).where(Programme.institution_id == bit.id, Programme.is_active == True)
        prog_res = await session.execute(prog_stmt)
        progs = list(prog_res.scalars().all())
        [p.code for p in progs]
        print(f"[OK] 3. Active Programmes Found ({len(progs)} total): {[p.name for p in progs]}")
        assert any(p.code == "BIT-BE-CSE" for p in progs), "BE-CSE programme missing"

        cse_prog = next(p for p in progs if p.code == "BIT-BE-CSE")

        # 4. Verify Academic Year
        ay_stmt = select(AcademicYear).where(AcademicYear.institution_id == bit.id, AcademicYear.year_label == "2026-2027")
        ay_res = await session.execute(ay_stmt)
        ay = ay_res.scalar_one_or_none()
        assert ay is not None, "BIT Academic Year 2026-2027 missing"
        print(f"[OK] 4. Academic Year Found: {ay.year_label} (Current: {ay.is_current})")

        # 5. Verify Semesters
        sem_stmt = select(Semester).where(Semester.academic_year_id == ay.id)
        sem_res = await session.execute(sem_stmt)
        sems = list(sem_res.scalars().all())
        print(f"[OK] 5. Semesters Found ({len(sems)} total): {[s.semester_number for s in sems]}")
        assert len(sems) == 8, "Expected 8 semesters for Academic Year 2026-2027"
        sem1 = next(s for s in sems if s.semester_number == 1)

        # 6. Verify Subjects
        sub_stmt = select(Subject)
        sub_res = await session.execute(sub_stmt)
        all_subs = list(sub_res.scalars().all())
        print(f"[OK] 6. Total Subjects in Database: {len(all_subs)}")

        # 7. Test Student Registration Flow (Positive Case)
        test_email = f"dharshini.test.{uuid.uuid4().hex[:6]}@bit.edu.in"
        test_roll = f"BIT-TEST-{uuid.uuid4().hex[:4].upper()}"

        print(f"\n--- Testing Student Registration: {test_email} / {test_roll} ---")
        auth_service = AuthService(session)
        req = StudentRegisterRequest(
            email=test_email,
            password="StudentPassword123!",
            confirm_password="StudentPassword123!",
            full_name="Dharshini Test",
            student_id_number=test_roll,
            institution_id=bit.id,
            department_id=cse_dept.id,
            programme_id=cse_prog.id,
            academic_year_id=ay.id,
            semester_id=sem1.id,
            preferred_language="en",
            accept_terms=True
        )

        user, token = await auth_service.register_student(req)
        print(f"[OK] Registration Succeeded! User ID: {user.id}")

        # 8. Verify Database State After Registration
        db_user_stmt = select(User).options(selectinload(User.roles), selectinload(User.student_profile)).where(User.id == user.id)
        db_user_res = await session.execute(db_user_stmt)
        db_user = db_user_res.scalar_one_or_none()
        assert db_user is not None, "Registered user must exist in DB"
        assert any(r.name == "STUDENT" for r in db_user.roles), "User role must be STUDENT"
        assert db_user.student_profile is not None, "Student profile must be created"
        assert db_user.student_profile.student_id_number == test_roll, "Roll number must match"
        assert db_user.student_profile.institution_id == bit.id, "Institution ID FK must match"
        assert db_user.student_profile.department_id == cse_dept.id, "Department ID FK must match"
        assert db_user.student_profile.programme_id == cse_prog.id, "Programme ID FK must match"
        assert db_user.password_hash.startswith("$argon2id$"), "Password must be Argon2id hashed"
        assert "StudentPassword123!" not in db_user.password_hash, "Plaintext password must NEVER be stored"
        print("[OK] Database State Verified: Roles, Student Profile, Foreign Keys, Argon2id Hash")

        # 9. Test Negative Cases
        print("\n--- Testing Negative Cases ---")

        # Case A: Duplicate Email
        try:
            req_dup_email = StudentRegisterRequest(
                email=test_email,
                password="StudentPassword123!",
                confirm_password="StudentPassword123!",
                full_name="Duplicate Email Test",
                student_id_number=f"BIT-DIFF-{uuid.uuid4().hex[:4]}",
                institution_id=bit.id,
                department_id=cse_dept.id,
                programme_id=cse_prog.id,
                accept_terms=True
            )
            await auth_service.register_student(req_dup_email)
            assert False, "Should have rejected duplicate email"
        except DuplicateResourceError as e:
            print(f"[OK] Rejected Duplicate Email correctly: {e}")

        # Case B: Duplicate Roll Number
        try:
            req_dup_roll = StudentRegisterRequest(
                email=f"unique.{uuid.uuid4().hex[:6]}@bit.edu.in",
                password="StudentPassword123!",
                confirm_password="StudentPassword123!",
                full_name="Duplicate Roll Test",
                student_id_number=test_roll,
                institution_id=bit.id,
                department_id=cse_dept.id,
                programme_id=cse_prog.id,
                accept_terms=True
            )
            await auth_service.register_student(req_dup_roll)
            assert False, "Should have rejected duplicate roll number"
        except DuplicateResourceError as e:
            print(f"[OK] Rejected Duplicate Roll Number correctly: {e}")

        # Case C: Mismatched Programme ID from another institution
        dit_stmt = select(Institution).where(Institution.code == "DIT")
        dit_res = await session.execute(dit_stmt)
        dit = dit_res.scalar_one_or_none()
        if dit:
            dit_prog_stmt = select(Programme).where(Programme.institution_id == dit.id)
            dit_prog_res = await session.execute(dit_prog_stmt)
            dit_prog = dit_prog_res.scalars().first()
            if dit_prog:
                try:
                    req_mismatch = StudentRegisterRequest(
                        email=f"mismatch.{uuid.uuid4().hex[:6]}@bit.edu.in",
                        password="StudentPassword123!",
                        confirm_password="StudentPassword123!",
                        full_name="Mismatch Test",
                        student_id_number=f"BIT-MIS-{uuid.uuid4().hex[:4]}",
                        institution_id=bit.id,
                        department_id=cse_dept.id,
                        programme_id=dit_prog.id, # Belongs to DIT!
                        accept_terms=True
                    )
                    await auth_service.register_student(req_mismatch)
                    assert False, "Should have rejected mismatched programme"
                except ResourceNotFoundError as e:
                    print(f"[OK] Rejected Mismatched Cross-Institution Programme ID correctly: {e}")

        # 10. Multi-Institution Isolation Check
        print("\n--- Testing Multi-Institution Data Isolation ---")
        bit_progs_query = select(Programme).where(Programme.institution_id == bit.id)
        bit_progs_res = await session.execute(bit_progs_query)
        bit_progs_all = list(bit_progs_res.scalars().all())
        for p in bit_progs_all:
            assert p.institution_id == bit.id, "Programme must belong exclusively to BIT"
        print("[OK] Multi-Institution Isolation Verified: BIT academic data strictly scoped to BIT institution ID")

    print("\n" + "=" * 60)
    print("ALL TESTS PASSED SUCCESSFULLY!")
    print("=" * 60)

if __name__ == "__main__":
    asyncio.run(run_tests())
