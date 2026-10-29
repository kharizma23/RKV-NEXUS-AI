import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_academics_flow(client: AsyncClient):
    # 1. Login as Admin
    login_res = await client.post(
        "/api/v1/auth/login",
        json={"email": "admin@test.com", "password": "AdminPass123!"}
    )
    assert login_res.status_code == 200

    # 2. Get Department ID from Seed
    inst_res = await client.get("/api/v1/institutions")
    assert inst_res.status_code == 200
    institutions = inst_res.json()
    assert len(institutions) > 0
    dept_id = institutions[0]["departments"][0]["id"]
    inst_id = institutions[0]["id"]

    # 3. Create Programme
    prog_res = await client.post(
        "/api/v1/academics/programmes",
        json={
            "department_id": dept_id,
            "name": "B.Tech Computer Science Test",
            "code": "BTECH-TEST",
            "degree_type": "B.Tech",
            "duration_years": 4
        }
    )
    assert prog_res.status_code == 201
    prog_id = prog_res.json()["id"]

    # 4. Create Academic Year & Semester
    ay_res = await client.post(
        "/api/v1/academics/academic-years",
        json={
            "institution_id": inst_id,
            "year_label": "2025-2026",
            "start_date": "2025-08-01",
            "end_date": "2026-05-31",
            "is_current": True
        }
    )
    assert ay_res.status_code == 201
    ay_id = ay_res.json()["id"]

    sem_res = await client.post(
        "/api/v1/academics/semesters",
        json={
            "academic_year_id": ay_id,
            "semester_number": 1,
            "term_type": "ODD",
            "start_date": "2025-08-01",
            "end_date": "2025-12-20",
            "is_active": True
        }
    )
    assert sem_res.status_code == 201
    sem_id = sem_res.json()["id"]

    # 5. Create Course & Subject
    course_res = await client.post(
        "/api/v1/academics/courses",
        json={
            "department_id": dept_id,
            "programme_id": prog_id,
            "code": "CS-101-TEST",
            "name": "Intro to Programming",
            "credits": 4,
            "description": "Test programming course"
        }
    )
    assert course_res.status_code == 201
    course_id = course_res.json()["id"]

    subj_res = await client.post(
        "/api/v1/academics/subjects",
        json={
            "course_id": course_id,
            "semester_id": sem_id,
            "code": "CS-101-T",
            "name": "Intro to Programming Theory",
            "subject_type": "THEORY"
        }
    )
    assert subj_res.status_code == 201
    subj_id = subj_res.json()["id"]

    # 6. Create Units & Topics in Syllabus
    unit_res = await client.post(
        "/api/v1/syllabus/units",
        json={
            "subject_id": subj_id,
            "unit_number": 1,
            "title": "Basics of Python",
            "description": "Variables and Flow Control",
            "weightage": 20
        }
    )
    assert unit_res.status_code == 201
    unit_id = unit_res.json()["id"]

    topic_res = await client.post(
        "/api/v1/syllabus/topics",
        json={
            "unit_id": unit_id,
            "topic_number": 1,
            "title": "Data Types & Variables",
            "description": "Strings, Integers, Floats"
        }
    )
    assert topic_res.status_code == 201

    # 7. Create Course Outcomes (COs)
    co_res = await client.post(
        "/api/v1/learning-outcomes/cos",
        json={
            "subject_id": subj_id,
            "code": "CO1",
            "statement": "Understand basic programming constructs in Python",
            "bloom_level": "UNDERSTAND"
        }
    )
    assert co_res.status_code == 201
