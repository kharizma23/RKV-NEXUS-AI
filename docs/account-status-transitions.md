# Account Status State Transitions

## State Transition Reference Table

| Current Status | Event / Trigger | Target Status | Preconditions |
| :--- | :--- | :--- | :--- |
| `[*] (New)` | Student / Faculty Registration | `PENDING_EMAIL_VERIFICATION` | Unique email & ID number |
| `PENDING_EMAIL_VERIFICATION` | Email Verification Token | `PENDING_APPROVAL` | Faculty registration mode |
| `PENDING_EMAIL_VERIFICATION` | Email Verification Token | `ACTIVE` | Student auto-activation mode |
| `PENDING_APPROVAL` | Admin Approve Action | `ACTIVE` | Email verified |
| `PENDING_APPROVAL` | Admin Reject Action | `REJECTED` | Mandatory reason provided |
| `ACTIVE` | 5 Consecutive Failed Logins | `LOCKED` | 15-minute temporary lockout |
| `LOCKED` | 15-min Expiry or Admin Unlock | `ACTIVE` | Lockout duration passed |
| `ACTIVE` | Admin Deactivate Action | `INACTIVE` | Admin intervention |
| `INACTIVE` | Admin Activate Action | `ACTIVE` | Admin intervention |
