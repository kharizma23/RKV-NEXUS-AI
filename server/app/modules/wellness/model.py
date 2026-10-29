import uuid
from datetime import datetime, UTC
from typing import Optional
from sqlalchemy import String, Text, Integer, Float, Boolean, ForeignKey, DateTime, Uuid as UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.base import Base, TimestampMixin

class WellnessCheckin(Base, TimestampMixin):
    __tablename__ = "wellness_checkins"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    mood_score: Mapped[int] = mapped_column(Integer, nullable=False)  # 1-10
    stress_level: Mapped[int] = mapped_column(Integer, nullable=False)  # 1-10
    sleep_hours: Mapped[float] = mapped_column(Float, nullable=False)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    is_anonymous: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(UTC), nullable=False)

    student = relationship("User", foreign_keys=[student_id], lazy="selectin")

class WellnessAlert(Base, TimestampMixin):
    __tablename__ = "wellness_alerts"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    alert_type: Mapped[str] = mapped_column(String(100), default="STRESS_SPIKE", nullable=False)
    severity: Mapped[str] = mapped_column(String(50), default="MEDIUM", nullable=False)  # LOW, MEDIUM, HIGH, CRITICAL
    recommended_action: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="ACTIVE", nullable=False)  # ACTIVE, REVIEWED, RESOLVED
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(UTC), nullable=False)

    student = relationship("User", foreign_keys=[student_id], lazy="selectin")

class CounselorSession(Base, TimestampMixin):
    __tablename__ = "counselor_sessions"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    counselor_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    scheduled_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(String(50), default="SCHEDULED", nullable=False)  # SCHEDULED, COMPLETED, CANCELLED

    student = relationship("User", foreign_keys=[student_id], lazy="selectin")
    counselor = relationship("User", foreign_keys=[counselor_id], lazy="selectin")
