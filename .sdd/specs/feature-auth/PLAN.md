﻿# PLAN.md - FE01 Authentication

Status: READY FOR REVIEW
Date: 2026-06-23
Owner: Dat

## 1. Purpose

Implement FE01 Authentication according to the approved `SPEC.md`, the current backend auth implementation, and the MySQL schema.

FE01 is a Core feature. Implementation must be small, testable, and reviewed before merge.

## 2. Source Documents

- `.sdd/specs/feature-auth/SPEC.md`
- `README.md` (US-PB-01 acceptance scenarios)
- `mysql-workbench-schema.sql` (tables: `users`, `password_reset_otps`, `roles`, `audit_logs`, `email_logs`)
- `backend/src/routes/authRoutes.js`
- `backend/src/controllers/authController.js`
- `backend/src/utils/token.js`
- `backend/src/utils/mailer.js`

## 3. Scope

### In Scope

- Register account (Gmail-only for v1 as per `SPEC.md` / `README.md`).
- Login with email/password and return access token.
- Current user endpoint (`/api/auth/me`).
- Forgot password via OTP email: request OTP, verify OTP, reset password.
- Server-side validation and safe generic error handling (no user enumeration).
- Password hashing and never returning password/password hash in responses.
- Audit logging for auth-related events where applicable.

### Out Of Scope

- OAuth/OpenID Connect / SSO (including production-grade Google OAuth).
- MFA/2FA.
- Real production email provider setup (beyond SMTP config).
- Full admin user management workflows beyond current API behavior.

## 4. Approved Technical Decisions

| Area | Decision |
| --- | --- |
| Access token | HMAC-signed token with `exp`; default expiry 24 hours (`backend/src/utils/token.js`). |
| Password reset | OTP flow backed by `password_reset_otps`; OTP must expire and must be stored hashed. |
| Gmail constraint | Backend and frontend reject non-`@gmail.com` registration for v1. |
| Error handling | Login/forgot-password errors must be generic (avoid user enumeration). |

## 5. Database Dependencies

Required tables/fields exist in `mysql-workbench-schema.sql`:

- `users`: email, password hash, role, status.
- `password_reset_otps`: otp hash, expires, used state.
- `roles`: seed roles (Admin/Owner/Staff/Customer).
- `audit_logs`: audit auth events (planned/partial).
- `email_logs`: OTP delivery tracking (planned/partial).

## 6. API Endpoints

Implement/verify FE01 endpoints from `backend/src/routes/authRoutes.js`:

| Method | Endpoint | Purpose |
| --- | --- | --- |
| POST | `/api/auth/register` | Register account (Gmail-only). |
| POST | `/api/auth/login` | Login and return access token. |
| POST | `/api/auth/forgot-password/request-otp` | Request OTP without email enumeration. |
| POST | `/api/auth/forgot-password/verify-otp` | Verify OTP (no password reset yet). |
| POST | `/api/auth/forgot-password/reset` | Reset password with valid OTP. |
| GET | `/api/auth/me` | Return current user context. |

## 7. Backend File Plan

Expected backend files:

```text
backend/src/routes/authRoutes.js
backend/src/controllers/authController.js
backend/src/middleware/auth.js
backend/src/models/User.js
backend/src/models/PasswordResetOtp.js
backend/src/utils/password.js
backend/src/utils/token.js
backend/src/utils/mailer.js
```

## 8. Frontend File Plan

Expected frontend integration files (connect existing pages to backend endpoints):

```text
frontend/src/pages/* (login/register/forgot-password)
frontend/src/services/* (auth client)
frontend/src/hooks/* (auth state)
```

UI behavior must not be trusted as security enforcement; backend is the source of truth.

## 9. Test Strategy

### Unit Tests

- Gmail validation and password policy validation.
- Token generation/verification and expiry behavior.
- OTP generation/hash/expiry behavior.

### Integration Tests

- Register -> login -> `/api/auth/me`.
- Wrong password returns generic error.
- Forgot password request does not reveal email existence.
- OTP verify -> reset password success; expired OTP fails.

## 10. Risks And Mitigations

| Risk | Mitigation |
| --- | --- |
| Token leakage in logs | Never log raw token values; avoid logging headers. |
| User enumeration | Use generic responses for login and forgot-password. |
| Weak password handling | Hash passwords; enforce minimum policy server-side. |
| Misconfigured secret | Require `AUTH_TOKEN_SECRET` in non-dev; avoid shipping dev secret. |

## 11. Validation Gate

Before FE01 is considered complete:

- All TASKS.md items are complete.
- No raw passwords/tokens/secrets are committed.
- API responses do not include sensitive fields.
- Auth flows pass smoke tests end-to-end (register/login/me/forgot-reset).
