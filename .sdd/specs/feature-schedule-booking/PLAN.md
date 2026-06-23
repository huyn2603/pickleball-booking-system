# PLAN.md - FE02 Schedule & Booking

Status: READY FOR REVIEW
Date: 2026-06-23
Owner: Dat

## 1. Purpose

Implement FE02 Schedule & Booking according to the approved `SPEC.md`, the system workflow in `README.md`, and the MySQL schema for holds/bookings.

FE02 is a Core feature. Implementation must be small, testable, and reviewed before merge.

## 2. Source Documents

- `.sdd/specs/feature-schedule-booking/SPEC.md`
- `README.md` (US-PB-02, US-PB-03 acceptance scenarios)
- `mysql-workbench-schema.sql` (tables: `settings`, `branches`, `courts`, `slot_holds`, `bookings`, `booking_slots`)
- `backend/src/routes/bookingRoutes.js`
- `backend/src/routes/courtRoutes.js`
- `backend/src/controllers/bookingController.js`
- `backend/src/controllers/courtController.js`
- `backend/src/models/Booking.js`
- `backend/src/models/Court.js`

## 3. Scope

### In Scope

- View schedule/availability by branch/date/court.
- Create slot hold (default 10 minutes) to prevent double-booking.
- Create booking draft/from-hold after validation.
- Server-side validation: no past bookings, no booking when court is `maintenance`/`inactive`.
- Concurrency control to ensure only one hold/booking wins for a slot.

### Out Of Scope

- Payment capture and payment gateway integrations (owned by FE03/Payment).
- Advanced slot suggestions across branches (owned by FE17).
- Advanced reporting/analytics (FE16/FE18).

## 4. Approved Technical Decisions

| Area | Decision |
| --- | --- |
| Hold duration | 10 minutes (from system settings; described in `README.md`). |
| Pricing | Backend recalculates totals; do not trust client totals. |
| Availability | Availability reflects confirmed bookings and active holds, plus court status. |

## 5. Database Dependencies

Required tables/fields exist in `mysql-workbench-schema.sql`:

- `settings`: open/close time, slot minutes, hold minutes.
- `branches`, `courts`: operational data and status.
- `slot_holds`: hold code, expiry time, status.
- `bookings`, `booking_slots`: booking state and booked times.

## 6. API Endpoints

Implement/verify FE02 endpoints:

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/api/courts` | List courts (supports branch/type filtering). |
| GET | `/api/courts/:id/availability?date=YYYY-MM-DD` | Get availability for a court on a date. |
| POST | `/api/bookings/hold` | Create a hold for a slot/time range. |
| POST | `/api/bookings/from-hold` | Create a booking draft from a valid hold. |

## 7. Backend File Plan

Expected backend files:

```text
backend/src/routes/bookingRoutes.js
backend/src/routes/courtRoutes.js
backend/src/controllers/bookingController.js
backend/src/controllers/courtController.js
backend/src/models/Booking.js
backend/src/models/Court.js
```

## 8. Frontend File Plan

Expected frontend integration files:

```text
frontend/src/pages/* (schedule/booking)
frontend/src/services/* (booking + court client)
```

Frontend must not enforce availability rules as security; backend is the source of truth.

## 9. Test Strategy

### Unit Tests

- Time normalization and slot building helpers (if extracted).
- Hold creation validation (date/time/status checks).

### Integration Tests

- View availability -> create hold -> create booking from hold.
- Two simultaneous holds for the same slot: only one succeeds.
- Hold expiry releases slot for new holds.

## 10. Risks And Mitigations

| Risk | Mitigation |
| --- | --- |
| Double-booking due to race conditions | Enforce uniqueness/locking rules in backend and/or transactional checks. |
| Hold not expiring properly | Persist expiry time and run expiry logic on reads/writes. |
| Cross-branch access leakage | Enforce branch scope where applicable and validate inputs. |

## 11. Validation Gate

Before FE02 is considered complete:

- All TASKS.md items are complete.
- Holds and bookings behave correctly under concurrency.
- Past-date booking attempts are blocked server-side.
- API responses match the data needed by the UI.
