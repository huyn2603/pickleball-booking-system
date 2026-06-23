# TASKS.md - FE01 Authentication

Status: READY FOR REVIEW
Date: 2026-06-23
Owner: Dat

## Task Rules

- Implement only FE01 Authentication behavior from `SPEC.md` and `PLAN.md`.
- Keep raw passwords/tokens out of logs and source control.
- Backend validation and authorization are mandatory.
- Tests are required for core auth behavior.

## Tasks

| ID | Task | Spec Mapping | Dependencies | DoD |
| --- | --- | --- | --- | --- |
| FE01-T001 | Verify existing auth routes/controllers match the scope (register/login/me + OTP reset). | US-PB-01 | None | Endpoints are identified; gaps to SPEC are listed. |
| FE01-T002 | Enforce Gmail-only registration on backend and consistent validation errors. | US-PB-01 (AC 1-3) | FE01-T001 | Non-`@gmail.com` is rejected server-side with safe error. |
| FE01-T003 | Ensure password hashing policy is enforced and password/hash is never returned. | US-PB-01 (AC 1,4-6) | FE01-T001 | Responses contain no password/hash; hashes stored in DB only. |
| FE01-T004 | Ensure access token uses strong secret (`AUTH_TOKEN_SECRET`) and expiry is enforced. | US-PB-01 | FE01-T001 | Missing secret fails safely outside dev; expiry validated. |
| FE01-T005 | Implement/verify forgot-password OTP flow: request, verify, reset; OTP stored hashed and expires. | US-PB-01 (AC 6) | FE01-T003 | OTP cannot be reused; expired OTP fails. |
| FE01-T006 | Add basic rate limiting or failed-login safeguards (avoid brute force). | US-PB-01 | FE01-T001 | Repeated failures are slowed/blocked; response remains generic. |
| FE01-T007 | Add audit/email log hooks where applicable without leaking secrets. | US-PB-01 | FE01-T001 | Logs store metadata only; no raw tokens/OTPs. |
| FE01-T008 | Add backend tests for register/login/me and OTP reset happy/edge paths. | US-PB-01 | FE01-T002..T005 | Tests pass locally; failures block merge. |
| FE01-T009 | Add frontend API client stubs and connect existing auth pages. | US-PB-01 | FE01-T008 | Forms call API; UI handles error states; no sensitive logs. |
| FE01-T010 | Update FE01 CHANGELOG with implemented scope and remaining risks. | DoD | FE01-T008..T009 | CHANGELOG reflects current behavior and gaps. |

## Suggested Implementation Order

1. FE01-T001 to FE01-T005: core correctness and security.
2. FE01-T006 to FE01-T007: hardening and auditability.
3. FE01-T008: tests.
4. FE01-T009 to FE01-T010: frontend wiring + documentation.

## Minimum Sprint 1 Completion Slice

- FE01-T001 to FE01-T005
- FE01-T008 (register -> login -> `/api/auth/me` + OTP reset smoke test)
