# PLAN.md - FE10 Email Notification

Status: READY FOR REVIEW
Date: 2026-06-23
Owner: Dat

## 1. Purpose

Implement FE10 Email Notification according to the approved `SPEC.md`, enabling the system to send operational emails (OTP, booking confirmation, cancellation/refund) and keep delivery logs.

## 2. Source Documents

- `.sdd/specs/feature-notification/SPEC.md`
- `README.md` (US-PB-12 scope)
- `mysql-workbench-schema.sql` (tables: `email_logs`, `audit_logs`)
- `backend/src/utils/mailer.js`
- `backend/src/controllers/authController.js` (OTP flows)

## 3. Scope

### In Scope

- Send OTP email for password reset (FE01 dependency).
- Send booking confirmation/cancellation notifications when available (FE02/FE03 dependency).
- Persist email delivery logs (`email_logs`) without storing secrets.
- Provide safe failure behavior when SMTP is not configured (no crash; predictable error handling).

### Out Of Scope

- Production-grade email provider integration and deliverability tuning.
- SMS/push notifications.
- Template management UI.

## 4. Approved Technical Decisions

| Area | Decision |
| --- | --- |
| Delivery | SMTP-based sending via backend mailer utility (environment-configured). |
| Logging | Log metadata only; never store raw OTP/token values in logs. |
| Failure mode | If SMTP unavailable, mark as planned/mock and keep auth flows safe. |

## 5. Database Dependencies

- `email_logs`: store send attempts and status.
- `audit_logs`: optional auditing of notification triggers (planned/partial).

## 6. API Endpoints

Notification is primarily internal (triggered by other features). If external endpoints are required later:

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/api/admin/email-logs` | View email delivery logs (TBD). |

## 7. Backend File Plan

```text
backend/src/utils/mailer.js
backend/src/models/* (email log model if added)
backend/src/controllers/* (trigger points)
```

## 8. Frontend File Plan

```text
frontend/src/pages/* (admin email logs, optional)
frontend/src/services/* (notification/logs client)
```

## 9. Test Strategy

### Unit Tests

- Mailer adapter behavior with missing SMTP config.

### Integration Tests

- OTP request triggers an email log entry (or safe stub) without leaking OTP.

## 10. Risks And Mitigations

| Risk | Mitigation |
| --- | --- |
| Leaking OTP/token in logs | Log metadata only; store OTP hashed in DB only. |
| SMTP misconfig breaks auth | Fail safely and return generic messages; avoid 500 for expected cases. |

## 11. Validation Gate

- All TASKS.md items are complete.
- No secrets/OTP tokens appear in logs or source control.
