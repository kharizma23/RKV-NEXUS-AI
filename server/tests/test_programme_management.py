import pytest
import uuid
from datetime import date, timedelta, datetime, timezone, UTC
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.modules.users.model import User, StudentProfile
from app.modules.roles.model import Role
from app.modules.institutions.model import Institution, Department
from app.modules.academics.model import Programme, Semester, AcademicYear
from app.core.security import create_access_token, hash_password


@pytest.mark.asyncio
async def test_get_programme_templates(client: AsyncClient):
    response = await client.get("/api/v1/admin/programmes/templates")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 21
    codes = [t["programme_code"] for t in data]
    assert "BE-CSE" in codes
    assert "BE-ECE" in codes
    assert "BTECH-IT" in codes
    assert "BTECH-AIDS" in codes


@pytest.mark.asyncio
async def test_admin_create_programme_be_ece(
    client: AsyncClient,
    db_session: AsyncSession,
):
    # Scenario 1: Selecting B.E. ECE automatically fills Name, BE-ECE, Bachelor of Engineering, 4 yrs, 8 sems
    inst = Institution(name="Test Institute of Tech ECE", code="TITE", is_active=True)
    db_session.add(inst)
    await db_session.flush()
    inst_id_str = str(inst.id)

    # Seed an academic year for this institution so auto-create semesters works
    ay = AcademicYear(
        institution_id=inst.id,
        year_label="2025-2026",
        start_date=datetime.now(UTC).date(),
        end_date=datetime.now(UTC).date() + timedelta(days=365),
        is_current=True,
    )
    db_session.add(ay)
    await db_session.flush()

    dept = Department(institution_id=inst.id, name="Electronics Dept", code="ECE")
    db_session.add(dept)
    await db_session.flush()
    dept_id_str = str(dept.id)

    admin_role = (await db_session.execute(select(Role).where(Role.name == "ADMIN"))).scalar_one_or_none()
    if not admin_role:
        admin_role = Role(name="ADMIN", description="Administrator")
        db_session.add(admin_role)
        await db_session.flush()

    admin = User(
        email="admin_ece@test.com",
        password_hash=hash_password("Pass123!"),
        full_name="ECE Admin",
        is_active=True,
        is_verified=True,
        is_approved=True,
        account_status="ACTIVE",
    )
    admin.roles.append(admin_role)
    db_session.add(admin)
    await db_session.flush()
    admin_id_str = str(admin.id)
    await db_session.commit()

    token = create_access_token(admin_id_str, ["ADMIN"], ["*"])
    headers = {"Authorization": f"Bearer {token}"}

    payload = {
        "institution_id": inst_id_str,
        "department_id": dept_id_str,
        "name": "B.E. Electronics and Communication Engineering",
        "code": "BE-ECE",
        "degree_type": "Bachelor of Engineering",
        "duration_years": 4,
        "total_semesters": 8,
        "is_active": True,
        "auto_create_semesters": True,
    }

    response = await client.post("/api/v1/admin/programmes", json=payload, headers=headers)
    assert response.status_code == 201
    res_data = response.json()
    assert res_data["code"] == "BE-ECE"
    assert res_data["name"] == "B.E. Electronics and Communication Engineering"
    assert res_data["degree_type"] == "Bachelor of Engineering"
    assert res_data["duration_years"] == 4
    assert res_data["total_semesters"] == 8

    # Scenario 8: Eight semester records generated for 8-semester programme
    sem_stmt = select(Semester)
    sem_res = await db_session.execute(sem_stmt)
    sems = sem_res.scalars().all()
    assert len(sems) >= 8


@pytest.mark.asyncio
async def test_admin_create_programme_btech_it(
    client: AsyncClient,
    db_session: AsyncSession,
):
    # Scenario 2: Selecting B.Tech. IT automatically fills B.Tech. Information Technology, BTECH-IT, Bachelor of Technology, 4 yrs, 8 sems
    inst = Institution(name="Test Inst IT", code="TIIT", is_active=True)
    db_session.add(inst)
    await db_session.flush()
    inst_id_str = str(inst.id)

    # Seed an academic year for this institution so auto-create semesters works
    ay = AcademicYear(
        institution_id=inst.id,
        year_label="2025-2026",
        start_date=datetime.now(UTC).date(),
        end_date=datetime.now(UTC).date() + timedelta(days=365),
        is_current=True,
    )
    db_session.add(ay)
    await db_session.flush()

    dept = Department(institution_id=inst.id, name="Information Technology", code="IT")
    db_session.add(dept)
    await db_session.flush()
    dept_id_str = str(dept.id)

    admin_role = (await db_session.execute(select(Role).where(Role.name == "ADMIN"))).scalar_one_or_none()
    admin = User(
        email="admin_it@test.com",
        password_hash=hash_password("Pass123!"),
        full_name="IT Admin",
        is_active=True,
        is_verified=True,
        is_approved=True,
        account_status="ACTIVE",
    )
    if admin_role:
        admin.roles.append(admin_role)
    db_session.add(admin)
    await db_session.flush()
    admin_id_str = str(admin.id)
    await db_session.commit()

    token = create_access_token(admin_id_str, ["ADMIN"], ["*"])
    headers = {"Authorization": f"Bearer {token}"}

    payload = {
        "institution_id": inst_id_str,
        "department_id": dept_id_str,
        "name": "B.Tech. Information Technology",
        "code": "BTECH-IT",
        "degree_type": "Bachelor of Technology",
        "duration_years": 4,
        "total_semesters": 8,
        "is_active": True,
        "auto_create_semesters": True,
    }

    response = await client.post("/api/v1/admin/programmes", json=payload, headers=headers)
    assert response.status_code == 201
    res_data = response.json()
    assert res_data["code"] == "BTECH-IT"
    assert res_data["name"] == "B.Tech. Information Technology"
    assert res_data["degree_type"] == "Bachelor of Technology"
    assert res_data["duration_years"] == 4
    assert res_data["total_semesters"] == 8


@pytest.mark.asyncio
async def test_custom_programme_creation(
    client: AsyncClient,
    db_session: AsyncSession,
):
    # Scenario 4: Custom Programme enables manual duration and semester fields
    inst = Institution(name="Custom Test Inst", code="CTI", is_active=True)
    db_session.add(inst)
    await db_session.flush()
    inst_id_str = str(inst.id)

    # Seed an academic year for this institution so auto-create semesters works
    ay = AcademicYear(
        institution_id=inst.id,
        year_label="2025-2026",
        start_date=datetime.now(UTC).date(),
        end_date=datetime.now(UTC).date() + timedelta(days=365),
        is_current=True,
    )
    db_session.add(ay)
    await db_session.flush()

    dept = Department(institution_id=inst.id, name="Robotics Dept", code="ROBOTICS")
    db_session.add(dept)
    await db_session.flush()
    dept_id_str = str(dept.id)

    admin_role = (await db_session.execute(select(Role).where(Role.name == "ADMIN"))).scalar_one_or_none()
    admin = User(
        email="custom_admin@test.com",
        password_hash=hash_password("Pass123!"),
        full_name="Custom Admin",
        is_active=True,
        is_verified=True,
        is_approved=True,
        account_status="ACTIVE",
    )
    if admin_role:
        admin.roles.append(admin_role)
    db_session.add(admin)
    await db_session.flush()
    admin_id_str = str(admin.id)
    await db_session.commit()

    token = create_access_token(admin_id_str, ["ADMIN"], ["*"])
    headers = {"Authorization": f"Bearer {token}"}

    payload = {
        "institution_id": inst_id_str,
        "department_id": dept_id_str,
        "name": "M.Tech. Autonomous Robotics",
        "code": "MTECH-ROBOTICS",
        "degree_type": "Master of Technology",
        "duration_years": 2,
        "total_semesters": 4,
        "is_active": True,
        "auto_create_semesters": True,
    }

    response = await client.post("/api/v1/admin/programmes", json=payload, headers=headers)
    assert response.status_code == 201
    res_data = response.json()
    assert res_data["code"] == "MTECH-ROBOTICS"
    assert res_data["duration_years"] == 2
    assert res_data["total_semesters"] == 4


@pytest.mark.asyncio
async def test_duplicate_code_rejection(
    client: AsyncClient,
    db_session: AsyncSession,
):
    # Scenario 7: Duplicate programme is rejected
    inst = Institution(name="Unique Test Inst 2", code="UTI2", is_active=True)
    db_session.add(inst)
    await db_session.flush()
    inst_id_str = str(inst.id)

    dept = Department(institution_id=inst.id, name="EEE Dept", code="EEE")
    db_session.add(dept)
    await db_session.flush()
    dept_id_str = str(dept.id)

    admin_role = (await db_session.execute(select(Role).where(Role.name == "ADMIN"))).scalar_one_or_none()
    admin = User(
        email="dup_admin2@test.com",
        password_hash=hash_password("Pass123!"),
        full_name="Dup Admin 2",
        is_active=True,
        is_verified=True,
        is_approved=True,
        account_status="ACTIVE",
    )
    if admin_role:
        admin.roles.append(admin_role)
    db_session.add(admin)
    await db_session.flush()
    admin_id_str = str(admin.id)
    await db_session.commit()

    token = create_access_token(admin_id_str, ["ADMIN"], ["*"])
    headers = {"Authorization": f"Bearer {token}"}

    payload = {
        "institution_id": inst_id_str,
        "department_id": dept_id_str,
        "name": "B.E. Electrical Engineering",
        "code": "BE-EEE",
        "degree_type": "Bachelor of Engineering",
        "duration_years": 4,
        "total_semesters": 8,
        "auto_create_semesters": False,
    }

    res1 = await client.post("/api/v1/admin/programmes", json=payload, headers=headers)
    assert res1.status_code == 201

    res2 = await client.post("/api/v1/admin/programmes", json=payload, headers=headers)
    assert res2.status_code == 409


@pytest.mark.asyncio
async def test_student_registration_integration_and_deactivation(
    client: AsyncClient,
    db_session: AsyncSession,
):
    # Scenarios 9 & 10: Newly created programme appears in Student Registration; deactivated programme disappears
    inst = Institution(name="Student Test Inst", code="STI", is_active=True)
    db_session.add(inst)
    await db_session.flush()
    inst_id_str = str(inst.id)

    dept = Department(institution_id=inst.id, name="Civil Dept", code="CIVIL")
    db_session.add(dept)
    await db_session.flush()
    dept_id_str = str(dept.id)

    admin_role = (await db_session.execute(select(Role).where(Role.name == "ADMIN"))).scalar_one_or_none()
    admin = User(
        email="student_flow_admin@test.com",
        password_hash=hash_password("Pass123!"),
        full_name="Flow Admin",
        is_active=True,
        is_verified=True,
        is_approved=True,
        account_status="ACTIVE",
    )
    if admin_role:
        admin.roles.append(admin_role)
    db_session.add(admin)
    await db_session.flush()
    admin_id_str = str(admin.id)
    await db_session.commit()

    token = create_access_token(admin_id_str, ["ADMIN"], ["*"])
    headers = {"Authorization": f"Bearer {token}"}

    create_payload = {
        "institution_id": inst_id_str,
        "department_id": dept_id_str,
        "name": "B.E. Civil Engineering",
        "code": "BE-CIVIL",
        "degree_type": "Bachelor of Engineering",
        "duration_years": 4,
        "total_semesters": 8,
        "is_active": True,
        "auto_create_semesters": False,
    }

    res_create = await client.post("/api/v1/admin/programmes", json=create_payload, headers=headers)
    assert res_create.status_code == 201
    prog_id = res_create.json()["id"]

    # 9. Newly created programme appears in public API for student registration
    pub_res = await client.get(f"/api/v1/public/institutions/{inst_id_str}/departments/{dept_id_str}/programmes")
    assert pub_res.status_code == 200
    pub_progs = pub_res.json()
    assert any(p["id"] == prog_id for p in pub_progs)

    # 10. Deactivated programme disappears from student registration API
    deact_res = await client.post(f"/api/v1/admin/programmes/{prog_id}/deactivate", headers=headers)
    assert deact_res.status_code == 200
    assert deact_res.json()["is_active"] is False

    pub_res_after = await client.get(f"/api/v1/public/institutions/{inst_id_str}/departments/{dept_id_str}/programmes")
    assert pub_res_after.status_code == 200
    assert not any(p["id"] == prog_id for p in pub_res_after.json())


@pytest.mark.asyncio
async def test_programme_management_additional_scenarios(
    client: AsyncClient,
    db_session: AsyncSession,
):
    # Setup test Institution & Department
    inst = Institution(name="New Scenarios Inst", code="NSI", is_active=True)
    db_session.add(inst)
    await db_session.flush()
    inst_id_str = str(inst.id)

    dept = Department(institution_id=inst.id, name="CSE Department", code="CSE")
    db_session.add(dept)
    await db_session.flush()
    dept_id_str = str(dept.id)

    admin_role = (await db_session.execute(select(Role).where(Role.name == "ADMIN"))).scalar_one_or_none()
    admin = User(
        email="scenario_admin@test.com",
        password_hash=hash_password("Pass123!"),
        full_name="Scenario Admin",
        is_active=True,
        is_verified=True,
        is_approved=True,
        account_status="ACTIVE",
    )
    if admin_role:
        admin.roles.append(admin_role)
    db_session.add(admin)
    await db_session.flush()
    admin_id_str = str(admin.id)
    await db_session.commit()

    token = create_access_token(admin_id_str, ["ADMIN"], ["*"])
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Subject-like custom name produces warning / rejection code SUBJECT_LIKE_NAME
    payload_subject = {
        "institution_id": inst_id_str,
        "department_id": dept_id_str,
        "name": "Database Management",
        "code": "DB-MGMT",
        "degree_type": "Bachelor of Technology",
        "duration_years": 4,
        "total_semesters": 8,
        "is_active": True,
        "auto_create_semesters": False,
    }
    res_sub = await client.post("/api/v1/admin/programmes", json=payload_subject, headers=headers)
    assert res_sub.status_code == 400
    assert res_sub.json()["code"] == "SUBJECT_LIKE_NAME"

    # With confirm_unusual_name=True, it should pass
    payload_subject["confirm_unusual_name"] = True
    res_sub_confirm = await client.post("/api/v1/admin/programmes", json=payload_subject, headers=headers)
    assert res_sub_confirm.status_code == 201

    # 2. Standard Programme Name and Code are saved together
    # 3. B.E. ECE automatically uses BE-ECE; B.Tech. CSE automatically uses BTECH-CSE.
    payload_be_ece = {
        "institution_id": inst_id_str,
        "department_id": dept_id_str,
        "name": "B.E. Electronics and Communication Engineering",
        "code": "BE-ECE",
        "degree_type": "Bachelor of Engineering",
        "duration_years": 4,
        "total_semesters": 8,
        "is_active": True,
        "auto_create_semesters": False,
    }
    res_ece = await client.post("/api/v1/admin/programmes", json=payload_be_ece, headers=headers)
    assert res_ece.status_code == 201
    assert res_ece.json()["name"] == "B.E. Electronics and Communication Engineering"
    assert res_ece.json()["code"] == "BE-ECE"

    payload_btech_cse = {
        "institution_id": inst_id_str,
        "department_id": dept_id_str,
        "name": "B.Tech. Computer Science and Engineering",
        "code": "BTECH-CSE",
        "degree_type": "Bachelor of Technology",
        "duration_years": 4,
        "total_semesters": 8,
        "is_active": True,
        "auto_create_semesters": False,
    }
    res_cse = await client.post("/api/v1/admin/programmes", json=payload_btech_cse, headers=headers)
    assert res_cse.status_code == 201

    # 4. Duplicate code returns a clear conflict response (409)
    res_dup_code = await client.post("/api/v1/admin/programmes", json=payload_be_ece, headers=headers)
    assert res_dup_code.status_code == 409
    assert "already exists in this institution" in res_dup_code.json()["message"]

    # 5. Duplicate programme name is rejected case-insensitively
    payload_dup_name = payload_btech_cse.copy()
    payload_dup_name["code"] = "BTECH-CSE-ALT"
    payload_dup_name["name"] = "B.Tech. Computer Science and Engineering" # Same name
    res_dup_name = await client.post("/api/v1/admin/programmes", json=payload_dup_name, headers=headers)
    assert res_dup_name.status_code == 409
    assert "already exists under the selected department" in res_dup_name.json()["message"]

    # 6. Invalid institution and department combination is rejected
    inst_other = Institution(name="Other Inst", code="OTI", is_active=True)
    db_session.add(inst_other)
    await db_session.flush()
    inst_other_id_str = str(inst_other.id)
    await db_session.commit()

    payload_invalid_inst = payload_btech_cse.copy()
    payload_invalid_inst["institution_id"] = inst_other_id_str # Non-matching department
    payload_invalid_inst["code"] = "BTECH-OTHER"
    res_invalid_inst = await client.post("/api/v1/admin/programmes", json=payload_invalid_inst, headers=headers)
    assert res_invalid_inst.status_code == 400
    assert res_invalid_inst.json()["code"] == "INVALID_DEPARTMENT"

    # 7. Programme and semester creation are transactional.
    # 8. Failure during semester generation rolls back programme creation.
    # Let's verify that when auto_create_semesters=True but there's no active academic year:
    # It should fail with MISSING_ACADEMIC_YEAR and NOT create the programme.
    payload_no_ay = {
        "institution_id": inst_id_str,
        "department_id": dept_id_str,
        "name": "B.Tech. Textile Technology",
        "code": "BTECH-TT",
        "degree_type": "Bachelor of Technology",
        "duration_years": 4,
        "total_semesters": 8,
        "is_active": True,
        "auto_create_semesters": True,
    }
    res_no_ay = await client.post("/api/v1/admin/programmes", json=payload_no_ay, headers=headers)
    assert res_no_ay.status_code == 400
    assert res_no_ay.json()["code"] == "MISSING_ACADEMIC_YEAR"

    # Verify that "B.Tech. Textile Technology" was NOT created (transaction rolled back)
    check_stmt = select(Programme).where(Programme.code == "BTECH-TT", Programme.institution_id == uuid.UUID(inst_id_str))
    check_res = await db_session.execute(check_stmt)
    assert check_res.scalar_one_or_none() is None


