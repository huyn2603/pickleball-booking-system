# SPEC.md - FE04 Staff Daily Operation

Version: 0.1.0
Status: DRAFT
Owner: Dat
Last Updated: 2026-06-23
Feature ID: FE04
Feature folder: `.sdd/specs/feature-staff-daily-operation/`

Business context (short): Staff need a daily operational console to run bookings at the venue (dashboard, confirm/cancel, check-in/out, counter payment, stock updates). It depends on FE01 auth, FE02 bookings, and FE03 payment/refund consistency.

---

## 1. Feature Overview

### 1.1 Feature Name

FE04 Staff Daily Operation

### 1.2 Business Context

This feature is critical to real-world venue operations. Incorrect authorization or invalid state transitions can create financial disputes and operational incidents (e.g., staff checking in wrong bookings or cancelling paid bookings incorrectly).

### 1.3 Goal / Outcome

The system will:

- Provide a date-based staff dashboard for bookings.
- Allow staff to confirm/cancel bookings, check customers in/out, and record counter payments.
- Enforce role-based access and branch scope rules.

### 1.4 Scope Level

- [x] Standard Spec — operational feature with authorization and state validations
- [ ] Full Spec
- [ ] Light Spec

---

## 2. Actors and Permissions

| Actor | Description | Permission / Responsibility |
| --- | --- | --- |
| Staff | Operator on site | Can view dashboard; can perform day-of operations on allowed scope |
| Owner/Admin | Oversight | Can access and supervise staff operations |
| Customer | Booking owner | Receives status changes; cannot access staff endpoints |
| Audit Log Store | Database table/system | Records staff actions where required |

---

## 3. Preconditions

- PRE-FE04-001: Staff is authenticated and has role `Staff`/`Owner`/`Admin`.
- PRE-FE04-002: Booking exists and is within staff’s allowed scope (branch scope policy).
- PRE-FE04-003: Booking status supports the requested operation (state transition validation).

---

## 4. Main Flows

### MF-FE04-001: Staff Dashboard

1. Staff requests dashboard for `date` (default today).
2. System validates date format.
3. System returns bookings relevant to staff scope and date.

### MF-FE04-002: Check-in / Check-out

1. Staff selects a booking and triggers check-in.
2. System validates authorization and booking state.
3. System updates booking status and stores actor id + timestamp.
4. Staff triggers check-out; system validates and transitions booking to completed.

### MF-FE04-003: Counter Payment and Confirmation

1. Staff records payment method (`cash` or `bank_transfer`) for a booking.
2. System creates payment record and updates booking/payment status consistently.
3. Staff confirms booking when payment is validated.

---

## 5. Alternative Flows

| ID | Alternative Flow |
| --- | --- |
| AF-FE04-001 | Staff tries to operate on booking outside scope → 403. |
| AF-FE04-002 | Booking already completed/cancelled → operation rejected. |
| AF-FE04-003 | Payment method invalid → 400. |

---

## 6. Business Rules

- BR-FE04-001: Staff endpoints require authentication and staff role.
- BR-FE04-002: Staff must not operate on bookings outside allowed branch scope.
- BR-FE04-003: Booking status transitions must be validated server-side.
- BR-FE04-004: Staff actions must be traceable by actor id and timestamp.

---

## 7. Functional Requirements

- FR-FE04-001: When Staff requests the dashboard, the system shall return bookings for the requested date within staff scope.
- FR-FE04-002: If Staff is not authorized for a booking, then the system shall reject the operation.
- FR-FE04-003: When Staff checks in/out, the system shall update booking status and persist actor metadata.
- FR-FE04-004: When Staff records counter payment, the system shall store payment metadata and update booking state consistently.

---

## 8. Acceptance Criteria

- AC-FE04-001: Given Staff is logged in, when opening dashboard, then only scope-allowed bookings are returned.
- AC-FE04-002: Given a customer arrives, when Staff checks in by booking id, then booking becomes checked-in with actor recorded.
- AC-FE04-003: Given a session ends, when Staff checks out, then booking becomes completed with timestamp recorded.
- AC-FE04-004: Given Staff is out of scope, when attempting any staff action, then the system rejects with 403.

---

## 9. Edge Cases and Error Handling

| ID | Edge Case / Error | Expected System Behavior |
| --- | --- | --- |
| EC-FE04-001 | Check-in on cancelled booking | Reject with safe error |
| EC-FE04-002 | Duplicate check-in | Idempotent or safe rejection; no double transitions |
| EC-FE04-003 | Payment recorded twice | Prevent duplicates or make idempotent by transaction code |

---

## 10. Data Requirements

### 10.1 Entities Involved

| Entity | Purpose in this feature |
| --- | --- |
| `bookings` | Stores booking states and operational timestamps |
| `payment_transactions` | Stores staff counter payment records |
| `audit_logs` | Stores staff action logs (planned/partial) |
| `addon_services` | Stock updates for add-ons |

### 10.2 Data Fields

| Field | Type | Required | Validation / Notes |
| --- | --- | --- | --- |
| `bookings.booking_status` | enum | Yes | Must follow allowed transitions |
| `payment_transactions.method` | enum | Yes | `cash` or `bank_transfer` for counter |
| `addon_services.stock_quantity` | number | Yes | Must not be negative |

---

## 11. API / Interface Contract

| Method | Endpoint | Actor | Request | Response | Notes |
| --- | --- | --- | --- | --- | --- |
| GET | `/api/staff/dashboard` | Staff | `?date=YYYY-MM-DD` | `{ success, bookings }` | Defaults to today |
| POST | `/api/staff/bookings/:id/check-in` | Staff | `{}` | `{ success, booking }` | Role protected |
| POST | `/api/staff/bookings/:id/check-out` | Staff | `{}` | `{ success, booking }` | Role protected |
| POST | `/api/staff/bookings/:id/payment` | Staff | `{ paymentMethod, note? }` | `{ success, booking }` | Counter payment |

---

## 12. Non-functional Requirements

### 12.1 Security

- NFR-FE04-SEC-001: Every staff endpoint must enforce authentication and role checks.
- NFR-FE04-SEC-002: Staff must not access bookings outside scope (branch scope policy).

### 12.2 Transaction Integrity

- NFR-FE04-TXN-001: Payment recording and booking state update must be consistent.

### 12.3 Performance

- NFR-FE04-PERF-001: Dashboard query should return within interactive UX bounds for a single day.

### 12.4 Logging and Audit

- NFR-FE04-LOG-001: Check-in/out and cancel/confirm actions must be traceable to an actor and timestamp.

### 12.5 Usability

- NFR-FE04-UX-001: Staff-facing errors must be clear and actionable.

---

## 13. Out of Scope

- HR scheduling and payroll.
- Multi-branch assignment management UI (unless required in FE12).

---

## 14. Dependencies

| Dependency | Type | Notes |
| --- | --- | --- |
| FE01 Authentication | Internal | Protects staff endpoints |
| FE02 Schedule & Booking | Internal | Provides booking data to operate on |
| FE03 Payment & Refund | Internal | Defines payment/refund states and policy |

---

## 15. Open Questions

| ID | Question | Owner | Status |
| --- | --- | --- | --- |
| Q-FE04-001 | Do we enforce strict branch scoping for Staff (staff.branch_id) in v1 or role-only? | Dat | Open |

---

## 16. Traceability Matrix

| AC ID | Related FR ID | Related BR ID | Test Case ID | Status |
| --- | --- | --- | --- | --- |
| AC-FE04-001 | FR-FE04-001 | BR-FE04-002 | TC-FE04-001 | Not Started |
| AC-FE04-002 | FR-FE04-003 | BR-FE04-003 | TC-FE04-002 | Not Started |
| AC-FE04-003 | FR-FE04-003 | BR-FE04-003 | TC-FE04-003 | Not Started |
| AC-FE04-004 | FR-FE04-002 | BR-FE04-002 | TC-FE04-004 | Not Started |

Summary:

| Item | Count | Fully Mapped? |
| --- | ---:| --- |
| AC | 4 | Yes |
| FR | 4 | Yes |
| BR | 4 | Yes |
| Test Cases | 4 | Yes |

---

## 17. Review Checklist

- [ ] Role and (if applicable) branch scope is explicitly defined.
- [ ] State transitions are listed and testable.
- [ ] API endpoints match the implementation or are marked TBD.
- [ ] Traceability matrix maps ACs to tests.
