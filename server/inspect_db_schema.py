import asyncio
from app.database.session import AsyncSessionLocal
from sqlalchemy import text

async def inspect():
    async with AsyncSessionLocal() as session:
        res = await session.execute(text("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            ORDER BY table_name;
        """))
        all_tables = [r[0] for r in res.fetchall()]
        print("ALL TABLES IN DATABASE:")
        for t in all_tables:
            print(f"  - {t}")
        
        target_tables = [
            "examinations", "exams", "exam_questions", "student_exam_attempts",
            "student_answers", "handwritten_submissions", "ocr_extracted_scripts",
            "evaluations", "evaluation_results", "question_evaluations",
            "co_attainments", "knowledge_states", "counterfactual_feedback"
        ]
        
        print("\nTARGET TABLE DETAILS:")
        for t in target_tables:
            if t in all_tables:
                col_res = await session.execute(text("""
                    SELECT column_name, data_type, is_nullable 
                    FROM information_schema.columns 
                    WHERE table_name = :tbl 
                    ORDER BY ordinal_position;
                """), {"tbl": t})
                cols = [f"{r[0]} ({r[1]}, null={r[2]})" for r in col_res.fetchall()]
                
                fk_res = await session.execute(text("""
                    SELECT
                        kcu.column_name,
                        ccu.table_name AS foreign_table_name,
                        ccu.column_name AS foreign_column_name
                    FROM information_schema.table_constraints AS tc
                    JOIN information_schema.key_column_usage AS kcu
                      ON tc.constraint_name = kcu.constraint_name
                      AND tc.table_schema = kcu.table_schema
                    JOIN information_schema.constraint_column_usage AS ccu
                      ON ccu.constraint_name = tc.constraint_name
                      AND ccu.table_schema = tc.table_schema
                    WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_name = :tbl;
                """), {"tbl": t})
                fks = [f"{r[0]} -> {r[1]}.{r[2]}" for r in fk_res.fetchall()]
                
                print(f"\n[TABLE EXISTS] {t}")
                print(f"  Columns: {', '.join(cols)}")
                print(f"  FKs: {', '.join(fks) if fks else 'None'}")
            else:
                print(f"\n[TABLE MISSING] {t}")

if __name__ == "__main__":
    asyncio.run(inspect())
