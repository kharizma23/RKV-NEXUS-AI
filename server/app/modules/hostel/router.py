import uuid
from typing import Optional
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_db, get_current_user, require_roles
from app.modules.users.model import User
from app.modules.hostel.service import HostelService

router = APIRouter(tags=["AI-Powered Campus Hostel Management"])

class AllocateRoomRequest(BaseModel):
    student_id: Optional[uuid.UUID] = None
    room_id: Optional[uuid.UUID] = None

class LodgeComplaintRequest(BaseModel):
    complaint_type: str = "MAINTENANCE"
    description: str
    room_id: Optional[uuid.UUID] = None

@router.get("/hostel/rooms")
async def get_hostel_rooms(
    hostel_id: Optional[uuid.UUID] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = HostelService(db)
    rooms = await service.get_rooms(hostel_id)
    return {"status": "success", "data": rooms}

@router.post("/hostel/allocate")
async def allocate_hostel_room(
    payload: Optional[AllocateRoomRequest] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = HostelService(db)
    # If admin allocates for a student, use payload student_id, else current_user
    user_roles = [r.name for r in current_user.roles]
    target_student_id = (payload.student_id if (payload and payload.student_id and "ADMIN" in user_roles) else current_user.id)
    room_id = payload.room_id if payload else None

    allocation = await service.allocate_room(target_student_id, room_id)
    return {
        "status": "success",
        "message": "Hostel room allocated successfully",
        "data": {
            "allocation_id": str(allocation.id),
            "room_id": str(allocation.room_id),
            "status": allocation.status
        }
    }

@router.get("/hostel/my-room")
async def get_my_room(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = HostelService(db)
    my_room = await service.get_my_room(current_user.id)
    return {"status": "success", "data": my_room}

@router.post("/hostel/complaint")
async def lodge_hostel_complaint(
    payload: LodgeComplaintRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = HostelService(db)
    complaint = await service.lodge_complaint(
        student_id=current_user.id,
        complaint_type=payload.complaint_type,
        description=payload.description,
        room_id=payload.room_id
    )
    return {
        "status": "success",
        "message": "Hostel complaint registered with automated SLA tracking",
        "data": {
            "complaint_id": str(complaint.id),
            "status": complaint.status,
            "created_at": complaint.created_at.isoformat()
        }
    }

@router.get("/admin/hostel/overview")
@router.get("/hostel/admin/overview")
async def get_hostel_admin_overview(
    current_user: User = Depends(require_roles(["ADMIN", "FACULTY"])),
    db: AsyncSession = Depends(get_db)
):
    service = HostelService(db)
    overview = await service.get_admin_overview()
    return {"status": "success", "data": overview}
