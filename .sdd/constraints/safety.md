# Safety Constraints - Pickleball Court Booking System

Version: 0.2.0
Status: DRAFT
Last Updated: 2026-06-23

Security and privacy rules override convenience or speed. These rules apply to
code, database seed data, documentation examples, tests, logs, and UI behavior.

## 1. Secrets And Credentials

| ID | Rule | Examples |
| --- | --- | --- |
| SAFE-001 | No secrets are committed. | DB passwords, SMTP passwords, token secrets, payment gateway keys, private keys |
| SAFE-002 | No hardcoded production credentials. | Admin passwords, staff default passwords, seeded payment credentials |
| SAFE-003 | Documentation must not include real credentials. | Use placeholder values such as `YOUR_SMTP_PASSWORD`. |
| SAFE-004 | Environment configuration must be read from env files or deployment secrets. | `.env` should stay uncommitted. |

## 2. Authentication And Tokens

| ID | Rule | Notes |
| --- | --- | --- |
| SAFE-005 | Protected APIs must validate authentication on the server. | Frontend checks are not security. |
| SAFE-006 | Auth responses must never include `password`, password hash, raw OTP, reset token hash, token secret, or private provider data. | Applies to all account endpoints. |
| SAFE-007 | Tokens must be signed and have server-enforced expiry. | Token expiry policy should be documented in FE01. |
| SAFE-008 | Invalid, expired, malformed, or tampered tokens must return `401` with safe error messages. | Do not reveal signature details. |
| SAFE-009 | Disabled/blocked/inactive accounts should not be allowed to use protected flows unless the feature spec explicitly allows it. | Prevents account abuse. |

## 3. Password And OTP Safety

| ID | Rule | Notes |
| --- | --- | --- |
| SAFE-010 | Password storage must be abstracted behind password utility functions. | Current implementation can be improved without changing controllers. |
| SAFE-011 | OTP values must be stored as hashes only. | Raw OTP appears only in outbound email body. |
| SAFE-012 | OTP attempts must be counted and capped. | Schema caps `attempt_count <= 10`. |
| SAFE-013 | OTP and reset tokens must expire and become unusable after use. | Use `expires_at`, `verified_at`, `used_at`. |
| SAFE-014 | Forgot-password request responses should avoid revealing whether an email exists. | Prevents user enumeration. |

## 4. Authorization

| ID | Rule | Notes |
| --- | --- | --- |
| SAFE-015 | Role-based access must be enforced on the backend for every protected staff/owner/admin action. | UI hiding is not enough. |
| SAFE-016 | Staff branch scope must be enforced when the feature depends on branch ownership/assignment. | Important for multi-branch operation. |
| SAFE-017 | Customers can only access their own bookings, profile, payment status, cancellation requests, and feedback unless another spec says otherwise. | Prevents data leakage. |
| SAFE-018 | Internal account management must prevent lower roles from escalating themselves or managing higher roles. | FE12. |

## 5. Input Validation And Injection Safety

| ID | Rule | Notes |
| --- | --- | --- |
| SAFE-019 | All user input must be validated on the server. | Email, phone, IDs, dates, times, amounts, role names. |
| SAFE-020 | Database access must use parameterized queries. | Prevent SQL injection. |
| SAFE-021 | Date/time values must be validated before use in SQL or business calculations. | Avoid invalid availability states. |
| SAFE-022 | Amounts and IDs must be parsed as numbers and validated for expected ranges. | Prevent manipulation. |
| SAFE-023 | JSON fields such as facilities/raw responses must not be trusted without validation before display/use. | Avoid unsafe assumptions. |

## 6. Payment And Financial Safety

| ID | Rule | Notes |
| --- | --- | --- |
| SAFE-024 | Client-submitted totals are untrusted. | Backend recalculates or validates against database. |
| SAFE-025 | Payment webhooks must be idempotent. | Duplicate provider calls must not double-confirm or double-charge. |
| SAFE-026 | Payment and booking state updates must be transactional when they must succeed together. | Prevents paid-but-unconfirmed or confirmed-without-payment defects. |
| SAFE-027 | Raw provider responses may be stored only if they do not contain secrets or sensitive payment data. | Redact if needed. |
| SAFE-028 | Refund operations must record processor/reason/status and avoid silent edits. | Auditability. |

## 7. Logging And Error Handling

| ID | Rule | Notes |
| --- | --- | --- |
| SAFE-029 | Internal stack traces, SQL errors, and framework details must not be returned to users. | Use safe errors. |
| SAFE-030 | Logs must not include passwords, OTP values, token secrets, reset tokens, payment secrets, or private gateway credentials. | Applies to console, DB logs, email logs. |
| SAFE-031 | Audit logs should capture who did what and when, but must avoid sensitive payloads. | Useful for staff/owner/admin operations. |
| SAFE-032 | Email failure should be logged safely and should not roll back unrelated successful booking/payment state unless the spec requires it. | Notification is a side effect. |

## 8. UI Safety

| ID | Rule | Notes |
| --- | --- | --- |
| SAFE-033 | UI must not expose admin/staff actions to users who are not allowed to use them, even though backend remains authoritative. | Defense in depth. |
| SAFE-034 | UI must not display secret/debug values. | No tokens or raw errors. |
| SAFE-035 | Destructive actions such as cancel, delete, block, refund, and status changes should have clear user intent. | Prevent accidental operations. |
