import asyncio
import uuid
from app.database.session import AsyncSessionLocal
from app.modules.new_functionalities.service import NewFunctionalitiesService

async def test_career():
    async with AsyncSessionLocal() as session:
        service = NewFunctionalitiesService(session)
        # Use a random or test student ID
        test_id = uuid.uuid4()
        res = await service.get_career_prediction(test_id)
        print("Career Prediction Result:")
        print(f"Top Role: {res['top_role']}")
        print(f"Match Score: {res['match_score']}%")
        print(f"Alternative Role: {res['alternative_role']}")
        print(f"Skill Gaps: {res['skill_gaps']}")
        print(f"Recommended Certifications: {res['recommended_certifications']}")
        print(f"Skills Comparison Count: {len(res['skills_comparison'])}")
        print(f"Skills To Improve: {res['skills_to_improve']}")

asyncio.run(test_career())
