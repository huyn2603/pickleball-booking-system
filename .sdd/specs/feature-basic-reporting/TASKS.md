# TASKS.md - FE07 Basic Reporting

Status: READY FOR REVIEW
Date: 2026-06-23
Owner: Dat

## Task Rules

- Implement only FE07 behavior from `SPEC.md` and `PLAN.md`.
- Reports must be derived from authoritative booking/payment/refund data.
- Authorization is mandatory (Owner/Admin only).
- Tests must validate aggregation correctness and access control.

## Tasks

| ID | Task | Spec Mapping | Dependencies | DoD |
| --- | --- | --- | --- | --- |
| FE07-T001 | Define report metrics and endpoint contract (summary by date range/branch). | US-PB-09 | None | Metric definitions documented; contract agreed. |
| FE07-T002 | Implement report queries (revenue, booking counts, utilization proxy). | US-PB-09 | FE07-T001 | Queries return correct totals on sample data. |
| FE07-T003 | Enforce Owner/Admin authorization for report endpoints. | US-PB-09 | FE07-T002 | Non-owner/admin blocked with 403. |
| FE07-T004 | Add indexes to support report queries if needed. | US-PB-09 | FE07-T002 | Query latency acceptable for typical ranges. |
| FE07-T005 | Implement frontend report screen with filters and error states. | US-PB-09 | FE07-T002..T003 | UI renders and handles loading/errors. |
| FE07-T006 | Add tests for aggregations and authz. | US-PB-09 | FE07-T002..T003 | Tests pass locally; covers edge cases. |
| FE07-T007 | Add basic reconciliation checks (payments vs refunds vs totals). | US-PB-09 | FE07-T002 | Reconciliation rules documented and tested. |
| FE07-T008 | Update FE07 CHANGELOG with implemented scope and remaining limitations. | DoD | FE07-T006 | CHANGELOG updated. |

## Suggested Implementation Order

1. FE07-T001 to FE07-T003
2. FE07-T006
3. FE07-T005
4. FE07-T004, FE07-T007, FE07-T008

## Minimum Sprint 1 Completion Slice

- FE07-T001 to FE07-T003
- FE07-T006 (summary report smoke test)
