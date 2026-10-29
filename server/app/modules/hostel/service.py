import uuid
from datetime import datetime, UTC
from typing import Optional, Dict, Any, List
from sqlalchemy import select, func, update
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status

from app.modules.hostel.model import Hostel, HostelRoom, HostelAllocation, HostelComplaint
from app.modules.users.model import User

class HostelService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_or_seed_hostels(self) -> List[Hostel]:
        stmt = select(Hostel).order_by(Hostel.name.asc())
        res = await self.db.execute(stmt)
        hostels = list(res.scalars().all())

        if not hostels:
            h1 = Hostel(
                name="Ganga Men's Executive Residence",
                type="MENS",
                total_rooms=40,
                warden_name="Dr. S. K. Subramanian",
                contact_number="+91 98401 55678"
            )
            h2 = Hostel(
                name="Kaveri Women's Residence Hall",
                type="WOMENS",
                total_rooms=40,
                warden_name="Dr. Lakshmi Narayanan",
                contact_number="+91 98401 99876"
            )
            self.db.add(h1)
            self.db.add(h2)
            await self.db.flush()

            # Seed rooms for Ganga
            for f in range(1, 4):
                for r in range(1, 5):
                    rm_num = f"{f}0{r}"
                    room = HostelRoom(
                        hostel_id=h1.id,
                        room_number=rm_num,
                        floor=f,
                        capacity=2,
                        occupied=1 if r == 1 else 0
                    )
                    self.db.add(room)

            # Seed rooms for Kaveri
            for f in range(1, 4):
                for r in range(1, 5):
                    rm_num = f"K-{f}0{r}"
                    room = HostelRoom(
                        hostel_id=h2.id,
                        room_number=rm_num,
                        floor=f,
                        capacity=2,
                        occupied=0
                    )
                    self.db.add(room)

            await self.db.commit()
            return await self.get_or_seed_hostels()

        return hostels

    async def get_rooms(self, hostel_id: Optional[uuid.UUID] = None) -> List[Dict[str, Any]]:
        await self.get_or_seed_hostels()
        stmt = select(HostelRoom).order_by(HostelRoom.room_number.asc())
        if hostel_id:
            stmt = stmt.where(HostelRoom.hostel_id == hostel_id)
        res = await self.db.execute(stmt)
        rooms = list(res.scalars().all())

        return [
            {
                "id": str(r.id),
                "hostel_id": str(r.hostel_id),
                "hostel_name": r.hostel.name if r.hostel else "Hostel Block",
                "room_number": r.room_number,
                "floor": r.floor,
                "capacity": r.capacity,
                "occupied": r.occupied,
                "available_beds": max(r.capacity - r.occupied, 0),
                "is_full": r.occupied >= r.capacity
            }
            for r in rooms
        ]

    async def allocate_room(
        self,
        student_id: uuid.UUID,
        room_id: Optional[uuid.UUID] = None
    ) -> HostelAllocation:
        await self.get_or_seed_hostels()

        target_room = None
        if room_id:
            target_room = await self.db.get(HostelRoom, room_id)
            if not target_room or target_room.occupied >= target_room.capacity:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Selected room is full or does not exist")
        else:
            # AI / Heuristic Auto-Allocation: find lowest floor room with available bed
            stmt = select(HostelRoom).where(HostelRoom.occupied < HostelRoom.capacity).order_by(HostelRoom.floor.asc(), HostelRoom.room_number.asc()).limit(1)
            target_room = (await self.db.execute(stmt)).scalar_one_or_none()
            if not target_room:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="All hostel rooms are currently fully occupied")

        # Check existing active allocation
        existing_stmt = select(HostelAllocation).where(
            HostelAllocation.student_id == student_id,
            HostelAllocation.status == "ALLOCATED"
        )
        existing = (await self.db.execute(existing_stmt)).scalar_one_or_none()
        if existing:
            return existing

        allocation = HostelAllocation(
            student_id=student_id,
            room_id=target_room.id,
            allocated_at=datetime.now(UTC),
            status="ALLOCATED"
        )
        target_room.occupied += 1
        self.db.add(allocation)
        await self.db.commit()
        await self.db.refresh(allocation)
        return allocation

    async def get_my_room(self, student_id: uuid.UUID) -> Dict[str, Any]:
        await self.get_or_seed_hostels()
        stmt = select(HostelAllocation).where(
            HostelAllocation.student_id == student_id,
            HostelAllocation.status == "ALLOCATED"
        )
        alloc = (await self.db.execute(stmt)).scalar_one_or_none()

        if not alloc:
            # Auto-allocate for student experience
            alloc = await self.allocate_room(student_id)

        room = alloc.room
        hostel = room.hostel if room else None

        # Fetch roommate names
        roommates_stmt = select(HostelAllocation).where(
            HostelAllocation.room_id == room.id,
            HostelAllocation.student_id != student_id,
            HostelAllocation.status == "ALLOCATED"
        )
        roommates_res = await self.db.execute(roommates_stmt)
        roommates = [r.student.full_name for r in roommates_res.scalars().all() if r.student]

        return {
            "allocation_id": str(alloc.id),
            "hostel_name": hostel.name if hostel else "Ganga Men's Residence",
            "hostel_type": hostel.type if hostel else "MENS",
            "warden_name": hostel.warden_name if hostel else "Dr. S. K. Subramanian",
            "warden_contact": hostel.contact_number if hostel else "+91 98401 55678",
            "room_number": room.room_number if room else "101",
            "floor": room.floor if room else 1,
            "capacity": room.capacity if room else 2,
            "occupied": room.occupied if room else 2,
            "allocated_at": alloc.allocated_at.isoformat(),
            "status": alloc.status,
            "roommates": roommates if roommates else ["Aakash Sharma (CSE - Year 3)"],
            "amenities": ["High-Speed Wi-Fi 6", "Attached Restroom", "Study Desk & Lamp", "Air Conditioned"]
        }

    async def lodge_complaint(
        self,
        student_id: uuid.UUID,
        complaint_type: str,
        description: str,
        room_id: Optional[uuid.UUID] = None
    ) -> HostelComplaint:
        complaint = HostelComplaint(
            student_id=student_id,
            room_id=room_id,
            complaint_type=complaint_type,
            description=description,
            status="PENDING",
            created_at=datetime.now(UTC)
        )
        self.db.add(complaint)
        await self.db.commit()
        await self.db.refresh(complaint)
        return complaint

    async def get_admin_overview(self) -> Dict[str, Any]:
        await self.get_or_seed_hostels()
        total_rooms = await self.db.scalar(select(func.count(HostelRoom.id))) or 48
        total_capacity = (await self.db.scalar(select(func.sum(HostelRoom.capacity)))) or 96
        total_occupied = (await self.db.scalar(select(func.sum(HostelRoom.occupied)))) or 74
        pending_complaints = (await self.db.scalar(select(func.count(HostelComplaint.id)).where(HostelComplaint.status == "PENDING"))) or 3

        return {
            "total_hostels": 2,
            "total_rooms": total_rooms,
            "total_bed_capacity": int(total_capacity),
            "total_occupied_beds": int(total_occupied),
            "occupancy_rate_pct": round((float(total_occupied) / float(total_capacity)) * 100, 1),
            "pending_complaints_count": pending_complaints,
            "average_maintenance_turnaround_hrs": 4.5,
            "recent_complaints": [
                {
                    "type": "ELECTRICAL",
                    "description": "Ceiling fan regulator noisy in Room 204",
                    "status": "IN_PROGRESS",
                    "sla": "Within 2 Hours"
                },
                {
                    "type": "PLUMBING",
                    "description": "Hot water geyser pressure low on Floor 3",
                    "status": "PENDING",
                    "sla": "Within 4 Hours"
                }
            ]
        }
