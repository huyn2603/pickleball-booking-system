# PLAN.md - FE13 Voucher

Status: READY FOR REVIEW
Date: 2026-06-23
Owner: Dat

## 1. Purpose

Implement FE13 Voucher according to the approved `SPEC.md`, enabling discounts during booking/payment with proper validation and auditability.

## 2. Source Documents

- `.sdd/specs/feature-voucher/SPEC.md`
- `README.md` (US-PB-15 scope)
- `mysql-workbench-schema.sql` (tables: `vouchers`, `promotions`, `bookings`, `audit_logs`)
- `backend/src/models/Booking.js` (total calculation integration point)

## 3. Scope

### In Scope

- Validate voucher code (active, expiry, usage limits, scope if supported).
- Apply discount to booking totals server-side.
- Persist voucher usage with booking for later reconciliation/reporting.

### Out Of Scope

- Advanced campaign management UI (phase 2+).
- Stacking multiple promotions unless explicitly required.

## 4. Approved Technical Decisions

| Area | Decision |
| --- | --- |
| Validation | Backend is source of truth; reject invalid/expired vouchers safely. |
| Totals | Apply discount before payment confirmation; totals are server-calculated. |
| Auditability | Record voucher usage for reconciliation (planned/partial). |

## 5. Database Dependencies

- `vouchers`, `promotions`: voucher definitions and rules.
- `bookings`: store discount amount and total.
- `audit_logs`: record voucher-related operations (planned/partial).

## 6. API Endpoints

Voucher endpoints are planned if not yet implemented:

| Method | Endpoint | Purpose |
| --- | --- | --- |
| POST | `/api/vouchers/validate` | Validate voucher code for current cart/booking draft. |
| POST | `/api/admin/vouchers` | Admin manages vouchers (TBD). |

## 7. Backend File Plan

```text
backend/src/models/Booking.js
backend/src/controllers/bookingController.js
backend/src/routes/bookingRoutes.js
```

## 8. Frontend File Plan

```text
frontend/src/pages/* (checkout with voucher input)
frontend/src/services/* (voucher client)
```

## 9. Test Strategy

### Unit Tests

- Voucher validation rules (expiry, usage, minimum amount).
- Discount calculation and rounding.

### Integration Tests

- Valid voucher reduces total; invalid voucher rejected with safe error.

## 10. Risks And Mitigations

| Risk | Mitigation |
| --- | --- |
| Discount abuse | Enforce usage limits and eligibility server-side. |
| Incorrect totals | Centralize calculation and add tests for edge cases. |

## 11. Validation Gate

- All TASKS.md items are complete.
- Voucher application is server-side and auditable.
