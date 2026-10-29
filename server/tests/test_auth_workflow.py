import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_student_and_faculty_registration_and_approval_flow(client: AsyncClient):
    # 1. Public metadata endpoints check
    inst_res = await client.get("/api/v1/public/institutions")
    assert inst_res.status_code == 200

    # 2. Student Registration Flow
    student_payload = {
        "email": "new.student@test.com",
        "password": "StudentPass123!",
        "confirm_password": "StudentPass123!",
        "full_name": "New Student",
        "student_id_number": "STU-NEW-001",
        "accept_terms": True
    }
    reg_stu_res = await client.post("/api/v1/auth/register/student", json=student_payload)
    assert reg_stu_res.status_code == 201
    verify_detail = reg_stu_res.json()["detail"]
    raw_verify_token = verify_detail.split(": ")[-1]

    # Login before verification denied
    bad_login = await client.post("/api/v1/auth/login", json={"email": "new.student@test.com", "password": "StudentPass123!"})
    assert bad_login.status_code == 401

    # Verify Email
    vfy_res = await client.post("/api/v1/auth/verify-email", json={"token": raw_verify_token})
    assert vfy_res.status_code == 200

    # Login after verification succeeded
    good_login = await client.post("/api/v1/auth/login", json={"email": "new.student@test.com", "password": "StudentPass123!"})
    assert good_login.status_code == 200
    assert good_login.json()["role"] == "STUDENT"

    # 3. Faculty Registration Flow
    faculty_payload = {
        "email": "new.faculty@test.com",
        "password": "FacultyPass123!",
        "confirm_password": "FacultyPass123!",
        "full_name": "New Faculty",
        "employee_id": "EMP-NEW-001",
        "designation": "Assistant Professor",
        "accept_terms": True
    }
    reg_fac_res = await client.post("/api/v1/auth/register/faculty", json=faculty_payload)
    assert reg_fac_res.status_code == 201
    fac_token = reg_fac_res.json()["detail"].split(": ")[-1]

    # Verify Faculty Email
    await client.post("/api/v1/auth/verify-email", json={"token": fac_token})

    # Login while pending approval denied
    fac_login_pending = await client.post("/api/v1/auth/login", json={"email": "new.faculty@test.com", "password": "FacultyPass123!"})
    assert fac_login_pending.status_code == 401

    # Admin Login & Approval
    admin_login = await client.post("/api/v1/auth/login", json={"email": "admin@test.com", "password": "AdminPass123!"})
    assert admin_login.status_code == 200

    # Get Faculty Approvals List
    list_app = await client.get("/api/v1/admin/faculty-approvals?status_filter=PENDING_APPROVAL")
    assert list_app.status_code == 200
    pending_list = list_app.json()
    new_fac_item = next(x for x in pending_list if x["email"] == "new.faculty@test.com")
    new_fac_id = new_fac_item["user_id"]

    # Admin Approve Faculty
    app_res = await client.post(f"/api/v1/admin/faculty-approvals/{new_fac_id}/approve")
    assert app_res.status_code == 200

    # Faculty Login after Approval succeeded
    client.cookies.clear()
    fac_login_success = await client.post("/api/v1/auth/login", json={"email": "new.faculty@test.com", "password": "FacultyPass123!"})
    assert fac_login_success.status_code == 200
    assert fac_login_success.json()["role"] == "FACULTY"

@pytest.mark.asyncio
async def test_faculty_rejection_and_lockout(client: AsyncClient):
    # Register Rejected Faculty
    faculty_payload = {
        "email": "reject.faculty@test.com",
        "password": "FacultyPass123!",
        "confirm_password": "FacultyPass123!",
        "full_name": "Reject Faculty",
        "employee_id": "EMP-REJ-001",
        "accept_terms": True
    }
    reg_fac_res = await client.post("/api/v1/auth/register/faculty", json=faculty_payload)
    assert reg_fac_res.status_code == 201
    fac_token = reg_fac_res.json()["detail"].split(": ")[-1]
    await client.post("/api/v1/auth/verify-email", json={"token": fac_token})

    # Admin Login & Rejection without reason fails
    await client.post("/api/v1/auth/login", json={"email": "admin@test.com", "password": "AdminPass123!"})
    list_app = await client.get("/api/v1/admin/faculty-approvals?status_filter=PENDING_APPROVAL")
    fac_item = next(x for x in list_app.json() if x["email"] == "reject.faculty@test.com")
    fac_id = fac_item["user_id"]

    bad_rej = await client.post(f"/api/v1/admin/faculty-approvals/{fac_id}/reject", json={"action": "REJECT", "reason": ""})
    assert bad_rej.status_code == 400

    good_rej = await client.post(f"/api/v1/admin/faculty-approvals/{fac_id}/reject", json={"action": "REJECT", "reason": "Invalid institutional ID"})
    assert good_rej.status_code == 200

    # Login as rejected faculty fails
    client.cookies.clear()
    login_rej = await client.post("/api/v1/auth/login", json={"email": "reject.faculty@test.com", "password": "FacultyPass123!"})
    assert login_rej.status_code == 401
    res_json = login_rej.json()
    err_text = res_json.get("message") or res_json.get("detail") or ""
    assert "rejected" in err_text.lower()
