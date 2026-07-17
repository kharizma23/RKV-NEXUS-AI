import asyncio
import uuid
from datetime import datetime, timezone
from sqlalchemy import text
from app.database.session import AsyncSessionLocal

async def seed_dbms():
    async with AsyncSessionLocal() as session:
        # Find BIT-CS201
        res = await session.execute(text("SELECT id FROM subjects WHERE code = 'BIT-CS201'"))
        subj = res.fetchone()
        if not subj:
            return
        subj_id = subj[0]

        # Faculty profile ID for Dr. Alan Turing
        res_fac = await session.execute(text("SELECT fp.id FROM faculty_profiles fp JOIN users u ON fp.user_id = u.id WHERE u.email = 'faculty@platform.edu'"))
        fac_id = res_fac.fetchone()[0]

        # Semester
        res_sem = await session.execute(text("SELECT id FROM semesters LIMIT 1"))
        sem_id = res_sem.fetchone()[0]

        # Check if already assigned
        res_asgn = await session.execute(text("SELECT id FROM faculty_subject_assignments WHERE faculty_id = :fid AND subject_id = :sid"), {"fid": fac_id, "sid": subj_id})
        if not res_asgn.fetchone():
            await session.execute(
                text("INSERT INTO faculty_subject_assignments (id, faculty_id, subject_id, semester_id, role_in_subject, assigned_at) VALUES (:id, :fid, :sid, :sem, 'INSTRUCTOR', NOW())"),
                {"id": uuid.uuid4(), "fid": fac_id, "sid": subj_id, "sem": sem_id}
            )

        # Check if units exist for BIT-CS201
        res_u = await session.execute(text("SELECT count(*) FROM units WHERE subject_id = :sid"), {"sid": subj_id})
        if res_u.scalar() == 0:
            now = datetime.now(timezone.utc)
            dbms_units = [
                (1, "Relational Model & SQL Fundamentals", "Relational algebra, calculus, and advanced SQL querying", 20, [
                    (1, "Relational Algebra Operations & Query Optimization"),
                    (2, "DDL, DML, Complex Joins and Nested Queries"),
                    (3, "Views, Triggers and Stored Procedures")
                ]),
                (2, "Database Design & Normalization", "Functional dependencies and normal forms", 20, [
                    (1, "Entity-Relationship Data Modeling & Mapping"),
                    (2, "Armstrong's Axioms and Canonical Cover"),
                    (3, "1NF, 2NF, 3NF, BCNF, and 4NF Decompositions")
                ]),
                (3, "Transaction Processing & Concurrency", "ACID properties, serializability, and 2PC", 20, [
                    (1, "ACID Properties & Transaction States"),
                    (2, "Strict Two-Phase Locking (2PL) and Deadlock Handling"),
                    (3, "Timestamp Ordering and MVCC Protocols")
                ]),
                (4, "Indexing, Storage & Query Processing", "B+ Trees, hashing, and cost estimation", 20, [
                    (1, "B+ Tree Indexing and Clustered/Unclustered Indices"),
                    (2, "Extendible and Linear Hashing"),
                    (3, "Query Execution Plans and Cost Estimation")
                ]),
                (5, "Distributed Databases & NoSQL", "CAP theorem, replication, and document stores", 20, [
                    (1, "Distributed DBMS Architectures & Two-Phase Commit"),
                    (2, "CAP Theorem, BASE, and Eventual Consistency"),
                    (3, "Key-Value and Document Data Stores (MongoDB)")
                ])
            ]
            for un, utitle, udesc, w, topics in dbms_units:
                uid = uuid.uuid4()
                await session.execute(
                    text("INSERT INTO units (id, subject_id, unit_number, title, description, weightage, created_at, updated_at) VALUES (:id, :sid, :un, :title, :desc, :w, :now, :now)"),
                    {"id": uid, "sid": subj_id, "un": un, "title": utitle, "desc": udesc, "w": w, "now": now}
                )
                for tn, ttitle in topics:
                    await session.execute(
                        text("INSERT INTO topics (id, unit_id, topic_number, title, description, created_at, updated_at) VALUES (:id, :uid, :tn, :title, '', :now, :now)"),
                        {"id": uuid.uuid4(), "uid": uid, "tn": tn, "title": ttitle, "now": now}
                    )

        await session.commit()
        print("Successfully ensured BIT-CS201 has units, topics, and assignment for Dr. Alan Turing!")

asyncio.run(seed_dbms())
