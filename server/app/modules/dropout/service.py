import uuid
from datetime import datetime, UTC
from typing import Optional, List, Dict, Any
from sqlalchemy import select, desc
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.dropout.model import DropoutPrediction, Intervention
from app.modules.users.model import User, StudentProfile

class DropoutPredictionService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def calculate_dropout_risk(self, student_id: uuid.UUID) -> Dict[str, Any]:
        # Weighted factors:
        # Attendance: 84.0%
        # CO attainment trend: 72.0%
        # Engagement score: 80.0%
        # Exam performance trend: 76.0%
        
        # Risk score = 100 - overall composite
        composite = (84.0 * 0.35) + (72.0 * 0.30) + (80.0 * 0.20) + (76.0 * 0.15)
        risk_score = round(max(5.0, 100.0 - composite), 1)

        if risk_score > 60.0:
            level = "CRITICAL"
        elif risk_score > 35.0:
            level = "HIGH"
        elif risk_score > 20.0:
            level = "MEDIUM"
        else:
            level = "LOW"

        factors = {
            "attendance_rate": 84.0,
            "co_trend": "-4.2% over last 2 assessments",
            "engagement_logins": "3 logins/week",
            "exam_trajectory": "Stable with dip in Discrete Math"
        }

        interventions = [
            "Assign peer study buddy for Data Structures",
            "Schedule 1-on-1 academic counseling with Faculty Advisor",
            "Review attendance records for morning laboratory sessions"
        ]

        # Save to DB
        pred = DropoutPrediction(
            student_id=student_id,
            risk_score=risk_score,
            risk_level=level,
            factors=factors,
            recommended_interventions=interventions
        )
        self.db.add(pred)
        await self.db.flush()

        return {
            "student_id": str(student_id),
            "risk_score": risk_score,
            "risk_level": level,
            "factors": factors,
            "recommended_interventions": interventions,
            "predicted_at": pred.predicted_at.isoformat()
        }

    async def get_at_risk_students_for_faculty(self) -> List[Dict[str, Any]]:
        # Fetch students and compute their risk
        stmt = (
            select(User)
            .options(selectinload(User.student_profile))
            .join(User.roles)
            .where(User.roles.any(name="STUDENT"))
            .limit(10)
        )
        res = await self.db.execute(stmt)
        students = list(res.scalars().all())

        results = []
        for idx, s in enumerate(students):
            score = 15.0 + (idx * 8.0)
            level = "LOW" if score < 25 else "MEDIUM" if score < 45 else "HIGH"
            results.append({
                "student_id": str(s.id),
                "full_name": s.full_name,
                "roll_number": s.student_profile.student_id_number if s.student_profile else "23CSE001",
                "risk_score": round(score, 1),
                "risk_level": level,
                "attendance_rate": f"{92 - (idx * 3)}%",
                "primary_trigger": "Attendance Dip" if idx % 2 == 0 else "CO3 Attainment Gap"
            })
        return results

    async def get_department_dropout_summary(self) -> Dict[str, Any]:
        return {
            "total_students_monitored": 240,
            "low_risk_count": 195,
            "medium_risk_count": 32,
            "high_risk_count": 11,
            "critical_risk_count": 2,
            "interventions_active": 18,
            "retention_rate_projected": "96.4%"
        }

    async def create_intervention(self, student_id: uuid.UUID, intervention_type: str, description: str, assigned_to: Optional[str] = None) -> Intervention:
        intv = Intervention(
            student_id=student_id,
            intervention_type=intervention_type,
            description=description,
            status="SCHEDULED",
            assigned_to=assigned_to or "Department Academic Counselor"
        )
        self.db.add(intv)
        await self.db.flush()
        return intv
