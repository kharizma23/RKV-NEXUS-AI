import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_evaluation_engine_flow(client: AsyncClient):
    # 1. Login as Student and Start Attempt
    student_login = await client.post(
        "/api/v1/auth/login",
        json={"email": "student@test.com", "password": "StudentPass123!"}
    )
    assert student_login.status_code == 200

    # Get Published Exam
    exam_res = await client.get("/api/v1/examinations/published")
    assert exam_res.status_code == 200
    exams = exam_res.json()
    assert len(exams) > 0
    exam_id = exams[0]["id"]

    start_res = await client.post(f"/api/v1/examinations/attempts/start/{exam_id}")
    assert start_res.status_code == 201
    attempt_id = start_res.json()["id"]

    # 2. Grade Attempt via AI Evaluation Service
    grade_res = await client.post(f"/api/v1/evaluation/grade-attempt/{attempt_id}")
    assert grade_res.status_code == 200
    eval_data = grade_res.json()
    assert eval_data["status"] == "PUBLISHED"
    assert "grade" in eval_data

    # 3. Fetch Student Published Results
    my_results = await client.get("/api/v1/evaluation/results/my")
    assert my_results.status_code == 200
    results = my_results.json()
    assert len(results) > 0
