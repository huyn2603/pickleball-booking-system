# TASKS.md - FE05 Branch & Court Management

Status: READY FOR REVIEW
Date: 2026-06-23
Owner: Dat

## Task Rules

- Implement only FE05 behavior from `SPEC.md` and `PLAN.md`.
- Authorization is mandatory for management actions (Admin/Owner only).
- Prefer status changes over hard delete when courts are referenced by bookings.
- Tests must cover authorization and status effects on booking/availability.

## Tasks

| ID | Task | Spec Mapping | Dependencies | DoD |
| --- | --- | --- | --- | --- |
| FE05-T001 | Confirm management scope and endpoints for courts (and branches if needed). | US-PB-07 | None | Endpoint list and required fields finalized. |
| FE05-T002 | Implement/verify court CRUD with validation and safe errors. | US-PB-07 | FE05-T001 | Court CRUD works; invalid inputs return 400 safely. |
| FE05-T003 | Enforce Admin/Owner authorization on create/update/delete. | US-PB-07 | FE05-T002 | Non-admin blocked with 403. |
| FE05-T004 | Ensure court status updates block holds/bookings and reflect in availability. | US-PB-07 | FE05-T002 | Maintenance/inactive courts are not bookable. |
| FE05-T005 | Add constraints/indexes if needed for court listing and joins. | US-PB-07 | FE05-T002 | Queries remain responsive for typical usage. |
| FE05-T006 | Frontend admin UI for court management (list/create/edit/status). | US-PB-07 | FE05-T002 | UI flows work with error states. |
| FE05-T007 | Add tests for authorization and status behavior. | US-PB-07 | FE05-T003..T004 | Tests pass locally; covers forbidden cases. |
| FE05-T008 | Update FE05 CHANGELOG with implemented scope and limitations (e.g., branch CRUD TBD). | DoD | FE05-T007 | CHANGELOG updated. |

## Suggested Implementation Order

1. FE05-T001 to FE05-T004
2. FE05-T007
3. FE05-T006
4. FE05-T005 and FE05-T008

## Minimum Sprint 1 Completion Slice

- FE05-T001 to FE05-T004
- FE05-T007 (admin court status blocking smoke test)
