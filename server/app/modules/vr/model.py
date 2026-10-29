import uuid
from datetime import datetime, UTC
from typing import Optional, Any
from sqlalchemy import String, Text, Integer, Float, ForeignKey, DateTime, JSON, Uuid as UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.base import Base, TimestampMixin

class VRExam(Base, TimestampMixin):
    __tablename__ = "vr_exams"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    subject_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("subjects.id", ondelete="SET NULL"), nullable=True, index=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    vr_scene_url: Mapped[str] = mapped_column(String(500), nullable=False)
    duration_minutes: Mapped[int] = mapped_column(Integer, default=45, nullable=False)
    created_by: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    experiment_type: Mapped[str] = mapped_column(String(100), default="PHYSICS_OPTICS", nullable=False)

    subject = relationship("Subject", foreign_keys=[subject_id], lazy="selectin")
    creator = relationship("User", foreign_keys=[created_by], lazy="selectin")
    attempts = relationship("VRAttempt", back_populates="vr_exam", cascade="all, delete-orphan", lazy="selectin")

class VRAttempt(Base, TimestampMixin):
    __tablename__ = "vr_attempts"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    vr_exam_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("vr_exams.id", ondelete="CASCADE"), index=True, nullable=False)
    student_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    started_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(UTC), nullable=False)
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    score: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    interaction_log: Mapped[Optional[Any]] = mapped_column(JSON, nullable=True)

    vr_exam = relationship("VRExam", back_populates="attempts", lazy="selectin")
    student = relationship("User", foreign_keys=[student_id], lazy="selectin")
