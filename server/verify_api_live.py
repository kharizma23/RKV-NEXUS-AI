import urllib.request
import json
from app.core.security import create_access_token

token = create_access_token(
    subject="10bededc-87de-45db-9976-d77247567689",
    roles=["STUDENT"],
    permissions=[]
)

endpoint = "http://127.0.0.1:8000/api/v1/student/career-prediction"
req = urllib.request.Request(endpoint, headers={"Authorization": f"Bearer {token}"})
with urllib.request.urlopen(req) as resp:
    print(f"Status: {resp.status}")
    data = json.loads(resp.read().decode('utf-8'))
    print("Top Role:", data["top_role"])
    print("Match Score:", data["match_score"], "%")
    print("Skill Gaps:", data["skill_gaps"])
    print("Recommended Certifications:", data["recommended_certifications"])
    print("Alternative Role:", data["alternative_role"])
    print("Skills To Improve Count:", len(data["skills_to_improve"]))
    for sti in data["skills_to_improve"]:
        print(f"  - Skills to Improve: {sti['skill']} (You: {sti['student_score']}%, Required: {sti['required_score']}%)")
    print("Radar Data Count:", len(data["skills_comparison"]))
