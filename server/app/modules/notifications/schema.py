import uuid
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field

# Notification Attachment Schema
class NotificationAttachmentCreate(BaseModel):
    file_name: str
    file_url: str

class NotificationAttachmentResponse(BaseModel):
    id: uuid.UUID
    file_name: str
    file_url: str

    class Config:
        from_attributes = True

# Notification Schema
class NotificationCreate(BaseModel):
    title: str = Field(..., max_length=255)
    message: str
    category: str  # ACADEMIC, EXAMINATION, RESULTS, FACULTY, LEARNING_PLAN, ASSIGNMENT, ANNOUNCEMENT, DISCUSSION, PLACEMENT, EVENTS
    priority: str = "MEDIUM"  # CRITICAL, HIGH, MEDIUM, LOW
    recipient_type: str = "ALL"  # ALL, ROLE, INSTITUTION, DEPARTMENT, PROGRAMME, SEMESTER, SUBJECT, INDIVIDUAL
    recipient_id: Optional[uuid.UUID] = None
    institution_id: Optional[uuid.UUID] = None
    department_id: Optional[uuid.UUID] = None
    programme_id: Optional[uuid.UUID] = None
    semester_id: Optional[uuid.UUID] = None
    subject_id: Optional[uuid.UUID] = None
    scheduled_at: Optional[datetime] = None
    expires_at: Optional[datetime] = None
    attachments: Optional[list[NotificationAttachmentCreate]] = []

class NotificationResponse(BaseModel):
    id: uuid.UUID
    title: str
    message: str
    category: str
    priority: str
    sender_type: str
    sender_id: Optional[uuid.UUID]
    recipient_type: str
    recipient_id: Optional[uuid.UUID]
    institution_id: Optional[uuid.UUID]
    department_id: Optional[uuid.UUID]
    programme_id: Optional[uuid.UUID]
    semester_id: Optional[uuid.UUID]
    subject_id: Optional[uuid.UUID]
    scheduled_at: Optional[datetime]
    expires_at: Optional[datetime]
    is_active: bool
    created_by: Optional[uuid.UUID]
    created_at: datetime
    updated_at: datetime
    attachments: list[NotificationAttachmentResponse] = []
    is_read: Optional[bool] = False
    is_starred: Optional[bool] = False
    is_pinned: Optional[bool] = False

    class Config:
        from_attributes = True

# Notification Settings
class NotificationSettingsResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    exam_notifications: bool
    result_notifications: bool
    assignment_notifications: bool
    faculty_notifications: bool
    learning_notifications: bool
    placement_notifications: bool
    announcement_notifications: bool
    email_notifications: bool
    browser_notifications: bool

    class Config:
        from_attributes = True

class NotificationSettingsUpdate(BaseModel):
    exam_notifications: Optional[bool] = None
    result_notifications: Optional[bool] = None
    assignment_notifications: Optional[bool] = None
    faculty_notifications: Optional[bool] = None
    learning_notifications: Optional[bool] = None
    placement_notifications: Optional[bool] = None
    announcement_notifications: Optional[bool] = None
    email_notifications: Optional[bool] = None
    browser_notifications: Optional[bool] = None

# Notification Analytics
class StudentSummary(BaseModel):
    id: uuid.UUID
    full_name: str
    email: str

class NotificationAnalyticsResponse(BaseModel):
    delivered_count: int
    read_count: int
    unread_count: int
    read_percentage: float
    unread_students: list[StudentSummary]

# AI Daily Summary
class UpcomingDeadlineInfo(BaseModel):
    title: str
    due_at: datetime
    days_left: int

class DailyAISummaryResponse(BaseModel):
    assignments_completed: int
    hours_studied: float
    exam_readiness: int  # percentage
    weak_topics: list[str]
    recommended_practice: list[str]
    upcoming_deadlines: list[UpcomingDeadlineInfo]
