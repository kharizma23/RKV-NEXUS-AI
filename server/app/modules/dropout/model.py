import uuid
from datetime import datetime, UTC
from typing import Optional, Any
from sqlalchemy import String, Text, Float, ForeignKey, DateTime, JSON, Uuid as UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.base import Base

class DropoutPrediction(Base):
    __tablename__ = "dropout_predictions"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    risk_score: Mapped[float] = mapped_column(Float, nullable=False)  # 0.0 to 100.0
    risk_level: Mapped[str] = mapped_column(String(20), nullable=False)  # LOW, MEDIUM, HIGH, CRITICAL
    factors: Mapped[Optional[Any]] = mapped_column(JSON, nullable=True)
    recommended_interventions: Mapped[Optional[Any]] = mapped_column(JSON, nullable=True)
    predicted_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(UTC), nullable=False)

    student: Mapped["User"] = relationship("User", lazy="selectin")

class Intervention(Base):
    __tablename__ = "interventions"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    intervention_type: Mapped[str] = mapped_column(String(100), nullable=False)  # ACADEMIC_COUNSELING, ATTENDANCE_REVIEW, REMEDIAL_TUTORING, PARENT_MEETING
    description: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="SCHEDULED", nullable=False)  # SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED
    assigned_to: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(UTC), nullable=False)
