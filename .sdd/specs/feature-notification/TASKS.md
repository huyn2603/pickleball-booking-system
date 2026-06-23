# TASKS.md - FE10 Email Notification

Status: READY FOR REVIEW
Date: 2026-06-23
Owner: Dat

## Task Rules

- Implement only FE10 behavior from `SPEC.md` and `PLAN.md`.
- Never log or persist raw OTP/token values in email logs.
- Notification failures must not break core flows (auth/booking).
- Tests must cover safe behavior with missing SMTP config.

## Tasks

| ID | Task | Spec Mapping | Dependencies | DoD |
| --- | --- | --- | --- | --- |
| FE10-T001 | Define email events and payloads (OTP, booking confirm, cancel/refund). | US-PB-12 | None | Event list and templates documented. |
| FE10-T002 | Implement/verify mailer adapter and safe stub behavior. | US-PB-12 | FE10-T001 | Missing SMTP fails safely; no crashes. |
| FE10-T003 | Persist email delivery metadata in `email_logs` without secrets. | US-PB-12 | FE10-T002 | Logs contain metadata only; no OTP/token leak. |
| FE10-T004 | Integrate triggers from FE01/FE02/FE03 flows where appropriate. | US-PB-12 | FE10-T002 | Emails (or logs) are created on key events. |
| FE10-T005 | Add admin/staff visibility for delivery logs if needed. | US-PB-12 | FE10-T003 | Logs view is role-protected. |
| FE10-T006 | Add tests for OTP email flow and safe stub behavior. | US-PB-12 | FE10-T002..T004 | Tests pass; no sensitive values asserted/logged. |
| FE10-T007 | Frontend integration (optional) for email logs view. | US-PB-12 | FE10-T005 | UI can render logs with filters. |
| FE10-T008 | Update FE10 CHANGELOG with implemented scope and limitations. | DoD | FE10-T006 | CHANGELOG updated. |

## Suggested Implementation Order

1. FE10-T001 to FE10-T004
2. FE10-T006
3. FE10-T005 and FE10-T007 (optional)
4. FE10-T008

## Minimum Sprint 1 Completion Slice

- FE10-T001 to FE10-T004
- FE10-T006 (OTP email log smoke test)
