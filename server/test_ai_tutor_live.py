import asyncio
import sys
import httpx
from httpx import ASGITransport

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

async def test_live():
    # Attempt connecting to running server on localhost:8000 first, fallback to in-process ASGI
    use_asgi = False
    try:
        async with httpx.AsyncClient(timeout=2.0) as check_client:
            res = await check_client.get("http://127.0.0.1:8000/api/v1/auth/me")
    except Exception:
        use_asgi = True

    if use_asgi:
        print("Live server on :8000 not detected — running direct in-process ASGI test with live Gemini AI...")
        import app.main
        from app.main import app
        transport = ASGITransport(app=app)
        client = httpx.AsyncClient(transport=transport, base_url="http://test", timeout=45.0)
    else:
        print("Connected to running server on http://127.0.0.1:8000...")
        client = httpx.AsyncClient(base_url="http://127.0.0.1:8000", timeout=45.0)

    async with client:
        # 1. Login as student
        login_res = await client.post("/api/v1/auth/login", json={
            "email": "student@platform.edu",
            "password": "Student123"
        })
        print(f"Login status: {login_res.status_code}")
        assert login_res.status_code == 200, f"Login failed: {login_res.text}"
        
        token = login_res.cookies.get("access_token")
        headers = {"Authorization": f"Bearer {token}"} if token else {}

        # 2. Test "Teach me DBMS normalization"
        print("\n=== Testing: 'Teach me DBMS normalization' ===")
        res1 = await client.post(
            "/api/v1/student/ai-tutor/message",
            json={"content": "Teach me DBMS normalization", "language": "en"},
            headers=headers
        )
        print(f"Status: {res1.status_code}")
        assert res1.status_code == 200
        reply1 = res1.json()["data"]["reply"]
        print(f"Reply Preview (first 250 chars):\n{reply1[:250]}...\n")
        assert "latency glitch" not in reply1.lower()

        # 3. Test "What is my weakest topic?"
        print("=== Testing: 'What is my weakest topic?' ===")
        res2 = await client.post(
            "/api/v1/student/ai-tutor/message",
            json={"content": "What is my weakest topic?", "language": "en"},
            headers=headers
        )
        print(f"Status: {res2.status_code}")
        assert res2.status_code == 200
        reply2 = res2.json()["data"]["reply"]
        print(f"Reply Preview (first 250 chars):\n{reply2[:250]}...\n")
        assert "latency glitch" not in reply2.lower()

        # 4. Test "Explain in Tamil"
        print("=== Testing: 'வணக்கம், DBMS பற்றி விளக்கு' (Tamil) ===")
        res3 = await client.post(
            "/api/v1/student/ai-tutor/message",
            json={"content": "வணக்கம், DBMS பற்றி சுருக்கமாக விளக்கு", "language": "ta"},
            headers=headers
        )
        print(f"Status: {res3.status_code}")
        assert res3.status_code == 200
        reply3 = res3.json()["data"]["reply"]
        print(f"Reply Preview (first 250 chars):\n{reply3[:250]}...\n")

        print("ALL LIVE AI TUTOR TESTS PASSED WITH 100% SUCCESS!")

if __name__ == "__main__":
    asyncio.run(test_live())
