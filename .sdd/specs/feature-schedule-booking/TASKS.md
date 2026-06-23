# TASKS.md - FE02 Schedule & Booking

Status: READY FOR REVIEW
Date: 2026-06-23
Owner: Dat

## Task Rules

- Implement only FE02 behavior from `SPEC.md` and `PLAN.md`.
- Backend validation and anti-double-booking rules are mandatory.
- Do not trust client-calculated totals or availability.
- Tests are required for concurrency and expiry edge cases.

## Tasks

| ID | Task | Spec Mapping | Dependencies | DoD |
| --- | --- | --- | --- | --- |
| FE02-T001 | Confirm endpoints for courts/availability/hold/from-hold and response contracts. | US-PB-02, US-PB-03 | None | API contracts are documented and consistent. |
| FE02-T002 | Implement/verify availability logic (bookings + holds + court status). | US-PB-02 | FE02-T001 | Availability matches rules; maintenance/inactive blocked. |
| FE02-T003 | Implement/verify hold creation with expiry (default 10 minutes). | US-PB-03 | FE02-T001 | Hold expires correctly; slot freed after expiry. |
| FE02-T004 | Implement/verify create booking from hold and prevent race double-booking. | US-PB-03 | FE02-T003 | Only one booking wins per slot; losers get safe error. |
| FE02-T005 | Add indexes/constraints to support availability queries if needed. | US-PB-02, US-PB-03 | FE02-T002 | Queries remain fast on typical date ranges. |
| FE02-T006 | Frontend schedule UI integration (availability view + hold countdown). | US-PB-02, US-PB-03 | FE02-T004 | UI can view/hold/book with clear states. |
| FE02-T007 | Add tests: availability, hold expiry, concurrent hold requests. | US-PB-02, US-PB-03 | FE02-T002..T004 | Tests pass and cover race/expiry cases. |
| FE02-T008 | Update FE02 CHANGELOG with implemented scope and known limitations. | DoD | FE02-T007 | CHANGELOG reflects current implementation. |

## Suggested Implementation Order

1. FE02-T001 to FE02-T004: core schedule/hold/booking correctness.
2. FE02-T007: tests (including concurrency).
3. FE02-T006: frontend wiring.
4. FE02-T005 and FE02-T008: performance + docs.

## Minimum Sprint 1 Completion Slice

- FE02-T001 to FE02-T004
- FE02-T007 (availability -> hold -> from-hold smoke test)
