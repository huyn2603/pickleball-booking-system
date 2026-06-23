# SPEC.md - FE13 Voucher

Version: 0.1.0
Status: DRAFT
Owner: Dat
Last Updated: 2026-06-23
Feature ID: FE13
Feature folder: `.sdd/specs/feature-voucher/`

Business context (short): Vouchers/discount codes are applied during checkout to influence conversion while maintaining revenue controls. It depends on FE02/FE03 totals and must be enforced server-side to prevent abuse.

---

## 1. Feature Overview

### 1.1 Feature Name

FE13 Voucher

### 1.2 Business Context

Discount logic is a common fraud vector. Wrong validation can cause revenue leakage, inconsistent refunds, and disputes.

### 1.3 Goal / Outcome

The system will:

- Validate voucher codes server-side (active, not expired, remaining usage).
- Compute discount amount and store it on the booking for later reconciliation and refunds.
- Prevent invalid or expired vouchers from being applied.

### 1.4 Scope Level

- [x] Standard Spec
- [ ] Full Spec
- [ ] Light Spec

---

## 2. Actors and Permissions

| Actor | Description | Permission / Responsibility |
| --- | --- | --- |
| Customer | Applies voucher | Can apply a voucher during booking/payment |
| Owner/Admin | Manages vouchers | Can create/enable/disable voucher codes |
| Pricing/Checkout Engine | Backend logic | Calculates discount and final totals server-side |

---

## 3. Preconditions

- PRE-FE13-001: Customer is authenticated (for applying voucher to a booking).
- PRE-FE13-002: Voucher catalog exists (table/schema for vouchers).
- PRE-FE13-003: Booking totals are calculated server-side (FE02/FE03).

---

## 4. Main Flows

### MF-FE13-001: Apply Voucher During Checkout

1. Customer enters voucher code.
2. System validates the voucher (active, date validity, remaining uses, scope rules).
3. System computes discount and recalculates booking totals.
4. System stores applied voucher and discount amounts linked to booking.

### MF-FE13-002: Voucher Management

1. Owner/Admin creates or updates voucher (code, type, value, expiry, limits).
2. System validates uniqueness and constraints.
3. System persists and returns the voucher.

---

## 5. Alternative Flows

| ID | Alternative Flow |
| --- | --- |
| AF-FE13-001 | Voucher expired or inactive → reject. |
| AF-FE13-002 | Voucher usage exhausted → reject. |
| AF-FE13-003 | Voucher not eligible for the selected branch/court → reject. |

---

## 6. Business Rules

- BR-FE13-001: Voucher validation must be enforced server-side.
- BR-FE13-002: Voucher usage limits must be enforced to prevent overuse.
- BR-FE13-003: Discount must be persisted on booking for reconciliation and refunds.
- BR-FE13-004: Vouchers must not be applied retroactively to confirmed bookings unless explicitly allowed.

---

## 7. Functional Requirements

- FR-FE13-001: When a voucher code is submitted, the system shall validate eligibility and return discount outcome.
- FR-FE13-002: If voucher is invalid/expired/exhausted, then the system shall reject without modifying booking totals.
- FR-FE13-003: When a voucher is applied successfully, the system shall store voucher reference and discount amount on the booking.

---

## 8. Acceptance Criteria

- AC-FE13-001: Given a valid voucher, when applied, then backend calculates discount and updates totals.
- AC-FE13-002: Given an expired or exhausted voucher, when applied, then backend rejects and totals remain unchanged.
- AC-FE13-003: Given a booking is later cancelled/refunded, when computing refund, then applied discount is preserved for reconciliation.

---

## 9. Edge Cases and Error Handling

| ID | Edge Case / Error | Expected System Behavior |
| --- | --- | --- |
| EC-FE13-001 | Voucher stacking | Reject unless explicit rule allows stacking |
| EC-FE13-002 | Race condition on last remaining use | Enforce atomic decrement or conflict rejection |
| EC-FE13-003 | Booking total below zero after discount | Clamp to minimum zero and record applied amount safely |

---

## 10. Data Requirements

### 10.1 Entities Involved

| Entity | Purpose in this feature |
| --- | --- |
| `vouchers` | Stores voucher definitions and limits |
| `bookings` | Stores applied voucher and discount amount |
| `voucher_usages` | Tracks per-user or global usage (if used) |

### 10.2 Data Fields

| Field | Type | Required | Validation / Notes |
| --- | --- | --- | --- |
| `vouchers.code` | string | Yes | Unique, case-insensitive policy TBD |
| `vouchers.valid_from` | date | No | If null, always valid from creation |
| `vouchers.valid_to` | date | No | If null, no expiry |
| `vouchers.max_uses` | number | No | If null, unlimited |
| `bookings.discount_amount` | number | No | Stored for reconciliation |

---

## 11. API / Interface Contract

| Method | Endpoint | Actor | Request | Response | Notes |
| --- | --- | --- | --- | --- | --- |
| POST | `/api/bookings/:id/apply-voucher` | Customer | `{ code }` | `{ success, booking }` | Recalculates totals |
| GET | `/api/admin/vouchers` | Owner/Admin | `?active` | `{ success, items }` | Management list |
| POST | `/api/admin/vouchers` | Owner/Admin | `{ ... }` | `{ success, voucher }` | Create |
| PATCH | `/api/admin/vouchers/:id` | Owner/Admin | `{ ... }` | `{ success, voucher }` | Update |

---

## 12. Non-functional Requirements

### 12.1 Security

- NFR-FE13-SEC-001: Prevent voucher abuse by validating server-side and limiting attempts.

### 12.2 Transaction Integrity

- NFR-FE13-TXN-001: Applying voucher must update booking totals and usage tracking consistently.

### 12.3 Performance

- NFR-FE13-PERF-001: Voucher validation must be fast for checkout UX.

### 12.4 Logging and Audit

- NFR-FE13-LOG-001: Voucher application outcomes should be logged for fraud monitoring (no secrets).

### 12.5 Usability

- NFR-FE13-UX-001: Error messaging must indicate voucher invalid/expired without leaking internal rule data.

---

## 13. Out of Scope

- Affiliate/referral attribution.
- Complex promotion stacking engines.

---

## 14. Dependencies

| Dependency | Type | Notes |
| --- | --- | --- |
| FE02 Schedule & Booking | Internal | Applies voucher to booking draft/totals |
| FE03 Payment & Refund | Internal | Refund reconciliation requires stored discount |
| Database (MySQL) | Technical | Voucher tables (if present) |

---

## 15. Open Questions

| ID | Question | Owner | Status |
| --- | --- | --- | --- |
| Q-FE13-001 | Are vouchers global or branch-specific in Phase 1? | Dat | Open |
| Q-FE13-002 | Can vouchers stack with other promotions or only one voucher per booking? | Dat | Open |

---

## 16. Traceability Matrix

| AC ID | Related FR ID | Related BR ID | Test Case ID | Status |
| --- | --- | --- | --- | --- |
| AC-FE13-001 | FR-FE13-001 | BR-FE13-001 | TC-FE13-001 | Not Started |
| AC-FE13-002 | FR-FE13-002 | BR-FE13-002 | TC-FE13-002 | Not Started |
| AC-FE13-003 | FR-FE13-003 | BR-FE13-003 | TC-FE13-003 | Not Started |

Summary:

| Item | Count | Fully Mapped? |
| --- | ---:| --- |
| AC | 3 | Yes |
| FR | 3 | Yes |
| BR | 4 | Yes |
| Test Cases | 3 | Yes |

---

## 17. Review Checklist

- [ ] Voucher validation rules are explicit and server-side.
- [ ] Usage tracking and race conditions are addressed.
- [ ] Discount persistence supports refunds and reporting.
- [ ] Traceability matrix maps ACs to tests.
