# TASKS.md - FE13 Voucher

Status: READY FOR REVIEW
Date: 2026-06-23
Owner: Dat

## Task Rules

- Implement only FE13 behavior from `SPEC.md` and `PLAN.md`.
- Voucher validation and discount calculation must be server-side.
- Avoid voucher abuse by enforcing limits and eligibility.
- Tests must cover invalid/expired/overused voucher scenarios.

## Tasks

| ID | Task | Spec Mapping | Dependencies | DoD |
| --- | --- | --- | --- | --- |
| FE13-T001 | Define voucher rules and validation contract (scope, expiry, usage limits). | US-PB-15 | None | Rules documented and aligned with schema. |
| FE13-T002 | Implement voucher validation logic and safe errors. | US-PB-15 | FE13-T001 | Invalid vouchers rejected safely; no sensitive leaks. |
| FE13-T003 | Integrate voucher discount into booking total calculation. | US-PB-15 | FE13-T002 | Server-calculated totals include discount and are persisted. |
| FE13-T004 | Persist voucher usage for reconciliation and limit enforcement. | US-PB-15 | FE13-T003 | Usage is tracked; overuse is blocked. |
| FE13-T005 | Add admin endpoints/UI for voucher management if in scope. | US-PB-15 | FE13-T001 | CRUD is role-protected and validated. |
| FE13-T006 | Frontend checkout integration for entering and applying vouchers. | US-PB-15 | FE13-T002..T003 | UI applies voucher and shows updated totals. |
| FE13-T007 | Add tests for voucher validation, limits, and totals. | US-PB-15 | FE13-T002..T004 | Tests pass locally; covers edge cases. |
| FE13-T008 | Update FE13 CHANGELOG with implemented scope and limitations. | DoD | FE13-T007 | CHANGELOG updated. |

## Suggested Implementation Order

1. FE13-T001 to FE13-T004
2. FE13-T007
3. FE13-T006 and FE13-T005 (optional)
4. FE13-T008

## Minimum Sprint 1 Completion Slice

- FE13-T001 to FE13-T004
- FE13-T007 (voucher apply smoke test)
