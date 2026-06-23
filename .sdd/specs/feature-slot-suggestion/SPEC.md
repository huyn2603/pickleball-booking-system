# SPEC.md - FE17 Slot Suggestion

Version: 0.1.0
Status: DRAFT
Owner: Dat
Last Updated: 2026-06-23
Feature ID: FE17
Feature folder: `.sdd/specs/feature-slot-suggestion/`

Business context (short): When a desired slot is not available, suggesting nearest alternatives improves conversion. It depends on FE02 availability and must not propose unavailable courts (maintenance/inactive, held, booked).

---

## 1. Feature Overview

### 1.1 Feature Name

FE17 Slot Suggestion

### 1.2 Business Context

Suggestions must be correct; otherwise customers waste time or experience false availability. This is a UX optimization feature but must remain consistent with core availability rules.

### 1.3 Goal / Outcome

The system will:

- Provide alternative slot suggestions when the requested slot cannot be held/booked.
- Rank suggestions by closeness in time, same branch preference, and court type match.
- Return an explicit “no suggestions” outcome when none are available.

### 1.4 Scope Level

- [x] Light Spec
- [ ] Standard Spec
- [ ] Full Spec

---

## 2. Actors and Permissions

| Actor | Description | Permission / Responsibility |
| --- | --- | --- |
| Customer | Booking user | Requests suggestions for an unavailable slot |
| Suggestion Engine | Backend logic | Searches availability and ranks results |

---

## 3. Preconditions

- PRE-FE17-001: Availability engine exists (FE02) and can evaluate slot availability.
- PRE-FE17-002: Court status data is up to date (FE05/FE14).

---

## 4. Main Flows

### MF-FE17-001: Suggest Alternatives in Same Branch

1. Customer requests hold for a slot; request fails due to unavailability.
2. System searches nearby time windows (before/after) on the same branch for available slots.
3. System ranks results by time distance and returns top N suggestions.

### MF-FE17-002: Expand to Other Branches

1. If no suggestions in the same branch, system searches other branches (policy-defined list).
2. System returns suggestions marked as “other branch”.

---

## 5. Alternative Flows

| ID | Alternative Flow |
| --- | --- |
| AF-FE17-001 | No valid alternatives exist → return empty suggestions with clear message. |
| AF-FE17-002 | Customer requests for a maintenance court → suggestions still exclude that court and its maintenance period. |

---

## 6. Business Rules

- BR-FE17-001: Suggested slots must be currently eligible (not booked, not held, not maintenance/inactive).
- BR-FE17-002: Same-branch suggestions must be preferred over cross-branch suggestions.
- BR-FE17-003: Suggestions are advisory; actual hold/booking must re-validate availability at creation time.

---

## 7. Functional Requirements

- FR-FE17-001: When a slot request fails, the system shall compute and return ranked alternative slot suggestions.
- FR-FE17-002: If a slot is not eligible (held/booked/maintenance/inactive), then the system shall exclude it from suggestions.
- FR-FE17-003: When no suggestions are found, the system shall return an explicit empty result.

---

## 8. Acceptance Criteria

- AC-FE17-001: Given the desired slot is booked, when requesting suggestions, then nearest earlier/later slots are returned if available.
- AC-FE17-002: Given the branch is full, when requesting suggestions, then other branches are suggested if policy allows.
- AC-FE17-003: Given multiple alternatives exist, when returning suggestions, then same-branch and closer-time suggestions rank higher.
- AC-FE17-004: Given a court is maintenance/inactive, when suggesting, then it never appears in suggestions.

---

## 9. Edge Cases and Error Handling

| ID | Edge Case / Error | Expected System Behavior |
| --- | --- | --- |
| EC-FE17-001 | Suggestions stale due to concurrent holds | Re-validate at hold creation; show conflict if selected suggestion becomes unavailable |
| EC-FE17-002 | Large search range | Enforce bounded search window and max results |

---

## 10. Data Requirements

### 10.1 Entities Involved

| Entity | Purpose in this feature |
| --- | --- |
| `courts` | Court eligibility and filtering |
| `bookings` / `booking_slots` | Determine booked times |
| `slot_holds` | Determine held times |
| `branches` | Cross-branch suggestion scope |

### 10.2 Data Fields

| Field | Type | Required | Validation / Notes |
| --- | --- | --- | --- |
| `courts.status` | enum | Yes | Exclude maintenance/inactive |
| `slot_holds.expires_at` | datetime | Yes | Only active holds block suggestions |
| `booking_slots.start_time` | time | Yes | Used for time distance |

---

## 11. API / Interface Contract

| Method | Endpoint | Actor | Request | Response | Notes |
| --- | --- | --- | --- | --- | --- |
| GET | `/api/suggestions/slots` | Customer | `?branchId&date&courtType?&startTime&endTime` | `{ success, items }` | Returns ranked suggestions |

---

## 12. Non-functional Requirements

### 12.1 Security

- NFR-FE17-SEC-001: Suggestions must not leak restricted branch data beyond role policy (if any).

### 12.2 Transaction Integrity

- NFR-FE17-TXN-001: Suggestion results are advisory; hold creation is authoritative and must re-check.

### 12.3 Performance

- NFR-FE17-PERF-001: Suggestion computation must be bounded (max time window, max results).

### 12.4 Logging and Audit

- NFR-FE17-LOG-001: Suggestion requests may be logged for product analytics (no PII beyond user id).

### 12.5 Usability

- NFR-FE17-UX-001: UI must clearly explain suggestions are alternatives and may change due to concurrent booking.

---

## 13. Out of Scope

- Geo-distance optimization using real maps APIs.

---

## 14. Dependencies

| Dependency | Type | Notes |
| --- | --- | --- |
| FE02 Schedule & Booking | Internal | Availability source of truth |
| FE05 Branch & Court | Internal | Court types and branch list |
| FE14 Maintenance | Internal | Court maintenance exclusions |

---

## 15. Open Questions

| ID | Question | Owner | Status |
| --- | --- | --- | --- |
| Q-FE17-001 | What is the default search window (e.g., ±2 slots, ±2 hours) and max results N? | Dat | Open |
| Q-FE17-002 | Are cross-branch suggestions allowed by default or opt-in by user? | Dat | Open |

---

## 16. Traceability Matrix

| AC ID | Related FR ID | Related BR ID | Test Case ID | Status |
| --- | --- | --- | --- | --- |
| AC-FE17-001 | FR-FE17-001 | BR-FE17-001 | TC-FE17-001 | Not Started |
| AC-FE17-002 | FR-FE17-001 | BR-FE17-002 | TC-FE17-002 | Not Started |
| AC-FE17-003 | FR-FE17-001 | BR-FE17-002 | TC-FE17-003 | Not Started |
| AC-FE17-004 | FR-FE17-002 | BR-FE17-001 | TC-FE17-004 | Not Started |

Summary:

| Item | Count | Fully Mapped? |
| --- | ---:| --- |
| AC | 4 | Yes |
| FR | 3 | Yes |
| BR | 3 | Yes |
| Test Cases | 4 | Yes |

---

## 17. Review Checklist

- [ ] Suggestion ranking rules are explicit and bounded.
- [ ] Suggestions exclude unavailable slots and revalidate on hold creation.
- [ ] Traceability matrix maps ACs to tests.
