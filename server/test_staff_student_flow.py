import asyncio
import httpx
from app.main import app

async def test_full_staff_to_student_flow():
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test", timeout=45.0) as client:
        # 1. Staff Login
        print("[1] Logging in as Staff (Dr. Rajesh Sharma)...")
        res_fac = await client.post("/api/v1/auth/login", json={
            "email": "prof.sharma@ait.edu",
            "password": "Password123!"
        })
        assert res_fac.status_code == 200, f"Staff login failed: {res_fac.text}"
        fac_token = res_fac.json()["access_token"]
        fac_headers = {"Authorization": f"Bearer {fac_token}"}
        print("    Staff authenticated successfully!")

        res_me = await client.get("/api/v1/auth/me", headers=fac_headers)
        me_data = res_me.json()
        print(f"    Staff Name: {me_data.get('full_name')} | Email: {me_data.get('email')}")

        inst_id = "7700ee18-bc62-4199-83f2-7e7f86650445"
        dept_id = "e10b4e14-4301-4f7b-a9ae-e2e6c7bca930"
        subj_id = "1a8c9a6c-f429-4a8d-a0fb-a3c6d883e301"

        # 2. Staff creates examination with MCQ, Descriptive, and Handwritten questions
        print("\n[2] Staff creating comprehensive examination...")
        create_payload = {
            "title": "Continuous Assessment Test 1: Advanced Computing & Systems",
            "subject_id": subj_id,
            "exam_type": "Continuous Internal Evaluation",
            "duration_minutes": 60,
            "total_marks": 50.0,
            "description": "Standardized department evaluation covering concurrency, virtual memory, and deadlock conditions.",
            "questions": [
                {
                    "prompt": "Which synchronization primitive provides mutual exclusion without busy waiting in multicore kernel scheduling?",
                    "question_type": "MCQ",
                    "difficulty": "MEDIUM",
                    "marks": 10.0,
                    "options": [
                        {"option_text": "Spinlock with test-and-set", "is_correct": False},
                        {"option_text": "Counting Semaphore with wait/signal queue", "is_correct": True},
                        {"option_text": "Condition Variable without lock", "is_correct": False},
                        {"option_text": "Peterson's two-process software latch", "is_correct": False}
                    ]
                },
                {
                    "prompt": "Explain how virtual memory paging eliminates external fragmentation while permitting shared library segments across address spaces.",
                    "question_type": "Theory",
                    "difficulty": "MEDIUM",
                    "marks": 20.0,
                    "options": []
                },
                {
                    "prompt": "Upload handwritten sheet analyzing the 4 Coffman conditions required for deadlock formation and the Banker's Safety algorithm.",
                    "question_type": "Handwritten",
                    "difficulty": "HARD",
                    "marks": 20.0,
                    "options": []
                }
            ]
        }
        res_create = await client.post("/api/v1/faculty/exams", headers=fac_headers, json=create_payload)
        print("    Create exam response:", res_create.status_code)
        assert res_create.status_code == 201, f"Create failed: {res_create.text}"
        created_exam = res_create.json()
        target_exam_id = created_exam["id"]
        print(f"    Exam created successfully! ID: {target_exam_id} | Title: {created_exam['title']}")

        # 3. Staff assigns the exam to Apex Institute of Technology (AIT) CSE Department
        print(f"\n[3] Staff assigning exam {target_exam_id} to Department CSE...")
        res_assign = await client.post(
            f"/api/v1/faculty/exams/{target_exam_id}/assign",
            headers=fac_headers,
            json={
                "institution_id": inst_id,
                "department_id": dept_id,
                "start_time": "2026-10-28T00:00:00Z",
                "end_time": "2026-10-31T23:59:59Z"
            }
        )
        print("    Assign response:", res_assign.status_code, res_assign.json())
        assert res_assign.status_code == 200

        # 4. Student Login (Arun Kumar)
        print("\n[4] Logging in as Student (Arun Kumar)...")
        res_stu = await client.post("/api/v1/auth/login", json={
            "email": "student.arun@ait.edu",
            "password": "Password123!"
        })
        assert res_stu.status_code == 200, f"Student login failed: {res_stu.text}"
        stu_token = res_stu.json()["access_token"]
        stu_headers = {"Authorization": f"Bearer {stu_token}"}
        print("    Student authenticated successfully!")

        # 5. Student checks assigned exams
        print("[5] Checking Student Portal for assigned examinations...")
        res_stu_exams = await client.get("/api/v1/student/exams", headers=stu_headers)
        assert res_stu_exams.status_code == 200
        stu_exams = res_stu_exams.json()
        print(f"    Student Arun Kumar received {len(stu_exams)} assigned exams:")
        assigned_match = next((e for e in stu_exams if e["exam_id"] == str(target_exam_id)), None)
        assert assigned_match is not None, "Newly assigned exam was not found in student's portal!"
        print(f"    CONFIRMED: '{assigned_match['title']}' is available for student attendance!")

        # 6. Student views questions for the assigned exam
        print(f"\n[6] Student opening exam {target_exam_id}...")
        res_detail = await client.get(f"/api/v1/student/exams/{target_exam_id}", headers=stu_headers)
        assert res_detail.status_code == 200
        detail = res_detail.json()
        print(f"    Exam Title: {detail.get('title')}")
        questions = detail.get("questions", [])
        print(f"    Questions found: {len(questions)}")
        for idx, q in enumerate(questions):
            print(f"       Q{idx+1}: {q.get('prompt')} [{q.get('question_type')}] (Marks: {q.get('marks')})")

        # 7. Student submits answers (MCQ + Theory + Handwritten transcribed work)
        print("\n[7] Student submitting answers...")
        answers_payload = [
            {
                "question_id": questions[0]["id"],
                "selected_option_text": "Counting Semaphore with wait/signal queue"
            },
            {
                "question_id": questions[1]["id"],
                "selected_option_text": "Virtual memory divides process address space into uniform page frames, completely removing external fragmentation while translation lookaside buffers maintain linear addressing speed."
            },
            {
                "question_id": questions[2]["id"],
                "selected_option_text": "[Handwritten OCR Transcribed Answer]: Coffman conditions: 1. Mutual Exclusion, 2. Hold and Wait, 3. No Preemption, 4. Circular Wait. Banker's algorithm calculates allocation matrices to prevent unsafe state transitions."
            }
        ]

        res_submit = await client.post(
            f"/api/v1/student/exams/{target_exam_id}/submit",
            headers=stu_headers,
            json={"answers": answers_payload}
        )
        print("    Submission Status:", res_submit.status_code, res_submit.json())
        assert res_submit.status_code == 200

        # 8. Student / Staff views AI evaluation results
        print("\n[8] Fetching AI Evaluation Scorecard...")
        res_results = await client.get(f"/api/v1/student/exams/{target_exam_id}/results", headers=stu_headers)
        print("    Evaluation Status:", res_results.status_code)
        assert res_results.status_code == 200
        res_json = res_results.json()
        print(f"    Marks Obtained: {res_json.get('marks_obtained')} / {res_json.get('total_marks')}")
        print(f"    Percentage: {res_json.get('percentage')}% | Status: {res_json.get('status')}")
        print("\n ALL VERIFICATIONS PASSED SEAMLESSLY!")

if __name__ == "__main__":
    asyncio.run(test_full_staff_to_student_flow())
