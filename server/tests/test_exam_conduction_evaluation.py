import pytest
import uuid
from httpx import AsyncClient

async def login_as(client: AsyncClient, email: str, password: str) -> dict:
    client.cookies.clear()
    res = await client.post("/api/v1/auth/login", json={"email": email, "password": password})
    assert res.status_code == 200
    return res.json()

@pytest.mark.asyncio
async def test_proctoring_flow(client: AsyncClient):
    # 1. Login as Student and start proctoring session
    stud = await login_as(client, "student@test.com", "StudentPass123!")
    exam_id = str(uuid.uuid4())
    res = await client.post("/api/v1/proctoring/start", json={"exam_id": exam_id})
    assert res.status_code == 200
    data = res.json()["data"]
    session_id = data["session_id"]
    assert data["status"] == "ACTIVE"

    # 2. Process frame with suspicious telemetry (phone detected + multiple faces)
    frame_res = await client.post(
        "/api/v1/proctoring/frame",
        json={
            "session_id": session_id,
            "frame_base64": "dummy_base64_frame",
            "telemetry": {
                "face_count": 2,
                "gaze_direction": "LEFT",
                "object_detected": "PHONE",
                "tab_switches": 1
            }
        }
    )
    assert frame_res.status_code == 200
    frame_data = frame_res.json()["data"]
    assert frame_data["risk_score"] > 50.0

    # 3. Check session details
    sess_res = await client.get(f"/api/v1/proctoring/session/{session_id}")
    assert sess_res.status_code == 200
    sess_json = sess_res.json()["data"]
    assert len(sess_json["events"]) >= 3

    # 4. Faculty reviews flagged proctoring
    await login_as(client, "faculty.approved@test.com", "FacultyPass123!")
    fac_res = await client.get("/api/v1/faculty/proctoring/flagged")
    assert fac_res.status_code == 200
    assert len(fac_res.json()["data"]) >= 1

    # 5. Admin overview
    await login_as(client, "admin@test.com", "AdminPass123!")
    adm_res = await client.get("/api/v1/admin/proctoring/overview")
    assert adm_res.status_code == 200
    assert "integrity_index" in adm_res.json()["data"]

@pytest.mark.asyncio
async def test_emotion_aware_interface(client: AsyncClient):
    await login_as(client, "student@test.com", "StudentPass123!")
    exam_id = str(uuid.uuid4())
    # Log stressed emotion
    res = await client.post(
        "/api/v1/emotion/log",
        json={"exam_id": exam_id, "emotion": "stressed", "confidence": 0.88}
    )
    assert res.status_code == 200
    assert res.json()["data"]["intervention"] == "2_MIN_BREAK"

    # Accept intervention
    int_res = await client.post(
        "/api/v1/emotion/intervention",
        json={"exam_id": exam_id, "intervention_type": "2_MIN_BREAK", "accepted": True}
    )
    assert int_res.status_code == 200

    # Faculty stats
    await login_as(client, "faculty.approved@test.com", "FacultyPass123!")
    fac_res = await client.get("/api/v1/faculty/emotion/analytics")
    assert fac_res.status_code == 200
    assert "calm_index" in fac_res.json()["data"]

    # Admin stats
    await login_as(client, "admin@test.com", "AdminPass123!")
    adm_res = await client.get("/api/v1/admin/emotion/overview")
    assert adm_res.status_code == 200

@pytest.mark.asyncio
async def test_collaborative_group_exams(client: AsyncClient):
    await login_as(client, "faculty.approved@test.com", "FacultyPass123!")
    exam_id = str(uuid.uuid4())
    # Create group exam
    create_res = await client.post(
        "/api/v1/group-exams/create",
        json={"exam_id": exam_id, "group_size": 3}
    )
    assert create_res.status_code == 200
    ge_id = create_res.json()["data"]["id"]

    # Student joins
    await login_as(client, "student@test.com", "StudentPass123!")
    join_res = await client.post(
        f"/api/v1/group-exams/{ge_id}/join",
        json={"role": "leader"}
    )
    assert join_res.status_code == 200
    group_id = join_res.json()["data"]["group_id"]

    # Group submission
    q_id = str(uuid.uuid4())
    sub_res = await client.post(
        f"/api/v1/group-exams/{group_id}/submit",
        json={"question_id": q_id, "answer": "Collaborative synthesis of Paxos consensus protocol."}
    )
    assert sub_res.status_code == 200

    # Results
    res_get = await client.get(f"/api/v1/group-exams/{ge_id}/results")
    assert res_get.status_code == 200
    assert len(res_get.json()["data"]["groups"]) >= 1

@pytest.mark.asyncio
async def test_gamified_exam_levels(client: AsyncClient):
    await login_as(client, "faculty.approved@test.com", "FacultyPass123!")
    exam_id = str(uuid.uuid4())
    # Create gamified exam
    create_res = await client.post(
        "/api/v1/gamified-exams/create",
        json={"exam_id": exam_id}
    )
    assert create_res.status_code == 200
    ge_id = create_res.json()["data"]["id"]

    # Student gets exam levels
    await login_as(client, "student@test.com", "StudentPass123!")
    exam_res = await client.get(f"/api/v1/gamified-exams/{exam_id}")
    assert exam_res.status_code == 200
    levels = exam_res.json()["data"]["levels"]
    assert len(levels) == 4

    # Submit level 1 progress
    lvl1_id = levels[0]["id"]
    sub_res = await client.post(
        f"/api/v1/gamified-exams/{ge_id}/submit-level",
        json={"level_id": lvl1_id, "score": 95.0}
    )
    assert sub_res.status_code == 200

    # Leaderboard
    lb_res = await client.get(f"/api/v1/gamified-exams/{ge_id}/leaderboard")
    assert lb_res.status_code == 200

@pytest.mark.asyncio
async def test_offline_mode(client: AsyncClient):
    await login_as(client, "student@test.com", "StudentPass123!")
    exam_id = str(uuid.uuid4())
    # Download package
    dl_res = await client.post(f"/api/v1/offline/download/{exam_id}")
    assert dl_res.status_code == 200
    offline_id = dl_res.json()["data"]["offline_exam_id"]

    # Sync answers
    sync_res = await client.post(
        "/api/v1/offline/sync",
        json={
            "offline_exam_id": offline_id,
            "answers": [
                {"question_id": str(uuid.uuid4()), "answer": "Offline response recorded in IndexedDB"}
            ]
        }
    )
    assert sync_res.status_code == 200
    assert sync_res.json()["data"]["status"] == "SYNCED"

    # Faculty sync monitor
    await login_as(client, "faculty.approved@test.com", "FacultyPass123!")
    fac_res = await client.get("/api/v1/faculty/offline/sync-status")
    assert fac_res.status_code == 200

@pytest.mark.asyncio
async def test_flexible_time_exams(client: AsyncClient):
    await login_as(client, "faculty.approved@test.com", "FacultyPass123!")
    exam_id = str(uuid.uuid4())
    # Create flexible window
    create_res = await client.post(
        "/api/v1/flexible-exams/create",
        json={
            "exam_id": exam_id,
            "window_start": "2026-10-05T00:00:00Z",
            "window_end": "2026-10-07T23:59:59Z",
            "duration_minutes": 120
        }
    )
    assert create_res.status_code == 200
    fe_id = create_res.json()["data"]["id"]

    # Start attempt
    await login_as(client, "student@test.com", "StudentPass123!")
    start_res = await client.post(f"/api/v1/flexible-exams/{fe_id}/start")
    assert start_res.status_code == 200
    att_id = start_res.json()["data"]["attempt_id"]

    # Submit attempt
    sub_res = await client.post(f"/api/v1/flexible-exams/{att_id}/submit")
    assert sub_res.status_code == 200

@pytest.mark.asyncio
async def test_peer_assessment_flow(client: AsyncClient):
    await login_as(client, "faculty.approved@test.com", "FacultyPass123!")
    exam_id = str(uuid.uuid4())
    q_id = str(uuid.uuid4())
    s1 = uuid.uuid4()
    s2 = uuid.uuid4()

    # Assign peers
    assign_res = await client.post(
        "/api/v1/peer/assign",
        json={"exam_id": exam_id, "question_id": q_id, "student_ids": [str(s1), str(s2)]}
    )
    assert assign_res.status_code == 200
    assign_data = assign_res.json()["data"]
    assigned_list = assign_data.get("assignments", [])
    target_assessment_id = assigned_list[0]["id"] if assigned_list else str(uuid.uuid4())

    # Submit peer review
    await login_as(client, "student@test.com", "StudentPass123!")
    eval_res = await client.post(
        "/api/v1/peer/evaluate",
        json={
            "assessment_id": target_assessment_id,
            "marks": 17.5,
            "feedback": "Concise derivation and clear complexity analysis."
        }
    )
    assert eval_res.status_code == 200

    # Admin peer overview
    await login_as(client, "admin@test.com", "AdminPass123!")
    adm_res = await client.get("/api/v1/admin/peer/overview")
    assert adm_res.status_code == 200

@pytest.mark.asyncio
async def test_counterfactual_and_skill_evaluation(client: AsyncClient):
    await login_as(client, "student@test.com", "StudentPass123!")
    sub_id = str(uuid.uuid4())
    # Counterfactual
    cf_res = await client.post(
        "/api/v1/counterfactual/generate",
        json={"submission_id": sub_id}
    )
    assert cf_res.status_code == 200
    assert "additional_marks_possible" in cf_res.json()["data"]

    # Skill evaluation
    skill_res = await client.post(
        "/api/v1/skills/evaluate",
        json={"submission_id": sub_id}
    )
    assert skill_res.status_code == 200
    assert skill_res.json()["data"]["problem_solving"] > 80.0

@pytest.mark.asyncio
async def test_confidence_and_consensus_and_learning_style(client: AsyncClient):
    await login_as(client, "student@test.com", "StudentPass123!")
    sub_id = str(uuid.uuid4())
    # Confidence
    conf_res = await client.post(
        "/api/v1/confidence/calculate",
        json={"submission_id": sub_id, "question_id": str(uuid.uuid4()), "marks": 19.0}
    )
    assert conf_res.status_code == 200

    # Multi-evaluator consensus
    cons_res = await client.post(
        "/api/v1/consensus/evaluate",
        json={"submission_id": sub_id}
    )
    assert cons_res.status_code == 200
    assert "consensus_score" in cons_res.json()["data"]

    # Learning style detection
    style_res = await client.post(
        "/api/v1/learning-style/detect",
        json={"answers_sample": ["Structured block diagram with labelled components"]}
    )
    assert style_res.status_code == 200
    assert style_res.json()["data"]["style"] == "VISUAL"

@pytest.mark.asyncio
async def test_improvement_and_industry_validation(client: AsyncClient):
    await login_as(client, "student@test.com", "StudentPass123!")
    cur_exam = str(uuid.uuid4())
    # Improvement calculation
    imp_res = await client.post(
        "/api/v1/improvement/calculate",
        json={"current_exam_id": cur_exam}
    )
    assert imp_res.status_code == 200
    assert imp_res.json()["data"]["bonus_marks"] > 0

    # Industry expert invite
    await login_as(client, "admin@test.com", "AdminPass123!")
    email = f"expert_{uuid.uuid4().hex[:6]}@google.com"
    inv_res = await client.post(
        "/api/v1/industry/invite",
        json={
            "name": "Dr. Leslie Lamport",
            "company": "Microsoft Research",
            "expertise": "Distributed Systems & Formal Specification",
            "email": email
        }
    )
    assert inv_res.status_code == 200
    exp_id = inv_res.json()["data"]["expert_id"]

    # Industry review
    await login_as(client, "student@test.com", "StudentPass123!")
    sub_id = str(uuid.uuid4())
    rev_res = await client.post(
        "/api/v1/industry/review",
        json={
            "submission_id": sub_id,
            "expert_id": exp_id,
            "score": 96.0,
            "feedback": "Outstanding precision in mathematical induction proof."
        }
    )
    assert rev_res.status_code == 200

    # Admin reviews
    await login_as(client, "admin@test.com", "AdminPass123!")
    rev_list = await client.get("/api/v1/admin/industry/reviews")
    assert rev_list.status_code == 200
    assert len(rev_list.json()["data"]) >= 1
