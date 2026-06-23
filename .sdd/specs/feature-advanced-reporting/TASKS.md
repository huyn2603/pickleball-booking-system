# TASKS.md - FE16 Advanced Reporting

Status: READY FOR REVIEW
Date: 2026-06-23
Owner: Dat

## Task Rules

- Implement only FE16 behavior from `SPEC.md` and `PLAN.md`.
- Advanced metrics must reconcile with FE07 base totals.
- Authorization is mandatory (Owner/Admin only).
- Tests must cover aggregation correctness and performance guardrails.

## Tasks

| ID | Task | Spec Mapping | Dependencies | DoD |
| --- | --- | --- | --- | --- |
| FE16-T001 | Define advanced metrics and endpoint contracts (peak hours, trends, top courts/add-ons). | US-PB-18 | None | Metric definitions documented and agreed. |
| FE16-T002 | Implement aggregation queries with correct grouping and deduping. | US-PB-18 | FE16-T001 | Metrics correct on sample seeded data. |
| FE16-T003 | Enforce Owner/Admin authorization and safe inputs (date ranges). | US-PB-18 | FE16-T002 | Other roles forbidden; invalid ranges rejected. |
| FE16-T004 | Add indexes/optimizations for query performance if needed. | US-PB-18 | FE16-T002 | Queries remain responsive on typical ranges. |
| FE16-T005 | Frontend advanced reporting dashboards/charts (if in scope). | US-PB-18 | FE16-T002..T003 | UI renders metrics with filters and errors. |
| FE16-T006 | Add tests for aggregation correctness and authorization. | US-PB-18 | FE16-T002..T003 | Tests pass locally; covers edge cases. |
| FE16-T007 | Add reconciliation checks vs basic reporting totals. | US-PB-18 | FE16-T002 | Reconciliation rules documented and validated. |
| FE16-T008 | Update FE16 CHANGELOG with implemented scope and limitations. | DoD | FE16-T006 | CHANGELOG updated. |

## Suggested Implementation Order

1. FE16-T001 to FE16-T003
2. FE16-T006
3. FE16-T004 and FE16-T007
4. FE16-T005 (optional) and FE16-T008

## Minimum Sprint 1 Completion Slice

- FE16-T001 to FE16-T003
- FE16-T006 (peak hours smoke test)
