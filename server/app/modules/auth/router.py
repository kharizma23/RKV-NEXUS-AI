from fastapi import APIRouter, Depends, Request, Response, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_current_user, get_db
from app.modules.auth.schema import (
    FacultyRegisterRequest,
    ForgotPasswordRequest,
    LoginRequest,
    MessageResponse,
    ResetPasswordRequest,
    StudentRegisterRequest,
    VerifyEmailRequest,
    ResendVerificationRequest,
    AccountStatusResponse,
)
from app.modules.auth.service import AuthService
from app.modules.users.model import User
from app.modules.users.schema import UserResponse

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register/student", response_model=MessageResponse, status_code=status.HTTP_201_CREATED)
async def register_student(
    req: StudentRegisterRequest,
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    ip = request.client.host if request.client else None
    service = AuthService(db)
    user, raw_token = await service.register_student(req, ip_address=ip)
    return MessageResponse(
        message="Student account created successfully. Verify your email to activate your account.",
        detail=f"Development verification token preview: {raw_token}"
    )

@router.post("/register/faculty", response_model=MessageResponse, status_code=status.HTTP_201_CREATED)
async def register_faculty(
    req: FacultyRegisterRequest,
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    ip = request.client.host if request.client else None
    service = AuthService(db)
    user, raw_token = await service.register_faculty(req, ip_address=ip)
    return MessageResponse(
        message="Faculty registration submitted successfully. Your account will become available after administrator approval.",
        detail=f"Development verification token preview: {raw_token}"
    )

@router.post("/login")
async def login(
    req: LoginRequest,
    request: Request,
    response: Response,
    db: AsyncSession = Depends(get_db)
):
    service = AuthService(db)
    user, access_token, refresh_token, role, redirect_path = await service.login(req, response, request)
    user_roles = [r.name for r in user.roles] if user.roles else [role]
    return {
        "id": str(user.id),
        "user_id": str(user.id),
        "email": user.email,
        "access_token": access_token,
        "token": access_token,
        "full_name": user.full_name,
        "role": role,
        "roles": user_roles,
        "is_active": user.is_active,
        "is_verified": user.is_verified,
        "is_approved": user.is_approved,
        "redirect_path": redirect_path,
        "account_status": user.account_status,
        "student_profile": {
            "id": str(user.student_profile.id),
            "student_id_number": user.student_profile.student_id_number,
            "department_id": str(user.student_profile.department_id) if user.student_profile.department_id else None
        } if user.student_profile else None,
        "faculty_profile": {
            "id": str(user.faculty_profile.id),
            "employee_id": user.faculty_profile.employee_id,
            "designation": user.faculty_profile.designation,
            "department_id": str(user.faculty_profile.department_id) if user.faculty_profile.department_id else None
        } if user.faculty_profile else None,
        "message": "Login successful"
    }

@router.post("/resend-verification", response_model=MessageResponse)
async def resend_verification(
    req: ResendVerificationRequest,
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    ip = request.client.host if request.client else None
    service = AuthService(db)
    raw_token = await service.resend_verification(req, ip_address=ip)
    return MessageResponse(
        message="Verification email sent successfully.",
        detail=f"Development verification token preview: {raw_token}"
    )

@router.get("/account-status", response_model=AccountStatusResponse)
async def get_account_status(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = AuthService(db)
    return await service.get_account_status(current_user.id)

@router.post("/refresh")
async def refresh_tokens(
    request: Request,
    response: Response,
    db: AsyncSession = Depends(get_db)
):
    service = AuthService(db)
    new_access, _ = await service.refresh_tokens(request, response)
    return {
        "message": "Tokens successfully refreshed",
        "access_token": new_access,
        "token": new_access
    }

@router.post("/logout", response_model=MessageResponse)
async def logout(
    request: Request,
    response: Response,
    db: AsyncSession = Depends(get_db)
):
    service = AuthService(db)
    try:
        current_user = await get_current_user(request, None, db)
        user_id = current_user.id
    except Exception:
        user_id = None

    await service.logout(request, response, user_id=user_id)
    return MessageResponse(message="Successfully logged out")

@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.post("/forgot-password", response_model=MessageResponse)
async def forgot_password(
    req: ForgotPasswordRequest,
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    ip = request.client.host if request.client else None
    service = AuthService(db)
    raw_token = await service.forgot_password(req, ip_address=ip)
    return MessageResponse(
        message="If an account exists with this email, password reset instructions have been dispatched.",
        detail=f"Development token preview: {raw_token}"
    )

@router.post("/reset-password", response_model=MessageResponse)
async def reset_password(
    req: ResetPasswordRequest,
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    ip = request.client.host if request.client else None
    service = AuthService(db)
    await service.reset_password(req, ip_address=ip)
    return MessageResponse(message="Password successfully reset. You may now log in.")

@router.post("/verify-email", response_model=MessageResponse)
async def verify_email(
    req: VerifyEmailRequest,
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    ip = request.client.host if request.client else None
    service = AuthService(db)
    new_status = await service.verify_email(req, ip_address=ip)
    return MessageResponse(
        message="Email address verified successfully.",
        detail=f"Account status updated to: {new_status}"
    )
