# PLAN.md - FE03 Payment & Refund

Status: READY FOR REVIEW
Date: 2026-06-23
Owner: Dat

## 1. Purpose

Implement FE03 Payment & Refund according to the approved `SPEC.md`, the booking workflow in `README.md`, and the MySQL schema for transactions/refunds.

FE03 is a Core feature. Implementation must be small, testable, and reviewed before merge.

## 2. Source Documents

- `.sdd/specs/feature-payment-refund/SPEC.md`
- `README.md` (US-PB-04, US-PB-05 acceptance scenarios + refund windows)
- `mysql-workbench-schema.sql` (tables: `bookings`, `payment_transactions`, `refunds`, `audit_logs`)
- `backend/src/routes/bookingRoutes.js`
- `backend/src/routes/staffRoutes.js`
- `backend/src/controllers/bookingController.js`
- `backend/src/controllers/staffController.js`
- `backend/src/models/Booking.js`

## 3. Scope

### In Scope

- Record payment transactions for a booking (including staff counter payments).
- Confirm booking after successful payment.
- Cancel booking and apply refund policy windows.
- Persist payment/refund history for later reporting and customer history.
- Server-side recalculation for totals; do not trust client totals.

### Out Of Scope

- Production payment gateway integrations beyond current MVP flows.
- Chargeback workflows and complex dispute handling.
- Automated email notifications (owned by FE10).

## 4. Approved Technical Decisions

| Area | Decision |
| --- | --- |
| Payment state | Booking state changes must be consistent with payment records. |
| Refund policy | Time-window policy from `README.md` (>=24h 100%, 2-24h 50%, <2h manual/no auto). |
| Data integrity | Use transactions for multi-step operations (booking + payment + refund). |

## 5. Database Dependencies

Required tables/fields exist in `mysql-workbench-schema.sql`:

- `payment_transactions`: method, amount, status, created_at.
- `refunds`: amount, status, reason, created_at.
- `bookings`: booking/payment status fields.
- `audit_logs`: record who performed staff actions (planned/partial).

## 6. API Endpoints

Implement/verify FE03 endpoints:

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/api/bookings/payment-status/:holdCode` | Check payment/booking status for a hold. |
| POST | `/api/bookings/vietqr/webhook` | Receive payment confirmation signal (if used). |
| POST | `/api/staff/bookings/:id/payment` | Staff records counter payment (cash/bank transfer). |
| POST | `/api/staff/bookings/:id/confirm` | Staff confirms booking. |
| POST | `/api/staff/bookings/:id/cancel` | Staff cancels booking and triggers refund policy flow. |

## 7. Backend File Plan

Expected backend files:

```text
backend/src/routes/bookingRoutes.js
backend/src/routes/staffRoutes.js
backend/src/controllers/bookingController.js
backend/src/controllers/staffController.js
backend/src/models/Booking.js
```

## 8. Frontend File Plan

Expected frontend integration files:

```text
frontend/src/pages/* (payment/checkout/cancel)
frontend/src/services/* (payment + booking client)
```

Frontend must not be trusted for totals; backend recalculates and persists authoritative totals.

## 9. Test Strategy

### Unit Tests

- Refund policy calculation for different time windows.
- Payment state transitions: pending -> paid -> confirmed.

### Integration Tests

- Hold -> booking -> staff payment -> confirm booking.
- Cancel booking triggers correct refund record and booking status.
- Invalid state transitions are rejected (e.g., refund twice).

## 10. Risks And Mitigations

| Risk | Mitigation |
| --- | --- |
| Inconsistent payment/booking state | Use database transactions and strict state machine rules. |
| Incorrect refund calculation | Centralize refund policy logic and test edge cases. |
| Duplicate webhook events | Make webhook handling idempotent by transaction code. |

## 11. Validation Gate

Before FE03 is considered complete:

- All TASKS.md items are complete.
- Payment and refund states reconcile with bookings.
- Refund policy matches `README.md` scenarios.
- No sensitive data is logged or returned.
