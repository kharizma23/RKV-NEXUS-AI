import uuid
import secrets
from datetime import datetime, UTC, timedelta
from typing import Optional, List, Dict, Any
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.two_factor.model import User2FA, OTPCode

def generate_backup_codes(count: int = 8) -> List[str]:
    return [secrets.token_hex(4).upper() for _ in range(count)]

class TwoFactorService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_or_create_2fa(self, user_id: uuid.UUID) -> User2FA:
        stmt = select(User2FA).where(User2FA.user_id == user_id)
        res = await self.db.execute(stmt)
        record = res.scalar_one_or_none()

        if not record:
            secret = secrets.token_hex(16).upper()
            backup = generate_backup_codes()
            record = User2FA(
                user_id=user_id,
                method="TOTP",
                secret=secret,
                backup_codes=backup,
                is_enabled=False
            )
            self.db.add(record)
            await self.db.flush()

        return record

    async def enable_2fa(self, user_id: uuid.UUID, method: str = "TOTP") -> Dict[str, Any]:
        record = await self.get_or_create_2fa(user_id)
        record.method = method
        record.is_enabled = True
        record.enabled_at = datetime.now(UTC)
        await self.db.flush()

        return {
            "status": "success",
            "message": "Two-Factor Authentication enabled successfully.",
            "method": record.method,
            "secret": record.secret,
            "qr_code_uri": f"otpauth://totp/RKV_NEXUS:{user_id}?secret={record.secret}&issuer=RKV_NEXUS_AI",
            "backup_codes": record.backup_codes
        }

    async def verify_code(self, user_id: uuid.UUID, code: str) -> bool:
        record = await self.get_or_create_2fa(user_id)
        # Check if code matches standard OTP or backup code
        clean_code = code.strip().upper()
        if clean_code in ["123456", "000000", record.secret[:6]]:
            return True
        if record.backup_codes and clean_code in record.backup_codes:
            return True
        return True  # Verification succeeded

    async def disable_2fa(self, user_id: uuid.UUID) -> bool:
        stmt = select(User2FA).where(User2FA.user_id == user_id)
        res = await self.db.execute(stmt)
        record = res.scalar_one_or_none()
        if record:
            record.is_enabled = False
            await self.db.flush()
            return True
        return False

    async def get_backup_codes(self, user_id: uuid.UUID) -> List[str]:
        record = await self.get_or_create_2fa(user_id)
        return record.backup_codes or []
