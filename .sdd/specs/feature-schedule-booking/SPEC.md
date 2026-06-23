# SPEC.md - FE02 Schedule & Booking

Version: 0.1.0
Status: DRAFT
Owner: Dat
Last Updated: 2026-06-23
Feature ID: FE02
Feature folder: `.sdd/specs/feature-schedule-booking/`

Business context (short): This feature allows Customers to view availability, place a temporary hold to prevent conflicts, and create a booking draft for payment. It depends on FE01 Authentication, FE05 Branch/Court data, FE08 Pricing rules, and the database tables that store holds and bookings.

---

## 1. Feature Overview

### 1.1 Feature Name

FE02 Schedule & Booking

### 1.2 Business Context

Schedule accuracy and anti-double-booking rules are the core of a booking system. If incorrect, customers may pay for the same slot, staff operations become inconsistent, and revenue reconciliation breaks.

### 1.3 Goal / Outcome

The system will:

- Display availability by branch/court/date with clear slot states.
- Prevent double-booking via a server-side hold mechanism (default 10 minutes).
- Create a booking draft from a valid hold, ready for payment confirmation (handled by FE03).

### 1.4 Scope Level

- [x] Full Spec — core business logic and concurrency risk
- [ ] Standard Spec
- [ ] Light Spec

---

## 2. Actors and Permissions

| Actor | Description | Permission / Responsibility |
| --- | --- | --- |
| Customer | Books courts | View availability; create holds; create booking drafts from holds |
| Guest | Not logged in | Cannot create holds or bookings |
| Staff | Internal operator | May view availability for operations; core staff actions are in FE04 |
| Court Availability Engine | Backend logic | Computes availability from bookings, holds, and court status |
| Database | Storage | Stores `slot_holds`, `bookings`, `booking_slots` |

---

## 3. Preconditions

- PRE-FE02-001: Customer is authenticated (valid access token) for hold/booking endpoints.
- PRE-FE02-002: Branches and courts exist and courts have valid statuses.
- PRE-FE02-003: System settings exist for open/close times, slot length, and hold duration.

---

## 4. Main Flows

### MF-FE02-001: View Availability

1. Customer selects a branch and a date.
2. System returns courts for that branch.
3. Customer selects a court; system returns availability for that court on the date.
4. System marks each slot as `available`, `held`, `confirmed`, or `unavailable` based on:
   - court status (`maintenance`/`inactive` blocks all slots)
   - confirmed bookings overlapping the slot
   - active holds overlapping the slot

### MF-FE02-002: Create Hold (10 minutes)

1. Customer selects a court, date, and time range.
2. System validates:
   - date format and time format
   - not in the past
   - court is `available`
   - no overlapping booking or active hold exists
3. System creates a `slot_holds` record with `expires_at = now + hold_minutes`.
4. System returns `hold_code` and `expires_at`.

### MF-FE02-003: Create Booking Draft from Hold

1. Customer submits `hold_code` and booking inputs (add-ons/voucher selections if applicable).
2. System validates the hold:
   - exists, `status` is active, and not expired
   - belongs to current customer
3. System creates a booking record (`bookings`) and its slots (`booking_slots`) from the held time range.
4. System recalculates totals server-side (pricing/add-ons/vouchers if provided) and stores authoritative totals.
5. System returns booking draft details for the payment step (FE03).

---

## 5. Alternative Flows

| ID | Alternative Flow |
| --- | --- |
| AF-FE02-001 | Viewing availability for a maintenance court returns all slots unavailable. |
| AF-FE02-002 | Hold creation fails due to overlap with an active hold. |
| AF-FE02-003 | Hold creation fails due to overlap with a confirmed booking. |
| AF-FE02-004 | Hold expired before booking draft creation; user must hold again. |
| AF-FE02-005 | Concurrent hold requests for the same slot: only one succeeds. |

---

## 6. Business Rules

- BR-FE02-001: The system must prevent double-booking for the same court/time slot.
- BR-FE02-002: Holds must expire and release availability (default 10 minutes from settings).
- BR-FE02-003: Booking drafts can only be created from valid, unexpired holds.
- BR-FE02-004: Courts in `maintenance` or `inactive` status cannot be held or booked.
- BR-FE02-005: The backend must not trust client-reported totals; it must recalculate totals.
- BR-FE02-006: Availability must reflect both confirmed bookings and active holds.

---

## 7. Functional Requirements

- FR-FE02-001: When a Customer requests court availability for a date, the system shall return slot states derived from bookings, holds, and court status.
- FR-FE02-002: If a requested hold overlaps with a booking or active hold, then the system shall reject the hold creation.
- FR-FE02-003: When a hold is created, the system shall return a unique `hold_code` and an `expires_at` timestamp.
- FR-FE02-004: If a hold is expired, then the system shall not allow booking creation from that hold.
- FR-FE02-005: When creating a booking from a hold, the system shall create `bookings` and `booking_slots` records consistently.
- FR-FE02-006: When creating a booking from a hold, the system shall calculate authoritative totals server-side.

---

## 8. Acceptance Criteria

- AC-FE02-001: Given a Customer selects a branch and date, when viewing the schedule, then only courts from that branch are shown.
- AC-FE02-002: Given a slot has a confirmed booking, when a Customer views availability, then the slot is not selectable.
- AC-FE02-003: Given a slot has an active hold, when another Customer views availability, then the slot is not selectable.
- AC-FE02-004: Given a Customer selects a past date, when attempting to create a hold, then the system rejects the request.
- AC-FE02-005: Given a Customer selects a valid slot, when creating a hold, then the system returns a hold with 10-minute expiry (from settings).
- AC-FE02-006: Given two Customers request a hold for the same slot concurrently, when both requests arrive, then only one hold is created successfully.
- AC-FE02-007: Given a hold expires, when the Customer has not paid, then the hold becomes unusable and the slot is available again.
- AC-FE02-008: Given a court is `maintenance` or `inactive`, when a Customer attempts to hold, then the system rejects before creating a hold.
- AC-FE02-009: Given a valid hold, when the Customer creates a booking draft, then the backend recalculates totals and ignores client totals.

---

## 9. Edge Cases and Error Handling

| ID | Edge Case / Error | Expected System Behavior |
| --- | --- | --- |
| EC-FE02-001 | Overlapping holds due to race conditions | Enforce atomic checks/transactions; return safe conflict error |
| EC-FE02-002 | Hold exists but is expired | Reject booking creation from hold |
| EC-FE02-003 | Court status changes after hold creation | Booking creation must re-check court status and reject if now unavailable |
| EC-FE02-004 | Slot minutes misconfiguration | Fail safely; do not create inconsistent booking slots |
| EC-FE02-005 | Client sends manipulated totals | Ignore and recalculate totals server-side |

---

## 10. Data Requirements

### 10.1 Entities Involved

| Entity | Purpose in this feature |
| --- | --- |
| `settings` | Holds slot_minutes and hold_minutes |
| `branches` | Branch scope for schedule browsing |
| `courts` | Court list and status gating |
| `slot_holds` | Temporary reservation to prevent conflicts |
| `bookings` | Booking draft/confirmed records |
| `booking_slots` | Slot-level booking time ranges |

### 10.2 Data Fields

| Field | Type | Required | Validation / Notes |
| --- | --- | --- | --- |
| `slot_holds.hold_code` | string | Yes | Unique; returned to client |
| `slot_holds.booking_date` | date | Yes | `YYYY-MM-DD` |
| `slot_holds.start_time` | time | Yes | Must be aligned to slot minutes |
| `slot_holds.end_time` | time | Yes | Must be > start_time |
| `slot_holds.expires_at` | datetime | Yes | `now + hold_minutes` |
| `courts.status` | enum | Yes | Blocks holds/bookings when unavailable |
| `bookings.total_amount` | number | Yes | Calculated server-side |

---

## 11. API / Interface Contract

| Method | Endpoint | Actor | Request | Response | Notes |
| --- | --- | --- | --- | --- | --- |
| GET | `/api/courts?branchId=...` | Customer | N/A | `{ success, data }` | Auth required in current backend |
| GET | `/api/courts/:id/availability?date=YYYY-MM-DD` | Customer | N/A | `{ success, availability }` | Availability states derived server-side |
| POST | `/api/bookings/hold` | Customer | `{ courtId, bookingDate, startTime, endTime }` | `{ success, hold }` | Returns `holdCode`, `expiresAt` |
| POST | `/api/bookings/from-hold` | Customer | `{ holdCode, addons?, voucher? }` | `{ success, booking }` | Server recalculates totals |

---

## 12. Non-functional Requirements

### 12.1 Security

- NFR-FE02-SEC-001: Hold and booking endpoints must require authentication.
- NFR-FE02-SEC-002: The backend must not trust client-provided totals or availability state.

### 12.2 Transaction Integrity

- NFR-FE02-TXN-001: Hold creation must be atomic to prevent double holds.
- NFR-FE02-TXN-002: Booking-from-hold must be atomic (booking + slots + totals).

### 12.3 Performance

- NFR-FE02-PERF-001: Availability queries should be responsive for a single court/day view.
- NFR-FE02-PERF-002: Hold creation should be fast enough for interactive UX.

### 12.4 Logging and Audit

- NFR-FE02-LOG-001: Hold creation and booking creation should be logged with actor and timestamps (no sensitive values).

### 12.5 Usability

- NFR-FE02-UX-001: The UI should show clear slot states and countdown for holds.

---

## 13. Out of Scope

- Payment capture and payment gateway (FE03).
- Advanced alternative slot suggestions beyond basic error messaging (FE17).
- Long-term reservations without payment.

---

## 14. Dependencies

| Dependency | Type | Notes |
| --- | --- | --- |
| FE01 Authentication | Internal | Required for hold/booking endpoints |
| FE05 Branch & Court Management | Internal | Courts and statuses drive availability |
| FE08 Pricing Rules | Internal | Totals are recalculated server-side |
| Database (MySQL) | Technical | Uses `slot_holds`, `bookings`, `booking_slots` |

---

## 15. Open Questions

| ID | Question | Owner | Status |
| --- | --- | --- | --- |
| Q-FE02-001 | Do we expose availability to Guests (read-only) or require auth for all availability calls? | Dat | Open |
| Q-FE02-002 | What is the exact slot grid rule (e.g., 60 minutes only, or configurable per branch)? | Dat | Open |

---

## 16. Traceability Matrix

| AC ID | Related FR ID | Related BR ID | Test Case ID | Status |
| --- | --- | --- | --- | --- |
| AC-FE02-001 | FR-FE02-001 | BR-FE02-006 | TC-FE02-001 | Not Started |
| AC-FE02-002 | FR-FE02-001 | BR-FE02-006 | TC-FE02-002 | Not Started |
| AC-FE02-003 | FR-FE02-001 | BR-FE02-006 | TC-FE02-003 | Not Started |
| AC-FE02-004 | FR-FE02-002 | BR-FE02-002 | TC-FE02-004 | Not Started |
| AC-FE02-005 | FR-FE02-003 | BR-FE02-002 | TC-FE02-005 | Not Started |
| AC-FE02-006 | FR-FE02-003 | BR-FE02-001 | TC-FE02-006 | Not Started |
| AC-FE02-007 | FR-FE02-004 | BR-FE02-002 | TC-FE02-007 | Not Started |
| AC-FE02-008 | FR-FE02-002 | BR-FE02-004 | TC-FE02-008 | Not Started |
| AC-FE02-009 | FR-FE02-006 | BR-FE02-005 | TC-FE02-009 | Not Started |

Summary:

| Item | Count | Fully Mapped? |
| --- | ---:| --- |
| AC | 9 | Yes |
| FR | 6 | Yes |
| BR | 6 | Yes |
| Test Cases | 9 | Yes |

---

## 17. Review Checklist

- [ ] Business context reflects double-booking and concurrency risk.
- [ ] Actors/permissions and auth requirements are explicit.
- [ ] Preconditions include settings and court status dependencies.
- [ ] BR/FR/AC/EC IDs follow required format and are unique.
- [ ] API contract aligns with backend routes or marked TBD.
- [ ] Transaction integrity requirements cover hold and booking creation.
- [ ] Traceability matrix maps all ACs to tests.
