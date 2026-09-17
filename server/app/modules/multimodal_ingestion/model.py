import uuid
from datetime import datetime, timezone, UTC
from typing import Optional, Any, TYPE_CHECKING
from sqlalchemy import String, Text, Float, Integer, ForeignKey, DateTime, JSON, Uuid as UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.base import Base

if TYPE_CHECKING:
    from app.modules.assessment_attempts.model import StudentAnswer

class OCRExtractedScript(Base):
    __tablename__ = "ocr_extracted_scripts"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    answer_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("student_answers.id", ondelete="CASCADE"), nullable=False, index=True)
    image_url: Mapped[str] = mapped_column(String(500), nullable=False)
    page_number: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    extracted_text: Mapped[str] = mapped_column(Text, nullable=False)
    confidence_score: Mapped[float] = mapped_column(Float, nullable=False, default=0.92)
    bounding_boxes: Mapped[Optional[Any]] = mapped_column(JSON, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(UTC), nullable=False)

class VivaAudioTranscript(Base):
    __tablename__ = "viva_audio_transcripts"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    answer_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("student_answers.id", ondelete="CASCADE"), nullable=False, index=True)
    audio_url: Mapped[str] = mapped_column(String(500), nullable=False)
    transcript_text: Mapped[str] = mapped_column(Text, nullable=False)
    duration_seconds: Mapped[int] = mapped_column(Integer, nullable=False, default=60)
    speech_confidence: Mapped[float] = mapped_column(Float, nullable=False, default=0.88)
    word_timestamps: Mapped[Optional[Any]] = mapped_column(JSON, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(UTC), nullable=False)

class DiagramRegionEvaluation(Base):
    __tablename__ = "diagram_region_evaluations"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    answer_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("student_answers.id", ondelete="CASCADE"), nullable=False, index=True)
    diagram_url: Mapped[str] = mapped_column(String(500), nullable=False)
    detected_components: Mapped[Optional[Any]] = mapped_column(JSON, nullable=True)
    missing_components: Mapped[Optional[Any]] = mapped_column(JSON, nullable=True)
    structural_score: Mapped[float] = mapped_column(Float, nullable=False, default=85.0)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(UTC), nullable=False)

class HandwrittenSubmission(Base):
    __tablename__ = "handwritten_submissions"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    answer_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("student_answers.id", ondelete="CASCADE"), nullable=False, index=True)
    exam_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("examinations.id", ondelete="CASCADE"), nullable=False, index=True)
    question_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("questions.id", ondelete="CASCADE"), nullable=False, index=True)
    student_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("student_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    image_url: Mapped[str] = mapped_column(String(500), nullable=False)
    extracted_text: Mapped[str] = mapped_column(Text, nullable=False)
    confidence_score: Mapped[float] = mapped_column(Float, nullable=False, default=0.95)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(UTC), nullable=False)
