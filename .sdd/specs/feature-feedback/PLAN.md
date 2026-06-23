# PLAN.md - FE11 Feedback

Status: READY FOR REVIEW
Date: 2026-06-23
Owner: Dat

## 1. Purpose

Implement FE11 Feedback according to the approved `SPEC.md`, allowing customers to submit feedback after playing and allowing staff/owners to review it.

## 2. Source Documents

- `.sdd/specs/feature-feedback/SPEC.md`
- `README.md` (US-PB-13 scope)
- `mysql-workbench-schema.sql` (tables: `feedback`, `bookings`, `users`, `audit_logs`)

## 3. Scope

### In Scope

- Customer submits feedback for eligible completed bookings.
- Staff/Owner views feedback list and details.
- Server-side validation: one feedback per booking; rating bounds; permission scope.

### Out Of Scope

- Public reviews/SEO pages.
- Automated sentiment analysis.

## 4. Approved Technical Decisions

| Area | Decision |
| --- | --- |
| Eligibility | Feedback is tied to a completed booking. |
| Abuse prevention | Enforce auth and ownership checks on submission. |
| Auditability | Record moderation actions (planned/partial). |

## 5. Database Dependencies

- `feedback`: rating, comment, booking_id, user_id, created_at.
- `bookings`: completion status and linkage.
- `users`: author identity.

## 6. API Endpoints

Feedback endpoints are planned if not yet implemented:

| Method | Endpoint | Purpose |
| --- | --- | --- |
| POST | `/api/feedback` | Submit feedback for a booking. |
| GET | `/api/staff/feedback` | List feedback (Staff/Owner). |

## 7. Backend File Plan

```text
backend/src/controllers/staffController.js (or new feedbackController.js)
backend/src/routes/staffRoutes.js (or new feedbackRoutes.js)
backend/src/models/* (Feedback model if added)
```

## 8. Frontend File Plan

```text
frontend/src/pages/* (feedback submit + staff review)
frontend/src/services/* (feedback client)
```

## 9. Test Strategy

### Unit Tests

- Rating/comment validation.
- Ownership rules (only booking owner can submit).

### Integration Tests

- Completed booking can submit feedback; duplicate submission is rejected.
- Staff can list feedback; customer cannot access staff endpoint.

## 10. Risks And Mitigations

| Risk | Mitigation |
| --- | --- |
| Abuse/spam | Auth + eligibility checks; consider rate limits. |
| Privacy leaks | Do not expose internal notes or staff-only fields. |

## 11. Validation Gate

- All TASKS.md items are complete.
- Feedback submission and staff review flows pass smoke tests.
