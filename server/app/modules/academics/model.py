import uuid
from datetime import datetime, date, timezone, UTC
from typing import List, Optional, TYPE_CHECKING
from sqlalchemy import String, Text, Boolean, Integer, ForeignKey, Date, DateTime, Uuid as UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.base import Base, TimestampMixin

from app.modules.syllabus.model import Unit
from app.modules.learning_outcomes.model import CourseOutcome, ProgrammeOutcome

from app.modules.institutions.model import Institution, Department
from app.modules.users.model import User

class Programme(Base, TimestampMixin):
    __tablename__ = "programmes"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    institution_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("institutions.id", ondelete="CASCADE"), nullable=False, index=True)
    department_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("departments.id", ondelete="CASCADE"), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    code: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    degree_type: Mapped[str] = mapped_column(String(50), nullable=False, default="B.Tech")
    duration_years: Mapped[int] = mapped_column(Integer, nullable=False, default=4)
    total_semesters: Mapped[int] = mapped_column(Integer, nullable=False, default=8)
    regulation_name: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_by: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)

    institution: Mapped["Institution"] = relationship("Institution")
    department: Mapped["Department"] = relationship("Department")
    created_by_user: Mapped[Optional["User"]] = relationship("User", foreign_keys=[created_by])
    courses: Mapped[list["Course"]] = relationship("Course", back_populates="programme", cascade="all, delete-orphan")
    programme_outcomes: Mapped[list["ProgrammeOutcome"]] = relationship("ProgrammeOutcome", back_populates="programme", cascade="all, delete-orphan")

class AcademicYear(Base, TimestampMixin):
    __tablename__ = "academic_years"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    institution_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("institutions.id", ondelete="CASCADE"), nullable=False, index=True)
    year_label: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    start_date: Mapped[date] = mapped_column(Date, nullable=False)
    end_date: Mapped[date] = mapped_column(Date, nullable=False)
    is_current: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    semesters: Mapped[list["Semester"]] = relationship("Semester", back_populates="academic_year", cascade="all, delete-orphan")

class Semester(Base, TimestampMixin):
    __tablename__ = "semesters"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    academic_year_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("academic_years.id", ondelete="CASCADE"), nullable=False, index=True)
    semester_number: Mapped[int] = mapped_column(Integer, nullable=False)
    term_type: Mapped[str] = mapped_column(String(20), nullable=False, default="ODD")
    start_date: Mapped[date] = mapped_column(Date, nullable=False)
    end_date: Mapped[date] = mapped_column(Date, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    academic_year: Mapped["AcademicYear"] = relationship("AcademicYear", back_populates="semesters")
    subjects: Mapped[list["Subject"]] = relationship("Subject", back_populates="semester", cascade="all, delete-orphan")

class Course(Base, TimestampMixin):
    __tablename__ = "courses"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    department_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("departments.id", ondelete="CASCADE"), nullable=False, index=True)
    programme_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("programmes.id", ondelete="CASCADE"), nullable=False, index=True)
    code: Mapped[str] = mapped_column(String(50), unique=True, nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    credits: Mapped[int] = mapped_column(Integer, nullable=False, default=4)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    programme: Mapped["Programme"] = relationship("Programme", back_populates="courses")
    subjects: Mapped[list["Subject"]] = relationship("Subject", back_populates="course", cascade="all, delete-orphan")

class Subject(Base, TimestampMixin):
    __tablename__ = "subjects"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    course_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("courses.id", ondelete="CASCADE"), nullable=False, index=True)
    semester_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("semesters.id", ondelete="CASCADE"), nullable=False, index=True)
    code: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    subject_type: Mapped[str] = mapped_column(String(50), nullable=False, default="THEORY")

    course: Mapped["Course"] = relationship("Course", back_populates="subjects")
    semester: Mapped["Semester"] = relationship("Semester", back_populates="subjects")
    units: Mapped[list["Unit"]] = relationship("Unit", back_populates="subject", cascade="all, delete-orphan", lazy="selectin")
    course_outcomes: Mapped[list["CourseOutcome"]] = relationship("CourseOutcome", back_populates="subject", cascade="all, delete-orphan", lazy="selectin")
    enrolments: Mapped[list["SubjectEnrolment"]] = relationship("SubjectEnrolment", back_populates="subject", cascade="all, delete-orphan")
    faculty_assignments: Mapped[list["FacultySubjectAssignment"]] = relationship("FacultySubjectAssignment", back_populates="subject", cascade="all, delete-orphan")

class SubjectEnrolment(Base):
    __tablename__ = "subject_enrolments"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("student_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    subject_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("subjects.id", ondelete="CASCADE"), nullable=False, index=True)
    semester_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("semesters.id", ondelete="CASCADE"), nullable=False, index=True)
    enrolled_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(UTC), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    subject: Mapped["Subject"] = relationship("Subject", back_populates="enrolments")

class FacultySubjectAssignment(Base):
    __tablename__ = "faculty_subject_assignments"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    faculty_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("faculty_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    subject_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("subjects.id", ondelete="CASCADE"), nullable=False, index=True)
    semester_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("semesters.id", ondelete="CASCADE"), nullable=False, index=True)
    role_in_subject: Mapped[str] = mapped_column(String(50), nullable=False, default="INSTRUCTOR")
    assigned_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(UTC), nullable=False)

    subject: Mapped["Subject"] = relationship("Subject", back_populates="faculty_assignments")
