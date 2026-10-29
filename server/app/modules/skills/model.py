import uuid
from datetime import datetime, UTC
from typing import Optional
from sqlalchemy import String, Text, Float, ForeignKey, DateTime, Uuid as UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.base import Base

class IndustrySkill(Base):
    __tablename__ = "industry_skills"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    category: Mapped[str] = mapped_column(String(100), default="SOFTWARE_ENGINEERING", nullable=False)  # AI_ML, CLOUD_DEVOPS, CYBERSECURITY, DATA_STRUCTURES, FULL_STACK
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

class COSkillMapping(Base):
    __tablename__ = "co_skill_mapping"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    co_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("course_outcomes.id", ondelete="CASCADE"), nullable=True, index=True)
    co_code: Mapped[str] = mapped_column(String(50), default="CO1", nullable=False)
    skill_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("industry_skills.id", ondelete="CASCADE"), index=True, nullable=False)
    proficiency_level: Mapped[str] = mapped_column(String(50), default="INTERMEDIATE", nullable=False)  # NOVICE, INTERMEDIATE, ADVANCED, EXPERT

    skill: Mapped["IndustrySkill"] = relationship("IndustrySkill", lazy="selectin")

class StudentSkillProfile(Base):
    __tablename__ = "student_skill_profile"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    skill_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("industry_skills.id", ondelete="CASCADE"), index=True, nullable=False)
    proficiency_level: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)  # 0.0 to 100.0
    last_updated: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(UTC), nullable=False)

    skill: Mapped["IndustrySkill"] = relationship("IndustrySkill", lazy="selectin")
