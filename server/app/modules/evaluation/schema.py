import uuid
from datetime import datetime
from typing import List, Optional, Any
from pydantic import BaseModel, ConfigDict
from app.modules.questions.schema import QuestionResponse
from app.modules.assessment_attempts.schema import StudentExamAttemptResponse

class OverrideScoreRequest(BaseModel):
    faculty_score: float
    faculty_feedback: Optional[str] = None
    override_reason: Optional[str] = None

class QuestionEvaluationResponse(BaseModel):
    id: uuid.UUID
    evaluation_result_id: uuid.UUID
    answer_id: uuid.UUID
    question_id: uuid.UUID
    ai_score: float
    faculty_score: Optional[float] = None
    final_score: float
    max_score: float
    ai_confidence: float
    ai_rationale: Optional[str] = None
    matched_key_points: Optional[Any] = None
    missing_key_points: Optional[Any] = None
    rubric_breakdown: Optional[Any] = None
    counterfactual_guidance: Optional[str] = None
    ocr_script: Optional[Any] = None
    similarity_score: Optional[float] = None
    similarity_flag: bool = False
    matched_submission_id: Optional[uuid.UUID] = None
    faculty_feedback: Optional[str] = None
    override_reason: Optional[str] = None
    reviewed_by_id: Optional[uuid.UUID] = None
    is_overridden: bool
    question: Optional[QuestionResponse] = None

    model_config = ConfigDict(from_attributes=True)

class EvaluationResultResponse(BaseModel):
    id: uuid.UUID
    attempt_id: uuid.UUID
    total_score: float
    max_score: float
    percentage: float
    grade: str
    status: str
    evaluated_at: datetime
    published_at: Optional[datetime] = None
    faculty_notes: Optional[str] = None
    attempt: Optional[StudentExamAttemptResponse] = None
    question_evaluations: list[QuestionEvaluationResponse] = []

    model_config = ConfigDict(from_attributes=True)
