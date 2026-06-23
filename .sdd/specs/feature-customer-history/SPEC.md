# SPEC.md - FE09 Customer History

Version: 0.1.0
Status: DRAFT
Owner: Dat
Last Updated: 2026-06-23
Feature ID: FE09
Feature folder: `.sdd/specs/feature-customer-history/`

Business context (short): Customers need a transparent history of their bookings and financial outcomes (payments/refunds/add-ons). It depends on FE02 bookings, FE03 payments/refunds, and must strictly enforce “self-only” data access.

---

## 1. Feature Overview

### 1.1 Feature Name

FE09 Customer History

### 1.2 Business Context

History is essential for trust and support. Incorrect access control exposes other customers’ transactions. Incorrect aggregation misleads customers and creates support burden.

### 1.3 Goal / Outcome

The system will:

- Provide a paginated list of a customer’s bookings (most recent first).
- Provide booking details including add-ons, payments, and refunds where applicable.
- Support filtering by date range and status.

### 1.4 Scope Level

- [x] Standard Spec
- [ ] Full Spec
- [ ] Light Spec

---

## 2. Actors and Permissions

| Actor | Description | Permission / Responsibility |
| --- | --- | --- |
| Customer | Booking owner | Can only view their own history |
| Staff/Owner/Admin | Support roles | May view customer history for support (policy-defined) |
| Database | Storage | Provides authoritative transaction records |

---

## 3. Preconditions

- PRE-FE09-001: Customer is authenticated (FE01).
- PRE-FE09-002: Booking/payment/refund tables contain records linked by `user_id`.

---

## 4. Main Flows

### MF-FE09-001: View History List

1. Customer opens history page.
2. System queries bookings for `user_id` sorted by newest first.
3. System returns list with summary fields (date, court, status, total).

### MF-FE09-002: View Booking Detail

1. Customer selects a booking.
2. System validates the booking belongs to the current user.
3. System returns booking slots, add-ons, payment transactions, and refunds (safe fields).

---

## 5. Alternative Flows

| ID | Alternative Flow |
| --- | --- |
| AF-FE09-001 | Customer requests a booking not owned by them → 403/404. |
| AF-FE09-002 | Booking has disabled add-ons | Still show historical line items. |

---

## 6. Business Rules

- BR-FE09-001: Customers can only access their own booking and transaction history.
- BR-FE09-002: Historical records must remain visible even if related catalog items are disabled.
- BR-FE09-003: History must reflect authoritative booking/payment/refund state.

---

## 7. Functional Requirements

- FR-FE09-001: When a Customer requests history, the system shall return bookings for that user only.
- FR-FE09-002: When requesting booking detail, the system shall include add-ons and financial records linked to the booking.
- FR-FE09-003: If filters are provided, then the system shall apply them safely and validate date ranges.

---

## 8. Acceptance Criteria

- AC-FE09-001: Given a Customer is logged in, when they view history, then bookings are listed newest-first.
- AC-FE09-002: Given a Customer opens a booking detail, when the booking is theirs, then the detail shows court/time/add-ons/payment/refund.
- AC-FE09-003: Given a Customer filters by month/status, when applying filters, then the list shows only matching bookings.
- AC-FE09-004: Given a Customer requests another user’s booking, when calling detail endpoint, then access is denied safely.

---

## 9. Edge Cases and Error Handling

| ID | Edge Case / Error | Expected System Behavior |
| --- | --- | --- |
| EC-FE09-001 | Soft-deleted booking | Preserve history view (if policy allows) |
| EC-FE09-002 | Multiple payment attempts | Show final successful payment and relevant failures as needed |
| EC-FE09-003 | Refund pending/manual | Show correct status and next steps |

---

## 10. Data Requirements

### 10.1 Entities Involved

| Entity | Purpose in this feature |
| --- | --- |
| `bookings` | Primary source of customer history list |
| `booking_slots` | Detailed time ranges |
| `booking_addons` | Add-on line items |
| `payment_transactions` | Payment records |
| `refunds` | Refund records |

### 10.2 Data Fields

| Field | Type | Required | Validation / Notes |
| --- | --- | --- | --- |
| `bookings.user_id` | id | Yes | Must match current user |
| `bookings.booking_status` | enum | Yes | Display-safe |
| `payment_transactions.amount` | number | No | Display-safe summary |
| `refunds.amount` | number | No | Display-safe summary |

---

## 11. API / Interface Contract

| Method | Endpoint | Actor | Request | Response | Notes |
| --- | --- | --- | --- | --- | --- |
| GET | `/api/me/bookings` | Customer | `?page&size&status&from&to` | `{ success, items }` | Self-only |
| GET | `/api/me/bookings/:id` | Customer | N/A | `{ success, booking }` | Includes add-ons/payment/refund |

---

## 12. Non-functional Requirements

### 12.1 Security

- NFR-FE09-SEC-001: Enforce strict user scoping; never allow IDOR access.

### 12.2 Transaction Integrity

- NFR-FE09-TXN-001: History must reflect consistent final states from booking/payment/refund features.

### 12.3 Performance

- NFR-FE09-PERF-001: History list must be paginated and indexed by user and date.

### 12.4 Logging and Audit

- NFR-FE09-LOG-001: Access denials should be logged for security monitoring.

### 12.5 Usability

- NFR-FE09-UX-001: History filters must be simple and predictable (month/status).

---

## 13. Out of Scope

- Public profile and loyalty points.
- Customer support ticketing system.

---

## 14. Dependencies

| Dependency | Type | Notes |
| --- | --- | --- |
| FE01 Authentication | Internal | Required for self-only endpoints |
| FE02 Schedule & Booking | Internal | Booking data |
| FE03 Payment & Refund | Internal | Payment/refund data |

---

## 15. Open Questions

| ID | Question | Owner | Status |
| --- | --- | --- | --- |
| Q-FE09-001 | Do Staff/Owner/Admin have a “view customer history” support endpoint in v1? | Dat | Open |

---

## 16. Traceability Matrix

| AC ID | Related FR ID | Related BR ID | Test Case ID | Status |
| --- | --- | --- | --- | --- |
| AC-FE09-001 | FR-FE09-001 | BR-FE09-001 | TC-FE09-001 | Not Started |
| AC-FE09-002 | FR-FE09-002 | BR-FE09-003 | TC-FE09-002 | Not Started |
| AC-FE09-003 | FR-FE09-003 | BR-FE09-003 | TC-FE09-003 | Not Started |
| AC-FE09-004 | FR-FE09-001 | BR-FE09-001 | TC-FE09-004 | Not Started |

Summary:

| Item | Count | Fully Mapped? |
| --- | ---:| --- |
| AC | 4 | Yes |
| FR | 3 | Yes |
| BR | 3 | Yes |
| Test Cases | 4 | Yes |

---

## 17. Review Checklist

- [ ] Self-only access control is explicitly enforced and tested.
- [ ] Pagination and filtering rules are defined.
- [ ] Traceability matrix maps ACs to tests.
