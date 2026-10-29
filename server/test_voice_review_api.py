import asyncio
import urllib.request
import json
from app.core.security import create_access_token

async def test():
    token = create_access_token("f8c2ccd2-441d-4612-8f6d-633357d4f92d", ["FACULTY"], ["all"])
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    url = "http://127.0.0.1:8000/api/v1/faculty/voice/review"
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode())
            print(f"HTTP {resp.getcode()}: Count={len(data.get('data', []))}")
            for item in data.get('data', []):
                print(f"- {item['student_name']} ({item['language_code']}): {item['transcribed_text'][:60]}...")
    except Exception as e:
        print("Error:", e)

asyncio.run(test())
