import pytest
import uuid
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_feature1_blockchain_certificates(client: AsyncClient):
    # 1. Login as Admin
    client.cookies.clear()
    login_admin = await client.post(
        "/api/v1/auth/login",
        json={"email": "admin@test.com", "password": "AdminPass123!"}
    )
    assert login_admin.status_code == 200

    # 2. Login as student to get student ID
    client.cookies.clear()
    login_student = await client.post(
        "/api/v1/auth/login",
        json={"email": "student@test.com", "password": "StudentPass123!"}
    )
    assert login_student.status_code == 200
    student_id = login_student.json()["id"]

    # 3. Switch back to admin and issue certificate
    client.cookies.clear()
    await client.post(
        "/api/v1/auth/login",
        json={"email": "admin@test.com", "password": "AdminPass123!"}
    )

    issue_res = await client.post(
        "/api/v1/certificates/issue",
        json={
            "student_id": student_id,
            "custom_metadata": {
                "degree": "B.Tech Computer Science & Engineering",
                "cgpa": 9.42,
                "honors": "Summa Cum Laude"
            }
        }
    )
    assert issue_res.status_code == 200
    issue_data = issue_res.json()["data"]
    cert_id = issue_data["id"]
    cert_hash = issue_data["certificate_hash"]
    tx_hash = issue_data["blockchain_tx_hash"]
    assert cert_hash is not None
    assert tx_hash.startswith("0x")

    # 4. Public verification by hash (no authentication needed)
    client.cookies.clear()
    verify_res = await client.get(f"/api/v1/certificates/verify/{cert_hash}")
    assert verify_res.status_code == 200
    v_data = verify_res.json()["data"]
    assert v_data["is_valid"] is True
    assert v_data["status"] == "VALID"
    assert v_data["blockchain_proof"]["blockchain_tx_hash"] == tx_hash
    assert "Polygon" in v_data["blockchain_proof"]["network"]

    # 5. Invalid hash returns 404
    invalid_res = await client.get("/api/v1/certificates/verify/deadbeefdeadbeef000011112222333344445555666677778888999900001111")
    assert invalid_res.status_code == 404

    # 6. Student view certificates
    await client.post(
        "/api/v1/auth/login",
        json={"email": "student@test.com", "password": "StudentPass123!"}
    )
    stu_certs = await client.get("/api/v1/student/certificates")
    assert stu_certs.status_code == 200
    assert len(stu_certs.json()["data"]) >= 1

    # 7. Admin revokes certificate
    client.cookies.clear()
    await client.post(
        "/api/v1/auth/login",
        json={"email": "admin@test.com", "password": "AdminPass123!"}
    )
    revoke_res = await client.post(
        f"/api/v1/certificates/revoke/{cert_id}",
        json={"reason": "Audit verification revocation test"}
    )
    assert revoke_res.status_code == 200

    # 8. Re-verify revoked certificate
    client.cookies.clear()
    reverify_res = await client.get(f"/api/v1/certificates/verify/{cert_hash}")
    assert reverify_res.status_code == 200
    assert reverify_res.json()["data"]["is_valid"] is False
    assert reverify_res.json()["data"]["status"] == "REVOKED"


@pytest.mark.asyncio
async def test_feature2_student_wellness(client: AsyncClient):
    client.cookies.clear()
    await client.post(
        "/api/v1/auth/login",
        json={"email": "student@test.com", "password": "StudentPass123!"}
    )

    # 1. Normal daily check-in
    checkin1 = await client.post(
        "/api/v1/wellness/checkin",
        json={
            "mood_score": 8,
            "stress_level": 3,
            "sleep_hours": 7.5,
            "notes": "Feeling great after algorithms lecture",
            "is_anonymous": False
        }
    )
    assert checkin1.status_code == 200
    assert checkin1.json()["data"]["wellness_score"] >= 70.0
    assert checkin1.json()["data"]["alert"] is None

    # 2. High-stress check-in triggers automated alert
    checkin2 = await client.post(
        "/api/v1/wellness/checkin",
        json={
            "mood_score": 2,
            "stress_level": 9,
            "sleep_hours": 3.5,
            "notes": "Overwhelmed with submissions",
            "is_anonymous": False
        }
    )
    assert checkin2.status_code == 200
    assert checkin2.json()["data"]["alert"] is not None
    assert checkin2.json()["data"]["alert"]["severity"] in ["HIGH", "CRITICAL"]

    # 3. Get student wellness history
    hist_res = await client.get("/api/v1/wellness/history")
    assert hist_res.status_code == 200
    assert len(hist_res.json()["data"]) >= 2

    # 4. Get student alerts
    alert_res = await client.get("/api/v1/wellness/alerts")
    assert alert_res.status_code == 200
    assert len(alert_res.json()["data"]) >= 1

    # 5. Schedule counselor session
    sched_res = await client.post(
        "/api/v1/wellness/counselor/schedule",
        json={
            "scheduled_at": "2026-10-10T14:30:00Z",
            "notes": "Discuss academic workload balance"
        }
    )
    assert sched_res.status_code == 200
    assert sched_res.json()["data"]["status"] == "SCHEDULED"

    # 6. Admin wellness overview
    client.cookies.clear()
    await client.post(
        "/api/v1/auth/login",
        json={"email": "admin@test.com", "password": "AdminPass123!"}
    )
    overview_res = await client.get("/api/v1/admin/wellness/overview")
    assert overview_res.status_code == 200
    assert overview_res.json()["data"]["total_checkins"] >= 2
    assert "overall_campus_wellness_index" in overview_res.json()["data"]


@pytest.mark.asyncio
async def test_feature3_ar_vr_exams(client: AsyncClient):
    client.cookies.clear()
    await client.post(
        "/api/v1/auth/login",
        json={"email": "student@test.com", "password": "StudentPass123!"}
    )

    # 1. List VR exams
    exams_res = await client.get("/api/v1/vr/exams")
    assert exams_res.status_code == 200
    exams = exams_res.json()["data"]
    assert len(exams) >= 1
    vr_exam_id = exams[0]["id"]

    # 2. Get specific VR exam
    detail_res = await client.get(f"/api/v1/vr/exams/{vr_exam_id}")
    assert detail_res.status_code == 200
    assert "vr_scene_url" in detail_res.json()["data"]

    # 3. Start attempt
    start_res = await client.post(
        "/api/v1/vr/attempt/start",
        json={"vr_exam_id": vr_exam_id}
    )
    assert start_res.status_code == 200
    attempt_id = start_res.json()["data"]["attempt_id"]

    # 4. Submit attempt with telemetry log
    submit_res = await client.post(
        "/api/v1/vr/attempt/submit",
        json={
            "attempt_id": attempt_id,
            "interaction_log": {
                "milestones_completed": 5,
                "safety_compliance": 15.0,
                "precision_accuracy": 14.5,
                "telemetry": [{"event": "laser_aligned", "timestamp": "00:04:12"}]
            }
        }
    )
    assert submit_res.status_code == 200
    assert submit_res.json()["data"]["score"] >= 80.0
    assert submit_res.json()["data"]["passed"] is True

    # 5. Get attempt results
    results_res = await client.get(f"/api/v1/vr/attempt/results?exam_id={vr_exam_id}")
    assert results_res.status_code == 200
    assert len(results_res.json()["data"]) >= 1

    # 6. Faculty creates VR scene
    client.cookies.clear()
    await client.post(
        "/api/v1/auth/login",
        json={"email": "faculty.approved@test.com", "password": "FacultyPass123!"}
    )
    create_scene_res = await client.post(
        "/api/v1/vr/exams",
        json={
            "title": "Superconducting Quantum Bit Manipulation Lab",
            "vr_scene_url": "https://rkv-nexus.edu/vr/scenes/qubit-v1",
            "duration_minutes": 50,
            "experiment_type": "QUANTUM_PHYSICS"
        }
    )
    assert create_scene_res.status_code == 200


@pytest.mark.asyncio
async def test_feature4_global_benchmarking(client: AsyncClient):
    client.cookies.clear()
    await client.post(
        "/api/v1/auth/login",
        json={"email": "admin@test.com", "password": "AdminPass123!"}
    )

    # 1. Universities list
    unis_res = await client.get("/api/v1/global/universities")
    assert unis_res.status_code == 200
    unis = unis_res.json()["data"]
    assert len(unis) >= 5
    assert any("MIT" in u["name"] or "Stanford" in u["name"] for u in unis)

    # 2. Benchmarking comparison & gaps
    bench_res = await client.get("/api/v1/admin/global-benchmarking")
    assert bench_res.status_code == 200
    b_data = bench_res.json()["data"]
    assert "metrics" in b_data
    assert len(b_data["metrics"]) >= 3

    # 3. Generate report
    report_res = await client.post("/api/v1/admin/global-benchmarking/generate-report")
    assert report_res.status_code == 200
    assert "report_id" in report_res.json()["data"]
    assert "executive_summary" in report_res.json()["data"]

    # 4. Best practices
    bp_res = await client.get("/api/v1/global/best-practices")
    assert bp_res.status_code == 200
    assert len(bp_res.json()["data"]) >= 3


@pytest.mark.asyncio
async def test_feature5_alumni_tracker(client: AsyncClient):
    client.cookies.clear()
    await client.post(
        "/api/v1/auth/login",
        json={"email": "student@test.com", "password": "StudentPass123!"}
    )

    # 1. Alumni directory
    dir_res = await client.get("/api/v1/alumni")
    assert dir_res.status_code == 200
    alumni_list = dir_res.json()["data"]
    assert len(alumni_list) >= 1

    # 2. Register current student as alumni
    reg_res = await client.post(
        "/api/v1/alumni/register",
        json={
            "graduation_year": 2024,
            "current_company": "Anthropic AI",
            "job_role": "Member of Technical Staff",
            "package": 52.0,
            "linkedin_url": "https://linkedin.com/in/student-ai-research",
            "domain": "AI_ML",
            "feedback_notes": "Reinforce vector search and Transformer multi-head attention."
        }
    )
    assert reg_res.status_code == 200
    alumni_id = reg_res.json()["data"]["id"]

    # 3. Individual alumni profile
    profile_res = await client.get(f"/api/v1/alumni/{alumni_id}")
    assert profile_res.status_code == 200
    assert profile_res.json()["data"]["current_company"] == "Anthropic AI"

    # 4. Admin analytics
    client.cookies.clear()
    await client.post(
        "/api/v1/auth/login",
        json={"email": "admin@test.com", "password": "AdminPass123!"}
    )
    analytics_res = await client.get("/api/v1/admin/alumni/analytics")
    assert analytics_res.status_code == 200
    assert analytics_res.json()["data"]["total_alumni_tracked"] >= 1

    # 5. CO-Career mapping
    co_res = await client.get("/api/v1/admin/alumni/co-mapping")
    assert co_res.status_code == 200
    assert len(co_res.json()["data"]["co_impact_rankings"]) >= 3


@pytest.mark.asyncio
async def test_feature6_question_calibration(client: AsyncClient):
    client.cookies.clear()
    await client.post(
        "/api/v1/auth/login",
        json={"email": "faculty.approved@test.com", "password": "FacultyPass123!"}
    )

    # 1. Run calibration batch
    cal_res = await client.post(
        "/api/v1/questions/calibrate",
        json={"batch_id": "BATCH-2026-CSE-MID"}
    )
    assert cal_res.status_code == 200

    # 2. Get calibration list
    list_res = await client.get("/api/v1/questions/calibration")
    assert list_res.status_code == 200
    items = list_res.json()["data"]

    # 3. Get flagged questions
    flag_res = await client.get("/api/v1/questions/flagged")
    assert flag_res.status_code == 200
    flags = flag_res.json()["data"]

    # 4. Replace flagged question if any exist
    if flags:
        target_qid = flags[0]["question_id"]
        replace_res = await client.post(f"/api/v1/questions/{target_qid}/replace")
        assert replace_res.status_code == 200
        assert replace_res.json()["data"]["status"] == "REPLACED"


@pytest.mark.asyncio
async def test_feature7_seating_arrangement(client: AsyncClient):
    client.cookies.clear()
    await client.post(
        "/api/v1/auth/login",
        json={"email": "faculty.approved@test.com", "password": "FacultyPass123!"}
    )

    # 1. Get halls
    halls_res = await client.get("/api/v1/seating/halls")
    assert halls_res.status_code == 200
    halls = halls_res.json()["data"]
    assert len(halls) >= 1
    hall_id = halls[0]["id"]

    # 2. Get existing exam
    exam_res = await client.get("/api/v1/examinations/published")
    assert exam_res.status_code == 200
    exams = exam_res.json()
    assert len(exams) >= 1
    exam_id = exams[0]["id"]

    # 3. Add constraint
    const_res = await client.post(
        "/api/v1/seating/constraints",
        json={
            "exam_id": exam_id,
            "constraint_type": "SEPARATE_STUDENTS",
            "reason": "Previous collusion flag in practice quiz"
        }
    )
    assert const_res.status_code == 200

    # 4. Generate seating arrangement
    gen_res = await client.post(
        "/api/v1/seating/generate",
        json={"exam_id": exam_id, "hall_id": hall_id}
    )
    assert gen_res.status_code == 200
    assert gen_res.json()["data"]["total_assigned"] >= 1

    # 5. Get seating list
    seat_res = await client.get(f"/api/v1/seating/{exam_id}")
    assert seat_res.status_code == 200
    assert len(seat_res.json()["data"]) >= 1

    # 6. Get seating chart
    chart_res = await client.get(f"/api/v1/seating/{exam_id}/chart")
    assert chart_res.status_code == 200
    assert "rows_layout" in chart_res.json()["data"]


@pytest.mark.asyncio
async def test_feature8_timetable_generator(client: AsyncClient):
    client.cookies.clear()
    await client.post(
        "/api/v1/auth/login",
        json={"email": "admin@test.com", "password": "AdminPass123!"}
    )

    # 1. Generate conflict-free timetable
    gen_res = await client.post(
        "/api/v1/timetable/generate",
        json={"semester": 1, "academic_year": "2025-2026"}
    )
    assert gen_res.status_code == 200
    tt_id = gen_res.json()["data"]["id"]

    # 2. Get timetable by ID
    tt_res = await client.get(f"/api/v1/timetable/{tt_id}")
    assert tt_res.status_code == 200
    tt_data = tt_res.json()["data"]
    assert tt_data["slots_count"] >= 10

    # 3. Get faculty view
    fac_res = await client.get(f"/api/v1/timetable/{tt_id}/faculty")
    assert fac_res.status_code == 200
    assert isinstance(fac_res.json()["data"], list)

    # 4. Get room schedule
    room_res = await client.get(f"/api/v1/timetable/{tt_id}/room?room_id=Lecture%20Hall%20101")
    assert room_res.status_code == 200
    assert isinstance(room_res.json()["data"], list)

    # 5. Resolve conflict
    res_conf = await client.post(
        "/api/v1/timetable/resolve-conflict",
        json={
            "conflict_id": str(uuid.uuid4()),
            "resolution_notes": "Moved slot to Lecture Hall 102"
        }
    )
    assert res_conf.status_code == 200
    assert res_conf.json()["data"]["resolved"] is True


@pytest.mark.asyncio
async def test_feature9_fee_management(client: AsyncClient):
    client.cookies.clear()
    await client.post(
        "/api/v1/auth/login",
        json={"email": "student@test.com", "password": "StudentPass123!"}
    )

    # 1. Get student fees
    fees_res = await client.get("/api/v1/fees/student")
    assert fees_res.status_code == 200
    f_data = fees_res.json()["data"]
    assert len(f_data["fee_items"]) >= 1
    target_structure_id = f_data["fee_items"][0]["fee_structure_id"]

    # 2. Process payment
    pay_res = await client.post(
        "/api/v1/fees/payment",
        json={
            "fee_structure_id": target_structure_id,
            "amount_paid": 65000.0,
            "payment_mode": "UPI"
        }
    )
    assert pay_res.status_code == 200
    p_data = pay_res.json()["data"]
    assert p_data["status"] == "SUCCESS"
    assert "receipt_number" in p_data

    # 3. Verify fees updated
    fees_updated = await client.get("/api/v1/fees/student")
    assert fees_updated.status_code == 200
    assert fees_updated.json()["data"]["total_paid"] >= 65000.0

    # 4. Admin views defaulters & sends reminder
    client.cookies.clear()
    await client.post(
        "/api/v1/auth/login",
        json={"email": "admin@test.com", "password": "AdminPass123!"}
    )

    defaulters_res = await client.get("/api/v1/admin/fees/defaulters")
    assert defaulters_res.status_code == 200
    defaulters = defaulters_res.json()["data"]
    assert len(defaulters) >= 1

    target_stu_id = defaulters[0]["student_id"]
    rem_res = await client.post(
        "/api/v1/admin/fees/reminder",
        json={
            "student_id": target_stu_id,
            "fee_structure_id": target_structure_id,
            "reminder_type": "EMAIL"
        }
    )
    assert rem_res.status_code == 200
    assert rem_res.json()["data"]["status"] == "SENT"

    # 5. Admin analytics
    analytics_res = await client.get("/api/v1/admin/fees/analytics")
    assert analytics_res.status_code == 200
    assert "collection_efficiency_pct" in analytics_res.json()["data"]


@pytest.mark.asyncio
async def test_feature10_hostel_management(client: AsyncClient):
    client.cookies.clear()
    await client.post(
        "/api/v1/auth/login",
        json={"email": "student@test.com", "password": "StudentPass123!"}
    )

    # 1. Get hostel rooms
    rooms_res = await client.get("/api/v1/hostel/rooms")
    assert rooms_res.status_code == 200
    rooms = rooms_res.json()["data"]
    assert len(rooms) >= 1

    # 2. Allocate room
    alloc_res = await client.post(
        "/api/v1/hostel/allocate",
        json={"room_id": rooms[0]["id"]}
    )
    assert alloc_res.status_code == 200
    assert alloc_res.json()["data"]["status"] == "ALLOCATED"

    # 3. Get my room
    my_room_res = await client.get("/api/v1/hostel/my-room")
    assert my_room_res.status_code == 200
    assert "room_number" in my_room_res.json()["data"]

    # 4. Lodge complaint
    complaint_res = await client.post(
        "/api/v1/hostel/complaint",
        json={
            "complaint_type": "ELECTRICAL",
            "description": "Desk lamp socket short circuit"
        }
    )
    assert complaint_res.status_code == 200
    assert complaint_res.json()["data"]["status"] == "PENDING"

    # 5. Admin hostel overview
    client.cookies.clear()
    await client.post(
        "/api/v1/auth/login",
        json={"email": "admin@test.com", "password": "AdminPass123!"}
    )
    overview_res = await client.get("/api/v1/admin/hostel/overview")
    assert overview_res.status_code == 200
    assert overview_res.json()["data"]["total_hostels"] >= 1
    assert "occupancy_rate_pct" in overview_res.json()["data"]
