import uuid
from datetime import datetime, UTC
from sqlalchemy import String, Text, DateTime, UniqueConstraint, Uuid as UUID
from sqlalchemy.orm import Mapped, mapped_column
from app.database.base import Base

class Translation(Base):
    __tablename__ = "translations"
    __table_args__ = (UniqueConstraint("lang_code", "key", name="uq_translation_lang_key"),)

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    lang_code: Mapped[str] = mapped_column(String(10), index=True, nullable=False)  # en, ta, hi
    key: Mapped[str] = mapped_column(String(100), index=True, nullable=False)
    value: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(UTC), nullable=False)
