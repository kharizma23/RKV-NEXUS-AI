import asyncio
import uuid
from datetime import datetime, UTC, timedelta
from app.database.session import AsyncSessionLocal
from sqlalchemy import text

async def setup_and_seed():
    async with AsyncSessionLocal() as session:
        # 1. Create table misconceptions
        await session.execute(text("""
            CREATE TABLE IF NOT EXISTS misconceptions (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                concept VARCHAR(255) NOT NULL,
                subject_id UUID REFERENCES subjects(id) ON DELETE SET NULL,
                department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
                semester_id INTEGER,
                frequency INTEGER DEFAULT 1 NOT NULL,
                first_detected TIMESTAMPTZ DEFAULT NOW() NOT NULL,
                last_detected TIMESTAMPTZ DEFAULT NOW() NOT NULL,
                resolved BOOLEAN DEFAULT FALSE NOT NULL,
                resolved_by UUID REFERENCES users(id) ON DELETE SET NULL,
                resolution_notes TEXT,
                severity VARCHAR(50) DEFAULT 'HIGH' NOT NULL
            );
        """))

        # 2. Alter student_doubts to have misconception_id and ensure needed columns
        await session.execute(text("""
            ALTER TABLE student_doubts ADD COLUMN IF NOT EXISTS misconception_id UUID;
        """))

        # 3. Create table doubt_micro_lessons if not exists or add columns
        await session.execute(text("""
            CREATE TABLE IF NOT EXISTS doubt_micro_lessons (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                misconception_id UUID,
                doubt_id UUID,
                title VARCHAR(255) NOT NULL,
                content TEXT NOT NULL,
                resource_url VARCHAR(500),
                common_mistakes TEXT,
                correct_approach TEXT,
                quick_quiz JSONB DEFAULT '[]'::jsonb,
                duration_minutes INTEGER DEFAULT 5 NOT NULL,
                created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
            );
        """))
        for col_sql in [
            "ALTER TABLE doubt_micro_lessons ADD COLUMN IF NOT EXISTS misconception_id UUID;",
            "ALTER TABLE doubt_micro_lessons ADD COLUMN IF NOT EXISTS common_mistakes TEXT;",
            "ALTER TABLE doubt_micro_lessons ADD COLUMN IF NOT EXISTS correct_approach TEXT;",
            "ALTER TABLE doubt_micro_lessons ADD COLUMN IF NOT EXISTS quick_quiz JSONB DEFAULT '[]'::jsonb;",
            "ALTER TABLE doubt_micro_lessons ADD COLUMN IF NOT EXISTS duration_minutes INTEGER DEFAULT 5;",
            "ALTER TABLE doubt_micro_lessons ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();",
        ]:
            await session.execute(text(col_sql))

        # 4. Create table intervention_plans
        await session.execute(text("""
            CREATE TABLE IF NOT EXISTS intervention_plans (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                faculty_id UUID NOT NULL,
                misconception_id UUID NOT NULL,
                topic_to_reteach VARCHAR(255),
                duration_minutes INTEGER DEFAULT 45 NOT NULL,
                plan_text TEXT NOT NULL,
                example_problems JSONB DEFAULT '[]'::jsonb,
                practice_questions JSONB DEFAULT '[]'::jsonb,
                assessment_method VARCHAR(255) DEFAULT 'Formative Assessment & Quick Quiz' NOT NULL,
                generated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
            );
        """))

        # 5. Create table remedial_classes
        await session.execute(text("""
            CREATE TABLE IF NOT EXISTS remedial_classes (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                faculty_id UUID NOT NULL,
                subject_id UUID REFERENCES subjects(id) ON DELETE SET NULL,
                misconception_id UUID,
                title VARCHAR(255) NOT NULL,
                scheduled_at TIMESTAMPTZ NOT NULL,
                duration INTEGER DEFAULT 60 NOT NULL,
                duration_minutes INTEGER DEFAULT 60 NOT NULL,
                student_ids JSONB DEFAULT '[]'::jsonb,
                status VARCHAR(50) DEFAULT 'SCHEDULED' NOT NULL,
                notes TEXT,
                created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
            );
        """))
        await session.execute(text("ALTER TABLE remedial_classes ADD COLUMN IF NOT EXISTS duration INTEGER DEFAULT 60;"))

        # 6. Create table resolved_doubts
        await session.execute(text("""
            CREATE TABLE IF NOT EXISTS resolved_doubts (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                misconception_id UUID NOT NULL,
                resolved_by UUID NOT NULL,
                resolution_notes TEXT NOT NULL,
                resolved_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
            );
        """))

        # 7. Create misconception_details table for rich explanations if not exists
        await session.execute(text("""
            CREATE TABLE IF NOT EXISTS misconception_details (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                misconception_id UUID NOT NULL,
                root_cause TEXT NOT NULL,
                suggested_action TEXT NOT NULL,
                suggested_micro_lesson TEXT,
                suggested_revision_material TEXT,
                sample_wrong_answers JSONB DEFAULT '[]'::jsonb,
                created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
            );
        """))

        # 8. Ensure class_doubts table has severity & status columns
        await session.execute(text("ALTER TABLE class_doubts ADD COLUMN IF NOT EXISTS severity VARCHAR(50) DEFAULT 'HIGH';"))
        await session.execute(text("ALTER TABLE class_doubts ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'ACTIVE';"))

        await session.commit()
        print("Tables and schema updated successfully.")

        # =========================================================================
        # SEED DATA
        # =========================================================================
        # Find subjects: Data Structures, Database Management Systems, Distributed Systems
        dept_res = await session.execute(text("SELECT id FROM departments LIMIT 1;"))
        default_dept = dept_res.scalar()

        ds_res = await session.execute(text("SELECT id FROM subjects WHERE name ILIKE '%Data Structures%' LIMIT 1;"))
        ds_id = ds_res.scalar()

        db_res = await session.execute(text("SELECT id FROM subjects WHERE name ILIKE '%Database%' LIMIT 1;"))
        db_id = db_res.scalar() or ds_id

        dist_res = await session.execute(text("SELECT id FROM subjects WHERE name ILIKE '%Distributed%' LIMIT 1;"))
        dist_id = dist_res.scalar() or ds_id

        ds_dept = default_dept
        db_dept = default_dept

        # Fetch existing students to link
        stu_res = await session.execute(text("SELECT user_id FROM student_profiles LIMIT 50;"))
        stu_ids = [r[0] for r in stu_res.fetchall()]
        if not stu_ids:
            u_res = await session.execute(text("SELECT id FROM users LIMIT 10;"))
            stu_ids = [r[0] for r in u_res.fetchall()]

        # Clean existing test data from misconceptions, class_doubts, and student_doubts to guarantee exact numbers
        await session.execute(text("DELETE FROM resolved_doubts;"))
        await session.execute(text("DELETE FROM misconception_details;"))
        await session.execute(text("DELETE FROM student_doubts;"))
        await session.execute(text("DELETE FROM misconceptions;"))
        await session.execute(text("DELETE FROM class_doubts;"))
        await session.execute(text("DELETE FROM doubt_micro_lessons;"))
        await session.execute(text("DELETE FROM intervention_plans;"))
        await session.execute(text("DELETE FROM remedial_classes;"))

        # Misconception 1: Dynamic Programming (frequency 28)
        misc1_id = uuid.uuid4()
        await session.execute(text("""
            INSERT INTO misconceptions (id, concept, subject_id, department_id, semester_id, frequency, first_detected, last_detected, resolved, severity)
            VALUES (:id, :concept, :subject_id, :department_id, :semester_id, :frequency, :first_detected, :last_detected, FALSE, 'HIGH');
        """), {
            "id": misc1_id,
            "concept": "Dynamic Programming Memoization vs Tabulation Invariants",
            "subject_id": ds_id,
            "department_id": ds_dept,
            "semester_id": 5,
            "frequency": 28,
            "first_detected": datetime.now(UTC) - timedelta(days=7),
            "last_detected": datetime.now(UTC) - timedelta(hours=3),
        })

        # Also insert into class_doubts for sync
        await session.execute(text("""
            INSERT INTO class_doubts (id, concept, subject_id, frequency, last_detected, severity, status)
            VALUES (:id, :concept, :subject_id, :frequency, :last_detected, 'HIGH', 'ACTIVE');
        """), {
            "id": misc1_id,
            "concept": "Dynamic Programming Memoization vs Tabulation Invariants",
            "subject_id": ds_id,
            "frequency": 28,
            "last_detected": datetime.now(UTC) - timedelta(hours=3),
        })

        await session.execute(text("""
            INSERT INTO misconception_details (misconception_id, root_cause, suggested_action, suggested_micro_lesson, sample_wrong_answers)
            VALUES (:m_id, :rc, :sa, :sml, CAST(:swa AS jsonb));
        """), {
            "m_id": misc1_id,
            "rc": "Students conflate top-down recursion stack frames with bottom-up dependency ordering. They fail to identify state transition DAG direction and base cases in iterative table fill.",
            "sa": "Conduct a live DAG topological sort step-by-step trace showing memory consumption comparisons between call stack overhead and table buffer reuse.",
            "sml": "5-minute micro-lesson: The 4 Steps to Deconstruct Recurrence Relations into Invariant State Tables.",
            "swa": '["Memoization consumes less memory because it only evaluates reachable states, making tabulation strictly inferior.", "Tabulation requires recursion to determine the order of filling cells in the DP matrix.", "Base cases are only necessary in top-down recursion; bottom-up tabulation automatically starts at 0."]'
        })

        # Misconception 2: B-Tree (frequency 22)
        misc2_id = uuid.uuid4()
        await session.execute(text("""
            INSERT INTO misconceptions (id, concept, subject_id, department_id, semester_id, frequency, first_detected, last_detected, resolved, severity)
            VALUES (:id, :concept, :subject_id, :department_id, :semester_id, :frequency, :first_detected, :last_detected, FALSE, 'HIGH');
        """), {
            "id": misc2_id,
            "concept": "B-Tree Node Split & Balancing in Distributed DBs",
            "subject_id": db_id,
            "department_id": db_dept,
            "semester_id": 5,
            "frequency": 22,
            "first_detected": datetime.now(UTC) - timedelta(days=5),
            "last_detected": datetime.now(UTC) - timedelta(hours=14),
        })

        await session.execute(text("""
            INSERT INTO class_doubts (id, concept, subject_id, frequency, last_detected, severity, status)
            VALUES (:id, :concept, :subject_id, :frequency, :last_detected, 'HIGH', 'ACTIVE');
        """), {
            "id": misc2_id,
            "concept": "B-Tree Node Split & Balancing in Distributed DBs",
            "subject_id": db_id,
            "frequency": 22,
            "last_detected": datetime.now(UTC) - timedelta(hours=14),
        })

        await session.execute(text("""
            INSERT INTO misconception_details (misconception_id, root_cause, suggested_action, suggested_micro_lesson, sample_wrong_answers)
            VALUES (:m_id, :rc, :sa, :sml, CAST(:swa AS jsonb));
        """), {
            "m_id": misc2_id,
            "rc": "Confusion regarding median key promotion rules during node overflow in order-M trees and how distributed shard locks coordinate node splits across replication boundaries.",
            "sa": "Demonstrate visual node split animation with order 4 tree and trace 2-phase locking distributed root splits.",
            "sml": "B+ Tree Index Balancing: Median Key Promotion & Cascade Split Mechanics.",
            "swa": '["When a node overflows, the median key is copied into both left and right child nodes.", "A node split in distributed B-trees requires global transaction rollback across all partitions.", "B+ Tree leaf nodes do not require pointer linkages if distributed indexes are hashed."]'
        })

        # Misconception 3: CAP Theorem (frequency 19)
        misc3_id = uuid.uuid4()
        await session.execute(text("""
            INSERT INTO misconceptions (id, concept, subject_id, department_id, semester_id, frequency, first_detected, last_detected, resolved, severity)
            VALUES (:id, :concept, :subject_id, :department_id, :semester_id, :frequency, :first_detected, :last_detected, FALSE, 'MEDIUM');
        """), {
            "id": misc3_id,
            "concept": "CAP Theorem Network Partition Tradeoffs in Raft",
            "subject_id": dist_id,
            "department_id": ds_dept,
            "semester_id": 5,
            "frequency": 19,
            "first_detected": datetime.now(UTC) - timedelta(days=9),
            "last_detected": datetime.now(UTC) - timedelta(days=1),
        })

        await session.execute(text("""
            INSERT INTO class_doubts (id, concept, subject_id, frequency, last_detected, severity, status)
            VALUES (:id, :concept, :subject_id, :frequency, :last_detected, 'MEDIUM', 'ACTIVE');
        """), {
            "id": misc3_id,
            "concept": "CAP Theorem Network Partition Tradeoffs in Raft",
            "subject_id": dist_id,
            "frequency": 19,
            "last_detected": datetime.now(UTC) - timedelta(days=1),
        })

        await session.execute(text("""
            INSERT INTO misconception_details (misconception_id, root_cause, suggested_action, suggested_micro_lesson, sample_wrong_answers)
            VALUES (:m_id, :rc, :sa, :sml, CAST(:swa AS jsonb));
        """), {
            "m_id": misc3_id,
            "rc": "Assuming Raft guarantees 100% availability during asymmetric minority network partitions instead of rejecting writes to maintain strong CP consistency.",
            "sa": "Simulate 5-node Raft cluster split into 3-node and 2-node partitions and show client write timeout behaviour.",
            "sml": "CP vs AP Tradeoffs Under Raft Quorum Elections.",
            "swa": '["Raft achieves CA (Consistency + Availability) by allowing minority clusters to accept speculative writes.", "During a network partition, the partition with the highest term always serves reads regardless of quorum.", "CAP Theorem allows systems to ignore partition tolerance in local campus cloud deployments."]'
        })

        # Seed 1 Resolved Misconception (CARD 4 & Resolved Archive)
        misc_res_id = uuid.uuid4()
        fac_res = await session.execute(text("SELECT id FROM users LIMIT 1;"))
        fac_id = fac_res.scalar() or uuid.uuid4()

        await session.execute(text("""
            INSERT INTO misconceptions (id, concept, subject_id, department_id, semester_id, frequency, first_detected, last_detected, resolved, resolved_by, resolution_notes, severity)
            VALUES (:id, :concept, :subject_id, :department_id, :semester_id, 15, :first_detected, :last_detected, TRUE, :fac_id, :notes, 'LOW');
        """), {
            "id": misc_res_id,
            "concept": "Deadlock Prevention via Resource Ordering Protocol",
            "subject_id": db_id,
            "department_id": db_dept,
            "semester_id": 5,
            "first_detected": datetime.now(UTC) - timedelta(days=20),
            "last_detected": datetime.now(UTC) - timedelta(days=10),
            "fac_id": fac_id,
            "notes": "Remedial clinic conducted on March 28th. 100% of attending students solved the dining philosophers ordering quiz correctly.",
        })

        await session.execute(text("""
            INSERT INTO class_doubts (id, concept, subject_id, frequency, last_detected, severity, status)
            VALUES (:id, :concept, :subject_id, 15, :last_detected, 'LOW', 'RESOLVED');
        """), {
            "id": misc_res_id,
            "concept": "Deadlock Prevention via Resource Ordering Protocol",
            "subject_id": db_id,
            "last_detected": datetime.now(UTC) - timedelta(days=10),
        })

        await session.execute(text("""
            INSERT INTO resolved_doubts (id, misconception_id, resolved_by, resolution_notes, resolved_at)
            VALUES (:id, :m_id, :fac_id, :notes, :resolved_at);
        """), {
            "id": uuid.uuid4(),
            "m_id": misc_res_id,
            "fac_id": fac_id,
            "notes": "Remedial clinic conducted on March 28th. 100% of attending students solved the dining philosophers ordering quiz correctly.",
            "resolved_at": datetime.now(UTC) - timedelta(days=10)
        })

        # Seed student_doubts: EXACTLY 69 UNRESOLVED RECORDS (28 for misc1, 22 for misc2, 19 for misc3)
        # Total = 69
        concepts_to_seed = [
            (misc1_id, "DP Memoization vs Tabulation", 28, ds_id),
            (misc2_id, "B-Tree Node Split & Balancing", 22, db_id),
            (misc3_id, "CAP Raft Network Partition", 19, dist_id),
        ]

        inserted_students_count = 0
        for m_id, concept_title, count, s_id in concepts_to_seed:
            for i in range(count):
                student_user_id = stu_ids[i % len(stu_ids)] if stu_ids else uuid.uuid4()
                await session.execute(text("""
                    INSERT INTO student_doubts (id, student_id, misconception_id, subject_id, concept, doubt_description, detected_at, resolved)
                    VALUES (:id, :student_id, :m_id, :subject_id, :concept, :desc, :detected_at, FALSE);
                """), {
                    "id": uuid.uuid4(),
                    "student_id": student_user_id,
                    "m_id": m_id,
                    "subject_id": s_id,
                    "concept": concept_title,
                    "desc": f"Automated error flag: Student submitted erroneous logic on invariant test instance #{i+1}.",
                    "detected_at": datetime.now(UTC) - timedelta(days=i % 6, hours=i * 2),
                })
                inserted_students_count += 1

        print(f"Inserted {inserted_students_count} student doubts.")

        # Seed 1 remedial class for clinics tab
        await session.execute(text("""
            INSERT INTO remedial_classes (id, faculty_id, subject_id, misconception_id, title, scheduled_at, duration_minutes, student_ids, status, notes)
            VALUES (:id, :fac_id, :sub_id, :m_id, :title, :sched, 60, CAST(:s_ids AS jsonb), 'SCHEDULED', 'Live interactive coding clinic on DP state tables');
        """), {
            "id": uuid.uuid4(),
            "fac_id": fac_id,
            "sub_id": ds_id,
            "m_id": misc1_id,
            "title": "DP State Invariant & Memoization Clinic",
            "sched": datetime.now(UTC) + timedelta(days=2, hours=4),
            "s_ids": str([str(sid) for sid in stu_ids[:5]]).replace("'", '"')
        })

        await session.commit()

        # Check counts
        c_active = await session.execute(text("SELECT COUNT(*) FROM misconceptions WHERE resolved = false;"))
        c_stud = await session.execute(text("SELECT COUNT(*) FROM student_doubts WHERE resolved = false;"))
        c_res = await session.execute(text("SELECT COUNT(*) FROM misconceptions WHERE resolved = true;"))
        print("VERIFICATION OF COUNTS:")
        print("misconceptions WHERE resolved = false:", c_active.scalar())
        print("student_doubts WHERE resolved = false:", c_stud.scalar())
        print("misconceptions WHERE resolved = true:", c_res.scalar())

if __name__ == "__main__":
    asyncio.run(setup_and_seed())
