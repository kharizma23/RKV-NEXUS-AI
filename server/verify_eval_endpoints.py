import asyncio
from app.database.session import async_engine
from sqlalchemy import text
from app.core.security import create_access_token

async def test_apis():
    import urllib.request
    import json

    # Generate test admin token
    token = create_access_token({"sub": "admin-test", "roles": ["ADMIN"]})
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }

    # 1. Test Confidence Queue
    req = urllib.request.Request("http://127.0.0.1:8000/api/v1/evaluation/confidence-queue", headers=headers)
    with urllib.request.urlopen(req) as resp:
        data = json.loads(resp.read().decode())
        print(f"[TEST 1] Confidence Queue: HTTP {resp.getcode()} | Stats: {data['stats']} | Items: {len(data['items'])}")
        test_item = data['items'][0] if data['items'] else None

    # 2. Test Audit Post
    if test_item:
        audit_url = f"http://127.0.0.1:8000/api/v1/evaluation/confidence-queue/{test_item['id']}/audit"
        audit_payload = json.dumps({"confirmed_marks": 7.5, "faculty_feedback": "Verified via test script"}).encode()
        req2 = urllib.request.Request(audit_url, data=audit_payload, headers=headers, method="POST")
        with urllib.request.urlopen(req2) as resp2:
            res_json = json.loads(resp2.read().decode())
            print(f"[TEST 2] Audit Grade: HTTP {resp2.getcode()} | {res_json['message']}")

    # 3. Test Counterfactual Feed
    req3 = urllib.request.Request("http://127.0.0.1:8000/api/v1/evaluation/counterfactual-feed", headers=headers)
    with urllib.request.urlopen(req3) as resp3:
        data3 = json.loads(resp3.read().decode())
        print(f"[TEST 3] Counterfactual Feed: HTTP {resp3.getcode()} | Count: {data3['count']}")
        test_card = data3['feed'][0] if data3['feed'] else None

    # 4. Test Send Feedback Notification
    if test_card and test_card.get('student_id'):
        notif_url = f"http://127.0.0.1:8000/api/v1/notifications/send-feedback/{test_card['student_id']}"
        notif_payload = json.dumps({
            "title": "AI Feedback Verification",
            "message": test_card['ai_feedback'],
            "counterfactual_feedback": test_card['counterfactual_feedback']
        }).encode()
        req4 = urllib.request.Request(notif_url, data=notif_payload, headers=headers, method="POST")
        with urllib.request.urlopen(req4) as resp4:
            res4_json = json.loads(resp4.read().decode())
            print(f"[TEST 4] Send Feedback Notif: HTTP {resp4.getcode()} | {res4_json['message']}")

asyncio.run(test_apis())
