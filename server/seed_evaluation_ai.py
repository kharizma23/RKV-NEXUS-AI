import asyncio
import uuid
from datetime import datetime, UTC
from sqlalchemy import text
from app.database.session import async_engine

SAMPLE_RECORDS = [
    {
        "student_name": "Dharshini R",
        "roll_number": "717621CSR045",
        "exam_title": "Database Management Systems (DBMS-301)",
        "question_prompt": "Explain ACID properties in relational database management systems and contrast Pessimistic vs Optimistic concurrency control.",
        "student_response": "ACID stands for Atomicity, Consistency, Isolation, and Durability. Atomicity means all or nothing. Isolation ensures transactions don't interfere. Concurrency control uses locking mechanisms to prevent conflicting write operations.",
        "extracted_text": "ACID: Atomicity, Consistency, Isolation, Durability. Isolation prevents interference. Uses locking for concurrency.",
        "ai_suggested_marks": 6.5,
        "max_marks": 10.0,
        "ai_confidence_score": 0.58,
        "status": "PENDING_AUDIT",
        "ai_feedback": "You lost 3.5 marks here. The explanation omitted Durability write-ahead logging (WAL) guarantees and did not provide comparative mathematical complexity or timestamp analysis between Optimistic and Pessimistic concurrency.",
        "counterfactual_feedback": "If you had explicitly defined the Durability mechanism (WAL logging / non-volatile commit flush) and contrasted 2-Phase Locking (Pessimistic) with Validation-Phase Rollbacks (Optimistic), you would have gained +3.5 marks to score full marks.",
        "rubric_breakdown": {
            "Atomicity & Consistency definitions": {"awarded": 2.0, "max": 2.0, "status": "SATISFIED"},
            "Isolation levels & Durability write logs": {"awarded": 1.5, "max": 3.0, "status": "PARTIAL", "note": "Missing WAL protocol explanation"},
            "Pessimistic vs Optimistic concurrency": {"awarded": 3.0, "max": 5.0, "status": "PARTIAL", "note": "Failed to mention abort frequency trade-offs"}
        }
    },
    {
        "student_name": "Kharizma Vasudev",
        "roll_number": "717621CSR078",
        "exam_title": "Design & Analysis of Algorithms (DAA-402)",
        "question_prompt": "Prove the master theorem for divide-and-conquer recurrences of the form T(n) = aT(n/b) + f(n) and analyze the boundary case when f(n) = Theta(n^(log_b(a)) * log^k(n)).",
        "student_response": "We express T(n) as a recursion tree where height is log_b(n). Work done at level i is a^i * f(n / b^i). Summing over all levels yields three standard cases depending on whether leaves dominate or root dominates. For the polylogarithmic extension, we multiply by log(n).",
        "extracted_text": "Recursion tree height log_b(n). Level i work: a^i * f(n/b^i). Three cases based on leaf vs root dominance. Extended case adds log(n) factor.",
        "ai_suggested_marks": 5.0,
        "max_marks": 10.0,
        "ai_confidence_score": 0.64,
        "status": "PENDING_AUDIT",
        "ai_feedback": "You lost 5 marks here. The inductive base step was absent and the regularity condition for Case 3 (af(n/b) <= cf(n) for c < 1) was completely ignored.",
        "counterfactual_feedback": "If you had rigorously shown the geometric series summation across tree levels and verified the regularity condition af(n/b) <= c*f(n) for c < 1, you would have gained +5.0 marks.",
        "rubric_breakdown": {
            "Recursion tree formulation": {"awarded": 3.0, "max": 3.0, "status": "SATISFIED"},
            "Geometric sum divergence/convergence": {"awarded": 1.0, "max": 3.0, "status": "PARTIAL"},
            "Extended case boundary proof & regularity condition": {"awarded": 1.0, "max": 4.0, "status": "LOW_CONFIDENCE"}
        }
    },
    {
        "student_name": "Arun Kumar S",
        "roll_number": "717621CSR012",
        "exam_title": "Operating Systems & Virtualization (OS-204)",
        "question_prompt": "Describe the Four Necessary Conditions for Deadlock and explain the Banker's Algorithm for Deadlock Avoidance with a concrete allocation matrix example.",
        "student_response": "Deadlock happens when mutual exclusion, hold and wait, no preemption, and circular wait happen at once. Banker algorithm calculates Need = Max - Allocation. If Work >= Need, resource is granted.",
        "extracted_text": "Conditions: Mutual exclusion, Hold and wait, No preemption, Circular wait. Need = Max - Allocation. Grants resource if system stays safe.",
        "ai_suggested_marks": 7.0,
        "max_marks": 10.0,
        "ai_confidence_score": 0.72,
        "status": "PENDING_AUDIT",
        "ai_feedback": "You lost 3 marks here. While the four conditions were accurately listed, the numeric safety check trace with the allocation matrix was incomplete.",
        "counterfactual_feedback": "If you had included a 3-process, 3-resource tabular safety test trace demonstrating sequence <P1, P3, P0, P2>, you would have gained +3.0 marks.",
        "rubric_breakdown": {
            "Coffman four deadlock conditions": {"awarded": 4.0, "max": 4.0, "status": "SATISFIED"},
            "Banker safety algorithm equations": {"awarded": 2.0, "max": 3.0, "status": "SATISFIED"},
            "Matrix state trace demonstration": {"awarded": 1.0, "max": 3.0, "status": "PARTIAL"}
        }
    },
    {
        "student_name": "Priyanka Balakrishnan",
        "roll_number": "717621CSR104",
        "exam_title": "Compiler Engineering & Automata (CS-503)",
        "question_prompt": "Construct the Canonical LR(1) parsing collection for an ambiguous expression grammar and demonstrate shift-reduce conflict resolution.",
        "student_response": "LR(1) uses lookahead symbols to avoid reduction conflicts. Items have format [A -> alpha . beta, a]. In state 4, when seeing '*', shift takes precedence over '+' to enforce operator precedence.",
        "extracted_text": "LR(1) lookaheads [A -> alpha . beta, a]. In state 4 with '*' vs '+', shift resolves in favor of multiplication precedence.",
        "ai_suggested_marks": 6.0,
        "max_marks": 10.0,
        "ai_confidence_score": 0.52,
        "status": "PENDING_AUDIT",
        "ai_feedback": "You lost 4 marks here. Handwritten parsing DFA states were ambiguous in diagram scan and item lookahead sets were partially illegible.",
        "counterfactual_feedback": "If you had drawn the complete closure set for Item I0 and I1 with explicit comma lookaheads {$}, you would have gained +4.0 marks.",
        "rubric_breakdown": {
            "Item representation syntax": {"awarded": 2.0, "max": 2.0, "status": "SATISFIED"},
            "Closure and GOTO function generation": {"awarded": 2.0, "max": 4.0, "status": "UNCERTAIN_OCR"},
            "Conflict resolution operator associativity": {"awarded": 2.0, "max": 4.0, "status": "PARTIAL"}
        }
    },
    {
        "student_name": "Siddharth Menon",
        "roll_number": "717621CSR142",
        "exam_title": "Computer Networks & Distributed Systems (CS-302)",
        "question_prompt": "Explain TCP Congestion Control mechanisms (Slow Start, Congestion Avoidance, Fast Retransmit, Fast Recovery) and contrast AIMD with CUBIC.",
        "student_response": "TCP starts with Slow Start where cwnd doubles every RTT. At ssthresh it enters Congestion Avoidance increasing by 1 MSS. On 3 duplicate ACKs it does fast retransmit and halves cwnd. CUBIC uses cubic function instead of linear increase.",
        "extracted_text": "Slow start doubles cwnd per RTT. Congestion avoidance +1 MSS. 3 dup ACKs triggers fast retransmit. CUBIC uses cubic time window function.",
        "ai_suggested_marks": 7.5,
        "max_marks": 10.0,
        "ai_confidence_score": 0.77,
        "status": "PENDING_AUDIT",
        "ai_feedback": "You lost 2.5 marks here. The mathematical formulation of the cubic inflection point W_max and scale parameter C was missing.",
        "counterfactual_feedback": "If you had stated the CUBIC window formula W_cubic(t) = C*(t - K)^3 + W_max, you would have gained +2.5 marks for full credit.",
        "rubric_breakdown": {
            "Four phase transitions & thresholds": {"awarded": 4.5, "max": 5.0, "status": "SATISFIED"},
            "AIMD linear vs multiplicative response": {"awarded": 2.0, "max": 2.5, "status": "SATISFIED"},
            "CUBIC concave/convex mathematical proof": {"awarded": 1.0, "max": 2.5, "status": "PARTIAL"}
        }
    },
    {
        "student_name": "Meera Chandran",
        "roll_number": "717621CSR090",
        "exam_title": "Cloud Computing & Distributed Storage (CS-601)",
        "question_prompt": "Analyze the CAP theorem in distributed databases and discuss PACELC trade-offs with AWS DynamoDB and Apache Cassandra examples.",
        "student_response": "CAP states consistency, availability, partition tolerance cannot all be achieved simultaneously during network partition. PACELC adds Else Latency or Consistency. Cassandra chooses AP and EL, DynamoDB is tunable.",
        "extracted_text": "CAP: Consistency, Availability, Partition tolerance. PACELC adds: If Partition -> A or C; Else -> L or C. Cassandra is AP/PA/EL.",
        "ai_suggested_marks": 8.0,
        "max_marks": 10.0,
        "ai_confidence_score": 0.88,
        "status": "AUDITED",
        "ai_feedback": "You lost 2 marks here. Strong read quorum formula R + W > N was not demonstrated.",
        "counterfactual_feedback": "If you had included the strict quorum inequality R + W > N and explained vector clocks for anti-entropy repair, you would have scored 10/10.",
        "rubric_breakdown": {
            "CAP theorem proof": {"awarded": 3.0, "max": 3.0, "status": "SATISFIED"},
            "PACELC trade-off matrix": {"awarded": 3.0, "max": 3.0, "status": "SATISFIED"},
            "Tunable consistency quorum formulas": {"awarded": 2.0, "max": 4.0, "status": "PARTIAL"}
        }
    },
    {
        "student_name": "Vignesh Karthik",
        "roll_number": "717621CSR176",
        "exam_title": "Machine Learning & Neural Architectures (AI-401)",
        "question_prompt": "Explain Scaled Dot-Product Attention in Transformers and why the scaling factor sqrt(d_k) is critical for numerical stability.",
        "student_response": "Attention is softmax((Q*K^T)/sqrt(d_k))*V. We divide by sqrt(d_k) because for large dimensions the dot product gets very big, pushing softmax into regions with tiny gradients.",
        "extracted_text": "Softmax((Q K^T) / sqrt(d_k)) V. Scaling avoids vanishing gradients in large vector dimensions.",
        "ai_suggested_marks": 7.5,
        "max_marks": 10.0,
        "ai_confidence_score": 0.76,
        "status": "PENDING_AUDIT",
        "ai_feedback": "You lost 2.5 marks here. The statistical variance proof showing Var(sum(q_i * k_i)) = d_k for independent mean-zero unit-variance variables was omitted.",
        "counterfactual_feedback": "If you had proven that the dot product of two independent Gaussian vectors has variance d_k, explaining why division by sqrt(d_k) normalizes variance to 1.0, you would have gained +2.5 marks.",
        "rubric_breakdown": {
            "Attention formulation": {"awarded": 3.0, "max": 3.0, "status": "SATISFIED"},
            "Vanishing gradient justification": {"awarded": 3.0, "max": 3.0, "status": "SATISFIED"},
            "Variance normalization proof": {"awarded": 1.5, "max": 4.0, "status": "PARTIAL"}
        }
    }
]

async def seed():
    async with async_engine.connect() as conn:
        # Check subject
        subj_res = await conn.execute(text("SELECT id FROM subjects LIMIT 1"))
        subj_id = subj_res.scalar()
        if not subj_id:
            subj_id = uuid.uuid4()
            await conn.execute(text("""
                INSERT INTO subjects (id, code, name, credits, created_at, updated_at)
                VALUES (:id, 'CS301', 'Database Engineering', 4, NOW(), NOW())
            """), {"id": subj_id})
            await conn.commit()

        # Check if we have an exam, student_profile, question
        exam_res = await conn.execute(text("SELECT id FROM examinations LIMIT 1"))
        exam_id = exam_res.scalar()
        if not exam_id:
            exam_id = uuid.uuid4()
            await conn.execute(text("""
                INSERT INTO examinations (id, subject_id, title, exam_type, total_marks, duration_minutes, start_time, end_time, is_published, status, shuffle_questions, shuffle_options, has_negative_marking, created_at, updated_at)
                VALUES (:id, :sid, 'Distributed Systems & Database Mid-Term', 'MID_TERM', 100.0, 120, NOW() - INTERVAL '2 days', NOW() + INTERVAL '2 days', true, 'PUBLISHED', true, true, false, NOW(), NOW())
            """), {"id": exam_id, "sid": subj_id})
            await conn.commit()

        # Check question
        q_res = await conn.execute(text("SELECT id FROM questions LIMIT 1"))
        q_id = q_res.scalar()
        if not q_id:
            q_id = uuid.uuid4()
            await conn.execute(text("""
                INSERT INTO questions (id, subject_id, prompt, question_type, difficulty, bloom_level, default_marks, negative_marks, created_at, updated_at)
                VALUES (:id, :sid, 'Explain Raft consensus and leader election in distributed systems.', 'DESCRIPTIVE', 'MEDIUM', 'APPLY', 10.0, 0.0, NOW(), NOW())
            """), {"id": q_id, "sid": subj_id})
            await conn.commit()
        
        # Check student profiles
        stud_res = await conn.execute(text("""
            SELECT sp.id, u.id, u.full_name 
            FROM student_profiles sp 
            JOIN users u ON sp.user_id = u.id 
            LIMIT 1
        """))
        stud_row = stud_res.fetchone()
        
        # If no student profile, get any user
        if not stud_row:
            user_res = await conn.execute(text("SELECT id, full_name FROM users WHERE role = 'student' LIMIT 1"))
            user_row = user_res.fetchone()
            if not user_row:
                user_res = await conn.execute(text("SELECT id, full_name FROM users LIMIT 1"))
                user_row = user_res.fetchone()
            user_id = user_row[0]
            # Create a student profile
            sp_id = uuid.uuid4()
            await conn.execute(text("""
                INSERT INTO student_profiles (id, user_id, current_semester, academic_standing, gpa, created_at, updated_at)
                VALUES (:id, :uid, 6, 'GOOD', 8.7, NOW(), NOW())
                ON CONFLICT DO NOTHING
            """), {"id": sp_id, "uid": user_id})
            await conn.commit()
            stud_profile_id = sp_id
        else:
            stud_profile_id = stud_row[0]
            user_id = stud_row[1]

        # Check or create attempt
        attempt_res = await conn.execute(text("SELECT id FROM student_exam_attempts LIMIT 1"))
        attempt_id = attempt_res.scalar()
        if not attempt_id:
            attempt_id = uuid.uuid4()
            await conn.execute(text("""
                INSERT INTO student_exam_attempts (id, exam_id, student_id, started_at, submitted_at, status, score, max_score, tab_switch_count)
                VALUES (:id, :eid, :sid, NOW(), NOW(), 'EVALUATED', 82.5, 100.0, 0)
            """), {"id": attempt_id, "eid": exam_id, "sid": stud_profile_id})
            await conn.commit()

        # Get subject
        subj_res = await conn.execute(text("SELECT id FROM subjects LIMIT 1"))
        subj_id = subj_res.scalar()
        if not subj_id:
            subj_id = uuid.uuid4()
            await conn.execute(text("""
                INSERT INTO subjects (id, code, name, credits, created_at, updated_at)
                VALUES (:id, 'CS301', 'Database Engineering', 4, NOW(), NOW())
            """), {"id": subj_id})

        print(f"Using exam_id={exam_id}, student_profile_id={stud_profile_id}, attempt_id={attempt_id}, subject_id={subj_id}")

        # Clean existing test answers or append
        import json
        inserted = 0
        for rec in SAMPLE_RECORDS:
            ans_id = uuid.uuid4()
            new_q_id = uuid.uuid4()
            await conn.execute(text("""
                INSERT INTO questions (id, subject_id, prompt, question_type, difficulty, bloom_level, default_marks, negative_marks, created_at, updated_at)
                VALUES (:id, :subj_id, :prompt, 'DESCRIPTIVE', 'MEDIUM', 'APPLY', :marks, 0.0, NOW(), NOW())
                ON CONFLICT DO NOTHING
            """), {"id": new_q_id, "subj_id": subj_id, "prompt": rec["question_prompt"], "marks": rec["max_marks"]})

            # Also create distinct attempt or link to existing
            rec_attempt_id = uuid.uuid4()
            # Find student profile for rec or link
            await conn.execute(text("""
                INSERT INTO student_exam_attempts (id, exam_id, student_id, started_at, submitted_at, status, score, max_score, tab_switch_count)
                VALUES (:id, :eid, :sid, NOW(), NOW(), 'SUBMITTED', :score, :max_s, 0)
                ON CONFLICT DO NOTHING
            """), {"id": rec_attempt_id, "eid": exam_id, "sid": stud_profile_id, "score": rec["ai_suggested_marks"], "max_s": rec["max_marks"]})

            # Insert student answer
            await conn.execute(text("""
                INSERT INTO student_answers (
                    id, attempt_id, question_id, text_response, score_awarded,
                    ai_confidence_score, status, counterfactual_feedback,
                    ai_suggested_marks, rubric_breakdown, extracted_text,
                    evaluator_feedback, answered_at
                ) VALUES (
                    :id, :attempt_id, :question_id, :text_response, :score_awarded,
                    :ai_confidence_score, :status, :counterfactual_feedback,
                    :ai_suggested_marks, CAST(:rubric_breakdown AS jsonb), :extracted_text,
                    :evaluator_feedback, NOW()
                )
            """), {
                "id": ans_id,
                "attempt_id": rec_attempt_id,
                "question_id": new_q_id,
                "text_response": rec["student_response"],
                "score_awarded": rec["ai_suggested_marks"] if rec["status"] == "AUDITED" else None,
                "ai_confidence_score": rec["ai_confidence_score"],
                "status": rec["status"],
                "counterfactual_feedback": rec["counterfactual_feedback"],
                "ai_suggested_marks": rec["ai_suggested_marks"],
                "rubric_breakdown": json.dumps(rec["rubric_breakdown"]),
                "extracted_text": rec["extracted_text"],
                "evaluator_feedback": rec["ai_feedback"]
            })
            inserted += 1

        await conn.commit()
        print(f"Successfully seeded {inserted} student_answers records!")

asyncio.run(seed())
