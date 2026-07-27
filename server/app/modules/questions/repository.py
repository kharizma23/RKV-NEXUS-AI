import uuid
from typing import List, Optional
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from app.modules.questions.model import Question, QuestionOption
from app.modules.questions.schema import QuestionCreate

class QuestionRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def create_question(self, req: QuestionCreate, faculty_id: Optional[uuid.UUID] = None) -> Question:
        q = Question(
            subject_id=req.subject_id,
            unit_id=req.unit_id,
            topic_id=req.topic_id,
            co_id=req.co_id,
            question_type=req.question_type.upper(),
            prompt=req.prompt,
            explanation=req.explanation,
            difficulty=req.difficulty.upper(),
            bloom_level=req.bloom_level.upper(),
            default_marks=req.default_marks,
            negative_marks=req.negative_marks,
            rubric=req.rubric,
            created_by_faculty_id=faculty_id
        )
        self.session.add(q)
        await self.session.flush()

        for idx, opt in enumerate(req.options):
            q_opt = QuestionOption(
                question_id=q.id,
                option_text=opt.option_text,
                is_correct=opt.is_correct,
                order_index=opt.order_index if opt.order_index else idx
            )
            self.session.add(q_opt)

        await self.session.flush()
        stmt = select(Question).options(selectinload(Question.options)).where(Question.id == q.id)
        res = await self.session.execute(stmt)
        return res.scalar_one()

    async def get_by_id(self, question_id: uuid.UUID) -> Optional[Question]:
        stmt = select(Question).options(selectinload(Question.options)).where(Question.id == question_id)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def list_by_subject(self, subject_id: uuid.UUID, difficulty: Optional[str] = None) -> list[Question]:
        stmt = select(Question).options(selectinload(Question.options)).where(Question.subject_id == subject_id)
        if difficulty:
            stmt = stmt.where(Question.difficulty == difficulty.upper())
        result = await self.session.execute(stmt)
        return list(result.scalars().all())
