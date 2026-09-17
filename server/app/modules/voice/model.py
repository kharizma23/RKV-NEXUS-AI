import uuid
from datetime import datetime, UTC
from typing import Optional
from sqlalchemy import String, Text, Float, Integer, ForeignKey, DateTime, Uuid as UUID
from sqlalchemy.orm import Mapped, mapped_column
from app.database.base import Base

class VoiceSubmission(Base):
    __tablename__ = "voice_submissions"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    exam_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("examinations.id", ondelete="SET NULL"), nullable=True, index=True)
    question_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("questions.id", ondelete="SET NULL"), nullable=True, index=True)
    audio_url: Mapped[str] = mapped_column(String(500), nullable=False)
    transcribed_text: Mapped[str] = mapped_column(Text, nullable=False)
    duration_seconds: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    confidence_score: Mapped[float] = mapped_column(Float, default=0.95, nullable=False)
    language_code: Mapped[str] = mapped_column(String(10), default="en", nullable=False)  # en, ta, hi
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(UTC), nullable=False)
