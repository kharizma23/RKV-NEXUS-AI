import pytest
import io
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_full_multimodal_and_evaluation_flow(client: AsyncClient):
    # 1. Login as Faculty
    faculty_login = await client.post(
        "/api/v1/auth/login",
        json={"email": "faculty.approved@test.com", "password": "FacultyPass123!"}
    )
    assert faculty_login.status_code == 200

    # 2. Test Faculty AI Question Generation (Curriculum / LLM)
    gen_res = await client.post(
        "/api/v1/faculty/exams/generate-ai",
        json={
            "topic": "Distributed Systems & Raft Consensus",
            "count": 2,
            "question_type": "HANDWRITTEN",
            "difficulty": "HARD"
        }
    )
    assert gen_res.status_code == 200
    questions_data = gen_res.json()["questions"]
    assert len(questions_data) == 2
    assert questions_data[0]["question_type"] == "HANDWRITTEN"
    assert "rubric" in questions_data[0]

    # 3. Fetch subjects and institutions
    sub_res = await client.get("/api/v1/academics/subjects")
    assert sub_res.status_code == 200
    subjects = sub_res.json()
    assert len(subjects) > 0
    subject_id = subjects[0]["id"]

    inst_res = await client.get("/api/v1/institutions")
    assert inst_res.status_code == 200
    institutions = inst_res.json()
    assert len(institutions) > 0
    institution_id = institutions[0]["id"]
    department_id = institutions[0]["departments"][0]["id"]

    # 4. Create Examination
    exam_payload = {
        "title": "Autonomous Distributed Systems Midterm",
        "subject_id": subject_id,
        "exam_type": "Midterm",
        "duration_minutes": 90,
        "total_marks": 20.0,
        "description": "Multimodal Bluebook Examination",
        "questions": [
            {
                "prompt": questions_data[0]["prompt"],
                "question_type": "HANDWRITTEN",
                "difficulty": "HARD",
                "marks": 10.0,
                "explanation": "Raft leader election and log replication invariants",
                "rubric": questions_data[0]["rubric"],
                "options": []
            },
            {
                "prompt": "Which normal form removes transitive dependencies?",
                "question_type": "MCQ",
                "difficulty": "EASY",
                "marks": 10.0,
                "explanation": "3NF removes transitive dependencies",
                "rubric": "",
                "options": [
                    {"option_text": "A) 1NF", "is_correct": False},
                    {"option_text": "B) 2NF", "is_correct": False},
                    {"option_text": "C) 3NF", "is_correct": True},
                    {"option_text": "D) BCNF", "is_correct": False}
                ]
            }
        ]
    }
    create_exam_res = await client.post("/api/v1/faculty/exams", json=exam_payload)
    assert create_exam_res.status_code in [200, 201], f"Status: {create_exam_res.status_code}, Body: {create_exam_res.text}"
    created_exam = create_exam_res.json()
    exam_id = created_exam["id"]

    # 5. Assign Exam to Department
    assign_res = await client.post(
        f"/api/v1/faculty/exams/{exam_id}/assign",
        json={
            "institution_id": institution_id,
            "department_id": department_id,
            "assign_to": "Entire Class",
            "start_time": "2026-08-01T09:00:00Z",
            "end_time": "2026-08-30T18:00:00Z"
        }
    )
    assert assign_res.status_code == 200

    # 6. Login as Student
    client.cookies.clear()
    student_login = await client.post(
        "/api/v1/auth/login",
        json={"email": "student@test.com", "password": "StudentPass123!"}
    )
    assert student_login.status_code == 200

    # 7. Student retrieves assigned exam details
    detail_res = await client.get(f"/api/v1/student/exams/{exam_id}")
    assert detail_res.status_code == 200
    exam_detail = detail_res.json()
    assert len(exam_detail["questions"]) == 2
    q1_id = exam_detail["questions"][0]["id"]
    q2_id = exam_detail["questions"][1]["id"]

    # 8. Student Uploads Handwritten Answer Sheet
    fake_png_bytes = b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15c4\x00\x00\x00\nIDATx\x9cc\x00\x01\x00\x00\x05\x00\x01\r\n-\xb4\x00\x00\x00\x00IEND\xaeB`\x82"
    files = {"file": ("bluebook_page1.png", fake_png_bytes, "image/png")}
    upload_res = await client.post(
        f"/api/v1/multimodal/upload-handwritten/{exam_id}/{q1_id}",
        files=files
    )
    assert upload_res.status_code == 201
    upload_json = upload_res.json()
    assert upload_json["success"] is True
    assert "extracted_text" in upload_json
    assert len(upload_json["extracted_text"]) > 10

    # 9. Student Submits Exam
    submit_res = await client.post(
        f"/api/v1/student/exams/{exam_id}/submit",
        json={
            "answers": [
                {
                    "question_id": q1_id,
                    "selected_option_text": upload_json["extracted_text"]
                },
                {
                    "question_id": q2_id,
                    "selected_option_text": "C) 3NF"
                }
            ]
        }
    )
    assert submit_res.status_code == 200
    submit_json = submit_res.json()
    assert submit_json["success"] is True
    assert submit_json["marks_obtained"] > 0
    assert len(submit_json["breakdown"]) == 2

    # 10. Student Views Results Scorecard
    results_res = await client.get(f"/api/v1/student/exams/{exam_id}/results")
    assert results_res.status_code == 200
    scorecard = results_res.json()
    assert scorecard["total_marks"] == 20.0
    assert len(scorecard["breakdown"]) == 2
    
    # Check Counterfactual Guidance and OCR script presence
    q1_breakdown = scorecard["breakdown"][0]
    assert q1_breakdown["counterfactual_guidance"] is not None
    assert "✦ Counterfactual Guidance:" in q1_breakdown["rationale"] or len(q1_breakdown["counterfactual_guidance"]) > 10

    # 11. Faculty Reviews Moderation Console Queue
    client.cookies.clear()
    await client.post(
        "/api/v1/auth/login",
        json={"email": "faculty.approved@test.com", "password": "FacultyPass123!"}
    )
    queue_res = await client.get("/api/v1/evaluation/queue/my")
    assert queue_res.status_code == 200
    eval_queue = queue_res.json()
    assert len(eval_queue) > 0

    target_eval = next((item for item in eval_queue if item["attempt"] and str(item["attempt"].get("exam_id") or item["attempt"].get("examination_id")) == str(exam_id)), None)
    assert target_eval is not None
    assert len(target_eval["question_evaluations"]) == 2

    # Verify OCR script details attached
    target_q_eval = target_eval["question_evaluations"][0]
    assert target_q_eval["ocr_script"] is not None
    assert "bounding_boxes" in target_q_eval["ocr_script"]
    assert target_q_eval["counterfactual_guidance"] is not None

    # 12. Faculty Overrides Score
    override_res = await client.patch(
        f"/api/v1/evaluation/override/{target_q_eval['id']}",
        json={
            "faculty_score": 9.5,
            "faculty_feedback": "Excellent leader election formulation and state transition proofs.",
            "override_reason": "Clear Visual / Diagrammatic Evidence"
        }
    )
    assert override_res.status_code == 200
    assert override_res.json()["final_score"] == 9.5

    # 13. Faculty Publishes Final Scores
    publish_res = await client.post(
        f"/api/v1/evaluation/publish/{target_eval['attempt_id']}",
        params={"faculty_notes": "All submissions audited and published."}
    )
    assert publish_res.status_code == 200
    assert publish_res.json()["status"] == "PUBLISHED"
