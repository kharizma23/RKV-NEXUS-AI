import asyncio
import uuid
import json
from datetime import datetime, UTC
from sqlalchemy import text
from app.database.session import AsyncSessionLocal

async def setup():
    async with AsyncSessionLocal() as session:
        # Create student_groups table if it doesn't exist
        await session.execute(text("""
            CREATE TABLE IF NOT EXISTS student_groups (
                id UUID PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                description TEXT,
                members JSONB NOT NULL DEFAULT '[]'::jsonb,
                co_attainment NUMERIC(5, 2) DEFAULT 85.0,
                leader_name VARCHAR(255),
                department VARCHAR(255) DEFAULT 'Computer Science & Engineering',
                status VARCHAR(50) DEFAULT 'ACTIVE',
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            )
        """))
        await session.commit()
        print("Table student_groups checked/created.")

        # Check existing groups count
        res = await session.execute(text("SELECT count(*) FROM student_groups"))
        count = res.scalar() or 0
        print(f"Current student_groups count: {count}")

        if count < 3:
            sample_groups = [
                {
                    "id": uuid.uuid4(),
                    "name": "Squad A: AI Engineering Team",
                    "description": "Collaborative machine learning algorithm analysis & deep neural network implementation group",
                    "members": json.dumps(["Dharshini R", "Kharizma R", "Vasudev K"]),
                    "co_attainment": 88.5,
                    "leader_name": "Dharshini R",
                    "department": "Computer Science & Engineering",
                    "status": "ACTIVE"
                },
                {
                    "id": uuid.uuid4(),
                    "name": "Squad B: Distributed Systems",
                    "description": "Cloud clustering, consensus protocols, and concurrent database synchronization",
                    "members": json.dumps(["Alice Smith", "Arun Kumar M", "Vikas Pillai"]),
                    "co_attainment": 91.2,
                    "leader_name": "Alice Smith",
                    "department": "Computer Science & Engineering",
                    "status": "ACTIVE"
                },
                {
                    "id": uuid.uuid4(),
                    "name": "Squad C: Full-Stack Architectures",
                    "description": "Microservices design, reactive frontends, and API gateway telemetry",
                    "members": json.dumps(["Rahul Verma", "Sneha Reddy", "Divya Bharathi"]),
                    "co_attainment": 85.0,
                    "leader_name": "Rahul Verma",
                    "department": "Computer Science & Engineering",
                    "status": "ACTIVE"
                },
                {
                    "id": uuid.uuid4(),
                    "name": "Squad D: Embedded & Signal Processing",
                    "description": "Hardware description languages, firmware verification, and DSP filtering",
                    "members": json.dumps(["Ananya Sharma", "Karthik Venkatesh", "Meera Krishnan"]),
                    "co_attainment": 89.0,
                    "leader_name": "Ananya Sharma",
                    "department": "Electronics & Communication Engineering",
                    "status": "ACTIVE"
                }
            ]

            for g in sample_groups:
                await session.execute(text("""
                    INSERT INTO student_groups (id, name, description, members, co_attainment, leader_name, department, status, created_at, updated_at)
                    VALUES (:id, :name, :description, CAST(:members AS jsonb), :co_attainment, :leader_name, :department, :status, NOW(), NOW())
                """), g)
            await session.commit()
            print("Successfully seeded initial student squads!")

if __name__ == "__main__":
    asyncio.run(setup())
