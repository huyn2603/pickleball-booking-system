# SPEC.md - FE03 Payment & Refund

Version: 0.1.0
Status: DRAFT
Owner: Dat
Last Updated: 2026-06-23
Feature ID: FE03
Feature folder: `.sdd/specs/feature-payment-refund/`

Business context (short): This feature records payments, confirms bookings, and processes cancellations/refunds using clear policy windows. It depends on FE02 (booking drafts/holds), FE01 (auth), and the financial tables (`payment_transactions`, `refunds`) for audit and reporting.

---

## 1. Feature Overview

### 1.1 Feature Name

FE03 Payment & Refund

### 1.2 Business Context

Payments and refunds are directly tied to revenue recognition and customer trust. Incorrect implementations can cause mismatched booking states, incorrect refunds, fraud, and unreconcilable financial data.

### 1.3 Goal / Outcome

The system will:

- Record payment attempts and outcomes for bookings.
- Confirm bookings after successful payment (including staff counter payment in MVP).
- Cancel bookings and apply refund policy windows consistently.
- Preserve a complete audit trail for payments and refunds.

### 1.4 Scope Level

- [x] Full Spec — financial correctness and state integrity risk
- [ ] Standard Spec
- [ ] Light Spec

---

## 2. Actors and Permissions

| Actor | Description | Permission / Responsibility |
| --- | --- | --- |
| Customer | Pays and cancels bookings | Can view payment status; can request cancellation per policy |
| Staff | Counter operations | Can record counter payment, confirm/cancel bookings (role-protected) |
| Owner/Admin | Oversight | Can review and override exceptional refunds (policy-defined) |
| Payment Provider / Webhook | External system | May notify payment completion; must be idempotent |
| Database | Storage | Stores `payment_transactions`, `refunds`, and booking states |

---

## 3. Preconditions

- PRE-FE03-001: A booking draft exists (typically created from a valid hold in FE02).
- PRE-FE03-002: Payment methods configured for MVP (cash/bank transfer) or webhook flow if enabled.
- PRE-FE03-003: Refund policy windows are defined and consistent with project rules.

---

## 4. Main Flows

### MF-FE03-001: Record Payment and Confirm Booking

1. Customer (or Staff at counter) initiates payment confirmation for a booking.
2. System recalculates authoritative totals server-side.
3. System creates a `payment_transactions` record with:
   - booking reference
   - amount
   - method
   - status (`paid`/`failed`)
4. If payment is successful, system updates booking state to `confirmed` and marks any linked hold as converted.
5. System returns updated booking status to client.

### MF-FE03-002: Cancel Booking and Apply Refund Policy

1. Customer requests cancellation (or Staff cancels as operational action).
2. System validates booking state (cannot auto-cancel after check-in).
3. System computes refund based on time window before start:
   - >= 24h: 100%
   - 2–24h: 50%
   - < 2h: manual/exception (no automatic refund)
4. System updates booking to `cancelled` and creates a `refunds` record with amount and reason.
5. System returns outcome (refund amount, fee amount, next steps).

---

## 5. Alternative Flows

| ID | Alternative Flow |
| --- | --- |
| AF-FE03-001 | Payment fails: transaction stored as failed; booking remains unconfirmed. |
| AF-FE03-002 | Payment webhook arrives twice: second event is ignored (idempotent). |
| AF-FE03-003 | Cancellation requested after check-in: automatic cancellation is rejected. |
| AF-FE03-004 | Refund requires manual approval (<2h window): system records pending/manual action. |

---

## 6. Business Rules

- BR-FE03-001: A `confirmed` booking must have at least one successful payment transaction linked.
- BR-FE03-002: Payment and booking state transitions must be consistent and not partially applied.
- BR-FE03-003: Refund policy windows must be applied deterministically based on booking start time.
- BR-FE03-004: Financial history must be preserved; failed payments and refunds are not deleted.
- BR-FE03-005: No automatic cancellation is allowed after check-in (staff intervention required).
- BR-FE03-006: Backend totals are authoritative; client totals are ignored.

---

## 7. Functional Requirements

- FR-FE03-001: When a payment is recorded, the system shall create a `payment_transactions` record with method, amount, and status.
- FR-FE03-002: If payment succeeds, then the system shall transition the booking to `confirmed`.
- FR-FE03-003: If payment fails, then the system shall keep the booking unconfirmed and persist the failed transaction.
- FR-FE03-004: When a cancellation is requested, the system shall compute refund amount from policy windows and persist a `refunds` record.
- FR-FE03-005: If a booking is checked-in, then the system shall reject automatic cancellation.
- FR-FE03-006: When processing payment/refund, the system shall use transactional integrity to prevent partial updates.

---

## 8. Acceptance Criteria

- AC-FE03-001: Given a valid booking draft, when payment succeeds, then booking becomes `confirmed` and payment transaction is stored.
- AC-FE03-002: Given Staff records counter payment, when confirmed, then payment method, amount, actor, and timestamp are stored.
- AC-FE03-003: Given payment fails, when the system records the attempt, then transaction is stored as failed and booking remains unconfirmed.
- AC-FE03-004: Given backend totals differ from client totals, when confirming payment, then backend totals are used as the source of truth.
- AC-FE03-005: Given a booking is cancelled >=24h before start, when cancellation completes, then refund is 100%.
- AC-FE03-006: Given a booking is cancelled 2–24h before start, when cancellation completes, then refund is 50% and fee is recorded.
- AC-FE03-007: Given a booking is cancelled <2h before start, when cancellation requested, then no automatic refund is executed and manual handling is required.
- AC-FE03-008: Given a booking is checked-in, when cancellation requested, then automatic cancellation is rejected.

---

## 9. Edge Cases and Error Handling

| ID | Edge Case / Error | Expected System Behavior |
| --- | --- | --- |
| EC-FE03-001 | Duplicate webhook/payment events | Idempotent handling; no duplicate transactions |
| EC-FE03-002 | Payment succeeds but booking update fails | Transactional behavior or compensating action to keep consistency |
| EC-FE03-003 | Partial refunds | Preserve net/gross/refund breakdown for reporting |
| EC-FE03-004 | Cancellation after start time | Reject or require staff approval (policy) |

---

## 10. Data Requirements

### 10.1 Entities Involved

| Entity | Purpose in this feature |
| --- | --- |
| `bookings` | Booking states and totals |
| `payment_transactions` | Payment audit trail |
| `refunds` | Refund audit trail |
| `slot_holds` | Hold conversion status (if linked) |
| `audit_logs` | Staff actions and policy exceptions |

### 10.2 Data Fields

| Field | Type | Required | Validation / Notes |
| --- | --- | --- | --- |
| `payment_transactions.transaction_code` | string | Yes | Unique reference for idempotency |
| `payment_transactions.amount` | number | Yes | Must match server totals |
| `payment_transactions.method` | enum | Yes | `cash`, `bank_transfer`, provider types |
| `refunds.amount` | number | Yes | Derived from policy windows |
| `refunds.reason` | string | No | Required for staff-initiated/refused cases |

---

## 11. API / Interface Contract

| Method | Endpoint | Actor | Request | Response | Notes |
| --- | --- | --- | --- | --- | --- |
| GET | `/api/bookings/payment-status/:holdCode` | Customer | N/A | `{ success, status }` | Used by checkout UX |
| POST | `/api/staff/bookings/:id/payment` | Staff | `{ paymentMethod, note? }` | `{ success, booking }` | Counter payment |
| POST | `/api/staff/bookings/:id/confirm` | Staff | `{}` | `{ success, booking }` | Confirmation action |
| POST | `/api/staff/bookings/:id/cancel` | Staff | `{ cancelReason? }` | `{ success, booking }` | Cancellation action |
| POST | `/api/bookings/vietqr/webhook` | Provider | `{ ... }` | `{ success }` | Must be idempotent |

---

## 12. Non-functional Requirements

### 12.1 Security

- NFR-FE03-SEC-001: Only authorized roles may confirm/cancel and record payments.
- NFR-FE03-SEC-002: Do not log sensitive payment identifiers beyond metadata needed for reconciliation.

### 12.2 Transaction Integrity

- NFR-FE03-TXN-001: Payment confirmation must update payment + booking state atomically.
- NFR-FE03-TXN-002: Refund creation must update refund + booking state atomically.

### 12.3 Performance

- NFR-FE03-PERF-001: Confirmation/cancellation endpoints should be responsive for staff operations.

### 12.4 Logging and Audit

- NFR-FE03-LOG-001: Record staff actor id and timestamps for payment/cancel/refund decisions.

### 12.5 Usability

- NFR-FE03-UX-001: Cancellation outcomes must be clearly communicated (refund amount, fee, manual requirement).

---

## 13. Out of Scope

- Production gateway integrations beyond MVP.
- Chargeback and dispute management.
- Automated customer notifications (owned by FE10).

---

## 14. Dependencies

| Dependency | Type | Notes |
| --- | --- | --- |
| FE02 Schedule & Booking | Internal | Provides booking drafts and holds |
| FE01 Authentication | Internal | Protects payment/cancel endpoints |
| Database (MySQL) | Technical | `payment_transactions`, `refunds`, `bookings` |
| FE07 Reporting | Internal | Uses payment/refund data for metrics |

---

## 15. Open Questions

| ID | Question | Owner | Status |
| --- | --- | --- | --- |
| Q-FE03-001 | Should refunds be fully automatic or require staff approval for all cases? | Dat | Open |
| Q-FE03-002 | Which booking statuses are eligible for cancellation by customer vs staff only? | Dat | Open |

---

## 16. Traceability Matrix

| AC ID | Related FR ID | Related BR ID | Test Case ID | Status |
| --- | --- | --- | --- | --- |
| AC-FE03-001 | FR-FE03-001 | BR-FE03-001 | TC-FE03-001 | Not Started |
| AC-FE03-002 | FR-FE03-001 | BR-FE03-002 | TC-FE03-002 | Not Started |
| AC-FE03-003 | FR-FE03-003 | BR-FE03-004 | TC-FE03-003 | Not Started |
| AC-FE03-004 | FR-FE03-001 | BR-FE03-006 | TC-FE03-004 | Not Started |
| AC-FE03-005 | FR-FE03-004 | BR-FE03-003 | TC-FE03-005 | Not Started |
| AC-FE03-006 | FR-FE03-004 | BR-FE03-003 | TC-FE03-006 | Not Started |
| AC-FE03-007 | FR-FE03-004 | BR-FE03-003 | TC-FE03-007 | Not Started |
| AC-FE03-008 | FR-FE03-005 | BR-FE03-005 | TC-FE03-008 | Not Started |

Summary:

| Item | Count | Fully Mapped? |
| --- | ---:| --- |
| AC | 8 | Yes |
| FR | 6 | Yes |
| BR | 6 | Yes |
| Test Cases | 8 | Yes |

---

## 17. Review Checklist

- [ ] Refund policy windows are explicit and testable.
- [ ] Payment/refund state transitions are consistent and atomic.
- [ ] Role-based authorization is clearly defined.
- [ ] Financial history preservation is enforced.
- [ ] Traceability matrix maps all ACs to tests.
