"""
2026 Academic Anchor Matrix Module
Enforces strict 4-year engineering cohort targeting for RKV Nexus AI platform.

Matrix Definitions:
- 1st Year Students  -> Batch: "2026-2030" -> Semesters: [1, 2]
- 2nd Year Students  -> Batch: "2025-2029" -> Semesters: [3, 4]
- 3rd Year Students  -> Batch: "2024-2028" -> Semesters: [5, 6]
- 4th/Final Students -> Batch: "2023-2027" -> Semesters: [7, 8]
"""

from typing import Dict, List, Any, Optional
from pydantic import BaseModel, EmailStr, Field, model_validator, root_validator

ACADEMIC_ANCHOR_MATRIX_2026: Dict[str, List[int]] = {
    "2026-2030": [1, 2],
    "2025-2029": [3, 4],
    "2024-2028": [5, 6],
    "2023-2027": [7, 8],
}

COHORT_METADATA = {
    "2026-2030": {"year": "1st Year", "label": "1st Year (Freshmen)", "semesters": [1, 2]},
    "2025-2029": {"year": "2nd Year", "label": "2nd Year (Sophomores)", "semesters": [3, 4]},
    "2024-2028": {"year": "3rd Year", "label": "3rd Year (Pre-Final)", "semesters": [5, 6]},
    "2023-2027": {"year": "4th Year", "label": "4th/Final Year (Graduating)", "semesters": [7, 8]},
}

def validate_cohort_alignment(target_batch: Optional[str], target_semester: Optional[int]) -> None:
    """
    Validates that the provided batch and semester strictly adhere to the 
    2026 Academic Anchor Matrix.
    Raises ValueError with descriptive context if misaligned.
    """
    if target_batch is None and target_semester is None:
        return

    if target_batch is not None:
        clean_batch = target_batch.strip()
        if clean_batch not in ACADEMIC_ANCHOR_MATRIX_2026:
            valid_batches = list(ACADEMIC_ANCHOR_MATRIX_2026.keys())
            raise ValueError(
                f"Invalid target_batch '{target_batch}'. Must match one of the active 2026 academic anchor batches: {valid_batches}"
            )
        
        if target_semester is not None:
            allowed_sems = ACADEMIC_ANCHOR_MATRIX_2026[clean_batch]
            if target_semester not in allowed_sems:
                cohort_label = COHORT_METADATA[clean_batch]["label"]
                raise ValueError(
                    f"Invalid cohort alignment: {cohort_label} ('{clean_batch}') can only map to Semesters {allowed_sems}. "
                    f"Semester {target_semester} is rejected by the 2026 Academic Anchor Matrix."
                )

class StudentRegistrationValidator(BaseModel):
    """
    Pydantic schema enforcing rigorous root-level cohort matrix validation
    for student onboarding and registration requests.
    """
    email: EmailStr
    full_name: str = Field(..., min_length=2)
    student_id_number: str = Field(..., min_length=2)
    target_batch: str = Field(..., description="Academic enrollment batch, e.g. '2023-2027'")
    target_semester: int = Field(..., ge=1, le=8, description="Current semester index [1-8]")
    password: Optional[str] = None
    confirm_password: Optional[str] = None

    @root_validator(pre=True)
    def validate_cohort_matrix(cls, values: Any) -> Any:
        if isinstance(values, dict):
            batch = values.get("target_batch")
            sem = values.get("target_semester")
            if sem is not None:
                try:
                    sem = int(sem)
                    values["target_semester"] = sem
                except (ValueError, TypeError):
                    raise ValueError("target_semester must be an integer between 1 and 8")
            validate_cohort_alignment(batch, sem)
        return values
