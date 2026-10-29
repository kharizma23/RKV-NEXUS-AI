# ADR-002: Authentication & Token Security Strategy

## Status
Accepted

## Context
Securing an academic examination platform requires high resistance to credential theft, token tampering, and session hijacking. LocalStorage is vulnerable to XSS attacks, while pure session-based authentication struggles with modern API scalability.

## Decision
We implement a hybrid JWT & Cookie-based security architecture:
1. **Password Hashing**: Passwords are hashed using `argon2id` (`argon2-cffi`) with `time_cost=3`, `memory_cost=65536`, `parallelism=4`.
2. **Access Tokens**: Short-lived JWTs (15 minutes) containing User ID, Roles, and Granular Permissions.
3. **Refresh Tokens**: Longer-lived tokens (7 days) with token rotation on refresh. Only SHA-256 hashes of refresh tokens are stored in the PostgreSQL database (`refresh_tokens` table).
4. **Cookie Security**: Tokens are transmitted strictly via `HttpOnly`, `Secure`, `SameSite=Lax` cookies. Access and refresh tokens are **never** stored in browser `localStorage` or `sessionStorage`.
5. **Account Lockout**: 5 consecutive failed login attempts within 15 minutes trigger an automated 15-minute account lockout (`AccountLockedError`).
6. **Faculty Approval Workflow**: Faculty accounts default to `is_approved = False` upon registration and require explicit administrator approval before login.

## Consequences
- **Positive**: Complete protection against XSS token extraction, robust token rotation, brute-force protection, full auditability.
- **Negative**: CSRF protection must be enforced for cookie-authenticated state-changing requests.
