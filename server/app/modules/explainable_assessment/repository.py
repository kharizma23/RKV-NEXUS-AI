import uuid
from typing import List, Optional
from datetime import datetime, UTC
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from app.modules.explainable_assessment.model import (
    EvaluationEvidence, CounterfactualFeedback, QuestionQualityReport,
    QuestionQualityFinding, GradeReviewRequest, MasteryHistory, AIOperationLog
)

class ExplainableAssessmentRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def create_evidence(
        self,
        question_evaluation_id: uuid.UUID,
        criterion_id: str,
        criterion_title: str,
        max_mark: float,
        suggested_mark: float,
        evidence_type: str,
        evidence_text: str,
        start_offset: Optional[int] = None,
        end_offset: Optional[int] = None,
        matched_key_concepts: Optional[list] = None,
        missing_key_concepts: Optional[list] = None,
        confidence_score: float = 0.9,
        explanation: str = "",
        evaluation_method: str = "DETERMINISTIC_FALLBACK"
    ) -> EvaluationEvidence:
        ev = EvaluationEvidence(
            question_evaluation_id=question_evaluation_id,
            criterion_id=criterion_id,
            criterion_title=criterion_title,
            max_mark=max_mark,
            suggested_mark=suggested_mark,
            evidence_type=evidence_type,
            evidence_text=evidence_text,
            start_offset=start_offset,
            end_offset=end_offset,
            matched_key_concepts=matched_key_concepts,
            missing_key_concepts=missing_key_concepts,
            confidence_score=confidence_score,
            explanation=explanation,
            evaluation_method=evaluation_method
        )
        self.session.add(ev)
        await self.session.flush()
        return ev

    async def list_evidences(self, question_evaluation_id: uuid.UUID) -> list[EvaluationEvidence]:
        stmt = select(EvaluationEvidence).where(EvaluationEvidence.question_evaluation_id == question_evaluation_id)
        res = await self.session.execute(stmt)
        return list(res.scalars().all())

    async def create_counterfactual(
        self,
        question_evaluation_id: uuid.UUID,
        current_score: float,
        target_score: float,
        required_improvements: list,
        generated_feedback: str
    ) -> CounterfactualFeedback:
        cf = CounterfactualFeedback(
            question_evaluation_id=question_evaluation_id,
            current_score=current_score,
            target_score=target_score,
            required_improvements=required_improvements,
            generated_feedback=generated_feedback
        )
        self.session.add(cf)
        await self.session.flush()
        return cf

    async def get_counterfactual(self, question_evaluation_id: uuid.UUID) -> Optional[CounterfactualFeedback]:
        stmt = select(CounterfactualFeedback).where(CounterfactualFeedback.question_evaluation_id == question_evaluation_id)
        res = await self.session.execute(stmt)
        return res.scalars().first()

    async def create_quality_report(
        self,
        exam_id: uuid.UUID,
        overall_score: float,
        component_scores: dict,
        status: str,
        has_blocking_issues: bool
    ) -> QuestionQualityReport:
        report = QuestionQualityReport(
            exam_id=exam_id,
            overall_score=overall_score,
            component_scores=component_scores,
            status=status,
            has_blocking_issues=has_blocking_issues
        )
        self.session.add(report)
        await self.session.flush()
        return report

    async def add_quality_finding(
        self,
        report_id: uuid.UUID,
        severity: str,
        category: str,
        message: str,
        rule_code: str,
        question_id: Optional[uuid.UUID] = None,
        suggested_correction: Optional[str] = None
    ) -> QuestionQualityFinding:
        finding = QuestionQualityFinding(
            report_id=report_id,
            question_id=question_id,
            severity=severity,
            category=category,
            message=message,
            suggested_correction=suggested_correction,
            rule_code=rule_code
        )
        self.session.add(finding)
        await self.session.flush()
        return finding

    async def get_quality_report(self, exam_id: uuid.UUID) -> Optional[QuestionQualityReport]:
        stmt = select(QuestionQualityReport).options(selectinload(QuestionQualityReport.findings)).where(QuestionQualityReport.exam_id == exam_id).order_by(QuestionQualityReport.created_at.desc())
        res = await self.session.execute(stmt)
        return res.scalars().first()

    async def create_grade_review(self, req_data: dict, student_id: uuid.UUID) -> GradeReviewRequest:
        gr = GradeReviewRequest(
            attempt_id=req_data["attempt_id"],
            student_id=student_id,
            question_id=req_data["question_id"],
            review_category=req_data["review_category"],
            explanation=req_data["explanation"],
            requested_action=req_data.get("requested_action"),
            status="SUBMITTED"
        )
        self.session.add(gr)
        await self.session.flush()
        return gr

    async def list_grade_reviews(self, student_id: Optional[uuid.UUID] = None) -> list[GradeReviewRequest]:
        stmt = select(GradeReviewRequest)
        if student_id:
            stmt = stmt.where(GradeReviewRequest.student_id == student_id)
        res = await self.session.execute(stmt)
        return list(res.scalars().all())

    async def append_mastery_history(self, student_id: uuid.UUID, topic_id: uuid.UUID, prev_m: float, new_m: float, source: str) -> MasteryHistory:
        mh = MasteryHistory(
            student_id=student_id,
            topic_id=topic_id,
            previous_mastery=prev_m,
            new_mastery=new_m,
            evidence_source=source,
            timestamp=datetime.now(UTC)
        )
        self.session.add(mh)
        await self.session.flush()
        return mh

    async def log_ai_operation(self, op_type: str, provider: str = "DETERMINISTIC_LOCAL", conf: float = 0.9, ms: int = 100, user_id: Optional[uuid.UUID] = None) -> AIOperationLog:
        log = AIOperationLog(
            operation_type=op_type,
            provider_name=provider,
            confidence_score=conf,
            duration_ms=ms,
            user_id=user_id
        )
        self.session.add(log)
        await self.session.flush()
        return log
