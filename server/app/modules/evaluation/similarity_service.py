import uuid
import math
from typing import Optional, Tuple, List
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.modules.assessment_attempts.model import StudentAnswer

def calculate_cosine_similarity(text1: str, text2: str) -> float:
    """
    Calculate semantic word vector cosine similarity between two text responses.
    """
    t1_clean = (text1 or "").strip().lower()
    t2_clean = (text2 or "").strip().lower()

    if not t1_clean or not t2_clean:
        return 0.0

    if t1_clean == t2_clean:
        return 1.0

    words1 = [w for w in t1_clean.split() if len(w) > 2]
    words2 = [w for w in t2_clean.split() if len(w) > 2]

    if not words1 or not words2:
        return 0.0

    set1 = set(words1)
    set2 = set(words2)

    intersection = set1.intersection(set2)
    if not intersection:
        return 0.0

    union = set1.union(set2)
    jaccard = len(intersection) / len(union)

    dot_product = sum(words1.count(w) * words2.count(w) for w in intersection)
    norm1 = math.sqrt(sum(words1.count(w) ** 2 for w in set1))
    norm2 = math.sqrt(sum(words2.count(w) ** 2 for w in set2))

    cosine = dot_product / (norm1 * norm2) if (norm1 * norm2) > 0 else 0.0

    hybrid_sim = round((0.6 * cosine) + (0.4 * jaccard), 4)
    return min(1.0, max(0.0, hybrid_sim))

class AnswerSimilarityService:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def check_answer_similarity(
        self,
        current_answer_id: uuid.UUID,
        question_id: uuid.UUID,
        text_response: str,
        threshold: float = 0.75
    ) -> tuple[bool, float, Optional[uuid.UUID]]:
        """
        Compares student subjective answer against prior student answers for the same question.
        Returns: (is_potentially_similar, max_similarity_score, matched_answer_id)
        """
        if not text_response or len(text_response.strip()) < 15:
            return False, 0.0, None

        stmt = select(StudentAnswer).where(
            StudentAnswer.question_id == question_id,
            StudentAnswer.id != current_answer_id,
            StudentAnswer.text_response.is_not(None)
        ).limit(50)

        res = await self.session.execute(stmt)
        other_answers = list(res.scalars().all())

        max_sim = 0.0
        matched_id = None

        for prev_ans in other_answers:
            if not prev_ans.text_response:
                continue
            sim = calculate_cosine_similarity(text_response, prev_ans.text_response)
            if sim > max_sim:
                max_sim = sim
                matched_id = prev_ans.id

        is_flagged = max_sim >= threshold
        return is_flagged, max_sim, matched_id
