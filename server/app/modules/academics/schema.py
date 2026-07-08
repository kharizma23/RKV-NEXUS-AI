import uuid
from datetime import date, datetime
from typing import Any, List, Optional
from pydantic import BaseModel, ConfigDict, model_validator
from app.modules.syllabus.schema import UnitResponse
from app.modules.learning_outcomes.schema import CourseOutcomeResponse

class ProgrammeResponse(BaseModel):
    id: uuid.UUID
    institution_id: uuid.UUID
    department_id: uuid.UUID
    name: str
    programme_name: Optional[str] = None
    code: str
    programme_code: Optional[str] = None
    degree_type: str
    duration_years: int
    total_semesters: int = 8
    regulation_name: Optional[str] = None
    regulation: Optional[str] = None
    description: Optional[str] = None
    is_active: bool = True
    created_by: Optional[uuid.UUID] = None
    institution_name: Optional[str] = None
    department_name: Optional[str] = None
    enrolled_students_count: int = 0
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

    @model_validator(mode="before")
    @classmethod
    def populate_response_fields(cls, data: Any) -> Any:
        if isinstance(data, dict):
            if "programme_name" not in data or data["programme_name"] is None:
                data["programme_name"] = data.get("name")
            if "programme_code" not in data or data["programme_code"] is None:
                data["programme_code"] = data.get("code")
            if "regulation" not in data or data["regulation"] is None:
                data["regulation"] = data.get("regulation_name")
        else:
            # For ORM objects
            try:
                programme_name = getattr(data, "name", None)
                programme_code = getattr(data, "code", None)
                regulation = getattr(data, "regulation_name", None)
                object.__setattr__(data, "programme_name", programme_name)
                object.__setattr__(data, "programme_code", programme_code)
                object.__setattr__(data, "regulation", regulation)
            except Exception:
                # If read-only, create a dict instead
                try:
                    d = {
                        "id": getattr(data, "id", None),
                        "institution_id": getattr(data, "institution_id", None),
                        "department_id": getattr(data, "department_id", None),
                        "name": getattr(data, "name", None),
                        "programme_name": getattr(data, "name", None),
                        "code": getattr(data, "code", None),
                        "programme_code": getattr(data, "code", None),
                        "degree_type": getattr(data, "degree_type", None),
                        "duration_years": getattr(data, "duration_years", None),
                        "total_semesters": getattr(data, "total_semesters", 8),
                        "regulation_name": getattr(data, "regulation_name", None),
                        "regulation": getattr(data, "regulation_name", None),
                        "description": getattr(data, "description", None),
                        "is_active": getattr(data, "is_active", True),
                        "created_by": getattr(data, "created_by", None),
                        "institution_name": data.institution.name if getattr(data, "institution", None) else None,
                        "department_name": data.department.name if getattr(data, "department", None) else None,
                        "enrolled_students_count": getattr(data, "enrolled_students_count", 0),
                        "created_at": getattr(data, "created_at", None),
                        "updated_at": getattr(data, "updated_at", None),
                    }
                    return d
                except Exception:
                    pass
        return data

class ProgrammeCreate(BaseModel):
    institution_id: Optional[uuid.UUID] = None
    department_id: uuid.UUID
    name: Optional[str] = None
    programme_name: Optional[str] = None
    code: Optional[str] = None
    programme_code: Optional[str] = None
    degree_type: str = "Bachelor of Technology"
    duration_years: int = 4
    total_semesters: int = 8
    regulation_name: Optional[str] = None
    regulation: Optional[str] = None
    description: Optional[str] = None
    is_active: bool = True
    auto_create_semesters: bool = True
    confirm_unusual_name: bool = False

    @model_validator(mode="before")
    @classmethod
    def populate_aliases(cls, data: Any) -> Any:
        if isinstance(data, dict):
            name_val = data.get("programme_name") or data.get("name")
            code_val = data.get("programme_code") or data.get("code")
            reg_val = data.get("regulation") or data.get("regulation_name")
            data["name"] = name_val
            data["programme_name"] = name_val
            data["code"] = code_val
            data["programme_code"] = code_val
            data["regulation"] = reg_val
            data["regulation_name"] = reg_val
        return data

class ProgrammeUpdate(BaseModel):
    institution_id: Optional[uuid.UUID] = None
    department_id: Optional[uuid.UUID] = None
    name: Optional[str] = None
    programme_name: Optional[str] = None
    code: Optional[str] = None
    programme_code: Optional[str] = None
    degree_type: Optional[str] = None
    duration_years: Optional[int] = None
    total_semesters: Optional[int] = None
    regulation_name: Optional[str] = None
    regulation: Optional[str] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None
    confirm_unusual_name: Optional[bool] = False

    @model_validator(mode="before")
    @classmethod
    def populate_aliases(cls, data: Any) -> Any:
        if isinstance(data, dict):
            name_val = data.get("programme_name") or data.get("name")
            code_val = data.get("programme_code") or data.get("code")
            reg_val = data.get("regulation") or data.get("regulation_name")
            if name_val is not None:
                data["name"] = name_val
                data["programme_name"] = name_val
            if code_val is not None:
                data["code"] = code_val
                data["programme_code"] = code_val
            if reg_val is not None:
                data["regulation"] = reg_val
                data["regulation_name"] = reg_val
        return data

class ProgrammeTemplateResponse(BaseModel):
    template_id: str
    programme_name: str
    programme_code: str
    alternative_codes: list[str]
    degree_type: str
    duration_years: int
    total_semesters: int
    related_department_keywords: list[str]
    description: Optional[str] = None

class ProgrammeStudentResponse(BaseModel):
    id: uuid.UUID
    student_id_number: str
    full_name: str
    email: str
    department_name: Optional[str] = None
    academic_year: Optional[str] = None
    semester: Optional[int] = None

class AcademicYearResponse(BaseModel):
    id: uuid.UUID
    institution_id: uuid.UUID
    year_label: str
    start_date: date
    end_date: date
    is_current: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class AcademicYearCreate(BaseModel):
    institution_id: uuid.UUID
    year_label: str
    start_date: date
    end_date: date
    is_current: bool = True

class SemesterResponse(BaseModel):
    id: uuid.UUID
    academic_year_id: uuid.UUID
    semester_number: int
    term_type: str
    start_date: date
    end_date: date
    is_active: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class SemesterCreate(BaseModel):
    academic_year_id: uuid.UUID
    semester_number: int
    term_type: str = "ODD"
    start_date: date
    end_date: date
    is_active: bool = True

class CourseResponse(BaseModel):
    id: uuid.UUID
    department_id: uuid.UUID
    programme_id: uuid.UUID
    code: str
    name: str
    credits: int
    description: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class CourseCreate(BaseModel):
    department_id: uuid.UUID
    programme_id: uuid.UUID
    code: str
    name: str
    credits: int = 4
    description: Optional[str] = None

class SubjectResponse(BaseModel):
    id: uuid.UUID
    course_id: uuid.UUID
    semester_id: uuid.UUID
    code: str
    name: str
    subject_type: str
    units: list[UnitResponse] = []
    course_outcomes: list[CourseOutcomeResponse] = []
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class SubjectCreate(BaseModel):
    course_id: uuid.UUID
    semester_id: uuid.UUID
    code: str
    name: str
    subject_type: str = "THEORY"

class SubjectEnrolmentCreate(BaseModel):
    student_id: uuid.UUID
    subject_id: uuid.UUID
    semester_id: uuid.UUID

class SubjectEnrolmentResponse(BaseModel):
    id: uuid.UUID
    student_id: uuid.UUID
    subject_id: uuid.UUID
    semester_id: uuid.UUID
    enrolled_at: datetime
    is_active: bool
    subject: Optional[SubjectResponse] = None

    model_config = ConfigDict(from_attributes=True)

class FacultySubjectAssignmentCreate(BaseModel):
    faculty_id: uuid.UUID
    subject_id: uuid.UUID
    semester_id: uuid.UUID
    role_in_subject: str = "INSTRUCTOR"

class FacultySubjectAssignmentResponse(BaseModel):
    id: uuid.UUID
    faculty_id: uuid.UUID
    subject_id: uuid.UUID
    semester_id: uuid.UUID
    role_in_subject: str
    assigned_at: datetime
    subject: Optional[SubjectResponse] = None

    model_config = ConfigDict(from_attributes=True)
