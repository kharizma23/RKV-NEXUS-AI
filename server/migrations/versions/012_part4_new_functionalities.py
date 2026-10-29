"""012_part4_new_functionalities

Revision ID: 012_part4_new_functionalities
Revises: 011_exam_conduction_evaluation_modules
Create Date: 2026-10-05 14:30:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = '012_part4_new_functionalities'
down_revision = '011_exam_conduction_evaluation_modules'
branch_labels = None
depends_on = None

def upgrade():
    # 1. Doubts
    op.create_table(
        'student_doubts',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('student_id', sa.UUID(), nullable=False),
        sa.Column('subject_id', sa.UUID(), nullable=True),
        sa.Column('concept', sa.String(length=200), nullable=False),
        sa.Column('doubt_description', sa.Text(), nullable=False),
        sa.Column('detected_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('resolved', sa.Boolean(), nullable=False),
        sa.ForeignKeyConstraint(['student_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_table(
        'doubt_micro_lessons',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('doubt_id', sa.UUID(), nullable=False),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('resource_url', sa.String(length=500), nullable=True),
        sa.Column('estimated_minutes', sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(['doubt_id'], ['student_doubts.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_table(
        'class_doubts',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('subject_id', sa.UUID(), nullable=True),
        sa.Column('concept', sa.String(length=200), nullable=False),
        sa.Column('frequency', sa.Integer(), nullable=False),
        sa.Column('last_detected', sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )

    # 2. Student 360
    op.create_table(
        'student_360',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('student_id', sa.UUID(), nullable=False),
        sa.Column('academic_score', sa.Float(), nullable=False),
        sa.Column('attendance_rate', sa.Float(), nullable=False),
        sa.Column('wellness_score', sa.Float(), nullable=False),
        sa.Column('skill_score', sa.Float(), nullable=False),
        sa.Column('placement_readiness', sa.Float(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['student_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('student_id')
    )
    op.create_table(
        'profile_snapshots',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('student_id', sa.UUID(), nullable=False),
        sa.Column('snapshot_data', sa.JSON(), nullable=False),
        sa.Column('generated_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['student_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )

    # 3. Revision Schedules
    op.create_table(
        'revision_schedules',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('student_id', sa.UUID(), nullable=False),
        sa.Column('subject_id', sa.UUID(), nullable=True),
        sa.Column('topic', sa.String(length=200), nullable=False),
        sa.Column('revision_date', sa.DateTime(timezone=True), nullable=False),
        sa.Column('status', sa.String(length=50), nullable=False),
        sa.Column('completed_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['student_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_table(
        'revision_reminders',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('schedule_id', sa.UUID(), nullable=False),
        sa.Column('reminder_type', sa.String(length=50), nullable=False),
        sa.Column('sent_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('acknowledged', sa.Boolean(), nullable=False),
        sa.ForeignKeyConstraint(['schedule_id'], ['revision_schedules.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )

    # 4. Lectures
    op.create_table(
        'lectures',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('faculty_id', sa.UUID(), nullable=False),
        sa.Column('subject_id', sa.UUID(), nullable=True),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('video_url', sa.String(length=500), nullable=False),
        sa.Column('uploaded_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['faculty_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_table(
        'lecture_summaries',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('lecture_id', sa.UUID(), nullable=False),
        sa.Column('summary_text', sa.Text(), nullable=False),
        sa.Column('key_points', sa.JSON(), nullable=False),
        sa.Column('generated_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['lecture_id'], ['lectures.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('lecture_id')
    )
    op.create_table(
        'lecture_mcqs',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('lecture_id', sa.UUID(), nullable=False),
        sa.Column('question_text', sa.Text(), nullable=False),
        sa.Column('options', sa.JSON(), nullable=False),
        sa.Column('correct_answer', sa.String(length=255), nullable=False),
        sa.Column('co_number', sa.String(length=50), nullable=False),
        sa.ForeignKeyConstraint(['lecture_id'], ['lectures.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )

    # 5. Faculty Performance
    op.create_table(
        'faculty_performance',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('faculty_id', sa.UUID(), nullable=False),
        sa.Column('subject_id', sa.UUID(), nullable=True),
        sa.Column('avg_co_attainment', sa.Float(), nullable=False),
        sa.Column('student_feedback_score', sa.Float(), nullable=False),
        sa.Column('exam_quality_score', sa.Float(), nullable=False),
        sa.Column('performance_index', sa.Float(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['faculty_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_table(
        'performance_recommendations',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('faculty_id', sa.UUID(), nullable=False),
        sa.Column('recommendation_text', sa.Text(), nullable=False),
        sa.Column('generated_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['faculty_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )

    # 6. Attendance
    op.create_table(
        'attendance_sessions',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('faculty_id', sa.UUID(), nullable=False),
        sa.Column('subject_id', sa.UUID(), nullable=True),
        sa.Column('qr_code', sa.String(length=500), nullable=False),
        sa.Column('valid_from', sa.DateTime(timezone=True), nullable=False),
        sa.Column('valid_until', sa.DateTime(timezone=True), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['faculty_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_table(
        'attendance_records',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('session_id', sa.UUID(), nullable=False),
        sa.Column('student_id', sa.UUID(), nullable=False),
        sa.Column('marked_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('latitude', sa.Float(), nullable=True),
        sa.Column('longitude', sa.Float(), nullable=True),
        sa.ForeignKeyConstraint(['session_id'], ['attendance_sessions.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['student_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )

    # 7. Portfolios
    op.create_table(
        'portfolios',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('student_id', sa.UUID(), nullable=False),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('bio', sa.Text(), nullable=False),
        sa.Column('public_url', sa.String(length=255), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['student_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('student_id'),
        sa.UniqueConstraint('public_url')
    )
    op.create_table(
        'portfolio_items',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('portfolio_id', sa.UUID(), nullable=False),
        sa.Column('item_type', sa.String(length=50), nullable=False),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('evidence_url', sa.String(length=500), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['portfolio_id'], ['portfolios.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )

    # 8 & 13. Exam Variants
    op.create_table(
        'exam_variants',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('exam_id', sa.UUID(), nullable=True),
        sa.Column('variant_number', sa.Integer(), nullable=False),
        sa.Column('questions', sa.JSON(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_table(
        'variant_assignments',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('variant_id', sa.UUID(), nullable=False),
        sa.Column('student_id', sa.UUID(), nullable=False),
        sa.Column('assigned_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['variant_id'], ['exam_variants.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['student_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )

    # 9. Career Predictions
    op.create_table(
        'career_predictions',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('student_id', sa.UUID(), nullable=False),
        sa.Column('predicted_role', sa.String(length=200), nullable=False),
        sa.Column('confidence', sa.Float(), nullable=False),
        sa.Column('skill_gaps', sa.JSON(), nullable=False),
        sa.Column('recommended_certifications', sa.JSON(), nullable=False),
        sa.Column('generated_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['student_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('student_id')
    )
    op.create_table(
        'career_roles',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('role_name', sa.String(length=200), nullable=False),
        sa.Column('required_skills', sa.JSON(), nullable=False),
        sa.Column('avg_package', sa.String(length=50), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('role_name')
    )

    # 10. Mental Health
    op.create_table(
        'mental_health_alerts',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('student_id', sa.UUID(), nullable=False),
        sa.Column('alert_type', sa.String(length=100), nullable=False),
        sa.Column('severity', sa.String(length=50), nullable=False),
        sa.Column('detected_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('status', sa.String(length=50), nullable=False),
        sa.ForeignKeyConstraint(['student_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_table(
        'counselor_interventions',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('alert_id', sa.UUID(), nullable=False),
        sa.Column('counselor_id', sa.UUID(), nullable=False),
        sa.Column('notes', sa.Text(), nullable=False),
        sa.Column('scheduled_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['alert_id'], ['mental_health_alerts.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['counselor_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )

    # 11. Competitions
    op.create_table(
        'competitions',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('category', sa.String(length=100), nullable=False),
        sa.Column('start_date', sa.DateTime(timezone=True), nullable=False),
        sa.Column('end_date', sa.DateTime(timezone=True), nullable=False),
        sa.Column('status', sa.String(length=50), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_table(
        'competition_entries',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('competition_id', sa.UUID(), nullable=False),
        sa.Column('institution_id', sa.UUID(), nullable=True),
        sa.Column('score', sa.Float(), nullable=False),
        sa.Column('rank', sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(['competition_id'], ['competitions.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_table(
        'competition_metrics',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('competition_id', sa.UUID(), nullable=False),
        sa.Column('metric_name', sa.String(length=100), nullable=False),
        sa.Column('weight', sa.Float(), nullable=False),
        sa.ForeignKeyConstraint(['competition_id'], ['competitions.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )

    # 12. Content Recommendations
    op.create_table(
        'content_recommendations',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('student_id', sa.UUID(), nullable=False),
        sa.Column('topic', sa.String(length=200), nullable=False),
        sa.Column('content_type', sa.String(length=50), nullable=False),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('url', sa.String(length=500), nullable=False),
        sa.Column('source', sa.String(length=100), nullable=False),
        sa.Column('recommended_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['student_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_table(
        'content_library',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('topic', sa.String(length=200), nullable=False),
        sa.Column('content_type', sa.String(length=50), nullable=False),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('url', sa.String(length=500), nullable=False),
        sa.Column('source', sa.String(length=100), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )

    # 14. Digital IDs
    op.create_table(
        'digital_ids',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('student_id', sa.UUID(), nullable=False),
        sa.Column('qr_code', sa.String(length=500), nullable=False),
        sa.Column('issued_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('expires_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['student_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('student_id')
    )

    # 15. Live Engagement
    op.create_table(
        'live_sessions',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('faculty_id', sa.UUID(), nullable=False),
        sa.Column('subject_id', sa.UUID(), nullable=True),
        sa.Column('started_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('ended_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['faculty_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_table(
        'engagement_logs',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('session_id', sa.UUID(), nullable=False),
        sa.Column('student_id', sa.UUID(), nullable=False),
        sa.Column('attention_score', sa.Float(), nullable=False),
        sa.Column('interaction_count', sa.Integer(), nullable=False),
        sa.Column('timestamp', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['session_id'], ['live_sessions.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['student_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )

def downgrade():
    op.drop_table('engagement_logs')
    op.drop_table('live_sessions')
    op.drop_table('digital_ids')
    op.drop_table('content_library')
    op.drop_table('content_recommendations')
    op.drop_table('competition_metrics')
    op.drop_table('competition_entries')
    op.drop_table('competitions')
    op.drop_table('counselor_interventions')
    op.drop_table('mental_health_alerts')
    op.drop_table('career_roles')
    op.drop_table('career_predictions')
    op.drop_table('variant_assignments')
    op.drop_table('exam_variants')
    op.drop_table('portfolio_items')
    op.drop_table('portfolios')
    op.drop_table('attendance_records')
    op.drop_table('attendance_sessions')
    op.drop_table('performance_recommendations')
    op.drop_table('faculty_performance')
    op.drop_table('lecture_mcqs')
    op.drop_table('lecture_summaries')
    op.drop_table('lectures')
    op.drop_table('revision_reminders')
    op.drop_table('revision_schedules')
    op.drop_table('profile_snapshots')
    op.drop_table('student_360')
    op.drop_table('class_doubts')
    op.drop_table('doubt_micro_lessons')
    op.drop_table('student_doubts')
