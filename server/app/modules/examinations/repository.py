import uuid
from typing import List, Optional
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from app.modules.examinations.model import AssessmentBlueprint, Examination, ExamQuestion
from app.modules.examinations.schema import AssessmentBlueprintCreate, ExaminationCreate
from app.modules.questions.model import Question

class ExaminationRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def create_blueprint(self, req: AssessmentBlueprintCreate) -> AssessmentBlueprint:
        bp = AssessmentBlueprint(
            subject_id=req.subject_id,
            title=req.title,
            total_marks=req.total_marks,
            duration_minutes=req.duration_minutes,
            easy_pct=req.easy_pct,
            medium_pct=req.medium_pct,
            hard_pct=req.hard_pct,
            unit_distributions=req.unit_distributions,
            bloom_distributions=req.bloom_distributions
        )
        self.session.add(bp)
        await self.session.flush()
        return bp

    async def list_blueprints(self, subject_id: uuid.UUID) -> list[AssessmentBlueprint]:
        stmt = select(AssessmentBlueprint).where(AssessmentBlueprint.subject_id == subject_id)
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def create_examination(self, req: ExaminationCreate, faculty_id: Optional[uuid.UUID] = None) -> Examination:
        exam = Examination(
            subject_id=req.subject_id,
            blueprint_id=req.blueprint_id,
            title=req.title,
            exam_type=req.exam_type.upper(),
            total_marks=req.total_marks,
            duration_minutes=req.duration_minutes,
            start_time=req.start_time,
            end_time=req.end_time,
            is_published=req.is_published,
            shuffle_questions=req.shuffle_questions,
            shuffle_options=req.shuffle_options,
            has_negative_marking=req.has_negative_marking,
            created_by_faculty_id=faculty_id,
            target_batch=req.target_batch,
            target_semester=req.target_semester,
            target_department_id=req.target_department_id
        )
        self.session.add(exam)
        await self.session.flush()
        return exam

    async def add_question_to_exam(self, exam_id: uuid.UUID, question_id: uuid.UUID, marks: float = 2.0, order_index: int = 0) -> ExamQuestion:
        eq = ExamQuestion(exam_id=exam_id, question_id=question_id, marks=marks, order_index=order_index)
        self.session.add(eq)
        await self.session.flush()
        return eq

    async def get_examination_by_id(self, exam_id: uuid.UUID) -> Optional[Examination]:
        stmt = select(Examination).options(
            selectinload(Examination.exam_questions).selectinload(ExamQuestion.question).selectinload(Question.options)
        ).where(Examination.id == exam_id)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def publish_examination(self, exam_id: uuid.UUID) -> Optional[Examination]:
        exam = await self.get_examination_by_id(exam_id)
        if exam:
            exam.is_published = True
            await self.session.flush()
        return exam

    async def list_published_examinations(self, subject_id: Optional[uuid.UUID] = None) -> list[Examination]:
        stmt = select(Examination).options(
            selectinload(Examination.exam_questions).selectinload(ExamQuestion.question).selectinload(Question.options)
        ).where(Examination.is_published == True)
        if subject_id:
            stmt = stmt.where(Examination.subject_id == subject_id)
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

