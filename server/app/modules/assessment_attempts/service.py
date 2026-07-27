import uuid
from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from app.modules.assessment_attempts.model import StudentExamAttempt, StudentAnswer
from app.modules.assessment_attempts.repository import AssessmentAttemptRepository
from app.modules.examinations.repository import ExaminationRepository
from app.modules.assessment_attempts.schema import (
    SaveAnswerRequest, SubmitExamAttemptRequest, StudentAnswerSubmit
)

from sqlalchemy import select
from app.modules.users.model import StudentProfile

class AssessmentAttemptService:
    def __init__(self, session: AsyncSession):
        self.session = session
        self.attempt_repo = AssessmentAttemptRepository(session)
        self.exam_repo = ExaminationRepository(session)

    async def start_attempt(self, student_id: uuid.UUID, exam_id: uuid.UUID) -> StudentExamAttempt:
        exam = await self.exam_repo.get_examination_by_id(exam_id)
        if not exam:
            raise ValueError("Examination not found")

        # Resolve User.id to StudentProfile.id if necessary
        stmt = select(StudentProfile.id).where(StudentProfile.user_id == student_id)
        sp_res = await self.session.execute(stmt)
        sp_id = sp_res.scalar_one_or_none()
        target_student_id = sp_id if sp_id else student_id

        max_score = exam.total_marks if getattr(exam, 'total_marks', None) else 100.0
        attempt = await self.attempt_repo.get_or_create_attempt(exam.id, target_student_id, max_score=max_score)
        await self.session.flush()
        return attempt


    async def save_answer(self, attempt_id: uuid.UUID, req: SaveAnswerRequest) -> StudentAnswer:
        ans = await self.attempt_repo.save_answer(attempt_id, req)
        await self.session.flush()
        return ans

    async def submit_attempt(
        self, attempt_id: uuid.UUID, req: Optional[SubmitExamAttemptRequest] = None
    ) -> StudentExamAttempt:
        if req and req.answers:
            for ans_in in req.answers:
                save_req = SaveAnswerRequest(
                    question_id=ans_in.question_id,
                    selected_option_ids=ans_in.selected_option_ids,
                    text_response=ans_in.text_response,
                    numerical_response=ans_in.numerical_response,
                    is_flagged_for_review=ans_in.is_flagged_for_review
                )
                await self.attempt_repo.save_answer(attempt_id, save_req)

        submitted_attempt = await self.attempt_repo.submit_attempt(attempt_id)
        await self.session.flush()
        return submitted_attempt

    async def get_attempt_by_id(self, attempt_id: uuid.UUID) -> Optional[StudentExamAttempt]:
        return await self.attempt_repo.get_attempt_by_id(attempt_id)
