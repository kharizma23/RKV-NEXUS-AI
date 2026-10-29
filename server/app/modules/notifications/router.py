import uuid
import json
import csv
import io
import asyncio
from typing import List, Optional
from fastapi import APIRouter, Depends, status, Query, UploadFile, File, Response
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.dependencies import get_db, get_current_user, require_roles
from app.modules.users.model import User
from app.modules.notifications.repository import NotificationRepository
from app.modules.notifications.service import NotificationService, broadcaster
from app.modules.audit.repository import AuditRepository
from app.modules.notifications.schema import (
    NotificationResponse, NotificationCreate,
    NotificationSettingsResponse, NotificationSettingsUpdate,
    NotificationAnalyticsResponse, DailyAISummaryResponse
)

router = APIRouter(prefix="/notifications", tags=["Notification Engine"])

@router.get("", response_model=list[NotificationResponse])
async def list_notifications(
    read: Optional[str] = Query(None, description="read, unread, important, or None for all"),
    archive: Optional[str] = Query(None, description="archived, or None to exclude"),
    category: Optional[str] = Query(None),
    priority: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    date_filter: Optional[str] = Query(None, description="today, yesterday, last_7_days, last_30_days"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    repo = NotificationRepository(db)
    
    # Check if student
    is_student = any(role.name == "STUDENT" for role in current_user.roles)
    if is_student:
        filters = {
            "read": read,
            "archive": archive,
            "category": category,
            "priority": priority,
            "search": search,
            "date_filter": date_filter
        }
        return await repo.get_student_notifications(current_user.id, filters)
    else:
        # Admin or Faculty view their sent items
        role_name = "ADMIN" if any(role.name == "ADMIN" for role in current_user.roles) else "FACULTY"
        return await repo.get_created_notifications(current_user.id, role_name)

@router.post("/broadcast", response_model=NotificationResponse, status_code=status.HTTP_201_CREATED)
async def broadcast_notification(
    payload: NotificationCreate,
    current_user: User = Depends(require_roles(["ADMIN", "FACULTY"])),
    db: AsyncSession = Depends(get_db)
):
    service = NotificationService(db)
    audit_repo = AuditRepository(db)
    
    is_admin = any(role.name == "ADMIN" for role in current_user.roles)

    attachments_dict = []
    if payload.attachments:
        attachments_dict = [a.model_dump() for a in payload.attachments]

    notif = await service.broadcast_notification(
        title=payload.title,
        message=payload.message,
        category=payload.category,
        priority=payload.priority,
        sender_type="FACULTY" if not is_admin else "ADMIN",
        sender_id=current_user.id,
        recipient_type=payload.recipient_type,
        recipient_id=payload.recipient_id,
        institution_id=payload.institution_id,
        department_id=payload.department_id,
        programme_id=payload.programme_id,
        semester_id=payload.semester_id,
        subject_id=payload.subject_id,
        scheduled_at=payload.scheduled_at,
        expires_at=payload.expires_at,
        created_by=current_user.id,
        attachments=attachments_dict
    )
    
    # Create audit log
    await audit_repo.create(
        action="CREATE_NOTIFICATION",
        resource="notifications",
        user_id=current_user.id,
        details={
            "notification_id": str(notif.id),
            "title": notif.title,
            "recipient_type": notif.recipient_type,
            "category": notif.category
        }
    )
    await db.commit()
    return notif

from pydantic import BaseModel

class FeedbackNotificationRequest(BaseModel):
    title: Optional[str] = "Counterfactual AI Learning Feedback"
    message: str
    counterfactual_feedback: Optional[str] = None
    question_text: Optional[str] = None
    answer_id: Optional[uuid.UUID] = None

@router.post("/send-feedback/{student_id}", status_code=status.HTTP_200_OK)
async def send_feedback_to_student(
    student_id: uuid.UUID,
    payload: FeedbackNotificationRequest,
    current_user: User = Depends(require_roles(["ADMIN", "FACULTY"])),
    db: AsyncSession = Depends(get_db)
):
    service = NotificationService(db)
    from app.modules.users.model import StudentProfile
    from sqlalchemy import select
    res = await db.execute(select(StudentProfile.user_id).where(StudentProfile.id == student_id))
    found_user_id = res.scalar_one_or_none()
    target_user_id = found_user_id if found_user_id else student_id

    content = payload.message
    if payload.counterfactual_feedback:
        content += f"\n\n✦ Counterfactual Guidance:\n{payload.counterfactual_feedback}"

    notif = await service.broadcast_notification(
        title=payload.title or "Counterfactual AI Learning Feedback",
        message=content,
        category="ACADEMIC",
        priority="HIGH",
        sender_type="ADMIN" if any(role.name == "ADMIN" for role in (current_user.roles or [])) else "FACULTY",
        sender_id=current_user.id,
        recipient_type="INDIVIDUAL",
        recipient_id=target_user_id,
        created_by=current_user.id
    )
    await db.commit()
    return {
        "status": "success",
        "message": "Feedback successfully dispatched to student dashboard notification queue.",
        "notification_id": str(notif.id),
        "student_id": str(student_id)
    }

@router.post("/bulk-upload", status_code=status.HTTP_201_CREATED)
async def bulk_upload_notifications(
    file: UploadFile = File(...),
    current_user: User = Depends(require_roles(["ADMIN"])),
    db: AsyncSession = Depends(get_db)
):
    service = NotificationService(db)
    audit_repo = AuditRepository(db)
    contents = await file.read()
    buffer = io.StringIO(contents.decode("utf-8"))
    reader = csv.DictReader(buffer)

    count = 0
    for row in reader:
        recipient_id = uuid.UUID(row["recipient_id"]) if row.get("recipient_id") else None
        institution_id = uuid.UUID(row["institution_id"]) if row.get("institution_id") else None
        department_id = uuid.UUID(row["department_id"]) if row.get("department_id") else None
        programme_id = uuid.UUID(row["programme_id"]) if row.get("programme_id") else None
        semester_id = uuid.UUID(row["semester_id"]) if row.get("semester_id") else None
        subject_id = uuid.UUID(row["subject_id"]) if row.get("subject_id") else None

        await service.broadcast_notification(
            title=row["title"],
            message=row["message"],
            category=row.get("category", "ANNOUNCEMENT"),
            priority=row.get("priority", "MEDIUM"),
            sender_type="ADMIN",
            sender_id=current_user.id,
            recipient_type=row.get("recipient_type", "ALL"),
            recipient_id=recipient_id,
            institution_id=institution_id,
            department_id=department_id,
            programme_id=programme_id,
            semester_id=semester_id,
            subject_id=subject_id,
            created_by=current_user.id
        )
        count += 1

    await audit_repo.create(
        action="BULK_UPLOAD_NOTIFICATIONS",
        resource="notifications",
        user_id=current_user.id,
        details={"upload_count": count}
    )
    await db.commit()
    return {"message": f"Successfully scheduled {count} notifications."}

@router.patch("/{notif_id}/read", status_code=status.HTTP_200_OK)
async def mark_read(
    notif_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    repo = NotificationRepository(db)
    audit_repo = AuditRepository(db)
    await repo.mark_as_read(current_user.id, notif_id)
    
    await audit_repo.create(
        action="MARK_NOTIFICATION_READ",
        resource="notifications",
        user_id=current_user.id,
        details={"notification_id": str(notif_id)}
    )
    await db.commit()
    return {"status": "success"}

@router.patch("/read-all", status_code=status.HTTP_200_OK)
async def mark_all_read(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    repo = NotificationRepository(db)
    audit_repo = AuditRepository(db)
    count = await repo.mark_all_read(current_user.id)
    
    await audit_repo.create(
        action="MARK_ALL_NOTIFICATIONS_READ",
        resource="notifications",
        user_id=current_user.id,
        details={"marked_count": count}
    )
    await db.commit()
    return {"status": "success", "marked_count": count}

@router.patch("/{notif_id}/archive", status_code=status.HTTP_200_OK)
async def archive_notification(
    notif_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    repo = NotificationRepository(db)
    audit_repo = AuditRepository(db)
    await repo.archive_notification(current_user.id, notif_id)
    
    await audit_repo.create(
        action="ARCHIVE_NOTIFICATION",
        resource="notifications",
        user_id=current_user.id,
        details={"notification_id": str(notif_id)}
    )
    await db.commit()
    return {"status": "success"}

@router.patch("/{notif_id}/star", status_code=status.HTTP_200_OK)
async def toggle_star(
    notif_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    repo = NotificationRepository(db)
    audit_repo = AuditRepository(db)
    starred = await repo.toggle_star(current_user.id, notif_id)
    
    await audit_repo.create(
        action="TOGGLE_STAR_NOTIFICATION",
        resource="notifications",
        user_id=current_user.id,
        details={"notification_id": str(notif_id), "is_starred": starred}
    )
    await db.commit()
    return {"status": "success", "is_starred": starred}

@router.patch("/{notif_id}/pin", status_code=status.HTTP_200_OK)
async def toggle_pin(
    notif_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    repo = NotificationRepository(db)
    audit_repo = AuditRepository(db)
    pinned = await repo.toggle_pin(current_user.id, notif_id)
    
    await audit_repo.create(
        action="TOGGLE_PIN_NOTIFICATION",
        resource="notifications",
        user_id=current_user.id,
        details={"notification_id": str(notif_id), "is_pinned": pinned}
    )
    await db.commit()
    return {"status": "success", "is_pinned": pinned}

@router.delete("/{notif_id}", status_code=status.HTTP_200_OK)
async def delete_notification(
    notif_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    repo = NotificationRepository(db)
    audit_repo = AuditRepository(db)
    is_student = any(role.name == "STUDENT" for role in current_user.roles)
    if is_student:
        await repo.delete_notification_for_student(current_user.id, notif_id)
    else:
        notif = await repo.get_notification_by_id(notif_id)
        if not notif:
            return {"status": "not_found"}
        is_admin = any(role.name == "ADMIN" for role in current_user.roles)
        if not is_admin and notif.created_by != current_user.id:
            return Response(status_code=403, content="Permission denied")
        await repo.delete_notification_permanently(notif_id)
    
    await audit_repo.create(
        action="DELETE_NOTIFICATION",
        resource="notifications",
        user_id=current_user.id,
        details={"notification_id": str(notif_id)}
    )
    await db.commit()
    return {"status": "success"}

@router.get("/settings", response_model=NotificationSettingsResponse)
async def get_settings(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    repo = NotificationRepository(db)
    return await repo.get_or_create_settings(current_user.id)

@router.put("/settings", response_model=NotificationSettingsResponse)
async def update_settings(
    payload: NotificationSettingsUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    repo = NotificationRepository(db)
    audit_repo = AuditRepository(db)
    settings = await repo.update_settings(current_user.id, payload.model_dump(exclude_unset=True))
    
    await audit_repo.create(
        action="UPDATE_NOTIFICATION_SETTINGS",
        resource="notifications",
        user_id=current_user.id,
        details={"updated_fields": list(payload.model_dump(exclude_unset=True).keys())}
    )
    await db.commit()
    return settings

@router.get("/analytics/{notif_id}", response_model=NotificationAnalyticsResponse)
async def get_analytics(
    notif_id: uuid.UUID,
    current_user: User = Depends(require_roles(["ADMIN", "FACULTY"])),
    db: AsyncSession = Depends(get_db)
):
    repo = NotificationRepository(db)
    analytics = await repo.get_notification_analytics(notif_id)
    if not analytics:
        return Response(status_code=404, content="Analytics not found")
    return analytics

@router.get("/ai-summary", response_model=DailyAISummaryResponse)
async def get_ai_summary(
    current_user: User = Depends(require_roles(["STUDENT"])),
    db: AsyncSession = Depends(get_db)
):
    service = NotificationService(db)
    return await service.get_daily_ai_summary(current_user.id)

@router.post("/ai-trigger", status_code=status.HTTP_200_OK)
async def trigger_ai_assessment(
    current_user: User = Depends(require_roles(["STUDENT"])),
    db: AsyncSession = Depends(get_db)
):
    service = NotificationService(db)
    new_notifs = await service.run_ai_risk_detection_and_recommender(current_user.id)
    await db.commit()
    return {"message": f"Successfully generated {len(new_notifs)} AI notifications."}

@router.get("/stream")
async def stream_notifications(
    current_user: User = Depends(get_current_user)
):
    async def event_generator():
        queue = await broadcaster.subscribe(current_user.id)
        try:
            yield f"data: {json.dumps({'type': 'ping'})}\n\n"
            while True:
                data = await queue.get()
                yield f"data: {json.dumps(data)}\n\n"
        except asyncio.CancelledError:
            pass
        finally:
            broadcaster.unsubscribe(current_user.id, queue)

    return StreamingResponse(event_generator(), media_type="text/event-stream")

@router.get("/{notif_id}", response_model=NotificationResponse)
async def get_notification(
    notif_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    repo = NotificationRepository(db)
    notif = await repo.get_notification_by_id(notif_id)
    if not notif:
        return Response(status_code=404, content="Notification not found")
    
    # Annotate status
    from sqlalchemy import select, and_
    from app.modules.notifications.model import NotificationRead
    stmt = select(NotificationRead).where(
        and_(NotificationRead.notification_id == notif_id, NotificationRead.student_id == current_user.id)
    )
    res = await db.execute(stmt)
    read_obj = res.scalar_one_or_none()
    
    notif.is_read = read_obj is not None
    notif.is_archived = read_obj.is_archived if read_obj else False
    notif.is_starred = read_obj.is_starred if read_obj else False
    notif.is_pinned = read_obj.is_pinned if read_obj else False
    return notif
