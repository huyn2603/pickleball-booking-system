# PLAN.md - FE15 Quick Rebook

Status: READY FOR REVIEW
Date: 2026-06-23
Owner: Dat

## 1. Purpose

Implement FE15 Quick Rebook according to the approved `SPEC.md`, enabling customers to rebook from history with fewer steps while re-validating availability and pricing.

## 2. Source Documents

- `.sdd/specs/feature-quick-rebook/SPEC.md`
- `README.md` (US-PB-17 scope)
- `mysql-workbench-schema.sql` (tables: `bookings`, `slot_holds`, `booking_slots`)
- `backend/src/routes/bookingRoutes.js`
- `backend/src/controllers/bookingController.js`
- `backend/src/models/Booking.js`

## 3. Scope

### In Scope

- User selects a previous booking and starts a new booking flow with prefilled values.
- Backend re-checks availability and creates a new hold (same as FE02 rules).
- Backend recalculates totals (same as FE08/FE13 rules if applicable).

### Out Of Scope

- Auto-book without hold/payment confirmation.
- Preference learning/recommendations (owned by FE17).

## 4. Approved Technical Decisions

| Area | Decision |
| --- | --- |
| Revalidation | Quick rebook never bypasses availability/hold rules. |
| Pricing | Totals are recalculated server-side at time of rebook. |
| Authorization | History access is scoped to current user. |

## 5. Database Dependencies

- `bookings`, `booking_slots`: source booking to prefill from.
- `slot_holds`: new hold created for rebook.

## 6. API Endpoints

Quick rebook can be built on existing endpoints:

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/api/bookings/my` | Pick a booking to rebook. |
| POST | `/api/bookings/hold` | Create new hold for the desired slot. |

Dedicated quick rebook endpoint: TBD (e.g., `/api/bookings/:id/rebook`).

## 7. Backend File Plan

```text
backend/src/routes/bookingRoutes.js
backend/src/controllers/bookingController.js
backend/src/models/Booking.js
```

## 8. Frontend File Plan

```text
frontend/src/pages/* (history -> rebook flow)
frontend/src/services/* (booking client)
```

## 9. Test Strategy

### Unit Tests

- Prefill mapping and validation rules.

### Integration Tests

- User selects old booking -> new hold created -> booking draft created.
- Rebook is blocked if the new slot is already booked/held.

## 10. Risks And Mitigations

| Risk | Mitigation |
| --- | --- |
| Bypassing availability checks | Always reuse hold/availability logic. |
| Confusing UX when slot not available | Return clear rejection reason and suggest alternatives (FE17). |

## 11. Validation Gate

- All TASKS.md items are complete.
- Quick rebook never creates a booking without hold validation.
