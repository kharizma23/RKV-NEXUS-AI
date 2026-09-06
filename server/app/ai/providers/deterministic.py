from typing import List
from app.ai.providers.base import BaseAIProvider
from app.ai.schemas.explainable_schemas import RubricEvidenceItem, CounterfactualGuidance, QualityFindingItem

class DeterministicAIProvider(BaseAIProvider):
    async def extract_rubric_evidence(self, prompt: str, rubric: str, response_text: str, max_marks: float) -> list[RubricEvidenceItem]:
        items = []
        text_clean = response_text.strip()

        if len(text_clean) > 10:
            start_idx = 0
            end_idx = min(len(text_clean), 80)
            items.append(RubricEvidenceItem(
                criterion_id="CRIT-01",
                criterion_title="Core Definition & Conceptual Alignment",
                max_mark=max_marks * 0.5,
                suggested_mark=max_marks * 0.5,
                evidence_type="EXACT_TEXT_SPAN",
                evidence_text=text_clean[start_idx:end_idx],
                start_offset=start_idx,
                end_offset=end_idx,
                matched_key_concepts=["Core algorithm definition", "Formal state mapping"],
                confidence_score=0.92,
                explanation=f"Response span [{start_idx}:{end_idx}] directly demonstrates core definition concepts."
            ))
            items.append(RubricEvidenceItem(
                criterion_id="CRIT-02",
                criterion_title="Proof & Technical Recurrence Formulation",
                max_mark=max_marks * 0.5,
                suggested_mark=max_marks * 0.35,
                evidence_type="EXACT_TEXT_SPAN",
                evidence_text=text_clean[min(20, len(text_clean)):],
                start_offset=min(20, len(text_clean)),
                end_offset=len(text_clean),
                matched_key_concepts=["Recurrence relation T(N)"],
                missing_key_concepts=["Explicit edge case boundary condition"],
                confidence_score=0.88,
                explanation="Response provides recurrence relation formula but lacks explicit edge case analysis."
            ))
        else:
            items.append(RubricEvidenceItem(
                criterion_id="CRIT-01",
                criterion_title="Core Definition & Conceptual Alignment",
                max_mark=max_marks,
                suggested_mark=0.0,
                evidence_type="MISSING_CONCEPT_INDICATOR",
                evidence_text="[No sufficient response text provided]",
                missing_key_concepts=["Core algorithm definition", "Recurrence relation"],
                confidence_score=0.98,
                explanation="Response is too brief to extract meaningful conceptual evidence."
            ))
        return items

    async def generate_counterfactual(self, current_score: float, max_score: float, missing_concepts: list[str]) -> CounterfactualGuidance:
        target = min(max_score, current_score + (max_score - current_score) * 0.75)
        improvements = [
            "Include an explicit edge-case boundary condition analysis.",
            "Provide a labeled architectural or memory layout diagram.",
            "Clarify the recurrence relation derivation step-by-step."
        ]
        return CounterfactualGuidance(
            current_score=current_score,
            target_score=round(target, 1),
            required_improvements=improvements,
            generated_feedback=f"To reach target score of {round(target, 1)}/{max_score}: Add an explicit edge-case boundary analysis and clarify recurrence steps."
        )

    async def validate_paper_quality(self, exam_title: str, questions: list) -> list[QualityFindingItem]:
        findings = []
        if len(questions) < 2:
            findings.append(QualityFindingItem(
                severity="BLOCKING",
                category="SYLLABUS_COVERAGE",
                message="Examination contains fewer than 2 questions, failing minimum unit coverage threshold.",
                suggested_correction="Add at least one additional question from Unit 2 or Unit 3.",
                rule_code="RULE_MIN_QUESTIONS"
            ))
        else:
            findings.append(QualityFindingItem(
                severity="INFO",
                category="DIFFICULTY_BALANCE",
                message="Difficulty ratio balanced: 50% Easy, 50% Medium.",
                suggested_correction=None,
                rule_code="RULE_DIFFICULTY_OK"
            ))
            findings.append(QualityFindingItem(
                severity="WARNING",
                category="BLOOM_BALANCE",
                message="Bloom's taxonomy lacks EVALUATE/CREATE higher-order questions.",
                suggested_correction="Consider including one EVALUATE level question for comprehensive outcome assessment.",
                rule_code="RULE_BLOOM_WARN"
            ))
        return findings
