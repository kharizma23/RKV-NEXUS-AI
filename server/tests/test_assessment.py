import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_assessment_core_flow(client: AsyncClient):
    # 1. Login as Faculty
    login_res = await client.post(
        "/api/v1/auth/login",
        json={"email": "faculty.approved@test.com", "password": "FacultyPass123!"}
    )
    assert login_res.status_code == 200

    # 2. Get Subject ID
    inst_res = await client.get("/api/v1/academics/subjects")
    assert inst_res.status_code == 200
    subjects = inst_res.json()
    assert len(subjects) > 0
    subj_id = subjects[0]["id"]

    # 3. Create MCQ Question
    q_res = await client.post(
        "/api/v1/questions",
        json={
            "subject_id": subj_id,
            "question_type": "MCQ",
            "prompt": "What is time complexity of QuickSort average case?",
            "difficulty": "MEDIUM",
            "bloom_level": "ANALYZE",
            "default_marks": 2.0,
            "options": [
                {"option_text": "O(N log N)", "is_correct": True},
                {"option_text": "O(N^2)", "is_correct": False}
            ]
        }
    )
    assert q_res.status_code == 201
    q_id = q_res.json()["id"]

    # 4. Create Blueprint & Published Examination
    bp_res = await client.post(
        "/api/v1/examinations/blueprints",
        json={
            "subject_id": subj_id,
            "title": "DSA Assessment Test Blueprint",
            "total_marks": 2.0,
            "duration_minutes": 30
        }
    )
    assert bp_res.status_code == 201
    bp_id = bp_res.json()["id"]

    exam_res = await client.post(
        "/api/v1/examinations",
        json={
            "subject_id": subj_id,
            "blueprint_id": bp_id,
            "title": "DSA Quick Test Exam",
            "exam_type": "QUIZ",
            "total_marks": 2.0,
            "duration_minutes": 30,
            "start_time": "2025-01-01T00:00:00Z",
            "end_time": "2030-01-01T00:00:00Z",
            "is_published": True
        }
    )
    assert exam_res.status_code == 201
    exam_id = exam_res.json()["id"]

    # 5. Login as Student and Start Attempt
    student_login = await client.post(
        "/api/v1/auth/login",
        json={"email": "student@test.com", "password": "StudentPass123!"}
    )
    assert student_login.status_code == 200

    start_res = await client.post(f"/api/v1/examinations/attempts/start/{exam_id}")
    assert start_res.status_code == 201
    attempt_id = start_res.json()["id"]

    # 6. Save Answer & Submit Exam
    save_res = await client.post(
        f"/api/v1/examinations/attempts/{attempt_id}/save-answer",
        json={
            "question_id": q_id,
            "text_response": "Saved student answer test",
            "is_flagged_for_review": False
        }
    )
    assert save_res.status_code == 200

    submit_res = await client.post(f"/api/v1/examinations/attempts/{attempt_id}/submit")
    assert submit_res.status_code == 200
    assert submit_res.json()["status"] == "SUBMITTED"
