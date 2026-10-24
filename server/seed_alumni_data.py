import asyncio
import uuid
from datetime import datetime, UTC
from sqlalchemy import text
from app.database.session import AsyncSessionLocal

sample_alumni = [
    {
        "name": "Dharshini R",
        "batch_year": 2024,
        "degree": "B.E. Computer Science & Engineering",
        "current_company": "Google",
        "job_role": "Software Development Engineer III (L5)",
        "package_lpa": 48.5,
        "location": "Bengaluru, India",
        "email": "dharshini.r@alumni.rkv.edu",
        "linkedin_url": "https://linkedin.com/in/dharshini-r-google",
        "is_notable": True,
        "domain": "CLOUD_INFRASTRUCTURE"
    },
    {
        "name": "Arun Kumar M",
        "batch_year": 2024,
        "degree": "B.Tech. Artificial Intelligence & Data Science",
        "current_company": "NVIDIA",
        "job_role": "Senior AI Research Scientist",
        "package_lpa": 45.0,
        "location": "Bengaluru, India",
        "email": "arun.kumar@alumni.rkv.edu",
        "linkedin_url": "https://linkedin.com/in/arunkumar-nvidia",
        "is_notable": True,
        "domain": "ARTIFICIAL_INTELLIGENCE"
    },
    {
        "name": "Alice Smith",
        "batch_year": 2024,
        "degree": "B.E. Computer Science & Engineering",
        "current_company": "Microsoft",
        "job_role": "Principal Cloud Solution Architect",
        "package_lpa": 38.0,
        "location": "Hyderabad, India",
        "email": "alice.smith@alumni.rkv.edu",
        "linkedin_url": "https://linkedin.com/in/alice-smith-msft",
        "is_notable": True,
        "domain": "DISTRIBUTED_SYSTEMS"
    },
    {
        "name": "Karthik Subramanian",
        "batch_year": 2025,
        "degree": "B.E. Electronics & Communication",
        "current_company": "Apple",
        "job_role": "Silicon Firmware Systems Engineer",
        "package_lpa": 42.0,
        "location": "Bengaluru, India",
        "email": "karthik.s@alumni.rkv.edu",
        "linkedin_url": "https://linkedin.com/in/karthik-subramanian-apple",
        "is_notable": True,
        "domain": "HARDWARE_EMBEDDED"
    },
    {
        "name": "Sneha Reddy",
        "batch_year": 2025,
        "degree": "B.E. Computer Science & Engineering",
        "current_company": "Uber",
        "job_role": "Staff Backend Engineer",
        "package_lpa": 36.5,
        "location": "London, UK",
        "email": "sneha.reddy@alumni.rkv.edu",
        "linkedin_url": "https://linkedin.com/in/sneha-reddy-uber",
        "is_notable": True,
        "domain": "MICROSERVICES"
    },
    {
        "name": "Rahul Verma",
        "batch_year": 2025,
        "degree": "B.Tech. Information Technology",
        "current_company": "Amazon",
        "job_role": "SDE II - AWS Lambda Platform",
        "package_lpa": 34.0,
        "location": "Seattle, USA",
        "email": "rahul.verma@alumni.rkv.edu",
        "linkedin_url": "https://linkedin.com/in/rahul-verma-aws",
        "is_notable": False,
        "domain": "SERVERLESS"
    },
    {
        "name": "Divya Bharathi",
        "batch_year": 2025,
        "degree": "B.E. Computer Science & Engineering",
        "current_company": "Meta",
        "job_role": "Full Stack Engineer (Reality Labs)",
        "package_lpa": 41.0,
        "location": "San Francisco, USA",
        "email": "divya.b@alumni.rkv.edu",
        "linkedin_url": "https://linkedin.com/in/divya-bharathi-meta",
        "is_notable": True,
        "domain": "AR_VR"
    },
    {
        "name": "Vikas Pillai",
        "batch_year": 2026,
        "degree": "B.E. Computer Science & Engineering",
        "current_company": "Goldman Sachs",
        "job_role": "Quantitative Technology Analyst",
        "package_lpa": 32.0,
        "location": "Singapore",
        "email": "vikas.pillai@alumni.rkv.edu",
        "linkedin_url": "https://linkedin.com/in/vikas-pillai-gs",
        "is_notable": False,
        "domain": "FINTECH"
    },
    {
        "name": "Pooja Hegde",
        "batch_year": 2026,
        "degree": "B.Tech. Data Science",
        "current_company": "Adobe",
        "job_role": "Machine Learning Engineer (Creative Cloud)",
        "package_lpa": 30.5,
        "location": "Noida, India",
        "email": "pooja.hegde@alumni.rkv.edu",
        "linkedin_url": "https://linkedin.com/in/pooja-hegde-adobe",
        "is_notable": False,
        "domain": "GENERATIVE_AI"
    },
    {
        "name": "Gautam Menon",
        "batch_year": 2026,
        "degree": "B.E. Mechanical Engineering",
        "current_company": "Tesla",
        "job_role": "Autonomous Vehicle Simulation Engineer",
        "package_lpa": 39.0,
        "location": "Berlin, Germany",
        "email": "gautam.m@alumni.rkv.edu",
        "linkedin_url": "https://linkedin.com/in/gautam-menon-tesla",
        "is_notable": True,
        "domain": "AUTOMOTIVE_AI"
    },
    {
        "name": "Kavya Murugan",
        "batch_year": 2026,
        "degree": "B.E. Computer Science & Engineering",
        "current_company": "Atlassian",
        "job_role": "Software Engineer II (Jira Cloud)",
        "package_lpa": 28.0,
        "location": "Bengaluru, India",
        "email": "kavya.m@alumni.rkv.edu",
        "linkedin_url": "https://linkedin.com/in/kavya-murugan-jira",
        "is_notable": False,
        "domain": "DEVOPS"
    },
    {
        "name": "Siddharth Rao",
        "batch_year": 2025,
        "degree": "B.E. Electrical & Electronics",
        "current_company": "Intel Corporation",
        "job_role": "Hardware Acceleration Engineer",
        "package_lpa": 26.5,
        "location": "Hyderabad, India",
        "email": "siddharth.rao@alumni.rkv.edu",
        "linkedin_url": "https://linkedin.com/in/siddharth-rao-intel",
        "is_notable": False,
        "domain": "SEMICONDUCTORS"
    }
]

async def seed():
    async with AsyncSessionLocal() as session:
        # Clear out any legacy null-named entries
        await session.execute(text("DELETE FROM alumni WHERE name IS NULL"))
        await session.commit()
        
        res = await session.execute(text("SELECT count(*) FROM alumni WHERE name IS NOT NULL"))
        named_count = res.scalar() or 0
        print(f"Named alumni count: {named_count}")

        if named_count < 10:
            for item in sample_alumni:
                stmt = text("""
                    INSERT INTO alumni (
                        id, graduation_year, current_company, job_role, package,
                        linkedin_url, domain, created_at, updated_at,
                        name, batch_year, degree, package_lpa, location, email, is_notable
                    ) VALUES (
                        :id, :batch_year, :current_company, :job_role, CAST(:pkg_float AS double precision),
                        :linkedin_url, :domain, :created_at, :updated_at,
                        :name, :batch_year, :degree, CAST(:pkg_num AS numeric), :location, :email, :is_notable
                    )
                """)
                await session.execute(stmt, {
                    "id": uuid.uuid4(),
                    "current_company": item["current_company"],
                    "job_role": item["job_role"],
                    "pkg_float": float(item["package_lpa"]),
                    "pkg_num": float(item["package_lpa"]),
                    "linkedin_url": item["linkedin_url"],
                    "domain": item["domain"],
                    "created_at": datetime.now(UTC),
                    "updated_at": datetime.now(UTC),
                    "name": item["name"],
                    "batch_year": item["batch_year"],
                    "degree": item["degree"],
                    "location": item["location"],
                    "email": item["email"],
                    "is_notable": item["is_notable"]
                })
            await session.commit()
            print(f"Successfully seeded {len(sample_alumni)} alumni records!")
        else:
            print(f"Already {named_count} alumni present.")

if __name__ == "__main__":
    asyncio.run(seed())
