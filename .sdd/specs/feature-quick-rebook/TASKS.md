# TASKS.md - FE15 Quick Rebook

Status: READY FOR REVIEW
Date: 2026-06-23
Owner: Dat

## Task Rules

- Implement only FE15 behavior from `SPEC.md` and `PLAN.md`.
- Quick rebook must re-validate availability and pricing; no bypass of FE02 rules.
- Authorization and privacy rules apply (only own history).
- Tests must cover revalidation and failures when slot becomes unavailable.

## Tasks

| ID | Task | Spec Mapping | Dependencies | DoD |
| --- | --- | --- | --- | --- |
| FE15-T001 | Define quick rebook UX and required API contract. | US-PB-17 | None | Contract documented and aligned with existing endpoints. |
| FE15-T002 | Implement/verify server logic to prefill from history safely. | US-PB-17 | FE15-T001 | Only own bookings can be used; safe fields only. |
| FE15-T003 | Implement quick rebook flow to create a new hold with revalidation. | US-PB-17 | FE15-T002 | New hold created only if slot available. |
| FE15-T004 | Integrate with booking creation from hold. | US-PB-17 | FE15-T003 | From-hold booking draft works end-to-end. |
| FE15-T005 | Frontend history -> quick rebook UI. | US-PB-17 | FE15-T002..T004 | UI supports prefill and shows revalidation failures. |
| FE15-T006 | Add tests for quick rebook success and rejection cases. | US-PB-17 | FE15-T003..T004 | Tests pass locally. |
| FE15-T007 | Add constraints/indexes if needed for rebook queries. | US-PB-17 | FE15-T002 | History lookup remains responsive. |
| FE15-T008 | Update FE15 CHANGELOG with implemented scope and limitations. | DoD | FE15-T006 | CHANGELOG updated. |

## Suggested Implementation Order

1. FE15-T001 to FE15-T004
2. FE15-T006
3. FE15-T005
4. FE15-T007 and FE15-T008

## Minimum Sprint 1 Completion Slice

- FE15-T001 to FE15-T004
- FE15-T006 (quick rebook smoke test)
