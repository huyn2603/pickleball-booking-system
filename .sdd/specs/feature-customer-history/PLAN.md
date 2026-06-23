# PLAN.md - FE09 Customer History

Status: READY FOR REVIEW
Date: 2026-06-23
Owner: Dat

## 1. Purpose

Implement FE09 Customer History according to the approved `SPEC.md`, allowing customers to view booking/payment/refund/add-on history safely and accurately.

## 2. Source Documents

- `.sdd/specs/feature-customer-history/SPEC.md`
- `README.md` (US-PB-11 scope)
- `mysql-workbench-schema.sql` (tables: `bookings`, `payment_transactions`, `refunds`, `booking_addons`, `addon_services`)
- `backend/src/routes/bookingRoutes.js`
- `backend/src/controllers/bookingController.js`

## 3. Scope

### In Scope

- Customer lists own bookings and sees key status fields.
- Customer views payment/refund summary for each booking (as available).
- Authorization: customer can only access own history.

### Out Of Scope

- Internal admin audit views (owned by staff/reporting features).
- Export history (CSV/PDF) unless requested later.

## 4. Approved Technical Decisions

| Area | Decision |
| --- | --- |
| Authorization | Always scope history to authenticated user id. |
| Data consistency | Read from authoritative booking/payment/refund tables. |
| Privacy | Do not expose internal notes or staff-only fields. |

## 5. Database Dependencies

- `bookings`, `payment_transactions`, `refunds`: financial and status history.
- `booking_addons`, `addon_services`: add-on items included in booking history.

## 6. API Endpoints

Implement/verify FE09 endpoints:

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/api/bookings/my` | List current user bookings/history. |

Booking detail endpoint: TBD if required by `SPEC.md` (e.g., `/api/bookings/:id`).

## 7. Backend File Plan

```text
backend/src/routes/bookingRoutes.js
backend/src/controllers/bookingController.js
backend/src/models/Booking.js
backend/src/middleware/auth.js
```

## 8. Frontend File Plan

```text
frontend/src/pages/* (history)
frontend/src/services/* (booking/history client)
```

## 9. Test Strategy

### Unit Tests

- Response shaping excludes sensitive/internal fields.

### Integration Tests

- Customer can list own bookings; cannot read another user's bookings.

## 10. Risks And Mitigations

| Risk | Mitigation |
| --- | --- |
| Data leakage across users | Enforce user id scoping in queries and controllers. |
| Incorrect totals | Use persisted totals and reconcile with payment/refund records. |

## 11. Validation Gate

- All TASKS.md items are complete.
- History endpoints enforce auth and privacy constraints.
