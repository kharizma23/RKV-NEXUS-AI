import uuid
from typing import List, Dict, Any, Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.ai.providers.deterministic import DeterministicAIProvider
from app.modules.explainable_assessment.repository import ExplainableAssessmentRepository
from app.modules.explainable_assessment.model import QuestionQualityReport, GradeReviewRequest, MasteryHistory
from app.modules.examinations.repository import ExaminationRepository

class ExplainableAssessmentService:
    def __init__(self, session: AsyncSession):
        self.session = session
        self.repo = ExplainableAssessmentRepository(session)
        self.exam_repo = ExaminationRepository(session)
        self.ai_provider = DeterministicAIProvider()

    async def generate_explanation_and_counterfactual(self, question_eval_id: uuid.UUID, prompt: str, rubric: str, response_text: str, max_marks: float, current_score: float) -> dict[str, Any]:
        evidences = await self.ai_provider.extract_rubric_evidence(prompt, rubric, response_text, max_marks)
        saved_evidences = []
        for ev in evidences:
            item = await self.repo.create_evidence(
                question_evaluation_id=question_eval_id,
                criterion_id=ev.criterion_id,
                criterion_title=ev.criterion_title,
                max_mark=ev.max_mark,
                suggested_mark=ev.suggested_mark,
                evidence_type=ev.evidence_type,
                evidence_text=ev.evidence_text,
                start_offset=ev.start_offset,
                end_offset=ev.end_offset,
                matched_key_concepts=ev.matched_key_concepts,
                missing_key_concepts=ev.missing_key_concepts,
                confidence_score=ev.confidence_score,
                explanation=ev.explanation
            )
            saved_evidences.append(item)

        cf = await self.ai_provider.generate_counterfactual(current_score, max_marks, ["Explicit edge-case boundary condition analysis"])
        saved_cf = await self.repo.create_counterfactual(
            question_evaluation_id=question_eval_id,
            current_score=cf.current_score,
            target_score=cf.target_score,
            required_improvements=cf.required_improvements,
            generated_feedback=cf.generated_feedback
        )

        await self.repo.log_ai_operation("EXPLAINABLE_EVALUATION")
        await self.session.commit()
        return {"evidences": saved_evidences, "counterfactual": saved_cf}

    async def validate_paper_quality(self, exam_id: uuid.UUID) -> QuestionQualityReport:
        exam = await self.exam_repo.get_examination_by_id(exam_id)
        if not exam:
            raise ValueError("Examination not found")

        findings = await self.ai_provider.validate_paper_quality(exam.title, exam.exam_questions or [])
        has_blocking = any(f.severity == "BLOCKING" for f in findings)
        status_str = "BLOCKED" if has_blocking else ("WARNINGS" if any(f.severity == "WARNING" for f in findings) else "PASSED")
        overall = 70.0 if has_blocking else 92.0

        comp_scores = {
            "syllabus_coverage": 80.0 if not has_blocking else 50.0,
            "outcome_alignment": 90.0,
            "difficulty_balance": 85.0,
            "bloom_balance": 88.0
        }

        report = await self.repo.create_quality_report(
            exam_id=exam_id,
            overall_score=overall,
            component_scores=comp_scores,
            status=status_str,
            has_blocking_issues=has_blocking
        )

        for f in findings:
            await self.repo.add_quality_finding(
                report_id=report.id,
                severity=f.severity,
                category=f.category,
                message=f.message,
                suggested_correction=f.suggested_correction,
                rule_code=f.rule_code
            )

        await self.repo.log_ai_operation("QUESTION_QUALITY_GATE")
        await self.session.commit()
        
        res = await self.repo.get_quality_report(exam_id)
        assert res is not None
        return res

    async def submit_grade_review(self, req_data: dict, student_id: uuid.UUID) -> GradeReviewRequest:
        gr = await self.repo.create_grade_review(req_data, student_id)
        await self.session.commit()
        return gr

    async def decide_grade_review(self, review_id: uuid.UUID, decision_status: str, reason: str) -> GradeReviewRequest:
        stmt = select(GradeReviewRequest).where(GradeReviewRequest.id == review_id)
        res = await self.session.execute(stmt)
        gr = res.scalar_one()
        gr.status = decision_status
        gr.faculty_decision_reason = reason
        await self.session.commit()
        return gr
