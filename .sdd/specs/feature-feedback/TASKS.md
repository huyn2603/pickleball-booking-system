# TASKS.md - FE11 Feedback

Status: READY FOR REVIEW
Date: 2026-06-23
Owner: Dat

## Task Rules

- Implement only FE11 behavior from `SPEC.md` and `PLAN.md`.
- Feedback submission must be scoped to eligible bookings and authenticated users.
- Staff/Owner review endpoints must be authorized server-side.
- Tests must cover eligibility, duplicates, and role boundaries.

## Tasks

| ID | Task | Spec Mapping | Dependencies | DoD |
| --- | --- | --- | --- | --- |
| FE11-T001 | Define feedback contract (rating bounds, comment length, eligibility rules). | US-PB-13 | None | Contract documented and aligned with schema. |
| FE11-T002 | Implement feedback submission endpoint with eligibility checks. | US-PB-13 | FE11-T001 | Only completed booking owners can submit; duplicates blocked. |
| FE11-T003 | Implement staff/owner feedback review endpoints and filtering. | US-PB-13 | FE11-T001 | Staff/Owner can list and read feedback; customers cannot. |
| FE11-T004 | Add moderation/update capabilities if in scope (status/notes). | US-PB-13 | FE11-T003 | Updates are auditable and validated. |
| FE11-T005 | Add indexes for feedback queries if needed. | US-PB-13 | FE11-T003 | List queries remain responsive. |
| FE11-T006 | Frontend UI for feedback submit + staff review. | US-PB-13 | FE11-T002..T003 | UI works with loading/error states. |
| FE11-T007 | Add tests for eligibility, duplicates, and authorization boundaries. | US-PB-13 | FE11-T002..T003 | Tests pass locally; covers forbidden cases. |
| FE11-T008 | Update FE11 CHANGELOG with implemented scope and limitations. | DoD | FE11-T007 | CHANGELOG updated. |

## Suggested Implementation Order

1. FE11-T001 to FE11-T003
2. FE11-T007
3. FE11-T006
4. FE11-T004 to FE11-T005 (optional), FE11-T008

## Minimum Sprint 1 Completion Slice

- FE11-T001 to FE11-T003
- FE11-T007 (submit + review smoke test)
