# Student Registration Workflow

## Overview
Student registration allows students to register with their institution, department, programme, academic year, semester, and registration number.

---

## 1. Registration Process
1. Student navigates to `/register` selection page and chooses **Register as Student** (`/register/student`).
2. Student completes multi-section form:
   - **Personal Details**: Full Name, Email, Phone Number, Preferred Language.
   - **Academic Details**: Institution → Department → Programme → Academic Year → Semester (Dependent dropdowns) and Registration Number.
   - **Security**: Password & Confirm Password (evaluated against password strength rules).
   - **Consent**: Accept Privacy Policy & Terms of Service.
3. System hashes password with Argon2id, sets `account_status='PENDING_EMAIL_VERIFICATION'`, and logs `STUDENT_REGISTERED` audit event.
4. Student is redirected to `/register/success` and completes email verification via `/verify-email`.
5. Upon email verification, `account_status` transitions to `ACTIVE`.
