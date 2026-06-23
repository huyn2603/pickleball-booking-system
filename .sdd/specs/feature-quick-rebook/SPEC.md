# SPEC.md - FE15 Quick Rebook

Version: 0.1.0
Status: DRAFT
Owner: Dat
Last Updated: 2026-06-23
Feature ID: FE15
Feature folder: `.sdd/specs/feature-quick-rebook/`

Business context (short): Quick rebook reduces friction for repeat customers by pre-filling a new booking request from history. It depends on FE09 history, FE02 availability/holds, and FE17 suggestions when old slot is not available.

---

## 1. Feature Overview

### 1.1 Feature Name

FE15 Quick Rebook

### 1.2 Business Context

This is a conversion optimization feature. It must not bypass availability checks or reuse invalid historical inputs (expired vouchers, disabled add-ons).

### 1.3 Goal / Outcome

The system will:

- Provide a “Rebook” action on eligible historical bookings.
- Pre-fill branch/court/time inputs for a new booking attempt.
- Re-validate availability and create a new hold under the current rules.

### 1.4 Scope Level

- [x] Light Spec
- [ ] Standard Spec
- [ ] Full Spec

---

## 2. Actors and Permissions

| Actor | Description | Permission / Responsibility |
| --- | --- | --- |
| Customer | Repeat user | Can initiate quick rebook from own history |
| Booking Engine | Backend | Validates and creates new hold/booking draft |

---

## 3. Preconditions

- PRE-FE15-001: Customer is authenticated.
- PRE-FE15-002: Customer has at least one eligible historical booking (completed/confirmed).

---

## 4. Main Flows

### MF-FE15-001: Initiate Quick Rebook

1. Customer selects a historical booking and clicks “Rebook”.
2. System returns a pre-filled booking form with previous branch/court/time.
3. Customer confirms date/time (may adjust) and requests a new hold.
4. System performs standard hold creation (FE02) and returns hold details.

---

## 5. Alternative Flows

| ID | Alternative Flow |
| --- | --- |
| AF-FE15-001 | Previous slot is not available → show alternatives (FE17) or request a different time. |
| AF-FE15-002 | Historical booking includes invalid/expired voucher/add-ons → do not pre-fill those items. |

---

## 6. Business Rules

- BR-FE15-001: Quick rebook must not bypass availability/hold rules.
- BR-FE15-002: Only the booking owner can use quick rebook for that booking.
- BR-FE15-003: The system must not auto-apply expired vouchers or disabled add-ons.

---

## 7. Functional Requirements

- FR-FE15-001: When a Customer requests quick rebook, the system shall return pre-fill inputs derived from the historical booking.
- FR-FE15-002: If the requested slot is not available, then the system shall provide alternative guidance (message or FE17 suggestions).
- FR-FE15-003: When creating a hold from quick rebook, the system shall use the standard hold creation endpoint and validations.

---

## 8. Acceptance Criteria

- AC-FE15-001: Given a Customer has a completed booking, when selecting Rebook, then the system pre-fills the booking form.
- AC-FE15-002: Given the previous slot is unavailable, when rebook is attempted, then the system shows a clear message and possible alternatives.
- AC-FE15-003: Given quick rebook is used, when a hold is created, then the hold obeys all FE02 validation rules.

---

## 9. Edge Cases and Error Handling

| ID | Edge Case / Error | Expected System Behavior |
| --- | --- | --- |
| EC-FE15-001 | Booking belongs to another user | Reject with 403/404 |
| EC-FE15-002 | Court is now inactive/maintenance | Reject and offer alternatives |

---

## 10. Data Requirements

### 10.1 Entities Involved

| Entity | Purpose in this feature |
| --- | --- |
| `bookings` | Source of historical values |
| `booking_slots` | Time ranges for pre-fill |
| `slot_holds` | New hold record |

### 10.2 Data Fields

| Field | Type | Required | Validation / Notes |
| --- | --- | --- | --- |
| `bookings.user_id` | id | Yes | Must match current customer |
| `slot_holds.court_id` | id | Yes | Must be eligible |
| `slot_holds.expires_at` | datetime | Yes | Uses current hold policy |

---

## 11. API / Interface Contract

| Method | Endpoint | Actor | Request | Response | Notes |
| --- | --- | --- | --- | --- | --- |
| POST | `/api/me/bookings/:id/rebook` | Customer | `{ date, startTime, endTime }` | `{ success, hold }` | Convenience endpoint (or UI composition) |

---

## 12. Non-functional Requirements

### 12.1 Security

- NFR-FE15-SEC-001: Enforce ownership checks to prevent IDOR.

### 12.2 Transaction Integrity

- NFR-FE15-TXN-001: Hold creation must follow FE02 transactional rules.

### 12.3 Performance

- NFR-FE15-PERF-001: Rebook pre-fill should be low-latency and avoid heavy joins.

### 12.4 Logging and Audit

- NFR-FE15-LOG-001: Rebook attempts should be logged for product analytics (no sensitive data).

### 12.5 Usability

- NFR-FE15-UX-001: Users must be clearly informed when the previous slot is not available.

---

## 13. Out of Scope

- Auto-booking without user confirmation.

---

## 14. Dependencies

| Dependency | Type | Notes |
| --- | --- | --- |
| FE09 Customer History | Internal | Provides “rebook from history” entry point |
| FE02 Schedule & Booking | Internal | Holds and availability |
| FE17 Slot Suggestion | Internal | Alternative suggestions (optional) |

---

## 15. Open Questions

| ID | Question | Owner | Status |
| --- | --- | --- | --- |
| Q-FE15-001 | Do we implement a dedicated backend “rebook” endpoint or keep it as frontend composition of existing endpoints? | Dat | Open |

---

## 16. Traceability Matrix

| AC ID | Related FR ID | Related BR ID | Test Case ID | Status |
| --- | --- | --- | --- | --- |
| AC-FE15-001 | FR-FE15-001 | BR-FE15-002 | TC-FE15-001 | Not Started |
| AC-FE15-002 | FR-FE15-002 | BR-FE15-001 | TC-FE15-002 | Not Started |
| AC-FE15-003 | FR-FE15-003 | BR-FE15-001 | TC-FE15-003 | Not Started |

Summary:

| Item | Count | Fully Mapped? |
| --- | ---:| --- |
| AC | 3 | Yes |
| FR | 3 | Yes |
| BR | 3 | Yes |
| Test Cases | 3 | Yes |

---

## 17. Review Checklist

- [ ] Quick rebook does not bypass availability and validation rules.
- [ ] Expired/invalid historical inputs are not auto-applied.
- [ ] Traceability matrix maps ACs to tests.
