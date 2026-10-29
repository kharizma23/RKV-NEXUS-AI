import uuid
from datetime import datetime, UTC
from typing import Optional, List, Dict, Any
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.benchmarking.model import BenchmarkingMetric, BenchmarkingComparison
from app.modules.institutions.model import Institution
from app.ai.ai_service import AIService

BENCHMARK_PROFILES = [
    {
        "name": "RKV Engineering Institute (Self)",
        "co_attainment": 82.5,
        "placement_rate": 91.2,
        "student_success_rate": 88.0,
        "faculty_student_ratio": 15.0,  # 1:15
        "research_output": 42.0
    },
    {
        "name": "National Institute of Technology (Regional Benchmark)",
        "co_attainment": 86.0,
        "placement_rate": 94.5,
        "student_success_rate": 91.5,
        "faculty_student_ratio": 14.0,
        "research_output": 65.0
    },
    {
        "name": "State Technological University",
        "co_attainment": 76.0,
        "placement_rate": 84.0,
        "student_success_rate": 82.0,
        "faculty_student_ratio": 18.0,
        "research_output": 28.0
    },
    {
        "name": "Tier-1 Autonomous Engineering College",
        "co_attainment": 84.5,
        "placement_rate": 93.0,
        "student_success_rate": 89.5,
        "faculty_student_ratio": 15.5,
        "research_output": 51.0
    }
]

class BenchmarkingService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.ai = AIService()

    async def get_metrics(self) -> List[Dict[str, Any]]:
        return BENCHMARK_PROFILES

    async def compare_institutions(self) -> Dict[str, Any]:
        self_profile = BENCHMARK_PROFILES[0]
        regional_benchmark = BENCHMARK_PROFILES[1]

        diffs = {
            "co_attainment": round(self_profile["co_attainment"] - regional_benchmark["co_attainment"], 1),
            "placement_rate": round(self_profile["placement_rate"] - regional_benchmark["placement_rate"], 1),
            "student_success_rate": round(self_profile["student_success_rate"] - regional_benchmark["student_success_rate"], 1),
            "faculty_student_ratio": round(self_profile["faculty_student_ratio"] - regional_benchmark["faculty_student_ratio"], 1),
            "research_output": round(self_profile["research_output"] - regional_benchmark["research_output"], 1),
        }

        ai_rec = (
            "To bridge the -3.5% gap in Course Outcome attainment compared to Tier-1 regional benchmarks: "
            "(1) Institutionalize continuous diagnostic formative assessments at Unit 2 and Unit 4; "
            "(2) Expand undergraduate research publication incentives to lift indexed publications from 42 to 60+; "
            "(3) Reallocate lab tutoring hours to maintain a 1:14 faculty-to-student coaching ratio."
        )

        return {
            "primary_institution": self_profile["name"],
            "benchmark_peer": regional_benchmark["name"],
            "comparisons": diffs,
            "all_institutions": BENCHMARK_PROFILES,
            "ai_recommendation": ai_rec
        }

    async def generate_report(self) -> Dict[str, Any]:
        comp = await self.compare_institutions()
        return {
            "status": "success",
            "report_id": str(uuid.uuid4()),
            "generated_at": datetime.now(UTC).isoformat(),
            "data": comp
        }
