import uuid
from datetime import datetime
from typing import List, Optional, Any
from pydantic import BaseModel, ConfigDict

class OCRExtractedScriptResponse(BaseModel):
    id: uuid.UUID
    answer_id: uuid.UUID
    image_url: str
    page_number: int
    extracted_text: str
    confidence_score: float
    bounding_boxes: Optional[Any] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class VivaAudioTranscriptResponse(BaseModel):
    id: uuid.UUID
    answer_id: uuid.UUID
    audio_url: str
    transcript_text: str
    duration_seconds: int
    speech_confidence: float
    word_timestamps: Optional[Any] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class DiagramRegionEvaluationResponse(BaseModel):
    id: uuid.UUID
    answer_id: uuid.UUID
    diagram_url: str
    detected_components: Optional[Any] = None
    missing_components: Optional[Any] = None
    structural_score: float
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class MultimodalInspectionResponse(BaseModel):
    answer_id: uuid.UUID
    ocr_scripts: list[OCRExtractedScriptResponse] = []
    viva_transcripts: list[VivaAudioTranscriptResponse] = []
    diagram_evaluations: list[DiagramRegionEvaluationResponse] = []
