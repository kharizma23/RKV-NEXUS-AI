import pytest
import uuid
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_gamification_flow(client: AsyncClient):
    # 1. Login as Student
    login_res = await client.post(
        "/api/v1/auth/login",
        json={"email": "student@test.com", "password": "StudentPass123!"}
    )
    assert login_res.status_code == 200

    # 2. Get initial points
    points_res = await client.get("/api/v1/student/points")
    assert points_res.status_code == 200
    points_data = points_res.json()["data"]
    assert "total_points" in points_data
    assert "streak_days" in points_data

    # 3. Award points for exam completion
    award_res = await client.post(
        "/api/v1/student/points/award",
        json={"points": 10, "reason": "Completed Mid-Term Exam"}
    )
    assert award_res.status_code == 200
    assert award_res.json()["points"] >= 10

    # 4. Get Badges (8 seeded badges)
    badges_res = await client.get("/api/v1/student/badges")
    assert badges_res.status_code == 200
    badges_data = badges_res.json()["data"]
    assert badges_data["total_badges"] >= 8
    badge_names = [b["name"] for b in badges_data["badges"]]
    assert "First Exam" in badge_names
    assert "Perfect Score" in badge_names
    assert "CO Master" in badge_names
    assert "Streak 7" in badge_names

    # 5. Check and award badges
    check_badges = await client.post("/api/v1/student/badges/check")
    assert check_badges.status_code == 200

    # 6. Check Leaderboard
    lb_res = await client.get("/api/v1/student/leaderboard")
    assert lb_res.status_code == 200
    lb_data = lb_res.json()["data"]
    assert len(lb_data) >= 1
    assert "rank" in lb_data[0]
    assert "total_points" in lb_data[0]

@pytest.mark.asyncio
async def test_student_performance_prediction_flow(client: AsyncClient):
    # Login as Student
    await client.post(
        "/api/v1/auth/login",
        json={"email": "student@test.com", "password": "StudentPass123!"}
    )

    # 1. Student views performance forecast
    pred_res = await client.get("/api/v1/student/prediction?semester=1")
    assert pred_res.status_code == 200
    pred = pred_res.json()["data"]
    assert "predicted_percentage" in pred
    assert "risk_level" in pred
    assert pred["risk_level"] in ["LOW", "MEDIUM", "HIGH"]
    assert "predicted_grade" in pred
    assert "confidence" in pred
    assert "factors" in pred
    assert "co_attainment" in pred["factors"]
    assert "exam_average" in pred["factors"]
    assert "attendance" in pred["factors"]

    # 2. Faculty views at-risk student predictions
    client.cookies.clear()
    await client.post(
        "/api/v1/auth/login",
        json={"email": "faculty.approved@test.com", "password": "FacultyPass123!"}
    )
    at_risk_res = await client.get("/api/v1/faculty/predictions/at-risk")
    assert at_risk_res.status_code == 200
    assert "data" in at_risk_res.json()

    # 3. Admin views department-wise predictions
    client.cookies.clear()
    await client.post(
        "/api/v1/auth/login",
        json={"email": "admin@test.com", "password": "AdminPass123!"}
    )
    dept_pred_res = await client.get("/api/v1/admin/predictions/department")
    assert dept_pred_res.status_code == 200
    dept_summary = dept_pred_res.json()["data"]
    assert len(dept_summary) >= 1
    assert "avg_predicted_score" in dept_summary[0]

@pytest.mark.asyncio
async def test_ai_chatbot_flow(client: AsyncClient):
    client.cookies.clear()
    await client.post(
        "/api/v1/auth/login",
        json={"email": "student@test.com", "password": "StudentPass123!"}
    )

    # 1. Start Chat Session
    start_res = await client.post("/api/v1/chat/session/start")
    assert start_res.status_code == 200
    session_id = start_res.json()["session_id"]
    assert "suggested_questions" in start_res.json()

    # 2. Ask performance question
    msg_res = await client.post(
        "/api/v1/chat/message",
        json={"content": "What is my weakest topic?", "session_id": session_id}
    )
    assert msg_res.status_code == 200
    reply_data = msg_res.json()["data"]
    assert len(reply_data["reply"]) > 10
    assert "suggested_questions" in reply_data

    # 3. Ask upcoming exam question
    msg_res_2 = await client.post(
        "/api/v1/chat/message",
        json={"content": "When is my next exam?", "session_id": session_id}
    )
    assert msg_res_2.status_code == 200
    assert len(msg_res_2.json()["data"]["reply"]) > 5

    # 4. View Chat History
    hist_res = await client.get("/api/v1/chat/history")
    assert hist_res.status_code == 200
    messages = hist_res.json()["data"]["messages"]
    assert len(messages) >= 4  # 2 user msgs + 2 bot replies

    # 5. End session
    end_res = await client.post("/api/v1/chat/session/end", json={"session_id": session_id})
    assert end_res.status_code == 200
    assert end_res.json()["ended"] is True

@pytest.mark.asyncio
async def test_adaptive_exam_flow(client: AsyncClient):
    client.cookies.clear()
    await client.post(
        "/api/v1/auth/login",
        json={"email": "student@test.com", "password": "StudentPass123!"}
    )

    # 1. Start adaptive exam
    start_res = await client.post("/api/v1/adaptive/start")
    assert start_res.status_code == 200
    session_data = start_res.json()["data"]
    adaptive_id = session_data["adaptive_exam_id"]
    assert session_data["current_difficulty"] == "MEDIUM"
    assert session_data["current_ability"] == 50.0
    first_q = session_data["question"]
    assert first_q is not None

    # 2. Answer question correctly
    ans_res = await client.post(
        "/api/v1/adaptive/answer",
        json={
            "adaptive_exam_id": adaptive_id,
            "question_id": first_q["id"],
            "answer_text": "Comprehensive analysis of Byzantine fault tolerant state machine consensus."
        }
    )
    assert ans_res.status_code == 200
    ans_data = ans_res.json()["data"]
    assert ans_data["new_ability"] >= 50.0
    assert ans_data["questions_answered"] == 1

    # 3. Check progress
    prog_res = await client.get(f"/api/v1/adaptive/progress?adaptive_exam_id={adaptive_id}")
    assert prog_res.status_code == 200
    assert prog_res.json()["data"]["questions_answered"] == 1

    # 4. Submit & Complete Adaptive Exam
    submit_res = await client.post("/api/v1/adaptive/submit", json={"adaptive_exam_id": adaptive_id})
    assert submit_res.status_code == 200
    assert submit_res.json()["data"]["is_completed"] is True

@pytest.mark.asyncio
async def test_multilanguage_support_flow(client: AsyncClient):
    client.cookies.clear()
    await client.post(
        "/api/v1/auth/login",
        json={"email": "student@test.com", "password": "StudentPass123!"}
    )

    # 1. Fetch English Translations
    en_res = await client.get("/api/v1/translations/en")
    assert en_res.status_code == 200
    en_trans = en_res.json()["translations"]
    assert "welcome" in en_trans
    assert "start_exam" in en_trans

    # 2. Fetch Tamil Translations
    ta_res = await client.get("/api/v1/translations/ta")
    assert ta_res.status_code == 200
    ta_trans = ta_res.json()["translations"]
    assert ta_trans["welcome"] == "நல்வரவு"
    assert ta_trans["start_exam"] == "தேர்வைத் தொடங்கு"

    # 3. Fetch Hindi Translations
    hi_res = await client.get("/api/v1/translations/hi")
    assert hi_res.status_code == 200
    hi_trans = hi_res.json()["translations"]
    assert hi_trans["welcome"] == "वापसी पर स्वागत है"
    assert hi_trans["start_exam"] == "परीक्षा शुरू करें"

    # 4. Update Student Language Preference to Tamil
    update_res = await client.put("/api/v1/user/language", json={"language": "ta"})
    assert update_res.status_code == 200
    assert update_res.json()["language"] == "ta"
