"""Authentication Registration and Approval Schema Migration

Revision ID: 008_auth_registration_approval_schema
Revises: 007_multimodal_ingestion_schema
Create Date: 2026-07-30

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = '008_auth_registration_approval_schema'
down_revision: Union[str, None] = '007_multimodal_ingestion_schema'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    # 1. users table extensions
    op.add_column('users', sa.Column('account_status', sa.String(length=50), nullable=False, server_default='PENDING_EMAIL_VERIFICATION'))
    op.add_column('users', sa.Column('failed_login_count', sa.Integer(), nullable=False, server_default='0'))
    op.add_column('users', sa.Column('locked_until', sa.DateTime(timezone=True), nullable=True))
    op.add_column('users', sa.Column('last_login_at', sa.DateTime(timezone=True), nullable=True))

    # 2. student_profiles table extensions
    op.add_column('student_profiles', sa.Column('institution_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('institutions.id', ondelete='SET NULL'), nullable=True))
    op.add_column('student_profiles', sa.Column('programme_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('programmes.id', ondelete='SET NULL'), nullable=True))
    op.add_column('student_profiles', sa.Column('academic_year_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('academic_years.id', ondelete='SET NULL'), nullable=True))
    op.add_column('student_profiles', sa.Column('semester_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('semesters.id', ondelete='SET NULL'), nullable=True))
    op.add_column('student_profiles', sa.Column('preferred_language', sa.String(length=20), nullable=False, server_default='en'))
    op.add_column('student_profiles', sa.Column('phone_number', sa.String(length=20), nullable=True))
    op.add_column('student_profiles', sa.Column('date_of_birth', sa.String(length=20), nullable=True))

    # 3. faculty_profiles table extensions
    op.add_column('faculty_profiles', sa.Column('institution_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('institutions.id', ondelete='SET NULL'), nullable=True))
    op.add_column('faculty_profiles', sa.Column('phone_number', sa.String(length=20), nullable=True))
    op.add_column('faculty_profiles', sa.Column('subjects_handled', sa.JSON(), nullable=True))
    op.add_column('faculty_profiles', sa.Column('approval_status', sa.String(length=50), nullable=False, server_default='PENDING_APPROVAL'))
    op.add_column('faculty_profiles', sa.Column('approved_by', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='SET NULL'), nullable=True))
    op.add_column('faculty_profiles', sa.Column('approved_at', sa.DateTime(timezone=True), nullable=True))
    op.add_column('faculty_profiles', sa.Column('rejected_by', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='SET NULL'), nullable=True))
    op.add_column('faculty_profiles', sa.Column('rejected_at', sa.DateTime(timezone=True), nullable=True))
    op.add_column('faculty_profiles', sa.Column('rejection_reason', sa.Text(), nullable=True))

    # 4. faculty_approval_events table
    op.create_table(
        'faculty_approval_events',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('faculty_user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('action', sa.String(length=50), nullable=False),
        sa.Column('previous_status', sa.String(length=50), nullable=False),
        sa.Column('new_status', sa.String(length=50), nullable=False),
        sa.Column('administrator_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('reason', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False)
    )
    op.create_index(op.f('ix_faculty_approval_events_faculty_user_id'), 'faculty_approval_events', ['faculty_user_id'])

def downgrade() -> None:
    op.drop_table('faculty_approval_events')

    op.drop_column('faculty_profiles', 'rejection_reason')
    op.drop_column('faculty_profiles', 'rejected_at')
    op.drop_column('faculty_profiles', 'rejected_by')
    op.drop_column('faculty_profiles', 'approved_at')
    op.drop_column('faculty_profiles', 'approved_by')
    op.drop_column('faculty_profiles', 'approval_status')
    op.drop_column('faculty_profiles', 'subjects_handled')
    op.drop_column('faculty_profiles', 'phone_number')
    op.drop_column('faculty_profiles', 'institution_id')

    op.drop_column('student_profiles', 'date_of_birth')
    op.drop_column('student_profiles', 'phone_number')
    op.drop_column('student_profiles', 'preferred_language')
    op.drop_column('student_profiles', 'semester_id')
    op.drop_column('student_profiles', 'academic_year_id')
    op.drop_column('student_profiles', 'programme_id')
    op.drop_column('student_profiles', 'institution_id')

    op.drop_column('users', 'last_login_at')
    op.drop_column('users', 'locked_until')
    op.drop_column('users', 'failed_login_count')
    op.drop_column('users', 'account_status')
