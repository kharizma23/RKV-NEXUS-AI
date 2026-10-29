import uuid
from typing import Optional, Dict, Any, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_db, get_current_user
from app.modules.users.model import User
from app.modules.knowledge_graph.service import KnowledgeGraphService

router = APIRouter(tags=["Curriculum Knowledge Graph"])

@router.get("/knowledge-graph/subject/{subject_id}")
async def get_subject_knowledge_graph(
    subject_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = KnowledgeGraphService(db)
    graph = await service.get_or_seed_subject_graph(subject_id)
    return {"status": "success", "data": graph}

@router.get("/student/knowledge-graph/gaps")
async def get_student_knowledge_gaps(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = KnowledgeGraphService(db)
    gaps = await service.get_student_gaps(current_user.id)
    return {"status": "success", "data": gaps}

@router.get("/student/knowledge-graph/remedial-path")
async def get_student_remedial_path(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = KnowledgeGraphService(db)
    path = await service.get_remedial_path(current_user.id)
    return {"status": "success", "data": path}
