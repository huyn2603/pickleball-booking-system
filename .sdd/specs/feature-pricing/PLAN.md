# PLAN.md - FE08 Pricing Rules

Status: READY FOR REVIEW
Date: 2026-06-23
Owner: Dat

## 1. Purpose

Implement FE08 Pricing Rules according to the approved `SPEC.md` and MySQL schema so the backend can calculate booking totals based on time/branch/court rules.

## 2. Source Documents

- `.sdd/specs/feature-pricing/SPEC.md`
- `README.md` (US-PB-10 scope)
- `mysql-workbench-schema.sql` (tables: `price_rules`, `settings`, `branches`, `courts`)
- `backend/src/models/Booking.js` (pricing calculation via `price_rules`)
- `backend/src/models/Court.js` (price rules shown in court detail)

## 3. Scope

### In Scope

- Define pricing rules that can vary by day-of-week and time range.
- Apply priority rules for branch-level vs court-level overrides.
- Ensure booking totals are calculated server-side using authoritative rules.

### Out Of Scope

- Complex promotional stacking logic beyond vouchers (owned by FE13).
- UI-heavy pricing admin if not required for MVP (planned).

## 4. Approved Technical Decisions

| Area | Decision |
| --- | --- |
| Source of truth | Backend calculates totals; never trust client totals. |
| Rule matching | Match by date/day-of-week and time window; choose by priority. |
| Defaults | Fall back to base pricing when no rule matches. |

## 5. Database Dependencies

Required tables/fields exist in `mysql-workbench-schema.sql`:

- `price_rules`: branch_id/court_id scope, day_of_week, start/end time, price_per_slot, priority, active window.
- `settings`: slot minutes for correct per-slot calculation.
- `branches`, `courts`: dimensions for rules.

## 6. API Endpoints

Pricing is currently consumed internally by booking/court endpoints. Pricing admin endpoints are planned:

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/api/courts/:id` | Includes pricing rules for display (if enabled). |
| POST | `/api/admin/price-rules` | Create/update price rules (TBD). |

## 7. Backend File Plan

Expected backend files:

```text
backend/src/models/Booking.js
backend/src/models/Court.js
backend/src/controllers/bookingController.js
```

## 8. Frontend File Plan

Expected frontend integration files:

```text
frontend/src/pages/* (pricing admin)
frontend/src/services/* (pricing client)
```

## 9. Test Strategy

### Unit Tests

- Rule selection by priority and time window.
- Total calculation for a multi-slot booking.

### Integration Tests

- Booking totals change when price rules are updated.
- Court detail returns rule list consistently (if exposed).

## 10. Risks And Mitigations

| Risk | Mitigation |
| --- | --- |
| Wrong pricing due to rule conflicts | Define deterministic sorting and test conflict cases. |
| Time zone/time parsing bugs | Normalize times and use consistent time zone from settings. |
| Client tampering with totals | Ignore client totals and recalculate server-side. |

## 11. Validation Gate

- All TASKS.md items are complete.
- Pricing calculation matches `SPEC.md` scenarios.
- Booking totals are always computed server-side.
