# API Contract Specification

## Base URL
`/api/v1`

## Standard Error Response Format
```json
{
  "code": "ERROR_CODE_STRING",
  "message": "Human readable message",
  "details": null,
  "request_id": "uuid-v4-string"
}
```

## Implemented API Endpoints

### Authentication (`/auth`)
- `POST /api/v1/auth/register/student`
- `POST /api/v1/auth/register/faculty`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/refresh`
- `POST /api/v1/auth/logout`
- `GET /api/v1/auth/me`
- `POST /api/v1/auth/forgot-password`
- `POST /api/v1/auth/reset-password`
- `POST /api/v1/auth/verify-email`

### User Administration (`/admin`)
- `GET /api/v1/admin/users`
- `PATCH /api/v1/admin/users/{user_id}/status`
- `PATCH /api/v1/admin/faculty/{user_id}/approval`

### Audit & Roles (`/audit-logs`, `/roles`, `/institutions`)
- `GET /api/v1/audit-logs`
- `GET /api/v1/roles`
- `GET /api/v1/roles/permissions`
- `GET /api/v1/institutions`
- `POST /api/v1/institutions`
- `POST /api/v1/institutions/departments`

### System Health
- `GET /health`
- `GET /ready`
