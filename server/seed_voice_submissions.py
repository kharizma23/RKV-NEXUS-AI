import asyncio
from app.database.session import async_engine
from sqlalchemy import text
import uuid

async def check_and_seed():
    async with async_engine.connect() as conn:
        # Check if table exists
        t_res = await conn.execute(text("SELECT table_name FROM information_schema.tables WHERE table_name = 'voice_submissions'"))
        t_exists = t_res.scalar()
        print("voice_submissions exists:", t_exists)

        if not t_exists:
            print("Creating voice_submissions table...")
            await conn.execute(text("""
                CREATE TABLE IF NOT EXISTS voice_submissions (
                    id UUID PRIMARY KEY,
                    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                    exam_id UUID REFERENCES examinations(id) ON DELETE SET NULL,
                    question_id UUID REFERENCES questions(id) ON DELETE SET NULL,
                    audio_url VARCHAR(500) NOT NULL,
                    transcribed_text TEXT NOT NULL,
                    duration_seconds INTEGER NOT NULL DEFAULT 0,
                    confidence_score DOUBLE PRECISION NOT NULL DEFAULT 0.95,
                    language_code VARCHAR(10) NOT NULL DEFAULT 'en',
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                )
            """))
            await conn.commit()

        # Find 2 real student users
        u_res = await conn.execute(text("SELECT id, full_name FROM users ORDER BY created_at ASC LIMIT 4"))
        users = u_res.fetchall()
        print("Users found:", users)

        # Check existing count
        count_res = await conn.execute(text("SELECT COUNT(*) FROM voice_submissions"))
        print("Existing voice submissions count:", count_res.scalar())

        # Find an exam and question if any
        ex_res = await conn.execute(text("SELECT id FROM examinations LIMIT 1"))
        exam_id = ex_res.scalar()
        q_res = await conn.execute(text("SELECT id FROM questions LIMIT 1"))
        q_id = q_res.scalar()

        # Insert 2 realistic submissions
        sub1_id = uuid.uuid4()
        user1_id = users[0][0] if users else None

        sub2_id = uuid.uuid4()
        user2_id = users[1][0] if len(users) > 1 else user1_id

        print(f"Seeding with user1={user1_id}, user2={user2_id}")

        await conn.execute(text("""
            INSERT INTO voice_submissions (
                id, student_id, exam_id, question_id, audio_url,
                transcribed_text, duration_seconds, confidence_score,
                language_code, created_at
            ) VALUES (
                :id, :student_id, :exam_id, :question_id, :audio_url,
                :transcribed_text, :duration_seconds, :confidence_score,
                :language_code, NOW() - INTERVAL '25 minutes'
            )
        """), {
            "id": sub1_id,
            "student_id": user1_id,
            "exam_id": exam_id,
            "question_id": q_id,
            "audio_url": "https://cdn.rkvnexus.edu/audio/demo_v1_dharshini_acid.mp3",
            "transcribed_text": "In distributed database systems, the Two-Phase Commit protocol guarantees atomicity across multiple nodes. During the prepare phase, the coordinator asks all participants if they can commit. If all reply yes with a vote commit, the coordinator sends a global commit in phase two; otherwise, if any node aborts, the entire transaction rolls back.",
            "duration_seconds": 42,
            "confidence_score": 96.8,
            "language_code": "EN"
        })

        await conn.execute(text("""
            INSERT INTO voice_submissions (
                id, student_id, exam_id, question_id, audio_url,
                transcribed_text, duration_seconds, confidence_score,
                language_code, created_at
            ) VALUES (
                :id, :student_id, :exam_id, :question_id, :audio_url,
                :transcribed_text, :duration_seconds, :confidence_score,
                :language_code, NOW() - INTERVAL '10 minutes'
            )
        """), {
            "id": sub2_id,
            "student_id": user2_id,
            "exam_id": exam_id,
            "question_id": q_id,
            "audio_url": "https://cdn.rkvnexus.edu/audio/demo_v2_kharizma_dijkstra.mp3",
            "transcribed_text": "Dijkstra's algorithm uses a greedy approach to find the shortest path from a single source node to all other vertices in a weighted graph with non-negative edge weights. Using a min-priority queue binary heap, the overall asymptotic time complexity is Big-O of E plus V log V, making it optimal for sparse networks.",
            "duration_seconds": 38,
            "confidence_score": 94.5,
            "language_code": "EN"
        })

        await conn.commit()
        print("Successfully seeded 2 realistic voice submissions!")

asyncio.run(check_and_seed())
