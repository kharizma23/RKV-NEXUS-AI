import uuid
from datetime import datetime
from typing import List, Optional, Any
from pydantic import BaseModel, ConfigDict

class EvaluationEvidenceResponse(BaseModel):
    id: uuid.UUID
    question_evaluation_id: uuid.UUID
    criterion_id: str
    criterion_title: str
    max_mark: float
    suggested_mark: float
    faculty_mark: Optional[float] = None
    evidence_type: str
    evidence_text: str
    start_offset: Optional[int] = None
    end_offset: Optional[int] = None
    matched_key_concepts: Optional[Any] = None
    missing_key_concepts: Optional[Any] = None
    confidence_score: float
    explanation: str
    evaluation_method: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class CounterfactualFeedbackResponse(BaseModel):
    id: uuid.UUID
    question_evaluation_id: uuid.UUID
    current_score: float
    target_score: float
    required_improvements: Optional[Any] = None
    generated_feedback: str
    approved_feedback: Optional[str] = None
    is_faculty_approved: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class QuestionQualityFindingResponse(BaseModel):
    id: uuid.UUID
    severity: str
    category: str
    message: str
    suggested_correction: Optional[str] = None
    rule_code: str
    is_resolved: bool
    resolution_comment: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class QuestionQualityReportResponse(BaseModel):
    id: uuid.UUID
    exam_id: uuid.UUID
    overall_score: float
    component_scores: Optional[Any] = None
    status: str
    has_blocking_issues: bool
    findings: list[QuestionQualityFindingResponse] = []

    model_config = ConfigDict(from_attributes=True)

class GradeReviewRequestCreate(BaseModel):
    attempt_id: uuid.UUID
    question_id: uuid.UUID
    review_category: str
    explanation: str
    requested_action: Optional[str] = None

class GradeReviewRequestResponse(BaseModel):
    id: uuid.UUID
    attempt_id: uuid.UUID
    student_id: uuid.UUID
    question_id: uuid.UUID
    review_category: str
    explanation: str
    requested_action: Optional[str] = None
    status: str
    faculty_decision_reason: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class GradeReviewDecision(BaseModel):
    status: str # ACCEPTED, PARTIALLY_ACCEPTED, REJECTED
    faculty_decision_reason: str

class MasteryHistoryResponse(BaseModel):
    id: uuid.UUID
    student_id: uuid.UUID
    topic_id: uuid.UUID
    previous_mastery: float
    new_mastery: float
    evidence_source: str
    timestamp: datetime

    model_config = ConfigDict(from_attributes=True)
