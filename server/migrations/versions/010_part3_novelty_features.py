"""add_part3_novelty_features_tables

Revision ID: 010_part3_novelty_features
Revises: 978cabdbae02
Create Date: 2026-10-05 10:00:00.000000+00:00

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = '010_part3_novelty_features'
down_revision: Union[str, None] = '978cabdbae02'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    # 1. Certificates & Verifications
    op.create_table(
        'certificates',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('student_id', sa.UUID(), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('programme_id', sa.UUID(), sa.ForeignKey('programmes.id', ondelete='SET NULL'), nullable=True),
        sa.Column('certificate_hash', sa.String(length=64), nullable=False),
        sa.Column('blockchain_tx_hash', sa.String(length=66), nullable=False),
        sa.Column('block_number', sa.Integer(), nullable=False, server_default='48921820'),
        sa.Column('network', sa.String(length=50), nullable=False, server_default='Polygon Amoy Testnet'),
        sa.Column('contract_address', sa.String(length=66), nullable=False, server_default='0x71C95911E9a5D330f4D621842EC243EE1343292e'),
        sa.Column('qr_code_data', sa.Text(), nullable=True),
        sa.Column('metadata_json', sa.JSON(), nullable=True),
        sa.Column('issued_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('revoked_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('revocation_reason', sa.String(length=255), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('certificate_hash')
    )
    op.create_index('ix_certificates_student_id', 'certificates', ['student_id'])
    op.create_index('ix_certificates_certificate_hash', 'certificates', ['certificate_hash'])

    op.create_table(
        'certificate_verifications',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('certificate_id', sa.UUID(), sa.ForeignKey('certificates.id', ondelete='CASCADE'), nullable=False),
        sa.Column('verified_by', sa.String(length=255), nullable=False, server_default='Public Employer / Recruiter'),
        sa.Column('verified_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('ip_address', sa.String(length=100), nullable=False, server_default='127.0.0.1'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_certificate_verifications_cert_id', 'certificate_verifications', ['certificate_id'])

    # 2. Wellness
    op.create_table(
        'wellness_checkins',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('student_id', sa.UUID(), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('mood_score', sa.Integer(), nullable=False),
        sa.Column('stress_level', sa.Integer(), nullable=False),
        sa.Column('sleep_hours', sa.Float(), nullable=False),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('is_anonymous', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_wellness_checkins_student_id', 'wellness_checkins', ['student_id'])

    op.create_table(
        'wellness_alerts',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('student_id', sa.UUID(), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('alert_type', sa.String(length=100), nullable=False, server_default='STRESS_SPIKE'),
        sa.Column('severity', sa.String(length=50), nullable=False, server_default='MEDIUM'),
        sa.Column('recommended_action', sa.Text(), nullable=False),
        sa.Column('status', sa.String(length=50), nullable=False, server_default='ACTIVE'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_wellness_alerts_student_id', 'wellness_alerts', ['student_id'])

    op.create_table(
        'counselor_sessions',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('student_id', sa.UUID(), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('counselor_id', sa.UUID(), sa.ForeignKey('users.id', ondelete='SET NULL'), nullable=True),
        sa.Column('scheduled_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('completed_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('status', sa.String(length=50), nullable=False, server_default='SCHEDULED'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_counselor_sessions_student_id', 'counselor_sessions', ['student_id'])

    # 3. AR/VR Exams
    op.create_table(
        'vr_exams',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('subject_id', sa.UUID(), sa.ForeignKey('subjects.id', ondelete='SET NULL'), nullable=True),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('vr_scene_url', sa.String(length=500), nullable=False),
        sa.Column('duration_minutes', sa.Integer(), nullable=False, server_default='45'),
        sa.Column('created_by', sa.UUID(), sa.ForeignKey('users.id', ondelete='SET NULL'), nullable=True),
        sa.Column('experiment_type', sa.String(length=100), nullable=False, server_default='PHYSICS_OPTICS'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )

    op.create_table(
        'vr_attempts',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('vr_exam_id', sa.UUID(), sa.ForeignKey('vr_exams.id', ondelete='CASCADE'), nullable=False),
        sa.Column('student_id', sa.UUID(), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('started_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('completed_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('score', sa.Float(), nullable=False, server_default='0.0'),
        sa.Column('interaction_log', sa.JSON(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_vr_attempts_exam_id', 'vr_attempts', ['vr_exam_id'])
    op.create_index('ix_vr_attempts_student_id', 'vr_attempts', ['student_id'])

    # 4. Global Benchmarking
    op.create_table(
        'global_universities',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('country', sa.String(length=100), nullable=False),
        sa.Column('ranking', sa.Integer(), nullable=False),
        sa.Column('co_standards', sa.JSON(), nullable=True),
        sa.Column('placement_rate', sa.Float(), nullable=False, server_default='95.0'),
        sa.Column('avg_salary_usd', sa.Float(), nullable=False, server_default='115000.0'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('name')
    )

    op.create_table(
        'global_benchmarks',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('institution_id', sa.UUID(), sa.ForeignKey('institutions.id', ondelete='CASCADE'), nullable=True),
        sa.Column('global_university_id', sa.UUID(), sa.ForeignKey('global_universities.id', ondelete='CASCADE'), nullable=False),
        sa.Column('metric_name', sa.String(length=100), nullable=False),
        sa.Column('our_value', sa.Float(), nullable=False),
        sa.Column('their_value', sa.Float(), nullable=False),
        sa.Column('gap', sa.Float(), nullable=False),
        sa.Column('recommendation', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )

    op.create_table(
        'best_practices',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('category', sa.String(length=100), nullable=False),
        sa.Column('practice', sa.String(length=255), nullable=False),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('source', sa.String(length=255), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )

    # 5. Alumni
    op.create_table(
        'alumni',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('student_id', sa.UUID(), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('graduation_year', sa.Integer(), nullable=False),
        sa.Column('current_company', sa.String(length=255), nullable=False),
        sa.Column('job_role', sa.String(length=255), nullable=False),
        sa.Column('package', sa.Float(), nullable=False),
        sa.Column('linkedin_url', sa.String(length=500), nullable=True),
        sa.Column('domain', sa.String(length=100), nullable=False, server_default='SOFTWARE_DEVELOPMENT'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('student_id')
    )

    op.create_table(
        'alumni_feedback',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('alumni_id', sa.UUID(), sa.ForeignKey('alumni.id', ondelete='CASCADE'), nullable=False),
        sa.Column('co_feedback', sa.JSON(), nullable=True),
        sa.Column('curriculum_suggestions', sa.Text(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )

    op.create_table(
        'alumni_achievements',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('alumni_id', sa.UUID(), sa.ForeignKey('alumni.id', ondelete='CASCADE'), nullable=False),
        sa.Column('achievement_type', sa.String(length=100), nullable=False),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('date', sa.DateTime(timezone=True), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )

    # 6. Question Calibration
    op.create_table(
        'question_calibrations',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('question_id', sa.UUID(), sa.ForeignKey('questions.id', ondelete='CASCADE'), nullable=False),
        sa.Column('batch_id', sa.String(length=100), nullable=True),
        sa.Column('avg_score', sa.Float(), nullable=False, server_default='0.0'),
        sa.Column('difficulty_index', sa.Float(), nullable=False, server_default='0.5'),
        sa.Column('discrimination_index', sa.Float(), nullable=False, server_default='0.3'),
        sa.Column('sample_size', sa.Integer(), nullable=False, server_default='50'),
        sa.Column('calibrated_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_question_calibrations_qid', 'question_calibrations', ['question_id'])

    op.create_table(
        'question_flags',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('question_id', sa.UUID(), sa.ForeignKey('questions.id', ondelete='CASCADE'), nullable=False),
        sa.Column('flag_type', sa.String(length=100), nullable=False),
        sa.Column('reason', sa.Text(), nullable=False),
        sa.Column('suggested_action', sa.Text(), nullable=False),
        sa.Column('status', sa.String(length=50), nullable=False, server_default='OPEN'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_question_flags_qid', 'question_flags', ['question_id'])

    # 7. Seating Arrangement
    op.create_table(
        'exam_halls',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('institution_id', sa.UUID(), sa.ForeignKey('institutions.id', ondelete='SET NULL'), nullable=True),
        sa.Column('name', sa.String(length=100), nullable=False),
        sa.Column('rows', sa.Integer(), nullable=False, server_default='6'),
        sa.Column('columns', sa.Integer(), nullable=False, server_default='6'),
        sa.Column('capacity', sa.Integer(), nullable=False, server_default='36'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )

    op.create_table(
        'seating_arrangements',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('exam_id', sa.UUID(), sa.ForeignKey('examinations.id', ondelete='CASCADE'), nullable=False),
        sa.Column('hall_id', sa.UUID(), sa.ForeignKey('exam_halls.id', ondelete='CASCADE'), nullable=False),
        sa.Column('student_id', sa.UUID(), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('row_number', sa.Integer(), nullable=False),
        sa.Column('column_number', sa.Integer(), nullable=False),
        sa.Column('seat_label', sa.String(length=20), nullable=False),
        sa.Column('generated_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_seating_exam_id', 'seating_arrangements', ['exam_id'])

    op.create_table(
        'seating_constraints',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('exam_id', sa.UUID(), sa.ForeignKey('examinations.id', ondelete='CASCADE'), nullable=False),
        sa.Column('constraint_type', sa.String(length=100), nullable=False, server_default='SEPARATE_STUDENTS'),
        sa.Column('student_a_id', sa.UUID(), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=True),
        sa.Column('student_b_id', sa.UUID(), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=True),
        sa.Column('reason', sa.Text(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )

    # 8. Timetable
    op.create_table(
        'timetables',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('institution_id', sa.UUID(), sa.ForeignKey('institutions.id', ondelete='CASCADE'), nullable=True),
        sa.Column('semester', sa.Integer(), nullable=False, server_default='1'),
        sa.Column('academic_year', sa.String(length=50), nullable=False, server_default='2025-2026'),
        sa.Column('generated_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('status', sa.String(length=50), nullable=False, server_default='PUBLISHED'),
        sa.Column('optimization_score', sa.Float(), nullable=False, server_default='98.5'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )

    op.create_table(
        'timetable_slots',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('timetable_id', sa.UUID(), sa.ForeignKey('timetables.id', ondelete='CASCADE'), nullable=False),
        sa.Column('day', sa.String(length=20), nullable=False),
        sa.Column('start_time', sa.String(length=10), nullable=False),
        sa.Column('end_time', sa.String(length=10), nullable=False),
        sa.Column('subject_id', sa.UUID(), sa.ForeignKey('subjects.id', ondelete='SET NULL'), nullable=True),
        sa.Column('faculty_id', sa.UUID(), sa.ForeignKey('users.id', ondelete='SET NULL'), nullable=True),
        sa.Column('room_id', sa.String(length=100), nullable=False, server_default='LH-101'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )

    op.create_table(
        'timetable_conflicts',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('timetable_id', sa.UUID(), sa.ForeignKey('timetables.id', ondelete='CASCADE'), nullable=False),
        sa.Column('conflict_type', sa.String(length=100), nullable=False),
        sa.Column('slot_a_id', sa.UUID(), sa.ForeignKey('timetable_slots.id', ondelete='CASCADE'), nullable=False),
        sa.Column('slot_b_id', sa.UUID(), sa.ForeignKey('timetable_slots.id', ondelete='CASCADE'), nullable=False),
        sa.Column('resolved', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('resolution_notes', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )

    # 9. Fees
    op.create_table(
        'fee_structures',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('programme_id', sa.UUID(), sa.ForeignKey('programmes.id', ondelete='SET NULL'), nullable=True),
        sa.Column('semester', sa.Integer(), nullable=False),
        sa.Column('amount', sa.Float(), nullable=False),
        sa.Column('due_date', sa.DateTime(timezone=True), nullable=False),
        sa.Column('fee_head', sa.String(length=100), nullable=False, server_default='Tuition & Examination Fee'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )

    op.create_table(
        'fee_payments',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('student_id', sa.UUID(), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('fee_structure_id', sa.UUID(), sa.ForeignKey('fee_structures.id', ondelete='CASCADE'), nullable=False),
        sa.Column('amount_paid', sa.Float(), nullable=False),
        sa.Column('payment_date', sa.DateTime(timezone=True), nullable=False),
        sa.Column('transaction_id', sa.String(length=100), nullable=False),
        sa.Column('payment_mode', sa.String(length=50), nullable=False, server_default='UPI'),
        sa.Column('receipt_number', sa.String(length=50), nullable=False),
        sa.Column('status', sa.String(length=50), nullable=False, server_default='SUCCESS'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('transaction_id'),
        sa.UniqueConstraint('receipt_number')
    )
    op.create_index('ix_fee_payments_student_id', 'fee_payments', ['student_id'])

    op.create_table(
        'fee_reminders',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('student_id', sa.UUID(), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('fee_structure_id', sa.UUID(), sa.ForeignKey('fee_structures.id', ondelete='CASCADE'), nullable=False),
        sa.Column('reminder_type', sa.String(length=50), nullable=False, server_default='EMAIL'),
        sa.Column('sent_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('status', sa.String(length=50), nullable=False, server_default='SENT'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )

    # 10. Hostel
    op.create_table(
        'hostels',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('institution_id', sa.UUID(), sa.ForeignKey('institutions.id', ondelete='SET NULL'), nullable=True),
        sa.Column('name', sa.String(length=100), nullable=False),
        sa.Column('type', sa.String(length=50), nullable=False, server_default='MENS'),
        sa.Column('total_rooms', sa.Integer(), nullable=False, server_default='50'),
        sa.Column('warden_name', sa.String(length=100), nullable=False, server_default='Dr. K. Ramanathan'),
        sa.Column('contact_number', sa.String(length=50), nullable=False, server_default='+91 98401 23456'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )

    op.create_table(
        'hostel_rooms',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('hostel_id', sa.UUID(), sa.ForeignKey('hostels.id', ondelete='CASCADE'), nullable=False),
        sa.Column('room_number', sa.String(length=50), nullable=False),
        sa.Column('floor', sa.Integer(), nullable=False, server_default='1'),
        sa.Column('capacity', sa.Integer(), nullable=False, server_default='2'),
        sa.Column('occupied', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_hostel_rooms_hostel_id', 'hostel_rooms', ['hostel_id'])

    op.create_table(
        'hostel_allocations',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('student_id', sa.UUID(), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('room_id', sa.UUID(), sa.ForeignKey('hostel_rooms.id', ondelete='CASCADE'), nullable=False),
        sa.Column('allocated_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('vacated_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('status', sa.String(length=50), nullable=False, server_default='ALLOCATED'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_hostel_allocations_student_id', 'hostel_allocations', ['student_id'])

    op.create_table(
        'hostel_complaints',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('student_id', sa.UUID(), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('room_id', sa.UUID(), sa.ForeignKey('hostel_rooms.id', ondelete='SET NULL'), nullable=True),
        sa.Column('complaint_type', sa.String(length=100), nullable=False, server_default='MAINTENANCE'),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('status', sa.String(length=50), nullable=False, server_default='PENDING'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('resolved_at', sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_hostel_complaints_student_id', 'hostel_complaints', ['student_id'])

def downgrade() -> None:
    op.drop_table('hostel_complaints')
    op.drop_table('hostel_allocations')
    op.drop_table('hostel_rooms')
    op.drop_table('hostels')
    op.drop_table('fee_reminders')
    op.drop_table('fee_payments')
    op.drop_table('fee_structures')
    op.drop_table('timetable_conflicts')
    op.drop_table('timetable_slots')
    op.drop_table('timetables')
    op.drop_table('seating_constraints')
    op.drop_table('seating_arrangements')
    op.drop_table('exam_halls')
    op.drop_table('question_flags')
    op.drop_table('question_calibrations')
    op.drop_table('alumni_achievements')
    op.drop_table('alumni_feedback')
    op.drop_table('alumni')
    op.drop_table('best_practices')
    op.drop_table('global_benchmarks')
    op.drop_table('global_universities')
    op.drop_table('vr_attempts')
    op.drop_table('vr_exams')
    op.drop_table('counselor_sessions')
    op.drop_table('wellness_alerts')
    op.drop_table('wellness_checkins')
    op.drop_table('certificate_verifications')
    op.drop_table('certificates')
