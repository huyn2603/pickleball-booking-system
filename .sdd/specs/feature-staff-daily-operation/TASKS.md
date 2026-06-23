# TASKS.md - FE04 Staff Daily Operation

Status: READY FOR REVIEW
Date: 2026-06-23
Owner: Dat

## Task Rules

- Implement only FE04 behavior from `SPEC.md` and `PLAN.md`.
- All staff actions must be authorized server-side.
- State transitions must be validated server-side.
- No sensitive data in logs; record only metadata for auditability.

## Tasks

| ID | Task | Spec Mapping | Dependencies | DoD |
| --- | --- | --- | --- | --- |
| FE04-T001 | Confirm staff endpoints and required UI flows (dashboard, confirm/cancel, check-in/out, payment, addon stock). | US-PB-06 | None | Endpoints + flows documented. |
| FE04-T002 | Enforce staff role authorization and branch scope rules where applicable. | US-PB-06 | FE04-T001 | Unauthorized access blocked; scope enforced. |
| FE04-T003 | Implement/verify dashboard query and booking filtering by date. | US-PB-06 | FE04-T001 | Dashboard returns correct bookings for date. |
| FE04-T004 | Implement/verify booking state transitions (confirm/cancel/check-in/check-out). | US-PB-06 | FE04-T001 | Invalid transitions rejected; successful transitions persisted. |
| FE04-T005 | Implement/verify staff payment recording and reconciliation fields. | US-PB-06 | FE04-T004 | Payment records saved; booking state updated consistently. |
| FE04-T006 | Implement/verify addon stock updates with validation. | US-PB-06 | FE04-T002 | Stock cannot go negative; audit metadata available. |
| FE04-T007 | Add tests for authorization and key staff actions. | US-PB-06 | FE04-T002..T006 | Tests pass locally; covers forbidden cases. |
| FE04-T008 | Update FE04 CHANGELOG with implemented scope and remaining risks. | DoD | FE04-T007 | CHANGELOG updated. |

## Suggested Implementation Order

1. FE04-T001 to FE04-T004: core staff flows.
2. FE04-T005 to FE04-T006: payments + inventory.
3. FE04-T007 to FE04-T008: tests + docs.

## Minimum Sprint 1 Completion Slice

- FE04-T001 to FE04-T004
- FE04-T007 (dashboard + check-in/out smoke test)
