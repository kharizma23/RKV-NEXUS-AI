import uuid
from typing import List, Optional
from datetime import datetime, timezone, UTC
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from app.modules.personalized_learning.model import MisconceptionCatalog, StudentKnowledgeState, RemedialLearningPlan
from app.modules.syllabus.model import Topic

class PersonalizedLearningRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def update_knowledge_state(self, student_id: uuid.UUID, topic_id: uuid.UUID, mastery_level: float) -> StudentKnowledgeState:
        stmt = select(StudentKnowledgeState).where(
            StudentKnowledgeState.student_id == student_id,
            StudentKnowledgeState.topic_id == topic_id
        )
        res = await self.session.execute(stmt)
        state = res.scalar_one_or_none()

        status_str = "MASTERED" if mastery_level >= 0.75 else ("WEAK" if mastery_level < 0.5 else "DEVELOPING")

        if not state:
            state = StudentKnowledgeState(
                student_id=student_id,
                topic_id=topic_id,
                mastery_level=mastery_level,
                status=status_str
            )
            self.session.add(state)
        else:
            state.mastery_level = mastery_level
            state.status = status_str
            state.last_updated_at = datetime.now(UTC)

        await self.session.flush()
        stmt_reload = select(StudentKnowledgeState).options(selectinload(StudentKnowledgeState.topic)).where(StudentKnowledgeState.id == state.id)
        res_reload = await self.session.execute(stmt_reload)
        return res_reload.scalar_one()

    async def list_student_knowledge_states(self, student_id: uuid.UUID) -> list[StudentKnowledgeState]:
        stmt = select(StudentKnowledgeState).options(selectinload(StudentKnowledgeState.topic)).where(StudentKnowledgeState.student_id == student_id)
        res = await self.session.execute(stmt)
        return list(res.scalars().all())

    async def create_remedial_plan(
        self,
        student_id: uuid.UUID,
        subject_id: uuid.UUID,
        title: str,
        weak_topics: list,
        recommended_resources: list
    ) -> RemedialLearningPlan:
        plan = RemedialLearningPlan(
            student_id=student_id,
            subject_id=subject_id,
            title=title,
            weak_topics=weak_topics,
            recommended_resources=recommended_resources,
            is_completed=False
        )
        self.session.add(plan)
        await self.session.flush()
        return plan

    async def get_latest_remedial_plan(self, student_id: uuid.UUID, subject_id: Optional[uuid.UUID] = None) -> Optional[RemedialLearningPlan]:
        stmt = select(RemedialLearningPlan).where(RemedialLearningPlan.student_id == student_id).order_by(RemedialLearningPlan.generated_at.desc())
        if subject_id:
            stmt = stmt.where(RemedialLearningPlan.subject_id == subject_id)
        res = await self.session.execute(stmt)
        return res.scalars().first()
