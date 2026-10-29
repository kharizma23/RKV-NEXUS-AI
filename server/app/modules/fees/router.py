import uuid
from typing import Optional
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_db, get_current_user, require_roles
from app.modules.users.model import User
from app.modules.fees.service import FeeService

router = APIRouter(tags=["AI Fee Management & Defaulter Prediction"])

class FeePaymentRequest(BaseModel):
    fee_structure_id: uuid.UUID
    amount_paid: float
    payment_mode: Optional[str] = "UPI"

class SendReminderRequest(BaseModel):
    student_id: uuid.UUID
    fee_structure_id: uuid.UUID
    reminder_type: Optional[str] = "EMAIL"

@router.get("/fees/student")
async def get_student_fees(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = FeeService(db)
    fees = await service.get_student_fees(current_user.id)
    return {"status": "success", "data": fees}

@router.post("/fees/payment")
async def process_fee_payment(
    payload: FeePaymentRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = FeeService(db)
    payment = await service.process_payment(
        student_id=current_user.id,
        fee_structure_id=payload.fee_structure_id,
        amount_paid=payload.amount_paid,
        payment_mode=payload.payment_mode or "UPI"
    )
    return {
        "status": "success",
        "message": "Fee payment processed successfully",
        "data": {
            "payment_id": str(payment.id),
            "transaction_id": payment.transaction_id,
            "receipt_number": payment.receipt_number,
            "amount_paid": payment.amount_paid,
            "status": payment.status
        }
    }

@router.get("/admin/fees/defaulters")
@router.get("/fees/admin/defaulters")
async def get_fee_defaulters(
    current_user: User = Depends(require_roles(["ADMIN"])),
    db: AsyncSession = Depends(get_db)
):
    service = FeeService(db)
    defaulters = await service.predict_defaulters()
    return {"status": "success", "data": defaulters}

@router.post("/admin/fees/reminder")
@router.post("/fees/admin/reminder")
async def send_fee_reminder(
    payload: SendReminderRequest,
    current_user: User = Depends(require_roles(["ADMIN"])),
    db: AsyncSession = Depends(get_db)
):
    service = FeeService(db)
    reminder = await service.send_reminder(
        student_id=payload.student_id,
        fee_structure_id=payload.fee_structure_id,
        reminder_type=payload.reminder_type or "EMAIL"
    )
    return {
        "status": "success",
        "message": "Automated fee reminder dispatched",
        "data": {
            "reminder_id": str(reminder.id),
            "status": reminder.status,
            "sent_at": reminder.sent_at.isoformat()
        }
    }

@router.get("/admin/fees/analytics")
@router.get("/fees/admin/analytics")
async def get_fee_analytics(
    current_user: User = Depends(require_roles(["ADMIN"])),
    db: AsyncSession = Depends(get_db)
):
    service = FeeService(db)
    analytics = await service.get_fee_analytics()
    return {"status": "success", "data": analytics}
