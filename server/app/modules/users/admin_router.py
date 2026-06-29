import uuid
from datetime import datetime, timezone, UTC
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.dependencies import get_db, require_roles
from app.modules.users.model import User, FacultyProfile, StudentProfile, FacultyApprovalEvent
from app.modules.auth.repository import AuthRepository
from app.modules.audit.repository import AuditRepository
from app.modules.auth.schema import FacultyApprovalDecision, MessageResponse
from app.modules.users.schema import UserResponse

router = APIRouter(prefix="/admin", tags=["Administrator Management & Approvals"])

@router.get("/faculty-approvals")
async def list_faculty_approvals(
    status_filter: Optional[str] = None,
    current_user: User = Depends(require_roles(["ADMIN"])),
    db: AsyncSession = Depends(get_db)
):
    stmt = (
        select(User)
        .options(selectinload(User.faculty_profile))
        .join(FacultyProfile, User.id == FacultyProfile.user_id)
    )
    if status_filter:
        stmt = stmt.where(FacultyProfile.approval_status == status_filter)
    res = await db.execute(stmt)
    users = list(res.scalars().all())
    
    result = []
    for u in users:
        fp = u.faculty_profile
        result.append({
            "id": str(u.id),
            "user_id": str(u.id),
            "full_name": u.full_name,
            "email": u.email,
            "employee_id": fp.employee_id if fp else None,
            "designation": fp.designation if fp else None,
            "approval_status": fp.approval_status if fp else "PENDING_APPROVAL",
            "account_status": u.account_status,
            "is_verified": u.is_verified,
            "is_approved": u.is_approved,
            "created_at": u.created_at.isoformat() if u.created_at else None,
            "rejection_reason": fp.rejection_reason if fp else None
        })
    return result

@router.get("/faculty-approvals/{user_id}")
async def get_faculty_approval_detail(
    user_id: uuid.UUID,
    current_user: User = Depends(require_roles(["ADMIN"])),
    db: AsyncSession = Depends(get_db)
):
    stmt = (
        select(User)
        .options(selectinload(User.faculty_profile))
        .where(User.id == user_id)
    )
    res = await db.execute(stmt)
    user = res.scalar_one_or_none()
    if not user or not user.faculty_profile:
        raise HTTPException(status_code=404, detail="Faculty user not found")

    fp = user.faculty_profile
    return {
        "user_id": str(user.id),
        "full_name": user.full_name,
        "email": user.email,
        "employee_id": fp.employee_id,
        "designation": fp.designation,
        "phone_number": fp.phone_number,
        "subjects_handled": fp.subjects_handled,
        "approval_status": fp.approval_status,
        "account_status": user.account_status,
        "is_verified": user.is_verified,
        "is_approved": user.is_approved,
        "rejection_reason": fp.rejection_reason,
        "approved_at": fp.approved_at.isoformat() if fp.approved_at else None,
        "rejected_at": fp.rejected_at.isoformat() if fp.rejected_at else None,
    }

@router.post("/faculty-approvals/{user_id}/approve", response_model=MessageResponse)
async def approve_faculty(
    user_id: uuid.UUID,
    current_user: User = Depends(require_roles(["ADMIN"])),
    db: AsyncSession = Depends(get_db)
):
    stmt = (
        select(User)
        .options(selectinload(User.faculty_profile))
        .where(User.id == user_id)
    )
    res = await db.execute(stmt)
    user = res.scalar_one_or_none()
    if not user or not user.faculty_profile:
        raise HTTPException(status_code=404, detail="Faculty user not found")

    fp = user.faculty_profile
    prev_status = fp.approval_status
    fp.approval_status = "APPROVED"
    fp.approved_by = current_user.id
    fp.approved_at = datetime.now(UTC)
    user.is_approved = True
    user.is_verified = True
    user.account_status = "ACTIVE"

    event = FacultyApprovalEvent(
        faculty_user_id=user.id,
        action="APPROVE",
        previous_status=prev_status,
        new_status="APPROVED",
        administrator_id=current_user.id,
        reason="Approved by administrator"
    )
    db.add(event)

    audit = AuditRepository(db)
    await audit.create(
        action="FACULTY_APPROVED",
        resource="User",
        user_id=current_user.id,
        details={"target_user_id": str(user.id), "email": user.email}
    )
    await db.commit()
    return MessageResponse(message=f"Faculty account for {user.full_name} has been approved.")

@router.post("/faculty-approvals/{user_id}/reject", response_model=MessageResponse)
async def reject_faculty(
    user_id: uuid.UUID,
    payload: FacultyApprovalDecision,
    current_user: User = Depends(require_roles(["ADMIN"])),
    db: AsyncSession = Depends(get_db)
):
    if not payload.reason or len(payload.reason.strip()) == 0:
        raise HTTPException(status_code=400, detail="Rejection reason is mandatory when rejecting a faculty application.")

    stmt = (
        select(User)
        .options(selectinload(User.faculty_profile))
        .where(User.id == user_id)
    )
    res = await db.execute(stmt)
    user = res.scalar_one_or_none()
    if not user or not user.faculty_profile:
        raise HTTPException(status_code=404, detail="Faculty user not found")

    fp = user.faculty_profile
    prev_status = fp.approval_status
    fp.approval_status = "REJECTED"
    fp.rejected_by = current_user.id
    fp.rejected_at = datetime.now(UTC)
    fp.rejection_reason = payload.reason
    user.is_approved = False
    user.account_status = "REJECTED"

    event = FacultyApprovalEvent(
        faculty_user_id=user.id,
        action="REJECT",
        previous_status=prev_status,
        new_status="REJECTED",
        administrator_id=current_user.id,
        reason=payload.reason
    )
    db.add(event)

    audit = AuditRepository(db)
    await audit.create(
        action="FACULTY_REJECTED",
        resource="User",
        user_id=current_user.id,
        details={"target_user_id": str(user.id), "email": user.email, "reason": payload.reason}
    )
    await db.commit()
    return MessageResponse(message=f"Faculty application for {user.full_name} has been rejected.")

@router.post("/faculty-approvals/{user_id}/resend-verification", response_model=MessageResponse)
async def resend_faculty_verification(
    user_id: uuid.UUID,
    current_user: User = Depends(require_roles(["ADMIN"])),
    db: AsyncSession = Depends(get_db)
):
    stmt = (
        select(User)
        .options(selectinload(User.faculty_profile))
        .where(User.id == user_id)
    )
    res = await db.execute(stmt)
    user = res.scalar_one_or_none()
    if not user or not user.faculty_profile:
        raise HTTPException(status_code=404, detail="Faculty user not found")

    if user.is_verified:
        raise HTTPException(status_code=400, detail="Faculty email is already verified.")

    from app.modules.auth.service import AuthService
    from app.modules.auth.schema import ResendVerificationRequest
    service = AuthService(db)
    raw_token = await service.resend_verification(ResendVerificationRequest(email=user.email))

    return MessageResponse(
        message=f"Verification email resent to {user.full_name} successfully.",
        detail=f"Development verification token preview: {raw_token}"
    )

@router.get("/student-approvals")
async def list_student_approvals(
    status_filter: Optional[str] = None,
    current_user: User = Depends(require_roles(["ADMIN"])),
    db: AsyncSession = Depends(get_db)
):
    from sqlalchemy.orm import selectinload as sl
    stmt = (
        select(User)
        .options(sl(User.student_profile), sl(User.roles))
        .join(StudentProfile, User.id == StudentProfile.user_id)
    )
    if status_filter == "PENDING_APPROVAL":
        stmt = stmt.where(User.is_approved == False)
    elif status_filter == "APPROVED":
        stmt = stmt.where(User.is_approved == True)
    res = await db.execute(stmt)
    users = list(res.scalars().all())

    result = []
    for u in users:
        sp = u.student_profile
        approval_status = "APPROVED" if u.is_approved else "PENDING_APPROVAL"
        result.append({
            "user_id": str(u.id),
            "full_name": u.full_name,
            "email": u.email,
            "student_id_number": sp.student_id_number if sp else None,
            "approval_status": approval_status,
            "account_status": u.account_status,
            "is_verified": u.is_verified,
            "is_approved": u.is_approved,
            "created_at": u.created_at.isoformat() if u.created_at else None,
        })
    return result

@router.post("/student-approvals/{user_id}/approve", response_model=MessageResponse)
async def approve_student(
    user_id: uuid.UUID,
    current_user: User = Depends(require_roles(["ADMIN"])),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(User).options(selectinload(User.student_profile)).where(User.id == user_id)
    res = await db.execute(stmt)
    user = res.scalar_one_or_none()
    if not user or not user.student_profile:
        raise HTTPException(status_code=404, detail="Student user not found")

    user.is_approved = True
    if user.is_verified:
        user.account_status = "ACTIVE"

    audit = AuditRepository(db)
    await audit.create(
        action="STUDENT_APPROVED",
        resource="User",
        user_id=current_user.id,
        details={"target_user_id": str(user.id), "email": user.email}
    )
    await db.commit()
    return MessageResponse(message=f"Student account for {user.full_name} has been approved.")

@router.post("/student-approvals/{user_id}/reject", response_model=MessageResponse)
async def reject_student(
    user_id: uuid.UUID,
    payload: FacultyApprovalDecision,
    current_user: User = Depends(require_roles(["ADMIN"])),
    db: AsyncSession = Depends(get_db)
):
    if not payload.reason or len(payload.reason.strip()) == 0:
        raise HTTPException(status_code=400, detail="Rejection reason is required.")

    stmt = select(User).options(selectinload(User.student_profile)).where(User.id == user_id)
    res = await db.execute(stmt)
    user = res.scalar_one_or_none()
    if not user or not user.student_profile:
        raise HTTPException(status_code=404, detail="Student user not found")

    user.is_approved = False
    user.account_status = "REJECTED"

    audit = AuditRepository(db)
    await audit.create(
        action="STUDENT_REJECTED",
        resource="User",
        user_id=current_user.id,
        details={"target_user_id": str(user.id), "email": user.email, "reason": payload.reason}
    )
    await db.commit()
    return MessageResponse(message=f"Student application for {user.full_name} has been rejected.")

@router.get("/users", response_model=list[UserResponse])
async def list_users(
    current_user: User = Depends(require_roles(["ADMIN"])),
    db: AsyncSession = Depends(get_db)
):
    stmt = (
        select(User)
        .options(selectinload(User.roles), selectinload(User.student_profile), selectinload(User.faculty_profile))
    )
    res = await db.execute(stmt)
    return list(res.scalars().all())

@router.get("/students")
async def list_students(
    current_user: User = Depends(require_roles(["ADMIN"])),
    db: AsyncSession = Depends(get_db)
):
    stmt = (
        select(User)
        .options(selectinload(User.student_profile))
        .join(StudentProfile, User.id == StudentProfile.user_id)
    )
    res = await db.execute(stmt)
    users = list(res.scalars().all())

    result = []
    for u in users:
        sp = u.student_profile
        result.append({
            "user_id": str(u.id),
            "full_name": u.full_name,
            "email": u.email,
            "student_id_number": sp.student_id_number if sp else None,
            "account_status": u.account_status,
            "is_active": u.is_active,
            "is_verified": u.is_verified,
            "created_at": u.created_at.isoformat() if u.created_at else None
        })
    return result

@router.patch("/users/{user_id}/activate", response_model=MessageResponse)
async def activate_user(
    user_id: uuid.UUID,
    current_user: User = Depends(require_roles(["ADMIN"])),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(User).where(User.id == user_id)
    res = await db.execute(stmt)
    user = res.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.is_active = True
    user.account_status = "ACTIVE"
    await db.commit()
    return MessageResponse(message=f"User {user.email} has been activated.")

@router.patch("/users/{user_id}/deactivate", response_model=MessageResponse)
async def deactivate_user(
    user_id: uuid.UUID,
    current_user: User = Depends(require_roles(["ADMIN"])),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(User).where(User.id == user_id)
    res = await db.execute(stmt)
    user = res.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.is_active = False
    user.account_status = "INACTIVE"
    await db.commit()
    return MessageResponse(message=f"User {user.email} has been deactivated.")

@router.post("/users/{user_id}/unlock", response_model=MessageResponse)
async def unlock_user(
    user_id: uuid.UUID,
    current_user: User = Depends(require_roles(["ADMIN"])),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(User).where(User.id == user_id)
    res = await db.execute(stmt)
    user = res.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.failed_login_count = 0
    user.locked_until = None
    if user.account_status == "LOCKED":
        user.account_status = "ACTIVE" if (user.is_verified and user.is_approved) else "PENDING_APPROVAL"
    await db.commit()
    return MessageResponse(message=f"Lockout for user {user.email} has been cleared.")

@router.post("/users/{user_id}/revoke-sessions", response_model=MessageResponse)
async def revoke_sessions(
    user_id: uuid.UUID,
    current_user: User = Depends(require_roles(["ADMIN"])),
    db: AsyncSession = Depends(get_db)
):
    auth_repo = AuthRepository(db)
    await auth_repo.revoke_all_user_refresh_tokens(user_id)
    await db.commit()
    return MessageResponse(message=f"All active sessions for user ID {user_id} have been revoked.")
