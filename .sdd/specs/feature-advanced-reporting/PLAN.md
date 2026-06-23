# PLAN.md - FE16 Advanced Reporting

Status: READY FOR REVIEW
Date: 2026-06-23
Owner: Dat

## 1. Purpose

Implement FE16 Advanced Reporting according to the approved `SPEC.md`, providing analytics such as peak hours, trends, and top courts/add-ons for Owner/Admin decision making.

## 2. Source Documents

- `.sdd/specs/feature-advanced-reporting/SPEC.md`
- `README.md` (US-PB-18 scope)
- `mysql-workbench-schema.sql` (tables: `bookings`, `booking_slots`, `payment_transactions`, `refunds`, `booking_addons`, `feedback`)

## 3. Scope

### In Scope

- Analytics queries for peak hours, utilization trends, top-performing courts, top add-ons.
- Permission scope: Owner/Admin only.
- Aggregations that avoid double counting and reconcile with basic reporting totals.

### Out Of Scope

- External BI tooling integration.
- Very large scale optimizations (materialized views) unless needed.

## 4. Approved Technical Decisions

| Area | Decision |
| --- | --- |
| Consistency | Advanced metrics must reconcile with basic reporting base totals. |
| Authorization | Owner/Admin-only access. |
| Privacy | Do not expose customer PII in aggregated datasets unless required. |

## 5. Database Dependencies

- `bookings`, `booking_slots`: utilization and time-based metrics.
- `payment_transactions`, `refunds`: revenue and refund trend metrics.
- `booking_addons`: add-on analytics.
- `feedback`: satisfaction metrics.

## 6. API Endpoints

Advanced reporting endpoints are planned:

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/api/reports/advanced` | Advanced analytics dataset by date range and branch. |
| GET | `/api/reports/peak-hours` | Peak hour utilization by weekday/hour. |

## 7. Backend File Plan

```text
backend/src/controllers/* (report controller, planned)
backend/src/routes/* (report routes, planned)
backend/src/models/Booking.js
```

## 8. Frontend File Plan

```text
frontend/src/pages/* (advanced reporting)
frontend/src/services/* (reports client)
```

## 9. Test Strategy

### Unit Tests

- Aggregation logic for peak hours/trends.
- Date range validation and timezone handling.

### Integration Tests

- Owner/Admin can query; other roles forbidden.
- Metrics match seeded dataset expectations.

## 10. Risks And Mitigations

| Risk | Mitigation |
| --- | --- |
| Slow queries on large data | Add indexes and restrict date range; optimize queries iteratively. |
| Misleading metrics | Define metric definitions clearly and test with known datasets. |

## 11. Validation Gate

- All TASKS.md items are complete.
- Advanced metrics reconcile with basic reporting totals on sample data.
