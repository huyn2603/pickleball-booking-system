# PLAN.md - FE07 Basic Reporting

Status: READY FOR REVIEW
Date: 2026-06-23
Owner: Dat

## 1. Purpose

Implement FE07 Basic Reporting according to the approved `SPEC.md`, using booking/payment/refund data in MySQL to provide revenue and booking metrics for Owner/Admin.

## 2. Source Documents

- `.sdd/specs/feature-basic-reporting/SPEC.md`
- `README.md` (US-PB-09 scope)
- `mysql-workbench-schema.sql` (tables: `bookings`, `payment_transactions`, `refunds`, `branches`, `courts`)
- `backend/src/controllers/staffController.js` (dashboard is the nearest existing operational endpoint)

## 3. Scope

### In Scope

- Revenue summary by date range and branch.
- Booking counts by status (confirmed/cancelled/completed).
- Utilization proxy metrics (slots booked / available) if derivable from settings.
- Permission scope: Owner/Admin only.

### Out Of Scope

- BI-grade analytics and trends (owned by FE16/FE18).
- Export formats (CSV/PDF) unless explicitly required later.

## 4. Approved Technical Decisions

| Area | Decision |
| --- | --- |
| Source of truth | Reports are derived from persisted booking/payment/refund tables. |
| Scope | Only Owner/Admin can access report endpoints. |
| Data accuracy | Use server-side time zone rules from settings where applicable. |

## 5. Database Dependencies

Required tables/fields exist in `mysql-workbench-schema.sql`:

- `bookings`: totals, statuses, dates, branch/court ids.
- `payment_transactions`: paid amounts and timestamps.
- `refunds`: refunded amounts and timestamps.
- `branches`, `courts`: grouping dimensions.

## 6. API Endpoints

Reporting endpoints are planned; implement contract in backend when ready:

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/api/reports/summary` | Revenue + booking counts by date range and branch. |
| GET | `/api/reports/branch/:id` | Branch-specific report. |

If the project prefers to nest reporting under staff routes, adjust to `/api/staff/reports/*`.

## 7. Backend File Plan

Expected backend files:

```text
backend/src/routes/staffRoutes.js (or new reportRoutes.js)
backend/src/controllers/staffController.js (or new reportController.js)
backend/src/models/Booking.js
```

## 8. Frontend File Plan

Expected frontend integration files:

```text
frontend/src/pages/* (reports)
frontend/src/services/* (reports client)
```

## 9. Test Strategy

### Unit Tests

- Aggregation logic for totals and counts.
- Date range validation.

### Integration Tests

- Owner/Admin can query summary; Staff/Customer is forbidden.
- Totals match seeded bookings/payments/refunds.

## 10. Risks And Mitigations

| Risk | Mitigation |
| --- | --- |
| Incorrect totals due to mixed states | Define clear inclusion rules (paid vs pending, refunded vs cancelled). |
| Performance on large ranges | Add indexes and pre-aggregate if needed (phase 2). |
| Authorization leaks | Enforce role checks on report endpoints. |

## 11. Validation Gate

- All TASKS.md items are complete.
- Report numbers reconcile with bookings/payments/refunds for sample data.
- Authorization is enforced for report access.
