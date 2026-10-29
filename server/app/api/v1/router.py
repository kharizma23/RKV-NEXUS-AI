from fastapi import APIRouter
from app.modules.auth.router import router as auth_router
from app.modules.users.router import router as users_router
from app.modules.users.admin_router import router as admin_router
from app.modules.academics.admin_router import router as academics_admin_router
from app.modules.academics.public_router import router as public_router
from app.modules.roles.router import router as roles_router
from app.modules.institutions.router import router as institutions_router
from app.modules.audit.router import router as audit_router
from app.modules.academics.router import router as academics_router
from app.modules.syllabus.router import router as syllabus_router
from app.modules.learning_outcomes.router import router as learning_outcomes_router
from app.modules.questions.router import router as questions_router
from app.modules.examinations.router import router as examinations_router
from app.modules.examinations.ai_router import router as ai_examinations_router
from app.modules.assessment_attempts.router import router as attempts_router
from app.modules.evaluation.router import router as evaluation_router
from app.modules.personalized_learning.router import router as learning_plan_router
from app.modules.explainable_assessment.router import router as explainable_router
from app.modules.multimodal_ingestion.router import router as multimodal_router
from app.modules.notifications.router import router as notifications_router
from app.modules.gamification.router import router as gamification_router
from app.modules.predictions.router import router as predictions_router
from app.modules.chatbot.router import router as chatbot_router
from app.modules.adaptive.router import router as adaptive_router
from app.modules.localization.router import router as localization_router
from app.modules.admin.router import router as admin_ai_control_router
from app.modules.faculty.router import router as faculty_router
from app.modules.faculty.doubts_router import router as faculty_doubts_router
from app.modules.student.router import router as student_router
from app.modules.student.ai_tutor_router import router as student_ai_tutor_router
from app.modules.study_plans.router import router as study_plans_router
from app.modules.benchmarking.router import router as benchmarking_router
from app.modules.knowledge_graph.router import router as knowledge_graph_router
from app.modules.dropout.router import router as dropout_router
from app.modules.parents.router import router as parents_router
from app.modules.voice.router import router as voice_router
from app.modules.plagiarism.router import router as plagiarism_router
from app.modules.calendar.router import router as calendar_router
from app.modules.two_factor.router import router as two_factor_router
from app.modules.skills.router import router as skills_router
from app.modules.certificates.router import router as certificates_router
from app.modules.wellness.router import router as wellness_router
from app.modules.vr.router import router as vr_router
from app.modules.global_benchmarking.router import router as global_benchmarking_router
from app.modules.alumni.router import router as alumni_router
from app.modules.calibration.router import router as calibration_router
from app.modules.seating.router import router as seating_router
from app.modules.timetable.router import router as timetable_router
from app.modules.fees.router import router as fees_router
from app.modules.hostel.router import router as hostel_router

api_v1_router = APIRouter()

api_v1_router.include_router(public_router)
api_v1_router.include_router(academics_admin_router)
api_v1_router.include_router(admin_router)
api_v1_router.include_router(admin_ai_control_router)
api_v1_router.include_router(ai_examinations_router)
api_v1_router.include_router(faculty_router)
api_v1_router.include_router(faculty_doubts_router)
api_v1_router.include_router(student_router)
api_v1_router.include_router(student_ai_tutor_router)
api_v1_router.include_router(auth_router)
api_v1_router.include_router(users_router)
api_v1_router.include_router(roles_router)
api_v1_router.include_router(institutions_router)
api_v1_router.include_router(audit_router)
api_v1_router.include_router(academics_router)
api_v1_router.include_router(syllabus_router)
api_v1_router.include_router(learning_outcomes_router)
api_v1_router.include_router(questions_router)
api_v1_router.include_router(examinations_router)
api_v1_router.include_router(attempts_router)
api_v1_router.include_router(attempts_router, prefix="/assessment-attempts")
api_v1_router.include_router(evaluation_router)
api_v1_router.include_router(learning_plan_router)
api_v1_router.include_router(learning_plan_router, prefix="/personalized-learning")
api_v1_router.include_router(explainable_router)
api_v1_router.include_router(multimodal_router)
api_v1_router.include_router(notifications_router)
api_v1_router.include_router(gamification_router)
api_v1_router.include_router(predictions_router)
api_v1_router.include_router(chatbot_router)
api_v1_router.include_router(adaptive_router)
api_v1_router.include_router(localization_router)
api_v1_router.include_router(study_plans_router)
api_v1_router.include_router(benchmarking_router)
api_v1_router.include_router(knowledge_graph_router)
api_v1_router.include_router(dropout_router)
api_v1_router.include_router(parents_router)
api_v1_router.include_router(voice_router)
api_v1_router.include_router(plagiarism_router)
api_v1_router.include_router(calendar_router)
api_v1_router.include_router(two_factor_router)
api_v1_router.include_router(skills_router)
api_v1_router.include_router(certificates_router)
api_v1_router.include_router(wellness_router)
api_v1_router.include_router(vr_router)
api_v1_router.include_router(global_benchmarking_router)
api_v1_router.include_router(alumni_router)
api_v1_router.include_router(calibration_router)
api_v1_router.include_router(seating_router)
api_v1_router.include_router(timetable_router)
api_v1_router.include_router(fees_router)
api_v1_router.include_router(hostel_router)

from app.modules.exam_conduction_evaluation.router import router as exam_conduction_evaluation_router
api_v1_router.include_router(exam_conduction_evaluation_router)

from app.modules.new_functionalities.router import router as new_functionalities_router
api_v1_router.include_router(new_functionalities_router)



