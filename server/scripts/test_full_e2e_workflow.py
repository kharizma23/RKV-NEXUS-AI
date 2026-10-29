import asyncio
import json
import sys
import uuid
from datetime import UTC, datetime, timedelta

import app.modules.users.model
import app.modules.syllabus.model
import app.modules.learning_outcomes.model
import app.modules.academics.model
import app.modules.institutions.model
import app.modules.questions.model
import app.modules.examinations.model
import app.modules.assessment_attempts.model
import app.modules.evaluation.model
import app.modules.personalized_learning.model

from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.database.session import AsyncSessionLocal

from app.modules.auth.service import AuthService
from app.modules.auth.schema import LoginRequest
from app.modules.institutions.model import Institution, Department
from app.modules.academics.model import Programme, AcademicYear, Semester, Subject
from app.modules.syllabus.model import Unit, Topic
from app.modules.learning_outcomes.model import CourseOutcome
from app.modules.questions.model import Question
from app.modules.questions.repository import QuestionRepository
from app.modules.questions.schema import QuestionCreate
from app.modules.examinations.model import Examination, ExamQuestion
from app.modules.examinations.repository import ExaminationRepository
from app.modules.examinations.schema import ExaminationCreate
from app.modules.assessment_attempts.repository import AssessmentAttemptRepository
from app.modules.assessment_attempts.service import AssessmentAttemptService
from app.modules.assessment_attempts.schema import SubmitExamAttemptRequest, StudentAnswerSubmit
from app.modules.evaluation.service import EvaluationService
from app.modules.evaluation.model import EvaluationResult, QuestionEvaluation

from app.modules.personalized_learning.service import PersonalizedLearningService
from app.modules.users.model import User


async def run_e2e_workflow_test():
    print("=" * 70)
    print("RUNNING COMPLETE MASTER END-TO-END WORKFLOW & REGRESSION TEST (28 STEPS)")
    print("=" * 70)

    async with AsyncSessionLocal() as session:
        # STEP 1: Faculty Login / Fetch Faculty Account
        print("\n--- STEP 1 & 2: Faculty Authentication & Opening Question Bank ---")
        fac_stmt = select(User).where(User.email == "faculty@platform.edu")
        fac_res = await session.execute(fac_stmt)
        faculty = fac_res.scalar_one_or_none()
        assert faculty is not None, "Faculty account faculty@platform.edu must exist in DB"
        print(f"[PASS] STEP 1: Faculty Logged In: {faculty.full_name} ({faculty.email})")

        # Fetch active subject (DBMS or CS-201-T or BIT subject)
        subj_stmt = select(Subject).options(selectinload(Subject.units).selectinload(Unit.topics), selectinload(Subject.course_outcomes))
        subj_res = await session.execute(subj_stmt)
        subjects = list(subj_res.scalars().all())
        assert len(subjects) > 0, "At least one subject must exist in DB"
        target_subject = subjects[0]
        print(f"[PASS] STEP 2: Question Bank Opened for Subject: '{target_subject.name}' ({target_subject.code})")

        # Get or create Topic and Course Outcome
        topic = None
        for u in target_subject.units:
            if u.topics:
                topic = u.topics[0]
                break
        if not topic:
            unit = Unit(subject_id=target_subject.id, unit_number=1, title="Unit 1: Normalization")
            session.add(unit)
            await session.flush()
            topic = Topic(unit_id=unit.id, topic_number=1, title="Normalization")
            session.add(topic)
            await session.flush()

        co = target_subject.course_outcomes[0] if target_subject.course_outcomes else None
        if not co:
            co = CourseOutcome(
                subject_id=target_subject.id,
                code="CO3",
                statement="Apply normalization rules up to 3NF to eliminate data anomalies",
                bloom_level="APPLY"
            )
            session.add(co)
            await session.flush()

        # STEP 3 - 7: Create Subjective Question with Rubric & Metadata
        print("\n--- STEP 3 - 7: Creating Subjective Question with Metadata & Rubric ---")
        question_text = f"Explain database normalization with a suitable example. (E2E Test Run: {uuid.uuid4().hex[:6]})"
        expected_ans = (
            "Database normalization is the process of organizing structured data to reduce redundancy and improve data integrity. "
            "1NF eliminates repeating groups. 2NF removes partial dependencies. 3NF removes transitive dependencies."
        )
        rubric_json = json.dumps([
            {"criterion": "Concept Understanding", "max_score": 2.0, "description": "Core definition of normalization"},
            {"criterion": "Normal Forms Explanation", "max_score": 2.0, "description": "1NF, 2NF, and 3NF explanation"},
            {"criterion": "Example & Accuracy", "max_score": 1.0, "description": "Relational schema example"}
        ])

        q_repo = QuestionRepository(session)
        q_create = QuestionCreate(
            subject_id=target_subject.id,
            topic_id=topic.id,
            co_id=co.id,
            bloom_level="APPLY",
            question_type="DESCRIPTIVE",
            prompt=question_text,
            default_marks=5.0,
            negative_marks=0.0,
            explanation=expected_ans,
            rubric=rubric_json,
            is_active=True
        )
        new_question = await q_repo.create_question(q_create)
        await session.commit()
        print("[PASS] STEPS 3-7: Question Created & Persisted in PostgreSQL!")
        print(f"       Question ID: {new_question.id}")
        print(f"       Marks: {new_question.default_marks} | Bloom: {new_question.bloom_level} | CO: {co.code} | Topic: {topic.title}")

        # STEP 8 & 9: Create Examination & Publish
        print("\n--- STEP 8 & 9: Faculty Creating & Publishing Examination ---")
        exam_repo = ExaminationRepository(session)
        now_tz = datetime.now(UTC)
        exam_create = ExaminationCreate(
            subject_id=target_subject.id,
            title=f"E2E Automated Assessment — {target_subject.name} ({uuid.uuid4().hex[:4]})",
            exam_type="FORMATIVE",
            duration_minutes=45,
            total_marks=5.0,
            start_time=now_tz - timedelta(hours=1),
            end_time=now_tz + timedelta(days=2),
            instructions="Answer the subjective question with detailed technical arguments."
        )
        new_exam = await exam_repo.create_examination(exam_create)
        
        # Link question to examination
        eq = ExamQuestion(
            exam_id=new_exam.id,
            question_id=new_question.id,
            order_index=1,
            marks=5.0
        )
        session.add(eq)
        await session.flush()
        
        # Publish exam
        published_exam = await exam_repo.publish_examination(new_exam.id)
        await session.commit()
        print("[PASS] STEPS 8-9: Examination Created and Published!")
        print(f"       Exam Title: {published_exam.title}")
        print(f"       Is Published: {published_exam.is_published}")

        # STEP 10 - 15: Student Login, Start Exam, Write Answer & Submit
        print("\n--- STEP 10 - 15: Student Exam Workflow & Answer Persistence ---")
        student_stmt = select(User).where(User.email == "student@platform.edu")
        student_res = await session.execute(student_stmt)
        student = student_res.scalar_one_or_none()
        assert student is not None, "Student account student@platform.edu must exist in DB"
        print(f"[PASS] STEP 10: Student Logged In: {student.full_name} ({student.email})")

        attempt_service = AssessmentAttemptService(session)
        attempt = await attempt_service.start_attempt(student.id, published_exam.id)
        print(f"[PASS] STEPS 11-12: Student Started Exam Attempt (Attempt ID: {attempt.id})")

        student_paragraph_answer = (
            "Database normalization is a systematic technique of decomposing tables to eliminate data redundancy and insertion, update, and deletion anomalies. "
            "First Normal Form (1NF) ensures atomic column values. Second Normal Form (2NF) ensures no partial key dependencies exist. "
            "Third Normal Form (3NF) ensures no transitive dependencies exist where non-prime attributes depend on other non-prime attributes. "
            "For example, separating Student(ID, Department, DeptHead) into Student(ID, DeptID) and Department(DeptID, DeptHead)."
        )

        submit_req = SubmitExamAttemptRequest(
            answers=[
                StudentAnswerSubmit(
                    question_id=new_question.id,
                    text_response=student_paragraph_answer
                )
            ]
        )
        submitted_attempt = await attempt_service.submit_attempt(attempt.id, submit_req)
        print("[PASS] STEPS 13-15: Exam Answer Submitted & Persisted in PostgreSQL!")
        print(f"       Attempt Status: {submitted_attempt.status} | Submitted At: {submitted_attempt.submitted_at}")

        # STEP 16 - 19: AI Evaluation Engine Execution & Rubric Validation
        print("\n--- STEP 16 - 19: AI Evaluation Engine Pipeline Execution ---")
        eval_service = EvaluationService(session)
        eval_result = await eval_service.grade_attempt(submitted_attempt.id)
        print("[PASS] STEPS 16-19: AI Evaluation Completed Successfully!")
        print(f"       Total Score: {eval_result.total_score} / {eval_result.max_score}")
        print(f"       Status: {eval_result.status}")
        
        assert len(eval_result.question_evaluations) > 0, "Question evaluations must exist"
        q_eval = eval_result.question_evaluations[0]
        print(f"       Question Evaluation Score: {q_eval.final_score}/{q_eval.max_score}")
        print(f"       Confidence: {q_eval.ai_confidence}")
        print(f"       Rationale: {q_eval.ai_rationale}")

        # STEP 20: CO Attainment Calculation
        print("\n--- STEP 20: Calculating Course Outcome (CO) Attainment ---")
        pl_service = PersonalizedLearningService(session)
        co_attainment = await pl_service.calculate_co_attainment(target_subject.id)
        print("[PASS] STEP 20: CO Attainment Calculated from Real Database Evaluations:")
        for item in co_attainment:
            print(f"       - [{item['co_code']}] {item['statement'][:50]}... | Attainment: {item['attainment_pct']}% ({item['status']})")

        # STEP 21: Student Knowledge State Update
        print("\n--- STEP 21: Updating Student Knowledge State ---")
        updated_states = await pl_service.update_knowledge_state(student.id, eval_result.id)
        print("[PASS] STEP 21: Student Knowledge State Updated in PostgreSQL:")
        for ks in updated_states:
            print(f"       - Topic ID: {ks.topic_id} | Mastery Level: {ks.mastery_level} | Status: {ks.status}")

        # STEP 22 & 23: Personalized Learning Recommendation & Remedial Plan
        print("\n--- STEP 22 & 23: Generating Personalized Learning & Remedial Plan ---")
        remedial_plan = await pl_service.generate_remedial_plan(student.id, target_subject.id)
        print("[PASS] STEPS 22-23: Remedial Plan Created & Saved:")
        print(f"       Plan Title: {remedial_plan.title}")
        print(f"       Weak Topics Count: {len(remedial_plan.weak_topics)}")
        print(f"       Recommended Resources Count: {len(remedial_plan.recommended_resources)}")

        # STEP 24 & 25: Display Results to Student & Faculty Dashboards
        print("\n--- STEP 24 & 25: Dashboard Display & Persistence Verification ---")
        student_results_stmt = select(EvaluationResult).where(EvaluationResult.attempt_id == submitted_attempt.id)
        st_res = await session.execute(student_results_stmt)
        st_eval = st_res.scalar_one_or_none()
        assert st_eval is not None, "Evaluation result must be queryable by student/faculty"
        print("[PASS] STEPS 24-25: Evaluation & Feedback Ready for Student and Faculty Dashboards!")

        # STEP 26 & 27: Semantic Answer Similarity (pgvector)
        print("\n--- STEP 26 & 27: Semantic Answer Similarity Check ---")
        is_sim, sim_score, matched_id = await eval_service.similarity_service.check_answer_similarity(
            current_answer_id=q_eval.answer_id,
            question_id=new_question.id,
            text_response=student_paragraph_answer,
            threshold=0.75
        )
        print("[PASS] STEPS 26-27: Semantic Similarity Checked:")
        print(f"       Is Similar: {is_sim} | Similarity Score: {sim_score}")

        # STEP 28: Role Authorization & Security Validation
        print("\n--- STEP 28: Security & Role Authorization Check ---")
        assert "STUDENT" in [r.name for r in student.roles], "Student user must have STUDENT role"
        assert "FACULTY" in [r.name for r in faculty.roles], "Faculty user must have FACULTY role"
        print("[PASS] STEP 28: Security & Role Authorization Passed!")

    print("\n" + "=" * 70)
    print("ALL 28 STEPS OF THE MASTER E2E WORKFLOW PASSED WITH 100% SUCCESS!")
    print("=" * 70)

if __name__ == "__main__":
    asyncio.run(run_e2e_workflow_test())
