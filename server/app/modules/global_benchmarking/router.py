from typing import Optional
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_db, get_current_user, require_roles
from app.modules.users.model import User
from app.modules.global_benchmarking.service import GlobalBenchmarkingService

router = APIRouter(tags=["Global Benchmarking & Accreditation"])

@router.get("/global/universities")
async def get_global_universities(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = GlobalBenchmarkingService(db)
    unis = await service.get_universities()
    return {"status": "success", "data": unis}

@router.get("/admin/global-benchmarking")
@router.get("/global/benchmarks")
async def get_global_benchmarking_overview(
    current_user: User = Depends(require_roles(["ADMIN", "FACULTY"])),
    db: AsyncSession = Depends(get_db)
):
    service = GlobalBenchmarkingService(db)
    benchmarks = await service.get_benchmarks()
    return {"status": "success", "data": benchmarks}

@router.post("/admin/global-benchmarking/generate-report")
async def generate_global_benchmarking_report(
    current_user: User = Depends(require_roles(["ADMIN"])),
    db: AsyncSession = Depends(get_db)
):
    service = GlobalBenchmarkingService(db)
    report = await service.generate_report()
    return {"status": "success", "message": "Global benchmarking strategic AI report generated", "data": report}

@router.get("/global/best-practices")
async def get_global_best_practices(
    category: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = GlobalBenchmarkingService(db)
    practices = await service.get_best_practices(category)
    return {"status": "success", "data": practices}
