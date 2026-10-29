"""Academic Management Schema Migration

Revision ID: 002_academic_management_schema
Revises: 001_initial_schema
Create Date: 2026-07-29

"""
from typing import Union
from collections.abc import Sequence
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = '002_academic_management_schema'
down_revision: Union[str, None] = '001_initial_schema'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    # 1. programmes
    op.create_table(
        'programmes',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('department_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('departments.id', ondelete='CASCADE'), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('code', sa.String(length=50), nullable=False, unique=True),
        sa.Column('degree_type', sa.String(length=50), nullable=False, server_default='B.Tech'),
        sa.Column('duration_years', sa.Integer(), nullable=False, server_default='4'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False)
    )
    op.create_index(op.f('ix_programmes_department_id'), 'programmes', ['department_id'])
    op.create_index(op.f('ix_programmes_code'), 'programmes', ['code'], unique=True)

    # 2. academic_years
    op.create_table(
        'academic_years',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('institution_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('institutions.id', ondelete='CASCADE'), nullable=False),
        sa.Column('year_label', sa.String(length=50), nullable=False),
        sa.Column('start_date', sa.Date(), nullable=False),
        sa.Column('end_date', sa.Date(), nullable=False),
        sa.Column('is_current', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False)
    )
    op.create_index(op.f('ix_academic_years_institution_id'), 'academic_years', ['institution_id'])
    op.create_index(op.f('ix_academic_years_year_label'), 'academic_years', ['year_label'])

    # 3. semesters
    op.create_table(
        'semesters',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('academic_year_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('academic_years.id', ondelete='CASCADE'), nullable=False),
        sa.Column('semester_number', sa.Integer(), nullable=False),
        sa.Column('term_type', sa.String(length=20), nullable=False, server_default='ODD'),
        sa.Column('start_date', sa.Date(), nullable=False),
        sa.Column('end_date', sa.Date(), nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False)
    )
    op.create_index(op.f('ix_semesters_academic_year_id'), 'semesters', ['academic_year_id'])

    # 4. courses
    op.create_table(
        'courses',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('department_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('departments.id', ondelete='CASCADE'), nullable=False),
        sa.Column('programme_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('programmes.id', ondelete='CASCADE'), nullable=False),
        sa.Column('code', sa.String(length=50), nullable=False, unique=True),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('credits', sa.Integer(), nullable=False, server_default='4'),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False)
    )
    op.create_index(op.f('ix_courses_department_id'), 'courses', ['department_id'])
    op.create_index(op.f('ix_courses_programme_id'), 'courses', ['programme_id'])
    op.create_index(op.f('ix_courses_code'), 'courses', ['code'], unique=True)

    # 5. subjects
    op.create_table(
        'subjects',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('course_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('courses.id', ondelete='CASCADE'), nullable=False),
        sa.Column('semester_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('semesters.id', ondelete='CASCADE'), nullable=False),
        sa.Column('code', sa.String(length=50), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('subject_type', sa.String(length=50), nullable=False, server_default='THEORY'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False)
    )
    op.create_index(op.f('ix_subjects_course_id'), 'subjects', ['course_id'])
    op.create_index(op.f('ix_subjects_semester_id'), 'subjects', ['semester_id'])
    op.create_index(op.f('ix_subjects_code'), 'subjects', ['code'])

    # 6. units
    op.create_table(
        'units',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('subject_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('subjects.id', ondelete='CASCADE'), nullable=False),
        sa.Column('unit_number', sa.Integer(), nullable=False),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('weightage', sa.Integer(), nullable=False, server_default='20'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False)
    )
    op.create_index(op.f('ix_units_subject_id'), 'units', ['subject_id'])

    # 7. topics
    op.create_table(
        'topics',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('unit_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('units.id', ondelete='CASCADE'), nullable=False),
        sa.Column('topic_number', sa.Integer(), nullable=False),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False)
    )
    op.create_index(op.f('ix_topics_unit_id'), 'topics', ['unit_id'])

    # 8. course_outcomes
    op.create_table(
        'course_outcomes',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('subject_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('subjects.id', ondelete='CASCADE'), nullable=False),
        sa.Column('code', sa.String(length=50), nullable=False),
        sa.Column('statement', sa.Text(), nullable=False),
        sa.Column('bloom_level', sa.String(length=50), nullable=False, server_default='APPLY'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False)
    )
    op.create_index(op.f('ix_course_outcomes_subject_id'), 'course_outcomes', ['subject_id'])

    # 9. programme_outcomes
    op.create_table(
        'programme_outcomes',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('programme_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('programmes.id', ondelete='CASCADE'), nullable=False),
        sa.Column('code', sa.String(length=50), nullable=False),
        sa.Column('statement', sa.Text(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False)
    )
    op.create_index(op.f('ix_programme_outcomes_programme_id'), 'programme_outcomes', ['programme_id'])

    # 10. subject_enrolments
    op.create_table(
        'subject_enrolments',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('student_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('student_profiles.id', ondelete='CASCADE'), nullable=False),
        sa.Column('subject_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('subjects.id', ondelete='CASCADE'), nullable=False),
        sa.Column('semester_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('semesters.id', ondelete='CASCADE'), nullable=False),
        sa.Column('enrolled_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true')
    )
    op.create_index(op.f('ix_subject_enrolments_student_id'), 'subject_enrolments', ['student_id'])
    op.create_index(op.f('ix_subject_enrolments_subject_id'), 'subject_enrolments', ['subject_id'])

    # 11. faculty_subject_assignments
    op.create_table(
        'faculty_subject_assignments',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('faculty_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('faculty_profiles.id', ondelete='CASCADE'), nullable=False),
        sa.Column('subject_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('subjects.id', ondelete='CASCADE'), nullable=False),
        sa.Column('semester_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('semesters.id', ondelete='CASCADE'), nullable=False),
        sa.Column('role_in_subject', sa.String(length=50), nullable=False, server_default='INSTRUCTOR'),
        sa.Column('assigned_at', sa.DateTime(timezone=True), nullable=False)
    )
    op.create_index(op.f('ix_faculty_subject_assignments_faculty_id'), 'faculty_subject_assignments', ['faculty_id'])
    op.create_index(op.f('ix_faculty_subject_assignments_subject_id'), 'faculty_subject_assignments', ['subject_id'])

def downgrade() -> None:
    op.drop_table('faculty_subject_assignments')
    op.drop_table('subject_enrolments')
    op.drop_table('programme_outcomes')
    op.drop_table('course_outcomes')
    op.drop_table('topics')
    op.drop_table('units')
    op.drop_table('subjects')
    op.drop_table('courses')
    op.drop_table('semesters')
    op.drop_table('academic_years')
    op.drop_table('programmes')
