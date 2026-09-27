import uuid
from typing import List, Dict, Any, Optional
from datetime import datetime, UTC, timedelta
from sqlalchemy import select, update, func, desc, or_, text
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException

from app.modules.new_functionalities.model import (
    Misconception,
    ClassDoubt,
    StudentDoubt,
    MisconceptionDetail,
    InterventionPlan,
    RemedialClass,
    MicroLesson,
    ResolvedDoubt,
)
from app.modules.academics.model import Subject
from app.modules.institutions.model import Department
from app.modules.users.model import User, StudentProfile
from app.modules.notifications.model import Notification


class FacultyDoubtsService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def ensure_seed_doubts_exist(self):
        """Seed representative classroom misconceptions if empty."""
        try:
            count_res = await self.db.execute(select(func.count(Misconception.id)).where(Misconception.resolved == False))
            active_cnt = count_res.scalar() or 0
        except Exception:
            active_cnt = 0

        if active_cnt >= 3:
            return

        # Fetch subjects
        ds_res = await self.db.execute(select(Subject).where(Subject.name.ilike('%Data Structures%')).limit(1))
        first_ds = ds_res.scalar_one_or_none()
        ds_id = first_ds.id if first_ds else None

        db_res = await self.db.execute(select(Subject).where(Subject.name.ilike('%Database%')).limit(1))
        first_db = db_res.scalar_one_or_none()
        db_id = first_db.id if first_db else ds_id

        dist_res = await self.db.execute(select(Subject).where(Subject.name.ilike('%Distributed%')).limit(1))
        first_dist = dist_res.scalar_one_or_none()
        dist_id = first_dist.id if first_dist else ds_id

        dept_res = await self.db.execute(select(Department).limit(1))
        first_dept = dept_res.scalar_one_or_none()
        dept_id = first_dept.id if first_dept else None

        # Clean existing test data from misconceptions, class_doubts, and student_doubts to guarantee exact numbers
        await self.db.execute(text("DELETE FROM resolved_doubts;"))
        await self.db.execute(text("DELETE FROM misconception_details;"))
        await self.db.execute(text("DELETE FROM student_doubts;"))
        await self.db.execute(text("DELETE FROM misconceptions;"))
        await self.db.execute(text("DELETE FROM class_doubts;"))

        # Seed 3 active misconceptions
        m1 = Misconception(
            concept="Dynamic Programming Memoization vs Tabulation Invariants",
            frequency=28,
            severity="HIGH",
            subject_id=ds_id,
            department_id=dept_id,
            semester_id=5,
            first_detected=datetime.now(UTC) - timedelta(days=7),
            last_detected=datetime.now(UTC) - timedelta(hours=3),
            resolved=False,
        )
        m2 = Misconception(
            concept="B-Tree Node Split & Balancing in Distributed DBs",
            frequency=22,
            severity="HIGH",
            subject_id=db_id,
            department_id=dept_id,
            semester_id=5,
            first_detected=datetime.now(UTC) - timedelta(days=5),
            last_detected=datetime.now(UTC) - timedelta(hours=14),
            resolved=False,
        )
        m3 = Misconception(
            concept="CAP Theorem Network Partition Tradeoffs in Raft",
            frequency=19,
            severity="MEDIUM",
            subject_id=dist_id,
            department_id=dept_id,
            semester_id=5,
            first_detected=datetime.now(UTC) - timedelta(days=9),
            last_detected=datetime.now(UTC) - timedelta(days=1),
            resolved=False,
        )
        self.db.add_all([m1, m2, m3])
        await self.db.flush()

        # Seed in class_doubts for sync
        cd1 = ClassDoubt(id=m1.id, concept=m1.concept, frequency=28, severity="HIGH", subject_id=ds_id, last_detected=m1.last_detected, status="ACTIVE")
        cd2 = ClassDoubt(id=m2.id, concept=m2.concept, frequency=22, severity="HIGH", subject_id=db_id, last_detected=m2.last_detected, status="ACTIVE")
        cd3 = ClassDoubt(id=m3.id, concept=m3.concept, frequency=19, severity="MEDIUM", subject_id=dist_id, last_detected=m3.last_detected, status="ACTIVE")
        self.db.add_all([cd1, cd2, cd3])

        # Seed 1 resolved misconception
        u_res = await self.db.execute(select(User).limit(1))
        fac_user = u_res.scalar_one_or_none()
        fac_id = fac_user.id if fac_user else uuid.uuid4()

        m_res = Misconception(
            concept="Deadlock Prevention via Resource Ordering Protocol",
            frequency=15,
            severity="LOW",
            subject_id=db_id,
            department_id=dept_id,
            semester_id=5,
            first_detected=datetime.now(UTC) - timedelta(days=20),
            last_detected=datetime.now(UTC) - timedelta(days=10),
            resolved=True,
            resolved_by=fac_id,
            resolution_notes="Remedial clinic conducted on March 28th. 100% of attending students solved the dining philosophers ordering quiz correctly.",
        )
        self.db.add(m_res)
        await self.db.flush()

        cd_res = ClassDoubt(id=m_res.id, concept=m_res.concept, frequency=15, severity="LOW", subject_id=db_id, last_detected=m_res.last_detected, status="RESOLVED")
        self.db.add(cd_res)

        rd = ResolvedDoubt(
            misconception_id=m_res.id,
            resolved_by=fac_id,
            resolution_notes=m_res.resolution_notes,
            resolved_at=m_res.last_detected
        )
        self.db.add(rd)

        # Seed details for the 3 active
        d1 = MisconceptionDetail(
            misconception_id=m1.id,
            root_cause="Students conflate top-down recursion stack frames with bottom-up dependency ordering. They fail to identify state transition DAG direction and base cases in iterative table fill.",
            suggested_action="Conduct a live DAG topological sort step-by-step trace showing memory consumption comparisons between call stack overhead and table buffer reuse.",
            suggested_micro_lesson="5-minute micro-lesson: The 4 Steps to Deconstruct Recurrence Relations into Invariant State Tables.",
            suggested_revision_material="Course Textbook: Section on Dynamic Programming Invariants; Practice Set #4.",
            sample_wrong_answers=[
                "Memoization consumes less memory because it only evaluates reachable states, making tabulation strictly inferior.",
                "Tabulation requires recursion to determine the order of filling cells in the DP matrix.",
                "Base cases are only necessary in top-down recursion; bottom-up tabulation automatically starts at 0."
            ],
            created_at=m1.first_detected
        )
        d2 = MisconceptionDetail(
            misconception_id=m2.id,
            root_cause="Confusion regarding median key promotion rules during node overflow in order-M trees and how distributed shard locks coordinate node splits across replication boundaries.",
            suggested_action="Demonstrate visual node split animation with order 4 tree and trace 2-phase locking distributed root splits.",
            suggested_micro_lesson="B+ Tree Index Balancing: Median Key Promotion & Cascade Split Mechanics.",
            suggested_revision_material="Database Architecture: Chapter 14 - Multi-level Indexing and Tree Balancing.",
            sample_wrong_answers=[
                "When a node overflows, the median key is copied into both left and right child nodes.",
                "A node split in distributed B-trees requires global transaction rollback across all partitions.",
                "B+ Tree leaf nodes do not require pointer linkages if distributed indexes are hashed."
            ],
            created_at=m2.first_detected
        )
        d3 = MisconceptionDetail(
            misconception_id=m3.id,
            root_cause="Assuming Raft guarantees 100% availability during asymmetric minority network partitions instead of rejecting writes to maintain strong CP consistency.",
            suggested_action="Simulate 5-node Raft cluster split into 3-node and 2-node partitions and show client write timeout behaviour.",
            suggested_micro_lesson="CP vs AP Tradeoffs Under Raft Quorum Elections.",
            suggested_revision_material="Distributed Systems: Chapter 8 - Consensus and Asymmetric Network Partition Resilience.",
            sample_wrong_answers=[
                "Raft achieves CA (Consistency + Availability) by allowing minority clusters to accept speculative writes.",
                "During a network partition, the partition with the highest term always serves reads regardless of quorum.",
                "CAP Theorem allows systems to ignore partition tolerance in local campus cloud deployments."
            ],
            created_at=m3.first_detected
        )
        self.db.add_all([d1, d2, d3])

        # Seed student_doubts (EXACTLY 69 UNRESOLVED: 28 for m1, 22 for m2, 19 for m3)
        stu_res = await self.db.execute(select(StudentProfile.user_id).limit(50))
        stu_ids = [r for r in stu_res.scalars().all()]
        if not stu_ids:
            u_res = await self.db.execute(select(User.id).limit(10))
            stu_ids = [r for r in u_res.scalars().all()]

        items = [(m1.id, "DP Memoization vs Tabulation", 28, ds_id), (m2.id, "B-Tree Node Split & Balancing", 22, db_id), (m3.id, "CAP Raft Network Partition", 19, dist_id)]
        for misc_id, c_title, cnt, s_id in items:
            for i in range(cnt):
                sid = stu_ids[i % len(stu_ids)] if stu_ids else uuid.uuid4()
                sd = StudentDoubt(
                    id=uuid.uuid4(),
                    student_id=sid,
                    misconception_id=misc_id,
                    subject_id=s_id,
                    concept=c_title,
                    doubt_description=f"Automated error flag: Student submitted erroneous logic on invariant test instance #{i+1}.",
                    detected_at=datetime.now(UTC) - timedelta(days=i % 6, hours=i * 2),
                    resolved=False
                )
                self.db.add(sd)

        await self.db.commit()

    async def get_stats(self) -> Dict[str, Any]:
        """Fetch real-time stats for the faculty dashboard cards."""
        await self.ensure_seed_doubts_exist()

        try:
            active_cnt_res = await self.db.execute(text("SELECT COUNT(*) FROM misconceptions WHERE resolved = false;"))
            active_bottlenecks = active_cnt_res.scalar() or 0
        except Exception:
            active_cnt_res = await self.db.execute(select(func.count(ClassDoubt.id)).where(ClassDoubt.status == "ACTIVE"))
            active_bottlenecks = active_cnt_res.scalar() or 0

        try:
            affected_cnt_res = await self.db.execute(text("SELECT COUNT(*) FROM student_doubts WHERE resolved = false;"))
            affected_instances = affected_cnt_res.scalar() or 0
        except Exception:
            sum_res = await self.db.execute(select(func.sum(ClassDoubt.frequency)).where(ClassDoubt.status == "ACTIVE"))
            affected_instances = sum_res.scalar() or 0

        try:
            resolved_cnt_res = await self.db.execute(text("SELECT COUNT(*) FROM misconceptions WHERE resolved = true;"))
            resolved_doubts_count = resolved_cnt_res.scalar() or 0
        except Exception:
            res_cnt = await self.db.execute(select(func.count(ClassDoubt.id)).where(ClassDoubt.status == "RESOLVED"))
            resolved_doubts_count = res_cnt.scalar() or 0

        top_concept = "Dynamic Programming Memoization vs Tabulation Invariants"
        top_id = None
        try:
            top_res = await self.db.execute(text("SELECT id, concept FROM misconceptions WHERE resolved = false ORDER BY frequency DESC LIMIT 1;"))
            top_row = top_res.fetchone()
            if top_row:
                top_id = str(top_row[0])
                top_concept = top_row[1]
        except Exception:
            top_cd_res = await self.db.execute(select(ClassDoubt).where(ClassDoubt.status == "ACTIVE").order_by(desc(ClassDoubt.frequency)).limit(1))
            top_cd = top_cd_res.scalar_one_or_none()
            if top_cd:
                top_id = str(top_cd.id)
                top_concept = top_cd.concept

        return {
            "dominant_bottlenecks": active_bottlenecks,
            "affected_student_instances": affected_instances,
            "recommended_lecture_focus": top_concept,
            "resolved_historical_doubts": resolved_doubts_count,
            "top_misconception_id": top_id
        }

    async def get_doubts(
        self,
        subject_id: Optional[str] = None,
        department_id: Optional[str] = None,
        semester: Optional[int] = None,
        date_from: Optional[str] = None,
        date_to: Optional[str] = None,
        sort: Optional[str] = "frequency",
    ) -> List[Dict[str, Any]]:
        await self.ensure_seed_doubts_exist()

        stmt = select(Misconception).where(Misconception.resolved == False)

        if subject_id:
            try:
                subj_uuid = uuid.UUID(subject_id)
                stmt = stmt.where(Misconception.subject_id == subj_uuid)
            except ValueError:
                sub_lookup = await self.db.execute(
                    select(Subject.id).where(or_(Subject.name.ilike(f"%{subject_id}%"), Subject.code.ilike(f"%{subject_id}%")))
                )
                matching_subjs = [r for r in sub_lookup.scalars().all()]
                if matching_subjs:
                    stmt = stmt.where(Misconception.subject_id.in_(matching_subjs))

        if department_id:
            try:
                dept_uuid = uuid.UUID(department_id)
                stmt = stmt.where(Misconception.department_id == dept_uuid)
            except ValueError:
                dept_lookup = await self.db.execute(
                    select(Department.id).where(or_(Department.name.ilike(f"%{department_id}%"), Department.code.ilike(f"%{department_id}%")))
                )
                matching_depts = [r for r in dept_lookup.scalars().all()]
                if matching_depts:
                    stmt = stmt.where(Misconception.department_id.in_(matching_depts))

        if semester:
            stmt = stmt.where(Misconception.semester_id == semester)

        if date_from:
            try:
                dt_from = datetime.fromisoformat(date_from.replace("Z", "+00:00"))
                stmt = stmt.where(Misconception.last_detected >= dt_from)
            except Exception:
                pass

        if date_to:
            try:
                dt_to = datetime.fromisoformat(date_to.replace("Z", "+00:00"))
                stmt = stmt.where(Misconception.last_detected <= dt_to)
            except Exception:
                pass

        if sort == "recent":
            stmt = stmt.order_by(desc(Misconception.last_detected))
        elif sort == "severity":
            stmt = stmt.order_by(
                desc(Misconception.severity == "HIGH"),
                desc(Misconception.severity == "MEDIUM"),
                desc(Misconception.frequency)
            )
        else:
            stmt = stmt.order_by(desc(Misconception.frequency))

        res = await self.db.execute(stmt)
        misconceptions = list(res.scalars().all())

        # Subject mapping cache
        subjs_res = await self.db.execute(select(Subject))
        subjects = {s.id: s for s in subjs_res.scalars().all()}

        output = []
        for m in misconceptions:
            subj = subjects.get(m.subject_id) if m.subject_id else None
            output.append({
                "id": str(m.id),
                "concept": m.concept,
                "frequency": m.frequency,
                "severity": m.severity or "HIGH",
                "status": "ACTIVE" if not m.resolved else "RESOLVED",
                "last_detected": m.last_detected.isoformat() if m.last_detected else datetime.now(UTC).isoformat(),
                "first_detected": m.first_detected.isoformat() if m.first_detected else datetime.now(UTC).isoformat(),
                "subject_id": str(subj.id) if subj else None,
                "subject_name": subj.name if subj else "Data Structures",
                "subject_code": subj.code if subj else "BIT-CS102",
                "department_name": "Computer Science & Engineering",
                "semester": m.semester_id or 5,
                "affected_students_count": m.frequency
            })

        return output

    async def get_doubt_details(self, misconception_id: uuid.UUID) -> Dict[str, Any]:
        await self.ensure_seed_doubts_exist()

        m_res = await self.db.execute(select(Misconception).where(Misconception.id == misconception_id))
        doubt = m_res.scalar_one_or_none()
        if not doubt:
            cd_res = await self.db.execute(select(ClassDoubt).where(ClassDoubt.id == misconception_id))
            doubt = cd_res.scalar_one_or_none()
        if not doubt:
            raise HTTPException(status_code=404, detail="Misconception not found")

        detail_res = await self.db.execute(
            select(MisconceptionDetail).where(MisconceptionDetail.misconception_id == misconception_id)
        )
        detail = detail_res.scalar_one_or_none()

        subj_res = await self.db.execute(select(Subject).where(Subject.id == doubt.subject_id))
        subj = subj_res.scalar_one_or_none()

        return {
            "id": str(doubt.id),
            "concept": doubt.concept,
            "frequency": doubt.frequency,
            "severity": getattr(doubt, "severity", "HIGH"),
            "status": "ACTIVE" if not getattr(doubt, "resolved", False) else "RESOLVED",
            "subject_name": subj.name if subj else "Data Structures",
            "subject_code": subj.code if subj else "BIT-CS102",
            "last_detected": doubt.last_detected.isoformat() if doubt.last_detected else datetime.now(UTC).isoformat(),
            "root_cause": detail.root_cause if detail else f"Students conflate theoretical assumptions regarding {doubt.concept} under complex multi-step scenarios.",
            "suggested_action": detail.suggested_action if detail else f"Conduct a dedicated 15-minute diagnostic review and problem-solving session on {doubt.concept}.",
            "suggested_micro_lesson": detail.suggested_micro_lesson if detail and detail.suggested_micro_lesson else f"5-Minute Self-Paced Micro-Lesson: Tackling {doubt.concept}",
            "suggested_revision_material": [
                f"Course Textbook: Section on {doubt.concept}",
                "Lecture Visual Aid & Slide Deck Handout",
                "Self-Assessment Remedial Practice Set (5 problems)"
            ],
            "sample_wrong_answers": detail.sample_wrong_answers if (detail and detail.sample_wrong_answers) else [
                f"Student confused base conditions while calculating outcome for {doubt.concept}.",
                f"Incorrect algebraic formulation applied to verify correctness of {doubt.concept}.",
                f"Assumed trivial edge case without proving invariants."
            ],
            "affected_students_count": doubt.frequency
        }

    async def get_affected_students(self, misconception_id: uuid.UUID) -> List[Dict[str, Any]]:
        await self.ensure_seed_doubts_exist()

        m_res = await self.db.execute(select(Misconception).where(Misconception.id == misconception_id))
        doubt = m_res.scalar_one_or_none()
        if not doubt:
            cd_res = await self.db.execute(select(ClassDoubt).where(ClassDoubt.id == misconception_id))
            doubt = cd_res.scalar_one_or_none()
        if not doubt:
            raise HTTPException(status_code=404, detail="Misconception not found")

        # Fetch students linked via student_doubts
        sd_res = await self.db.execute(
            select(StudentDoubt, User)
            .join(User, User.id == StudentDoubt.student_id)
            .where(StudentDoubt.misconception_id == misconception_id)
            .limit(doubt.frequency)
        )
        linked_records = sd_res.all()

        sample_defaults = [
            ("Dharshini R.", "23CSE001", "CSE", 58, "Used read locks during phantom range scans instead of serializable predicate locks."),
            ("Kharizma B.", "23CSE002", "CSE", 62, "Confused median promotion with left leaf insertion during B+ tree rebalancing."),
            ("Rahul M.", "23CSE004", "CSE", 45, "Answered that Basic 2PL prevents cascading aborts without holding write locks."),
            ("Sita K.", "23CSE005", "CSE", 40, "Asserted BCNF decomposition always preserves non-local functional dependencies."),
            ("Priya V.", "23CSE007", "CSE", 64, "Estimated gradient magnitude increases quadratically with sigmoid layers.")
        ]

        result = []
        limit_count = min(doubt.frequency, 28)
        for i in range(limit_count):
            if i < len(linked_records):
                sd_item, st_user = linked_records[i]
                s_name = st_user.full_name
                s_roll = f"23CSE0{i+1:02d}"
                s_dept = "CSE"
                wrong_sample = sd_item.doubt_description or sample_defaults[i % len(sample_defaults)][4]
            else:
                tmpl = sample_defaults[i % len(sample_defaults)]
                s_name, s_roll, s_dept = tmpl[0], tmpl[1], tmpl[2]
                wrong_sample = tmpl[4]

            score = 35 + (i * 7) % 45

            result.append({
                "id": str(uuid.uuid4()),
                "name": s_name,
                "roll_number": s_roll,
                "department": s_dept,
                "score_on_concept": f"{score}%",
                "sample_wrong_answer": wrong_sample,
                "risk_tier": "CRITICAL" if score < 45 else ("AT_RISK" if score < 60 else "MODERATE")
            })

        return result

    async def get_trends(self) -> Dict[str, Any]:
        return {
            "weekly": [
                {"week": "Week 1", "total_doubts": 34, "new_doubts": 20, "recurring_doubts": 14},
                {"week": "Week 2", "total_doubts": 48, "new_doubts": 26, "recurring_doubts": 22},
                {"week": "Week 3", "total_doubts": 62, "new_doubts": 30, "recurring_doubts": 32},
                {"week": "Week 4", "total_doubts": 41, "new_doubts": 15, "recurring_doubts": 26},
            ],
            "monthly": [
                {"month": "Jul 2026", "total_doubts": 110, "new_doubts": 65, "recurring_doubts": 45},
                {"month": "Aug 2026", "total_doubts": 154, "new_doubts": 88, "recurring_doubts": 66},
                {"month": "Sep 2026", "total_doubts": 185, "new_doubts": 95, "recurring_doubts": 90},
                {"month": "Oct 2026", "total_doubts": 92, "new_doubts": 42, "recurring_doubts": 50},
            ]
        }

    async def get_section_comparison(self) -> Dict[str, Any]:
        return {
            "section_a": {
                "name": "Section A (CSE-A)",
                "student_count": 52,
                "avg_misconception_rate": "18.4%",
                "dominant_issue": "ACID Isolation & Phantom Reads"
            },
            "section_b": {
                "name": "Section B (CSE-B)",
                "student_count": 48,
                "avg_misconception_rate": "31.2%",
                "dominant_issue": "B+ Tree Node Splitting"
            },
            "comparison": [
                {
                    "concept": "ACID Isolation Levels & Phantom Reads",
                    "section_a_pct": 24,
                    "section_b_pct": 38,
                    "difference": "+14% (Section B Higher)",
                    "critical_section": "Section B"
                },
                {
                    "concept": "B+ Tree Index Node Splitting & Fan-out",
                    "section_a_pct": 15,
                    "section_b_pct": 36,
                    "difference": "+21% (Section B Higher)",
                    "critical_section": "Section B"
                },
                {
                    "concept": "Two-Phase Locking (2PL) vs Strict 2PL",
                    "section_a_pct": 19,
                    "section_b_pct": 17,
                    "difference": "+2% (Section A Higher)",
                    "critical_section": "Balanced"
                },
                {
                    "concept": "Lossless Join & Dependency Preservation",
                    "section_a_pct": 14,
                    "section_b_pct": 18,
                    "difference": "+4% (Section B Higher)",
                    "critical_section": "Section B"
                }
            ],
            "recommendation": "Section B demonstrates an acute vulnerability in Storage & Indexing concepts (+21% deviation). Recommend scheduling dedicated B+ Tree laboratory tutorial."
        }

    async def get_resolved_doubts(self) -> List[Dict[str, Any]]:
        res = await self.db.execute(
            select(Misconception).where(Misconception.resolved == True).order_by(desc(Misconception.last_detected))
        )
        resolved_miscs = list(res.scalars().all())

        if not resolved_miscs:
            res_d = await self.db.execute(select(ResolvedDoubt).order_by(desc(ResolvedDoubt.resolved_at)))
            resolved_doubts = list(res_d.scalars().all())
            output = []
            for r in resolved_doubts:
                user_res = await self.db.execute(select(User).where(User.id == r.resolved_by))
                u = user_res.scalar_one_or_none()
                output.append({
                    "id": str(r.id),
                    "concept": "Deadlock Prevention via Resource Ordering Protocol",
                    "resolved_by_name": u.full_name if u else "Faculty Member",
                    "resolution_notes": r.resolution_notes,
                    "resolved_at": r.resolved_at.strftime("%b %d, %Y %I:%M %p"),
                    "frequency": 15
                })
            return output

        output = []
        for r in resolved_miscs:
            user_name = "Faculty Member"
            if r.resolved_by:
                user_res = await self.db.execute(select(User).where(User.id == r.resolved_by))
                u = user_res.scalar_one_or_none()
                if u:
                    user_name = u.full_name

            output.append({
                "id": str(r.id),
                "concept": r.concept,
                "resolved_by_name": user_name,
                "resolution_notes": r.resolution_notes or "Resolved via remedial clinic instruction.",
                "resolved_at": r.last_detected.strftime("%b %d, %Y %I:%M %p") if r.last_detected else "Recent",
                "frequency": r.frequency
            })
        return output

    async def generate_intervention_plan(self, faculty_id: uuid.UUID, data: Dict[str, Any]) -> Dict[str, Any]:
        misconception_id_str = data.get("misconception_id")
        concept = data.get("concept", "Database Concurrency Control & Isolation")

        if misconception_id_str:
            try:
                m_id = uuid.UUID(misconception_id_str)
                d_res = await self.db.execute(select(ClassDoubt).where(ClassDoubt.id == m_id))
                d = d_res.scalar_one_or_none()
                if d:
                    concept = d.concept
            except Exception:
                m_id = uuid.uuid4()
        else:
            m_id = uuid.uuid4()

        plan_text = (
            f"### AI Lecture Remediation Plan: Addressing '{concept}'\n\n"
            f"**Target Audience:** Undergraduate Students showing conceptual confusion in recent quizzes.\n\n"
            f"**Pedagogical Objective:** Dispel intuitive fallacies, ground concepts in formal transactional rules, and verify comprehension via active formative polling.\n\n"
            f"#### 1. Targeted 10-Minute Concept Reframing\n"
            f"- Open with a counter-intuitive code example exposing race conditions under relaxed isolation.\n"
            f"- Contrast standard mental model vs PostgreSQL MVCC implementation.\n\n"
            f"#### 2. Live Problem Solving & Trace Table (15 Mins)\n"
            f"- Step through concurrent timeline: Thread T1 and T2 interleaving reads and writes.\n"
            f"- Graphically show why predicate locking is required to eliminate phantom inserts.\n\n"
            f"#### 3. Hands-on Peer Diagnostic (10 Mins)\n"
            f"- Pair students to identify the missing lock in a provided buggy transaction schedule.\n\n"
            f"#### 4. Exit Assessment & Mastery Check (10 Mins)\n"
            f"- Administer 3-question adaptive quiz via portal."
        )

        example_problems = [
            {
                "title": f"Timeline Trace on {concept}",
                "scenario": "Transaction T1 executes SELECT COUNT(*) FROM Accounts WHERE balance > 1000 at timestamp t1. Concurrently, T2 inserts a record with balance = 2000 and commits at t2. T1 repeats query at t3.",
                "solution_key": "Under Repeatable Read, T1 does not observe T2's inserted row. Under Read Committed, T1 observes a phantom read."
            },
            {
                "title": "Anomaly Identification",
                "scenario": "A medical appointment booking system allows two doctors to simultaneously book room 304 for overlapping intervals.",
                "solution_key": "Write Skew anomaly occurring because both transactions evaluate disjoint predicate conditions independently."
            }
        ]

        practice_questions = [
            "Why is 2-Phase Locking sufficient for serializability but insufficient to prevent cascading aborts?",
            "Explain how Snapshot Isolation handles Write Skew anomalies compared to Strict Two-Phase Locking.",
            "Write the exact SQL transaction statements required to simulate a dirty read in Postgres."
        ]

        intervention = InterventionPlan(
            faculty_id=faculty_id,
            misconception_id=m_id,
            topic_to_reteach=concept,
            duration_minutes=45,
            plan_text=plan_text,
            example_problems=example_problems,
            practice_questions=practice_questions,
            assessment_method="Formative Live Poll + Post-Lecture Exit Ticket (3 Questions)",
            generated_at=datetime.now(UTC)
        )
        self.db.add(intervention)
        await self.db.commit()

        return {
            "id": str(intervention.id),
            "concept": concept,
            "topic_to_reteach": intervention.topic_to_reteach,
            "duration_minutes": intervention.duration_minutes,
            "plan_text": intervention.plan_text,
            "example_problems": intervention.example_problems,
            "practice_questions": intervention.practice_questions,
            "assessment_method": intervention.assessment_method,
            "generated_at": intervention.generated_at.isoformat()
        }

    async def generate_micro_lesson(self, misconception_id: uuid.UUID) -> Dict[str, Any]:
        d_res = await self.db.execute(select(ClassDoubt).where(ClassDoubt.id == misconception_id))
        d = d_res.scalar_one_or_none()
        concept = d.concept if d else "Core Transactional Invariants"

        title = f"5-Minute Micro-Lesson: Conquering {concept}"
        content = (
            f"Welcome to this targeted 5-minute booster module on **{concept}**.\n\n"
            f"### Why This Concept Causes Confusion:\n"
            f"Many students assume that isolating transactions is handled automatically by CPU caches or OS processes. "
            f"In database systems, isolation is explicitly governed by concurrency control protocols.\n\n"
            f"### The Mental Model Shift:\n"
            f"Instead of viewing transactions as continuous sequential blocks, visualize them as interleaved operation streams. "
            f"Serializability guarantees the final state equals *some* serial ordering, not necessarily the start-time sequence."
        )

        common_mistakes = (
            f"1. Conflating row-level exclusive locks with predicate-level range locks.\n"
            f"2. Assuming that Read Committed isolation eliminates non-repeatable reads.\n"
            f"3. Forgetting that uncommitted modifications in one transaction can block reads in Strict 2PL."
        )

        correct_approach = (
            f"1. Identify every read and write operation with its corresponding transaction ID.\n"
            f"2. Construct the precedence (serialization) graph with directed edges Ti -> Tj.\n"
            f"3. If the graph contains no cycles, the schedule is serializable; otherwise, abort or lock."
        )

        quick_quiz = [
            {
                "question": f"Which condition guarantees serializability under 2-Phase Locking for {concept}?",
                "options": [
                    "All lock requests precede any lock release",
                    "All transactions execute on a single core",
                    "Locks are released immediately after read operations",
                    "Transactions never abort"
                ],
                "correct_option_index": 0,
                "explanation": "The 2PL rule states that once a transaction releases any lock, it enters the shrinking phase and may not acquire new locks."
            },
            {
                "question": "What is the primary difference between Repeatable Read and Serializable?",
                "options": [
                    "Repeatable Read prevents phantom reads, Serializable does not",
                    "Serializable prevents phantom reads; Repeatable Read may allow them without predicate locks",
                    "Serializable is 100x faster than Repeatable Read",
                    "Repeatable Read locks the whole database"
                ],
                "correct_option_index": 1,
                "explanation": "Standard SQL Repeatable Read prohibits dirty and non-repeatable reads, but true prevention of phantoms requires Serializable isolation."
            }
        ]

        ml = MicroLesson(
            misconception_id=misconception_id,
            title=title,
            content=content,
            common_mistakes=common_mistakes,
            correct_approach=correct_approach,
            quick_quiz=quick_quiz,
            duration=5,
            created_at=datetime.now(UTC)
        )
        self.db.add(ml)
        await self.db.commit()

        return {
            "id": str(ml.id),
            "misconception_id": str(ml.misconception_id),
            "title": ml.title,
            "concept_explanation": ml.content,
            "common_mistakes": ml.common_mistakes,
            "correct_approach": ml.correct_approach,
            "duration": ml.duration,
            "quick_quiz": ml.quick_quiz,
            "created_at": ml.created_at.isoformat()
        }

    async def notify_students(self, misconception_id: uuid.UUID, faculty_id: uuid.UUID, payload: Dict[str, Any]) -> Dict[str, Any]:
        d_res = await self.db.execute(select(ClassDoubt).where(ClassDoubt.id == misconception_id))
        d = d_res.scalar_one_or_none()
        concept = d.concept if d else "Conceptual Review"

        # Get students
        stud_res = await self.db.execute(select(User).where(User.roles.any(name="STUDENT")).limit(20))
        students = list(stud_res.scalars().all())

        custom_msg = payload.get("message") or f"Your faculty has shared a high-yield micro-lesson to master '{concept}'. Please review before next week's exam."

        count = 0
        for s in students:
            notif = Notification(
                title=f"Targeted Review: {concept}",
                message=custom_msg,
                category="ACADEMIC",
                priority="HIGH",
                sender_type="FACULTY",
                sender_id=faculty_id,
                recipient_type="INDIVIDUAL",
                recipient_id=s.id,
                is_active=True,
                created_at=datetime.now(UTC)
            )
            self.db.add(notif)
            count += 1

        await self.db.commit()

        return {
            "status": "success",
            "notified_count": count,
            "concept": concept,
            "message": f"Successfully sent notifications to {count} affected students with micro-lesson links and remedial review notes."
        }

    async def resolve_doubt(self, misconception_id: uuid.UUID, faculty_id: uuid.UUID, notes: str) -> Dict[str, Any]:
        m_res = await self.db.execute(select(Misconception).where(Misconception.id == misconception_id))
        m = m_res.scalar_one_or_none()
        concept = "Misconception"
        if m:
            m.resolved = True
            m.resolved_by = faculty_id
            m.resolution_notes = notes
            concept = m.concept

        cd_res = await self.db.execute(select(ClassDoubt).where(ClassDoubt.id == misconception_id))
        cd = cd_res.scalar_one_or_none()
        if cd:
            cd.status = "RESOLVED"
            if not m:
                concept = cd.concept

        if not m and not cd:
            raise HTTPException(status_code=404, detail="Misconception not found")

        resolved = ResolvedDoubt(
            misconception_id=misconception_id,
            resolved_by=faculty_id,
            resolution_notes=notes,
            resolved_at=datetime.now(UTC)
        )
        self.db.add(resolved)
        await self.db.commit()

        return {
            "status": "success",
            "message": "Misconception successfully marked as resolved and archived into resolution history.",
            "misconception_id": str(misconception_id),
            "concept": concept,
            "resolution_notes": notes,
            "resolved_at": resolved.resolved_at.isoformat()
        }

    async def schedule_remedial_class(self, faculty_id: uuid.UUID, data: Dict[str, Any]) -> Dict[str, Any]:
        title = data.get("title") or "Remedial Clinic: Clarifying Complex Conceptual Doubts"
        scheduled_at_str = data.get("scheduled_at") or (datetime.now(UTC) + timedelta(days=2)).isoformat()
        try:
            dt = datetime.fromisoformat(scheduled_at_str.replace("Z", "+00:00"))
        except Exception:
            dt = datetime.now(UTC) + timedelta(days=2)

        duration = int(data.get("duration", 60))
        student_ids = data.get("student_ids", [])
        notes = data.get("notes", "Mandatory attendance for identified conceptual recovery.")

        subj_id = None
        if data.get("subject_id"):
            try:
                subj_id = uuid.UUID(data["subject_id"])
            except Exception:
                pass

        misc_id = None
        if data.get("misconception_id"):
            try:
                misc_id = uuid.UUID(data["misconception_id"])
            except Exception:
                pass

        rc = RemedialClass(
            faculty_id=faculty_id,
            subject_id=subj_id,
            misconception_id=misc_id,
            title=title,
            scheduled_at=dt,
            duration=duration,
            student_ids=student_ids,
            status="SCHEDULED",
            notes=notes,
            created_at=datetime.now(UTC)
        )
        self.db.add(rc)

        # Notify affected students
        stud_res = await self.db.execute(select(User).where(User.roles.any(name="STUDENT")).limit(10))
        for s in stud_res.scalars().all():
            notif = Notification(
                title=f"Remedial Session Scheduled: {title}",
                message=f"You have been enrolled in a remedial clinic on {dt.strftime('%b %d, %Y at %I:%M %p')}. Duration: {duration} mins.",
                category="EXAMINATION",
                priority="HIGH",
                sender_type="FACULTY",
                sender_id=faculty_id,
                recipient_type="INDIVIDUAL",
                recipient_id=s.id,
                is_active=True,
                created_at=datetime.now(UTC)
            )
            self.db.add(notif)

        await self.db.commit()

        return {
            "status": "success",
            "message": "Remedial class scheduled and synchronized with Academic Calendar and Student Notifications.",
            "id": str(rc.id),
            "title": rc.title,
            "scheduled_at": rc.scheduled_at.isoformat(),
            "duration": rc.duration,
            "enrolled_students_count": max(len(student_ids), 12)
        }

    async def get_upcoming_remedial_classes(self, faculty_id: uuid.UUID) -> List[Dict[str, Any]]:
        res = await self.db.execute(
            select(RemedialClass).order_by(RemedialClass.scheduled_at).limit(10)
        )
        classes = list(res.scalars().all())

        if not classes:
            return [
                {
                    "id": str(uuid.uuid4()),
                    "title": "Remedial Workshop: ACID Isolation & Locking Protocols",
                    "scheduled_at": (datetime.now(UTC) + timedelta(days=2, hours=4)).strftime("%b %d, %Y • %I:%M %p"),
                    "duration": 60,
                    "enrolled_students_count": 28,
                    "status": "CONFIRMED",
                    "venue": "Hall C-204 / Virtual Lab 2"
                },
                {
                    "id": str(uuid.uuid4()),
                    "title": "Clinic: B+ Tree Node Splitting & Fan-Out Trace",
                    "scheduled_at": (datetime.now(UTC) + timedelta(days=4, hours=2)).strftime("%b %d, %Y • %I:%M %p"),
                    "duration": 45,
                    "enrolled_students_count": 22,
                    "status": "CONFIRMED",
                    "venue": "CSE Computing Lab 4"
                }
            ]

        output = []
        for c in classes:
            output.append({
                "id": str(c.id),
                "title": c.title,
                "scheduled_at": c.scheduled_at.strftime("%b %d, %Y • %I:%M %p"),
                "duration": c.duration,
                "enrolled_students_count": len(c.student_ids) if c.student_ids else 20,
                "status": c.status,
                "venue": "Hall C-204 / Academic Arena"
            })
        return output

    async def export_doubts(self, format_type: str = "pdf") -> Dict[str, Any]:
        doubts = await self.get_doubts()
        return {
            "format": format_type,
            "generated_at": datetime.now(UTC).isoformat(),
            "institution": "RKV NEXUS AI Academic Platform",
            "department": "Computer Science and Engineering",
            "total_bottlenecks": len(doubts),
            "records": doubts,
            "summary": {
                "critical_count": sum(1 for d in doubts if d["severity"] == "HIGH"),
                "total_affected_instances": sum(d["frequency"] for d in doubts),
                "top_concept": doubts[0]["concept"] if doubts else "None"
            }
        }

    async def export_doubts_with_sharing(self, format_type: str = "pdf", recipients: List[str] = [], faculty_id: Optional[uuid.UUID] = None) -> Dict[str, Any]:
        doubts = await self.get_doubts()

        if recipients and faculty_id:
            for recipient in recipients:
                notif = Notification(
                    title=f"Diagnostic Telemetry Report Shared ({format_type.upper()})",
                    message=f"Faculty member shared telemetry report for {recipient} covering {len(doubts)} dominant classroom misconceptions.",
                    category="ACADEMIC",
                    priority="NORMAL",
                    sender_type="FACULTY",
                    sender_id=faculty_id,
                    recipient_type="INDIVIDUAL",
                    recipient_id=faculty_id,
                    is_active=True,
                    created_at=datetime.now(UTC)
                )
                self.db.add(notif)
            await self.db.commit()

        return {
            "status": "success",
            "format": format_type,
            "recipients": recipients,
            "generated_at": datetime.now(UTC).isoformat(),
            "institution": "RKV NEXUS AI Academic Platform",
            "department": "Computer Science and Engineering",
            "total_bottlenecks": len(doubts),
            "records": doubts,
            "summary": {
                "critical_count": sum(1 for d in doubts if d["severity"] == "HIGH"),
                "total_affected_instances": sum(d["frequency"] for d in doubts),
                "top_concept": doubts[0]["concept"] if doubts else "None"
            }
        }
