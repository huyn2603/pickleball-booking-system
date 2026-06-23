# TASKS.md - FE12 Internal Account Management

Status: READY FOR REVIEW
Date: 2026-06-23
Owner: Dat

## Task Rules

- Implement only FE12 behavior from `SPEC.md` and `PLAN.md`.
- Only Admin/Owner can manage accounts.
- Never expose password or password hash in any API response.
- Tests must cover authorization and safe response shaping.

## Tasks

| ID | Task | Spec Mapping | Dependencies | DoD |
| --- | --- | --- | --- | --- |
| FE12-T001 | Confirm managed account endpoints and required fields/roles. | US-PB-14 | None | Endpoint contract documented. |
| FE12-T002 | Implement/verify list/create/update managed accounts with validation. | US-PB-14 | FE12-T001 | CRUD works; invalid inputs return safe 400. |
| FE12-T003 | Enforce Admin/Owner authorization and restrict role assignments. | US-PB-14 | FE12-T002 | Non-admin blocked; role input validated. |
| FE12-T004 | Implement status enable/disable with audit metadata. | US-PB-14 | FE12-T002 | Status change persisted; audit metadata captured. |
| FE12-T005 | Implement view managed account bookings if in scope. | US-PB-14 | FE12-T002 | Bookings list is scoped and safe. |
| FE12-T006 | Frontend admin UI integration for account management. | US-PB-14 | FE12-T002..T004 | UI flows work with error states. |
| FE12-T007 | Add tests for authorization boundaries and safe fields. | US-PB-14 | FE12-T002..T004 | Tests pass; covers forbidden and field filtering. |
| FE12-T008 | Update FE12 CHANGELOG with implemented scope and limitations. | DoD | FE12-T007 | CHANGELOG updated. |

## Suggested Implementation Order

1. FE12-T001 to FE12-T004
2. FE12-T007
3. FE12-T006 and FE12-T005
4. FE12-T008

## Minimum Sprint 1 Completion Slice

- FE12-T001 to FE12-T004
- FE12-T007 (admin account management smoke test)
