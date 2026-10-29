import uuid
from datetime import datetime, UTC
from typing import Optional
from sqlalchemy import String, Text, Float, Integer, ForeignKey, DateTime, Uuid as UUID
from sqlalchemy.orm import Mapped, mapped_column
from app.database.base import Base

class BenchmarkingMetric(Base):
    __tablename__ = "benchmarking_metrics"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    institution_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("institutions.id", ondelete="CASCADE"), index=True, nullable=False)
    metric_name: Mapped[str] = mapped_column(String(100), nullable=False)  # co_attainment, placement_rate, student_success_rate, faculty_student_ratio, research_output
    metric_value: Mapped[float] = mapped_column(Float, nullable=False)
    semester: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    recorded_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(UTC), nullable=False)

class BenchmarkingComparison(Base):
    __tablename__ = "benchmarking_comparisons"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    institution_a_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("institutions.id", ondelete="CASCADE"), index=True, nullable=False)
    institution_b_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("institutions.id", ondelete="CASCADE"), index=True, nullable=False)
    metric_name: Mapped[str] = mapped_column(String(100), nullable=False)
    difference: Mapped[float] = mapped_column(Float, nullable=False)
    ai_recommendation: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(UTC), nullable=False)
