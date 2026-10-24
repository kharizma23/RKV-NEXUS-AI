import uuid
from datetime import datetime, UTC
from typing import Optional, Any
from sqlalchemy import String, Text, Integer, Float, ForeignKey, DateTime, JSON, Boolean, Uuid as UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.base import Base, TimestampMixin

class Alumni(Base, TimestampMixin):
    __tablename__ = "alumni"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    batch_year: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    degree: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    current_company: Mapped[str] = mapped_column(String(255), nullable=False)
    job_role: Mapped[str] = mapped_column(String(255), nullable=False)
    package_lpa: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    package: Mapped[Optional[float]] = mapped_column(Float, nullable=True)  # in LPA
    location: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    email: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    linkedin_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    is_notable: Mapped[Optional[bool]] = mapped_column(Boolean, default=False, nullable=True)
    domain: Mapped[Optional[str]] = mapped_column(String(100), default="SOFTWARE_DEVELOPMENT", nullable=True)
    graduation_year: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    student_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), unique=False, index=True, nullable=True)

    student = relationship("User", foreign_keys=[student_id], lazy="selectin")
    feedback = relationship("AlumniFeedback", back_populates="alumni", cascade="all, delete-orphan", lazy="selectin")
    achievements = relationship("AlumniAchievement", back_populates="alumni", cascade="all, delete-orphan", lazy="selectin")

class AlumniFeedback(Base, TimestampMixin):
    __tablename__ = "alumni_feedback"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    alumni_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("alumni.id", ondelete="CASCADE"), index=True, nullable=False)
    co_feedback: Mapped[Optional[Any]] = mapped_column(JSON, nullable=True)  # {"CO1": "CRITICAL", "CO2": "HIGH"}
    curriculum_suggestions: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(UTC), nullable=False)

    alumni = relationship("Alumni", back_populates="feedback", lazy="selectin")

class AlumniAchievement(Base, TimestampMixin):
    __tablename__ = "alumni_achievements"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    alumni_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("alumni.id", ondelete="CASCADE"), index=True, nullable=False)
    achievement_type: Mapped[str] = mapped_column(String(100), nullable=False)  # PROMOTION, PATENT, STARTUP_FOUNDED, AWARD
    description: Mapped[str] = mapped_column(Text, nullable=False)
    date: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(UTC), nullable=False)

    alumni = relationship("Alumni", back_populates="achievements", lazy="selectin")
