import uuid
from datetime import datetime, UTC
from typing import Optional, List, Dict, Any
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.adaptive.model import AdaptiveExam
from app.modules.questions.model import Question, QuestionOption
from app.modules.examinations.model import Examination
from app.modules.gamification.service import GamificationService

class AdaptiveExamService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def start_adaptive_session(
        self,
        student_id: uuid.UUID,
        exam_id: Optional[uuid.UUID] = None,
        subject_id: Optional[uuid.UUID] = None
    ) -> Dict[str, Any]:
        # Initialize adaptive session with ability = 50.0, difficulty = MEDIUM
        session = AdaptiveExam(
            student_id=student_id,
            exam_id=exam_id,
            subject_id=subject_id,
            current_difficulty="MEDIUM",
            questions_answered=0,
            correct_answers=0,
            current_ability=50.0,
            is_completed=False,
            score=0.0
        )
        self.db.add(session)
        await self.db.flush()

        # Fetch first question (MEDIUM)
        next_q = await self.fetch_question_for_difficulty("MEDIUM", subject_id=subject_id)
        
        return {
            "adaptive_exam_id": str(session.id),
            "current_difficulty": session.current_difficulty,
            "current_ability": session.current_ability,
            "questions_answered": 0,
            "total_questions": 10,
            "time_remaining_minutes": 30,
            "question": next_q
        }

    async def fetch_question_for_difficulty(
        self,
        difficulty: str,
        subject_id: Optional[uuid.UUID] = None,
        excluded_ids: Optional[List[uuid.UUID]] = None
    ) -> Dict[str, Any]:
        stmt = (
            select(Question)
            .options(selectinload(Question.options))
            .where(Question.difficulty == difficulty)
        )
        if subject_id:
            stmt = stmt.where(Question.subject_id == subject_id)
        if excluded_ids:
            stmt = stmt.where(~Question.id.in_(excluded_ids))
        
        stmt = stmt.limit(1)
        res = await self.db.execute(stmt)
        q = res.scalar_one_or_none()

        if not q:
            # Fallback to any difficulty question
            any_stmt = select(Question).options(selectinload(Question.options)).limit(1)
            any_res = await self.db.execute(any_stmt)
            q = any_res.scalar_one_or_none()

        if q:
            return {
                "id": str(q.id),
                "prompt": q.prompt,
                "difficulty": q.difficulty,
                "question_type": q.question_type,
                "marks": q.default_marks,
                "options": [
                    {"id": str(opt.id), "text": opt.option_text, "order": opt.order_index}
                    for opt in q.options
                ]
            }
        
        # In case DB is empty, provide synthesized curricular question
        return {
            "id": str(uuid.uuid4()),
            "prompt": f"[{difficulty}] Analyze the asymptotic convergence of the consensus state machine.",
            "difficulty": difficulty,
            "question_type": "MCQ",
            "marks": 5.0,
            "options": [
                {"id": str(uuid.uuid4()), "text": "A) O(log N) synchronous round bounds", "order": 1},
                {"id": str(uuid.uuid4()), "text": "B) Unbounded in asynchronous FLP network", "order": 2},
                {"id": str(uuid.uuid4()), "text": "C) Guaranteed under 2f+1 Byzantine quorum", "order": 3},
                {"id": str(uuid.uuid4()), "text": "D) Quadratic broadcast overhead", "order": 4}
            ]
        }

    async def process_answer(
        self,
        adaptive_exam_id: uuid.UUID,
        question_id: uuid.UUID,
        selected_option_id: Optional[uuid.UUID] = None,
        answer_text: Optional[str] = None
    ) -> Dict[str, Any]:
        stmt = select(AdaptiveExam).where(AdaptiveExam.id == adaptive_exam_id)
        res = await self.db.execute(stmt)
        exam = res.scalar_one_or_none()
        if not exam:
            raise ValueError("Adaptive exam session not found.")

        # Check if answer was correct
        is_correct = False
        if selected_option_id:
            opt_stmt = select(QuestionOption).where(QuestionOption.id == selected_option_id)
            opt_res = await self.db.execute(opt_stmt)
            opt = opt_res.scalar_one_or_none()
            if opt and opt.is_correct:
                is_correct = True
        elif answer_text and len(answer_text.strip()) > 10:
            # Heuristic for text answers
            is_correct = True

        exam.questions_answered += 1
        if is_correct:
            exam.correct_answers += 1
            exam.current_ability = min(100.0, exam.current_ability + 10.0)
        else:
            exam.current_ability = max(0.0, exam.current_ability - 10.0)

        # Update difficulty based on ability
        if exam.current_ability < 40.0:
            next_diff = "EASY"
        elif exam.current_ability <= 70.0:
            next_diff = "MEDIUM"
        else:
            next_diff = "HARD"

        exam.current_difficulty = next_diff
        await self.db.flush()

        is_finished = exam.questions_answered >= 10
        next_question = None if is_finished else await self.fetch_question_for_difficulty(next_diff, subject_id=exam.subject_id)

        if is_finished:
            exam.is_completed = True
            exam.score = (exam.correct_answers / max(1, exam.questions_answered)) * 100.0
            await self.db.flush()

            # Award gamification points
            gamification = GamificationService(self.db)
            await gamification.award_points(exam.student_id, 10, "Adaptive Exam Completion")
            if exam.score >= 80.0:
                await gamification.award_points(exam.student_id, 20, "Adaptive Exam 80%+ Bonus")
            if exam.score == 100.0:
                await gamification.award_points(exam.student_id, 50, "Adaptive Exam 100% Perfect Bonus")

        return {
            "adaptive_exam_id": str(exam.id),
            "was_correct": is_correct,
            "new_ability": round(exam.current_ability, 1),
            "current_difficulty": exam.current_difficulty,
            "questions_answered": exam.questions_answered,
            "correct_answers": exam.correct_answers,
            "is_completed": is_finished,
            "final_score": exam.score if is_finished else None,
            "next_question": next_question
        }

    async def get_progress(self, adaptive_exam_id: uuid.UUID) -> Dict[str, Any]:
        stmt = select(AdaptiveExam).where(AdaptiveExam.id == adaptive_exam_id)
        res = await self.db.execute(stmt)
        exam = res.scalar_one_or_none()
        if not exam:
            raise ValueError("Adaptive exam session not found.")

        return {
            "adaptive_exam_id": str(exam.id),
            "current_difficulty": exam.current_difficulty,
            "current_ability": exam.current_ability,
            "questions_answered": exam.questions_answered,
            "correct_answers": exam.correct_answers,
            "is_completed": exam.is_completed,
            "score": exam.score
        }

    async def submit_and_complete(self, adaptive_exam_id: uuid.UUID) -> Dict[str, Any]:
        stmt = select(AdaptiveExam).where(AdaptiveExam.id == adaptive_exam_id)
        res = await self.db.execute(stmt)
        exam = res.scalar_one_or_none()
        if not exam:
            raise ValueError("Adaptive exam session not found.")

        exam.is_completed = True
        exam.score = (exam.correct_answers / max(1, exam.questions_answered)) * 100.0 if exam.questions_answered > 0 else 0.0
        await self.db.flush()

        # Award points
        gamification = GamificationService(self.db)
        await gamification.award_points(exam.student_id, 10, "Adaptive Exam Submission")

        return {
            "adaptive_exam_id": str(exam.id),
            "is_completed": True,
            "final_score": round(exam.score, 2),
            "final_ability": round(exam.current_ability, 2),
            "questions_answered": exam.questions_answered,
            "correct_answers": exam.correct_answers
        }
