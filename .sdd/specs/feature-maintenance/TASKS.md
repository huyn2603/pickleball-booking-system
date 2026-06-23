# TASKS.md - FE14 Court Maintenance

Status: READY FOR REVIEW
Date: 2026-06-23
Owner: Dat

## Task Rules

- Implement only FE14 behavior from `SPEC.md` and `PLAN.md`.
- Maintenance must reliably block holds/bookings on affected courts.
- Use status updates (maintenance/inactive) instead of deleting courts.
- Tests must cover blocking behavior and edge cases.

## Tasks

| ID | Task | Spec Mapping | Dependencies | DoD |
| --- | --- | --- | --- | --- |
| FE14-T001 | Define maintenance workflow and permissions (who can set maintenance). | US-PB-16 | None | Workflow documented; roles agreed. |
| FE14-T002 | Implement/verify court status update supports maintenance/inactive. | US-PB-16 | FE14-T001 | Status change persists and is validated. |
| FE14-T003 | Enforce booking/hold blocking when court is unavailable. | US-PB-16 | FE14-T002 | Holds/bookings are rejected for maintenance courts. |
| FE14-T004 | Add support for identifying impacted future bookings (if in scope). | US-PB-16 | FE14-T002 | Impacted bookings list is accurate. |
| FE14-T005 | Integrate cancellation/refund handling for impacted bookings (policy-driven). | US-PB-16 | FE14-T004 | Refund outcomes follow policy and are auditable. |
| FE14-T006 | Frontend maintenance management UI and impacted booking view. | US-PB-16 | FE14-T002..T004 | UI supports status change and review. |
| FE14-T007 | Add tests for maintenance blocking and impacted booking detection. | US-PB-16 | FE14-T003..T004 | Tests pass locally; covers edge cases. |
| FE14-T008 | Update FE14 CHANGELOG with implemented scope and limitations. | DoD | FE14-T007 | CHANGELOG updated. |

## Suggested Implementation Order

1. FE14-T001 to FE14-T003
2. FE14-T007
3. FE14-T004 to FE14-T006 (optional)
4. FE14-T008

## Minimum Sprint 1 Completion Slice

- FE14-T001 to FE14-T003
- FE14-T007 (maintenance blocking smoke test)
