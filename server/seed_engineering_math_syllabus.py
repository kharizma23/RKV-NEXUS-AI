import asyncio
import uuid
from datetime import datetime, timezone
from sqlalchemy import text, select
from app.database.session import AsyncSessionLocal
from app.modules.academics.model import Subject
from app.modules.syllabus.model import Unit, Topic
from app.modules.learning_outcomes.model import CourseOutcome

async def seed_math_syllabus():
    async with AsyncSessionLocal() as session:
        # Find BIT-MA101
        res = await session.execute(text("SELECT id, code, name FROM subjects WHERE code = 'BIT-MA101'"))
        subj = res.fetchone()
        if not subj:
            print("Subject BIT-MA101 not found!")
            return
        
        subj_id = subj[0]
        print(f"Found {subj[1]} ({subj[2]}) with ID {subj_id}")

        # Check existing units and delete if any
        await session.execute(text("DELETE FROM topics WHERE unit_id IN (SELECT id FROM units WHERE subject_id = :sid)"), {"sid": subj_id})
        await session.execute(text("DELETE FROM units WHERE subject_id = :sid"), {"sid": subj_id})
        await session.execute(text("DELETE FROM course_outcomes WHERE subject_id = :sid"), {"sid": subj_id})
        await session.commit()

        now = datetime.now(timezone.utc)

        # Seed Units and Topics
        units_data = [
            {
                "unit_number": 1,
                "title": "Matrices and Linear Algebra",
                "description": "Eigenvalues, eigenvectors, Cayley-Hamilton theorem, and orthogonal transformation of quadratic forms.",
                "weightage": 20,
                "topics": [
                    (1, "Characteristic Equation, Eigenvalues and Eigenvectors of Real Symmetric Matrices", "Formulation of characteristic polynomial and spectral computation"),
                    (2, "Properties of Eigenvalues and Cayley-Hamilton Theorem", "Matrix inverse and high powers using Cayley-Hamilton theorem"),
                    (3, "Diagonalization of Matrices & Orthogonal Transformation", "Modal and normalized modal matrix transformations"),
                    (4, "Quadratic Forms and Reduction to Canonical Form", "Nature of quadratic forms, rank, signature, and index")
                ]
            },
            {
                "unit_number": 2,
                "title": "Differential Calculus and Geometry of Curves",
                "description": "Curvature, circle of curvature, evolutes, envelopes, and polynomial approximation.",
                "weightage": 20,
                "topics": [
                    (1, "Curvature in Cartesian, Parametric and Polar Coordinates", "Radius of curvature for plane and polar curves"),
                    (2, "Center and Circle of Curvature, Evolutes and Involutes", "Geometric loci of centers of curvature"),
                    (3, "Envelopes of Families of Curves", "Single and two-parameter curve family envelopes"),
                    (4, "Maclaurin and Taylor Series Expansions", "Polynomial approximation and indeterminate forms")
                ]
            },
            {
                "unit_number": 3,
                "title": "Multivariable Calculus & Constrained Optimization",
                "description": "Partial differentiation, total differentials, Jacobians, and Lagrange multipliers.",
                "weightage": 20,
                "topics": [
                    (1, "Partial Derivatives, Total Differential and Euler's Theorem", "Homogeneous function differentiation and differentials"),
                    (2, "Jacobians and Functional Dependence", "Coordinate transformations and determinant evaluation"),
                    (3, "Taylor's Series for Functions of Two Variables", "Multivariate polynomial expansions and error bounds"),
                    (4, "Maxima, Minima and Method of Lagrange Multipliers", "Constrained and unconstrained extrema in 3D spaces")
                ]
            },
            {
                "unit_number": 4,
                "title": "Integral Calculus and Special Functions",
                "description": "Definite integrals, reduction formulae, Beta-Gamma functions, and geometric revolution applications.",
                "weightage": 20,
                "topics": [
                    (1, "Definite Integrals and Applications to Length of Curves", "Arc length evaluation for plane parametric curves"),
                    (2, "Integration by Parts and Standard Reduction Formulae", "Trigonometric and polynomial reduction relations"),
                    (3, "Beta and Gamma Functions and Their Inter-Relations", "Properties, duplication formula, and asymptotic behavior"),
                    (4, "Volume and Surface Area of Revolution", "Solids of revolution about arbitrary coordinate axes")
                ]
            },
            {
                "unit_number": 5,
                "title": "Vector Calculus & Field Theorems",
                "description": "Vector operators, flux, circulation, and Green's, Gauss, and Stokes' integral theorems.",
                "weightage": 20,
                "topics": [
                    (1, "Vector Differential Operator: Gradient, Directional Derivative, Divergence and Curl", "Physical interpretation of fluid and field divergence"),
                    (2, "Solenoidal and Irrotational Vector Fields & Scalar Potential", "Conservative fields and potential work done"),
                    (3, "Line, Surface and Volume Integrals in Vector Fields", "Evaluation of path integrals and surface fluxes"),
                    (4, "Green's, Gauss Divergence and Stokes' Theorems", "Integral transformation between boundary and volume domains")
                ]
            }
        ]

        for u_info in units_data:
            unit_id = uuid.uuid4()
            await session.execute(
                text("""
                    INSERT INTO units (id, subject_id, unit_number, title, description, weightage, created_at, updated_at)
                    VALUES (:id, :subj_id, :un, :title, :desc, :w, :now, :now)
                """),
                {
                    "id": unit_id,
                    "subj_id": subj_id,
                    "un": u_info["unit_number"],
                    "title": u_info["title"],
                    "desc": u_info["description"],
                    "w": u_info["weightage"],
                    "now": now
                }
            )
            for t_num, t_title, t_desc in u_info["topics"]:
                await session.execute(
                    text("""
                        INSERT INTO topics (id, unit_id, topic_number, title, description, created_at, updated_at)
                        VALUES (:id, :uid, :tn, :title, :desc, :now, :now)
                    """),
                    {
                        "id": uuid.uuid4(),
                        "uid": unit_id,
                        "tn": t_num,
                        "title": t_title,
                        "desc": t_desc,
                        "now": now
                    }
                )

        # Seed Course Outcomes
        cos_data = [
            ("CO1", "Calculate eigenvalues and eigenvectors of real symmetric matrices and apply Cayley-Hamilton theorem to diagonalize quadratic forms.", "APPLY"),
            ("CO2", "Evaluate curvature, evolutes, and envelopes of curves using differential calculus concepts.", "EVALUATE"),
            ("CO3", "Analyze extremum values of multivariable functions using partial derivatives and Lagrange multipliers.", "ANALYZE"),
            ("CO4", "Solve improper definite integrals using Beta and Gamma special functions for engineering geometric computations.", "APPLY"),
            ("CO5", "Verify Green's, Stokes', and Gauss Divergence theorems for vector field flux and circulation analysis.", "UNDERSTAND"),
        ]

        for code, stmt, bloom in cos_data:
            await session.execute(
                text("""
                    INSERT INTO course_outcomes (id, subject_id, code, statement, bloom_level, created_at, updated_at)
                    VALUES (:id, :sid, :code, :stmt, :bloom, :now, :now)
                """),
                {
                    "id": uuid.uuid4(),
                    "sid": subj_id,
                    "code": code,
                    "stmt": stmt,
                    "bloom": bloom,
                    "now": now
                }
            )

        await session.commit()
        print("Successfully seeded 5 Units, 20 Topics, and 5 Course Outcomes for BIT-MA101!")

asyncio.run(seed_math_syllabus())

