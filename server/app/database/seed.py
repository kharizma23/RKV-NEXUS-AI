from datetime import UTC, date
from sqlalchemy import select

from app.core.config import settings
from app.core.logging import logger
from app.core.security import hash_password
from app.database.session import SyncSessionLocal

import app.modules.academics.model
import app.modules.assessment_attempts.model
import app.modules.audit.model
import app.modules.auth.model
import app.modules.evaluation.model
import app.modules.examinations.model
import app.modules.explainable_assessment.model
import app.modules.institutions.model
import app.modules.learning_outcomes.model
import app.modules.multimodal_ingestion.model
import app.modules.personalized_learning.model
import app.modules.questions.model
import app.modules.roles.model
import app.modules.syllabus.model
import app.modules.users.model

from app.modules.academics.model import AcademicYear, Course, Programme, Semester, Subject
from app.modules.institutions.model import Department, Institution
from app.modules.learning_outcomes.model import CourseOutcome
from app.modules.roles.model import Permission, Role
from app.modules.users.model import FacultyProfile, StudentProfile, User

def seed_database() -> None:
    logger.info("Starting database seed process...")
    session = SyncSessionLocal()
    try:
        # 1. Seed Roles
        role_names = ["STUDENT", "FACULTY", "EXAMINER", "DEPARTMENT_HEAD", "ADMIN"]
        roles_dict = {}
        for r_name in role_names:
            role = session.execute(select(Role).where(Role.name == r_name)).scalar_one_or_none()
            if not role:
                role = Role(name=r_name, description=f"{r_name} role")
                session.add(role)
                session.flush()
                logger.info(f"Created role: {r_name}")
            roles_dict[r_name] = role

        # 2. Seed Permissions
        permissions_data = [
            ("Administer System", "system:admin", "Full administrative control"),
            ("Manage Users", "user:manage", "Manage users and approvals"),
            ("Manage Academics", "academic:manage", "Manage courses and departments"),
            ("Create Examinations", "exam:create", "Create and publish exams"),
            ("Evaluate Submissions", "grade:evaluate", "Grade student answers")
        ]
        for name, code, desc in permissions_data:
            perm = session.execute(select(Permission).where(Permission.code == code)).scalar_one_or_none()
            if not perm:
                perm = Permission(name=name, code=code, description=desc)
                session.add(perm)
                session.flush()
                logger.info(f"Created permission: {code}")

        admin_role = roles_dict["ADMIN"]
        admin_perms = session.execute(select(Permission)).scalars().all()
        for p in admin_perms:
            if p not in admin_role.permissions:
                admin_role.permissions.append(p)

        session.flush()

        # 3. Seed Institutions & Departments
        institutions_list = [
            ("Bannari Amman Institute of Technology", "BIT"),
            ("Apex Institute of Technology", "AIT"),
            ("Demo Institute of Technology", "DIT"),
            ("Indian Institute of Technology Madras", "IITM"),
            ("Indian Institute of Technology Bombay", "IITB"),
            ("Indian Institute of Technology Delhi", "IITD"),
            ("Indian Institute of Technology Kharagpur", "IITKGP"),
            ("Indian Institute of Technology Kanpur", "IITK"),
            ("Indian Institute of Technology Roorkee", "IITR"),
            ("Indian Institute of Technology Guwahati", "IITG"),
            ("Indian Institute of Technology Hyderabad", "IITH"),
            ("Indian Institute of Science Bangalore", "IISC"),
            ("National Institute of Technology Tiruchirappalli", "NITT"),
            ("National Institute of Technology Surathkal", "NITK"),
            ("National Institute of Technology Warangal", "NITW"),
            ("National Institute of Technology Calicut", "NITC"),
            ("National Institute of Technology Rourkela", "NITR"),
            ("Anna University Chennai", "AU"),
            ("BITS Pilani", "BITS"),
            ("Vellore Institute of Technology", "VIT"),
            ("SRM Institute of Science and Technology", "SRM"),
            ("PSG College of Technology Coimbatore", "PSGTECH"),
            ("Amrita Vishwa Vidyapeetham", "AMRITA"),
            ("SSN College of Engineering", "SSN"),
            ("RV College of Engineering Bangalore", "RVCE"),
            ("PES University Bangalore", "PESU"),
            ("BMS College of Engineering", "BMSCE"),
            ("MSRIT Ramaiah Institute of Technology", "MSRIT"),
            ("Manipal Institute of Technology", "MIT-M"),
            ("Thapar Institute of Engineering & Technology", "TIET"),
            ("Coimbatore Institute of Technology", "CIT"),
            ("Thiagarajar College of Engineering Madurai", "TCE"),
            ("Kumaraguru College of Technology", "KCT"),
            ("Sri Krishna College of Engineering and Technology", "SKCET"),
            ("Rajalakshmi Engineering College", "REC"),
            ("Kongu Engineering College", "KEC"),
            ("Veltech Rangarajan Dr. Sagunthala R&D Institute", "VELTECH"),
            ("SASTRA Deemed University", "SASTRA"),
            ("Kalinga Institute of Industrial Technology", "KIIT"),
            ("Siksha 'O' Anusandhan", "SOA"),
            ("Delhi Technological University", "DTU"),
            ("Netaji Subhas University of Technology", "NSUT"),
            ("International Institute of Information Technology Hyderabad", "IIITH"),
            ("International Institute of Information Technology Bangalore", "IIITB"),
            ("Veermata Jijabai Technological Institute Mumbai", "VJTI"),
            ("College of Engineering Pune", "COEP"),
            ("Jadavpur University Kolkata", "JU"),
            ("Indian Institute of Engineering Science and Technology Shibpur", "IIEST"),
            ("Massachusetts Institute of Technology", "MIT-US"),
            ("Stanford University", "STANFORD"),
            ("University of California Berkeley", "UCB"),
            ("Carnegie Mellon University", "CMU"),
            ("University of Oxford", "OXFORD"),
            ("University of Cambridge", "CAMBRIDGE"),
            ("National University of Singapore", "NUS"),
            ("Nanyang Technological University", "NTU"),
        ]

        departments_list = [
            ("Computer Science & Engineering", "CSE"),
            ("Artificial Intelligence & Data Science", "AIDS"),
            ("Artificial Intelligence & Machine Learning", "AIML"),
            ("Electronics & Communication Engineering", "ECE"),
            ("Electrical & Electronics Engineering", "EEE"),
            ("Electronics & Instrumentation Engineering", "EIE"),
            ("Electronics & Instrumentation Engineering", "EI"),
            ("Mechanical Engineering", "MECH"),
            ("Civil Engineering", "CIVIL"),
            ("Information Technology", "IT"),
            ("Biotechnology", "BT"),
            ("Biomedical Engineering", "BM"),
            ("Agricultural Engineering", "AGRI"),
            ("Food Technology", "FT"),
            ("Computer Science & Business Systems", "CSBS"),
            ("Chemical Engineering", "CHEMICAL"),
            ("Aeronautical Engineering", "AERO"),
            ("Automobile Engineering", "AUTO"),
            ("Robotics & Automation Engineering", "ROBOTICS"),
        ]

        programme_templates = [
            ("B.E. Computer Science and Engineering", "BE-CSE", "CSE", "Bachelor of Engineering"),
            ("B.Tech. Artificial Intelligence and Data Science", "BTECH-AIDS", "AIDS", "Bachelor of Technology"),
            ("B.Tech. Information Technology", "BTECH-IT", "IT", "Bachelor of Technology"),
            ("B.E. Electronics and Communication Engineering", "BE-ECE", "ECE", "Bachelor of Engineering"),
            ("B.E. Electrical and Electronics Engineering", "BE-EEE", "EEE", "Bachelor of Engineering"),
            ("B.E. Electronics and Instrumentation Engineering", "BE-EIE", "EIE", "Bachelor of Engineering"),
            ("B.E. Mechanical Engineering", "BE-MECH", "MECH", "Bachelor of Engineering"),
            ("B.E. Civil Engineering", "BE-CIVIL", "CIVIL", "Bachelor of Engineering"),
            ("B.Tech. Biotechnology", "BTECH-BT", "BT", "Bachelor of Technology"),
        ]

        inst = None
        dept = None
        bit_inst = None

        for inst_name, inst_code in institutions_list:
            curr_inst = session.execute(select(Institution).where(Institution.code == inst_code)).scalar_one_or_none()
            if not curr_inst:
                curr_inst = Institution(name=inst_name, code=inst_code, is_active=True)
                session.add(curr_inst)
                session.flush()
                logger.info(f"Created institution: {inst_code}")

            if inst_code == "BIT":
                bit_inst = curr_inst
            if inst_code == "AIT":
                inst = curr_inst

            # Add standard departments & programmes to each institution
            for dept_name, dept_code in departments_list:
                curr_dept = session.execute(
                    select(Department).where(Department.institution_id == curr_inst.id, Department.code == dept_code)
                ).scalar_one_or_none()
                if not curr_dept:
                    curr_dept = Department(institution_id=curr_inst.id, name=dept_name, code=dept_code)
                    session.add(curr_dept)
                    session.flush()

                if inst_code == "AIT" and dept_code == "CSE":
                    dept = curr_dept

            for p_name, p_code, d_code, d_type in programme_templates:
                d_obj = session.execute(
                    select(Department).where(Department.institution_id == curr_inst.id, Department.code == d_code)
                ).scalar_one_or_none()
                if d_obj:
                    p_inst_code = f"{inst_code}-{p_code}"
                    existing_p = session.execute(
                        select(Programme).where(Programme.institution_id == curr_inst.id, Programme.code == p_inst_code)
                    ).scalar_one_or_none()
                    if not existing_p:
                        p_obj = Programme(
                            institution_id=curr_inst.id,
                            department_id=d_obj.id,
                            name=p_name,
                            code=p_inst_code,
                            degree_type=d_type,
                            duration_years=4,
                            total_semesters=8,
                            is_active=True,
                            description=f"Active degree programme for {inst_name}"
                        )
                        session.add(p_obj)
                        session.flush()

        assert bit_inst is not None

        # 4. Seed Academic Year & Semesters for Bannari Amman Institute of Technology (BIT)
        bit_ay = session.execute(
            select(AcademicYear).where(AcademicYear.institution_id == bit_inst.id, AcademicYear.year_label == "2026-2027")
        ).scalar_one_or_none()
        if not bit_ay:
            bit_ay = AcademicYear(
                institution_id=bit_inst.id,
                year_label="2026-2027",
                start_date=date(2026, 6, 1),
                end_date=date(2027, 5, 31),
                is_current=True
            )
            session.add(bit_ay)
            session.flush()
            logger.info("Created BIT Academic Year: 2026-2027")

        bit_semesters = {}
        for s_num in range(1, 9):
            term = "ODD" if s_num % 2 == 1 else "EVEN"
            s_obj = session.execute(
                select(Semester).where(Semester.academic_year_id == bit_ay.id, Semester.semester_number == s_num)
            ).scalar_one_or_none()
            if not s_obj:
                s_obj = Semester(
                    academic_year_id=bit_ay.id,
                    semester_number=s_num,
                    term_type=term,
                    start_date=date(2026, 6, 1) if term == "ODD" else date(2026, 12, 1),
                    end_date=date(2026, 11, 30) if term == "ODD" else date(2027, 5, 31),
                    is_active=True
                )
                session.add(s_obj)
                session.flush()
            bit_semesters[s_num] = s_obj

        # 5. Seed BIT CSE Subjects & Course Outcomes
        bit_cse_dept = session.execute(
            select(Department).where(Department.institution_id == bit_inst.id, Department.code == "CSE")
        ).scalar_one_or_none()
        bit_cse_prog = session.execute(
            select(Programme).where(Programme.institution_id == bit_inst.id, Programme.code == "BIT-BE-CSE")
        ).scalar_one_or_none()

        if bit_cse_dept and bit_cse_prog:
            semester_subjects = {
                1: [
                    ("BIT-MA101", "Engineering Mathematics I", "THEORY"),
                    ("BIT-CS101", "Programming in C", "THEORY"),
                    ("BIT-PH101", "Engineering Physics", "THEORY"),
                    ("BIT-CH101", "Engineering Chemistry", "THEORY"),
                    ("BIT-GE101", "Engineering Graphics", "THEORY"),
                    ("BIT-HS101", "English for Communication", "THEORY"),
                ],
                2: [
                    ("BIT-MA102", "Engineering Mathematics II", "THEORY"),
                    ("BIT-CS102", "Data Structures", "THEORY"),
                    ("BIT-CS103", "Object Oriented Programming", "THEORY"),
                    ("BIT-EC102", "Digital Logic Design", "THEORY"),
                    ("BIT-CS104", "Computer Organization", "THEORY"),
                    ("BIT-HS102", "Technical English", "THEORY"),
                ],
                3: [
                    ("BIT-MA201", "Discrete Mathematics", "THEORY"),
                    ("BIT-CS201", "Database Management Systems", "THEORY"),
                    ("BIT-CS202", "Operating Systems", "THEORY"),
                    ("BIT-CS203", "Computer Networks", "THEORY"),
                    ("BIT-CS204", "Design and Analysis of Algorithms", "THEORY"),
                    ("BIT-CS205", "Software Engineering", "THEORY"),
                ],
                4: [
                    ("BIT-CS206", "Theory of Computation", "THEORY"),
                    ("BIT-CS207", "Artificial Intelligence", "THEORY"),
                    ("BIT-CS208", "Web Technologies", "THEORY"),
                    ("BIT-EC208", "Microprocessors and Microcontrollers", "THEORY"),
                    ("BIT-MA202", "Probability and Statistics", "THEORY"),
                    ("BIT-CS209", "Professional Elective I", "THEORY"),
                ],
                5: [
                    ("BIT-CS301", "Machine Learning", "THEORY"),
                    ("BIT-CS302", "Cloud Computing", "THEORY"),
                    ("BIT-CS303", "Compiler Design", "THEORY"),
                    ("BIT-CS304", "Cyber Security", "THEORY"),
                    ("BIT-CS305", "Professional Elective II", "THEORY"),
                    ("BIT-OE301", "Open Elective I", "THEORY"),
                ],
                6: [
                    ("BIT-CS306", "Deep Learning", "THEORY"),
                    ("BIT-CS307", "Distributed Systems", "THEORY"),
                    ("BIT-CS308", "Mobile Application Development", "THEORY"),
                    ("BIT-CS309", "Professional Elective III", "THEORY"),
                    ("BIT-CS310", "Professional Elective IV", "THEORY"),
                    ("BIT-OE302", "Open Elective II", "THEORY"),
                ],
                7: [
                    ("BIT-CS401", "Natural Language Processing", "THEORY"),
                    ("BIT-CS402", "Big Data Analytics", "THEORY"),
                    ("BIT-CS403", "Internet of Things", "THEORY"),
                    ("BIT-CS404", "Professional Elective V", "THEORY"),
                    ("BIT-CS405", "Professional Elective VI", "THEORY"),
                    ("BIT-CS406", "Project Work Phase I", "PRACTICAL"),
                ],
                8: [
                    ("BIT-CS407", "Project Work Phase II", "PRACTICAL"),
                    ("BIT-CS408", "Internship / Industrial Training", "PRACTICAL"),
                    ("BIT-CS409", "Professional Elective VII", "THEORY"),
                    ("BIT-OE401", "Open Elective III", "THEORY"),
                ],
            }

            dbms_subject = None
            ml_subject = None

            for sem_num, subj_list in semester_subjects.items():
                sem_obj = bit_semesters[sem_num]
                course_code = f"BIT-CSE-SEM{sem_num}"
                course = session.execute(
                    select(Course).where(Course.programme_id == bit_cse_prog.id, Course.code == course_code)
                ).scalar_one_or_none()
                if not course:
                    course = Course(
                        department_id=bit_cse_dept.id,
                        programme_id=bit_cse_prog.id,
                        code=course_code,
                        name=f"BIT B.E. CSE Semester {sem_num} Course Structure",
                        credits=24
                    )
                    session.add(course)
                    session.flush()

                for s_code, s_name, s_type in subj_list:
                    subj = session.execute(
                        select(Subject).where(Subject.course_id == course.id, Subject.code == s_code)
                    ).scalar_one_or_none()
                    if not subj:
                        subj = Subject(
                            course_id=course.id,
                            semester_id=sem_obj.id,
                            code=s_code,
                            name=s_name,
                            subject_type=s_type
                        )
                        session.add(subj)
                        session.flush()

                    if s_code == "BIT-CS201":
                        dbms_subject = subj
                    if s_code == "BIT-CS301":
                        ml_subject = subj

            # Add Course Outcomes for Database Management Systems & Machine Learning
            if dbms_subject:
                co_dbms_list = [
                    ("CO1", "Understand fundamental concepts of database architecture, relational models, and normalization principles.", "UNDERSTAND"),
                    ("CO2", "Apply SQL and relational algebra query structures to extract and manipulate data.", "APPLY"),
                    ("CO3", "Analyze transaction management, concurrency control protocols, and indexing strategies.", "ANALYZE"),
                    ("CO4", "Design relational database schemas, ER diagrams, and normalized data models.", "CREATE"),
                    ("CO5", "Apply database management tools and security techniques to enterprise application problems.", "APPLY"),
                ]
                for co_code, co_stmt, co_bloom in co_dbms_list:
                    existing_co = session.execute(
                        select(CourseOutcome).where(CourseOutcome.subject_id == dbms_subject.id, CourseOutcome.code == co_code)
                    ).scalar_one_or_none()
                    if not existing_co:
                        co_obj = CourseOutcome(
                            subject_id=dbms_subject.id,
                            code=co_code,
                            statement=co_stmt,
                            bloom_level=co_bloom
                        )
                        session.add(co_obj)
                        session.flush()

            if ml_subject:
                co_ml_list = [
                    ("CO1", "Understand fundamental machine learning algorithms and learning paradigms.", "UNDERSTAND"),
                    ("CO2", "Apply classification, regression, and clustering algorithms to structured datasets.", "APPLY"),
                    ("CO3", "Analyze model performance metrics, error bounds, bias-variance tradeoff, and validation methods.", "ANALYZE"),
                    ("CO4", "Design custom feature engineering pipelines, ensemble models, and neural network architectures.", "CREATE"),
                    ("CO5", "Apply modern machine learning toolkits and frameworks to solve complex domain problems.", "APPLY"),
                ]
                for co_code, co_stmt, co_bloom in co_ml_list:
                    existing_co = session.execute(
                        select(CourseOutcome).where(CourseOutcome.subject_id == ml_subject.id, CourseOutcome.code == co_code)
                    ).scalar_one_or_none()
                    if not existing_co:
                        co_obj = CourseOutcome(
                            subject_id=ml_subject.id,
                            code=co_code,
                            statement=co_stmt,
                            bloom_level=co_bloom
                        )
                        session.add(co_obj)
                        session.flush()

        # 6. Seed Development Accounts
        from sqlalchemy import func
        admin_email = settings.SEED_ADMIN_EMAIL.lower().strip()
        admin_user = session.execute(select(User).where(func.lower(User.email) == admin_email)).scalar_one_or_none()
        if not admin_user:
            admin_user = User(
                email=admin_email,
                password_hash=hash_password(settings.SEED_ADMIN_PASSWORD),
                full_name="System Administrator",
                is_active=True,
                is_verified=True,
                is_approved=True,
                account_status="ACTIVE"
            )
            admin_user.roles.append(roles_dict["ADMIN"])
            session.add(admin_user)
            logger.info(f"Created Admin user: {admin_email}")
        else:
            admin_user.email = admin_email
            admin_user.password_hash = hash_password(settings.SEED_ADMIN_PASSWORD)
            admin_user.is_active = True
            admin_user.is_approved = True
            admin_user.account_status = "ACTIVE"

        fac_email = settings.SEED_FACULTY_APPROVED_EMAIL.lower().strip()
        fac_app = session.execute(select(User).where(func.lower(User.email) == fac_email)).scalar_one_or_none()
        if not fac_app:
            fac_app = User(
                email=fac_email,
                password_hash=hash_password(settings.SEED_FACULTY_PASSWORD),
                full_name="Dr. Alan Turing",
                is_active=True,
                is_verified=True,
                is_approved=True,
                account_status="ACTIVE"
            )
            fac_app.roles.append(roles_dict["FACULTY"])
            session.add(fac_app)
            session.flush()
        else:
            fac_app.email = fac_email
            fac_app.password_hash = hash_password(settings.SEED_FACULTY_PASSWORD)
            fac_app.is_active = True
            fac_app.is_approved = True
            fac_app.account_status = "ACTIVE"

        assert inst is not None
        assert dept is not None
        fac_prof = session.execute(select(FacultyProfile).where(FacultyProfile.user_id == fac_app.id)).scalar_one_or_none()
        if not fac_prof:
            fac_prof = session.execute(select(FacultyProfile).where(FacultyProfile.employee_id == "EMP-1001")).scalar_one_or_none()
        if not fac_prof:
            fac_prof = FacultyProfile(
                user_id=fac_app.id,
                employee_id="EMP-1001",
                designation="Senior Professor",
                department_id=dept.id,
                institution_id=inst.id,
                approval_status="APPROVED"
            )
            session.add(fac_prof)
        else:
            fac_prof.user_id = fac_app.id
            fac_prof.approval_status = "APPROVED"

        fac_pend_email = settings.SEED_FACULTY_PENDING_EMAIL.lower().strip()
        fac_pend = session.execute(select(User).where(func.lower(User.email) == fac_pend_email)).scalar_one_or_none()
        if not fac_pend:
            fac_pend = User(
                email=fac_pend_email,
                password_hash=hash_password(settings.SEED_FACULTY_PASSWORD),
                full_name="Dr. Grace Hopper",
                is_active=True,
                is_verified=True,
                is_approved=False,
                account_status="PENDING_APPROVAL"
            )
            fac_pend.roles.append(roles_dict["FACULTY"])
            session.add(fac_pend)
            session.flush()
        else:
            fac_pend.email = fac_pend_email
            fac_pend.password_hash = hash_password(settings.SEED_FACULTY_PASSWORD)

        fac_prof_pend = session.execute(select(FacultyProfile).where(FacultyProfile.user_id == fac_pend.id)).scalar_one_or_none()
        if not fac_prof_pend:
            fac_prof_pend = session.execute(select(FacultyProfile).where(FacultyProfile.employee_id == "EMP-1002")).scalar_one_or_none()
        if not fac_prof_pend:
            fac_prof_pend = FacultyProfile(
                user_id=fac_pend.id,
                employee_id="EMP-1002",
                designation="Assistant Professor",
                department_id=dept.id,
                institution_id=inst.id,
                approval_status="PENDING_APPROVAL"
            )
            session.add(fac_prof_pend)
        else:
            fac_prof_pend.user_id = fac_pend.id
            fac_prof_pend.approval_status = "PENDING_APPROVAL"

        stud_email = settings.SEED_STUDENT_EMAIL.lower().strip()
        student_user = session.execute(select(User).where(func.lower(User.email) == stud_email)).scalar_one_or_none()
        if not student_user:
            student_user = User(
                email=stud_email,
                password_hash=hash_password(settings.SEED_STUDENT_PASSWORD),
                full_name="Alice Smith",
                is_active=True,
                is_verified=True,
                is_approved=True,
                account_status="ACTIVE"
            )
            student_user.roles.append(roles_dict["STUDENT"])
            session.add(student_user)
            session.flush()
        else:
            student_user.email = stud_email
            student_user.password_hash = hash_password(settings.SEED_STUDENT_PASSWORD)
            student_user.is_active = True
            student_user.is_approved = True
            student_user.account_status = "ACTIVE"

        stud_prof = session.execute(select(StudentProfile).where(StudentProfile.user_id == student_user.id)).scalar_one_or_none()
        if not stud_prof:
            stud_prof = session.execute(select(StudentProfile).where(StudentProfile.student_id_number == "23CSE001")).scalar_one_or_none()
        if not stud_prof:
            stud_prof = StudentProfile(
                user_id=student_user.id,
                student_id_number="23CSE001",
                department_id=bit_cse_dept.id if bit_cse_dept else (dept.id if dept else None),
                institution_id=bit_inst.id if bit_inst else (inst.id if inst else None),
                programme_id=bit_cse_prog.id if bit_cse_prog else None
            )
            session.add(stud_prof)
        else:
            stud_prof.user_id = student_user.id
            stud_prof.student_id_number = "23CSE001"
            if bit_cse_prog:
                stud_prof.programme_id = bit_cse_prog.id

        student_unverified = session.execute(select(User).where(User.email == "student.unverified@platform.edu")).scalar_one_or_none()
        if not student_unverified:
            student_unverified = User(
                email="student.unverified@platform.edu",
                password_hash=hash_password("StudentPass123!"),
                full_name="Bob Jones",
                is_active=True,
                is_verified=False,
                is_approved=True,
                account_status="PENDING_EMAIL_VERIFICATION"
            )
            student_unverified.roles.append(roles_dict["STUDENT"])
            session.add(student_unverified)
            session.flush()
            assert inst is not None
            assert dept is not None
            stud_unver_prof = StudentProfile(
                user_id=student_unverified.id,
                student_id_number="STU-2024-002",
                department_id=dept.id,
                institution_id=inst.id
            )
            session.add(stud_unver_prof)
            logger.info("Created Unverified Student user: student.unverified@platform.edu")

        session.commit()
        logger.info("Database seed completed successfully.")
    except Exception as e:
        session.rollback()
        logger.error(f"Error seeding database: {e!s}")
        raise e
    finally:
        session.close()

if __name__ == "__main__":
    seed_database()
