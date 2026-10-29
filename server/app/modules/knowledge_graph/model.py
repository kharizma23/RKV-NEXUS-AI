import uuid
from datetime import datetime, UTC
from typing import Optional
from sqlalchemy import String, Integer, Float, ForeignKey, DateTime, Uuid as UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.base import Base

class KnowledgeNode(Base):
    __tablename__ = "knowledge_nodes"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    subject_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("subjects.id", ondelete="CASCADE"), index=True, nullable=False)
    topic: Mapped[str] = mapped_column(String(255), nullable=False)
    unit_number: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    co_number: Mapped[str] = mapped_column(String(20), default="CO1", nullable=False)

class KnowledgeEdge(Base):
    __tablename__ = "knowledge_edges"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    source_node_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("knowledge_nodes.id", ondelete="CASCADE"), index=True, nullable=False)
    target_node_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("knowledge_nodes.id", ondelete="CASCADE"), index=True, nullable=False)
    relationship_type: Mapped[str] = mapped_column(String(50), default="PREREQUISITE", nullable=False)  # PREREQUISITE, SUBTOPIC, COMPLEMENTS

class StudentKnowledgeGap(Base):
    __tablename__ = "student_knowledge_gaps"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    node_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("knowledge_nodes.id", ondelete="CASCADE"), index=True, nullable=False)
    mastery_level: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)  # 0.0 to 100.0
    last_assessed: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(UTC), nullable=False)

    node: Mapped["KnowledgeNode"] = relationship("KnowledgeNode", lazy="selectin")
