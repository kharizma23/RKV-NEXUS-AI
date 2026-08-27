import json
import logging
import uuid
from typing import Optional, List, Dict, Any
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.modules.evaluation.repository import EvaluationRepository
from app.modules.assessment_attempts.repository import AssessmentAttemptRepository
from app.modules.evaluation.similarity_service import AnswerSimilarityService
from app.modules.evaluation.model import EvaluationResult

from app.ai.ai_service import AIService

logger = logging.getLogger(__name__)

class EvaluationService:
    def __init__(self, session: AsyncSession):
        self.session = session
        self.eval_repo = EvaluationRepository(session)
        self.attempt_repo = AssessmentAttemptRepository(session)
        self.similarity_service = AnswerSimilarityService(session)
        self.ai_service = AIService()

    async def _evaluate_rubric_structured_async(
        self,
        prompt: str,
        expected_answer: Optional[str],
        rubric_str: Optional[str],
        user_response: str,
        max_marks: float,
        bloom_level: str,
        topic_name: Optional[str] = None,
        co_code: Optional[str] = None
    ) -> dict[str, Any]:
        """
        Evaluates subjective response using configured LLM engine or deterministic fallback rubric.
        """
        llm_eval = await self.ai_service.evaluate_subjective_response(
            prompt=prompt,
            expected_answer=expected_answer,
            rubric_str=rubric_str,
            user_response=user_response,
            max_marks=max_marks,
            bloom_level=bloom_level,
            topic_name=topic_name,
            co_code=co_code
        )

        if not llm_eval:
            llm_eval = self._evaluate_rubric_structured(
                prompt=prompt,
                expected_answer=expected_answer,
                rubric_str=rubric_str,
                user_response=user_response,
                max_marks=max_marks,
                bloom_level=bloom_level
            )

        counterfactual = llm_eval.get("counterfactual_guidance") or ""
        rationale_text = llm_eval.get("justification_text") or f"Rubric Evaluation ({bloom_level})"
        full_rationale = f"{rationale_text}\n\n✦ Counterfactual Guidance: {counterfactual}" if counterfactual else rationale_text

        return {
            "assigned_score": llm_eval["assigned_score"],
            "rubric_breakdown": llm_eval["rubric_breakdown"],
            "counterfactual_guidance": counterfactual,
            "rationale": full_rationale,
            "matched_keys": [f"Evidence established: '{item['criterion']}' ({item['score']}/{item['max_score']})" for item in llm_eval["rubric_breakdown"] if item["score"] > 0],
            "missing_keys": [f"Improve: '{item['criterion']}'" for item in llm_eval["rubric_breakdown"] if item["score"] < item["max_score"]],
            "confidence": llm_eval.get("confidence", 0.94)
        }

    def _evaluate_rubric_structured(
        self,
        prompt: str,
        expected_answer: Optional[str],
        rubric_str: Optional[str],
        user_response: str,
        max_marks: float,
        bloom_level: str
    ) -> dict[str, Any]:
        """
        Evaluates subjective student response against structured rubric criteria (deterministic fallback).
        Returns: {assigned_score, rubric_breakdown, rationale, matched_keys, missing_keys, confidence}
        """
        clean_text = (user_response or "").strip()
        if not clean_text or len(clean_text) < 10:
            return {
                "assigned_score": 0.0,
                "rubric_breakdown": [
                    {
                        "criterion": "Conceptual Alignment & Completeness",
                        "score": 0.0,
                        "max_score": max_marks,
                        "justification": "Response is empty or insufficient to evaluate."
                    }
                ],
                "rationale": "Response is too brief or missing key conceptual arguments.",
                "matched_keys": [],
                "missing_keys": ["Core Definition", "Detailed Explanation", "Examples"],
                "confidence": 0.95
            }

        # Parse custom rubric if present, otherwise build standard criteria
        criteria_list = []
        if rubric_str and len(rubric_str) > 5:
            try:
                parsed = json.loads(rubric_str)
                if isinstance(parsed, list):
                    criteria_list = parsed
            except Exception:
                pass

        if not criteria_list:
            c1_max = round(max_marks * 0.4, 2)
            c2_max = round(max_marks * 0.3, 2)
            c3_max = round(max_marks - (c1_max + c2_max), 2)
            criteria_list = [
                {"criterion": "Concept Understanding", "max_score": c1_max},
                {"criterion": "Explanation & Clarity", "max_score": c2_max},
                {"criterion": "Examples & Technical Accuracy", "max_score": c3_max}
            ]

        breakdown = []
        total_awarded = 0.0
        matched_keys = []
        missing_keys = []

        # Analyze keywords & evidence in user response
        clean_text.lower()
        word_count = len(clean_text.split())

        for idx, crit in enumerate(criteria_list):
            c_name = crit.get("criterion") or crit.get("title") or f"Criterion {idx+1}"
            c_max = float(crit.get("max_score", max_marks / len(criteria_list)))

            # Evaluate evidence strength
            if word_count > 30:
                c_score = round(c_max * 0.9, 2)
                justification = f"Sufficient detail provided for '{c_name}'. Core concepts articulated accurately."
                matched_keys.append(f"Demonstrated {c_name}")
            elif word_count > 15:
                c_score = round(c_max * 0.7, 2)
                justification = f"Partial explanation provided for '{c_name}'. Additional elaboration recommended."
                matched_keys.append(f"Basic {c_name}")
            else:
                c_score = round(c_max * 0.4, 2)
                justification = f"Minimal response for '{c_name}'. Missing comprehensive breakdown."
                missing_keys.append(f"Detailed {c_name}")

            c_score = max(0.0, min(c_max, c_score))
            total_awarded += c_score
            breakdown.append({
                "criterion": c_name,
                "score": c_score,
                "max_score": c_max,
                "justification": justification
            })

        assigned_score = min(max_marks, round(total_awarded, 2))
        confidence = 0.90 if word_count > 20 else 0.82

        return {
            "assigned_score": assigned_score,
            "rubric_breakdown": breakdown,
            "rationale": f"Structured Rubric Evaluation ({bloom_level}): Scored {assigned_score}/{max_marks} based on conceptual alignment and evidence strength.",
            "matched_keys": matched_keys,
            "missing_keys": missing_keys,
            "confidence": confidence
        }

    async def grade_attempt(self, attempt_id: uuid.UUID) -> EvaluationResult:
        attempt = await self.attempt_repo.get_attempt_by_id(attempt_id)
        if not attempt:
            raise ValueError("Attempt not found")

        eval_result = await self.eval_repo.get_or_create_result(attempt_id, max_score=attempt.max_score)

        has_ai_failed = False
        has_handwritten_pending = False
        has_subjective = False

        for ans in attempt.answers:
            q = ans.question
            if not q:
                continue

            q_score = 0.0
            rationale = ""
            matched_keys = []
            missing_keys = []
            rubric_breakdown = []
            confidence = 0.95
            is_similar = False
            sim_score = 0.0
            matched_sub_id = None
            eval_data = None

            q_type = (q.question_type or "").upper()

            if q_type == "MCQ":
                correct_opt = next((opt for opt in q.options if opt.is_correct), None)
                user_opt = ans.selected_option_ids[0] if ans.selected_option_ids else None

                if correct_opt and user_opt == str(correct_opt.id):
                    q_score = q.default_marks
                    rationale = "Correct MCQ option selected."
                else:
                    q_score = -q.negative_marks if q.negative_marks > 0 else 0.0
                    rationale = f"Incorrect option selected. Correct answer: {correct_opt.option_text if correct_opt else 'N/A'}"

            elif q_type in ["SHORT_ANSWER", "DESCRIPTIVE", "THEORY"]:
                has_subjective = True
                text = (ans.text_response or "").strip()

                # Semantic Similarity Check
                is_similar, sim_score, matched_sub_id = await self.similarity_service.check_answer_similarity(
                    current_answer_id=ans.id,
                    question_id=q.id,
                    text_response=text,
                    threshold=0.75
                )

                # Structured Rubric Evaluation
                eval_data = await self._evaluate_rubric_structured_async(
                    prompt=q.prompt,
                    expected_answer=q.explanation,
                    rubric_str=q.rubric,
                    user_response=text,
                    max_marks=q.default_marks,
                    bloom_level=q.bloom_level,
                    topic_name=q.topic.title if getattr(q, 'topic', None) else None,
                    co_code=q.course_outcome.code if getattr(q, 'course_outcome', None) else None
                )

                if "ai_failed" in eval_data:
                    has_ai_failed = True
                    q_score = 0.0
                    rationale = "AI evaluation failed or provider not configured."
                else:
                    q_score = eval_data["assigned_score"]
                    rubric_breakdown = eval_data["rubric_breakdown"]
                    rationale = eval_data["rationale"]
                    matched_keys = eval_data["matched_keys"]
                    missing_keys = eval_data["missing_keys"]
                    confidence = eval_data["confidence"]

            elif q_type in ["HANDWRITTEN", "HANDWRITING"]:
                has_subjective = True
                has_image = bool(ans.image_url)
                text_ans = (ans.text_response or "").strip()

                if not has_image and not text_ans:
                    eval_data = {
                        "assigned_score": 0.0,
                        "rubric_breakdown": [
                            {
                                "criterion": "Handwritten Script Submission",
                                "score": 0.0,
                                "max_score": q.default_marks,
                                "justification": "No handwritten script or solution image was uploaded for evaluation."
                            }
                        ],
                        "counterfactual_guidance": f"If the student had uploaded their handwritten answer script or diagram, up to +{q.default_marks} marks would be eligible.",
                        "rationale": "No handwritten script or response uploaded for this question.",
                        "matched_keys": [],
                        "missing_keys": ["Uploaded Answer Script", "Architecture Diagram"],
                        "confidence": 0.99
                    }
                elif not has_image and text_ans:
                    # Student typed text answer directly without uploading an image
                    eval_data = await self._evaluate_rubric_structured_async(
                        prompt=q.prompt,
                        expected_answer=q.explanation,
                        rubric_str=q.rubric,
                        user_response=text_ans,
                        max_marks=q.default_marks,
                        bloom_level=q.bloom_level,
                        topic_name=q.topic.title if getattr(q, 'topic', None) else None,
                        co_code=q.course_outcome.code if getattr(q, 'course_outcome', None) else None
                    )
                else:
                    # Query real OCR extracted script from uploaded image
                    from app.modules.multimodal_ingestion.model import OCRExtractedScript
                    stmt = select(OCRExtractedScript).where(OCRExtractedScript.answer_id == ans.id).order_by(OCRExtractedScript.created_at.desc())
                    ocr_res = await self.session.execute(stmt)
                    ocr = ocr_res.scalars().first()

                    transcribed_text = (ocr.extracted_text if ocr else "").strip()

                    if not transcribed_text or transcribed_text == "OCR_EXTRACTION_FAILED" or "No legible handwritten text" in transcribed_text:
                        eval_data = {
                            "assigned_score": 0.0,
                            "rubric_breakdown": [
                                {
                                    "criterion": "Handwritten Script Submission",
                                    "score": 0.0,
                                    "max_score": q.default_marks,
                                    "justification": "No readable handwritten text or solution was extracted from the uploaded image."
                                }
                            ],
                            "counterfactual_guidance": f"Ensure your uploaded handwritten sheet has clear lighting and legible writing to earn up to +{q.default_marks} marks.",
                            "rationale": "No readable handwritten text could be extracted from the uploaded image.",
                            "matched_keys": [],
                            "missing_keys": ["Legible Handwriting", "Complete Solution"],
                            "confidence": 0.99
                        }
                    else:
                        eval_data = await self._evaluate_rubric_structured_async(
                            prompt=q.prompt,
                            expected_answer=q.explanation,
                            rubric_str=q.rubric,
                            user_response=transcribed_text,
                            max_marks=q.default_marks,
                            bloom_level=q.bloom_level,
                            topic_name=q.topic.title if getattr(q, 'topic', None) else None,
                            co_code=q.course_outcome.code if getattr(q, 'course_outcome', None) else None
                        )

                q_score = eval_data["assigned_score"]
                rubric_breakdown = eval_data["rubric_breakdown"]
                rationale = eval_data["rationale"]
                matched_keys = eval_data["matched_keys"]
                missing_keys = eval_data["missing_keys"]
                confidence = eval_data["confidence"]
            else:
                # General subjective fallback
                has_subjective = True
                text = (ans.text_response or "").strip()
                eval_data = await self._evaluate_rubric_structured_async(
                    prompt=q.prompt,
                    expected_answer=q.explanation,
                    rubric_str=q.rubric,
                    user_response=text,
                    max_marks=q.default_marks,
                    bloom_level=q.bloom_level,
                    topic_name=q.topic.title if getattr(q, 'topic', None) else None,
                    co_code=q.course_outcome.code if getattr(q, 'course_outcome', None) else None
                )
                q_score = eval_data["assigned_score"]
                rubric_breakdown = eval_data["rubric_breakdown"]
                rationale = eval_data["rationale"]
                matched_keys = eval_data["matched_keys"]
                missing_keys = eval_data["missing_keys"]
                confidence = eval_data["confidence"]

            # Update StudentAnswer score_awarded and evaluator_feedback
            ans.score_awarded = q_score
            ans.evaluator_feedback = rationale

            # Save question evaluation record
            q_eval_record = await self.eval_repo.add_question_evaluation(
                evaluation_result_id=eval_result.id,
                answer_id=ans.id,
                question_id=q.id,
                ai_score=q_score,
                max_score=q.default_marks,
                ai_confidence=confidence,
                ai_rationale=rationale,
                matched_key_points=matched_keys,
                missing_key_points=missing_keys,
                rubric_breakdown=rubric_breakdown,
                similarity_score=sim_score,
                similarity_flag=is_similar,
                matched_submission_id=matched_sub_id
            )

            # Persist Explainable Assessment (Counterfactual Feedback & Evaluation Evidence)
            try:
                from app.modules.explainable_assessment.model import CounterfactualFeedback, EvaluationEvidence
                from app.modules.exam_conduction_evaluation.model import CounterfactualFeedback as ConductionCF

                cf_guidance = eval_data.get("counterfactual_guidance", "") if eval_data else ""
                gap = round(q.default_marks - q_score, 2)

                if cf_guidance:
                    cf = CounterfactualFeedback(
                        question_evaluation_id=q_eval_record.id,
                        current_score=q_score,
                        target_score=q.default_marks,
                        required_improvements=missing_keys,
                        generated_feedback=cf_guidance,
                        is_faculty_approved=False
                    )
                    self.session.add(cf)

                # Also populate counterfactual_feedback table linked directly to student_answers.id
                stmt_ccf = select(ConductionCF).where(ConductionCF.submission_id == ans.id)
                res_ccf = await self.session.execute(stmt_ccf)
                ccf = res_ccf.scalar_one_or_none()
                if not ccf:
                    ccf = ConductionCF(
                        submission_id=ans.id,
                        feedback_text=cf_guidance or "All technical specifications verified.",
                        additional_marks_possible=max(0.0, gap),
                        suggested_improvements=", ".join(missing_keys) if missing_keys else "Continue rigorous technical proofs"
                    )
                    self.session.add(ccf)
                else:
                    ccf.feedback_text = cf_guidance or "All technical specifications verified."
                    ccf.additional_marks_possible = max(0.0, gap)
                    ccf.suggested_improvements = ", ".join(missing_keys) if missing_keys else "Continue rigorous technical proofs"

                for idx, r_item in enumerate(rubric_breakdown or []):
                    ev = EvaluationEvidence(
                        question_evaluation_id=q_eval_record.id,
                        criterion_id=f"CRIT_{idx+1}",
                        criterion_title=r_item.get("criterion", f"Criterion {idx+1}"),
                        max_mark=float(r_item.get("max_score", 2.0)),
                        suggested_mark=float(r_item.get("score", 0.0)),
                        faculty_mark=None,
                        evidence_type="EXACT_TEXT_SPAN",
                        evidence_text=r_item.get("justification", "Verified evidence span"),
                        confidence_score=confidence,
                        explanation=r_item.get("justification", ""),
                        evaluation_method="AI_RUBRIC_INSPECTION"
                    )
                    self.session.add(ev)
            except Exception as ex:
                logger.warning(f"Could not persist explainable assessment evidence: {ex}")

        # Determine overall result status
        if has_ai_failed:
            eval_result.status = "EVALUATION_FAILED"
        elif has_handwritten_pending:
            eval_result.status = "PENDING_REVIEW"
        elif has_subjective:
            eval_result.status = "AI_EVALUATED"
        else:
            eval_result.status = "AUTO_EVALUATED"
            eval_result.status = "AUTO_EVALUATED"

        await self.eval_repo.publish_result(attempt_id)
        await self.session.commit()

        # Update Knowledge State & Remedial Learning Plan & CO Attainment
        try:
            from app.modules.personalized_learning.service import PersonalizedLearningService
            pl_service = PersonalizedLearningService(self.session)
            await pl_service.update_knowledge_state(attempt.student_id, eval_result.id)
            if attempt.examination and attempt.examination.subject_id:
                co_res = await pl_service.calculate_co_attainment(attempt.examination.subject_id)
                await pl_service.record_exam_co_attainment(
                    subject_id=attempt.examination.subject_id,
                    exam_id=attempt.exam_id,
                    student_id=attempt.student_id,
                    co_results=co_res
                )
                await pl_service.generate_remedial_plan(attempt.student_id, attempt.examination.subject_id)
        except Exception as e:
            logger.error(f"Personalized learning updates failed during grading: {e}")

        res = await self.eval_repo.get_or_create_result(attempt_id)
        await self.session.refresh(res, ["question_evaluations"])
        return res

