import uuid
from datetime import datetime, UTC
from typing import Optional, List, TYPE_CHECKING
from sqlalchemy import String, Text, Boolean, Integer, ForeignKey, DateTime, Uuid as UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.base import Base, TimestampMixin

if TYPE_CHECKING:
    from app.modules.users.model import User

class Notification(Base, TimestampMixin):
    __tablename__ = "notifications"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    category: Mapped[str] = mapped_column(String(50), nullable=False)  # ACADEMIC, EXAMINATION, RESULTS, FACULTY, LEARNING_PLAN, ASSIGNMENT, ANNOUNCEMENT, DISCUSSION, PLACEMENT, EVENTS
    priority: Mapped[str] = mapped_column(String(20), nullable=False, default="MEDIUM")  # CRITICAL, HIGH, MEDIUM, LOW
    
    sender_type: Mapped[str] = mapped_column(String(50), nullable=False, default="SYSTEM")  # SYSTEM, FACULTY, ADMIN
    sender_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    
    recipient_type: Mapped[str] = mapped_column(String(50), nullable=False, default="ALL")  # ALL, ROLE, INSTITUTION, DEPARTMENT, PROGRAMME, SEMESTER, SUBJECT, INDIVIDUAL
    recipient_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    
    institution_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("institutions.id", ondelete="CASCADE"), nullable=True)
    department_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("departments.id", ondelete="CASCADE"), nullable=True)
    programme_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("programmes.id", ondelete="CASCADE"), nullable=True)
    semester_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("semesters.id", ondelete="CASCADE"), nullable=True)
    subject_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("subjects.id", ondelete="CASCADE"), nullable=True)
    
    scheduled_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    expires_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_by: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)

    # Relationships
    sender: Mapped[Optional["User"]] = relationship("User", foreign_keys=[sender_id])
    recipient: Mapped[Optional["User"]] = relationship("User", foreign_keys=[recipient_id])
    created_by_user: Mapped[Optional["User"]] = relationship("User", foreign_keys=[created_by])
    
    reads: Mapped[list["NotificationRead"]] = relationship("NotificationRead", back_populates="notification", cascade="all, delete-orphan")
    attachments: Mapped[list["NotificationAttachment"]] = relationship("NotificationAttachment", back_populates="notification", cascade="all, delete-orphan")

class NotificationRead(Base):
    __tablename__ = "notification_reads"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    notification_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("notifications.id", ondelete="CASCADE"), nullable=False, index=True)
    student_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    read_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(UTC), nullable=False)
    is_archived: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    is_deleted: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    is_starred: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    is_pinned: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    notification: Mapped["Notification"] = relationship("Notification", back_populates="reads")
    student: Mapped["User"] = relationship("User")

class NotificationSetting(Base, TimestampMixin):
    __tablename__ = "notification_settings"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    
    exam_notifications: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    result_notifications: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    assignment_notifications: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    faculty_notifications: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    learning_notifications: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    placement_notifications: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    announcement_notifications: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    email_notifications: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    browser_notifications: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    user: Mapped["User"] = relationship("User")

class NotificationAttachment(Base):
    __tablename__ = "notification_attachments"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    notification_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("notifications.id", ondelete="CASCADE"), nullable=False, index=True)
    file_name: Mapped[str] = mapped_column(String(255), nullable=False)
    file_url: Mapped[str] = mapped_column(Text, nullable=False)

    notification: Mapped["Notification"] = relationship("Notification", back_populates="attachments")
