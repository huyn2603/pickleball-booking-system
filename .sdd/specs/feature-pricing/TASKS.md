# TASKS.md - FE08 Pricing Rules

Status: READY FOR REVIEW
Date: 2026-06-23
Owner: Dat

## Task Rules

- Implement only FE08 behavior from `SPEC.md` and `PLAN.md`.
- Pricing and totals must be calculated server-side.
- Rule selection must be deterministic and test-covered.
- Avoid introducing breaking changes to booking totals without tests.

## Tasks

| ID | Task | Spec Mapping | Dependencies | DoD |
| --- | --- | --- | --- | --- |
| FE08-T001 | Define pricing rule contract (scope, priority, time windows). | US-PB-10 | None | Rules documented and aligned with schema. |
| FE08-T002 | Implement/verify server-side rule matching and total calculation. | US-PB-10 | FE08-T001 | Totals match expected rules on sample cases. |
| FE08-T003 | Ensure pricing is used in booking creation and not overridden by client totals. | US-PB-10 | FE08-T002 | Client totals ignored; server totals persisted. |
| FE08-T004 | Add indexes for `price_rules` queries if needed. | US-PB-10 | FE08-T002 | Pricing queries remain fast. |
| FE08-T005 | Add optional admin endpoints for managing rules (if in scope). | US-PB-10 | FE08-T001 | CRUD endpoints exist and are role-protected. |
| FE08-T006 | Frontend admin screen for pricing rules (if in scope). | US-PB-10 | FE08-T005 | UI can manage rules with validation and errors. |
| FE08-T007 | Add tests for rule selection and totals. | US-PB-10 | FE08-T002..T003 | Tests pass locally; covers conflict/edge cases. |
| FE08-T008 | Update FE08 CHANGELOG with implemented scope and limitations. | DoD | FE08-T007 | CHANGELOG updated. |

## Suggested Implementation Order

1. FE08-T001 to FE08-T003
2. FE08-T007
3. FE08-T004
4. FE08-T005 to FE08-T006 (optional), FE08-T008

## Minimum Sprint 1 Completion Slice

- FE08-T001 to FE08-T003
- FE08-T007 (pricing totals smoke test)
