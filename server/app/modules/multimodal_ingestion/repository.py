import uuid
from typing import List, Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.modules.multimodal_ingestion.model import OCRExtractedScript, VivaAudioTranscript, DiagramRegionEvaluation

class MultimodalIngestionRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def create_ocr_script(self, answer_id: uuid.UUID, image_url: str, text: str, page_number: int = 1, boxes: Optional[list] = None) -> OCRExtractedScript:
        ocr = OCRExtractedScript(
            answer_id=answer_id,
            image_url=image_url,
            page_number=page_number,
            extracted_text=text,
            confidence_score=0.94,
            bounding_boxes=boxes or [{"box": [10, 10, 200, 50], "text": text[:30]}]
        )
        self.session.add(ocr)
        await self.session.flush()
        return ocr

    async def list_ocr_scripts(self, answer_id: uuid.UUID) -> list[OCRExtractedScript]:
        stmt = select(OCRExtractedScript).where(OCRExtractedScript.answer_id == answer_id)
        res = await self.session.execute(stmt)
        return list(res.scalars().all())

    async def create_viva_transcript(self, answer_id: uuid.UUID, audio_url: str, transcript: str, duration: int = 60) -> VivaAudioTranscript:
        viva = VivaAudioTranscript(
            answer_id=answer_id,
            audio_url=audio_url,
            transcript_text=transcript,
            duration_seconds=duration,
            speech_confidence=0.89,
            word_timestamps=[{"word": w, "start_ms": idx * 300, "end_ms": (idx + 1) * 300} for idx, w in enumerate(transcript.split()[:20])]
        )
        self.session.add(viva)
        await self.session.flush()
        return viva

    async def list_viva_transcripts(self, answer_id: uuid.UUID) -> list[VivaAudioTranscript]:
        stmt = select(VivaAudioTranscript).where(VivaAudioTranscript.answer_id == answer_id)
        res = await self.session.execute(stmt)
        return list(res.scalars().all())

    async def create_diagram_evaluation(self, answer_id: uuid.UUID, diagram_url: str, score: float = 88.0) -> DiagramRegionEvaluation:
        diag = DiagramRegionEvaluation(
            answer_id=answer_id,
            diagram_url=diagram_url,
            detected_components=["Block Diagram Header", "Quantization Sampler", "Receiver Reconstruction Filter"],
            missing_components=["Noise Suppression Feedback Loop"],
            structural_score=score
        )
        self.session.add(diag)
        await self.session.flush()
        return diag

    async def list_diagram_evaluations(self, answer_id: uuid.UUID) -> list[DiagramRegionEvaluation]:
        stmt = select(DiagramRegionEvaluation).where(DiagramRegionEvaluation.answer_id == answer_id)
        res = await self.session.execute(stmt)
        return list(res.scalars().all())
