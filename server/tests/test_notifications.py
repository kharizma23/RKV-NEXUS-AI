import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_notifications_flow(client: AsyncClient):
    # 1. Login as Admin
    admin_login = await client.post(
        "/api/v1/auth/login",
        json={"email": "admin@test.com", "password": "AdminPass123!"}
    )
    assert admin_login.status_code == 200

    # 2. Broadcast a Notification as Admin
    broadcast_res = await client.post(
        "/api/v1/notifications/broadcast",
        json={
            "title": "Exam Schedule Shifted",
            "message": "Due to weather, tomorrow's exams are shifted to next Monday.",
            "category": "EXAMINATION",
            "priority": "HIGH",
            "recipient_type": "ALL",
            "attachments": [
                {
                    "file_name": "revised_schedule.pdf",
                    "file_url": "https://storage.platform.edu/revised_schedule.pdf"
                }
            ]
        }
    )
    assert broadcast_res.status_code == 201
    notif_id = broadcast_res.json()["id"]
    assert broadcast_res.json()["title"] == "Exam Schedule Shifted"
    assert len(broadcast_res.json()["attachments"]) == 1

    # 3. Login as Student
    student_login = await client.post(
        "/api/v1/auth/login",
        json={"email": "student@test.com", "password": "StudentPass123!"}
    )
    assert student_login.status_code == 200

    # 4. Fetch Student Notifications
    list_res = await client.get("/api/v1/notifications")
    assert list_res.status_code == 200
    notifs = list_res.json()
    assert len(notifs) > 0
    # The broadcasted one should be present
    target_notif = next(n for n in notifs if n["id"] == notif_id)
    assert target_notif["is_read"] is False

    # 5. Mark Notification as Read
    read_res = await client.patch(f"/api/v1/notifications/{notif_id}/read")
    assert read_res.status_code == 200

    # Verify is_read is True
    list_res2 = await client.get("/api/v1/notifications")
    assert list_res2.status_code == 200
    target_notif2 = next(n for n in list_res2.json() if n["id"] == notif_id)
    assert target_notif2["is_read"] is True

    # 6. Fetch/Update Notification Settings
    settings_res = await client.get("/api/v1/notifications/settings")
    assert settings_res.status_code == 200
    assert settings_res.json()["exam_notifications"] is True

    update_res = await client.put(
        "/api/v1/notifications/settings",
        json={"exam_notifications": False}
    )
    assert update_res.status_code == 200
    assert update_res.json()["exam_notifications"] is False

    # After turning off exam notifications, list should filter it out
    list_res3 = await client.get("/api/v1/notifications")
    assert list_res3.status_code == 200
    exam_notifs = [n for n in list_res3.json() if n["category"] == "EXAMINATION"]
    assert len(exam_notifs) == 0

    # Turn it back on
    await client.put("/api/v1/notifications/settings", json={"exam_notifications": True})

    # 7. Star and Pin Notification
    star_res = await client.patch(f"/api/v1/notifications/{notif_id}/star")
    assert star_res.status_code == 200
    assert star_res.json()["is_starred"] is True

    pin_res = await client.patch(f"/api/v1/notifications/{notif_id}/pin")
    assert pin_res.status_code == 200
    assert pin_res.json()["is_pinned"] is True

    # 8. Archive Notification
    archive_res = await client.patch(f"/api/v1/notifications/{notif_id}/archive")
    assert archive_res.status_code == 200

    # Verify not returned in normal list, but is in archived filter
    list_normal = await client.get("/api/v1/notifications")
    assert notif_id not in [n["id"] for n in list_normal.json()]

    list_archived = await client.get("/api/v1/notifications?archive=archived")
    assert notif_id in [n["id"] for n in list_archived.json()]

    # 8. Trigger AI Recommendations & Daily Summary
    ai_trigger_res = await client.post("/api/v1/notifications/ai-trigger")
    assert ai_trigger_res.status_code == 200
    assert "Successfully generated" in ai_trigger_res.json()["message"]

    ai_summary_res = await client.get("/api/v1/notifications/ai-summary")
    assert ai_summary_res.status_code == 200
    assert "exam_readiness" in ai_summary_res.json()

    # 9. Delete Notification
    delete_res = await client.delete(f"/api/v1/notifications/{notif_id}")
    assert delete_res.status_code == 200

    # Should not appear even in archived
    list_archived2 = await client.get("/api/v1/notifications?archive=archived")
    assert notif_id not in [n["id"] for n in list_archived2.json()]
