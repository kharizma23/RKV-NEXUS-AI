import pytest
import uuid
from httpx import AsyncClient

async def login_as(client: AsyncClient, email: str, password: str) -> dict:
    client.cookies.clear()
    res = await client.post("/api/v1/auth/login", json={"email": email, "password": password})
    assert res.status_code == 200, f"Login failed for {email}: {res.text}"
    return res.json()

@pytest.mark.asyncio
async def test_faculty_doubts_endpoints(client: AsyncClient):
    await login_as(client, "faculty.approved@test.com", "FacultyPass123!")

    # 1. GET /api/v1/faculty/doubts
    res = await client.get("/api/v1/faculty/doubts")
    assert res.status_code == 200
    doubts = res.json()
    assert isinstance(doubts, list)
    assert len(doubts) > 0
    first_doubt = doubts[0]
    misconception_id = first_doubt["id"]

    # 2. GET /api/v1/faculty/doubts/{id}/details
    res_details = await client.get(f"/api/v1/faculty/doubts/{misconception_id}/details")
    assert res_details.status_code == 200
    details = res_details.json()
    assert details["concept"] == first_doubt["concept"]
    assert "root_cause" in details
    assert "sample_wrong_answers" in details

    # 3. GET /api/v1/faculty/doubts/{id}/students
    res_students = await client.get(f"/api/v1/faculty/doubts/{misconception_id}/students")
    assert res_students.status_code == 200
    students = res_students.json()
    assert isinstance(students, list)
    assert len(students) > 0
    assert "roll_number" in students[0]

    # 4. GET /api/v1/faculty/doubts/trends
    res_trends = await client.get("/api/v1/faculty/doubts/trends")
    assert res_trends.status_code == 200
    trends = res_trends.json()
    assert "weekly" in trends
    assert "monthly" in trends

    # 5. GET /api/v1/faculty/doubts/section-comparison
    res_comp = await client.get("/api/v1/faculty/doubts/section-comparison")
    assert res_comp.status_code == 200
    comp = res_comp.json()
    assert "section_a" in comp
    assert "section_b" in comp
    assert "comparison" in comp

    # 6. GET /api/v1/faculty/doubts/resolved
    res_resolved = await client.get("/api/v1/faculty/doubts/resolved")
    assert res_resolved.status_code == 200

    # 7. POST /api/v1/faculty/doubts/generate-intervention-plan
    res_plan = await client.post(
        "/api/v1/faculty/doubts/generate-intervention-plan",
        json={"misconception_id": misconception_id, "concept": first_doubt["concept"]}
    )
    assert res_plan.status_code == 200
    plan = res_plan.json()
    assert "plan_text" in plan
    assert "example_problems" in plan

    # 8. POST /api/v1/faculty/doubts/{id}/generate-micro-lesson
    res_lesson = await client.post(f"/api/v1/faculty/doubts/{misconception_id}/generate-micro-lesson")
    assert res_lesson.status_code == 200
    lesson = res_lesson.json()
    assert "concept_explanation" in lesson
    assert "quick_quiz" in lesson

    # 9. POST /api/v1/faculty/doubts/{id}/notify-students
    res_notify = await client.post(
        f"/api/v1/faculty/doubts/{misconception_id}/notify-students",
        json={"message": "Please review this lesson before midterms."}
    )
    assert res_notify.status_code == 200
    notify_data = res_notify.json()
    assert notify_data["status"] == "success"

    # 10. POST /api/v1/faculty/remedial/schedule
    res_sched = await client.post(
        "/api/v1/faculty/remedial/schedule",
        json={
            "misconception_id": misconception_id,
            "title": "Remedial Clinic: Concurrency Control",
            "duration": 60,
            "student_ids": [students[0]["id"]]
        }
    )
    assert res_sched.status_code == 201

    # 11. GET /api/v1/faculty/remedial/upcoming
    res_up = await client.get("/api/v1/faculty/remedial/upcoming")
    assert res_up.status_code == 200
    upcoming = res_up.json()
    assert len(upcoming) > 0

    # 12. GET /api/v1/faculty/doubts/export
    res_exp = await client.get("/api/v1/faculty/doubts/export?format=pdf")
    assert res_exp.status_code == 200
    exp_data = res_exp.json()
    assert "total_bottlenecks" in exp_data

    # 13. POST /api/v1/faculty/doubts/export
    res_exp_post = await client.post(
        "/api/v1/faculty/doubts/export",
        json={"format": "excel", "recipients": ["hod@platform.edu"]}
    )
    assert res_exp_post.status_code == 200
    assert res_exp_post.json()["status"] == "success"

    # 14. GET /api/v1/faculty/doubts/stats
    res_stats = await client.get("/api/v1/faculty/doubts/stats")
    assert res_stats.status_code == 200
    stats_data = res_stats.json()
    assert "dominant_bottlenecks" in stats_data
    assert "affected_student_instances" in stats_data
    assert "recommended_lecture_focus" in stats_data
    assert "resolved_historical_doubts" in stats_data
    assert stats_data["dominant_bottlenecks"] >= 1
    assert stats_data["affected_student_instances"] >= 1

    # 15. PUT /api/v1/faculty/doubts/{id}/resolve
    res_resolve = await client.put(
        f"/api/v1/faculty/doubts/{misconception_id}/resolve",
        json={"resolution_notes": "Completed live SQL transaction demonstration."}
    )
    assert res_resolve.status_code == 200
    resolve_data = res_resolve.json()
    assert resolve_data["status"] == "success"
