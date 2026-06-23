# PLAN.md - FE14 Court Maintenance

Status: READY FOR REVIEW
Date: 2026-06-23
Owner: Dat

## 1. Purpose

Implement FE14 Court Maintenance according to the approved `SPEC.md`, allowing Staff/Admin to take courts offline (maintenance) and prevent new bookings for impacted time windows.

## 2. Source Documents

- `.sdd/specs/feature-maintenance/SPEC.md`
- `README.md` (US-PB-16 scope)
- `mysql-workbench-schema.sql` (tables: `courts`, `bookings`, `refunds`, `audit_logs`)
- `backend/src/controllers/courtController.js` (court status updates)
- `backend/src/models/Court.js`

## 3. Scope

### In Scope

- Mark a court as `maintenance` or `inactive`.
- Prevent holds/bookings on courts with unavailable status.
- Identify impacted future bookings (planned/phase 2 if not implemented).
- Authorization: Staff/Admin/Owner depending on policy (at minimum Admin/Owner for court status updates).

### Out Of Scope

- Automatic rescheduling for affected customers (phase 2+).
- Automated mass refunds without staff confirmation (phase 2+).

## 4. Approved Technical Decisions

| Area | Decision |
| --- | --- |
| Status | Use court status (`maintenance`/`inactive`) as primary gate for booking. |
| Safety | Prefer status changes over deleting courts. |
| Auditability | Record maintenance actions with actor and reason (planned/partial). |

## 5. Database Dependencies

- `courts`: status field.
- `bookings`: used to find impacted bookings.
- `refunds`: used when maintenance triggers refund policy.
- `audit_logs`: maintenance audit trail (planned/partial).

## 6. API Endpoints

Implement/verify FE14 endpoints (current status updates via court update):

| Method | Endpoint | Purpose |
| --- | --- | --- |
| PATCH | `/api/courts/:id` | Update court status (Admin/Owner). |
| GET | `/api/courts/:id/availability` | Availability respects maintenance/inactive status. |

Impacted bookings endpoint: TBD (e.g., `/api/courts/:id/impacted-bookings`).

## 7. Backend File Plan

```text
backend/src/routes/courtRoutes.js
backend/src/controllers/courtController.js
backend/src/models/Court.js
backend/src/models/Booking.js
```

## 8. Frontend File Plan

```text
frontend/src/pages/* (maintenance management)
frontend/src/services/* (court client)
```

## 9. Test Strategy

### Unit Tests

- Status validation and permission checks.

### Integration Tests

- Court in maintenance is not holdable/bookable.
- Availability endpoint returns blocked state for maintenance court.

## 10. Risks And Mitigations

| Risk | Mitigation |
| --- | --- |
| Bookings created during maintenance | Enforce status checks inside hold/booking creation. |
| Operational mistakes | Require explicit action and return clear confirmation data. |

## 11. Validation Gate

- All TASKS.md items are complete.
- Maintenance status blocks holds/bookings consistently.
