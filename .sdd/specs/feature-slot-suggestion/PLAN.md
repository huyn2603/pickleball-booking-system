# PLAN.md - FE17 Slot Suggestion

Status: READY FOR REVIEW
Date: 2026-06-23
Owner: Dat

## 1. Purpose

Implement FE17 Slot Suggestion according to the approved `SPEC.md`, recommending alternative slots or nearby branches when a selected slot is unavailable.

## 2. Source Documents

- `.sdd/specs/feature-slot-suggestion/SPEC.md`
- `README.md` (US-PB-19 scope)
- `mysql-workbench-schema.sql` (tables: `branches`, `courts`, `bookings`, `slot_holds`)

## 3. Scope

### In Scope

- Suggest alternative time slots for the same court/branch.
- Suggest alternative courts/branches within the supported city (Ha Noi in v1).
- Suggestions must respect court status, existing bookings, and active holds.

### Out Of Scope

- Route optimization / distance-based matching using maps APIs.
- Personalized recommendations based on user behavior history.

## 4. Approved Technical Decisions

| Area | Decision |
| --- | --- |
| Correctness | Suggestions must use the same availability rules as FE02. |
| Performance | Use bounded search windows (e.g., same day, +/- N slots) for MVP. |
| Authorization | Suggestions require authentication (consistent with booking flow). |

## 5. Database Dependencies

- `branches`, `courts`: candidate pool for suggestions.
- `bookings`, `slot_holds`: availability constraints.

## 6. API Endpoints

Suggestion endpoints are planned:

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/api/suggestions/slots` | Suggest alternative slots given branch/date/time preferences. |

Alternatively, embed suggestions into availability response as an extension.

## 7. Backend File Plan

```text
backend/src/controllers/* (suggestion controller, planned)
backend/src/routes/* (suggestion routes, planned)
backend/src/models/Booking.js
backend/src/models/Court.js
```

## 8. Frontend File Plan

```text
frontend/src/pages/* (schedule UI suggestion panel)
frontend/src/services/* (suggestion client)
```

## 9. Test Strategy

### Unit Tests

- Candidate generation within bounded windows.
- Filtering by court status and overlaps.

### Integration Tests

- Fully booked slot returns suggestions; available slot returns empty suggestions.

## 10. Risks And Mitigations

| Risk | Mitigation |
| --- | --- |
| Suggesting slots that are actually unavailable | Reuse availability logic and re-check before hold creation. |
| Slow queries | Add indexes and reduce candidate space (bounded search). |

## 11. Validation Gate

- All TASKS.md items are complete.
- Suggestions are correct and do not recommend unavailable slots.
