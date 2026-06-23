# TASKS.md - FE09 Customer History

Status: READY FOR REVIEW
Date: 2026-06-23
Owner: Dat

## Task Rules

- Implement only FE09 behavior from `SPEC.md` and `PLAN.md`.
- Strictly enforce user scoping: customers can only access their own data.
- Do not expose staff-only/internal fields in customer history responses.
- Tests must cover authorization and privacy boundaries.

## Tasks

| ID | Task | Spec Mapping | Dependencies | DoD |
| --- | --- | --- | --- | --- |
| FE09-T001 | Define history response contract (list + optional detail) and required fields. | US-PB-11 | None | Contract documented; fields agreed. |
| FE09-T002 | Implement/verify `/api/bookings/my` with strict user scoping. | US-PB-11 | FE09-T001 | Cannot access other users' bookings. |
| FE09-T003 | Add optional booking detail endpoint if needed (payments/refunds/add-ons). | US-PB-11 | FE09-T002 | Detail returns complete history without leaks. |
| FE09-T004 | Ensure sensitive fields are excluded and errors are safe. | US-PB-11 | FE09-T002 | Responses contain only safe fields. |
| FE09-T005 | Add indexes if needed for history queries. | US-PB-11 | FE09-T002 | History queries remain responsive. |
| FE09-T006 | Frontend history page integration (list + detail view). | US-PB-11 | FE09-T002 | UI shows list/detail with loading/error states. |
| FE09-T007 | Add tests for user scoping and response shaping. | US-PB-11 | FE09-T002..T004 | Tests pass locally; covers unauthorized cases. |
| FE09-T008 | Update FE09 CHANGELOG with implemented scope and limitations. | DoD | FE09-T007 | CHANGELOG updated. |

## Suggested Implementation Order

1. FE09-T001 to FE09-T004
2. FE09-T007
3. FE09-T006
4. FE09-T005 and FE09-T008

## Minimum Sprint 1 Completion Slice

- FE09-T001 to FE09-T004
- FE09-T007 (history list smoke test)
