import uuid
from datetime import datetime, UTC
from typing import Optional, Any
from sqlalchemy import String, Integer, Float, ForeignKey, DateTime, JSON, Uuid as UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.base import Base

class PerformancePrediction(Base):
    __tablename__ = "performance_predictions"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    semester: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    predicted_percentage: Mapped[float] = mapped_column(Float, nullable=False)
    predicted_grade: Mapped[str] = mapped_column(String(10), nullable=False)
    risk_level: Mapped[str] = mapped_column(String(20), nullable=False)  # LOW, MEDIUM, HIGH
    confidence: Mapped[float] = mapped_column(Float, nullable=False)
    factors: Mapped[Optional[Any]] = mapped_column(JSON, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(UTC), nullable=False)

    student: Mapped["User"] = relationship("User", lazy="selectin")
