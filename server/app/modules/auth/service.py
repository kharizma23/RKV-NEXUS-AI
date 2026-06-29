import uuid
from typing import Optional, Tuple
from datetime import UTC, datetime, timedelta

from fastapi import Request, Response
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.exceptions import (
    AccountInactiveError,
    AccountLockedError,
    AuthenticationError,
    DuplicateResourceError,
    InvalidTokenError,
    ResourceNotFoundError,
)
from app.core.security import (
    create_access_token,
    create_refresh_token,
    hash_password,
    hash_token,
    verify_password,
)
from app.modules.audit.repository import AuditRepository
from app.modules.auth.repository import AuthRepository
from app.modules.auth.schema import (
    FacultyRegisterRequest,
    ForgotPasswordRequest,
    LoginRequest,
    ResetPasswordRequest,
    StudentRegisterRequest,
    VerifyEmailRequest,
    ResendVerificationRequest,
    AccountStatusResponse,
)
from sqlalchemy import select
from app.modules.roles.repository import RoleRepository
from app.modules.institutions.model import Institution, Department
from app.modules.academics.model import Programme
from app.modules.users.model import User, StudentProfile
from app.modules.users.repository import UserRepository

class AuthService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.user_repo = UserRepository(db)
        self.role_repo = RoleRepository(db)
        self.auth_repo = AuthRepository(db)
        self.audit_repo = AuditRepository(db)

    async def register_student(self, req: StudentRegisterRequest, ip_address: Optional[str] = None) -> tuple[User, str]:
        existing = await self.user_repo.get_by_email(req.email)
        if existing:
            raise DuplicateResourceError("User with this email already exists")

        if req.student_id_number:
            existing_stud_stmt = select(StudentProfile).where(StudentProfile.student_id_number == req.student_id_number.strip())
            existing_stud_res = await self.db.execute(existing_stud_stmt)
            if existing_stud_res.scalar_one_or_none():
                raise DuplicateResourceError("Student with this registration / roll number already exists")

        if req.institution_id:
            inst_stmt = select(Institution).where(Institution.id == req.institution_id, Institution.is_active == True)
            inst_res = await self.db.execute(inst_stmt)
            if not inst_res.scalar_one_or_none():
                raise ResourceNotFoundError("Selected institution is invalid or inactive")

        if req.department_id:
            dept_stmt = select(Department).where(Department.id == req.department_id)
            if req.institution_id:
                dept_stmt = dept_stmt.where(Department.institution_id == req.institution_id)
            dept_res = await self.db.execute(dept_stmt)
            if not dept_res.scalar_one_or_none():
                raise ResourceNotFoundError("Selected department is invalid or does not belong to the selected institution")

        if req.programme_id:
            prog_stmt = select(Programme).where(Programme.id == req.programme_id, Programme.is_active == True)
            if req.institution_id:
                prog_stmt = prog_stmt.where(Programme.institution_id == req.institution_id)
            if req.department_id:
                prog_stmt = prog_stmt.where(Programme.department_id == req.department_id)
            prog_res = await self.db.execute(prog_stmt)
            if not prog_res.scalar_one_or_none():
                raise ResourceNotFoundError("Selected degree programme is invalid, inactive, or does not belong to the selected institution and department")


        student_role = await self.role_repo.get_by_name("STUDENT")
        if not student_role:
            raise ResourceNotFoundError("STUDENT role not configured in system")

        password_h = hash_password(req.password)
        user = await self.user_repo.create_user(
            email=req.email,
            password_hash=password_h,
            full_name=req.full_name,
            is_verified=False,
            is_approved=True
        )
        user.account_status = "PENDING_EMAIL_VERIFICATION"
        await self.user_repo.add_role(user, student_role)
        await self.user_repo.create_student_profile(
            user_id=user.id,
            student_id_number=req.student_id_number,
            institution_id=req.institution_id,
            department_id=req.department_id,
            programme_id=req.programme_id,
            academic_year_id=req.academic_year_id,
            semester_id=req.semester_id,
            preferred_language=req.preferred_language,
            phone_number=req.phone_number,
            date_of_birth=req.date_of_birth,
            target_batch=req.target_batch,
            target_semester=req.target_semester
        )

        raw_verify_token = f"vfy_{uuid.uuid4().hex}"
        hashed_verify_token = hash_token(raw_verify_token)
        expires_at = datetime.now(UTC) + timedelta(hours=24)
        await self.auth_repo.create_email_verification_token(user.id, hashed_verify_token, expires_at)

        await self.audit_repo.create(
            action="STUDENT_REGISTERED",
            resource="User",
            user_id=user.id,
            ip_address=ip_address
        )
        await self.db.commit()
        ret = await self.user_repo.get_by_id(user.id)
        assert ret is not None
        return ret, raw_verify_token

    async def register_faculty(self, req: FacultyRegisterRequest, ip_address: Optional[str] = None) -> tuple[User, str]:
        existing = await self.user_repo.get_by_email(req.email)
        if existing:
            raise DuplicateResourceError("User with this email already exists")

        user = await self.user_repo.create_user(
            email=req.email,
            password_hash=hash_password(req.password),
            full_name=req.full_name,
            is_verified=False,
            is_approved=False
        )
        user.account_status = "PENDING_APPROVAL"


        faculty_role = await self.role_repo.get_by_name("FACULTY")
        if faculty_role:
            await self.user_repo.add_role(user, faculty_role)

        await self.user_repo.create_faculty_profile(
            user_id=user.id,
            employee_id=req.employee_id,
            designation=req.designation,
            institution_id=req.institution_id,
            department_id=req.department_id,
            phone_number=req.phone_number,
            subjects_handled=req.subjects_handled
        )

        raw_verify_token = f"vfy_{uuid.uuid4().hex}"
        hashed_verify_token = hash_token(raw_verify_token)
        expires_at = datetime.now(UTC) + timedelta(hours=24)
        await self.auth_repo.create_email_verification_token(user.id, hashed_verify_token, expires_at)

        await self.audit_repo.create(
            action="FACULTY_REGISTERED_PENDING_APPROVAL",
            resource="User",
            user_id=user.id,
            ip_address=ip_address
        )
        await self.db.commit()
        ret = await self.user_repo.get_by_id(user.id)
        assert ret is not None
        return ret, raw_verify_token

    async def login(self, req: LoginRequest, response: Response, request: Request) -> tuple[User, str, str, str, str]:
        ip = request.client.host if request.client else None
        user_agent = request.headers.get("user-agent")

        user = await self.user_repo.get_by_email(req.email)
        if not user:
            await self.auth_repo.record_login_attempt(req.email, success=False, ip_address=ip)
            await self.db.commit()
            raise AuthenticationError("Invalid email or password")

        now_utc = datetime.now(UTC)
        if user.locked_until:
            locked_until_utc = user.locked_until.replace(tzinfo=UTC) if user.locked_until.tzinfo is None else user.locked_until
            if locked_until_utc > now_utc:
                raise AccountLockedError("Account temporarily locked due to failed login attempts. Contact Administrator or try again later.")
            else:
                user.locked_until = None
                user.failed_login_count = 0
                if user.account_status == "LOCKED":
                    user.account_status = "ACTIVE" if (user.is_verified and user.is_approved) else "PENDING_APPROVAL"

        if not verify_password(req.password, user.password_hash):
            user.failed_login_count += 1
            if user.failed_login_count >= 5:
                user.locked_until = now_utc + timedelta(minutes=15)
                user.account_status = "LOCKED"
                await self.audit_repo.create(
                    action="USER_ACCOUNT_LOCKED",
                    resource="User",
                    user_id=user.id,
                    details={"email": req.email, "failed_attempts": user.failed_login_count},
                    ip_address=ip
                )
            await self.auth_repo.record_login_attempt(req.email, success=False, ip_address=ip)
            await self.db.commit()
            raise AuthenticationError("Invalid email or password")

        if not user.is_verified:
            raise AuthenticationError("Email is not verified. Please verify your email before logging in.")

        if user.faculty_profile and user.faculty_profile.approval_status == "REJECTED":
            reason = user.faculty_profile.rejection_reason or "Registration rejected by administrator."
            raise AuthenticationError(f"Faculty registration rejected: {reason}")

        if not user.is_approved or user.account_status == "PENDING_APPROVAL":
            raise AuthenticationError("Account registration is pending administrator approval.")

        if not user.is_active or user.account_status == "INACTIVE":
            raise AccountInactiveError("Account is inactive. Please contact Administrator.")

        # Successful login reset
        user.failed_login_count = 0
        user.locked_until = None
        user.last_login_at = now_utc

        await self.auth_repo.record_login_attempt(req.email, success=True, ip_address=ip)

        roles = [r.name for r in user.roles]
        primary_role = roles[0] if roles else "STUDENT"
        redirect_path = "/admin/dashboard" if "ADMIN" in roles else ("/faculty/dashboard" if "FACULTY" in roles else "/student/dashboard")

        permissions = []
        for r in user.roles:
            permissions.extend([p.code for p in r.permissions])

        access_token = create_access_token(subject=str(user.id), roles=roles, permissions=permissions)
        raw_refresh, hashed_refresh = create_refresh_token(subject=str(user.id))

        expires_at = now_utc + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
        await self.auth_repo.create_refresh_token(
            user_id=user.id,
            token_hash=hashed_refresh,
            expires_at=expires_at,
            user_agent=user_agent,
            ip_address=ip
        )

        await self.audit_repo.create(
            action="USER_LOGIN_SUCCESS",
            resource="User",
            user_id=user.id,
            details={"email": user.email, "roles": roles},
            ip_address=ip
        )
        await self.db.commit()

        self._set_auth_cookies(response, access_token, raw_refresh)
        return user, access_token, raw_refresh, primary_role, redirect_path

    async def verify_email(self, req: VerifyEmailRequest, ip_address: Optional[str] = None) -> str:
        hashed = hash_token(req.token)
        token_record = await self.auth_repo.get_email_verification_token(hashed)
        now_utc = datetime.now(UTC)
        if not token_record:
            raise InvalidTokenError("Email verification token is invalid")

        exp = token_record.expires_at
        if exp.tzinfo is None:
            exp = exp.replace(tzinfo=UTC)

        if exp < now_utc:
            raise InvalidTokenError("Email verification token is expired")

        user = await self.user_repo.get_by_id(token_record.user_id)
        if not user:
            raise ResourceNotFoundError("User not found")

        user.is_verified = True
        if user.is_approved:
            user.account_status = "ACTIVE"
        else:
            user.account_status = "PENDING_APPROVAL"

        await self.audit_repo.create(
            action="EMAIL_VERIFIED",
            resource="User",
            user_id=user.id,
            ip_address=ip_address
        )
        await self.db.commit()
        return user.account_status

    async def resend_verification(self, req: ResendVerificationRequest, ip_address: Optional[str] = None) -> str:
        user = await self.user_repo.get_by_email(req.email)
        if not user or user.is_verified:
            return "If an unverified account exists, a new verification link has been sent."

        raw_token = f"vfy_{uuid.uuid4().hex}"
        hashed = hash_token(raw_token)
        expires_at = datetime.now(UTC) + timedelta(hours=24)
        await self.auth_repo.create_email_verification_token(user.id, hashed, expires_at)
        await self.db.commit()
        return raw_token

    async def get_account_status(self, user_id: uuid.UUID) -> AccountStatusResponse:
        user = await self.user_repo.get_by_id(user_id)
        if not user:
            raise ResourceNotFoundError("User not found")

        roles = [r.name for r in user.roles]
        primary_role = roles[0] if roles else "STUDENT"
        redirect_path = "/admin/dashboard" if "ADMIN" in roles else ("/faculty/dashboard" if "FACULTY" in roles else "/student/dashboard")
        rejection_reason = user.faculty_profile.rejection_reason if user.faculty_profile else None

        return AccountStatusResponse(
            user_id=user.id,
            email=user.email,
            full_name=user.full_name,
            account_status=user.account_status,
            is_verified=user.is_verified,
            is_approved=user.is_approved,
            is_active=user.is_active,
            role=primary_role,
            redirect_path=redirect_path,
            rejection_reason=rejection_reason
        )

    async def refresh_tokens(self, request: Request, response: Response) -> tuple[str, str]:
        ip = request.client.host if request.client else None
        raw_refresh = request.cookies.get("refresh_token")
        if not raw_refresh:
            raise AuthenticationError("Refresh token missing from request cookies")

        hashed = hash_token(raw_refresh)
        stored_token = await self.auth_repo.get_refresh_token(hashed)
        now_utc = datetime.now(UTC)
        if not stored_token or stored_token.revoked_at:
            raise InvalidTokenError("Refresh token is invalid or revoked")
        
        token_expires = stored_token.expires_at
        if token_expires.tzinfo is None:
            token_expires = token_expires.replace(tzinfo=UTC)
            
        if token_expires < now_utc:
            raise InvalidTokenError("Refresh token is expired")

        await self.auth_repo.revoke_refresh_token(stored_token)

        user = await self.user_repo.get_by_id(stored_token.user_id)
        if not user or not user.is_active:
            raise AccountInactiveError("Associated user account is inactive or missing")

        roles = [r.name for r in user.roles]
        permissions = []
        for r in user.roles:
            permissions.extend([p.code for p in r.permissions])

        new_access_token = create_access_token(subject=str(user.id), roles=roles, permissions=permissions)
        new_raw_refresh, new_hashed_refresh = create_refresh_token(subject=str(user.id))

        new_expires_at = now_utc + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
        await self.auth_repo.create_refresh_token(
            user_id=user.id,
            token_hash=new_hashed_refresh,
            expires_at=new_expires_at,
            user_agent=request.headers.get("user-agent"),
            ip_address=ip
        )
        await self.db.commit()

        self._set_auth_cookies(response, new_access_token, new_raw_refresh)
        return new_access_token, new_raw_refresh

    async def logout(self, request: Request, response: Response, user_id: Optional[uuid.UUID] = None) -> None:
        raw_refresh = request.cookies.get("refresh_token")
        if raw_refresh:
            hashed = hash_token(raw_refresh)
            stored_token = await self.auth_repo.get_refresh_token(hashed)
            if stored_token:
                await self.auth_repo.revoke_refresh_token(stored_token)

        if user_id:
            await self.audit_repo.create(
                action="USER_LOGOUT",
                resource="User",
                user_id=user_id,
                ip_address=request.client.host if request.client else None
            )

        await self.db.commit()
        self._clear_auth_cookies(response)

    async def forgot_password(self, req: ForgotPasswordRequest, ip_address: Optional[str] = None) -> str:
        user = await self.user_repo.get_by_email(req.email)
        if not user:
            return "If an account exists with this email, a reset token has been generated."

        raw_token = f"rst_{uuid.uuid4().hex}"
        hashed = hash_token(raw_token)
        expires_at = datetime.now(UTC) + timedelta(hours=1)
        await self.auth_repo.create_password_reset_token(user.id, hashed, expires_at)
        
        await self.audit_repo.create(
            action="PASSWORD_RESET_REQUESTED",
            resource="User",
            user_id=user.id,
            ip_address=ip_address
        )
        await self.db.commit()
        return raw_token

    async def reset_password(self, req: ResetPasswordRequest, ip_address: Optional[str] = None) -> None:
        hashed = hash_token(req.token)
        reset_token = await self.auth_repo.get_password_reset_token(hashed)
        now_utc = datetime.now(UTC)
        if not reset_token or reset_token.used_at:
            raise InvalidTokenError("Password reset token is invalid or used")

        exp = reset_token.expires_at
        if exp.tzinfo is None:
            exp = exp.replace(tzinfo=UTC)

        if exp < now_utc:
            raise InvalidTokenError("Password reset token is expired")

        user = await self.user_repo.get_by_id(reset_token.user_id)
        if not user:
            raise ResourceNotFoundError("User not found")

        user.password_hash = hash_password(req.new_password)
        await self.auth_repo.mark_password_reset_used(reset_token)
        await self.auth_repo.revoke_all_user_refresh_tokens(user.id)

        await self.audit_repo.create(
            action="PASSWORD_RESET_COMPLETED",
            resource="User",
            user_id=user.id,
            ip_address=ip_address
        )
        await self.db.commit()

    def _set_auth_cookies(self, response: Response, access_token: str, refresh_token: str) -> None:
        response.set_cookie(
            key="access_token",
            value=access_token,
            httponly=True,
            secure=settings.COOKIE_SECURE,
            samesite=settings.COOKIE_SAMESITE,
            path=settings.API_V1_STR,
            max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
        )
        response.set_cookie(
            key="refresh_token",
            value=refresh_token,
            httponly=True,
            secure=settings.COOKIE_SECURE,
            samesite=settings.COOKIE_SAMESITE,
            path=f"{settings.API_V1_STR}/auth",
            max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 86400
        )

    def _clear_auth_cookies(self, response: Response) -> None:
        response.delete_cookie(key="access_token", path=settings.API_V1_STR)
        response.delete_cookie(key="refresh_token", path=f"{settings.API_V1_STR}/auth")
