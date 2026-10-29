import uuid
from typing import Optional, Dict, Any, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_db, get_current_user
from app.modules.users.model import User
from app.modules.skills.service import SkillMappingService

router = APIRouter(tags=["Industry Skill Mapping & Placement Readiness"])

@router.get("/skills/industry")
async def get_industry_skills(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = SkillMappingService(db)
    skills = await service.get_or_seed_industry_skills()
    return {
        "status": "success",
        "data": [
            {
                "id": str(s.id),
                "name": s.name,
                "category": s.category,
                "description": s.description
            }
            for s in skills
        ]
    }

@router.get("/student/skills/profile")
async def get_student_skill_profile(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = SkillMappingService(db)
    profile = await service.get_student_skill_profile(current_user.id)
    return {"status": "success", "data": profile}

@router.get("/student/skills/gaps")
async def get_student_skill_gaps(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = SkillMappingService(db)
    gaps = await service.get_student_skill_gaps(current_user.id)
    return {"status": "success", "data": gaps}

@router.get("/student/placement-readiness")
async def get_student_placement_readiness(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = SkillMappingService(db)
    readiness = await service.get_placement_readiness(current_user.id)
    return {"status": "success", "data": readiness}
