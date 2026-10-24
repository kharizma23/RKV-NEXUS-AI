import uuid
from datetime import datetime, UTC
from typing import Optional, List, Dict, Any
from sqlalchemy import (
    String, Text, Float, Integer, Boolean, DateTime, ForeignKey, JSON, Uuid as UUID
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.base import Base

# =========================================================================
# FEATURE 1: AI-POWERED DOUBT DETECTION
# =========================================================================

class StudentDoubt(Base):
    __tablename__ = "student_doubts"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    subject_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), nullable=True)
    concept: Mapped[str] = mapped_column(String(200), nullable=False, index=True)
    doubt_description: Mapped[str] = mapped_column(Text, nullable=False)
    detected_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(UTC), nullable=False)
    resolved: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    misconception_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), nullable=True, index=True)
    micro_lessons: Mapped[List["DoubtMicroLesson"]] = relationship("DoubtMicroLesson", back_populates="doubt", cascade="all, delete-orphan")

class DoubtMicroLesson(Base):
    __tablename__ = "doubt_micro_lessons"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    doubt_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("student_doubts.id", ondelete="CASCADE"), index=True, nullable=True)
    misconception_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), index=True, nullable=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    resource_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    common_mistakes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    correct_approach: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    quick_quiz: Mapped[List[Any]] = mapped_column(JSON, default=list, nullable=False)
    duration_minutes: Mapped[int] = mapped_column(Integer, default=5, nullable=False)
    estimated_minutes: Mapped[int] = mapped_column(Integer, default=5, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(UTC), nullable=False)

    doubt: Mapped[Optional["StudentDoubt"]] = relationship("StudentDoubt", back_populates="micro_lessons")

class Misconception(Base):
    __tablename__ = "misconceptions"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    concept: Mapped[str] = mapped_column(String(255), nullable=False)
    subject_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), nullable=True, index=True)
    department_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), nullable=True, index=True)
    semester_id: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    frequency: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    first_detected: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(UTC), nullable=False)
    last_detected: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(UTC), nullable=False)
    resolved: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    resolved_by: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), nullable=True)
    resolution_notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    severity: Mapped[str] = mapped_column(String(50), default="HIGH", nullable=False)

class ClassDoubt(Base):
    __tablename__ = "class_doubts"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    subject_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), nullable=True, index=True)
    concept: Mapped[str] = mapped_column(String(200), nullable=False)
    frequency: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    last_detected: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(UTC), nullable=False)
    severity: Mapped[str] = mapped_column(String(50), default="HIGH", nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="ACTIVE", nullable=False)


class MisconceptionDetail(Base):
    __tablename__ = "misconception_details"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    misconception_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), index=True, nullable=False)
    root_cause: Mapped[str] = mapped_column(Text, nullable=False)
    suggested_action: Mapped[str] = mapped_column(Text, nullable=False)
    suggested_micro_lesson: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    suggested_revision_material: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    sample_wrong_answers: Mapped[List[Any]] = mapped_column(JSON, default=list, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(UTC), nullable=False)


class InterventionPlan(Base):
    __tablename__ = "intervention_plans"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    faculty_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), index=True, nullable=False)
    misconception_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), index=True, nullable=False)
    topic_to_reteach: Mapped[str] = mapped_column(String(255), nullable=False)
    duration_minutes: Mapped[int] = mapped_column(Integer, default=45, nullable=False)
    plan_text: Mapped[str] = mapped_column(Text, nullable=False)
    example_problems: Mapped[List[Any]] = mapped_column(JSON, default=list, nullable=False)
    practice_questions: Mapped[List[Any]] = mapped_column(JSON, default=list, nullable=False)
    assessment_method: Mapped[str] = mapped_column(String(255), default="Formative Assessment & Quick Quiz", nullable=False)
    generated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(UTC), nullable=False)


class RemedialClass(Base):
    __tablename__ = "remedial_classes"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    faculty_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), index=True, nullable=False)
    subject_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), nullable=True)
    misconception_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), nullable=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    scheduled_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    duration: Mapped[int] = mapped_column(Integer, default=60, nullable=False)
    student_ids: Mapped[List[Any]] = mapped_column(JSON, default=list, nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="SCHEDULED", nullable=False)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(UTC), nullable=False)


class MicroLesson(Base):
    __tablename__ = "micro_lessons"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    misconception_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), index=True, nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    common_mistakes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    correct_approach: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    quick_quiz: Mapped[List[Any]] = mapped_column(JSON, default=list, nullable=False)
    duration: Mapped[int] = mapped_column(Integer, default=5, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(UTC), nullable=False)


class ResolvedDoubt(Base):
    __tablename__ = "resolved_doubts"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    misconception_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), index=True, nullable=False)
    resolved_by: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), index=True, nullable=False)
    resolution_notes: Mapped[str] = mapped_column(Text, nullable=False)
    resolved_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(UTC), nullable=False)


# =========================================================================
# FEATURE 2: STUDENT 360° PROFILE
# =========================================================================

class Student360(Base):
    __tablename__ = "student_360"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    academic_score: Mapped[float] = mapped_column(Float, default=85.0, nullable=False)
    attendance_rate: Mapped[float] = mapped_column(Float, default=94.0, nullable=False)
    wellness_score: Mapped[float] = mapped_column(Float, default=88.0, nullable=False)
    skill_score: Mapped[float] = mapped_column(Float, default=90.0, nullable=False)
    placement_readiness: Mapped[float] = mapped_column(Float, default=87.5, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(UTC), nullable=False)

class ProfileSnapshot(Base):
    __tablename__ = "profile_snapshots"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    snapshot_data: Mapped[Dict[str, Any]] = mapped_column(JSON, default=dict, nullable=False)
    generated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(UTC), nullable=False)


# =========================================================================
# FEATURE 3: PERSONALIZED REVISION SCHEDULER
# =========================================================================

class RevisionSchedule(Base):
    __tablename__ = "revision_schedules"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    subject_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), nullable=True)
    topic: Mapped[str] = mapped_column(String(200), nullable=False)
    revision_date: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="PENDING", nullable=False)  # PENDING, COMPLETED, OVERDUE
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    reminders: Mapped[List["RevisionReminder"]] = relationship("RevisionReminder", back_populates="schedule", cascade="all, delete-orphan")

class RevisionReminder(Base):
    __tablename__ = "revision_reminders"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    schedule_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("revision_schedules.id", ondelete="CASCADE"), index=True, nullable=False)
    reminder_type: Mapped[str] = mapped_column(String(50), default="EMAIL", nullable=False)
    sent_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(UTC), nullable=False)
    acknowledged: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    schedule: Mapped["RevisionSchedule"] = relationship("RevisionSchedule", back_populates="reminders")


# =========================================================================
# FEATURE 4: AI LECTURE SUMMARIZER
# =========================================================================

class Lecture(Base):
    __tablename__ = "lectures"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    faculty_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    subject_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), nullable=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    video_url: Mapped[str] = mapped_column(String(500), nullable=False)
    uploaded_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(UTC), nullable=False)

    summary: Mapped[Optional["LectureSummary"]] = relationship("LectureSummary", back_populates="lecture", uselist=False, cascade="all, delete-orphan")
    mcqs: Mapped[List["LectureMCQ"]] = relationship("LectureMCQ", back_populates="lecture", cascade="all, delete-orphan")

class LectureSummary(Base):
    __tablename__ = "lecture_summaries"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    lecture_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("lectures.id", ondelete="CASCADE"), unique=True, nullable=False)
    summary_text: Mapped[str] = mapped_column(Text, nullable=False)
    key_points: Mapped[List[str]] = mapped_column(JSON, default=list, nullable=False)
    generated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(UTC), nullable=False)

    lecture: Mapped["Lecture"] = relationship("Lecture", back_populates="summary")

class LectureMCQ(Base):
    __tablename__ = "lecture_mcqs"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    lecture_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("lectures.id", ondelete="CASCADE"), index=True, nullable=False)
    question_text: Mapped[str] = mapped_column(Text, nullable=False)
    options: Mapped[List[str]] = mapped_column(JSON, default=list, nullable=False)
    correct_answer: Mapped[str] = mapped_column(String(255), nullable=False)
    co_number: Mapped[str] = mapped_column(String(50), default="CO1", nullable=False)

    lecture: Mapped["Lecture"] = relationship("Lecture", back_populates="mcqs")


# =========================================================================
# FEATURE 5: FACULTY PERFORMANCE DASHBOARD
# =========================================================================

class FacultyPerformance(Base):
    __tablename__ = "faculty_performance"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    faculty_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    subject_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), nullable=True)
    avg_co_attainment: Mapped[float] = mapped_column(Float, default=85.0, nullable=False)
    student_feedback_score: Mapped[float] = mapped_column(Float, default=4.6, nullable=False)
    exam_quality_score: Mapped[float] = mapped_column(Float, default=92.0, nullable=False)
    performance_index: Mapped[float] = mapped_column(Float, default=88.5, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(UTC), nullable=False)

class PerformanceRecommendation(Base):
    __tablename__ = "performance_recommendations"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    faculty_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    recommendation_text: Mapped[str] = mapped_column(Text, nullable=False)
    generated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(UTC), nullable=False)


# =========================================================================
# FEATURE 6: QR-BASED ATTENDANCE
# =========================================================================

class AttendanceSession(Base):
    __tablename__ = "attendance_sessions"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    faculty_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    subject_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), nullable=True)
    qr_code: Mapped[str] = mapped_column(String(500), nullable=False)
    valid_from: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    valid_until: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(UTC), nullable=False)

    records: Mapped[List["AttendanceRecord"]] = relationship("AttendanceRecord", back_populates="session", cascade="all, delete-orphan")

class AttendanceRecord(Base):
    __tablename__ = "attendance_records"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    session_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("attendance_sessions.id", ondelete="CASCADE"), index=True, nullable=False)
    student_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    marked_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(UTC), nullable=False)
    latitude: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    longitude: Mapped[Optional[float]] = mapped_column(Float, nullable=True)

    session: Mapped["AttendanceSession"] = relationship("AttendanceSession", back_populates="records")


# =========================================================================
# FEATURE 7: DIGITAL PORTFOLIO
# =========================================================================

class Portfolio(Base):
    __tablename__ = "portfolios"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    bio: Mapped[str] = mapped_column(Text, default="", nullable=False)
    public_url: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(UTC), nullable=False)

    items: Mapped[List["PortfolioItem"]] = relationship("PortfolioItem", back_populates="portfolio", cascade="all, delete-orphan")

class PortfolioItem(Base):
    __tablename__ = "portfolio_items"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    portfolio_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("portfolios.id", ondelete="CASCADE"), index=True, nullable=False)
    item_type: Mapped[str] = mapped_column(String(50), nullable=False)  # EXAM, PROJECT, SKILL, CERTIFICATION
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, default="", nullable=False)
    evidence_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(UTC), nullable=False)

    portfolio: Mapped["Portfolio"] = relationship("Portfolio", back_populates="items")


# =========================================================================
# FEATURE 8 & 13: AI EXAM PAPER VARIANTS
# =========================================================================

class ExamVariant(Base):
    __tablename__ = "exam_variants"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    exam_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), nullable=True, index=True)
    variant_number: Mapped[int] = mapped_column(Integer, nullable=False)
    questions: Mapped[List[Dict[str, Any]]] = mapped_column(JSON, default=list, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(UTC), nullable=False)

    assignments: Mapped[List["VariantAssignment"]] = relationship("VariantAssignment", back_populates="variant", cascade="all, delete-orphan")

class VariantAssignment(Base):
    __tablename__ = "variant_assignments"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    variant_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("exam_variants.id", ondelete="CASCADE"), index=True, nullable=False)
    student_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    assigned_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(UTC), nullable=False)

    variant: Mapped["ExamVariant"] = relationship("ExamVariant", back_populates="assignments")


# =========================================================================
# FEATURE 9: CAREER PATH PREDICTION
# =========================================================================

class CareerPrediction(Base):
    __tablename__ = "career_predictions"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    predicted_role: Mapped[str] = mapped_column(String(200), nullable=False)
    confidence: Mapped[float] = mapped_column(Float, default=90.0, nullable=False)
    skill_gaps: Mapped[List[str]] = mapped_column(JSON, default=list, nullable=False)
    recommended_certifications: Mapped[List[str]] = mapped_column(JSON, default=list, nullable=False)
    generated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(UTC), nullable=False)

class CareerRole(Base):
    __tablename__ = "career_roles"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    role_name: Mapped[str] = mapped_column(String(200), unique=True, nullable=False)
    required_skills: Mapped[List[str]] = mapped_column(JSON, default=list, nullable=False)
    avg_package: Mapped[str] = mapped_column(String(50), default="12 LPA", nullable=False)


# =========================================================================
# FEATURE 10: EARLY MENTAL HEALTH ALERTS
# =========================================================================

class MentalHealthAlert(Base):
    __tablename__ = "mental_health_alerts"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    alert_type: Mapped[str] = mapped_column(String(100), default="STRESS_SPIKE", nullable=False)
    severity: Mapped[str] = mapped_column(String(50), default="MEDIUM", nullable=False)  # LOW, MEDIUM, HIGH, CRITICAL
    detected_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(UTC), nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="OPEN", nullable=False)  # OPEN, IN_REVIEW, RESOLVED

    interventions: Mapped[List["CounselorIntervention"]] = relationship("CounselorIntervention", back_populates="alert", cascade="all, delete-orphan")

class CounselorIntervention(Base):
    __tablename__ = "counselor_interventions"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    alert_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("mental_health_alerts.id", ondelete="CASCADE"), index=True, nullable=False)
    counselor_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    notes: Mapped[str] = mapped_column(Text, default="", nullable=False)
    scheduled_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)

    alert: Mapped["MentalHealthAlert"] = relationship("MentalHealthAlert", back_populates="interventions")


# =========================================================================
# FEATURE 11: INTER-COLLEGE COMPETITIONS
# =========================================================================

class Competition(Base):
    __tablename__ = "competitions"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    category: Mapped[str] = mapped_column(String(100), nullable=False)
    start_date: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    end_date: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="ACTIVE", nullable=False)

    entries: Mapped[List["CompetitionEntry"]] = relationship("CompetitionEntry", back_populates="competition", cascade="all, delete-orphan")
    metrics: Mapped[List["CompetitionMetric"]] = relationship("CompetitionMetric", back_populates="competition", cascade="all, delete-orphan")

class CompetitionEntry(Base):
    __tablename__ = "competition_entries"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    competition_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("competitions.id", ondelete="CASCADE"), index=True, nullable=False)
    institution_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), nullable=True)
    score: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    rank: Mapped[int] = mapped_column(Integer, default=1, nullable=False)

    competition: Mapped["Competition"] = relationship("Competition", back_populates="entries")

class CompetitionMetric(Base):
    __tablename__ = "competition_metrics"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    competition_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("competitions.id", ondelete="CASCADE"), index=True, nullable=False)
    metric_name: Mapped[str] = mapped_column(String(100), nullable=False)
    weight: Mapped[float] = mapped_column(Float, default=1.0, nullable=False)

    competition: Mapped["Competition"] = relationship("Competition", back_populates="metrics")


# =========================================================================
# FEATURE 12: SMART CONTENT RECOMMENDATION
# =========================================================================

class ContentRecommendation(Base):
    __tablename__ = "content_recommendations"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    topic: Mapped[str] = mapped_column(String(200), nullable=False)
    content_type: Mapped[str] = mapped_column(String(50), default="VIDEO", nullable=False)  # VIDEO, PAPER, COURSE
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    url: Mapped[str] = mapped_column(String(500), nullable=False)
    source: Mapped[str] = mapped_column(String(100), default="YouTube", nullable=False)
    recommended_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(UTC), nullable=False)

class ContentLibrary(Base):
    __tablename__ = "content_library"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    topic: Mapped[str] = mapped_column(String(200), nullable=False, index=True)
    content_type: Mapped[str] = mapped_column(String(50), default="VIDEO", nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    url: Mapped[str] = mapped_column(String(500), nullable=False)
    source: Mapped[str] = mapped_column(String(100), default="YouTube", nullable=False)


# =========================================================================
# FEATURE 14: QR-BASED DIGITAL ID CARD
# =========================================================================

class DigitalID(Base):
    __tablename__ = "digital_ids"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    qr_code: Mapped[str] = mapped_column(String(500), nullable=False)
    issued_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(UTC), nullable=False)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)


# =========================================================================
# FEATURE 15: LIVE CLASS ENGAGEMENT TRACKER
# =========================================================================

class LiveSession(Base):
    __tablename__ = "live_sessions"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    faculty_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    subject_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), nullable=True)
    started_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(UTC), nullable=False)
    ended_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    engagement_logs: Mapped[List["EngagementLog"]] = relationship("EngagementLog", back_populates="session", cascade="all, delete-orphan")

class EngagementLog(Base):
    __tablename__ = "engagement_logs"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    session_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("live_sessions.id", ondelete="CASCADE"), index=True, nullable=False)
    student_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    attention_score: Mapped[float] = mapped_column(Float, default=85.0, nullable=False)
    interaction_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(UTC), nullable=False)

    session: Mapped["LiveSession"] = relationship("LiveSession", back_populates="engagement_logs")
