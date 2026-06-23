# TASKS.md - FE17 Slot Suggestion

Status: READY FOR REVIEW
Date: 2026-06-23
Owner: Dat

## Task Rules

- Implement only FE17 behavior from `SPEC.md` and `PLAN.md`.
- Suggestions must be derived from the same availability rules as FE02.
- Suggestions are advisory; final hold/booking must re-validate availability.
- Tests must cover correctness (no suggesting unavailable slots).

## Tasks

| ID | Task | Spec Mapping | Dependencies | DoD |
| --- | --- | --- | --- | --- |
| FE17-T001 | Define suggestion inputs/outputs and constraints (time window, branch radius rules). | US-PB-19 | None | Contract documented and approved. |
| FE17-T002 | Implement candidate generation (same court/branch, nearby courts/branches). | US-PB-19 | FE17-T001 | Candidates generated within bounded limits. |
| FE17-T003 | Filter candidates using booking/hold overlaps and court status. | US-PB-19 | FE17-T002 | Suggested slots are actually available. |
| FE17-T004 | Expose suggestion API endpoint or embed in availability response. | US-PB-19 | FE17-T003 | UI can retrieve suggestions reliably. |
| FE17-T005 | Add indexes to support suggestion queries if needed. | US-PB-19 | FE17-T003 | Queries remain responsive. |
| FE17-T006 | Frontend suggestion UI integration in schedule/booking flow. | US-PB-19 | FE17-T004 | UI shows suggestions and handles empty state. |
| FE17-T007 | Add tests for suggestion correctness and edge cases. | US-PB-19 | FE17-T003..T004 | Tests pass locally; no false-available suggestions. |
| FE17-T008 | Update FE17 CHANGELOG with implemented scope and limitations. | DoD | FE17-T007 | CHANGELOG updated. |

## Suggested Implementation Order

1. FE17-T001 to FE17-T004
2. FE17-T007
3. FE17-T006
4. FE17-T005 and FE17-T008

## Minimum Sprint 1 Completion Slice

- FE17-T001 to FE17-T004
- FE17-T007 (suggestion correctness smoke test)
