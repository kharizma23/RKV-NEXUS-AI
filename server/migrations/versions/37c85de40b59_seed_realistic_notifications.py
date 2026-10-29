"""seed_realistic_notifications

Revision ID: 37c85de40b59
Revises: e96594966058
Create Date: 2026-08-03 17:11:45.236404+00:00

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
import uuid
import random
from datetime import datetime, UTC, timedelta

# revision identifiers, used by Alembic.
revision: str = '37c85de40b59'
down_revision: Union[str, None] = 'e96594966058'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    bind = op.get_bind()
    
    # Fetch existing users
    result = bind.execute(sa.text("SELECT id FROM users"))
    user_ids = [row[0] for row in result.all()]
    if not user_ids:
        return

    templates = [
        ("Welcome to the Assessment Platform", "Welcome to Apex Institute's AI Assessment Platform. Access subjects to begin learning.", "ANNOUNCEMENT", "LOW"),
        ("Faculty approved your registration", "Your student portal access registration has been officially approved by the department.", "ANNOUNCEMENT", "MEDIUM"),
        ("Mid Semester Examination scheduled", "The Mid-Semester Examination for Database Management Systems is scheduled for 15 Aug 2026.", "EXAMINATION", "HIGH"),
        ("Assignment due tomorrow", "Your Normalization Assignment in DBMS is due tomorrow by 11:59 PM.", "ASSIGNMENT", "HIGH"),
        ("Results published", "Internal assessment results for Digital Communication have been published. Check your grade overview.", "RESULTS", "HIGH"),
        ("AI generated learning plan ready", "A personalized study route has been computed based on your syllabus benchmarks.", "LEARNING_PLAN", "MEDIUM"),
        ("Attendance alert: below 75%", "Your attendance in Signals and Systems has dropped below 75%. Please attend remaining lectures.", "ACADEMIC", "CRITICAL"),
        ("Project review scheduled", "The Capstone Project Milestone 1 evaluation is scheduled for next Monday.", "ACADEMIC", "MEDIUM"),
        ("Viva schedule released", "Digital Logic Design internal viva timings are updated on the department board.", "EXAMINATION", "MEDIUM"),
        ("CO attainment updated", "Course outcome targets (CO-3) for ECE have been evaluated from latest tests.", "ACADEMIC", "LOW"),
        ("Weak topic detected", "AI detected lower mastery in Fourier Transforms. Review Unit 3 resources.", "LEARNING_PLAN", "CRITICAL"),
        ("Placement drive registration open", "The Apex Tech recruitment drive for software engineering interns has opened.", "PLACEMENT", "HIGH"),
        ("Holiday announcement", "The college will remain closed tomorrow due to regional celebrations.", "ANNOUNCEMENT", "LOW"),
        ("Password changed successfully", "Your account security credentials were changed recently. Contact support if not you.", "ANNOUNCEMENT", "HIGH"),
        ("New course enrolled", "You have been enrolled in advanced Data Structures & Algorithms (CSE-301).", "ACADEMIC", "LOW"),
        ("Faculty uploaded notes", "Dr. Alan Turing uploaded SQL query optimization slides in DBMS module.", "FACULTY", "LOW"),
        ("Internal marks uploaded", "DBMS Quiz 1 grades have been verified and submitted by class coordinator.", "RESULTS", "MEDIUM"),
        ("Final examination timetable released", "The terminal semester theory exams start on 22 Aug 2026.", "EXAMINATION", "HIGH"),
        ("AI recommends revising Data Structures", "Spend 30 minutes on Binary Search Trees today to improve assessment preparedness.", "LEARNING_PLAN", "MEDIUM"),
        ("Project milestone due", "DBMS Course Project Group submission is due in 3 days.", "ASSIGNMENT", "HIGH"),
        ("Mentor meeting tomorrow", "Your monthly advisor consultation is scheduled tomorrow at 2:00 PM.", "FACULTY", "LOW")
    ]

    now = datetime.now(UTC)
    for u_id in user_ids:
        # Seed 150 notifications for each user
        for i in range(150):
            tpl = random.choice(templates)
            notif_id = str(uuid.uuid4())
            created_at = now - timedelta(days=random.randint(0, 45), hours=random.randint(0, 23), minutes=random.randint(0, 59))
            
            bind.execute(sa.text(
                "INSERT INTO notifications (id, title, message, category, priority, sender_type, recipient_type, recipient_id, is_active, created_at, updated_at) "
                "VALUES (:id, :title, :message, :category, :priority, :sender_type, :recipient_type, :recipient_id, :is_active, :created_at, :updated_at)"
            ), {
                "id": notif_id,
                "title": f"{tpl[0]} #{i+1}",
                "message": tpl[1],
                "category": tpl[2],
                "priority": tpl[3],
                "sender_type": "SYSTEM",
                "recipient_type": "INDIVIDUAL",
                "recipient_id": u_id,
                "is_active": True,
                "created_at": created_at,
                "updated_at": created_at
            })

            is_read = random.choice([True, False, False])
            is_archived = random.choice([True, False, False, False])
            is_starred = random.choice([True, False, False, False])
            is_pinned = random.choice([True, False, False, False, False])

            if is_read or is_archived or is_starred or is_pinned:
                bind.execute(sa.text(
                    "INSERT INTO notification_reads (id, notification_id, student_id, read_at, is_archived, is_deleted, is_starred, is_pinned) "
                    "VALUES (:id, :notification_id, :student_id, :read_at, :is_archived, :is_deleted, :is_starred, :is_pinned)"
                ), {
                    "id": str(uuid.uuid4()),
                    "notification_id": notif_id,
                    "student_id": u_id,
                    "read_at": created_at + timedelta(hours=random.randint(1, 10)) if is_read else now,
                    "is_archived": is_archived,
                    "is_deleted": False,
                    "is_starred": is_starred,
                    "is_pinned": is_pinned
                })


def downgrade() -> None:
    bind = op.get_bind()
    bind.execute(sa.text("DELETE FROM notification_reads"))
    bind.execute(sa.text("DELETE FROM notifications"))
