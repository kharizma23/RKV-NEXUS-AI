import uuid
from datetime import datetime, UTC
from typing import Optional, Dict, Any, List
from sqlalchemy import String, Text, Float, Integer, Boolean, ForeignKey, DateTime, JSON, Uuid as UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.base import Base

# =========================================================================
# FEATURE 1: AI-POWERED PROCTORING
# =========================================================================

class ProctoringSession(Base):
    __tablename__ = "proctoring_sessions"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    exam_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("examinations.id", ondelete="CASCADE"), index=True, nullable=False)
    student_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    started_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(UTC), nullable=False)
    ended_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    status: Mapped[str] = mapped_column(String(50), default="ACTIVE", nullable=False)  # ACTIVE, FLAGGED, COMPLETED, DISQUALIFIED
    risk_score: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)  # 0 to 100

class ProctoringEvent(Base):
    __tablename__ = "proctoring_events"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    session_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("proctoring_sessions.id", ondelete="CASCADE"), index=True, nullable=False)
    event_type: Mapped[str] = mapped_column(String(100), nullable=False)  # MULTIPLE_FACES, LOOKING_AWAY, PHONE_DETECTED, TAB_SWITCH, VOICE_DETECTED
    timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(UTC), nullable=False)
    severity: Mapped[str] = mapped_column(String(30), default="MEDIUM", nullable=False)  # LOW, MEDIUM, HIGH, CRITICAL
    evidence_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    reviewed_by: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)

class ProctoringFlag(Base):
    __tablename__ = "proctoring_flags"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    session_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("proctoring_sessions.id", ondelete="CASCADE"), index=True, nullable=False)
    flag_type: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    resolved: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    resolved_by: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    resolved_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)


# =========================================================================
# FEATURE 2: EMOTION-AWARE EXAM INTERFACE
# =========================================================================

class EmotionLog(Base):
    __tablename__ = "emotion_logs"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    exam_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("examinations.id", ondelete="CASCADE"), index=True, nullable=False)
    student_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    emotion: Mapped[str] = mapped_column(String(50), nullable=False)  # happy, sad, stressed, confused, bored, neutral
    confidence: Mapped[float] = mapped_column(Float, default=0.85, nullable=False)
    timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(UTC), nullable=False)

class EmotionIntervention(Base):
    __tablename__ = "emotion_interventions"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    exam_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("examinations.id", ondelete="CASCADE"), index=True, nullable=False)
    student_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    intervention_type: Mapped[str] = mapped_column(String(100), nullable=False)  # 2_MIN_BREAK, OPTIONAL_HINT, HARDER_QUESTION
    triggered_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(UTC), nullable=False)
    accepted: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)


# =========================================================================
# FEATURE 3: COLLABORATIVE GROUP EXAMS
# =========================================================================

class GroupExam(Base):
    __tablename__ = "group_exams"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    exam_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("examinations.id", ondelete="CASCADE"), index=True, nullable=False)
    group_size: Mapped[int] = mapped_column(Integer, default=3, nullable=False)
    created_by: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(UTC), nullable=False)

class ExamGroup(Base):
    __tablename__ = "exam_groups"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    group_exam_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("group_exams.id", ondelete="CASCADE"), index=True, nullable=False)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    leader_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)

class GroupMember(Base):
    __tablename__ = "group_members"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    group_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("exam_groups.id", ondelete="CASCADE"), index=True, nullable=False)
    student_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    role: Mapped[str] = mapped_column(String(50), default="contributor", nullable=False)  # leader, researcher, presenter, contributor

class GroupSubmission(Base):
    __tablename__ = "group_submissions"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    group_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("exam_groups.id", ondelete="CASCADE"), index=True, nullable=False)
    question_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("questions.id", ondelete="CASCADE"), index=True, nullable=False)
    answer: Mapped[str] = mapped_column(Text, nullable=False)
    submitted_by: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    submitted_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(UTC), nullable=False)

class GroupScore(Base):
    __tablename__ = "group_scores"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    group_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("exam_groups.id", ondelete="CASCADE"), unique=True, nullable=False)
    group_score: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    individual_scores: Mapped[Dict[str, Any]] = mapped_column(JSON, default=dict, nullable=False)


# =========================================================================
# FEATURE 4: GAMIFIED EXAM LEVELS
# =========================================================================

class GamifiedExam(Base):
    __tablename__ = "gamified_exams"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    exam_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("examinations.id", ondelete="CASCADE"), index=True, nullable=False)
    levels: Mapped[int] = mapped_column(Integer, default=4, nullable=False)  # typically 4 (Easy, Medium, Hard, Boss)
    created_by: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(UTC), nullable=False)

class ExamLevel(Base):
    __tablename__ = "exam_levels"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    gamified_exam_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("gamified_exams.id", ondelete="CASCADE"), index=True, nullable=False)
    level_number: Mapped[int] = mapped_column(Integer, nullable=False)
    difficulty: Mapped[str] = mapped_column(String(50), nullable=False)  # Easy, Medium, Hard, Boss
    points: Mapped[int] = mapped_column(Integer, default=100, nullable=False)
    boss_question: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

class LevelProgress(Base):
    __tablename__ = "level_progress"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    level_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("exam_levels.id", ondelete="CASCADE"), index=True, nullable=False)
    completed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(UTC), nullable=False)
    score: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)


# =========================================================================
# FEATURE 5: OFFLINE EXAM MODE
# =========================================================================

class OfflineExam(Base):
    __tablename__ = "offline_exams"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    exam_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("examinations.id", ondelete="CASCADE"), index=True, nullable=False)
    student_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    downloaded_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(UTC), nullable=False)
    synced_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    status: Mapped[str] = mapped_column(String(50), default="DOWNLOADED", nullable=False)  # DOWNLOADED, SAVED_LOCALLY, SYNCED, CONFLICT

class OfflineAnswer(Base):
    __tablename__ = "offline_answers"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    offline_exam_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("offline_exams.id", ondelete="CASCADE"), index=True, nullable=False)
    question_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("questions.id", ondelete="CASCADE"), index=True, nullable=False)
    answer: Mapped[str] = mapped_column(Text, nullable=False)
    saved_locally: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)


# =========================================================================
# FEATURE 6: VOICE-ENABLED EXAM (Extending/Adding tables)
# =========================================================================

class VoiceExamConfig(Base):
    __tablename__ = "voice_exams"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    exam_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("examinations.id", ondelete="CASCADE"), unique=True, nullable=False)
    enabled_languages: Mapped[List[str]] = mapped_column(JSON, default=lambda: ["en", "ta", "hi"], nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(UTC), nullable=False)


# =========================================================================
# FEATURE 7: FLEXIBLE TIME EXAMS
# =========================================================================

class FlexibleExam(Base):
    __tablename__ = "flexible_exams"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    exam_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("examinations.id", ondelete="CASCADE"), unique=True, nullable=False)
    window_start: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    window_end: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    duration_minutes: Mapped[int] = mapped_column(Integer, default=90, nullable=False)

class FlexibleAttempt(Base):
    __tablename__ = "flexible_attempts"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    flexible_exam_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("flexible_exams.id", ondelete="CASCADE"), index=True, nullable=False)
    student_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    started_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(UTC), nullable=False)
    submitted_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    time_taken: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)  # in seconds


# =========================================================================
# FEATURE 8: PEER ASSESSMENT
# =========================================================================

class PeerAssessment(Base):
    __tablename__ = "peer_assessments"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    exam_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("examinations.id", ondelete="CASCADE"), index=True, nullable=False)
    evaluator_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    evaluatee_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    question_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("questions.id", ondelete="CASCADE"), index=True, nullable=False)
    marks: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    feedback: Mapped[str] = mapped_column(Text, default="", nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(UTC), nullable=False)

class PeerValidation(Base):
    __tablename__ = "peer_validation"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    assessment_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("peer_assessments.id", ondelete="CASCADE"), unique=True, nullable=False)
    ai_score: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    faculty_score: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    status: Mapped[str] = mapped_column(String(50), default="VALIDATED", nullable=False)  # VALIDATED, OUTLIER, OVERRIDDEN


# =========================================================================
# FEATURE 9: COUNTERFACTUAL FEEDBACK
# =========================================================================

class CounterfactualFeedback(Base):
    __tablename__ = "counterfactual_feedback"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    submission_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("student_answers.id", ondelete="CASCADE"), index=True, nullable=False)
    feedback_text: Mapped[str] = mapped_column(Text, nullable=False)
    additional_marks_possible: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    suggested_improvements: Mapped[str] = mapped_column(Text, default="", nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(UTC), nullable=False)


# =========================================================================
# FEATURE 10: SKILL-BASED EVALUATION
# =========================================================================

class SkillEvaluation(Base):
    __tablename__ = "skill_evaluations"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    submission_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("student_answers.id", ondelete="CASCADE"), unique=True, nullable=False)
    critical_thinking: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)  # 0 to 100
    problem_solving: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    communication: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    creativity: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    evaluated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(UTC), nullable=False)

class SkillMapping(Base):
    __tablename__ = "skill_mappings"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    co_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("course_outcomes.id", ondelete="CASCADE"), index=True, nullable=False)
    skill_id: Mapped[str] = mapped_column(String(100), nullable=False)
    proficiency_level: Mapped[str] = mapped_column(String(50), default="ADVANCED", nullable=False)  # BEGINNER, INTERMEDIATE, ADVANCED, EXPERT


# =========================================================================
# FEATURE 11: CONFIDENCE SCORE
# =========================================================================

class ConfidenceScore(Base):
    __tablename__ = "confidence_scores"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    submission_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("student_answers.id", ondelete="CASCADE"), index=True, nullable=False)
    question_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("questions.id", ondelete="CASCADE"), index=True, nullable=False)
    ai_marks: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    confidence_percentage: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)  # 0 to 100
    review_needed: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    calculated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(UTC), nullable=False)


# =========================================================================
# FEATURE 12: MULTI-EVALUATOR CONSENSUS
# =========================================================================

class MultiEvaluation(Base):
    __tablename__ = "multi_evaluations"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    submission_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("student_answers.id", ondelete="CASCADE"), unique=True, nullable=False)
    model_a_score: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    model_b_score: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    model_c_score: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    consensus_score: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    disagreement: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    faculty_override_score: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    evaluated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(UTC), nullable=False)


# =========================================================================
# FEATURE 13: LEARNING STYLE EVALUATION
# =========================================================================

class LearningStyle(Base):
    __tablename__ = "learning_styles"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    style: Mapped[str] = mapped_column(String(50), default="VISUAL", nullable=False)  # VISUAL, AUDITORY, KINESTHETIC, READ_WRITE
    confidence: Mapped[float] = mapped_column(Float, default=0.88, nullable=False)
    assessed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(UTC), nullable=False)

class StyleQuestion(Base):
    __tablename__ = "style_questions"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    question_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("questions.id", ondelete="CASCADE"), unique=True, nullable=False)
    style_type: Mapped[str] = mapped_column(String(50), default="VISUAL", nullable=False)


# =========================================================================
# FEATURE 14: IMPROVEMENT-BASED GRADING
# =========================================================================

class ImprovementScore(Base):
    __tablename__ = "improvement_scores"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    current_exam_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("examinations.id", ondelete="CASCADE"), nullable=False)
    previous_exam_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("examinations.id", ondelete="SET NULL"), nullable=True)
    improvement_percentage: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    bonus_marks: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    calculated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(UTC), nullable=False)


# =========================================================================
# FEATURE 15: INDUSTRY-VALIDATED EVALUATION
# =========================================================================

class IndustryExpert(Base):
    __tablename__ = "industry_experts"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(150), nullable=False)
    company: Mapped[str] = mapped_column(String(150), nullable=False)
    expertise: Mapped[str] = mapped_column(String(200), nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(UTC), nullable=False)

class IndustryReview(Base):
    __tablename__ = "industry_reviews"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    submission_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("student_answers.id", ondelete="CASCADE"), index=True, nullable=False)
    expert_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("industry_experts.id", ondelete="CASCADE"), index=True, nullable=False)
    score: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    feedback: Mapped[str] = mapped_column(Text, nullable=False)
    validated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(UTC), nullable=False)
