import uuid
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from app.modules.examinations.repository import ExaminationRepository
from app.modules.questions.repository import QuestionRepository
from app.modules.examinations.model import Examination

class ExaminationService:
    def __init__(self, session: AsyncSession):
        self.session = session
        self.exam_repo = ExaminationRepository(session)
        self.question_repo = QuestionRepository(session)

    async def generate_paper_from_blueprint(
        self,
        exam_id: uuid.UUID,
        subject_id: uuid.UUID
    ) -> Examination:
        exam = await self.exam_repo.get_examination_by_id(exam_id)
        if not exam:
            raise ValueError("Examination not found")

        available_questions = await self.question_repo.list_by_subject(subject_id)
        if not available_questions:
            return exam

        current_marks = 0.0
        for idx, q in enumerate(available_questions):
            if current_marks >= exam.total_marks:
                break
            await self.exam_repo.add_question_to_exam(
                exam_id=exam.id,
                question_id=q.id,
                marks=q.default_marks,
                order_index=idx
            )
            current_marks += q.default_marks

        await self.session.commit()
        ret = await self.exam_repo.get_examination_by_id(exam_id)
        assert ret is not None
        return ret
