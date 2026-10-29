import uuid
from typing import Optional, Dict, Any, List
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status

from app.modules.global_benchmarking.model import GlobalUniversity, GlobalBenchmark, BestPractice
from app.modules.institutions.model import Institution
from app.ai.ai_service import AIService

class GlobalBenchmarkingService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.ai_service = AIService()

    async def get_or_seed_data(self) -> None:
        unis = await self.db.execute(select(GlobalUniversity).limit(1))
        if not unis.scalar_one_or_none():
            world_unis = [
                GlobalUniversity(
                    name="Massachusetts Institute of Technology (MIT)",
                    country="United States",
                    ranking=1,
                    co_standards={"ABET_CAC": 96.5, "Washington_Accord": 98.0, "HandsOn_Lab_Weightage": 45.0},
                    placement_rate=98.4,
                    avg_salary_usd=135000.0
                ),
                GlobalUniversity(
                    name="Stanford University",
                    country="United States",
                    ranking=2,
                    co_standards={"ABET_EAC": 95.8, "Entrepreneurship_Output": 94.2, "Industry_Funding": 92.0},
                    placement_rate=97.9,
                    avg_salary_usd=140000.0
                ),
                GlobalUniversity(
                    name="University of Oxford",
                    country="United Kingdom",
                    ranking=3,
                    co_standards={"QAA_Benchmark": 94.5, "Tutorial_Pedagogy": 96.0, "Research_Index": 97.5},
                    placement_rate=96.5,
                    avg_salary_usd=115000.0
                ),
                GlobalUniversity(
                    name="National University of Singapore (NUS)",
                    country="Singapore",
                    ranking=8,
                    co_standards={"Washington_Accord": 95.0, "AI_Curriculum_Integration": 93.0},
                    placement_rate=96.8,
                    avg_salary_usd=98000.0
                ),
                GlobalUniversity(
                    name="ETH Zurich",
                    country="Switzerland",
                    ranking=9,
                    co_standards={"Bologna_Process": 96.0, "Mathematical_Rigor": 98.5},
                    placement_rate=95.2,
                    avg_salary_usd=125000.0
                ),
                GlobalUniversity(
                    name="Indian Institute of Technology (IIT Bombay)",
                    country="India",
                    ranking=45,
                    co_standards={"NBA_Tier1": 92.5, "GATE_Aptitude": 94.0, "Placement_Tech": 96.0},
                    placement_rate=94.8,
                    avg_salary_usd=72000.0
                )
            ]
            for u in world_unis:
                self.db.add(u)

            best_practices_list = [
                BestPractice(
                    category="CURRICULUM",
                    practice="Modular Micro-Credentialing & Industry Certifications",
                    description="Allow students to substitute elective courses with verified AWS/Google/NVIDIA advanced specializations.",
                    source="Stanford d.school & MIT EECS"
                ),
                BestPractice(
                    category="ASSESSMENT",
                    practice="Blind Double-Evaluated Real-World Capstone Defense",
                    description="Assessment rubrics calibrated with external industry architects for 100% of final year capstone submissions.",
                    source="NUS Enterprise & Engineering Faculty"
                ),
                BestPractice(
                    category="RESEARCH",
                    practice="Undergraduate Research Fellowship (UROP)",
                    description="Provide second-year students direct lab stipends and co-authorship on IEEE/ACM indexed papers.",
                    source="MIT UROP Program"
                ),
                BestPractice(
                    category="PEDAGOGY",
                    practice="Flipped Mastery-Based Classroom with Adaptive Quizzing",
                    description="Pre-lecture AI diagnostic assessments ensure 85% foundational readiness before active collaborative problem solving.",
                    source="ETH Zurich Educational Innovation Hub"
                )
            ]
            for bp in best_practices_list:
                self.db.add(bp)

            await self.db.commit()

    async def get_universities(self) -> List[Dict[str, Any]]:
        await self.get_or_seed_data()
        res = await self.db.execute(select(GlobalUniversity).order_by(GlobalUniversity.ranking.asc()))
        unis = list(res.scalars().all())
        return [
            {
                "id": str(u.id),
                "name": u.name,
                "country": u.country,
                "ranking": u.ranking,
                "co_standards": u.co_standards,
                "placement_rate": u.placement_rate,
                "avg_salary_usd": u.avg_salary_usd
            }
            for u in unis
        ]

    async def get_benchmarks(self, institution_id: Optional[uuid.UUID] = None) -> Dict[str, Any]:
        await self.get_or_seed_data()
        # Fetch institutions and top global target (e.g. MIT)
        top_uni_res = await self.db.execute(select(GlobalUniversity).order_by(GlobalUniversity.ranking.asc()).limit(1))
        top_uni = top_uni_res.scalar_one_or_none()

        benchmarks = [
            {
                "metric_name": "Course Outcome (CO) Mastery Threshold",
                "our_value": 78.4,
                "their_value": 96.5,
                "gap": -18.1,
                "status": "NEEDS_ATTENTION",
                "recommendation": "Elevate Bloom's Taxonomy Level 5 (Evaluate) & Level 6 (Create) question ratio from 25% to 45%."
            },
            {
                "metric_name": "International Tier-1 Placement Rate (%)",
                "our_value": 84.2,
                "their_value": 98.4,
                "gap": -14.2,
                "status": "MODERATE_GAP",
                "recommendation": "Expand global alumni mentorship linkages and off-campus FAANG internship pipelines."
            },
            {
                "metric_name": "Research Papers per Faculty per Year",
                "our_value": 2.1,
                "their_value": 6.8,
                "gap": -4.7,
                "status": "CRITICAL_GAP",
                "recommendation": "Allocate seed research grants and reduce administrative workload for R&D faculty."
            },
            {
                "metric_name": "Student-Faculty Ratio (FTE)",
                "our_value": 15.0,
                "their_value": 9.0,
                "gap": -6.0,
                "status": "GOOD",
                "recommendation": "Maintain AI teaching assistant automated triage to scale faculty office hours."
            },
            {
                "metric_name": "Lab Practical & Simulation Weightage (%)",
                "our_value": 30.0,
                "their_value": 45.0,
                "gap": -15.0,
                "status": "NEEDS_ATTENTION",
                "recommendation": "Mandate AR/VR Virtual Lab simulations as prerequisite before mid-term evaluations."
            }
        ]

        return {
            "target_university": top_uni.name if top_uni else "MIT / Stanford Global Standards",
            "overall_attainment_parity": 81.6,
            "metrics": benchmarks
        }

    async def generate_report(self) -> Dict[str, Any]:
        benchmarks = await self.get_benchmarks()
        prompt = (
            "You are the Chief Accreditation and Global Benchmarking Officer. "
            f"Analyze the university metrics gap: {benchmarks['metrics']}. "
            "Generate an executive strategic roadmap for reaching World Top 100 Engineering standard."
        )
        ai_response = None
        if self.ai_service.is_configured():
            ai_response = await self.ai_service.get_completion(
                "You are an international higher education accreditation evaluator (Washington Accord & ABET).",
                prompt
            )

        if not ai_response:
            ai_response = (
                "RKV NEXUS Strategic Global Roadmap 2026-2028:\n"
                "1. Increase Practical CO Weightage: Incorporate 3D VR simulation labs into end-semester practical grading.\n"
                "2. Faculty Research Incentivization: Offer matching publication grants for IEEE/ACM transaction publications.\n"
                "3. Global Curriculum Synchronization: Align syllabus modules with ABET-CAC Criteria 3 and Washington Accord outcomes.\n"
                "4. Industry Capstone Sponsoring: Partner with multinational tech corporations for real-world automated code evaluations."
            )

        return {
            "report_id": f"GBR-{uuid.uuid4().hex[:8].upper()}",
            "generated_at": "2026-10-05T12:00:00Z",
            "global_ranking_target": "Top 100 Global Engineering",
            "executive_summary": ai_response,
            "parity_index": 82.4
        }

    async def get_best_practices(self, category: Optional[str] = None) -> List[Dict[str, Any]]:
        await self.get_or_seed_data()
        stmt = select(BestPractice)
        if category:
            stmt = stmt.where(BestPractice.category == category)
        res = await self.db.execute(stmt)
        practices = list(res.scalars().all())
        return [
            {
                "id": str(p.id),
                "category": p.category,
                "practice": p.practice,
                "description": p.description,
                "source": p.source
            }
            for p in practices
        ]
