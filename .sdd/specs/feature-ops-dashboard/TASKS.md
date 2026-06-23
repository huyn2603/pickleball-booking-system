# TASKS.md - FE18 Ops Dashboard

Status: READY FOR REVIEW
Date: 2026-06-23
Owner: Dat

## Task Rules

- Implement only FE18 behavior from `SPEC.md` and `PLAN.md`.
- Dashboard metrics must reconcile with FE07/FE16 totals where applicable.
- Authorization is mandatory (Owner/Admin only).
- Tests must cover KPI aggregation correctness and access control.

## Tasks

| ID | Task | Spec Mapping | Dependencies | DoD |
| --- | --- | --- | --- | --- |
| FE18-T001 | Define dashboard KPI set and endpoint contract (filters, date ranges). | US-PB-20 | None | KPI definitions and contract approved. |
| FE18-T002 | Implement KPI aggregation queries per branch. | US-PB-20 | FE18-T001 | KPIs correct on seeded dataset. |
| FE18-T003 | Enforce Owner/Admin authorization and safe input validation. | US-PB-20 | FE18-T002 | Other roles forbidden; invalid ranges rejected. |
| FE18-T004 | Add performance guardrails (default ranges, indexes, caching if needed). | US-PB-20 | FE18-T002 | Dashboard remains responsive. |
| FE18-T005 | Implement alert thresholds (optional) and surface anomalies. | US-PB-20 | FE18-T002 | Alerts computed deterministically. |
| FE18-T006 | Frontend ops dashboard UI with filters and drilldowns. | US-PB-20 | FE18-T002..T003 | UI renders KPIs and handles errors. |
| FE18-T007 | Add tests for KPI correctness and authorization. | US-PB-20 | FE18-T002..T003 | Tests pass locally; covers edge cases. |
| FE18-T008 | Update FE18 CHANGELOG with implemented scope and limitations. | DoD | FE18-T007 | CHANGELOG updated. |

## Suggested Implementation Order

1. FE18-T001 to FE18-T003
2. FE18-T007
3. FE18-T006
4. FE18-T004 to FE18-T005, FE18-T008

## Minimum Sprint 1 Completion Slice

- FE18-T001 to FE18-T003
- FE18-T007 (dashboard KPI smoke test)
