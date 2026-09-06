from typing import List, Optional
from pydantic import BaseModel

class RubricEvidenceItem(BaseModel):
    criterion_id: str
    criterion_title: str
    max_mark: float
    suggested_mark: float
    evidence_type: str = "EXACT_TEXT_SPAN" # EXACT_TEXT_SPAN, PARAGRAPH, MISSING_CONCEPT_INDICATOR
    evidence_text: str
    start_offset: Optional[int] = None
    end_offset: Optional[int] = None
    matched_key_concepts: list[str] = []
    missing_key_concepts: list[str] = []
    confidence_score: float = 0.90
    explanation: str

class CounterfactualGuidance(BaseModel):
    current_score: float
    target_score: float
    required_improvements: list[str] = []
    generated_feedback: str

class QualityFindingItem(BaseModel):
    severity: str # INFO, WARNING, ERROR, BLOCKING
    category: str # SYLLABUS_COVERAGE, DIFFICULTY_BALANCE, BLOOM_BALANCE, DUPLICATION, AMBIGUITY
    question_id: Optional[str] = None
    message: str
    suggested_correction: Optional[str] = None
    rule_code: str
