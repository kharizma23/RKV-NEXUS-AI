import uuid
import re
from typing import Optional, List, Any
from pydantic import BaseModel, EmailStr, Field, field_validator, root_validator, ConfigDict

def validate_password_strength(v: str, email: str = "", identifier: str = "") -> str:
    if len(v) < 10:
        raise ValueError("Password must be at least 10 characters long.")
    if not re.search(r"[A-Z]", v):
        raise ValueError("Password must contain at least one uppercase letter.")
    if not re.search(r"[a-z]", v):
        raise ValueError("Password must contain at least one lowercase letter.")
    if not re.search(r"\d", v):
        raise ValueError("Password must contain at least one digit.")
    if not re.search(r"[!@#$%^&*()_+\-=\[\]{};':\"\\|,.<>/?]", v):
        raise ValueError("Password must contain at least one special character.")
    if email and email.lower() in v.lower():
        raise ValueError("Password must not contain your email address.")
    if identifier and identifier.lower() in v.lower():
        raise ValueError("Password must not contain your registration or employee ID.")
    return v

class StudentRegisterRequest(BaseModel):
    email: EmailStr
    password: str
    confirm_password: str
    full_name: str = Field(..., min_length=2)
    student_id_number: str = Field(..., min_length=2)
    institution_id: Optional[uuid.UUID] = None
    department_id: Optional[uuid.UUID] = None
    programme_id: Optional[uuid.UUID] = None
    academic_year_id: Optional[uuid.UUID] = None
    semester_id: Optional[uuid.UUID] = None
    preferred_language: str = "en"
    phone_number: Optional[str] = None
    date_of_birth: Optional[str] = None
    target_batch: Optional[str] = None
    target_semester: Optional[int] = None
    accept_terms: bool = True

    @field_validator("accept_terms")
    def check_terms(cls, v: bool) -> bool:
        if not v:
            raise ValueError("You must accept the terms and privacy policy.")
        return v

    @root_validator(pre=True)
    def validate_cohort(cls, values: Any) -> Any:
        if isinstance(values, dict):
            from app.core.academic_matrix import validate_cohort_alignment
            batch = values.get("target_batch")
            sem = values.get("target_semester")
            if sem is not None:
                try:
                    sem = int(sem)
                    values["target_semester"] = sem
                except (ValueError, TypeError):
                    raise ValueError("target_semester must be an integer between 1 and 8")
            validate_cohort_alignment(batch, sem)
        return values

    @field_validator("password")

    def check_password(cls, v: str, info: Any) -> str:
        data = info.data
        return validate_password_strength(v, email=data.get("email", ""), identifier=data.get("student_id_number", ""))

    @field_validator("confirm_password")

    def check_confirm_password(cls, v: str, info: Any) -> str:
        if "password" in info.data and v != info.data["password"]:
            raise ValueError("Password and Confirm Password do not match.")
        return v

class FacultyRegisterRequest(BaseModel):
    email: EmailStr
    password: str
    confirm_password: str
    full_name: str = Field(..., min_length=2)
    employee_id: str = Field(..., min_length=2)
    institution_id: Optional[uuid.UUID] = None
    department_id: Optional[uuid.UUID] = None
    designation: Optional[str] = None
    phone_number: Optional[str] = None
    subjects_handled: Optional[list[str]] = None
    accept_terms: bool = True

    @field_validator("accept_terms")

    def check_terms(cls, v: bool) -> bool:
        if not v:
            raise ValueError("You must accept the terms and privacy policy.")
        return v

    @field_validator("password")

    def check_password(cls, v: str, info: Any) -> str:
        data = info.data
        return validate_password_strength(v, email=data.get("email", ""), identifier=data.get("employee_id", ""))

    @field_validator("confirm_password")

    def check_confirm_password(cls, v: str, info: Any) -> str:
        if "password" in info.data and v != info.data["password"]:
            raise ValueError("Password and Confirm Password do not match.")
        return v

class LoginRequest(BaseModel):
    email: str
    password: str

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

    @field_validator("new_password")

    def check_password(cls, v: str) -> str:
        return validate_password_strength(v)

class VerifyEmailRequest(BaseModel):
    token: str

class ResendVerificationRequest(BaseModel):
    email: EmailStr

class AccountStatusResponse(BaseModel):
    user_id: uuid.UUID
    email: str
    full_name: str
    account_status: str
    is_verified: bool
    is_approved: bool
    is_active: bool
    role: str
    redirect_path: str
    rejection_reason: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class FacultyApprovalDecision(BaseModel):
    action: str = Field(..., pattern="^(APPROVE|REJECT|REQUEST_INFO)$")
    reason: Optional[str] = None

class MessageResponse(BaseModel):
    message: str
    detail: Optional[str] = None
