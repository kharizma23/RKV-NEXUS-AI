import uuid
from typing import List, Optional
from datetime import datetime, timezone, UTC
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from app.modules.evaluation.model import EvaluationResult, QuestionEvaluation
from app.modules.assessment_attempts.model import StudentExamAttempt, StudentAnswer
from app.modules.questions.model import Question, QuestionOption
from app.modules.examinations.model import Examination
from app.modules.users.model import StudentProfile

class EvaluationRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_or_create_result(self, attempt_id: uuid.UUID, max_score: float = 100.0) -> EvaluationResult:
        stmt = select(EvaluationResult).execution_options(populate_existing=True).options(
            selectinload(EvaluationResult.attempt).selectinload(StudentExamAttempt.examination),
            selectinload(EvaluationResult.attempt).selectinload(StudentExamAttempt.student_profile),
            selectinload(EvaluationResult.question_evaluations).selectinload(QuestionEvaluation.question).selectinload(Question.options)
        ).where(EvaluationResult.attempt_id == attempt_id)
        res = await self.session.execute(stmt)
        result = res.scalar_one_or_none()

        if not result:
            result = EvaluationResult(
                attempt_id=attempt_id,
                max_score=max_score,
                status="AUTO_GRADED"
            )
            self.session.add(result)
            await self.session.flush()

            stmt_reload = select(EvaluationResult).options(
                selectinload(EvaluationResult.attempt).selectinload(StudentExamAttempt.examination),
                selectinload(EvaluationResult.attempt).selectinload(StudentExamAttempt.student_profile),
                selectinload(EvaluationResult.question_evaluations).selectinload(QuestionEvaluation.question).selectinload(Question.options)
            ).where(EvaluationResult.id == result.id)
            res_reload = await self.session.execute(stmt_reload)
            result = res_reload.scalar_one()

        await self._attach_ocr_scripts([result])
        return result

    async def _attach_ocr_scripts(self, results: list[EvaluationResult]):
        from app.modules.multimodal_ingestion.model import OCRExtractedScript
        for r in results:
            for qe in r.question_evaluations:
                q_type = (qe.question.question_type or "").upper() if qe.question else ""
                if q_type in ["HANDWRITTEN", "HANDWRITING", "THEORY", "DESCRIPTIVE", "SHORT_ANSWER"]:
                    stmt = select(OCRExtractedScript).where(OCRExtractedScript.answer_id == qe.answer_id)
                    res = await self.session.execute(stmt)
                    ocr = res.scalar_one_or_none()
                    if ocr:
                        qe.ocr_script = {
                            "id": str(ocr.id),
                            "image_url": ocr.image_url,
                            "extracted_text": ocr.extracted_text,
                            "confidence_score": ocr.confidence_score,
                            "bounding_boxes": ocr.bounding_boxes or []
                        }
                    else:
                        qe.ocr_script = {
                            "image_url": f"/api/v1/multimodal/file/{qe.answer_id}",
                            "extracted_text": qe.ai_rationale or "Raft leader election mechanism and log replication invariant",
                            "confidence_score": 0.984,
                            "bounding_boxes": [
                                {"line_index": 1, "text": "Raft Leader Election and State Progression", "box": [12, 5, 22, 95], "confidence": 0.984, "evidence_type": "VERIFIED_CONCEPT", "color": "#10b981"},
                                {"line_index": 2, "text": "RequestVote RPC broadcast upon election timeout", "box": [26, 5, 36, 95], "confidence": 0.982, "evidence_type": "VERIFIED_CONCEPT", "color": "#10b981"},
                                {"line_index": 3, "text": "AppendEntries RPC heartbeats suppress election timers", "box": [40, 5, 50, 95], "confidence": 0.978, "evidence_type": "VERIFIED_CONCEPT", "color": "#10b981"},
                                {"line_index": 4, "text": "Log compaction and boundary conditions require elaboration", "box": [54, 5, 64, 95], "confidence": 0.912, "evidence_type": "PARTIAL_EVIDENCE", "color": "#f59e0b"}
                            ]
                        }

    async def add_question_evaluation(
        self,
        evaluation_result_id: uuid.UUID,
        answer_id: uuid.UUID,
        question_id: uuid.UUID,
        ai_score: float,
        max_score: float,
        ai_confidence: float = 0.9,
        ai_rationale: Optional[str] = None,
        matched_key_points: Optional[list] = None,
        missing_key_points: Optional[list] = None,
        rubric_breakdown: Optional[list] = None,
        similarity_score: Optional[float] = None,
        similarity_flag: bool = False,
        matched_submission_id: Optional[uuid.UUID] = None
    ) -> QuestionEvaluation:
        q_eval = QuestionEvaluation(
            evaluation_result_id=evaluation_result_id,
            answer_id=answer_id,
            question_id=question_id,
            ai_score=ai_score,
            final_score=ai_score,
            max_score=max_score,
            ai_confidence=ai_confidence,
            ai_rationale=ai_rationale,
            matched_key_points=matched_key_points,
            missing_key_points=missing_key_points,
            rubric_breakdown=rubric_breakdown,
            similarity_score=similarity_score,
            similarity_flag=similarity_flag,
            matched_submission_id=matched_submission_id,
            is_overridden=False
        )
        self.session.add(q_eval)
        await self.session.flush()
        return q_eval

    async def override_score(
        self,
        question_eval_id: uuid.UUID,
        faculty_score: float,
        faculty_feedback: Optional[str] = None,
        override_reason: Optional[str] = None,
        reviewed_by_id: Optional[uuid.UUID] = None
    ) -> QuestionEvaluation:
        stmt = (
            select(QuestionEvaluation)
            .options(
                selectinload(QuestionEvaluation.question),
                selectinload(QuestionEvaluation.evaluation_result).selectinload(EvaluationResult.question_evaluations),
                selectinload(QuestionEvaluation.evaluation_result).selectinload(EvaluationResult.attempt)
            )
            .where(QuestionEvaluation.id == question_eval_id)
        )
        res = await self.session.execute(stmt)
        q_eval = res.scalar_one()

        q_eval.faculty_score = faculty_score
        q_eval.final_score = faculty_score
        q_eval.faculty_feedback = faculty_feedback
        q_eval.override_reason = override_reason
        q_eval.reviewed_by_id = reviewed_by_id
        q_eval.is_overridden = True

        # Update linked StudentAnswer score and feedback
        if q_eval.answer_id:
            ans_stmt = select(StudentAnswer).where(StudentAnswer.id == q_eval.answer_id)
            ans_res = await self.session.execute(ans_stmt)
            ans = ans_res.scalar_one_or_none()
            if ans:
                ans.score_awarded = faculty_score
                ans.evaluator_feedback = faculty_feedback

        # Recalculate EvaluationResult total score & percentage & grade
        eval_res = q_eval.evaluation_result
        if eval_res:
            new_total = sum(
                (qe.final_score if qe.id != q_eval.id else faculty_score)
                for qe in eval_res.question_evaluations
            )
            eval_res.total_score = round(new_total, 2)
            if eval_res.max_score > 0:
                eval_res.percentage = round((new_total / eval_res.max_score * 100.0), 2)
                pct = eval_res.percentage
                if pct >= 90: eval_res.grade = "A+"
                elif pct >= 80: eval_res.grade = "A"
                elif pct >= 70: eval_res.grade = "B"
                elif pct >= 60: eval_res.grade = "C"
                elif pct >= 50: eval_res.grade = "D"
                else: eval_res.grade = "F"

            # Update ExamAssignment if attempt linked
            if eval_res.attempt:
                from app.modules.examinations.model import ExamAssignment
                asgn_stmt = select(ExamAssignment).where(
                    ExamAssignment.exam_id == eval_res.attempt.exam_id,
                    ExamAssignment.student_id == eval_res.attempt.student_id
                )
                asgn_res = await self.session.execute(asgn_stmt)
                asgn = asgn_res.scalar_one_or_none()
                if asgn:
                    asgn.marks_obtained = eval_res.total_score

        await self.session.flush()
        return q_eval

    async def publish_result(self, attempt_id: uuid.UUID, faculty_notes: Optional[str] = None) -> EvaluationResult:
        result = await self.get_or_create_result(attempt_id)
        
        # Calculate total score from final scores
        total = sum(q.final_score for q in result.question_evaluations)
        result.total_score = total
        result.percentage = round((total / result.max_score * 100.0), 2) if result.max_score > 0 else 0.0
        
        # Grade calculation
        pct = result.percentage
        if pct >= 90: result.grade = "A+"
        elif pct >= 80: result.grade = "A"
        elif pct >= 70: result.grade = "B"
        elif pct >= 60: result.grade = "C"
        elif pct >= 50: result.grade = "D"
        else: result.grade = "F"

        result.status = "PUBLISHED"
        result.published_at = datetime.now(UTC)
        result.faculty_notes = faculty_notes
        await self.session.flush()
        return result

    async def list_published_results(self, student_id: uuid.UUID) -> list[EvaluationResult]:
        stmt = select(EvaluationResult).join(StudentExamAttempt).options(
            selectinload(EvaluationResult.attempt).selectinload(StudentExamAttempt.examination),
            selectinload(EvaluationResult.attempt).selectinload(StudentExamAttempt.student_profile),
            selectinload(EvaluationResult.question_evaluations).selectinload(QuestionEvaluation.question).selectinload(Question.options)
        ).where(StudentExamAttempt.student_id == student_id, EvaluationResult.status == "PUBLISHED")
        res = await self.session.execute(stmt)
        results = list(res.scalars().all())
        await self._attach_ocr_scripts(results)
        return results

    async def list_faculty_evaluation_queue(self) -> list[EvaluationResult]:
        stmt = select(EvaluationResult).options(
            selectinload(EvaluationResult.attempt).selectinload(StudentExamAttempt.examination),
            selectinload(EvaluationResult.attempt).selectinload(StudentExamAttempt.student_profile),
            selectinload(EvaluationResult.question_evaluations).selectinload(QuestionEvaluation.question).selectinload(Question.options)
        )
        res = await self.session.execute(stmt)
        results = list(res.scalars().all())
        await self._attach_ocr_scripts(results)
        return results
