import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_student_registration(client: AsyncClient):
    response = await client.post(
        "/api/v1/auth/register/student",
        json={
            "email": "new.student.auth@test.com",
            "password": "StudentPass123!",
            "confirm_password": "StudentPass123!",
            "full_name": "New Student",
            "student_id_number": "STU-9999",
            "accept_terms": True
        }
    )
    assert response.status_code == 201
    data = response.json()
    assert "Student account created successfully" in data["message"]

@pytest.mark.asyncio
async def test_faculty_registration_pending_approval(client: AsyncClient):
    response = await client.post(
        "/api/v1/auth/register/faculty",
        json={
            "email": "new.faculty.auth@test.com",
            "password": "FacultyPass123!",
            "confirm_password": "FacultyPass123!",
            "full_name": "New Faculty",
            "employee_id": "EMP-9999",
            "accept_terms": True
        }
    )
    assert response.status_code == 201
    data = response.json()
    assert "Faculty registration submitted successfully" in data["message"]

@pytest.mark.asyncio
async def test_duplicate_registration_fails(client: AsyncClient):
    response = await client.post(
        "/api/v1/auth/register/student",
        json={
            "email": "student@test.com",
            "password": "StudentPass123!",
            "confirm_password": "StudentPass123!",
            "full_name": "Duplicate Student",
            "student_id_number": "STU-0000",
            "accept_terms": True
        }
    )
    assert response.status_code == 409
    data = response.json()
    assert data["code"] == "DUPLICATE_RESOURCE"

@pytest.mark.asyncio
async def test_login_success(client: AsyncClient):
    response = await client.post(
        "/api/v1/auth/login",
        json={
            "email": "student@test.com",
            "password": "StudentPass123!"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "student@test.com"
    assert "access_token" in response.cookies
    assert "refresh_token" in response.cookies

@pytest.mark.asyncio
async def test_login_invalid_password(client: AsyncClient):
    response = await client.post(
        "/api/v1/auth/login",
        json={
            "email": "student@test.com",
            "password": "WrongPassword123!"
        }
    )
    assert response.status_code == 401
    data = response.json()
    assert data["code"] == "AUTHENTICATION_FAILED"

@pytest.mark.asyncio
async def test_account_lockout(client: AsyncClient):
    email = "lockout.target@test.com"
    # Register target
    reg_res = await client.post(
        "/api/v1/auth/register/student",
        json={
            "email": email,
            "password": "StudentPass123!",
            "confirm_password": "StudentPass123!",
            "full_name": "Lockout Target",
            "student_id_number": "STU-LOCKOUT",
            "accept_terms": True
        }
    )
    token = reg_res.json()["detail"].split(": ")[-1]
    await client.post("/api/v1/auth/verify-email", json={"token": token})

    # Fail 5 times
    for _ in range(5):
        await client.post(
            "/api/v1/auth/login",
            json={"email": email, "password": "WrongPassword123!"}
        )
    # 6th attempt triggers AccountLockedError (429)
    response = await client.post(
        "/api/v1/auth/login",
        json={"email": email, "password": "StudentPass123!"}
    )
    assert response.status_code == 429
    data = response.json()
    assert data["code"] == "ACCOUNT_LOCKED"

@pytest.mark.asyncio
async def test_token_refresh_and_logout(client: AsyncClient):
    # Login
    login_res = await client.post(
        "/api/v1/auth/login",
        json={"email": "student@test.com", "password": "StudentPass123!"}
    )
    assert login_res.status_code == 200

    # Refresh
    refresh_res = await client.post("/api/v1/auth/refresh")
    assert refresh_res.status_code == 200

    # Get /me
    me_res = await client.get("/api/v1/auth/me")
    assert me_res.status_code == 200
    assert me_res.json()["email"] == "student@test.com"

    # Logout
    logout_res = await client.post("/api/v1/auth/logout")
    assert logout_res.status_code == 200

    # Access /me after logout should fail
    me_after = await client.get("/api/v1/auth/me")
    assert me_after.status_code == 401
