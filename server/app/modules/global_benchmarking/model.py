import uuid
from typing import Optional, Any
from sqlalchemy import String, Text, Integer, Float, ForeignKey, JSON, Uuid as UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.base import Base, TimestampMixin

class GlobalUniversity(Base, TimestampMixin):
    __tablename__ = "global_universities"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    country: Mapped[str] = mapped_column(String(100), nullable=False)
    ranking: Mapped[int] = mapped_column(Integer, nullable=False)
    co_standards: Mapped[Optional[Any]] = mapped_column(JSON, nullable=True)
    placement_rate: Mapped[float] = mapped_column(Float, default=95.0, nullable=False)
    avg_salary_usd: Mapped[float] = mapped_column(Float, default=115000.0, nullable=False)

    benchmarks = relationship("GlobalBenchmark", back_populates="global_university", cascade="all, delete-orphan", lazy="selectin")

class GlobalBenchmark(Base, TimestampMixin):
    __tablename__ = "global_benchmarks"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    institution_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("institutions.id", ondelete="CASCADE"), nullable=True)
    global_university_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("global_universities.id", ondelete="CASCADE"), index=True, nullable=False)
    metric_name: Mapped[str] = mapped_column(String(100), nullable=False)
    our_value: Mapped[float] = mapped_column(Float, nullable=False)
    their_value: Mapped[float] = mapped_column(Float, nullable=False)
    gap: Mapped[float] = mapped_column(Float, nullable=False)
    recommendation: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    global_university = relationship("GlobalUniversity", back_populates="benchmarks", lazy="selectin")

class BestPractice(Base, TimestampMixin):
    __tablename__ = "best_practices"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    category: Mapped[str] = mapped_column(String(100), nullable=False)  # CURRICULUM, RESEARCH, ASSESSMENT, INDUSTRY_TIEUPS, PEDAGOGY
    practice: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    source: Mapped[str] = mapped_column(String(255), nullable=False)
