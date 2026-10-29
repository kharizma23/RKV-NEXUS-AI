import pytest
import uuid
from datetime import datetime, UTC, timedelta
from httpx import AsyncClient

async def login_as(client: AsyncClient, email: str, password: str) -> dict:
    client.cookies.clear()
    res = await client.post("/api/v1/auth/login", json={"email": email, "password": password})
    assert res.status_code == 200, f"Login failed for {email}: {res.text}"
    return res.json()

@pytest.mark.asyncio
async def test_feature_1_doubt_detection(client: AsyncClient):
    # Student sees doubts and micro-lessons
    stud = await login_as(client, "student@test.com", "StudentPass123!")
    res = await client.get("/api/v1/student/doubts")
    assert res.status_code == 200
    doubts = res.json()
    assert isinstance(doubts, list)
    assert len(doubts) >= 1
    doubt_id = doubts[0]["id"]
    assert "micro_lessons" in doubts[0]
    assert len(doubts[0]["micro_lessons"]) >= 1

    # Student resolves doubt
    res_resolve = await client.post(f"/api/v1/student/doubts/{doubt_id}/resolve", json={"notes": "Mastered logarithmic recurrence bounds."})
    assert res_resolve.status_code == 200

    # Faculty class doubts
    await login_as(client, "faculty.approved@test.com", "FacultyPass123!")
    res_fac = await client.get("/api/v1/faculty/doubts/class")
    assert res_fac.status_code == 200
    assert len(res_fac.json()) >= 1

    # Admin doubts overview
    await login_as(client, "admin@test.com", "AdminPass123!")
    res_adm = await client.get("/api/v1/admin/doubts/overview")
    assert res_adm.status_code == 200
    data = res_adm.json()
    assert "total_doubts_detected" in data
    assert "resolution_rate" in data

@pytest.mark.asyncio
async def test_feature_2_student_360_profile(client: AsyncClient):
    # Student views their own 360 profile
    stud = await login_as(client, "student@test.com", "StudentPass123!")
    student_id = stud.get("user", {}).get("id") or stud.get("id")
    res = await client.get("/api/v1/student/profile/360")
    assert res.status_code == 200
    profile = res.json()
    assert "academic_score" in profile
    assert "radar_dimensions" in profile
    assert "ai_summary" in profile

    # Faculty views student's 360 profile
    await login_as(client, "faculty.approved@test.com", "FacultyPass123!")
    res_fac = await client.get(f"/api/v1/faculty/student/{profile['student_id']}/profile/360")
    assert res_fac.status_code == 200
    assert res_fac.json()["student_id"] == profile["student_id"]

    # Admin overview
    await login_as(client, "admin@test.com", "AdminPass123!")
    res_adm = await client.get("/api/v1/admin/profiles/overview")
    assert res_adm.status_code == 200
    adm_data = res_adm.json()
    assert "cohort_average_academic" in adm_data

    # Parent views child profile
    res_parent = await client.get(f"/api/v1/parent/child/profile/360?child_id={profile['student_id']}")
    assert res_parent.status_code == 200
    assert "attendance_rate" in res_parent.json()

@pytest.mark.asyncio
async def test_admin_student_360_inspection_and_recalculate(client: AsyncClient):
    # 1. Admin searches students autocomplete
    await login_as(client, "admin@test.com", "AdminPass123!")
    res_search = await client.get("/api/v1/admin/students/search?q=student")
    assert res_search.status_code == 200
    students_list = res_search.json()
    assert isinstance(students_list, list)

    # 2. Admin inspects profile with active scholar (empty search)
    res_active = await client.get("/api/v1/admin/students/profile-360")
    assert res_active.status_code == 200
    active_profile = res_active.json()
    assert "student_id" in active_profile
    assert "academic_score" in active_profile
    assert "attendance_rate" in active_profile
    assert "wellness_index" in active_profile
    assert "skill_score" in active_profile
    assert "placement_readiness" in active_profile
    assert "composite_score" in active_profile
    assert "ai_summary" in active_profile
    assert "radar_dimensions" in active_profile
    valid_uuid = active_profile["student_id"]

    # 3. Admin inspects profile with valid student UUID
    res_uuid = await client.get(f"/api/v1/admin/students/{valid_uuid}/profile-360")
    assert res_uuid.status_code == 200
    profile_data = res_uuid.json()
    assert profile_data["student_id"] == valid_uuid
    assert profile_data["academic_score"] == 88.5 or profile_data["academic_score"] > 0
    assert profile_data["composite_score"] > 0

    # 4. Admin enters invalid UUID format -> 400
    res_invalid = await client.get("/api/v1/admin/students/invalid-uuid-format/profile-360")
    assert res_invalid.status_code == 400
    assert "Invalid Student UUID format" in res_invalid.json()["detail"]

    # 5. Admin enters non-existent UUID -> 404
    non_existent = "00000000-0000-0000-0000-000000000000"
    res_not_found = await client.get(f"/api/v1/admin/students/{non_existent}/profile-360")
    assert res_not_found.status_code == 404
    assert f"Student not found with ID: {non_existent}" in res_not_found.json()["detail"]

    # 6. Admin recalculates 360 profile
    res_recalc = await client.post(f"/api/v1/admin/students/{valid_uuid}/profile-360/recalculate")
    assert res_recalc.status_code == 200
    recalc_data = res_recalc.json()
    assert recalc_data["student_id"] == valid_uuid
    assert "composite_score" in recalc_data
    assert "ai_summary" in recalc_data

@pytest.mark.asyncio
async def test_feature_3_revision_scheduler(client: AsyncClient):
    # Student retrieves revision schedule
    await login_as(client, "student@test.com", "StudentPass123!")
    res = await client.get("/api/v1/student/revision-schedule")
    assert res.status_code == 200
    schedules = res.json()
    assert len(schedules) >= 1
    sched_id = schedules[0]["id"]
    assert "reminders" in schedules[0]

    # Student completes revision
    res_comp = await client.post(f"/api/v1/student/revision/{sched_id}/complete")
    assert res_comp.status_code == 200
    assert res_comp.json()["status"] == "success"

    # Faculty views class trends
    await login_as(client, "faculty.approved@test.com", "FacultyPass123!")
    res_fac = await client.get("/api/v1/faculty/revision/class")
    assert res_fac.status_code == 200
    assert "average_completion_rate" in res_fac.json()

    # Admin analytics
    await login_as(client, "admin@test.com", "AdminPass123!")
    res_adm = await client.get("/api/v1/admin/revision/analytics")
    assert res_adm.status_code == 200
    assert "total_scheduled" in res_adm.json()

@pytest.mark.asyncio
async def test_feature_4_lecture_summarizer(client: AsyncClient):
    # Faculty uploads lecture
    await login_as(client, "faculty.approved@test.com", "FacultyPass123!")
    upload_res = await client.post(
        "/api/v1/faculty/lectures/upload",
        json={
            "title": "Quantum Error Correction & Surface Codes",
            "video_url": "https://storage.rkvnexus.edu/lectures/quantum-ec-surface.mp4"
        }
    )
    assert upload_res.status_code == 200
    lecture_id = upload_res.json()["lecture_id"]

    # Faculty summarizes lecture
    sum_res = await client.post(f"/api/v1/faculty/lectures/{lecture_id}/summarize")
    assert sum_res.status_code == 200
    sum_data = sum_res.json()
    assert "summary_text" in sum_data
    assert len(sum_data["key_points"]) >= 1
    assert len(sum_data["mcqs"]) >= 1

    # Student views summary and MCQs
    await login_as(client, "student@test.com", "StudentPass123!")
    stud_sum = await client.get(f"/api/v1/student/lectures/{lecture_id}/summary")
    assert stud_sum.status_code == 200
    assert "summary_text" in stud_sum.json()

    stud_mcqs = await client.get(f"/api/v1/student/lectures/{lecture_id}/mcqs")
    assert stud_mcqs.status_code == 200
    assert len(stud_mcqs.json()) >= 1

    # Admin overview
    await login_as(client, "admin@test.com", "AdminPass123!")
    adm_lec = await client.get("/api/v1/admin/lectures/overview")
    assert adm_lec.status_code == 200
    assert adm_lec.json()["total_lectures"] >= 1

@pytest.mark.asyncio
async def test_feature_5_faculty_performance(client: AsyncClient):
    # Faculty views my performance
    await login_as(client, "faculty.approved@test.com", "FacultyPass123!")
    res_my = await client.get("/api/v1/faculty/performance/my")
    assert res_my.status_code == 200
    my_data = res_my.json()
    assert "performance_index" in my_data
    assert "recommendations" in my_data

    # Admin views all faculty performance
    await login_as(client, "admin@test.com", "AdminPass123!")
    res_adm = await client.get("/api/v1/admin/faculty/performance")
    assert res_adm.status_code == 200
    assert len(res_adm.json()) >= 1

    # Admin compares faculty
    res_cmp = await client.get("/api/v1/admin/faculty/performance/compare")
    assert res_cmp.status_code == 200
    assert "rankings" in res_cmp.json()

@pytest.mark.asyncio
async def test_feature_6_qr_attendance(client: AsyncClient):
    # Faculty generates attendance session
    await login_as(client, "faculty.approved@test.com", "FacultyPass123!")
    res_sess = await client.post(
        "/api/v1/faculty/attendance/session",
        json={"valid_minutes": 20}
    )
    assert res_sess.status_code == 200
    sess_id = res_sess.json()["session_id"]
    qr_code = res_sess.json()["qr_code"]

    # Faculty gets session QR
    res_qr = await client.get(f"/api/v1/faculty/attendance/{sess_id}/qr")
    assert res_qr.status_code == 200
    assert res_qr.json()["qr_code"] == qr_code

    # Student scans QR code
    await login_as(client, "student@test.com", "StudentPass123!")
    res_scan = await client.post(
        "/api/v1/student/attendance/scan",
        json={"qr_code": qr_code, "latitude": 12.9716, "longitude": 77.5946}
    )
    assert res_scan.status_code == 200
    assert res_scan.json()["status"] in ["RECORDED", "marked"]

    # Admin attendance overview
    await login_as(client, "admin@test.com", "AdminPass123!")
    res_adm = await client.get("/api/v1/admin/attendance/overview")
    assert res_adm.status_code == 200
    assert "total_records_today" in res_adm.json()

@pytest.mark.asyncio
async def test_feature_7_digital_portfolio(client: AsyncClient):
    # Student views portfolio
    stud = await login_as(client, "student@test.com", "StudentPass123!")
    res = await client.get("/api/v1/student/portfolio")
    assert res.status_code == 200
    port = res.json()
    assert "public_url" in port

    # Student adds item
    res_add = await client.post(
        "/api/v1/student/portfolio/item",
        json={
            "item_type": "CERTIFICATION",
            "title": "CKA: Certified Kubernetes Administrator",
            "description": "Demonstrated core mastery of pod networking, control planes, and ingress.",
            "evidence_url": "https://cncf.io/verify/cka-9921"
        }
    )
    assert res_add.status_code == 200
    assert res_add.json()["title"] == "CKA: Certified Kubernetes Administrator"

    # Student publishes portfolio
    res_pub = await client.put(
        "/api/v1/student/portfolio/publish",
        json={"title": "Updated Senior Scholar Portfolio"}
    )
    assert res_pub.status_code == 200

    # Public views portfolio
    res_public = await client.get(f"/api/v1/public/portfolio/{port['public_url']}")
    assert res_public.status_code == 200
    assert res_public.json()["title"] == "Updated Senior Scholar Portfolio"

    # Admin views portfolios
    await login_as(client, "admin@test.com", "AdminPass123!")
    res_adm = await client.get("/api/v1/admin/portfolios/overview")
    assert res_adm.status_code == 200
    assert res_adm.json()["total_portfolios"] >= 1

@pytest.mark.asyncio
async def test_features_8_and_13_exam_variants(client: AsyncClient):
    # Faculty generates variants
    await login_as(client, "faculty.approved@test.com", "FacultyPass123!")
    dummy_exam_id = str(uuid.uuid4())
    res_gen = await client.post(f"/api/v1/faculty/exams/{dummy_exam_id}/generate-variants")
    assert res_gen.status_code == 200
    assert res_gen.json()["variants_count"] == 5

    # Faculty gets variants
    res_var = await client.get(f"/api/v1/faculty/exams/{dummy_exam_id}/variants")
    assert res_var.status_code == 200
    vars_list = res_var.json()
    assert len(vars_list) == 5

    # Faculty assigns variants
    stud = await login_as(client, "student@test.com", "StudentPass123!")
    stud_id = stud.get("user", {}).get("id") or stud.get("id")
    await login_as(client, "faculty.approved@test.com", "FacultyPass123!")
    res_assign = await client.post(
        f"/api/v1/faculty/exams/{dummy_exam_id}/assign-variants",
        json={"student_ids": [stud_id]}
    )
    assert res_assign.status_code == 200
    assert res_assign.json()["assigned_count"] >= 1

    # Student fetches assigned variant
    await login_as(client, "student@test.com", "StudentPass123!")
    res_my_var = await client.get(f"/api/v1/student/exam/{dummy_exam_id}/my-variant")
    assert res_my_var.status_code == 200
    assert "variant_number" in res_my_var.json()
    assert len(res_my_var.json()["questions"]) >= 1

    # Admin variants overview
    await login_as(client, "admin@test.com", "AdminPass123!")
    res_adm = await client.get("/api/v1/admin/exams/variants/overview")
    assert res_adm.status_code == 200
    assert res_adm.json()["total_variants"] >= 5

@pytest.mark.asyncio
async def test_feature_9_career_prediction(client: AsyncClient):
    # Student views career prediction
    await login_as(client, "student@test.com", "StudentPass123!")
    res_pred = await client.get("/api/v1/student/career/prediction")
    assert res_pred.status_code == 200
    pred = res_pred.json()
    assert "predicted_role" in pred
    assert "confidence" in pred

    # Student views recommendations
    res_rec = await client.get("/api/v1/student/career/recommendations")
    assert res_rec.status_code == 200
    assert len(res_rec.json()) >= 1

    # Faculty views trends
    await login_as(client, "faculty.approved@test.com", "FacultyPass123!")
    res_fac = await client.get("/api/v1/faculty/career/class-trends")
    assert res_fac.status_code == 200
    assert "top_projected_careers" in res_fac.json()

    # Admin overview
    await login_as(client, "admin@test.com", "AdminPass123!")
    res_adm = await client.get("/api/v1/admin/career/overview")
    assert res_adm.status_code == 200
    assert "market_readiness_index" in res_adm.json()

@pytest.mark.asyncio
async def test_feature_10_mental_health_alerts(client: AsyncClient):
    # Student views wellness tips
    await login_as(client, "student@test.com", "StudentPass123!")
    res_tips = await client.get("/api/v1/student/mental-health/tips")
    assert res_tips.status_code == 200
    assert len(res_tips.json()) >= 1

    # Faculty views alerts
    await login_as(client, "faculty.approved@test.com", "FacultyPass123!")
    res_alerts = await client.get("/api/v1/faculty/mental-health/alerts")
    assert res_alerts.status_code == 200
    alerts = res_alerts.json()
    assert len(alerts) >= 1
    alert_id = alerts[0]["id"]

    # Counselor intervention
    res_int = await client.post(
        "/api/v1/counselor/intervention",
        json={
            "alert_id": alert_id,
            "notes": "Scheduled 1-on-1 mindfulness session and academic workload adjustment.",
            "scheduled_at": (datetime.now(UTC) + timedelta(days=1)).isoformat()
        }
    )
    assert res_int.status_code == 200
    assert res_int.json()["status"] == "success"

    # Admin wellness overview
    await login_as(client, "admin@test.com", "AdminPass123!")
    res_adm = await client.get("/api/v1/admin/mental-health/overview")
    assert res_adm.status_code == 200
    assert "campus_wellness_index" in res_adm.json()

@pytest.mark.asyncio
async def test_feature_11_inter_college_competitions(client: AsyncClient):
    # Admin creates competition
    await login_as(client, "admin@test.com", "AdminPass123!")
    now = datetime.now(UTC)
    res_create = await client.post(
        "/api/v1/admin/competitions/create",
        json={
            "title": "National Algorithmic & AI Grand Challenge 2026",
            "category": "CO Attainment & Autonomous Systems",
            "start_date": now.isoformat(),
            "end_date": (now + timedelta(days=30)).isoformat(),
            "metrics": [
                {"metric_name": "CO Attainment", "weight": 0.4},
                {"metric_name": "Research Submissions", "weight": 0.3},
                {"metric_name": "Placement Readiness", "weight": 0.3}
            ]
        }
    )
    assert res_create.status_code == 200
    comp_id = res_create.json()["competition_id"]

    # Student views competitions
    await login_as(client, "student@test.com", "StudentPass123!")
    res_comps = await client.get("/api/v1/competitions")
    assert res_comps.status_code == 200
    assert len(res_comps.json()) >= 1

    # Leaderboard
    res_lead = await client.get(f"/api/v1/competitions/{comp_id}/leaderboard")
    assert res_lead.status_code == 200
    assert len(res_lead.json()) >= 1
    assert "RKV" in res_lead.json()[0]["institution_name"]

@pytest.mark.asyncio
async def test_feature_12_smart_content_recommendations(client: AsyncClient):
    # Student views content recommendations
    await login_as(client, "student@test.com", "StudentPass123!")
    res_rec = await client.get("/api/v1/student/content/recommendations")
    assert res_rec.status_code == 200
    recs = res_rec.json()
    assert len(recs) >= 1
    assert "url" in recs[0]

    # Faculty views class recommendations
    await login_as(client, "faculty.approved@test.com", "FacultyPass123!")
    res_fac = await client.get("/api/v1/faculty/content/class-recommendations")
    assert res_fac.status_code == 200
    assert len(res_fac.json()) >= 1

    # Admin curates content
    await login_as(client, "admin@test.com", "AdminPass123!")
    res_cur = await client.post(
        "/api/v1/admin/content/curate",
        json={
            "topic": "Distributed Consensus",
            "content_type": "VIDEO",
            "title": "MIT 6.824: Raft Consensus In-Depth",
            "url": "https://youtube.com/watch?v=RaftLectureMIT",
            "source": "YouTube Academic"
        }
    )
    assert res_cur.status_code == 200
    assert res_cur.json()["status"] == "success"

@pytest.mark.asyncio
async def test_feature_14_digital_id_card(client: AsyncClient):
    # Student gets digital ID
    await login_as(client, "student@test.com", "StudentPass123!")
    res_id = await client.get("/api/v1/student/digital-id")
    assert res_id.status_code == 200
    id_data = res_id.json()
    assert "qr_code" in id_data
    qr_code = id_data["qr_code"]

    # Faculty scans student digital ID
    await login_as(client, "faculty.approved@test.com", "FacultyPass123!")
    res_scan = await client.post("/api/v1/faculty/scan-id", json={"qr_code": qr_code})
    assert res_scan.status_code == 200
    assert res_scan.json()["status"] == "verified"
    assert res_scan.json()["student_name"] is not None

    # Admin views digital IDs
    await login_as(client, "admin@test.com", "AdminPass123!")
    res_adm = await client.get("/api/v1/admin/digital-ids")
    assert res_adm.status_code == 200
    assert res_adm.json()["total_issued"] >= 1

@pytest.mark.asyncio
async def test_feature_15_live_class_engagement(client: AsyncClient):
    # Faculty starts live session
    await login_as(client, "faculty.approved@test.com", "FacultyPass123!")
    res_start = await client.post("/api/v1/faculty/live-session/start", json={})
    assert res_start.status_code == 200
    sess_id = res_start.json()["session_id"]

    # Faculty logs student engagement
    stud = await login_as(client, "student@test.com", "StudentPass123!")
    stud_id = stud.get("user", {}).get("id") or stud.get("id")
    await login_as(client, "faculty.approved@test.com", "FacultyPass123!")
    res_log = await client.post(
        f"/api/v1/faculty/live-session/{sess_id}/engagement",
        json={
            "student_id": stud_id,
            "attention_score": 94.5,
            "interaction_count": 8
        }
    )
    assert res_log.status_code == 200
    assert res_log.json()["attention_score"] == 94.5

    # Student views engagement
    await login_as(client, "student@test.com", "StudentPass123!")
    res_my_eng = await client.get(f"/api/v1/student/live-session/my-engagement?session_id={sess_id}")
    assert res_my_eng.status_code == 200
    assert res_my_eng.json()["attention_score"] == 94.5

    # Admin views live sessions
    await login_as(client, "admin@test.com", "AdminPass123!")
    res_adm = await client.get("/api/v1/admin/live-sessions/overview")
    assert res_adm.status_code == 200
    assert res_adm.json()["total_sessions"] >= 1
