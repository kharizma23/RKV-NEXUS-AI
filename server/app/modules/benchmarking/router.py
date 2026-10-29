import uuid
from typing import Optional, Dict, Any, List
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_db, require_roles
from app.modules.users.model import User
from app.modules.benchmarking.service import BenchmarkingService

router = APIRouter(prefix="/admin/benchmarking", tags=["Institutional Benchmarking"])

@router.get("/metrics")
async def get_benchmarking_metrics(
    current_user: User = Depends(require_roles(["ADMIN"])),
    db: AsyncSession = Depends(get_db)
):
    service = BenchmarkingService(db)
    metrics = await service.get_metrics()
    return {"status": "success", "data": metrics}

@router.get("/compare")
async def get_benchmarking_comparison(
    current_user: User = Depends(require_roles(["ADMIN"])),
    db: AsyncSession = Depends(get_db)
):
    service = BenchmarkingService(db)
    comparison = await service.compare_institutions()
    return {"status": "success", "data": comparison}

@router.post("/generate-report")
async def generate_benchmarking_report(
    current_user: User = Depends(require_roles(["ADMIN"])),
    db: AsyncSession = Depends(get_db)
):
    service = BenchmarkingService(db)
    report = await service.generate_report()
    return report
