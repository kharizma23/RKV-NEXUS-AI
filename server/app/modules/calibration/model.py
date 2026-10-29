import uuid
from datetime import datetime, UTC
from typing import Optional
from sqlalchemy import String, Text, Integer, Float, ForeignKey, DateTime, Uuid as UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.base import Base, TimestampMixin

class QuestionCalibration(Base, TimestampMixin):
    __tablename__ = "question_calibrations"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    question_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("questions.id", ondelete="CASCADE"), index=True, nullable=False)
    batch_id: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    avg_score: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    difficulty_index: Mapped[float] = mapped_column(Float, default=0.5, nullable=False)  # 0 to 1 (P-value)
    discrimination_index: Mapped[float] = mapped_column(Float, default=0.3, nullable=False)  # -1 to 1 (D-value)
    sample_size: Mapped[int] = mapped_column(Integer, default=50, nullable=False)
    calibrated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(UTC), nullable=False)

    question = relationship("Question", foreign_keys=[question_id], lazy="selectin")

class QuestionFlag(Base, TimestampMixin):
    __tablename__ = "question_flags"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    question_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("questions.id", ondelete="CASCADE"), index=True, nullable=False)
    flag_type: Mapped[str] = mapped_column(String(100), nullable=False)  # TOO_EASY, TOO_HARD, NEGATIVE_DISCRIMINATION, AMBIGUOUS_OPTIONS
    reason: Mapped[str] = mapped_column(Text, nullable=False)
    suggested_action: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="OPEN", nullable=False)  # OPEN, RESOLVED, REPLACED
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(UTC), nullable=False)

    question = relationship("Question", foreign_keys=[question_id], lazy="selectin")
