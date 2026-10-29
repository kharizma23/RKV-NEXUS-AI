import uuid
from datetime import datetime
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

# 1. Predictive Analytics & Health Score
class InstitutionalHealthResponse(BaseModel):
    score: int
    student_success_rate: float
    co_attainment_trend: float
    dropout_risk_count: int
    faculty_retention_rate: float
    placement_rate: float
    recommendations: list[str]
    stats: dict[str, Any]

# 2. At Risk Students
class AtRiskStudentItem(BaseModel):
    id: uuid.UUID
    full_name: str
    roll_number: str
    co_attainment: float
    attendance_pct: float
    risk_level: str
    suggested_intervention: str

# 3. Comparative Benchmarks
class InstitutionBenchmarkItem(BaseModel):
    institution_code: str
    institution_name: str
    co_attainment_pct: float
    placement_rate_pct: float
    faculty_ratio: str
    curriculum_score: float

class ComparativeBenchmarkResponse(BaseModel):
    benchmarks: list[InstitutionBenchmarkItem]
    ai_recommendation: str

# 4. Smart Alerts
class SmartAlertItem(BaseModel):
    id: str
    type: str  # CRITICAL, WARNING, SUGGESTION, SUCCESS
    title: str
    message: str
    action_label: str
    action_type: str
    target_id: Optional[str] = None
    created_at: datetime

# 5. AI Programme Generator
class ProgrammeDropdownItem(BaseModel):
    id: uuid.UUID
    name: str
    code: str
    department_id: uuid.UUID
    department_name: str
    department_code: str
    institution_id: uuid.UUID
    institution_name: str
    institution_code: str

class SubjectDraft(BaseModel):
    name: str
    code: str
    credits: int
    theory_hours: int
    lab_hours: int
    course_outcomes: list[str]
    prerequisite: Optional[str] = None

class SemesterDraft(BaseModel):
    semester_number: int
    subjects: list[SubjectDraft]

class ProgrammeGenerationRequest(BaseModel):
    institution_id: Optional[uuid.UUID] = None
    department_id: Optional[uuid.UUID] = None
    programme_name: str
    degree_type: Optional[str] = "Bachelor of Technology"

class ProgrammeGenerationResponse(BaseModel):
    name: str
    code: str
    degree_type: str
    duration_years: int
    total_semesters: int
    total_credits: int
    theory_lab_split: str
    aicte_compliant: bool
    semesters: list[SemesterDraft]

# 6. Smart Institution Onboarding
class OnboardingAutoDetectRequest(BaseModel):
    code: str  # e.g., UGC-12345 or BIT-AICTE

class OnboardingAutoDetectResponse(BaseModel):
    code: str
    name: str
    location: str
    accredited_courses_count: int
    departments_count: int
    previous_co_attainment_avg: float
    recommended_departments: list[str]

# 7. Faculty AI Recommendation
class FacultyRecommendationResponse(BaseModel):
    faculty_id: uuid.UUID
    full_name: str
    employee_id: str
    designation: str
    suitability_score: int
    expertise_areas: list[str]
    publications_count: int
    experience_years: int
    recommended_subjects: list[dict[str, Any]]

class AutoAssignFacultyRequest(BaseModel):
    faculty_id: uuid.UUID
    subject_ids: list[uuid.UUID]

# 8. Bulk Data Processor
class BulkDataRow(BaseModel):
    row_index: int
    name: str
    roll_number: str
    email: str
    status: str  # VALID, DUPLICATE_FIXED, CORRECTION_APPLIED
    note: Optional[str] = None

class BulkDataValidateResponse(BaseModel):
    total_rows: int
    valid_rows_count: int
    duplicates_fixed_count: int
    corrections_applied_count: int
    preview: list[BulkDataRow]

# 9. Smart Audit Anomalies
class SecurityAnomalyItem(BaseModel):
    id: str
    severity: str  # HIGH, MEDIUM, LOW
    title: str
    description: str
    ip_address: Optional[str] = None
    timestamp: datetime
    suggested_action: str

class AuditAnomaliesResponse(BaseModel):
    risk_score: int
    total_anomalies_count: int
    anomalies: list[SecurityAnomalyItem]
