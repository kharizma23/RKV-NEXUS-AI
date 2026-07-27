import uuid
from typing import List, Optional
from datetime import datetime, timezone, UTC
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from app.modules.assessment_attempts.model import StudentExamAttempt, StudentAnswer
from app.modules.assessment_attempts.schema import SaveAnswerRequest
from app.modules.questions.model import Question, QuestionOption
from app.modules.examinations.model import Examination, ExamQuestion

class AssessmentAttemptRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_or_create_attempt(self, exam_id: uuid.UUID, student_id: uuid.UUID, max_score: float = 100.0) -> StudentExamAttempt:
        stmt = select(StudentExamAttempt).options(
            selectinload(StudentExamAttempt.examination).selectinload(Examination.exam_questions).selectinload(ExamQuestion.question).selectinload(Question.options),
            selectinload(StudentExamAttempt.answers).selectinload(StudentAnswer.question).selectinload(Question.options)
        ).where(
            StudentExamAttempt.exam_id == exam_id,
            StudentExamAttempt.student_id == student_id,
            StudentExamAttempt.status == "IN_PROGRESS"
        )
        res = await self.session.execute(stmt)
        attempt = res.scalar_one_or_none()

        if not attempt:
            attempt = StudentExamAttempt(
                exam_id=exam_id,
                student_id=student_id,
                status="IN_PROGRESS",
                max_score=max_score
            )
            self.session.add(attempt)
            await self.session.flush()
            stmt_reload = select(StudentExamAttempt).options(
                selectinload(StudentExamAttempt.examination).selectinload(Examination.exam_questions).selectinload(ExamQuestion.question).selectinload(Question.options),
                selectinload(StudentExamAttempt.answers).selectinload(StudentAnswer.question).selectinload(Question.options)
            ).where(StudentExamAttempt.id == attempt.id)
            res_reload = await self.session.execute(stmt_reload)
            attempt = res_reload.scalar_one()

        return attempt

    async def save_answer(self, attempt_id: uuid.UUID, req: SaveAnswerRequest) -> StudentAnswer:
        stmt = select(StudentAnswer).where(
            StudentAnswer.attempt_id == attempt_id,
            StudentAnswer.question_id == req.question_id
        )
        res = await self.session.execute(stmt)
        answer = res.scalar_one_or_none()

        opt_ids = [str(i) for i in req.selected_option_ids] if req.selected_option_ids else None

        if not answer:
            answer = StudentAnswer(
                attempt_id=attempt_id,
                question_id=req.question_id,
                selected_option_ids=opt_ids,
                text_response=req.text_response,
                numerical_response=req.numerical_response,
                is_flagged_for_review=req.is_flagged_for_review
            )
            self.session.add(answer)
        else:
            answer.selected_option_ids = opt_ids
            answer.text_response = req.text_response
            answer.numerical_response = req.numerical_response
            answer.is_flagged_for_review = req.is_flagged_for_review
            answer.answered_at = datetime.now(UTC)

        await self.session.flush()
        stmt_reload = select(StudentAnswer).options(selectinload(StudentAnswer.question).selectinload(Question.options)).where(StudentAnswer.id == answer.id)
        res_reload = await self.session.execute(stmt_reload)
        return res_reload.scalar_one()

    async def submit_attempt(self, attempt_id: uuid.UUID) -> StudentExamAttempt:
        stmt = select(StudentExamAttempt).options(
            selectinload(StudentExamAttempt.examination).selectinload(Examination.exam_questions).selectinload(ExamQuestion.question).selectinload(Question.options),
            selectinload(StudentExamAttempt.answers).selectinload(StudentAnswer.question).selectinload(Question.options)
        ).where(StudentExamAttempt.id == attempt_id)
        res = await self.session.execute(stmt)
        attempt = res.scalar_one()

        attempt.status = "SUBMITTED"
        attempt.submitted_at = datetime.now(UTC)
        await self.session.flush()
        return attempt

    async def get_attempt_by_id(self, attempt_id: uuid.UUID) -> Optional[StudentExamAttempt]:
        stmt = select(StudentExamAttempt).execution_options(populate_existing=True).options(
            selectinload(StudentExamAttempt.examination).selectinload(Examination.exam_questions).selectinload(ExamQuestion.question).selectinload(Question.options),
            selectinload(StudentExamAttempt.answers).selectinload(StudentAnswer.question).selectinload(Question.options)
        ).where(StudentExamAttempt.id == attempt_id)
        res = await self.session.execute(stmt)
        return res.scalar_one_or_none()
