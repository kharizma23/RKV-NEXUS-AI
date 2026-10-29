# Faculty Registration & Administrator Approval Workflow

## Overview
Faculty registration requires a two-step verification model: email verification followed by manual Administrator approval.

---

## 1. Faculty Registration Steps
1. Faculty member completes registration at `/register/faculty`.
2. Password hashed with Argon2id; `account_status` set to `PENDING_EMAIL_VERIFICATION`; `approval_status` set to `PENDING_APPROVAL`.
3. Faculty completes email verification, updating `account_status` to `PENDING_APPROVAL`.
4. Faculty login is blocked with: *"Account registration is pending administrator approval."*

---

## 2. Administrator Approval Queue
1. Administrator inspects `/admin/faculty-approvals` queue.
2. Filter applications by `PENDING_APPROVAL`, `APPROVED`, or `REJECTED`.
3. **Approve**: Sets `approval_status='APPROVED'`, `is_approved=True`, and `account_status='ACTIVE'`. Logs `FACULTY_APPROVED` audit event.
4. **Reject**: Requires a mandatory rejection reason. Sets `approval_status='REJECTED'`, `account_status='REJECTED'`, and logs `FACULTY_REJECTED` audit event.
