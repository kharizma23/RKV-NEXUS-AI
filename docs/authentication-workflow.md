# Production-Structured Authentication Workflow

## Overview
The platform enforces a production-structured, multi-role authentication architecture supporting **Administrator**, **Faculty**, and **Student** accounts with individual credentials, Argon2id password hashing, HttpOnly JWT cookies, 5-attempt brute-force lockout, and audit logging.

---

## 1. Public Authentication Endpoints
- `POST /api/v1/auth/register/student`: Student self-registration portal.
- `POST /api/v1/auth/register/faculty`: Faculty self-registration portal (submits to admin approval queue).
- `POST /api/v1/auth/login`: Role-agnostic login endpoint. Reads user role from database and returns server-driven redirect hint (`/admin/dashboard`, `/faculty/dashboard`, `/student/dashboard`).
- `POST /api/v1/auth/verify-email`: Completes email verification.
- `POST /api/v1/auth/resend-verification`: Dispatches new verification token without revealing user presence.
- `POST /api/v1/auth/forgot-password` & `POST /api/v1/auth/reset-password`: Password recovery workflow.
- `GET /api/v1/auth/account-status`: Fetches authenticated user's real-time account status and approval state.

---

## 2. Token & Session Management
- **Access Tokens**: Short-lived JWT (15-30 minutes) stored in `access_token` HttpOnly, SameSite, Secure cookie.
- **Refresh Tokens**: Long-lived single-use refresh token (7 days) stored in `refresh_token` HttpOnly cookie. Rotated on every token refresh request.
- **Session Revocation**: Password reset and administrative session revocation invalidate all stored refresh token hashes for the targeted user.
