# SPEC.md - FE11 Feedback

Version: 0.1.0
Status: DRAFT
Owner: Dat
Last Updated: 2026-06-23
Feature ID: FE11
Feature folder: `.sdd/specs/feature-feedback/`

Business context (short): Customers submit ratings and comments after completed bookings. Staff/Owner review and act on low ratings. It depends on booking completion status (FE04) and may feed reporting/dashboard features (FE07/FE18).

---

## 1. Feature Overview

### 1.1 Feature Name

FE11 Feedback

### 1.2 Business Context

Feedback is a quality signal and customer-support input. If authorization is weak, users could submit feedback for others’ bookings or spam multiple entries for the same booking.

### 1.3 Goal / Outcome

The system will:

- Allow Customers to submit a rating (1–5) and optional comment for a completed booking.
- Enforce “one feedback per booking” (if enabled).
- Allow Staff/Owner to view and prioritize feedback for follow-up.

### 1.4 Scope Level

- [x] Standard Spec
- [ ] Full Spec
- [ ] Light Spec

---

## 2. Actors and Permissions

| Actor | Description | Permission / Responsibility |
| --- | --- | --- |
| Customer | Booking owner | Can submit feedback for their completed bookings |
| Staff/Owner/Admin | Reviewers | Can list and review feedback within scope |
| Database | Storage | Stores `feedbacks` (or equivalent) |

---

## 3. Preconditions

- PRE-FE11-001: Customer is authenticated.
- PRE-FE11-002: Booking exists, belongs to the customer, and status is `completed`.

---

## 4. Main Flows

### MF-FE11-001: Submit Feedback

1. Customer selects a completed booking.
2. Customer submits rating and comment.
3. System validates ownership and booking status.
4. System persists feedback and returns confirmation.

### MF-FE11-002: Review Feedback

1. Staff/Owner requests feedback list with filters (date range, rating threshold).
2. System returns items sorted by “needs attention” rules (e.g., low rating first).

---

## 5. Alternative Flows

| ID | Alternative Flow |
| --- | --- |
| AF-FE11-001 | Customer attempts feedback for non-owned booking → reject. |
| AF-FE11-002 | Customer submits second feedback for same booking → reject if one-per-booking rule enabled. |

---

## 6. Business Rules

- BR-FE11-001: Feedback can only be submitted for bookings with status `completed`.
- BR-FE11-002: Customer can only submit feedback for their own bookings.
- BR-FE11-003: At most one feedback per booking (Phase 1 default).

---

## 7. Functional Requirements

- FR-FE11-001: When a Customer submits feedback, the system shall validate booking ownership and completed status.
- FR-FE11-002: If a feedback already exists for a booking, then the system shall reject duplicate submissions (if enabled).
- FR-FE11-003: When Staff/Owner lists feedback, the system shall support filters and sorting by rating/recency.

---

## 8. Acceptance Criteria

- AC-FE11-001: Given a booking is completed, when Customer submits rating 1–5, then feedback is stored and linked to that booking.
- AC-FE11-002: Given Customer already submitted feedback, when submitting again, then the system rejects to prevent duplicates.
- AC-FE11-003: Given a low rating feedback exists, when Owner views feedback list, then it is prioritized for review.
- AC-FE11-004: Given Customer tries to submit feedback for someone else, when request is made, then it is rejected safely.

---

## 9. Edge Cases and Error Handling

| ID | Edge Case / Error | Expected System Behavior |
| --- | --- | --- |
| EC-FE11-001 | Rating outside 1–5 | Reject with validation error |
| EC-FE11-002 | Booking cancelled/refunded | Reject feedback (not completed) |
| EC-FE11-003 | Offensive content | Flag for moderation (policy/TBD) |

---

## 10. Data Requirements

### 10.1 Entities Involved

| Entity | Purpose in this feature |
| --- | --- |
| `bookings` | Eligibility and linkage |
| `feedbacks` | Stores rating/comment and status |

### 10.2 Data Fields

| Field | Type | Required | Validation / Notes |
| --- | --- | --- | --- |
| `feedbacks.booking_id` | id | Yes | Unique if one-per-booking |
| `feedbacks.user_id` | id | Yes | Must match booking user |
| `feedbacks.rating` | number | Yes | Integer 1–5 |
| `feedbacks.comment` | string | No | Length bounded |

---

## 11. API / Interface Contract

| Method | Endpoint | Actor | Request | Response | Notes |
| --- | --- | --- | --- | --- | --- |
| POST | `/api/feedback` | Customer | `{ bookingId, rating, comment? }` | `{ success, feedback }` | Requires auth |
| GET | `/api/staff/feedback` | Staff/Owner/Admin | `?from&to&minRating` | `{ success, items }` | Role protected |

---

## 12. Non-functional Requirements

### 12.1 Security

- NFR-FE11-SEC-001: Enforce ownership checks to prevent IDOR.

### 12.2 Transaction Integrity

- NFR-FE11-TXN-001: Feedback creation must be consistent with booking eligibility checks.

### 12.3 Performance

- NFR-FE11-PERF-001: Feedback listing should be paginated.

### 12.4 Logging and Audit

- NFR-FE11-LOG-001: Staff review actions (if any) should be logged for accountability.

### 12.5 Usability

- NFR-FE11-UX-001: Feedback form must clearly show which booking the feedback is for.

---

## 13. Out of Scope

- Full moderation workflow and content policies beyond basic validation.

---

## 14. Dependencies

| Dependency | Type | Notes |
| --- | --- | --- |
| FE04 Staff Daily Operation | Internal | Defines booking completion state |
| FE09 Customer History | Internal | Customer navigates from history to feedback |
| FE18 Ops Dashboard | Internal | May consume feedback metrics |

---

## 15. Open Questions

| ID | Question | Owner | Status |
| --- | --- | --- | --- |
| Q-FE11-001 | Can customers edit feedback after submission (within a time window) in Phase 1? | Dat | Open |

---

## 16. Traceability Matrix

| AC ID | Related FR ID | Related BR ID | Test Case ID | Status |
| --- | --- | --- | --- | --- |
| AC-FE11-001 | FR-FE11-001 | BR-FE11-001 | TC-FE11-001 | Not Started |
| AC-FE11-002 | FR-FE11-002 | BR-FE11-003 | TC-FE11-002 | Not Started |
| AC-FE11-003 | FR-FE11-003 | BR-FE11-002 | TC-FE11-003 | Not Started |
| AC-FE11-004 | FR-FE11-001 | BR-FE11-002 | TC-FE11-004 | Not Started |

Summary:

| Item | Count | Fully Mapped? |
| --- | ---:| --- |
| AC | 4 | Yes |
| FR | 3 | Yes |
| BR | 3 | Yes |
| Test Cases | 4 | Yes |

---

## 17. Review Checklist

- [ ] Eligibility rules (completed + ownership) are explicit and tested.
- [ ] Duplicate submission policy is defined.
- [ ] Traceability matrix maps ACs to tests.
