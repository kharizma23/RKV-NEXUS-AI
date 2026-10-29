"""011_exam_conduction_evaluation_modules

Revision ID: 011_exam_conduction_evaluation_modules
Revises: 010_part3_novelty_features
Create Date: 2026-10-05 13:40:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '011_exam_conduction_evaluation_modules'
down_revision = '010_part3_novelty_features'
branch_labels = None
depends_on = None

def upgrade():
    # Proctoring
    op.create_table(
        'proctoring_sessions',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('exam_id', sa.UUID(), nullable=False),
        sa.Column('student_id', sa.UUID(), nullable=False),
        sa.Column('started_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('ended_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('status', sa.String(length=50), nullable=False),
        sa.Column('risk_score', sa.Float(), nullable=False),
        sa.ForeignKeyConstraint(['exam_id'], ['examinations.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['student_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_table(
        'proctoring_events',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('session_id', sa.UUID(), nullable=False),
        sa.Column('event_type', sa.String(length=100), nullable=False),
        sa.Column('timestamp', sa.DateTime(timezone=True), nullable=False),
        sa.Column('severity', sa.String(length=30), nullable=False),
        sa.Column('evidence_url', sa.String(length=500), nullable=True),
        sa.Column('reviewed_by', sa.UUID(), nullable=True),
        sa.ForeignKeyConstraint(['session_id'], ['proctoring_sessions.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['reviewed_by'], ['users.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_table(
        'proctoring_flags',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('session_id', sa.UUID(), nullable=False),
        sa.Column('flag_type', sa.String(length=100), nullable=False),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('resolved', sa.Boolean(), nullable=False),
        sa.Column('resolved_by', sa.UUID(), nullable=True),
        sa.Column('resolved_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['session_id'], ['proctoring_sessions.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['resolved_by'], ['users.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id')
    )

    # Emotions
    op.create_table(
        'emotion_logs',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('exam_id', sa.UUID(), nullable=False),
        sa.Column('student_id', sa.UUID(), nullable=False),
        sa.Column('emotion', sa.String(length=50), nullable=False),
        sa.Column('confidence', sa.Float(), nullable=False),
        sa.Column('timestamp', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['exam_id'], ['examinations.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['student_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_table(
        'emotion_interventions',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('exam_id', sa.UUID(), nullable=False),
        sa.Column('student_id', sa.UUID(), nullable=False),
        sa.Column('intervention_type', sa.String(length=100), nullable=False),
        sa.Column('triggered_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('accepted', sa.Boolean(), nullable=False),
        sa.ForeignKeyConstraint(['exam_id'], ['examinations.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['student_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )

    # Group Exams
    op.create_table(
        'group_exams',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('exam_id', sa.UUID(), nullable=False),
        sa.Column('group_size', sa.Integer(), nullable=False),
        sa.Column('created_by', sa.UUID(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['created_by'], ['users.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['exam_id'], ['examinations.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_table(
        'exam_groups',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('group_exam_id', sa.UUID(), nullable=False),
        sa.Column('name', sa.String(length=100), nullable=False),
        sa.Column('leader_id', sa.UUID(), nullable=True),
        sa.ForeignKeyConstraint(['group_exam_id'], ['group_exams.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['leader_id'], ['users.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_table(
        'group_members',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('group_id', sa.UUID(), nullable=False),
        sa.Column('student_id', sa.UUID(), nullable=False),
        sa.Column('role', sa.String(length=50), nullable=False),
        sa.ForeignKeyConstraint(['group_id'], ['exam_groups.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['student_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_table(
        'group_submissions',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('group_id', sa.UUID(), nullable=False),
        sa.Column('question_id', sa.UUID(), nullable=False),
        sa.Column('answer', sa.Text(), nullable=False),
        sa.Column('submitted_by', sa.UUID(), nullable=False),
        sa.Column('submitted_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['group_id'], ['exam_groups.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['question_id'], ['questions.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['submitted_by'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_table(
        'group_scores',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('group_id', sa.UUID(), nullable=False),
        sa.Column('group_score', sa.Float(), nullable=False),
        sa.Column('individual_scores', sa.JSON(), nullable=False),
        sa.ForeignKeyConstraint(['group_id'], ['exam_groups.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )

    # Gamified Exams
    op.create_table(
        'gamified_exams',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('exam_id', sa.UUID(), nullable=False),
        sa.Column('levels', sa.Integer(), nullable=False),
        sa.Column('created_by', sa.UUID(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['created_by'], ['users.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['exam_id'], ['examinations.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_table(
        'exam_levels',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('gamified_exam_id', sa.UUID(), nullable=False),
        sa.Column('level_number', sa.Integer(), nullable=False),
        sa.Column('difficulty', sa.String(length=50), nullable=False),
        sa.Column('points', sa.Integer(), nullable=False),
        sa.Column('boss_question', sa.Text(), nullable=True),
        sa.ForeignKeyConstraint(['gamified_exam_id'], ['gamified_exams.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_table(
        'level_progress',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('student_id', sa.UUID(), nullable=False),
        sa.Column('level_id', sa.UUID(), nullable=False),
        sa.Column('completed_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('score', sa.Float(), nullable=False),
        sa.ForeignKeyConstraint(['level_id'], ['exam_levels.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['student_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )

    # Offline Exams
    op.create_table(
        'offline_exams',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('exam_id', sa.UUID(), nullable=False),
        sa.Column('student_id', sa.UUID(), nullable=False),
        sa.Column('downloaded_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('synced_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('status', sa.String(length=50), nullable=False),
        sa.ForeignKeyConstraint(['exam_id'], ['examinations.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['student_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_table(
        'offline_answers',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('offline_exam_id', sa.UUID(), nullable=False),
        sa.Column('question_id', sa.UUID(), nullable=False),
        sa.Column('answer', sa.Text(), nullable=False),
        sa.Column('saved_locally', sa.Boolean(), nullable=False),
        sa.ForeignKeyConstraint(['offline_exam_id'], ['offline_exams.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['question_id'], ['questions.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )

    # Voice Exam Config
    op.create_table(
        'voice_exams',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('exam_id', sa.UUID(), nullable=False),
        sa.Column('enabled_languages', sa.JSON(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['exam_id'], ['examinations.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )

    # Flexible Exams
    op.create_table(
        'flexible_exams',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('exam_id', sa.UUID(), nullable=False),
        sa.Column('window_start', sa.DateTime(timezone=True), nullable=False),
        sa.Column('window_end', sa.DateTime(timezone=True), nullable=False),
        sa.Column('duration_minutes', sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(['exam_id'], ['examinations.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_table(
        'flexible_attempts',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('flexible_exam_id', sa.UUID(), nullable=False),
        sa.Column('student_id', sa.UUID(), nullable=False),
        sa.Column('started_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('submitted_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('time_taken', sa.Integer(), nullable=True),
        sa.ForeignKeyConstraint(['flexible_exam_id'], ['flexible_exams.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['student_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )

    # Peer Assessment
    op.create_table(
        'peer_assessments',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('exam_id', sa.UUID(), nullable=False),
        sa.Column('evaluator_id', sa.UUID(), nullable=False),
        sa.Column('evaluatee_id', sa.UUID(), nullable=False),
        sa.Column('question_id', sa.UUID(), nullable=False),
        sa.Column('marks', sa.Float(), nullable=False),
        sa.Column('feedback', sa.Text(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['evaluator_id'], ['users.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['evaluatee_id'], ['users.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['exam_id'], ['examinations.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['question_id'], ['questions.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_table(
        'peer_validation',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('assessment_id', sa.UUID(), nullable=False),
        sa.Column('ai_score', sa.Float(), nullable=False),
        sa.Column('faculty_score', sa.Float(), nullable=True),
        sa.Column('status', sa.String(length=50), nullable=False),
        sa.ForeignKeyConstraint(['assessment_id'], ['peer_assessments.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )

    # Counterfactual
    op.create_table(
        'counterfactual_feedback',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('submission_id', sa.UUID(), nullable=False),
        sa.Column('feedback_text', sa.Text(), nullable=False),
        sa.Column('additional_marks_possible', sa.Float(), nullable=False),
        sa.Column('suggested_improvements', sa.Text(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['submission_id'], ['student_answers.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )

    # Skill Evaluation
    op.create_table(
        'skill_evaluations',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('submission_id', sa.UUID(), nullable=False),
        sa.Column('critical_thinking', sa.Float(), nullable=False),
        sa.Column('problem_solving', sa.Float(), nullable=False),
        sa.Column('communication', sa.Float(), nullable=False),
        sa.Column('creativity', sa.Float(), nullable=False),
        sa.Column('evaluated_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['submission_id'], ['student_answers.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_table(
        'skill_mappings',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('co_id', sa.UUID(), nullable=False),
        sa.Column('skill_id', sa.String(length=100), nullable=False),
        sa.Column('proficiency_level', sa.String(length=50), nullable=False),
        sa.ForeignKeyConstraint(['co_id'], ['course_outcomes.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )

    # Confidence Scores
    op.create_table(
        'confidence_scores',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('submission_id', sa.UUID(), nullable=False),
        sa.Column('question_id', sa.UUID(), nullable=False),
        sa.Column('ai_marks', sa.Float(), nullable=False),
        sa.Column('confidence_percentage', sa.Float(), nullable=False),
        sa.Column('review_needed', sa.Boolean(), nullable=False),
        sa.Column('calculated_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['question_id'], ['questions.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['submission_id'], ['student_answers.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )

    # Multi-Evaluator Consensus
    op.create_table(
        'multi_evaluations',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('submission_id', sa.UUID(), nullable=False),
        sa.Column('model_a_score', sa.Float(), nullable=False),
        sa.Column('model_b_score', sa.Float(), nullable=False),
        sa.Column('model_c_score', sa.Float(), nullable=False),
        sa.Column('consensus_score', sa.Float(), nullable=False),
        sa.Column('disagreement', sa.Boolean(), nullable=False),
        sa.Column('faculty_override_score', sa.Float(), nullable=True),
        sa.Column('evaluated_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['submission_id'], ['student_answers.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )

    # Learning Styles
    op.create_table(
        'learning_styles',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('student_id', sa.UUID(), nullable=False),
        sa.Column('style', sa.String(length=50), nullable=False),
        sa.Column('confidence', sa.Float(), nullable=False),
        sa.Column('assessed_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['student_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_table(
        'style_questions',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('question_id', sa.UUID(), nullable=False),
        sa.Column('style_type', sa.String(length=50), nullable=False),
        sa.ForeignKeyConstraint(['question_id'], ['questions.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )

    # Improvement Scores
    op.create_table(
        'improvement_scores',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('student_id', sa.UUID(), nullable=False),
        sa.Column('current_exam_id', sa.UUID(), nullable=False),
        sa.Column('previous_exam_id', sa.UUID(), nullable=True),
        sa.Column('improvement_percentage', sa.Float(), nullable=False),
        sa.Column('bonus_marks', sa.Float(), nullable=False),
        sa.Column('calculated_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['current_exam_id'], ['examinations.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['previous_exam_id'], ['examinations.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['student_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )

    # Industry Experts & Validation
    op.create_table(
        'industry_experts',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('name', sa.String(length=150), nullable=False),
        sa.Column('company', sa.String(length=150), nullable=False),
        sa.Column('expertise', sa.String(length=200), nullable=False),
        sa.Column('email', sa.String(length=255), nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('email')
    )
    op.create_table(
        'industry_reviews',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('submission_id', sa.UUID(), nullable=False),
        sa.Column('expert_id', sa.UUID(), nullable=False),
        sa.Column('score', sa.Float(), nullable=False),
        sa.Column('feedback', sa.Text(), nullable=False),
        sa.Column('validated_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['expert_id'], ['industry_experts.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['submission_id'], ['student_answers.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )

def downgrade():
    op.drop_table('industry_reviews')
    op.drop_table('industry_experts')
    op.drop_table('improvement_scores')
    op.drop_table('style_questions')
    op.drop_table('learning_styles')
    op.drop_table('multi_evaluations')
    op.drop_table('confidence_scores')
    op.drop_table('skill_mappings')
    op.drop_table('skill_evaluations')
    op.drop_table('counterfactual_feedback')
    op.drop_table('peer_validation')
    op.drop_table('peer_assessments')
    op.drop_table('flexible_attempts')
    op.drop_table('flexible_exams')
    op.drop_table('voice_exams')
    op.drop_table('offline_answers')
    op.drop_table('offline_exams')
    op.drop_table('level_progress')
    op.drop_table('exam_levels')
    op.drop_table('gamified_exams')
    op.drop_table('group_scores')
    op.drop_table('group_submissions')
    op.drop_table('group_members')
    op.drop_table('exam_groups')
    op.drop_table('group_exams')
    op.drop_table('emotion_interventions')
    op.drop_table('emotion_logs')
    op.drop_table('proctoring_flags')
    op.drop_table('proctoring_events')
    op.drop_table('proctoring_sessions')
