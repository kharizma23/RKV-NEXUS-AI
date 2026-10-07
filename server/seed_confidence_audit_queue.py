import asyncio
import uuid
import json
from datetime import datetime, timezone
from sqlalchemy import text
from app.database.session import AsyncSessionLocal

async def seed_confidence_queue():
    async with AsyncSessionLocal() as session:
        # 1. First clean up any previous demo confidence queue items to make seeding idempotent
        await session.execute(text("DELETE FROM student_answers WHERE status = 'PENDING_AUDIT' AND evaluator_feedback LIKE '%[CONFIDENCE_AUDIT_DEMO]%'"))
        await session.commit()

        # 2. Get students
        res_dharshini = await session.execute(text("SELECT sp.id FROM student_profiles sp JOIN users u ON sp.user_id = u.id WHERE sp.student_id_number = '717621CSR045' LIMIT 1"))
        dharshini_id = res_dharshini.scalar_one_or_none()
        if not dharshini_id:
            res_d = await session.execute(text("SELECT id FROM student_profiles LIMIT 1"))
            dharshini_id = res_d.scalar_one()

        res_kharizma = await session.execute(text("SELECT sp.id FROM student_profiles sp JOIN users u ON sp.user_id = u.id WHERE sp.student_id_number = '717621CSR078' LIMIT 1"))
        kharizma_id = res_kharizma.scalar_one_or_none()
        if not kharizma_id:
            res_k = await session.execute(text("SELECT id FROM student_profiles OFFSET 1 LIMIT 1"))
            kharizma_id = res_k.scalar_one()

        res_siddharth = await session.execute(text("SELECT sp.id FROM student_profiles sp JOIN users u ON sp.user_id = u.id WHERE sp.student_id_number = '717621CSR142' LIMIT 1"))
        siddharth_id = res_siddharth.scalar_one_or_none()
        if not siddharth_id:
            res_s = await session.execute(text("SELECT id FROM student_profiles OFFSET 2 LIMIT 1"))
            siddharth_id = res_s.scalar_one()

        # 3. Get or find an Exam and Subject
        res_exam = await session.execute(text("SELECT id, subject_id, title FROM examinations ORDER BY created_at DESC LIMIT 1"))
        exam_row = res_exam.fetchone()
        if not exam_row:
            print("Error: No examinations found in database!")
            return
        exam_id, subject_id, exam_title = exam_row
        print(f"Using Exam: {exam_title} (ID: {exam_id}, Subject: {subject_id})")

        now = datetime.now(timezone.utc)

        # 4. Questions Data
        records_to_seed = [
            {
                "student_id": dharshini_id,
                "confidence": 0.45,
                "ai_marks": 4.5,
                "max_marks": 10.0,
                "prompt": "Explain Raft consensus leader election mechanism, election timeouts, and how split votes are mitigated.",
                "rubric": {
                    "State Transitions (Follower -> Candidate -> Leader)": 3.0,
                    "RequestVote & Heartbeat RPC Protocols": 4.0,
                    "Randomized Election Timeouts & Split Vote Handling": 3.0
                },
                "student_answer": (
                    "When a follower node experiences an election timeout without receiving AppendEntries heartbeats from the leader, "
                    "it transitions to the Candidate state and increments the current term number. It votes for itself and issues "
                    "RequestVote RPCs in parallel to all other cluster nodes. If it gathers votes from a strict majority of servers, "
                    "it transitions to Leader and immediately sends periodic empty AppendEntries heartbeats to establish authority. "
                    "Split votes happen when multiple nodes start an election at the same moment; this is mitigated by using randomized "
                    "election timeouts (e.g., between 150ms and 300ms) so one node times out first and captures the majority."
                ),
                "ai_rationale": (
                    "[CONFIDENCE_AUDIT_DEMO] Low Confidence (45%): Student mentions candidate election and AppendEntries, "
                    "but mathematical explanation of majority quorum intersection and log matching property is ambiguous. "
                    "AI docked marks due to missing step-by-step term comparison logic. Requires human faculty verification."
                ),
                "image_url": "https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=1000&auto=format&fit=crop"
            },
            {
                "student_id": kharizma_id,
                "confidence": 0.62,
                "ai_marks": 6.5,
                "max_marks": 10.0,
                "prompt": "Explain Strict Two-Phase Locking (Strict 2PL) protocol, lock acquisition rules, and why it prevents cascading aborts.",
                "rubric": {
                    "Growing Phase & Lock Types": 3.0,
                    "Strict Holding of Exclusive Locks until Commit/Abort": 4.0,
                    "Prevention of Cascading Rollbacks & Serializability": 3.0
                },
                "student_answer": (
                    "Strict Two-Phase Locking requires that every transaction obtains a Shared (S) lock prior to reading and an Exclusive (X) "
                    "lock prior to writing data items. In the growing phase, locks are acquired as needed. Crucially, Strict 2PL mandates "
                    "that all Exclusive (X) locks must be held until the transaction terminates (either commit or abort). This eliminates "
                    "Cascading Aborts because no other transaction can read uncommitted dirty data written by this transaction. Serializability "
                    "order is determined by transaction commit points."
                ),
                "ai_rationale": (
                    "[CONFIDENCE_AUDIT_DEMO] Moderate Confidence (62%): Student accurately explains Exclusive lock holding until EOT and cascading "
                    "abort prevention. However, lock escalation and potential deadlock cycles under high contention were not addressed. "
                    "Model uncertain on whether to award full credit for concurrency control analysis."
                ),
                "image_url": "https://images.unsplash.com/photo-1517842645767-c639042777db?q=80&w=1000&auto=format&fit=crop"
            },
            {
                "student_id": siddharth_id,
                "confidence": 0.71,
                "ai_marks": 7.0,
                "max_marks": 10.0,
                "prompt": "Compare Clock (Second-Chance) Page Replacement with Least Recently Used (LRU) algorithm using circular queue buffer semantics.",
                "rubric": {
                    "Circular Queue & Reference Bit Mechanism": 4.0,
                    "Page Fault Handling & Second Chance Bit Reset": 3.0,
                    "Algorithmic Complexity & Hardware Overhead Comparison": 3.0
                },
                "student_answer": (
                    "The Second-Chance Clock algorithm approximates LRU by organizing frames in a circular queue with a reference bit for each frame. "
                    "When a page fault occurs and all frames are full, the hand checks the reference bit. If 0, the page is selected for replacement; "
                    "if 1, the bit is cleared to 0 and the hand advances to the next frame. Unlike true LRU which requires continuous hardware stack or "
                    "timestamp updates on every memory access (O(1) search but high hardware overhead), Clock replacement executes in amortized O(1) time "
                    "with only a single bit per page table entry."
                ),
                "ai_rationale": (
                    "[CONFIDENCE_AUDIT_DEMO] Borderline Confidence (71%): Student provides a thorough explanation of reference bit clearing and "
                    "circular buffer mechanics. Confidence is discounted because the OCR text had minor mathematical transcription noise and "
                    "dirty-bit enhanced second chance variation was omitted."
                ),
                "image_url": "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=1000&auto=format&fit=crop"
            }
        ]

        for item in records_to_seed:
            # Create Question
            qid = uuid.uuid4()
            await session.execute(
                text("""
                    INSERT INTO questions (
                        id, subject_id, question_type, prompt, difficulty, bloom_level,
                        default_marks, negative_marks, rubric, created_at, updated_at
                    ) VALUES (
                        :id, :subj_id, 'DESCRIPTIVE', :prompt, 'MEDIUM', 'ANALYZE',
                        :marks, 0.0, :rubric, :now, :now
                    )
                """),
                {
                    "id": qid,
                    "subj_id": subject_id,
                    "prompt": item["prompt"],
                    "marks": item["max_marks"],
                    "rubric": json.dumps(item["rubric"]),
                    "now": now
                }
            )

            # Create Student Exam Attempt
            attempt_id = uuid.uuid4()
            await session.execute(
                text("""
                    INSERT INTO student_exam_attempts (
                        id, exam_id, student_id, started_at, submitted_at,
                        status, max_score, tab_switch_count
                    ) VALUES (
                        :id, :exam_id, :student_id, :now, :now,
                        'SUBMITTED', :max_score, 0
                    )
                """),
                {
                    "id": attempt_id,
                    "exam_id": exam_id,
                    "student_id": item["student_id"],
                    "max_score": item["max_marks"],
                    "now": now
                }
            )

            # Create Student Answer
            answer_id = uuid.uuid4()
            await session.execute(
                text("""
                    INSERT INTO student_answers (
                        id, attempt_id, question_id, text_response, is_flagged_for_review,
                        score_awarded, evaluator_feedback, answered_at, image_url,
                        ai_confidence_score, status, ai_suggested_marks, rubric_breakdown,
                        extracted_text
                    ) VALUES (
                        :id, :attempt_id, :question_id, :text_response, true,
                        NULL, :evaluator_feedback, :now, :image_url,
                        :ai_confidence_score, 'PENDING_AUDIT', :ai_suggested_marks, :rubric_breakdown,
                        :extracted_text
                    )
                """),
                {
                    "id": answer_id,
                    "attempt_id": attempt_id,
                    "question_id": qid,
                    "text_response": item["student_answer"],
                    "evaluator_feedback": item["ai_rationale"],
                    "image_url": item["image_url"],
                    "ai_confidence_score": item["confidence"],
                    "ai_suggested_marks": item["ai_marks"],
                    "rubric_breakdown": json.dumps(item["rubric"]),
                    "extracted_text": item["student_answer"],
                    "now": now
                }
            )
            print(f"Seeded answer {answer_id} for student {item['student_id']} (Confidence: {item['confidence']}, AI Marks: {item['ai_marks']})")

        await session.commit()
        print("\nAll 3 low-confidence student answers successfully seeded into PostgreSQL!")

asyncio.run(seed_confidence_queue())

