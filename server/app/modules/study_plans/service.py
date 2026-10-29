import uuid
from datetime import datetime, UTC
from typing import Optional, List, Dict, Any
from sqlalchemy import select, update, desc, func
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.study_plans.model import StudyPlan, StudyPlanItem, StudyPlanProgress
from app.modules.examinations.model import Examination
from app.modules.evaluation.model import EvaluationResult
from app.modules.assessment_attempts.model import StudentExamAttempt
from app.ai.ai_service import AIService

DEFAULT_PLAN_SCHEDULE = [
    {"day": 1, "topic": "Binary Search Trees & Re-balancing Algorithms", "resource_type": "PRACTICE_QUIZ", "minutes": 45, "url": "https://learning.platform.edu/modules/bst-invariants"},
    {"day": 2, "topic": "Relational Normalization & 3NF/BCNF Decomposition", "resource_type": "READING", "minutes": 40, "url": "https://learning.platform.edu/modules/db-normal-forms"},
    {"day": 3, "topic": "Raft Consensus Log Matching & Election Safety", "resource_type": "VIDEO", "minutes": 50, "url": "https://learning.platform.edu/modules/raft-consensus"},
    {"day": 4, "topic": "Dynamic Programming: Knapsack & Matrix Chain", "resource_type": "CODING", "minutes": 60, "url": "https://learning.platform.edu/modules/dp-mastery"},
    {"day": 5, "topic": "Course Outcome Remedial Assessment & Mock Exam", "resource_type": "PRACTICE_QUIZ", "minutes": 45, "url": "https://learning.platform.edu/modules/co-remedial"}
]

class StudyPlanService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.ai = AIService()

    async def get_or_create_study_plan(self, student_id: uuid.UUID, semester: int = 1) -> StudyPlan:
        stmt = (
            select(StudyPlan)
            .options(selectinload(StudyPlan.items))
            .where(StudyPlan.student_id == student_id, StudyPlan.status == "ACTIVE")
            .order_by(StudyPlan.generated_at.desc())
        )
        res = await self.db.execute(stmt)
        plan = res.scalar_one_or_none()

        if not plan:
            plan = await self.generate_study_plan(student_id, semester)
        return plan

    async def generate_study_plan(self, student_id: uuid.UUID, semester: int = 1) -> StudyPlan:
        # Check if previous active plan exists, archive it
        existing_stmt = select(StudyPlan).where(StudyPlan.student_id == student_id, StudyPlan.status == "ACTIVE")
        res = await self.db.execute(existing_stmt)
        for old in res.scalars().all():
            old.status = "ARCHIVED"

        plan = StudyPlan(
            student_id=student_id,
            semester=semester,
            status="ACTIVE",
            generated_at=datetime.now(UTC)
        )
        self.db.add(plan)
        await self.db.flush()

        for item_data in DEFAULT_PLAN_SCHEDULE:
            item = StudyPlanItem(
                plan_id=plan.id,
                day_number=item_data["day"],
                topic=item_data["topic"],
                resource_type=item_data["resource_type"],
                resource_url=item_data["url"],
                estimated_minutes=item_data["minutes"],
                status="PENDING"
            )
            self.db.add(item)
        await self.db.flush()

        # Re-fetch with items loaded
        return await self.get_or_create_study_plan(student_id, semester)

    async def complete_item(self, item_id: uuid.UUID, student_id: uuid.UUID, time_spent: int = 35) -> Dict[str, Any]:
        stmt = select(StudyPlanItem).options(selectinload(StudyPlanItem.plan)).where(StudyPlanItem.id == item_id)
        res = await self.db.execute(stmt)
        item = res.scalar_one_or_none()
        if not item:
            raise ValueError("Study plan item not found.")

        item.status = "COMPLETED"

        progress = StudyPlanProgress(
            plan_id=item.plan_id,
            item_id=item.id,
            completed_at=datetime.now(UTC),
            time_spent_minutes=time_spent
        )
        self.db.add(progress)
        await self.db.flush()

        return {
            "item_id": str(item.id),
            "status": "COMPLETED",
            "time_spent": time_spent
        }

    async def get_progress(self, student_id: uuid.UUID) -> Dict[str, Any]:
        plan = await self.get_or_create_study_plan(student_id)
        total_items = len(plan.items)
        completed_items = sum(1 for it in plan.items if it.status == "COMPLETED")
        percent = (completed_items / total_items * 100.0) if total_items > 0 else 0.0

        return {
            "plan_id": str(plan.id),
            "total_items": total_items,
            "completed_items": completed_items,
            "completion_percentage": round(percent, 1),
            "status": plan.status,
            "generated_at": plan.generated_at.isoformat()
        }
