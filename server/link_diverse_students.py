import asyncio
import uuid
from sqlalchemy import text
from app.database.session import async_engine

STUDENTS = [
    ("dharshini.r@institution.edu", "Dharshini R", "717621CSR045", "Computer Science and Engineering"),
    ("kharizma.v@institution.edu", "Kharizma Vasudev", "717621CSR078", "Artificial Intelligence & Data Science"),
    ("arun.kumar@institution.edu", "Arun Kumar S", "717621CSR012", "Information Technology"),
    ("priyanka.b@institution.edu", "Priyanka Balakrishnan", "717621CSR104", "Computer Science and Engineering"),
    ("siddharth.m@institution.edu", "Siddharth Menon", "717621CSR142", "Electrical & Computer Engineering"),
    ("meera.c@institution.edu", "Meera Chandran", "717621CSR090", "Software Engineering"),
    ("vignesh.k@institution.edu", "Vignesh Karthik", "717621CSR176", "Artificial Intelligence & Machine Learning")
]

EXAM_NAMES = [
    "Database Management Systems (CS-301)",
    "Design & Analysis of Algorithms (CS-402)",
    "Operating Systems & Architecture (CS-204)",
    "Compiler Design & Automata (CS-503)",
    "Computer Networks & Protocols (CS-302)",
    "Cloud Computing & Distributed Systems (CS-601)",
    "Deep Learning & Neural Architectures (AI-401)"
]

async def update_students():
    async with async_engine.connect() as conn:
        # Fetch current answers
        res = await conn.execute(text("SELECT id, attempt_id FROM student_answers ORDER BY answered_at ASC"))
        ans_rows = res.fetchall()
        print(f"Assigning {len(ans_rows)} answers to distinct student profiles...")

        # Get subject
        subj_res = await conn.execute(text("SELECT id FROM subjects LIMIT 1"))
        subj_id = subj_res.scalar()

        for idx, (ans_id, attempt_id) in enumerate(ans_rows):
            s_idx = idx % len(STUDENTS)
            email, name, roll, dept = STUDENTS[s_idx]
            exam_title = EXAM_NAMES[idx % len(EXAM_NAMES)]

            # Check if user exists
            u_res = await conn.execute(text("SELECT id FROM users WHERE email = :email"), {"email": email})
            u_id = u_res.scalar()
            if not u_id:
                u_id = uuid.uuid4()
                await conn.execute(text("""
                    INSERT INTO users (id, email, password_hash, full_name, is_active, is_approved, is_verified, created_at, updated_at)
                    VALUES (:id, :email, 'hashed_demo_pw', :name, true, true, true, NOW(), NOW())
                    ON CONFLICT (email) DO NOTHING
                """), {"id": u_id, "email": email, "name": name})

            # Check student_profile
            sp_res = await conn.execute(text("SELECT id FROM student_profiles WHERE user_id = :uid"), {"uid": u_id})
            sp_id = sp_res.scalar()
            if not sp_id:
                sp_id = uuid.uuid4()
                await conn.execute(text("""
                    INSERT INTO student_profiles (id, user_id, student_id_number, created_at, updated_at)
                    VALUES (:id, :uid, :roll, NOW(), NOW())
                """), {"id": sp_id, "uid": u_id, "roll": roll})

            # Check or create exam with nice title
            ex_res = await conn.execute(text("SELECT id FROM examinations WHERE title = :title"), {"title": exam_title})
            ex_id = ex_res.scalar()
            if not ex_id:
                ex_id = uuid.uuid4()
                await conn.execute(text("""
                    INSERT INTO examinations (id, subject_id, title, exam_type, total_marks, duration_minutes, start_time, end_time, is_published, status, created_at, updated_at)
                    VALUES (:id, :subj_id, :title, 'SEMESTER', 100, 180, NOW(), NOW() + INTERVAL '3 hours', true, 'PUBLISHED', NOW(), NOW())
                    ON CONFLICT DO NOTHING
                """), {"id": ex_id, "subj_id": subj_id, "title": exam_title})

            # Update student_exam_attempts
            await conn.execute(text("""
                UPDATE student_exam_attempts
                SET student_id = :sid, exam_id = :eid
                WHERE id = :aid
            """), {"sid": sp_id, "eid": ex_id, "aid": attempt_id})

        await conn.commit()
        print("Updated student_exam_attempts with distinct student names and exam titles successfully!")

asyncio.run(update_students())
