# SPEC.md - FE14 Court Maintenance

Version: 0.1.0
Status: DRAFT
Owner: Dat
Last Updated: 2026-06-23
Feature ID: FE14
Feature folder: `.sdd/specs/feature-maintenance/`

Business context (short): Staff/Admin must quickly mark courts as under maintenance to prevent new bookings and to identify impacted future bookings for follow-up and refunds. It depends on FE05 court statuses and affects FE02/FE17 availability logic.

---

## 1. Feature Overview

### 1.1 Feature Name

FE14 Court Maintenance

### 1.2 Business Context

Maintenance protects safety and prevents operational incidents. Incorrect handling can allow bookings on unsafe courts or hide impacted bookings.

### 1.3 Goal / Outcome

The system will:

- Allow authorized users to change court status to `maintenance` with a reason.
- Immediately block new holds/bookings for affected courts.
- Provide visibility of impacted bookings within the maintenance period.

### 1.4 Scope Level

- [x] Standard Spec
- [ ] Full Spec
- [ ] Light Spec

---

## 2. Actors and Permissions

| Actor | Description | Permission / Responsibility |
| --- | --- | --- |
| Staff | Operator | Can mark maintenance (if allowed) and handle impacted bookings |
| Owner/Admin | Oversight | Full control of maintenance status and decisions |
| Customer | Booking owner | Sees court unavailable; may receive notification (FE10) |

---

## 3. Preconditions

- PRE-FE14-001: Actor is authenticated and authorized.
- PRE-FE14-002: Court exists in `courts`.
- PRE-FE14-003: Booking system uses court status gating (FE02).

---

## 4. Main Flows

### MF-FE14-001: Start Maintenance

1. Staff/Admin selects a court and sets status to `maintenance` with a reason and optional date range.
2. System persists status and reason record (if a maintenance window entity exists).
3. Availability immediately blocks new holds/bookings for that court.

### MF-FE14-002: View Impacted Bookings

1. Staff requests impacted bookings for the court and date range.
2. System returns bookings that overlap maintenance period and are not completed/cancelled.

### MF-FE14-003: End Maintenance

1. Admin changes court status back to `available`.
2. Availability resumes normal behavior.

---

## 5. Alternative Flows

| ID | Alternative Flow |
| --- | --- |
| AF-FE14-001 | Maintenance set on a court with active holds → holds become invalid per policy. |
| AF-FE14-002 | Attempt to end maintenance without authorization → reject. |

---

## 6. Business Rules

- BR-FE14-001: Courts in `maintenance` must be ineligible for new holds/bookings.
- BR-FE14-002: Maintenance actions must preserve audit trail (who changed what, when, and why).
- BR-FE14-003: Suggested slots must exclude maintenance courts (FE17 alignment).

---

## 7. Functional Requirements

- FR-FE14-001: When maintenance is activated, the system shall update court status and persist a reason.
- FR-FE14-002: When listing availability, the system shall block maintenance courts.
- FR-FE14-003: When requesting impacted bookings, the system shall return bookings overlapping the maintenance period.

---

## 8. Acceptance Criteria

- AC-FE14-001: Given a court is set to maintenance, when a Customer attempts a hold, then the system rejects.
- AC-FE14-002: Given maintenance is activated, when Staff requests impacted bookings, then overlapping bookings are returned.
- AC-FE14-003: Given maintenance is ended, when viewing availability, then the court becomes eligible again.

---

## 9. Edge Cases and Error Handling

| ID | Edge Case / Error | Expected System Behavior |
| --- | --- | --- |
| EC-FE14-001 | Emergency maintenance during active session | Require staff decision; do not delete records |
| EC-FE14-002 | Maintenance overlaps with confirmed bookings | Flag for follow-up and refund handling (FE03) |

---

## 10. Data Requirements

### 10.1 Entities Involved

| Entity | Purpose in this feature |
| --- | --- |
| `courts` | Status gating |
| `bookings` | Identifying impacted bookings |
| `maintenance_windows` | Stores reason and time window (if implemented) |

### 10.2 Data Fields

| Field | Type | Required | Validation / Notes |
| --- | --- | --- | --- |
| `courts.status` | enum | Yes | `maintenance` blocks booking |
| `maintenance_windows.reason` | string | Yes | Required for audit |
| `maintenance_windows.start_at` | datetime | No | If null, immediate |
| `maintenance_windows.end_at` | datetime | No | If null, until manually ended |

---

## 11. API / Interface Contract

| Method | Endpoint | Actor | Request | Response | Notes |
| --- | --- | --- | --- | --- | --- |
| PATCH | `/api/courts/:id/status` | Staff/Owner/Admin | `{ status, reason? }` | `{ success, court }` | Shared with FE05 |
| GET | `/api/staff/courts/:id/impacted-bookings` | Staff | `?from&to` | `{ success, items }` | Impact view |

---

## 12. Non-functional Requirements

### 12.1 Security

- NFR-FE14-SEC-001: Maintenance actions must require role authorization.

### 12.2 Transaction Integrity

- NFR-FE14-TXN-001: Court status changes must be immediately visible to availability computations.

### 12.3 Performance

- NFR-FE14-PERF-001: Impacted bookings query must be bounded by date range.

### 12.4 Logging and Audit

- NFR-FE14-LOG-001: Maintenance start/end actions must be logged with actor and reason.

### 12.5 Usability

- NFR-FE14-UX-001: Users must see clear court unavailability reason (“Maintenance”).

---

## 13. Out of Scope

- Automated rescheduling of impacted bookings.

---

## 14. Dependencies

| Dependency | Type | Notes |
| --- | --- | --- |
| FE05 Branch & Court | Internal | Court status management |
| FE02 Schedule & Booking | Internal | Availability gating |
| FE03 Payment & Refund | Internal | Refund handling for impacted bookings |
| FE10 Notification | Internal | Customer notifications (optional) |

---

## 15. Open Questions

| ID | Question | Owner | Status |
| --- | --- | --- | --- |
| Q-FE14-001 | Do we invalidate active holds automatically when maintenance starts? | Dat | Open |
| Q-FE14-002 | Do we store a separate `maintenance_windows` table or only use `courts.status` + logs? | Dat | Open |

---

## 16. Traceability Matrix

| AC ID | Related FR ID | Related BR ID | Test Case ID | Status |
| --- | --- | --- | --- | --- |
| AC-FE14-001 | FR-FE14-002 | BR-FE14-001 | TC-FE14-001 | Not Started |
| AC-FE14-002 | FR-FE14-003 | BR-FE14-002 | TC-FE14-002 | Not Started |
| AC-FE14-003 | FR-FE14-002 | BR-FE14-001 | TC-FE14-003 | Not Started |

Summary:

| Item | Count | Fully Mapped? |
| --- | ---:| --- |
| AC | 3 | Yes |
| FR | 3 | Yes |
| BR | 3 | Yes |
| Test Cases | 3 | Yes |

---

## 17. Review Checklist

- [ ] Court status gating is enforced across booking/holds/suggestions.
- [ ] Impacted booking visibility is defined and testable.
- [ ] Traceability matrix maps ACs to tests.
