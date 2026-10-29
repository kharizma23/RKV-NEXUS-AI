import asyncio
from app.database.session import async_engine
from sqlalchemy import text

async def inspect():
    async with async_engine.connect() as conn:
        res = await conn.execute(text("""
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'student_answers'
        """))
        cols = {r[0]: r[1] for r in res.fetchall()}
        print("Existing columns in student_answers:", list(cols.keys()))

        needed = {
            "ai_confidence_score": "DOUBLE PRECISION DEFAULT 0.85",
            "status": "VARCHAR(50) DEFAULT 'AUTO_GRADED'",
            "counterfactual_feedback": "TEXT",
            "ai_suggested_marks": "DOUBLE PRECISION",
            "rubric_breakdown": "JSONB",
            "extracted_text": "TEXT"
        }
        for col, col_type in needed.items():
            if col not in cols:
                print(f"Adding column {col} to student_answers...")
                await conn.execute(text(f"ALTER TABLE student_answers ADD COLUMN IF NOT EXISTS {col} {col_type};"))
                print(f"Column {col} added successfully.")
            else:
                print(f"Column {col} already exists.")
        await conn.commit()

asyncio.run(inspect())
