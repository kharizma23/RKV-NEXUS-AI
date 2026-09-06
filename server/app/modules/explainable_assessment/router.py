import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.dependencies import get_db, require_roles
from app.modules.explainable_assessment.repository import ExplainableAssessmentRepository
from app.modules.explainable_assessment.service import ExplainableAssessmentService
from app.modules.explainable_assessment.schema import (
    EvaluationEvidenceResponse, CounterfactualFeedbackResponse,
    QuestionQualityReportResponse, GradeReviewRequestCreate,
    GradeReviewRequestResponse, GradeReviewDecision, MasteryHistoryResponse
)
from app.modules.users.model import User

router = APIRouter(tags=["Explainable Assessment & Question Quality Gate"])

@router.get("/evaluation/{evaluation_id}/evidence", response_model=list[EvaluationEvidenceResponse])
async def get_evaluation_evidences(
    evaluation_id: uuid.UUID,
    db: AsyncSession = Depends(get_db)
):
    repo = ExplainableAssessmentRepository(db)
    evs = await repo.list_evidences(evaluation_id)
    if not evs:
        # Generate sample evidence if not present
        service = ExplainableAssessmentService(db)
        res = await service.generate_explanation_and_counterfactual(
            question_eval_id=evaluation_id,
            prompt="Explain in-order traversal and BST recurrence T(N)",
            rubric="2 marks definition, 2 marks recurrence relation",
            response_text="In-order traversal visits left subtree, root, then right. Recurrence T(N) = 2T(N/2) + O(1).",
            max_marks=5.0,
            current_score=4.0
        )
        evs = res["evidences"]
    return evs

@router.get("/evaluation/{evaluation_id}/counterfactual", response_model=Optional[CounterfactualFeedbackResponse])
async def get_counterfactual(
    evaluation_id: uuid.UUID,
    db: AsyncSession = Depends(get_db)
):
    repo = ExplainableAssessmentRepository(db)
    cf = await repo.get_counterfactual(evaluation_id)
    if not cf:
        service = ExplainableAssessmentService(db)
        res = await service.generate_explanation_and_counterfactual(
            question_eval_id=evaluation_id,
            prompt="Explain in-order traversal and BST recurrence T(N)",
            rubric="2 marks definition, 2 marks recurrence relation",
            response_text="In-order traversal visits left subtree, root, then right. Recurrence T(N) = 2T(N/2) + O(1).",
            max_marks=5.0,
            current_score=4.0
        )
        cf = res["counterfactual"]
    return cf

@router.post("/examinations/{exam_id}/validate-quality", response_model=QuestionQualityReportResponse, status_code=status.HTTP_201_CREATED)
async def validate_paper_quality(
    exam_id: uuid.UUID,
    current_user: User = Depends(require_roles(["FACULTY", "ADMIN"])),
    db: AsyncSession = Depends(get_db)
):
    service = ExplainableAssessmentService(db)
    return await service.validate_paper_quality(exam_id)

@router.get("/examinations/{exam_id}/quality-report", response_model=Optional[QuestionQualityReportResponse])
async def get_quality_report(
    exam_id: uuid.UUID,
    db: AsyncSession = Depends(get_db)
):
    repo = ExplainableAssessmentRepository(db)
    report = await repo.get_quality_report(exam_id)
    if not report:
        service = ExplainableAssessmentService(db)
        report = await service.validate_paper_quality(exam_id)
    return report

@router.post("/grade-reviews", response_model=GradeReviewRequestResponse, status_code=status.HTTP_201_CREATED)
async def submit_grade_review(
    payload: GradeReviewRequestCreate,
    current_user: User = Depends(require_roles(["STUDENT"])),
    db: AsyncSession = Depends(get_db)
):
    service = ExplainableAssessmentService(db)
    student_id = current_user.student_profile.id if current_user.student_profile else current_user.id
    return await service.submit_grade_review(payload.model_dump(), student_id)

@router.get("/grade-reviews/queue", response_model=list[GradeReviewRequestResponse])
async def list_grade_reviews(
    current_user: User = Depends(require_roles(["FACULTY", "ADMIN"])),
    db: AsyncSession = Depends(get_db)
):
    repo = ExplainableAssessmentRepository(db)
    return await repo.list_grade_reviews()

@router.patch("/grade-reviews/{review_id}/decide", response_model=GradeReviewRequestResponse)
async def decide_grade_review(
    review_id: uuid.UUID,
    payload: GradeReviewDecision,
    current_user: User = Depends(require_roles(["FACULTY", "ADMIN"])),
    db: AsyncSession = Depends(get_db)
):
    service = ExplainableAssessmentService(db)
    return await service.decide_grade_review(review_id, payload.status, payload.faculty_decision_reason)

@router.get("/mastery/history/my", response_model=list[MasteryHistoryResponse])
async def my_mastery_history(
    current_user: User = Depends(require_roles(["STUDENT"])),
    db: AsyncSession = Depends(get_db)
):
    # Sample mastery history timeline
    return [
        {
            "id": uuid.uuid4(),
            "student_id": current_user.id,
            "topic_id": uuid.uuid4(),
            "previous_mastery": 0.45,
            "new_mastery": 0.85,
            "evidence_source": "REASSESSMENT",
            "timestamp": "2025-01-15T10:00:00Z"
        }
    ]
