import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_admin_faculty_approval_workflow(client: AsyncClient):
    # 1. Login as Admin
    admin_login = await client.post(
        "/api/v1/auth/login",
        json={"email": "admin@test.com", "password": "AdminPass123!"}
    )
    assert admin_login.status_code == 200

    # 2. Get users list
    users_res = await client.get("/api/v1/admin/users")
    assert users_res.status_code == 200
    users = users_res.json()
    pending_fac = next((u for u in users if u["email"] == "faculty.pending@test.com"), None)
    assert pending_fac is not None

    user_id = pending_fac.get("id") or pending_fac.get("user_id")

    # 3. Approve pending faculty
    approval_res = await client.post(
        f"/api/v1/admin/faculty-approvals/{user_id}/approve"
    )
    assert approval_res.status_code == 200
    assert "approved" in approval_res.json()["message"]

    # 4. Check audit log
    audit_res = await client.get("/api/v1/audit-logs")
    assert audit_res.status_code == 200
    logs = audit_res.json()
    assert any(l["action"] == "FACULTY_APPROVED" for l in logs)

@pytest.mark.asyncio
async def test_unauthorized_user_access_admin_endpoint(client: AsyncClient):
    # Login as Student
    await client.post(
        "/api/v1/auth/login",
        json={"email": "student@test.com", "password": "StudentPass123!"}
    )

    # Attempt admin endpoint
    res = await client.get("/api/v1/admin/users")
    assert res.status_code == 403
    assert res.json()["code"] == "PERMISSION_DENIED"
