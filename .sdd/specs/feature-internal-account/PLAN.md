# PLAN.md - FE12 Internal Account Management

Status: READY FOR REVIEW
Date: 2026-06-23
Owner: Dat

## 1. Purpose

Implement FE12 Internal Account Management according to the approved `SPEC.md`, enabling Admin/Owner to manage internal users (Staff/Customer) safely, with proper authorization and auditability.

## 2. Source Documents

- `.sdd/specs/feature-internal-account/SPEC.md`
- `README.md` (US-PB-14 scope)
- `mysql-workbench-schema.sql` (tables: `users`, `roles`, `audit_logs`)
- `backend/src/routes/authRoutes.js` (managed accounts endpoints)
- `backend/src/controllers/authController.js`
- `backend/src/models/User.js`
- `backend/src/models/Staff.js`

## 3. Scope

### In Scope

- Admin/Owner lists accounts under management.
- Admin/Owner creates a managed account and assigns role/scope where supported.
- Admin/Owner updates account info and status (enable/disable).
- Admin/Owner views managed account bookings if supported.

### Out Of Scope

- Full HR workflows (contracts, payroll, shifts).
- Complex approval workflows (phase 2+).

## 4. Approved Technical Decisions

| Area | Decision |
| --- | --- |
| Authorization | Management endpoints require auth and Admin/Owner role. |
| Safety | Never expose password or password hash in responses. |
| Auditability | Account create/update/status changes should be auditable (planned/partial). |

## 5. Database Dependencies

- `users`: account records and status.
- `roles`: role names and mapping.
- `audit_logs`: record management actions (planned/partial).

## 6. API Endpoints

Implement/verify FE12 endpoints (current implementation in auth routes):

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/api/auth/accounts` | List managed accounts. |
| POST | `/api/auth/accounts` | Create managed account. |
| GET | `/api/auth/accounts/:id/bookings` | View bookings for a managed account. |
| PUT | `/api/auth/accounts/:id` | Update managed account. |
| PATCH | `/api/auth/accounts/:id/status` | Update managed account status. |
| DELETE | `/api/auth/accounts/:id` | Delete managed account. |

## 7. Backend File Plan

```text
backend/src/routes/authRoutes.js
backend/src/controllers/authController.js
backend/src/models/User.js
backend/src/middleware/auth.js
```

## 8. Frontend File Plan

```text
frontend/src/pages/* (admin accounts)
frontend/src/services/* (accounts client)
```

## 9. Test Strategy

### Unit Tests

- Authorization rules for account management endpoints.
- Payload validation and safe responses.

### Integration Tests

- Admin can create/update/disable an account; non-admin is blocked.
- Managed account endpoints do not expose sensitive fields.

## 10. Risks And Mitigations

| Risk | Mitigation |
| --- | --- |
| Accidental privilege escalation | Restrict role assignments and validate role input server-side. |
| Data leaks | Exclude sensitive fields; apply consistent response shaping. |

## 11. Validation Gate

- All TASKS.md items are complete.
- Admin/Owner-only access enforced for management endpoints.
