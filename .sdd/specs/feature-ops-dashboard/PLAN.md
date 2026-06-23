# PLAN.md - FE18 Ops Dashboard

Status: READY FOR REVIEW
Date: 2026-06-23
Owner: Dat

## 1. Purpose

Implement FE18 Ops Dashboard according to the approved `SPEC.md`, providing Owner/Admin with an operational overview of branches: utilization, revenue, refunds, add-ons, and customer feedback signals.

## 2. Source Documents

- `.sdd/specs/feature-ops-dashboard/SPEC.md`
- `README.md` (US-PB-20 scope)
- `mysql-workbench-schema.sql` (tables: `branches`, `courts`, `bookings`, `payment_transactions`, `refunds`, `booking_addons`, `feedback`)

## 3. Scope

### In Scope

- KPI summary per branch for a selected date range (revenue, booking count, cancellation/refund count).
- Utilization overview based on booked slots vs available slots (approximation).
- Operational alerts (e.g., high cancellations, low ratings) as simple thresholds.
- Permission scope: Owner/Admin only.

### Out Of Scope

- Complex BI drilldowns (owned by FE16).
- Real-time streaming dashboards.

## 4. Approved Technical Decisions

| Area | Decision |
| --- | --- |
| Data source | Dashboard aggregates from booking/payment/refund/add-on/feedback tables. |
| Authorization | Owner/Admin-only access. |
| Performance | Use bounded date ranges and indexed fields; optimize iteratively. |

## 5. Database Dependencies

- `branches`, `courts`: grouping and capacity dimensions.
- `bookings`, `booking_slots`: utilization and booking KPIs.
- `payment_transactions`, `refunds`: revenue/refund KPIs.
- `booking_addons`: add-on KPIs.
- `feedback`: satisfaction KPIs.

## 6. API Endpoints

Dashboard endpoints are planned:

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/api/ops/dashboard` | Dashboard KPIs by date range and optional branch filter. |

## 7. Backend File Plan

```text
backend/src/controllers/* (ops dashboard controller, planned)
backend/src/routes/* (ops dashboard routes, planned)
backend/src/models/Booking.js
```

## 8. Frontend File Plan

```text
frontend/src/pages/* (ops dashboard)
frontend/src/services/* (dashboard client)
```

## 9. Test Strategy

### Unit Tests

- KPI aggregation correctness on seeded dataset.
- Date range validation.

### Integration Tests

- Owner/Admin can query dashboard; other roles forbidden.
- KPIs reconcile with basic reporting totals.

## 10. Risks And Mitigations

| Risk | Mitigation |
| --- | --- |
| Performance issues | Indexing and caching; limit default range. |
| Misleading KPIs | Define metrics clearly and cross-check against known totals. |

## 11. Validation Gate

- All TASKS.md items are complete.
- Dashboard KPIs reconcile with reporting totals for sample data.
