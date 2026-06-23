﻿# PLAN.md - FE04 Staff Daily Operation

Status: READY FOR REVIEW
Date: 2026-06-23
Owner: Dat

## 1. Purpose

Implement FE04 Staff Daily Operation according to the approved `SPEC.md`, the workflow in `README.md`, and the current staff API implementation.

FE04 is a Core feature. Implementation must be small, testable, and reviewed before merge.

## 2. Source Documents

- `.sdd/specs/feature-staff-daily-operation/SPEC.md`
- `README.md` (US-PB-06 acceptance scenarios)
- `mysql-workbench-schema.sql` (tables: `bookings`, `payment_transactions`, `refunds`, `addon_services`, `audit_logs`)
- `backend/src/routes/staffRoutes.js`
- `backend/src/controllers/staffController.js`
- `backend/src/models/Staff.js`
- `backend/src/models/Booking.js`

## 3. Scope

### In Scope

- Staff dashboard: list bookings by date and within staff permission scope.
- Confirm/cancel booking (staff actions).
- Check-in and check-out booking.
- Record counter payment (cash/bank transfer).
- Update add-on stock (operational update).
- Server-side authorization: only `Admin`/`Owner`/`Staff` can access staff endpoints.

### Out Of Scope

- HR scheduling, timesheets, or payroll.
- Advanced multi-branch staff assignment workflows (beyond current role checks).
- Customer-facing booking flow (owned by FE02).

## 4. Approved Technical Decisions

| Area | Decision |
| --- | --- |
| Authorization | Staff endpoints require auth and staff role check (`Admin`/`Owner`/`Staff`). |
| Data integrity | State transitions (confirm/cancel/check-in/check-out) must be validated server-side. |
| Auditability | Log staff actions with actor id where applicable (planned/partial). |

## 5. Database Dependencies

Required tables/fields exist in `mysql-workbench-schema.sql`:

- `bookings`: booking/payment status fields; check-in/out fields if modeled.
- `payment_transactions`, `refunds`: staff payment/refund actions.
- `addon_services`: stock and pricing data.
- `audit_logs`: staff action logging (planned/partial).

## 6. API Endpoints

Implement/verify FE04 endpoints from `backend/src/routes/staffRoutes.js`:

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/api/staff/dashboard` | Staff dashboard by date. |
| POST | `/api/staff/bookings/:id/confirm` | Confirm booking. |
| POST | `/api/staff/bookings/:id/cancel` | Cancel booking. |
| POST | `/api/staff/bookings/:id/check-in` | Check-in. |
| POST | `/api/staff/bookings/:id/check-out` | Check-out. |
| POST | `/api/staff/bookings/:id/payment` | Record counter payment. |
| PATCH | `/api/staff/addons/:id/stock` | Update addon stock. |

## 7. Backend File Plan

Expected backend files:

```text
backend/src/routes/staffRoutes.js
backend/src/controllers/staffController.js
backend/src/models/Staff.js
backend/src/models/Booking.js
backend/src/middleware/auth.js
```

## 8. Frontend File Plan

Expected frontend integration files:

```text
frontend/src/pages/* (staff dashboard)
frontend/src/services/* (staff client)
```

## 9. Test Strategy

### Unit Tests

- Authorization rules for staff endpoints.
- Booking status transition rules for staff actions.

### Integration Tests

- Staff dashboard returns only allowed scope.
- Confirm -> check-in -> check-out happy path.
- Cancel booking applies refund policy flow (where applicable).

## 10. Risks And Mitigations

| Risk | Mitigation |
| --- | --- |
| Unauthorized access to staff actions | Enforce auth middleware + role checks on every endpoint. |
| Invalid state transitions | Centralize status validation and test transitions. |
| Operational mistakes | Provide clear errors and require explicit action endpoints. |

## 11. Validation Gate

Before FE04 is considered complete:

- All TASKS.md items are complete.
- Staff endpoints are protected and return consistent errors.
- Critical actions are auditable (at least via server logs and/or audit table). 
