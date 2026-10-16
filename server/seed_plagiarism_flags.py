import asyncio
import json
import uuid
from app.database.session import async_engine
from sqlalchemy import text

SEED_FLAGS = [
    {
        "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        "student_a_name": "Dharshini R",
        "student_a_roll": "23CSE001",
        "student_b_name": "Kharizma Vasudev",
        "student_b_roll": "23CSE002",
        "exam_name": "Distributed Systems Mid-Term",
        "question_snippet": "Explain Raft consensus leader election and log replication guarantees across network partitions.",
        "similarity_score": 94.5,
        "answer_a_text": "In the Raft consensus algorithm, leader election begins with randomized election timeouts between 150ms and 300ms. When a follower node's timer expires, it increments the current term, transitions to candidate state, votes for itself, and broadcasts RequestVote RPCs to all peers. If it receives votes from a majority of nodes, it becomes leader and immediately sends empty AppendEntries heartbeats.",
        "answer_b_text": "In the Raft consensus algorithm, leader election begins with randomized election timeouts between 150ms and 300ms. When a follower timer expires, it increments the current term, transitions to candidate state, votes for itself, and broadcasts RequestVote RPCs to all cluster peers. Receiving votes from a majority of nodes makes it leader and it immediately sends empty AppendEntries heartbeats.",
        "answer_a_image": "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80",
        "answer_b_image": "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop&q=80",
        "matching_phrases": [
            "leader election begins with randomized election timeouts between 150ms and 300ms",
            "increments the current term, transitions to candidate state, votes for itself",
            "broadcasts RequestVote RPCs to all",
            "receives votes from a majority of nodes",
            "immediately sends empty AppendEntries heartbeats"
        ]
    },
    {
        "id": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
        "student_a_name": "Arun Kumar S",
        "student_a_roll": "23CSE012",
        "student_b_name": "Siddharth Menon",
        "student_b_roll": "23CSE142",
        "exam_name": "Database Management Systems IA-1",
        "question_snippet": "Prove that Strict Two-Phase Locking (Strict 2PL) guarantees conflict serializability and prevents cascading aborts.",
        "similarity_score": 89.2,
        "answer_a_text": "Strict Two-Phase Locking (Strict 2PL) requires all exclusive locks held by a transaction to be retained until the transaction commits or aborts. In the growing phase, locks are acquired. In the shrinking phase at transaction completion, all write locks are released simultaneously. Since no transaction reads uncommitted write locks, cascading rollbacks are mathematically impossible.",
        "answer_b_text": "Strict Two-Phase Locking (Strict 2PL) requires all exclusive write locks held by a transaction to be retained until the transaction commits or aborts. In the expanding phase, locks are acquired. In the shrinking phase at transaction termination, all write locks are released simultaneously. Because no other transaction can read uncommitted dirty writes, cascading rollbacks are impossible.",
        "answer_a_image": "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600&auto=format&fit=crop&q=80",
        "answer_b_image": "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&auto=format&fit=crop&q=80",
        "matching_phrases": [
            "Strict Two-Phase Locking (Strict 2PL) requires all exclusive",
            "held by a transaction to be retained until the transaction commits or aborts",
            "locks are acquired. In the shrinking phase",
            "all write locks are released simultaneously",
            "cascading rollbacks are"
        ]
    },
    {
        "id": "c3d4e5f6-a7b8-9012-cdef-123456789012",
        "student_a_name": "Priyanka Balakrishnan",
        "student_a_roll": "23CSE104",
        "student_b_name": "Meera Chandran",
        "student_b_roll": "23CSE090",
        "exam_name": "Operating Systems Comprehensive",
        "question_snippet": "Contrast LRU, Second-Chance (Clock), and Optimal page replacement algorithms under high frame allocation contention.",
        "similarity_score": 91.8,
        "answer_a_text": "Second-Chance Clock algorithm approximates LRU page replacement using a single reference bit in each page table entry. The clock hand sweeps circularly through frames. If the reference bit is 1, the bit is cleared to 0 and the hand advances. The first frame encountered with a reference bit of 0 is selected as victim for eviction. This gives O(1) amortized frame eviction time.",
        "answer_b_text": "The Second-Chance Clock algorithm approximates LRU page replacement using a single reference bit in each page table entry. The clock pointer sweeps circularly through physical frames. If the reference bit is 1, the bit is cleared to 0 and the pointer advances. The first frame found with reference bit of 0 is selected as victim for eviction, providing O(1) amortized frame eviction time.",
        "answer_a_image": "https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=600&auto=format&fit=crop&q=80",
        "answer_b_image": "https://images.unsplash.com/photo-1513258496099-48168024aec0?w=600&auto=format&fit=crop&q=80",
        "matching_phrases": [
            "Second-Chance Clock algorithm approximates LRU page replacement",
            "using a single reference bit in each page table entry",
            "sweeps circularly through",
            "If the reference bit is 1, the bit is cleared to 0 and the",
            "first frame encountered with a reference bit of 0 is selected as victim for eviction",
            "O(1) amortized frame eviction time"
        ]
    }
]

async def seed():
    async with async_engine.connect() as conn:
        await conn.execute(text("""
            CREATE TABLE IF NOT EXISTS flagged_plagiarism_pairs (
                id UUID PRIMARY KEY,
                student_a_name VARCHAR(255) NOT NULL,
                student_a_roll VARCHAR(50) NOT NULL,
                student_b_name VARCHAR(255) NOT NULL,
                student_b_roll VARCHAR(50) NOT NULL,
                exam_name VARCHAR(255) NOT NULL,
                question_snippet TEXT NOT NULL,
                similarity_score DOUBLE PRECISION NOT NULL,
                answer_a_text TEXT NOT NULL,
                answer_b_text TEXT NOT NULL,
                answer_a_image VARCHAR(500),
                answer_b_image VARCHAR(500),
                matching_phrases JSONB DEFAULT '[]'::jsonb,
                status VARCHAR(50) DEFAULT 'PENDING',
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            )
        """))

        # Clear old and insert fresh
        await conn.execute(text("DELETE FROM flagged_plagiarism_pairs WHERE status = 'PENDING'"))

        for f in SEED_FLAGS:
            await conn.execute(text("""
                INSERT INTO flagged_plagiarism_pairs (
                    id, student_a_name, student_a_roll, student_b_name, student_b_roll,
                    exam_name, question_snippet, similarity_score, answer_a_text,
                    answer_b_text, answer_a_image, answer_b_image, matching_phrases,
                    status, created_at, updated_at
                ) VALUES (
                    :id, :student_a_name, :student_a_roll, :student_b_name, :student_b_roll,
                    :exam_name, :question_snippet, :similarity_score, :answer_a_text,
                    :answer_b_text, :answer_a_image, :answer_b_image, CAST(:matching_phrases AS jsonb),
                    'PENDING', NOW(), NOW()
                )
            """), {
                "id": uuid.UUID(f["id"]),
                "student_a_name": f["student_a_name"],
                "student_a_roll": f["student_a_roll"],
                "student_b_name": f["student_b_name"],
                "student_b_roll": f["student_b_roll"],
                "exam_name": f["exam_name"],
                "question_snippet": f["question_snippet"],
                "similarity_score": f["similarity_score"],
                "answer_a_text": f["answer_a_text"],
                "answer_b_text": f["answer_b_text"],
                "answer_a_image": f["answer_a_image"],
                "answer_b_image": f["answer_b_image"],
                "matching_phrases": json.dumps(f["matching_phrases"])
            })

        await conn.commit()
        print("Successfully created table and seeded 3 realistic plagiarism flagged pair records!")

asyncio.run(seed())
