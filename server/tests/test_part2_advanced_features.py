import pytest
import uuid
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_feature1_study_plan_flow(client: AsyncClient):
    await client.post(
        "/api/v1/auth/login",
        json={"email": "student@test.com", "password": "StudentPass123!"}
    )

    # 1. Fetch study plan
    res = await client.get("/api/v1/student/study-plan")
    assert res.status_code == 200
    plan_data = res.json()["data"]
    assert "items" in plan_data
    assert len(plan_data["items"]) >= 1

    item_id = plan_data["items"][0]["id"]

    # 2. Complete item
    comp_res = await client.put(f"/api/v1/student/study-plan/item/{item_id}/complete")
    assert comp_res.status_code == 200
    assert comp_res.json()["data"]["status"] == "COMPLETED"

    # 3. Check progress
    prog_res = await client.get("/api/v1/student/study-plan/progress")
    assert prog_res.status_code == 200
    assert prog_res.json()["data"]["completed_items"] >= 1

    # 4. Generate new plan
    gen_res = await client.post("/api/v1/student/study-plan/generate", json={"semester": 1})
    assert gen_res.status_code == 200
    assert "plan_id" in gen_res.json()

@pytest.mark.asyncio
async def test_feature2_benchmarking_flow(client: AsyncClient):
    client.cookies.clear()
    await client.post(
        "/api/v1/auth/login",
        json={"email": "admin@test.com", "password": "AdminPass123!"}
    )

    # 1. Get metrics
    met_res = await client.get("/api/v1/admin/benchmarking/metrics")
    assert met_res.status_code == 200
    assert len(met_res.json()["data"]) >= 4

    # 2. Compare institutions
    comp_res = await client.get("/api/v1/admin/benchmarking/compare")
    assert comp_res.status_code == 200
    assert "comparisons" in comp_res.json()["data"]
    assert "ai_recommendation" in comp_res.json()["data"]

    # 3. Generate report
    rep_res = await client.post("/api/v1/admin/benchmarking/generate-report")
    assert rep_res.status_code == 200
    assert "report_id" in rep_res.json()

@pytest.mark.asyncio
async def test_feature3_knowledge_graph_flow(client: AsyncClient):
    client.cookies.clear()
    await client.post(
        "/api/v1/auth/login",
        json={"email": "student@test.com", "password": "StudentPass123!"}
    )

    dummy_subj_id = str(uuid.uuid4())
    # 1. Subject graph
    graph_res = await client.get(f"/api/v1/knowledge-graph/subject/{dummy_subj_id}")
    assert graph_res.status_code == 200
    graph_data = graph_res.json()["data"]
    assert "nodes" in graph_data
    assert "edges" in graph_data
    assert len(graph_data["nodes"]) >= 3

    # 2. Student gaps
    gaps_res = await client.get("/api/v1/student/knowledge-graph/gaps")
    assert gaps_res.status_code == 200
    assert len(gaps_res.json()["data"]) >= 1

    # 3. Remedial path
    path_res = await client.get("/api/v1/student/knowledge-graph/remedial-path")
    assert path_res.status_code == 200
    assert "remedial_sequence" in path_res.json()["data"]

@pytest.mark.asyncio
async def test_feature4_dropout_prediction_flow(client: AsyncClient):
    client.cookies.clear()
    await client.post(
        "/api/v1/auth/login",
        json={"email": "student@test.com", "password": "StudentPass123!"}
    )

    # 1. Student personal dropout risk
    risk_res = await client.get("/api/v1/student/dropout-risk")
    assert risk_res.status_code == 200
    risk_data = risk_res.json()["data"]
    assert "risk_score" in risk_data
    assert risk_data["risk_level"] in ["LOW", "MEDIUM", "HIGH", "CRITICAL"]

    # 2. Faculty at-risk list
    client.cookies.clear()
    await client.post(
        "/api/v1/auth/login",
        json={"email": "faculty.approved@test.com", "password": "FacultyPass123!"}
    )
    fac_res = await client.get("/api/v1/faculty/dropout-risk/students")
    assert fac_res.status_code == 200
    assert len(fac_res.json()["data"]) >= 1

    # 3. Admin department summary
    client.cookies.clear()
    await client.post(
        "/api/v1/auth/login",
        json={"email": "admin@test.com", "password": "AdminPass123!"}
    )
    admin_res = await client.get("/api/v1/admin/dropout-risk/department")
    assert admin_res.status_code == 200
    assert "retention_rate_projected" in admin_res.json()["data"]

    # 4. Schedule intervention
    intv_res = await client.post(
        "/api/v1/interventions/create",
        json={
            "student_id": str(uuid.uuid4()),
            "intervention_type": "ACADEMIC_COUNSELING",
            "description": "1-on-1 counseling for discrete math attendance"
        }
    )
    assert intv_res.status_code == 200
    assert "intervention_id" in intv_res.json()

@pytest.mark.asyncio
async def test_feature5_parent_portal_flow(client: AsyncClient):
    client.cookies.clear()
    await client.post(
        "/api/v1/auth/login",
        json={"email": "student@test.com", "password": "StudentPass123!"}
    )

    # 1. Parent login
    login_res = await client.post(
        "/api/v1/parent/login",
        json={"phone_or_email": "9876543210", "otp": "123456"}
    )
    assert login_res.status_code == 200
    assert login_res.json()["role"] == "PARENT"

    # 2. Child performance
    perf_res = await client.get("/api/v1/parent/child/performance")
    assert perf_res.status_code == 200
    assert "overall_gpa" in perf_res.json()["data"]
    assert "co_attainment_summary" in perf_res.json()["data"]

    # 3. Child attendance
    att_res = await client.get("/api/v1/parent/child/attendance")
    assert att_res.status_code == 200
    assert "overall_attendance_percentage" in att_res.json()["data"]

    # 4. Notifications
    notif_res = await client.get("/api/v1/parent/notifications")
    assert notif_res.status_code == 200
    assert len(notif_res.json()["data"]) >= 1

    # 5. Message teacher
    msg_res = await client.post(
        "/api/v1/parent/message/teacher",
        json={"message": "Inquiring about upcoming internal assessment preparation."}
    )
    assert msg_res.status_code == 200
    assert "message_id" in msg_res.json()

@pytest.mark.asyncio
async def test_feature6_voice_submission_flow(client: AsyncClient):
    client.cookies.clear()
    await client.post(
        "/api/v1/auth/login",
        json={"email": "student@test.com", "password": "StudentPass123!"}
    )

    # 1. Transcribe voice in English
    trans_res = await client.post(
        "/api/v1/voice/transcribe",
        json={"audio_base64": "UklGRiQAAABXQVZFZm10IBAAAAABAAEA", "language": "en"}
    )
    assert trans_res.status_code == 200
    assert len(trans_res.json()["data"]["transcribed_text"]) > 10

    # 2. Upload voice submission
    upload_res = await client.post(
        "/api/v1/voice/upload",
        json={"audio_base64": "UklGRiQAAABXQVZFZm10IBAAAAABAAEA", "language": "en"}
    )
    assert upload_res.status_code == 200
    sub_id = upload_res.json()["submission_id"]

    # 3. Get submission
    get_res = await client.get(f"/api/v1/voice/submission/{sub_id}")
    assert get_res.status_code == 200
    assert get_res.json()["data"]["id"] == sub_id

@pytest.mark.asyncio
async def test_feature7_plagiarism_detection_flow(client: AsyncClient):
    client.cookies.clear()
    await client.post(
        "/api/v1/auth/login",
        json={"email": "student@test.com", "password": "StudentPass123!"}
    )

    dummy_sub_id = str(uuid.uuid4())
    # 1. Check content
    check_res = await client.post(
        "/api/v1/plagiarism/check",
        json={
            "submission_id": dummy_sub_id,
            "content_text": "A relational database schema normal form removes transitive dependencies."
        }
    )
    assert check_res.status_code == 200
    assert "similarity_score" in check_res.json()

    # 2. Get report
    rep_res = await client.get(f"/api/v1/plagiarism/report/{dummy_sub_id}")
    assert rep_res.status_code == 200
    assert "matched_sources" in rep_res.json()["data"]

    # 3. Faculty flagged queue
    client.cookies.clear()
    await client.post(
        "/api/v1/auth/login",
        json={"email": "faculty.approved@test.com", "password": "FacultyPass123!"}
    )
    flag_res = await client.get("/api/v1/faculty/plagiarism/flagged")
    assert flag_res.status_code == 200
    assert len(flag_res.json()["data"]) >= 1

@pytest.mark.asyncio
async def test_feature8_calendar_flow(client: AsyncClient):
    client.cookies.clear()
    await client.post(
        "/api/v1/auth/login",
        json={"email": "admin@test.com", "password": "AdminPass123!"}
    )

    # 1. Get events
    events_res = await client.get("/api/v1/calendar/events")
    assert events_res.status_code == 200
    assert len(events_res.json()["data"]) >= 1

    # 2. Create event
    create_res = await client.post(
        "/api/v1/calendar/event",
        json={
            "title": "Semester Practical Examination",
            "event_type": "EXAMINATION",
            "start_date": "2026-11-10T09:00:00Z",
            "end_date": "2026-11-15T17:00:00Z",
            "description": "Lab practical assessments"
        }
    )
    assert create_res.status_code == 200
    assert "event_id" in create_res.json()

    # 3. Auto-schedule
    sched_res = await client.post("/api/v1/calendar/auto-schedule", json={"semester": 1})
    assert sched_res.status_code == 200
    assert sched_res.json()["total_slots_scheduled"] >= 1

    # 4. Check conflicts
    conf_res = await client.get("/api/v1/calendar/conflicts")
    assert conf_res.status_code == 200

@pytest.mark.asyncio
async def test_feature9_two_factor_auth_flow(client: AsyncClient):
    client.cookies.clear()
    await client.post(
        "/api/v1/auth/login",
        json={"email": "student@test.com", "password": "StudentPass123!"}
    )

    # 1. Enable 2FA
    enable_res = await client.post("/api/v1/auth/2fa/enable", json={"method": "TOTP"})
    assert enable_res.status_code == 200
    assert "secret" in enable_res.json()
    assert "backup_codes" in enable_res.json()

    # 2. Verify code
    verify_res = await client.post("/api/v1/auth/2fa/verify", json={"code": "123456"})
    assert verify_res.status_code == 200
    assert verify_res.json()["verified"] is True

    # 3. Get backup codes
    backup_res = await client.get("/api/v1/auth/2fa/backup-codes")
    assert backup_res.status_code == 200
    assert len(backup_res.json()["backup_codes"]) >= 1

    # 4. Disable 2FA
    disable_res = await client.post("/api/v1/auth/2fa/disable")
    assert disable_res.status_code == 200
    assert disable_res.json()["disabled"] is True

@pytest.mark.asyncio
async def test_feature10_industry_skills_flow(client: AsyncClient):
    client.cookies.clear()
    await client.post(
        "/api/v1/auth/login",
        json={"email": "student@test.com", "password": "StudentPass123!"}
    )

    # 1. Industry catalog
    skills_res = await client.get("/api/v1/skills/industry")
    assert skills_res.status_code == 200
    assert len(skills_res.json()["data"]) >= 3

    # 2. Student skill profile
    prof_res = await client.get("/api/v1/student/skills/profile")
    assert prof_res.status_code == 200
    assert len(prof_res.json()["data"]) >= 1

    # 3. Skill gaps
    gaps_res = await client.get("/api/v1/student/skills/gaps")
    assert gaps_res.status_code == 200
    assert len(gaps_res.json()["data"]) >= 1

    # 4. Placement readiness
    readiness_res = await client.get("/api/v1/student/placement-readiness")
    assert readiness_res.status_code == 200
    assert "readiness_score" in readiness_res.json()["data"]
    assert "readiness_tier" in readiness_res.json()["data"]
