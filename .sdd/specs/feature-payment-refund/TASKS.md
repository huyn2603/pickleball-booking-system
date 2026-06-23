# TASKS.md - FE03 Payment & Refund

Status: READY FOR REVIEW
Date: 2026-06-23
Owner: Dat

## Task Rules

- Implement only FE03 behavior from `SPEC.md` and `PLAN.md`.
- Do not trust client totals; backend recalculates authoritative totals.
- Payment/refund state transitions must be consistent and auditable.
- Tests are required for refund policy windows and idempotency.

## Tasks

| ID | Task | Spec Mapping | Dependencies | DoD |
| --- | --- | --- | --- | --- |
| FE03-T001 | Confirm payment/refund state machine and endpoints (staff + webhook if used). | US-PB-04, US-PB-05 | None | State transitions and endpoints are documented. |
| FE03-T002 | Implement/verify payment record creation and booking confirmation. | US-PB-04 | FE03-T001 | Paid bookings transition correctly to confirmed. |
| FE03-T003 | Implement/verify refund policy calculation and cancellation flow. | US-PB-05 | FE03-T001 | Refund amounts match policy windows; booking status updates. |
| FE03-T004 | Add idempotency safeguards for webhook/duplicate actions. | US-PB-04 | FE03-T002 | Duplicate events do not create duplicate transactions/refunds. |
| FE03-T005 | Ensure staff endpoints are authorized and safely validated. | US-PB-04, US-PB-05 | FE03-T001 | Unauthorized roles blocked; errors are consistent. |
| FE03-T006 | Frontend integration for payment status and cancellation/refund UX. | US-PB-04, US-PB-05 | FE03-T002..T003 | UI shows status and refund outcome correctly. |
| FE03-T007 | Add tests: payment confirm, cancel/refund windows, idempotency. | US-PB-04, US-PB-05 | FE03-T002..T004 | Tests pass locally; covers edge cases. |
| FE03-T008 | Update FE03 CHANGELOG with implemented scope and remaining risks. | DoD | FE03-T007 | CHANGELOG updated. |

## Suggested Implementation Order

1. FE03-T001 to FE03-T003: core payment/refund logic.
2. FE03-T004 to FE03-T005: hardening + authorization.
3. FE03-T007: tests.
4. FE03-T006 and FE03-T008: UI + docs.

## Minimum Sprint 1 Completion Slice

- FE03-T001 to FE03-T003
- FE03-T007 (payment confirm + cancel/refund smoke test)
