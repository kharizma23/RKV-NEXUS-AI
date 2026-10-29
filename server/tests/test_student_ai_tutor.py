import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_ai_tutor_workflow(client: AsyncClient):
    # 1. Login as Student
    login_resp = await client.post(
        "/api/v1/auth/login",
        json={"email": "student@test.com", "password": "StudentPass123!"}
    )
    assert login_resp.status_code == 200
    token = login_resp.cookies.get("access_token")
    headers = {"Authorization": f"Bearer {token}"} if token else {}

    # 2. Start Session
    start_resp = await client.post(
        "/api/v1/student/ai-tutor/session/start",
        json={"topic": "Relational Databases & Normalization"},
        headers=headers
    )
    assert start_resp.status_code == 200
    start_data = start_resp.json()["data"]
    assert "session_id" in start_data
    session_id = start_data["session_id"]
    assert len(start_data["suggested_prompts"]) > 0
    assert "student_context" in start_data

    # 3. Ask "What is my weakest topic?" (Context-aware tutoring)
    msg1_resp = await client.post(
        "/api/v1/student/ai-tutor/message",
        json={
            "session_id": session_id,
            "content": "What is my weakest topic?",
            "language": "en"
        },
        headers=headers
    )
    assert msg1_resp.status_code == 200
    msg1_data = msg1_resp.json()["data"]
    assert "reply" in msg1_data
    assert "CO3" in msg1_data["reply"] or "weak" in msg1_data["reply"].lower()

    # 4. Ask "Teach me DBMS normalization" (Syllabus topic teaching)
    msg2_resp = await client.post(
        "/api/v1/student/ai-tutor/message",
        json={
            "session_id": session_id,
            "content": "Teach me DBMS normalization and 3NF",
            "language": "en"
        },
        headers=headers
    )
    assert msg2_resp.status_code == 200
    msg2_data = msg2_resp.json()["data"]
    assert "3NF" in msg2_data["reply"]

    # 5. Ask for practice questions ("Give me 5 practice questions on Neural Networks")
    msg3_resp = await client.post(
        "/api/v1/student/ai-tutor/message",
        json={
            "session_id": session_id,
            "content": "Give me 5 practice questions on Neural Networks",
            "language": "en"
        },
        headers=headers
    )
    assert msg3_resp.status_code == 200
    msg3_data = msg3_resp.json()["data"]
    assert "Q1" in msg3_data["reply"] or "Rubric" in msg3_data["reply"]

    # 6. Multi-language: Tamil
    msg_ta_resp = await client.post(
        "/api/v1/student/ai-tutor/message",
        json={
            "session_id": session_id,
            "content": "எனக்கு DBMS கற்பிக்கவும்",
            "language": "ta"
        },
        headers=headers
    )
    assert msg_ta_resp.status_code == 200
    msg_ta_data = msg_ta_resp.json()["data"]
    assert msg_ta_data["language"] == "ta"

    # 7. Multi-language: Hindi
    msg_hi_resp = await client.post(
        "/api/v1/student/ai-tutor/message",
        json={
            "session_id": session_id,
            "content": "मुझे DBMS पढ़ाएं",
            "language": "hi"
        },
        headers=headers
    )
    assert msg_hi_resp.status_code == 200
    msg_hi_data = msg_hi_resp.json()["data"]
    assert msg_hi_data["language"] == "hi"

    # 8. Escalation to faculty
    esc_resp = await client.post(
        "/api/v1/student/ai-tutor/escalate",
        json={"question": "Can professor explain the difference in evaluation rubric for question 4?"},
        headers=headers
    )
    assert esc_resp.status_code == 200
    esc_data = esc_resp.json()["data"]
    assert "id" in esc_data
    assert esc_data["status"] == "PENDING"

    # 9. Get Suggestions
    sugg_resp = await client.get(
        "/api/v1/student/ai-tutor/suggestions",
        headers=headers
    )
    assert sugg_resp.status_code == 200
    sugg_data = sugg_resp.json()["data"]
    assert len(sugg_data["quick_prompts"]) > 0

    # 10. Get History
    hist_resp = await client.get(
        "/api/v1/student/ai-tutor/history",
        headers=headers
    )
    assert hist_resp.status_code == 200
    hist_data = hist_resp.json()["data"]
    assert len(hist_data["messages"]) >= 5
