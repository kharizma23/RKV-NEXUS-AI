import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_personalized_learning_flow(client: AsyncClient):
    # 1. Login as Student
    student_login = await client.post(
        "/api/v1/auth/login",
        json={"email": "student@test.com", "password": "StudentPass123!"}
    )
    assert student_login.status_code == 200

    # 2. Get Subject ID
    inst_res = await client.get("/api/v1/academics/subjects")
    assert inst_res.status_code == 200
    subjects = inst_res.json()
    assert len(subjects) > 0
    subj_id = subjects[0]["id"]

    # 3. Generate Remedial Learning Plan
    gen_res = await client.post(f"/api/v1/learning-plan/generate/{subj_id}")
    assert gen_res.status_code == 201
    plan_data = gen_res.json()
    assert plan_data["subject_id"] == subj_id
    assert "weak_topics" in plan_data

    # 4. Fetch Student Remedial Plan
    my_plan = await client.get(f"/api/v1/learning-plan/my?subject_id={subj_id}")
    assert my_plan.status_code == 200
    assert my_plan.json()["id"] == plan_data["id"]

    # 5. Login as Faculty and Fetch CO Attainment Analytics
    faculty_login = await client.post(
        "/api/v1/auth/login",
        json={"email": "faculty.approved@test.com", "password": "FacultyPass123!"}
    )
    assert faculty_login.status_code == 200

    co_res = await client.get(f"/api/v1/analytics/co-attainment/{subj_id}")
    assert co_res.status_code == 200
