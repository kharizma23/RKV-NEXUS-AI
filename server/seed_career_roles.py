import asyncio
import uuid
import json
from sqlalchemy import text
from app.database.session import AsyncSessionLocal

async def seed_career_roles():
    async with AsyncSessionLocal() as session:
        # 1. Ensure columns exist on career_roles
        await session.execute(text("ALTER TABLE career_roles ADD COLUMN IF NOT EXISTS average_package VARCHAR(255)"))
        await session.execute(text("ALTER TABLE career_roles ADD COLUMN IF NOT EXISTS description TEXT"))
        await session.execute(text("ALTER TABLE career_roles ADD COLUMN IF NOT EXISTS recommended_certifications JSONB"))
        await session.commit()

        # 2. Clear existing career_roles to make seed idempotent
        await session.execute(text("DELETE FROM career_roles"))
        await session.commit()

        roles = [
            {
                "id": uuid.uuid4(),
                "role_name": "AI Engineer",
                "average_package": "14 LPA",
                "description": "Designs, trains, and deploys high-scale artificial intelligence, LLMs, and neural network models into enterprise production workflows.",
                "required_skills": {
                    "Python": 80,
                    "Machine Learning": 75,
                    "Deep Learning": 80,
                    "Natural Language Processing": 75,
                    "Cloud Deployment": 70,
                    "SQL": 65
                },
                "recommended_certifications": [
                    "TensorFlow Developer",
                    "AWS ML Specialty",
                    "DeepLearning.AI Generative AI Professional"
                ]
            },
            {
                "id": uuid.uuid4(),
                "role_name": "Data Analyst",
                "average_package": "9.5 LPA",
                "description": "Transforms raw operational data into interactive dashboards, statistical visualizations, and executive business insights.",
                "required_skills": {
                    "SQL": 85,
                    "Statistics & Probability": 85,
                    "Data Visualization": 80,
                    "Python": 85,
                    "Business Intelligence": 75
                },
                "recommended_certifications": [
                    "Google Data Analytics Professional",
                    "Microsoft Power BI Data Analyst",
                    "Tableau Desktop Specialist"
                ]
            },
            {
                "id": uuid.uuid4(),
                "role_name": "Full Stack Developer",
                "average_package": "12 LPA",
                "description": "Architects end-to-end resilient web applications, distributed APIs, microservices, and interactive modern user experiences.",
                "required_skills": {
                    "React & Next.js": 90,
                    "Node.js & TypeScript": 88,
                    "Database Systems & SQL": 85,
                    "System Architecture": 82,
                    "Cloud & DevOps": 78
                },
                "recommended_certifications": [
                    "Meta Certified Full Stack Developer",
                    "AWS Certified Developer Associate",
                    "Docker Certified Associate"
                ]
            },
            {
                "id": uuid.uuid4(),
                "role_name": "Cloud & DevOps Architect",
                "average_package": "16 LPA",
                "description": "Constructs automated CI/CD infrastructure, site reliability observability pipelines, and fault-tolerant cloud clusters.",
                "required_skills": {
                    "Cloud Deployment": 92,
                    "Docker & Kubernetes": 88,
                    "Linux & Shell Scripting": 85,
                    "System Architecture": 85
                },
                "recommended_certifications": [
                    "CKA (Certified Kubernetes Admin)",
                    "AWS Solutions Architect Professional",
                    "HashiCorp Certified Terraform Associate"
                ]
            }
        ]

        for r in roles:
            await session.execute(
                text("""
                    INSERT INTO career_roles (id, role_name, required_skills, avg_package, average_package, description, recommended_certifications)
                    VALUES (:id, :role_name, :required_skills, :avg_package, :average_package, :description, :recommended_certifications)
                """),
                {
                    "id": r["id"],
                    "role_name": r["role_name"],
                    "required_skills": json.dumps(r["required_skills"]),
                    "avg_package": r["average_package"],
                    "average_package": r["average_package"],
                    "description": r["description"],
                    "recommended_certifications": json.dumps(r["recommended_certifications"])
                }
            )

        await session.commit()
        print(f"Successfully seeded {len(roles)} targeted career roles into career_roles table!")

asyncio.run(seed_career_roles())
