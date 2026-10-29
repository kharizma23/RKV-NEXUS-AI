import urllib.request
import json
from app.core.security import create_access_token

token = create_access_token(
    subject="10bededc-87de-45db-9976-d77247567689",
    roles=["STUDENT"],
    permissions=[]
)

for endpoint in [
    "http://127.0.0.1:8000/api/v1/student/career-prediction",
    "http://127.0.0.1:8000/api/v1/student/career/prediction"
]:
    try:
        req = urllib.request.Request(endpoint, headers={"Authorization": f"Bearer {token}"})
        with urllib.request.urlopen(req) as response:
            print(f"{endpoint} -> {response.status}")
            data = json.loads(response.read().decode('utf-8'))
            print("  Top Role:", data.get("top_role"))
            print("  Match Score:", data.get("match_score"))
            print("  Skill Gaps:", data.get("skill_gaps"))
            print("  Skills Comparison Count:", len(data.get("skills_comparison", [])))
            print("  Certs:", data.get("recommended_certifications"))
    except Exception as e:
        print(f"Error for {endpoint}:", e)
