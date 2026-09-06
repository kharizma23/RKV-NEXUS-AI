import uuid
from datetime import datetime, timezone, UTC
from typing import Optional, Any, TYPE_CHECKING
from sqlalchemy import String, Text, Boolean, Float, Integer, ForeignKey, DateTime, JSON, Uuid as UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.base import Base, TimestampMixin

if TYPE_CHECKING:
    from app.modules.evaluation.model import QuestionEvaluation
    from app.modules.examinations.model import Examination
    from app.modules.questions.model import Question
    from app.modules.users.model import StudentProfile
    from app.modules.syllabus.model import Topic

class EvaluationEvidence(Base):
    __tablename__ = "evaluation_evidences"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    question_evaluation_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("question_evaluations.id", ondelete="CASCADE"), nullable=False, index=True)
    criterion_id: Mapped[str] = mapped_column(String(50), nullable=False)
    criterion_title: Mapped[str] = mapped_column(String(255), nullable=False)
    max_mark: Mapped[float] = mapped_column(Float, nullable=False, default=2.0)
    suggested_mark: Mapped[float] = mapped_column(Float, nullable=False, default=2.0)
    faculty_mark: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    evidence_type: Mapped[str] = mapped_column(String(50), nullable=False, default="EXACT_TEXT_SPAN")
    evidence_text: Mapped[str] = mapped_column(Text, nullable=False)
    start_offset: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    end_offset: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    matched_key_concepts: Mapped[Optional[Any]] = mapped_column(JSON, nullable=True)
    missing_key_concepts: Mapped[Optional[Any]] = mapped_column(JSON, nullable=True)
    confidence_score: Mapped[float] = mapped_column(Float, nullable=False, default=0.9)
    explanation: Mapped[str] = mapped_column(Text, nullable=False)
    evaluation_method: Mapped[str] = mapped_column(String(50), nullable=False, default="DETERMINISTIC_FALLBACK")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(UTC), nullable=False)

class CounterfactualFeedback(Base):
    __tablename__ = "counterfactual_feedbacks"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    question_evaluation_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("question_evaluations.id", ondelete="CASCADE"), nullable=False, index=True)
    current_score: Mapped[float] = mapped_column(Float, nullable=False)
    target_score: Mapped[float] = mapped_column(Float, nullable=False)
    required_improvements: Mapped[Optional[Any]] = mapped_column(JSON, nullable=True)
    generated_feedback: Mapped[str] = mapped_column(Text, nullable=False)
    approved_feedback: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    is_faculty_approved: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(UTC), nullable=False)

class QuestionQualityReport(Base, TimestampMixin):
    __tablename__ = "question_quality_reports"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    exam_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("examinations.id", ondelete="CASCADE"), nullable=False, index=True)
    overall_score: Mapped[float] = mapped_column(Float, nullable=False, default=85.0)
    component_scores: Mapped[Optional[Any]] = mapped_column(JSON, nullable=True)
    status: Mapped[str] = mapped_column(String(50), nullable=False, default="PASSED") # PASSED, WARNINGS, BLOCKED
    has_blocking_issues: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)

    findings: Mapped[list["QuestionQualityFinding"]] = relationship("QuestionQualityFinding", back_populates="report", cascade="all, delete-orphan", lazy="selectin")

class QuestionQualityFinding(Base):
    __tablename__ = "question_quality_findings"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    report_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("question_quality_reports.id", ondelete="CASCADE"), nullable=False, index=True)
    question_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("questions.id", ondelete="SET NULL"), nullable=True)
    severity: Mapped[str] = mapped_column(String(20), nullable=False, default="INFO") # INFO, WARNING, ERROR, BLOCKING
    category: Mapped[str] = mapped_column(String(50), nullable=False)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    suggested_correction: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    rule_code: Mapped[str] = mapped_column(String(50), nullable=False)
    is_resolved: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    resolution_comment: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    report: Mapped["QuestionQualityReport"] = relationship("QuestionQualityReport", back_populates="findings")

class GradeReviewRequest(Base, TimestampMixin):
    __tablename__ = "grade_review_requests"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    attempt_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("student_exam_attempts.id", ondelete="CASCADE"), nullable=False, index=True)
    student_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("student_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    question_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("questions.id", ondelete="CASCADE"), nullable=False, index=True)
    review_category: Mapped[str] = mapped_column(String(50), nullable=False) # RUBRIC_CLARIFICATION, MISSING_EVIDENCE, OCR_ERROR, OTHER
    explanation: Mapped[str] = mapped_column(Text, nullable=False)
    requested_action: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(String(50), nullable=False, default="SUBMITTED") # SUBMITTED, UNDER_REVIEW, ACCEPTED, REJECTED
    faculty_decision_reason: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

class RemedialActivity(Base, TimestampMixin):
    __tablename__ = "remedial_activities"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    remedial_plan_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("remedial_learning_plans.id", ondelete="CASCADE"), nullable=False, index=True)
    topic_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("topics.id", ondelete="CASCADE"), nullable=False, index=True)
    misconception_code: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    activity_type: Mapped[str] = mapped_column(String(50), nullable=False, default="PRACTICE_EXERCISE")
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    content: Mapped[Optional[Any]] = mapped_column(JSON, nullable=True)
    estimated_minutes: Mapped[int] = mapped_column(Integer, nullable=False, default=15)

class RemedialActivityAttempt(Base):
    __tablename__ = "remedial_activity_attempts"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    activity_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("remedial_activities.id", ondelete="CASCADE"), nullable=False, index=True)
    student_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("student_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    started_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(UTC), nullable=False)
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    score: Mapped[float] = mapped_column(Float, nullable=False, default=100.0)
    time_spent_seconds: Mapped[int] = mapped_column(Integer, nullable=False, default=300)
    confidence_rating: Mapped[int] = mapped_column(Integer, nullable=False, default=5)
    status: Mapped[str] = mapped_column(String(50), nullable=False, default="COMPLETED")

class ReassessmentDefinition(Base, TimestampMixin):
    __tablename__ = "reassessment_definitions"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("student_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    subject_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("subjects.id", ondelete="CASCADE"), nullable=False, index=True)
    topic_ids: Mapped[Optional[Any]] = mapped_column(JSON, nullable=True)
    total_marks: Mapped[float] = mapped_column(Float, nullable=False, default=10.0)
    duration_minutes: Mapped[int] = mapped_column(Integer, nullable=False, default=30)

class ReassessmentAttempt(Base):
    __tablename__ = "reassessment_attempts"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    reassessment_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("reassessment_definitions.id", ondelete="CASCADE"), nullable=False, index=True)
    student_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("student_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    pre_remediation_score: Mapped[float] = mapped_column(Float, nullable=False, default=45.0)
    post_remediation_score: Mapped[float] = mapped_column(Float, nullable=False, default=85.0)
    score_delta: Mapped[float] = mapped_column(Float, nullable=False, default=40.0)
    status: Mapped[str] = mapped_column(String(50), nullable=False, default="COMPLETED")
    submitted_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(UTC), nullable=False)

class MasteryHistory(Base):
    __tablename__ = "mastery_histories"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("student_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    topic_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("topics.id", ondelete="CASCADE"), nullable=False, index=True)
    previous_mastery: Mapped[float] = mapped_column(Float, nullable=False)
    new_mastery: Mapped[float] = mapped_column(Float, nullable=False)
    evidence_source: Mapped[str] = mapped_column(String(100), nullable=False) # e.g. EXAM_ATTEMPT, REASSESSMENT
    assessment_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), nullable=True)
    timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(UTC), nullable=False)

class AIOperationLog(Base):
    __tablename__ = "ai_operation_logs"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    operation_type: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    provider_name: Mapped[str] = mapped_column(String(50), nullable=False, default="DETERMINISTIC_LOCAL")
    model_name: Mapped[str] = mapped_column(String(50), nullable=False, default="v1.0")
    confidence_score: Mapped[float] = mapped_column(Float, nullable=False, default=0.9)
    duration_ms: Mapped[int] = mapped_column(Integer, nullable=False, default=120)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="SUCCESS")
    user_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(UTC), nullable=False)
