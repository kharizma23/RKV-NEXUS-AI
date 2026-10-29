import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_explainable_assessment_flow(client: AsyncClient):
    # 1. Login as Student
    student_login = await client.post(
        "/api/v1/auth/login",
        json={"email": "student@test.com", "password": "StudentPass123!"}
    )
    assert student_login.status_code == 200

    # 2. Fetch Published Exams
    exam_res = await client.get("/api/v1/examinations/published")
    assert exam_res.status_code == 200
    exams = exam_res.json()
    assert len(exams) > 0
    exam_id = exams[0]["id"]

    # 3. Faculty Validate Paper Quality Gate
    faculty_login = await client.post(
        "/api/v1/auth/login",
        json={"email": "faculty.approved@test.com", "password": "FacultyPass123!"}
    )
    assert faculty_login.status_code == 200

    val_res = await client.post(f"/api/v1/examinations/{exam_id}/validate-quality")
    assert val_res.status_code == 201
    quality_report = val_res.json()
    assert "overall_score" in quality_report

    # 4. Fetch Quality Report
    rep_res = await client.get(f"/api/v1/examinations/{exam_id}/quality-report")
    assert rep_res.status_code == 200

    # 5. Fetch Evidence and Counterfactual
    fake_eval_id = exam_id
    ev_res = await client.get(f"/api/v1/evaluation/{fake_eval_id}/evidence")
    assert ev_res.status_code == 200
    assert len(ev_res.json()) > 0

    cf_res = await client.get(f"/api/v1/evaluation/{fake_eval_id}/counterfactual")
    assert cf_res.status_code == 200
    assert "target_score" in cf_res.json()

    # 6. Student Submit Grade Review Appeal
    client.cookies.clear()
    await client.post(
        "/api/v1/auth/login",
        json={"email": "student@test.com", "password": "StudentPass123!"}
    )
    gr_res = await client.post(
        "/api/v1/grade-reviews",
        json={
            "attempt_id": exam_id,
            "question_id": exam_id,
            "review_category": "MISSING_EVIDENCE",
            "explanation": "Test grade review request"
        }
    )
    assert gr_res.status_code == 201
    review_id = gr_res.json()["id"]

    # 7. Faculty Decide Grade Review
    client.cookies.clear()
    await client.post(
        "/api/v1/auth/login",
        json={"email": "faculty.approved@test.com", "password": "FacultyPass123!"}
    )
    dec_res = await client.patch(
        f"/api/v1/grade-reviews/{review_id}/decide",
        json={"status": "ACCEPTED", "faculty_decision_reason": "Approved after re-checking rubric"}
    )
    assert dec_res.status_code == 200
    assert dec_res.json()["status"] == "ACCEPTED"
