import uuid
from typing import Any

from fastapi import Request, status
from fastapi.responses import JSONResponse


class BaseAppException(Exception):
    def __init__(
        self,
        code: str,
        message: str,
        status_code: int = status.HTTP_400_BAD_REQUEST,
        details: Any | None = None
    ):
        self.code = code
        self.message = message
        self.status_code = status_code
        self.details = details
        super().__init__(message)

class AuthenticationError(BaseAppException):
    def __init__(self, message: str = "Invalid credentials or unauthenticated", details: Any | None = None):
        super().__init__(
            code="AUTHENTICATION_FAILED",
            message=message,
            status_code=status.HTTP_401_UNAUTHORIZED,
            details=details
        )

class PermissionDeniedError(BaseAppException):
    def __init__(self, message: str = "Permission denied", details: Any | None = None):
        super().__init__(
            code="PERMISSION_DENIED",
            message=message,
            status_code=status.HTTP_403_FORBIDDEN,
            details=details
        )

class AccountLockedError(BaseAppException):
    def __init__(self, message: str = "Account locked due to multiple failed login attempts", details: Any | None = None):
        super().__init__(
            code="ACCOUNT_LOCKED",
            message=message,
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            details=details
        )

class AccountPendingApprovalError(BaseAppException):
    def __init__(self, message: str = "Faculty account is pending administrator approval", details: Any | None = None):
        super().__init__(
            code="ACCOUNT_PENDING_APPROVAL",
            message=message,
            status_code=status.HTTP_403_FORBIDDEN,
            details=details
        )

class AccountInactiveError(BaseAppException):
    def __init__(self, message: str = "Account is inactive", details: Any | None = None):
        super().__init__(
            code="ACCOUNT_INACTIVE",
            message=message,
            status_code=status.HTTP_403_FORBIDDEN,
            details=details
        )

class ResourceNotFoundError(BaseAppException):
    def __init__(self, resource: str = "Resource", details: Any | None = None):
        super().__init__(
            code="RESOURCE_NOT_FOUND",
            message=f"{resource} not found",
            status_code=status.HTTP_404_NOT_FOUND,
            details=details
        )

class DuplicateResourceError(BaseAppException):
    def __init__(self, message: str = "Resource already exists", details: Any | None = None):
        super().__init__(
            code="DUPLICATE_RESOURCE",
            message=message,
            status_code=status.HTTP_409_CONFLICT,
            details=details
        )

class InvalidTokenError(BaseAppException):
    def __init__(self, message: str = "Invalid or expired token", details: Any | None = None):
        super().__init__(
            code="INVALID_TOKEN",
            message=message,
            status_code=status.HTTP_401_UNAUTHORIZED,
            details=details
        )

async def app_exception_handler(request: Request, exc: BaseAppException) -> JSONResponse:
    request_id = getattr(request.state, "request_id", str(uuid.uuid4()))
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "code": exc.code,
            "message": exc.message,
            "details": exc.details,
            "request_id": request_id
        }
    )

async def general_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    request_id = getattr(request.state, "request_id", str(uuid.uuid4()))
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "code": "INTERNAL_SERVER_ERROR",
            "message": "An internal server error occurred.",
            "details": None,
            "request_id": request_id
        }
    )
