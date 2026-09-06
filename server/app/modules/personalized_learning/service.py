import uuid
from datetime import datetime, UTC
from typing import List, Dict, Any, Optional
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from app.modules.personalized_learning.repository import PersonalizedLearningRepository
from app.modules.personalized_learning.model import RemedialLearningPlan, StudentKnowledgeState
from app.modules.learning_outcomes.model import CourseOutcome
from app.modules.evaluation.model import EvaluationResult, QuestionEvaluation
from app.modules.assessment_attempts.model import StudentExamAttempt
from app.modules.examinations.model import ExamQuestion
from app.modules.questions.model import Question
from app.modules.syllabus.model import Unit, Topic

from app.modules.users.model import StudentProfile

class PersonalizedLearningService:
    def __init__(self, session: AsyncSession):
        self.session = session
        self.repo = PersonalizedLearningRepository(session)

    async def _resolve_student_profile_id(self, student_id: uuid.UUID) -> uuid.UUID:
        stmt = select(StudentProfile.id).where(StudentProfile.user_id == student_id)
        res = await self.session.execute(stmt)
        sp_id = res.scalar_one_or_none()
        return sp_id if sp_id else student_id

    async def generate_remedial_plan(self, student_id: uuid.UUID, subject_id: uuid.UUID) -> RemedialLearningPlan:
        """
        Generates a personalized remedial plan based on actual StudentKnowledgeState entries or subject topics.
        """
        student_id = await self._resolve_student_profile_id(student_id)
        states = await self.repo.list_student_knowledge_states(student_id)

        weak_list = []
        resources = []

        for s in states:
            if s.status == "WEAK" and s.topic:
                weak_list.append({
                    "topic_id": str(s.topic_id),
                    "title": s.topic.title,
                    "mastery_pct": round(s.mastery_level * 100.0, 1)
                })
                resources.append({
                    "topic": s.topic.title,
                    "resource_type": "Remedial Reading & Practice",
                    "title": f"Mastering {s.topic.title}: Key Concepts & Solved Examples",
                    "url": f"/student/subjects?topic={s.topic_id}"
                })

        # If no weak topics identified from prior knowledge states, fallback to subject syllabus topics
        if not weak_list:
            unit_stmt = select(Unit).options(selectinload(Unit.topics)).where(Unit.subject_id == subject_id)
            unit_res = await self.session.execute(unit_stmt)
            units = list(unit_res.scalars().all())

            for u in units:
                for t in u.topics:
                    weak_list.append({
                        "topic_id": str(t.id),
                        "title": t.title,
                        "mastery_pct": 50.0
                    })
                    resources.append({
                        "topic": t.title,
                        "resource_type": "Subject Syllabus Guide",
                        "title": f"Study Guide: {t.title}",
                        "url": f"/student/subjects?topic={t.id}"
                    })

            if not weak_list:
                fallback_id = str(uuid.uuid4())
                weak_list.append({
                    "topic_id": fallback_id,
                    "title": "Subject Core Concepts & Fundamentals",
                    "mastery_pct": 50.0
                })
                resources.append({
                    "topic": "Core Concepts",
                    "resource_type": "Foundation Reading",
                    "title": "Subject Fundamentals & Practice Questions",
                    "url": f"/student/subjects?subject_id={subject_id}"
                })

        plan = await self.repo.create_remedial_plan(
            student_id=student_id,
            subject_id=subject_id,
            title="Personalized Remedial Learning Plan",
            weak_topics=weak_list,
            recommended_resources=resources
        )
        await self.session.commit()
        return plan

    async def update_knowledge_state(self, student_id: uuid.UUID, eval_result_id: uuid.UUID) -> list[StudentKnowledgeState]:
        """
        Updates student knowledge state records for all topics tested in the evaluated exam attempt.
        """
        student_id = await self._resolve_student_profile_id(student_id)
        eval_stmt = (

            select(EvaluationResult)
            .options(
                selectinload(EvaluationResult.question_evaluations).selectinload(QuestionEvaluation.question)
            )
            .where(EvaluationResult.id == eval_result_id)
        )
        res = await self.session.execute(eval_stmt)
        eval_result = res.scalar_one_or_none()

        if not eval_result:
            return []

        topic_scores: dict[uuid.UUID, list[float]] = {}
        for q_eval in eval_result.question_evaluations:
            q = q_eval.question
            if not q or q_eval.max_score <= 0:
                continue

            t_id = q.topic_id
            if not t_id:
                subj_id = getattr(q, 'subject_id', None)
                if not subj_id and eval_result.attempt and eval_result.attempt.examination:
                    subj_id = eval_result.attempt.examination.subject_id
                if subj_id:
                    stmt_t = select(Topic).join(Unit).where(Unit.subject_id == subj_id).limit(1)
                    res_t = await self.session.execute(stmt_t)
                    t_obj = res_t.scalar_one_or_none()
                    if t_obj:
                        t_id = t_obj.id
                        q.topic_id = t_id
                    else:
                        stmt_u = select(Unit).where(Unit.subject_id == subj_id).limit(1)
                        res_u = await self.session.execute(stmt_u)
                        u_obj = res_u.scalar_one_or_none()
                        if not u_obj:
                            u_obj = Unit(subject_id=subj_id, unit_number=1, title="Core Curriculum Unit")
                            self.session.add(u_obj)
                            await self.session.flush()
                        t_title = (q.prompt[:50] + "...") if q.prompt else "Core Technical Concept"
                        t_obj = Topic(unit_id=u_obj.id, topic_number=1, title=t_title)
                        self.session.add(t_obj)
                        await self.session.flush()
                        t_id = t_obj.id
                        q.topic_id = t_id

            if t_id:
                pct = max(0.0, min(1.0, q_eval.final_score / q_eval.max_score))
                topic_scores.setdefault(t_id, []).append(pct)

        updated_states = []
        for topic_id, score_list in topic_scores.items():
            avg_mastery = sum(score_list) / len(score_list)
            status = "WEAK" if avg_mastery < 0.60 else "MASTERED"

            # Check existing knowledge state
            existing_stmt = select(StudentKnowledgeState).where(
                StudentKnowledgeState.student_id == student_id,
                StudentKnowledgeState.topic_id == topic_id
            )
            existing_res = await self.session.execute(existing_stmt)
            state = existing_res.scalar_one_or_none()

            if state:
                # Exponential moving average update based on previous knowledge state
                state.mastery_level = round((0.4 * state.mastery_level) + (0.6 * avg_mastery), 3)
                state.status = "WEAK" if state.mastery_level < 0.60 else "MASTERED"
                state.last_updated_at = datetime.now(UTC)
            else:
                state = StudentKnowledgeState(
                    student_id=student_id,
                    topic_id=topic_id,
                    mastery_level=round(avg_mastery, 3),
                    status=status
                )
                self.session.add(state)

            updated_states.append(state)

        await self.session.commit()
        return updated_states

    async def record_exam_co_attainment(
        self,
        subject_id: uuid.UUID,
        exam_id: uuid.UUID,
        student_id: uuid.UUID,
        co_results: list[dict[str, Any]]
    ):
        from sqlalchemy import text
        student_profile_id = await self._resolve_student_profile_id(student_id)
        stmt = select(CourseOutcome).where(CourseOutcome.subject_id == subject_id)
        res = await self.session.execute(stmt)
        cos = list(res.scalars().all())

        for item in co_results:
            co_obj = next((c for c in cos if c.code == item.get("co_code")), None)
            co_id_val = co_obj.id if co_obj else None
            stmt_ins = text("""
                INSERT INTO co_attainments (subject_id, exam_id, student_id, co_id, co_code, attainment_pct, status, created_at, updated_at)
                VALUES (:subj_id, :exam_id, :student_id, :co_id, :co_code, :pct, :status, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            """)
            await self.session.execute(stmt_ins, {
                "subj_id": subject_id,
                "exam_id": exam_id,
                "student_id": student_profile_id,
                "co_id": co_id_val,
                "co_code": item.get("co_code", "CO1"),
                "pct": item.get("attainment_pct", 0.0),
                "status": item.get("status", "MET")
            })
        await self.session.commit()

    async def calculate_co_attainment(self, subject_id: uuid.UUID) -> list[dict[str, Any]]:
        """
        Calculate Course Outcome attainment percentage based on actual student evaluation results.
        Uses direct Question.co_id mapping where available, with topic/subject fallbacks.
        """
        stmt = select(CourseOutcome).where(CourseOutcome.subject_id == subject_id)
        res = await self.session.execute(stmt)
        cos = list(res.scalars().all())

        if not cos:
            return []

        # Get evaluated question scores mapped to COs
        co_eval_stmt = (
            select(
                Question.co_id,
                func.avg(QuestionEvaluation.final_score / QuestionEvaluation.max_score).label("avg_pct")
            )
            .join(QuestionEvaluation, QuestionEvaluation.question_id == Question.id)
            .join(EvaluationResult, QuestionEvaluation.evaluation_result_id == EvaluationResult.id)
            .where(Question.subject_id == subject_id, Question.co_id.is_not(None))
            .group_by(Question.co_id)
        )
        co_res = await self.session.execute(co_eval_stmt)
        co_score_map: dict[uuid.UUID, float] = {
            row.co_id: float(row.avg_pct or 0.0) * 100.0 for row in co_res.all()
        }

        # Subject-wide average fallback for unassessed COs if general evaluation data exists
        subject_avg_stmt = (
            select(func.avg(QuestionEvaluation.final_score / QuestionEvaluation.max_score).label("overall_avg"))
            .join(Question, QuestionEvaluation.question_id == Question.id)
            .where(Question.subject_id == subject_id)
        )
        subj_res = await self.session.execute(subject_avg_stmt)
        overall_avg = subj_res.scalar()
        subject_avg_pct = round(float(overall_avg) * 100.0, 1) if overall_avg is not None else None

        results = []
        for co in cos:
            if co.id in co_score_map:
                attainment = round(co_score_map[co.id], 1)
                data_source = "direct_question_co_evaluations"
            elif subject_avg_pct is not None:
                # Apply Bloom-level adjustments
                bloom_levels = ["REMEMBER", "UNDERSTAND", "APPLY", "ANALYZE", "EVALUATE", "CREATE"]
                try:
                    bloom_idx = bloom_levels.index(co.bloom_level.upper())
                except ValueError:
                    bloom_idx = 2
                attainment = round(max(0.0, min(100.0, subject_avg_pct - (bloom_idx * 2.5))), 1)
                data_source = "subject_aggregate_evaluations"
            else:
                attainment = 0.0
                data_source = "no_evaluation_data"

            status = "MET" if attainment >= 60.0 else ("GAP" if attainment > 0 else "NOT_ASSESSED")

            results.append({
                "co_code": co.code,
                "statement": co.statement,
                "bloom_level": co.bloom_level,
                "attainment_pct": attainment,
                "status": status,
                "data_source": data_source
            })

        # Also persist to co_attainments table
        from sqlalchemy import text
        for item in results:
            co_obj = next((c for c in cos if c.code == item["co_code"]), None)
            co_id_val = co_obj.id if co_obj else None
            stmt_ins = text("""
                INSERT INTO co_attainments (subject_id, co_id, co_code, attainment_pct, status, created_at, updated_at)
                VALUES (:subj_id, :co_id, :co_code, :pct, :status, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            """)
            await self.session.execute(stmt_ins, {
                "subj_id": subject_id,
                "co_id": co_id_val,
                "co_code": item["co_code"],
                "pct": item["attainment_pct"],
                "status": item["status"]
            })
        await self.session.commit()

        return results
