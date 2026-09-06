from abc import ABC, abstractmethod
from typing import List
from app.ai.schemas.explainable_schemas import RubricEvidenceItem, CounterfactualGuidance, QualityFindingItem

class BaseAIProvider(ABC):
    @abstractmethod
    async def extract_rubric_evidence(self, prompt: str, rubric: str, response_text: str, max_marks: float) -> list[RubricEvidenceItem]:
        pass

    @abstractmethod
    async def generate_counterfactual(self, current_score: float, max_score: float, missing_concepts: list[str]) -> CounterfactualGuidance:
        pass

    @abstractmethod
    async def validate_paper_quality(self, exam_title: str, questions: list) -> list[QualityFindingItem]:
        pass
