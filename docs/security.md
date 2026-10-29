# Security Architecture & Threat Model

## Threat Mitigation Matrix

| Threat Model | Vulnerability Vector | Mitigation Mechanism |
| :--- | :--- | :--- |
| **Credential Compromise** | Password Database Leak | Passwords hashed using Argon2id (`time_cost=3`, `memory_cost=65536`, `parallelism=4`). |
| **Weak Password Choice** | Dictionary & Brute-Force | Strict password rules: min 10 chars, uppercase, lowercase, digit, special character, no email/ID substring. |
| **Session Theft** | XSS Token Extraction | Tokens stored exclusively in `HttpOnly`, `SameSite=Lax`, `Secure` cookies. Zero localStorage usage. |
| **Brute Force Login** | Password Guessing Attacks | 5 failed login attempts trigger 15-minute account lockout (`account_status='LOCKED'`). |
| **Unauthorized Faculty Access** | Self-Registration Abuse | Faculty accounts default to `approval_status='PENDING_APPROVAL'` and require manual Administrator approval. |
| **Arbitrary Faculty Rejection** | Lack of Accountability | Rejection requires a mandatory written reason stored in `faculty_approval_events` and audit logs. |
| **Token Replay / Theft** | Stolen Refresh Token | Refresh token rotation revokes old token upon issuance of new token; DB stores SHA-256 hash only. |
| **Audit Tampering** | Unlogged System Changes | All authentication, status updates, and faculty approvals trigger immutable `AuditLog` records. |
| **Seed Credential Exposure** | Public Deployment Leakage | Development seed accounts explicitly labeled `DEVELOPMENT-ONLY TEST ACCOUNTS` and must be changed prior to production. |
