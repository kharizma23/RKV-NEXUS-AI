from sqlalchemy import text
from app.database.session import sync_engine

def setup_core_tables():
    with sync_engine.begin() as conn:
        print("1. Adding image_url to student_answers if not exists...")
        conn.execute(text("ALTER TABLE student_answers ADD COLUMN IF NOT EXISTS image_url VARCHAR(500);"))

        print("2. Creating handwritten_submissions table with foreign keys...")
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS handwritten_submissions (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                answer_id UUID NOT NULL REFERENCES student_answers(id) ON DELETE CASCADE,
                exam_id UUID NOT NULL REFERENCES examinations(id) ON DELETE CASCADE,
                question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
                student_id UUID NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
                image_url VARCHAR(500) NOT NULL,
                extracted_text TEXT NOT NULL,
                confidence_score DOUBLE PRECISION NOT NULL DEFAULT 0.95,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        """))
        conn.execute(text("CREATE INDEX IF NOT EXISTS ix_handwritten_submissions_answer_id ON handwritten_submissions(answer_id);"))
        conn.execute(text("CREATE INDEX IF NOT EXISTS ix_handwritten_submissions_exam_id ON handwritten_submissions(exam_id);"))
        conn.execute(text("CREATE INDEX IF NOT EXISTS ix_handwritten_submissions_question_id ON handwritten_submissions(question_id);"))
        conn.execute(text("CREATE INDEX IF NOT EXISTS ix_handwritten_submissions_student_id ON handwritten_submissions(student_id);"))

        print("3. Creating co_attainments table with foreign keys...")
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS co_attainments (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
                exam_id UUID REFERENCES examinations(id) ON DELETE CASCADE,
                student_id UUID REFERENCES student_profiles(id) ON DELETE CASCADE,
                co_id UUID REFERENCES course_outcomes(id) ON DELETE CASCADE,
                co_code VARCHAR(50) NOT NULL,
                attainment_pct DOUBLE PRECISION NOT NULL DEFAULT 0.0,
                status VARCHAR(50) NOT NULL DEFAULT 'MET',
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        """))
        conn.execute(text("CREATE INDEX IF NOT EXISTS ix_co_attainments_subject_id ON co_attainments(subject_id);"))
        conn.execute(text("CREATE INDEX IF NOT EXISTS ix_co_attainments_exam_id ON co_attainments(exam_id);"))
        conn.execute(text("CREATE INDEX IF NOT EXISTS ix_co_attainments_student_id ON co_attainments(student_id);"))
        conn.execute(text("CREATE INDEX IF NOT EXISTS ix_co_attainments_co_id ON co_attainments(co_id);"))

        print("4. Creating compatibility views for exams, evaluations, knowledge_states...")
        conn.execute(text("CREATE OR REPLACE VIEW exams AS SELECT * FROM examinations;"))
        conn.execute(text("CREATE OR REPLACE VIEW evaluations AS SELECT * FROM evaluation_results;"))
        conn.execute(text("CREATE OR REPLACE VIEW knowledge_states AS SELECT * FROM student_knowledge_states;"))

        print("[SUCCESS] Database schema verification and enhancements complete!")

if __name__ == "__main__":
    setup_core_tables()
