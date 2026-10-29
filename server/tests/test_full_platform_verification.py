import pytest
import uuid
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_complete_platform_verification_flow(client: AsyncClient):
    print("\n--- [START] RKV NEXUS AI COMPLETE PLATFORM VERIFICATION ---")

    # =========================================================================
    # 1. ADMIN DASHBOARD - STATS, SHORTCUTS, SECURITY BUTTONS & LOGS
    # =========================================================================
    print("Step 1: Testing Admin Dashboard Endpoints & Security Actions...")
    admin_login = await client.post(
        "/api/v1/auth/login",
        json={"email": "admin@test.com", "password": "AdminPass123!"}
    )
    assert admin_login.status_code == 200, f"Admin login failed: {admin_login.text}"
    admin_data = admin_login.json()
    assert admin_data["role"] == "ADMIN"

    # 1.1 Dashboard Stats (real DB counts)
    stats_res = await client.get("/api/v1/admin/dashboard/stats")
    assert stats_res.status_code == 200
    stats_json = stats_res.json()
    stats = stats_json.get("data", stats_json)
    assert "totalUsers" in stats
    assert "totalProgrammes" in stats
    assert "students" in stats or "studentsCount" in stats
    assert "faculty" in stats or "facultyCount" in stats

    # 1.2 Predictive Health Score & At-Risk Students
    health_res = await client.get("/api/v1/admin/analytics/predictive-health")
    assert health_res.status_code == 200
    health = health_res.json()
    assert health["score"] >= 0
    assert "student_success_rate" in health

    at_risk_res = await client.get("/api/v1/admin/analytics/at-risk-students")
    assert at_risk_res.status_code == 200
    assert isinstance(at_risk_res.json(), list)

    # 1.3 Security Actions (BLOCK_IP, REVOKE_TOKEN, FLAG_REVIEW)
    block_res = await client.post(
        "/api/v1/admin/security/block-ip",
        json={"ip_address": "192.168.1.100"}
    )
    assert block_res.status_code == 200
    assert block_res.json()["status"] == "success"

    revoke_res = await client.post(
        "/api/v1/admin/security/revoke-token",
        json={"user_id": str(uuid.uuid4())}
    )
    assert revoke_res.status_code == 200
    assert revoke_res.json()["status"] == "success"

    flag_res = await client.post(
        "/api/v1/admin/security/flag-anomaly",
        json={"anomaly_id": "anom-test-1"}
    )
    assert flag_res.status_code == 200
    assert flag_res.json()["status"] == "success"

    # 1.4 Audit Logs Download Endpoint
    audit_res = await client.get("/api/v1/audit-logs?limit=50")
    assert audit_res.status_code == 200
    logs = audit_res.json()
    assert len(logs) >= 3  # block, revoke, flag logged

    # =========================================================================
    # 2. ACADEMIC STRUCTURE & PUBLIC DROPDOWNS
    # =========================================================================
    print("Step 2: Testing Public Institutions, Departments & Programmes Dropdowns...")
    pub_inst = await client.get("/api/v1/public/institutions")
    assert pub_inst.status_code == 200
    institutions = pub_inst.json()
    assert len(institutions) > 0
    target_inst = institutions[0]
    institution_id = target_inst["id"]

    pub_dept = await client.get(f"/api/v1/public/institutions/{institution_id}/departments")
    assert pub_dept.status_code == 200
    departments = pub_dept.json()
    assert len(departments) > 0
    target_dept = departments[0]
    department_id = target_dept["id"]

    pub_prog = await client.get(f"/api/v1/public/institutions/{institution_id}/departments/{department_id}/programmes")
    assert pub_prog.status_code == 200
    programmes = pub_prog.json()
    assert len(programmes) > 0
    target_prog = programmes[0]
    programme_id = target_prog["id"]

    # Retrieve subject
    subjs_res = await client.get("/api/v1/academics/subjects")
    assert subjs_res.status_code == 200
    subjects = subjs_res.json()
    assert len(subjects) > 0
    subject_id = subjects[0]["id"]

    # =========================================================================
    # 3. FACULTY APPROVALS WORKFLOW
    # =========================================================================
    print("Step 3: Testing Faculty Approvals & AI Recommendation Queue...")
    pending_res = await client.get("/api/v1/admin/faculty-approvals?status_filter=PENDING_APPROVAL")
    assert pending_res.status_code == 200
    pending_list = pending_res.json()
    assert len(pending_list) > 0
    pending_fac = pending_list[0]
    pending_fac_id = pending_fac["id"]

    rec_res = await client.get(f"/api/v1/admin/faculty-approvals/{pending_fac_id}/ai-recommendation")
    assert rec_res.status_code == 200
    assert "suitability_score" in rec_res.json()

    approve_res = await client.post(f"/api/v1/admin/faculty-approvals/{pending_fac_id}/approve")
    assert approve_res.status_code == 200

    # =========================================================================
    # 4. STUDENT REGISTRATION FLOW & VALIDATION CHECKS
    # =========================================================================
    print("Step 4: Testing Student Registration & Validation Constraints...")
    client.cookies.clear()

    # 4.1 Duplicate Email Check (against existing seeded student)
    dup_email_payload = {
        "full_name": "Duplicate Student",
        "email": "student@test.com",
        "password": "StudentPassword123!",
        "confirm_password": "StudentPassword123!",
        "student_id_number": f"23CSE{uuid.uuid4().hex[:4].upper()}",
        "institution_id": institution_id,
        "department_id": department_id,
        "programme_id": programme_id,
        "target_batch": "2024-2028",
        "target_semester": 6,
        "accept_terms": True
    }
    dup_email_res = await client.post("/api/v1/auth/register/student", json=dup_email_payload)
    assert dup_email_res.status_code == 409

    # 4.2 Duplicate Roll Number Check
    dup_roll_payload = dict(dup_email_payload)
    dup_roll_payload["email"] = f"newstudent.{uuid.uuid4().hex[:6]}@test.com"
    dup_roll_payload["student_id_number"] = "STU-TEST-001"
    dup_roll_res = await client.post("/api/v1/auth/register/student", json=dup_roll_payload)
    assert dup_roll_res.status_code == 409

    # 4.3 Valid Student Registration
    new_student_email = f"student.rkv.{uuid.uuid4().hex[:6]}@test.com"
    new_student_roll = f"23CSE{uuid.uuid4().hex[:4].upper()}"
    valid_stud_payload = dict(dup_email_payload)
    valid_stud_payload["email"] = new_student_email
    valid_stud_payload["student_id_number"] = new_student_roll

    reg_res = await client.post("/api/v1/auth/register/student", json=valid_stud_payload)
    assert reg_res.status_code == 201

    # Verify email and test login
    resend_res = await client.post("/api/v1/auth/resend-verification", json={"email": new_student_email})
    assert resend_res.status_code == 200
    token_preview = resend_res.json()["detail"].split(": ")[-1]
    verify_res = await client.post("/api/v1/auth/verify-email", json={"token": token_preview})
    assert verify_res.status_code == 200

    login_res = await client.post(
        "/api/v1/auth/login",
        json={"email": new_student_email, "password": "StudentPassword123!"}
    )
    assert login_res.status_code == 200
    assert login_res.json()["role"] == "STUDENT"

    # =========================================================================
    # 5. FACULTY DASHBOARD, EXAM CREATION & AI QUESTION GENERATION
    # =========================================================================
    print("Step 5: Testing Faculty Dashboard & AI Exam Authoring...")
    client.cookies.clear()
    fac_login = await client.post(
        "/api/v1/auth/login",
        json={"email": "faculty.approved@test.com", "password": "FacultyPass123!"}
    )
    assert fac_login.status_code == 200

    # 5.1 Faculty Dashboard Stats & Subjects
    fac_dash = await client.get("/api/v1/faculty/dashboard")
    assert fac_dash.status_code == 200
    fac_subjs = await client.get("/api/v1/faculty/subjects")
    assert fac_subjs.status_code == 200
    assert len(fac_subjs.json()) > 0

    # 5.2 AI Question Generation (Curriculum & LLM backed)
    ai_q_res = await client.post(
        "/api/v1/faculty/exams/generate-ai",
        json={
            "topic": "Distributed Consensus & Raft",
            "count": 2,
            "question_type": "HANDWRITTEN",
            "difficulty": "HARD"
        }
    )
    assert ai_q_res.status_code == 200
    gen_questions = ai_q_res.json()["questions"]
    assert len(gen_questions) >= 1

    # 5.3 Faculty Creates Examination with Subject & Questions
    exam_payload = {
        "title": "Autonomous Systems Mid-Term Evaluation",
        "subject_id": subject_id,
        "exam_type": "Mid-Term",
        "duration_minutes": 60,
        "total_marks": 20.0,
        "description": "Comprehensive Assessment including Handwritten & MCQ",
        "questions": [
            {
                "prompt": gen_questions[0]["prompt"],
                "question_type": "HANDWRITTEN",
                "difficulty": "HARD",
                "marks": 10.0,
                "explanation": "Raft leader election and log replication invariants.",
                "rubric": gen_questions[0].get("rubric", "[{\"criterion\": \"Leader Election\", \"max_score\": 5.0}, {\"criterion\": \"Log Replication\", \"max_score\": 5.0}]"),
                "options": []
            },
            {
                "prompt": "Which normal form removes transitive dependencies in relational database schemas?",
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
    assert create_exam_res.status_code in [200, 201]
    exam_id = create_exam_res.json()["id"]

    # 5.4 Assign Exam to Department
    assign_res = await client.post(
        f"/api/v1/faculty/exams/{exam_id}/assign",
        json={
            "institution_id": institution_id,
            "department_id": department_id,
            "assign_to": "Entire Class",
            "start_time": "2026-01-01T09:00:00Z",
            "end_time": "2026-12-31T18:00:00Z"
        }
    )
    assert assign_res.status_code == 200

    # =========================================================================
    # 6. QUESTION BANK MANAGEMENT
    # =========================================================================
    print("Step 6: Testing Question Bank Management...")
    create_q_res = await client.post(
        "/api/v1/faculty/questions",
        json={
            "subject_id": subject_id,
            "question_text": "What is the time complexity of searching in a balanced B+ Tree of order M?",
            "question_type": "MCQ",
            "marks": 2.0,
            "difficulty": "MEDIUM",
            "bloom_level": "APPLY"
        }
    )
    assert create_q_res.status_code == 200
    q_list_res = await client.get("/api/v1/faculty/questions")
    assert q_list_res.status_code == 200
    assert len(q_list_res.json()) > 0

    # =========================================================================
    # 7. STUDENT DASHBOARD, EXAM ATTEMPT & MULTIMODAL HANDWRITTEN UPLOAD
    # =========================================================================
    print("Step 7: Student Takes Exam, Uploads Handwritten Sheet & Submits...")
    login_stud_res = await client.post(
        "/api/v1/auth/login",
        json={"email": new_student_email, "password": "StudentPassword123!"}
    )
    assert login_stud_res.status_code == 200

    # 7.1 Student Dashboard
    stud_dash = await client.get("/api/v1/student/dashboard")
    assert stud_dash.status_code == 200
    assert "data" in stud_dash.json()

    # 7.2 Retrieve Assigned Exam Questions
    stud_exam = await client.get(f"/api/v1/student/exams/{exam_id}")
    assert stud_exam.status_code == 200
    exam_questions = stud_exam.json()["questions"]
    assert len(exam_questions) == 2
    q_handwritten = exam_questions[0]["id"]
    q_mcq = exam_questions[1]["id"]

    # 7.3 Upload Handwritten Bluebook Script
    dummy_png = b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15c4\x00\x00\x00\nIDATx\x9cc\x00\x01\x00\x00\x05\x00\x01\r\n-\xb4\x00\x00\x00\x00IEND\xaeB`\x82"
    files = {"file": ("bluebook_student_response.png", dummy_png, "image/png")}
    upload_res = await client.post(
        f"/api/v1/multimodal/upload-handwritten/{exam_id}/{q_handwritten}",
        files=files
    )
    assert upload_res.status_code == 201
    upload_data = upload_res.json()
    assert upload_data["success"] is True
    assert "extracted_text" in upload_data

    # 7.4 Submit Complete Exam
    submit_res = await client.post(
        f"/api/v1/student/exams/{exam_id}/submit",
        json={
            "answers": [
                {
                    "question_id": q_handwritten,
                    "selected_option_text": upload_data["extracted_text"]
                },
                {
                    "question_id": q_mcq,
                    "selected_option_text": "C) 3NF"
                }
            ]
        }
    )
    assert submit_res.status_code == 200
    submit_result = submit_res.json()
    assert submit_result["success"] is True
    assert submit_result["marks_obtained"] > 0
    assert len(submit_result["breakdown"]) == 2

    # =========================================================================
    # 8. AI EVALUATION, SCORECARD & COUNTERFACTUAL GUIDANCE
    # =========================================================================
    print("Step 8: Verifying Explainable AI Scorecard & Remedial Learning...")
    scorecard_res = await client.get(f"/api/v1/student/exams/{exam_id}/results")
    assert scorecard_res.status_code == 200
    scorecard = scorecard_res.json()
    assert scorecard["total_marks"] == 20.0
    assert len(scorecard["breakdown"]) == 2

    hw_eval = scorecard["breakdown"][0]
    assert hw_eval["counterfactual_guidance"] is not None

    # Check student learning plan
    plan_res = await client.get("/api/v1/student/learning-plan")
    assert plan_res.status_code == 200
    assert "recommended_modules" in plan_res.json()["data"]

    # =========================================================================
    # 9. FACULTY EVALUATION REVIEW & SCORE OVERRIDE
    # =========================================================================
    print("Step 9: Faculty Reviewing & Moderating Evaluation Queue...")
    client.cookies.clear()
    await client.post(
        "/api/v1/auth/login",
        json={"email": "faculty.approved@test.com", "password": "FacultyPass123!"}
    )

    eval_queue_res = await client.get("/api/v1/faculty/evaluations")
    assert eval_queue_res.status_code == 200
    eval_list = eval_queue_res.json()
    assert len(eval_list) >= 1
    eval_id = eval_list[0]["id"]

    # Faculty overrides marks
    override_res = await client.put(
        f"/api/v1/faculty/evaluations/{eval_id}",
        json={"score": 19.5, "status": "APPROVED"}
    )
    assert override_res.status_code == 200

    # =========================================================================
    # 10. GLOBAL BROADCAST NOTIFICATIONS
    # =========================================================================
    print("Step 10: Testing Communication Broadcast Notifications...")
    client.cookies.clear()
    await client.post(
        "/api/v1/auth/login",
        json={"email": "admin@test.com", "password": "AdminPass123!"}
    )

    broadcast_res = await client.post(
        "/api/v1/notifications/broadcast",
        json={
            "title": "Semester Examination Schedule Released",
            "message": "All students must download hall tickets and verify their enrolled subjects.",
            "category": "ANNOUNCEMENT",
            "priority": "HIGH",
            "recipient_type": "ALL"
        }
    )
    assert broadcast_res.status_code in [200, 201]
    notifs_res = await client.get("/api/v1/notifications")
    assert notifs_res.status_code == 200
    assert any(n["title"] == "Semester Examination Schedule Released" for n in notifs_res.json())

    # =========================================================================
    # 11. AUDIT TRAILS & ANOMALY DETECTIONS
    # =========================================================================
    print("Step 11: Testing Audit Trails & Security Anomaly Intelligence...")
    anomalies_res = await client.get("/api/v1/admin/audit/anomalies")
    assert anomalies_res.status_code == 200
    assert "risk_score" in anomalies_res.json()

    print("\n--- [PASSED] ALL 15 VERIFICATION MILESTONES VERIFIED WITH 100% SUCCESS ---")
