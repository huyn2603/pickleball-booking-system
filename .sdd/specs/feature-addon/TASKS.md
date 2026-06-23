# TASKS.md - FE06 Add-ons

Status: READY FOR REVIEW
Date: 2026-06-23
Owner: Dat

## Task Rules

- Implement only FE06 behavior from `SPEC.md` and `PLAN.md`.
- Stock updates must be authorized and validated server-side.
- Totals must be calculated server-side when add-ons are included.
- Tests must cover stock validation and booking-addon linkage.

## Tasks

| ID | Task | Spec Mapping | Dependencies | DoD |
| --- | --- | --- | --- | --- |
| FE06-T001 | Confirm add-on catalog scope and integration points in booking flow. | US-PB-08 | None | Catalog fields and booking linkage finalized. |
| FE06-T002 | Implement/verify add-on listing for booking UI (API as needed). | US-PB-08 | FE06-T001 | Client can retrieve add-on list reliably. |
| FE06-T003 | Implement/verify add-on stock update endpoint with role checks. | US-PB-08 | FE06-T001 | Unauthorized blocked; stock cannot go negative. |
| FE06-T004 | Implement/verify persisting add-ons on booking and server-side totals. | US-PB-08 | FE06-T002 | booking_addons persisted and totals updated correctly. |
| FE06-T005 | Add indexes/constraints for add-on tables if needed. | US-PB-08 | FE06-T004 | Common queries remain responsive. |
| FE06-T006 | Frontend UI for selecting add-ons and (optional) staff stock management. | US-PB-08 | FE06-T002..T003 | UI supports select + stock update with errors. |
| FE06-T007 | Add tests for stock update and booking-addon totals. | US-PB-08 | FE06-T003..T004 | Tests pass locally; covers edge cases. |
| FE06-T008 | Update FE06 CHANGELOG with implemented scope and limitations. | DoD | FE06-T007 | CHANGELOG updated. |

## Suggested Implementation Order

1. FE06-T001 to FE06-T004
2. FE06-T007
3. FE06-T006
4. FE06-T005 and FE06-T008

## Minimum Sprint 1 Completion Slice

- FE06-T001 to FE06-T004
- FE06-T007 (addon selection + stock update smoke test)
