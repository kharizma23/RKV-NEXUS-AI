import uuid
from datetime import datetime, UTC
from typing import Optional, Dict, Any, List
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status

from app.modules.vr.model import VRExam, VRAttempt
from app.modules.academics.model import Subject

class VRExamService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_or_seed_vr_exams(self) -> List[VRExam]:
        stmt = select(VRExam).order_by(VRExam.created_at.desc())
        res = await self.db.execute(stmt)
        exams = list(res.scalars().all())

        if not exams:
            # Find any subject if available
            sub_res = await self.db.execute(select(Subject).limit(1))
            sub = sub_res.scalar_one_or_none()
            sub_id = sub.id if sub else None

            sample_scenes = [
                VRExam(
                    subject_id=sub_id,
                    title="Quantum Optics & Michelson Interferometer Virtual Lab",
                    description="Align helium-neon laser beams through beam splitters and mirrors to observe fringe interference patterns in 3D.",
                    vr_scene_url="https://rkv-nexus.edu/vr/scenes/optics-michelson-v2",
                    duration_minutes=45,
                    experiment_type="PHYSICS_OPTICS"
                ),
                VRExam(
                    subject_id=sub_id,
                    title="Automated Chemistry Titration & Equivalence Point Lab",
                    description="Measure burette dispensing of 0.1M HCl into NaOH with real-time pH sensor probe and phenolphthalein colorimetry.",
                    vr_scene_url="https://rkv-nexus.edu/vr/scenes/chem-titration-v1",
                    duration_minutes=30,
                    experiment_type="CHEMISTRY_TITRATION"
                ),
                VRExam(
                    subject_id=sub_id,
                    title="6-DOF Industrial Robotic Arm Trajectory Programming",
                    description="Calibrate joint angles and inverse kinematics for pick-and-place precision assembly with obstacle avoidance.",
                    vr_scene_url="https://rkv-nexus.edu/vr/scenes/robotics-arm-v3",
                    duration_minutes=60,
                    experiment_type="ROBOTICS_ARM"
                )
            ]
            for s in sample_scenes:
                self.db.add(s)
            await self.db.commit()
            return await self.get_or_seed_vr_exams()

        return exams

    async def get_exam_by_id(self, exam_id: uuid.UUID) -> VRExam:
        exam = await self.db.get(VRExam, exam_id)
        if not exam:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="VR Exam scene not found")
        return exam

    async def create_exam(
        self,
        title: str,
        vr_scene_url: str,
        duration_minutes: int = 45,
        description: Optional[str] = None,
        experiment_type: str = "PHYSICS_OPTICS",
        subject_id: Optional[uuid.UUID] = None,
        created_by: Optional[uuid.UUID] = None
    ) -> VRExam:
        exam = VRExam(
            subject_id=subject_id,
            title=title,
            description=description,
            vr_scene_url=vr_scene_url,
            duration_minutes=duration_minutes,
            experiment_type=experiment_type,
            created_by=created_by
        )
        self.db.add(exam)
        await self.db.commit()
        await self.db.refresh(exam)
        return exam

    async def start_attempt(self, vr_exam_id: uuid.UUID, student_id: uuid.UUID) -> VRAttempt:
        exam = await self.get_exam_by_id(vr_exam_id)
        attempt = VRAttempt(
            vr_exam_id=exam.id,
            student_id=student_id,
            started_at=datetime.now(UTC),
            score=0.0,
            interaction_log={"events": [], "milestones": []}
        )
        self.db.add(attempt)
        await self.db.commit()
        await self.db.refresh(attempt)
        return attempt

    async def submit_attempt(
        self,
        attempt_id: uuid.UUID,
        interaction_log: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        attempt = await self.db.get(VRAttempt, attempt_id)
        if not attempt:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="VR Attempt not found")

        log = interaction_log or {"events": [], "milestones_completed": 4}
        attempt.completed_at = datetime.now(UTC)
        attempt.interaction_log = log

        # Auto-evaluate score
        # Base criteria: completed milestones (up to 70), safety protocol score (up to 15), execution precision (up to 15)
        milestones = log.get("milestones_completed", 4)
        safety_score = log.get("safety_compliance", 14.5)
        precision_score = log.get("precision_accuracy", 14.0)

        raw_score = (min(milestones, 5) * 14.0) + float(safety_score) + float(precision_score)
        final_score = min(max(round(raw_score, 1), 0.0), 100.0)
        attempt.score = final_score

        await self.db.commit()
        await self.db.refresh(attempt)

        return {
            "attempt_id": str(attempt.id),
            "vr_exam_id": str(attempt.vr_exam_id),
            "score": attempt.score,
            "passed": attempt.score >= 50.0,
            "completed_at": attempt.completed_at.isoformat(),
            "evaluation_breakdown": {
                "procedural_accuracy": round(milestones * 14.0, 1),
                "lab_safety_compliance": safety_score,
                "instrument_calibration_precision": precision_score
            }
        }

    async def get_results(self, student_id: uuid.UUID, vr_exam_id: Optional[uuid.UUID] = None) -> List[Dict[str, Any]]:
        stmt = (
            select(VRAttempt)
            .where(VRAttempt.student_id == student_id)
            .order_by(VRAttempt.started_at.desc())
        )
        if vr_exam_id:
            stmt = stmt.where(VRAttempt.vr_exam_id == vr_exam_id)
        res = await self.db.execute(stmt)
        attempts = list(res.scalars().all())

        return [
            {
                "id": str(a.id),
                "vr_exam_id": str(a.vr_exam_id),
                "exam_title": a.vr_exam.title if a.vr_exam else "VR Practical Exam",
                "experiment_type": a.vr_exam.experiment_type if a.vr_exam else "VIRTUAL_LAB",
                "score": a.score,
                "started_at": a.started_at.isoformat() if a.started_at else None,
                "completed_at": a.completed_at.isoformat() if a.completed_at else None,
                "interaction_log": a.interaction_log
            }
            for a in attempts
        ]
