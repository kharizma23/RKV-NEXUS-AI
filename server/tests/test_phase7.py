import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_multimodal_ingestion_flow(client: AsyncClient):
    # 1. Login as Student
    student_login = await client.post(
        "/api/v1/auth/login",
        json={"email": "student@test.com", "password": "StudentPass123!"}
    )
    assert student_login.status_code == 200

    # 2. Get Exam Attempt
    exam_res = await client.get("/api/v1/examinations/published")
    assert exam_res.status_code == 200
    exams = exam_res.json()
    assert len(exams) > 0
    exam_id = exams[0]["id"]

    start_res = await client.post(f"/api/v1/examinations/attempts/start/{exam_id}")
    assert start_res.status_code == 201
    attempt_id = start_res.json()["id"]

    # 3. Process Handwritten OCR Script
    ocr_res = await client.post(f"/api/v1/multimodal/upload-handwritten/{attempt_id}")
    assert ocr_res.status_code == 201
    assert "extracted_text" in ocr_res.json()

    # 4. Process Voice Viva Audio
    viva_res = await client.post(f"/api/v1/multimodal/upload-viva/{attempt_id}")
    assert viva_res.status_code == 201
    assert "transcript_text" in viva_res.json()

    # 5. Process Diagram Region Scan
    diag_res = await client.post(f"/api/v1/multimodal/upload-diagram/{attempt_id}")
    assert diag_res.status_code == 201
    assert "structural_score" in diag_res.json()

    # 6. Fetch Multimodal Inspection Summary
    insp_res = await client.get(f"/api/v1/multimodal/inspection/{attempt_id}")
    assert insp_res.status_code == 200
    inspection = insp_res.json()
    assert len(inspection["ocr_scripts"]) > 0
    assert len(inspection["viva_transcripts"]) > 0
    assert len(inspection["diagram_evaluations"]) > 0
