# Programme Management Workflow Architecture

## Overview
The **Programme Management** workflow enables platform administrators to create, edit, activate, deactivate, and monitor degree programmes within institutions and departments. Active programmes automatically propagate to public student registration forms, ensuring students can only register for verified, administrator-configured academic curricula.

---

## Data Model & Constraints

### Entity Schema (`programmes`)
- `id`: UUID (Primary Key)
- `institution_id`: UUID (Foreign Key `institutions.id`, On Delete CASCADE)
- `department_id`: UUID (Foreign Key `departments.id`, On Delete CASCADE)
- `name` / `programme_name`: String(255)
- `code` / `programme_code`: String(50) — Normalized to uppercase
- `degree_type`: String(50) (e.g. `Bachelor of Engineering`, `Bachelor of Technology`)
- `duration_years`: Integer (1 to 8, default `4`)
- `total_semesters`: Integer (1 to 16, default `8`)
- `regulation_name`: String(100), Optional (e.g. `CBCS 2026`)
- `description`: Text, Optional
- `is_active`: Boolean (Default `true`)
- `created_by`: UUID (Foreign Key `users.id`, On Delete SET NULL)
- `created_at` / `updated_at`: Timestamps

### Validation & Business Rules
1. **Programme Code Uniqueness**: Unique within an institution (`uq_programmes_institution_code`).
2. **Programme Name Uniqueness**: Unique within a department (case-insensitive normalized).
3. **Range Validation**: Duration between 1 and 8 years; total semesters between 1 and 16.
4. **Soft Deactivation**: Programmes with enrolled students or linked courses are soft-deactivated (`is_active = False`) rather than hard-deleted.

---

## 15 Standard Programme Templates

| # | Code | Programme Name | Suggested Dept |
|---|---|---|---|
| 1 | `BE-CSE` | B.E. Computer Science and Engineering | CSE |
| 2 | `BE-ECE` | B.E. Electronics and Communication Engineering | ECE |
| 3 | `BE-EEE` | B.E. Electrical and Electronics Engineering | EEE |
| 4 | `BE-MECH` | B.E. Mechanical Engineering | MECH |
| 5 | `BE-CIVIL` | B.E. Civil Engineering | CIVIL |
| 6 | `BE-MCT` | B.E. Mechatronics Engineering | ROBOTICS |
| 7 | `BE-BME` | B.E. Biomedical Engineering | BM |
| 8 | `BTECH-IT` | B.Tech. Information Technology | IT |
| 9 | `BTECH-AIDS` | B.Tech. Artificial Intelligence and Data Science | AIDS |
| 10 | `BTECH-AIML` | B.Tech. Artificial Intelligence and Machine Learning | AIML |
| 11 | `BTECH-CSBS` | B.Tech. Computer Science and Business Systems | CSBS |
| 12 | `BTECH-BT` | B.Tech. Biotechnology | BT |
| 13 | `BTECH-CHEM` | B.Tech. Chemical Engineering | CHEMICAL |
| 14 | `BTECH-FT` | B.Tech. Food Technology | FT |
| 15 | `BTECH-TT` | B.Tech. Textile Technology | MECH |

---

## API Contract

### Admin APIs (`/api/v1/admin/programmes`) — Restricted to ADMIN
- `GET /templates`: List the 15 standard templates.
- `GET /`: List programmes with filters (`institution_id`, `department_id`, `is_active`). Includes enrolled student counts.
- `POST /`: Create programme with optional `auto_create_semesters`.
- `GET /{id}`: Retrieve programme details.
- `PATCH /{id}`: Update programme details.
- `POST /{id}/activate`: Activate programme.
- `POST /{id}/deactivate`: Deactivate programme.
- `GET /{id}/students`: List enrolled students under programme.

### Public Metadata APIs (`/api/v1/public`)
- `GET /institutions/{institution_id}/departments/{department_id}/programmes`: Returns active programmes (`is_active = True`) formatted as `Programme Name — Code`.
- `GET /programmes/{programme_id}/academic-years`: Returns active academic years.
- `GET /programmes/{programme_id}/semesters`: Returns active semesters.

---

## Semester Auto-Generation Logic
When `auto_create_semesters=True` during programme creation, the platform:
1. Checks for an active `AcademicYear` for the institution (or creates current `2026–2027` if none exists).
2. Automatically generates `Semester 1` through `Semester N` (e.g. `Semester 1` to `Semester 8`) avoiding duplicates.
