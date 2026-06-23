# SPEC.md - FE10 Email Notification

Version: 0.1.0
Status: DRAFT
Owner: Dat
Last Updated: 2026-06-23
Feature ID: FE10
Feature folder: `.sdd/specs/feature-notification/`

Business context (short): Email notifications improve customer experience and operational transparency (OTP, booking confirmation, reminders, cancellations). Email must not become a single point of failure for core flows. It depends on FE01 (OTP) and booking state changes from FE02/FE03.

---

## 1. Feature Overview

### 1.1 Feature Name

FE10 Email Notification

### 1.2 Business Context

Notifications reduce no-shows and support. If notifications leak secrets (OTP/tokens) or block critical workflows, they introduce security and reliability risks.

### 1.3 Goal / Outcome

The system will:

- Generate email notifications for key events (OTP, booking confirmation, reminder, cancellation/refund outcomes).
- Persist email send attempts and results for audit/troubleshooting.
- Retry failures safely without breaking the main business transaction.

### 1.4 Scope Level

- [x] Standard Spec
- [ ] Full Spec
- [ ] Light Spec

---

## 2. Actors and Permissions

| Actor | Description | Permission / Responsibility |
| --- | --- | --- |
| Customer | Recipient | Receives transactional emails |
| System Scheduler | Background job runner | Triggers reminders based on time window |
| SMTP Provider | External service | Delivers email; can fail transiently |
| Audit/Email Logs | Storage | Stores attempts/status without secrets |

---

## 3. Preconditions

- PRE-FE10-001: SMTP config exists for production environments; in dev it may be stubbed.
- PRE-FE10-002: Templates exist for each event type (even minimal).
- PRE-FE10-003: Core business transactions do not depend on email success.

---

## 4. Main Flows

### MF-FE10-001: Send Booking Confirmation Email

1. Booking transitions to `confirmed` (FE03).
2. System creates a notification job with booking summary payload.
3. System attempts to send email via SMTP.
4. System records result in `email_logs` (success/failure + error code).

### MF-FE10-002: Send OTP Email

1. Customer requests OTP (FE01).
2. System generates OTP (stored hashed) and sends the raw OTP via email only.
3. System records send attempt and outcome.

### MF-FE10-003: Reminder Email Job

1. Scheduler selects bookings starting soon (policy window).
2. System sends reminder emails for eligible bookings and records outcomes.

---

## 5. Alternative Flows

| ID | Alternative Flow |
| --- | --- |
| AF-FE10-001 | SMTP unavailable → record failure and continue business flow. |
| AF-FE10-002 | Retry exhausted → mark as permanently failed; no further attempts. |
| AF-FE10-003 | Booking cancelled/completed before reminder runs → do not send. |

---

## 6. Business Rules

- BR-FE10-001: Email sending must not block booking confirmation or OTP creation.
- BR-FE10-002: Raw OTP/token values must never be stored in logs or database.
- BR-FE10-003: Reminder emails must not be sent for cancelled or completed bookings.
- BR-FE10-004: Retries must be bounded to prevent spam.

---

## 7. Functional Requirements

- FR-FE10-001: When a notification event is triggered, the system shall create an email send attempt record.
- FR-FE10-002: If sending fails, then the system shall retry according to a bounded retry policy.
- FR-FE10-003: When sending OTP emails, the system shall only store OTP hashes and never persist raw OTP.
- FR-FE10-004: When reminder job runs, the system shall send only to eligible bookings and record outcomes.

---

## 8. Acceptance Criteria

- AC-FE10-001: Given a booking becomes confirmed, when SMTP is configured, then a confirmation email is sent with booking summary fields.
- AC-FE10-002: Given SMTP fails, when sending confirmation email, then the booking flow remains successful and email failure is logged.
- AC-FE10-003: Given an OTP request is made, when email is sent, then raw OTP is not stored and only the hash exists in DB.
- AC-FE10-004: Given a reminder job runs, when a booking is cancelled, then no reminder is sent for that booking.

---

## 9. Edge Cases and Error Handling

| ID | Edge Case / Error | Expected System Behavior |
| --- | --- | --- |
| EC-FE10-001 | Duplicate event triggers | Deduplicate by event key if possible; avoid duplicate sends |
| EC-FE10-002 | Retry storms | Apply backoff and max retry count |
| EC-FE10-003 | Email address invalid | Mark as failed safely without exposing sensitive data |

---

## 10. Data Requirements

### 10.1 Entities Involved

| Entity | Purpose in this feature |
| --- | --- |
| `email_logs` | Record event type, recipient, payload summary, status, attempts |
| `users` | Provides email addresses |
| `bookings` | Provides booking summary fields |
| `password_reset_otps` | OTP records (hash-only) |

### 10.2 Data Fields

| Field | Type | Required | Validation / Notes |
| --- | --- | --- | --- |
| `email_logs.event_type` | string | Yes | e.g., OTP, BOOKING_CONFIRMED, REMINDER |
| `email_logs.recipient` | string | Yes | Must be a valid email format |
| `email_logs.status` | enum | Yes | queued/sent/failed |
| `email_logs.retry_count` | number | Yes | Bounded |

---

## 11. API / Interface Contract

| Method | Endpoint | Actor | Request | Response | Notes |
| --- | --- | --- | --- | --- | --- |
| POST | `/api/notifications/test-email` | Admin | `{ to, template }` | `{ success }` | Optional admin-only diagnostics |

---

## 12. Non-functional Requirements

### 12.1 Security

- NFR-FE10-SEC-001: No secrets/OTPs/tokens may be stored or logged in raw form.

### 12.2 Transaction Integrity

- NFR-FE10-TXN-001: Notification failures must not roll back booking/payment/auth transactions.

### 12.3 Performance

- NFR-FE10-PERF-001: Email sending should be asynchronous where possible to keep API latency low.

### 12.4 Logging and Audit

- NFR-FE10-LOG-001: Every send attempt must be logged with status and error metadata (no secrets).

### 12.5 Usability

- NFR-FE10-UX-001: Email content must include minimal operational fields (branch, court, date/time, booking code).

---

## 13. Out of Scope

- SMS/WhatsApp notifications.
- Marketing newsletters and segmentation.

---

## 14. Dependencies

| Dependency | Type | Notes |
| --- | --- | --- |
| SMTP Provider | Technical | Can be mocked in dev |
| FE01 Authentication | Internal | OTP emails |
| FE03 Payment & Refund | Internal | Booking confirmation/cancellation events |

---

## 15. Open Questions

| ID | Question | Owner | Status |
| --- | --- | --- | --- |
| Q-FE10-001 | What is the reminder policy window (e.g., 2 hours before start) for Phase 1? | Dat | Open |
| Q-FE10-002 | Do we need deduplication keys per event to prevent duplicate sends? | Dat | Open |

---

## 16. Traceability Matrix

| AC ID | Related FR ID | Related BR ID | Test Case ID | Status |
| --- | --- | --- | --- | --- |
| AC-FE10-001 | FR-FE10-001 | BR-FE10-001 | TC-FE10-001 | Not Started |
| AC-FE10-002 | FR-FE10-002 | BR-FE10-001 | TC-FE10-002 | Not Started |
| AC-FE10-003 | FR-FE10-003 | BR-FE10-002 | TC-FE10-003 | Not Started |
| AC-FE10-004 | FR-FE10-004 | BR-FE10-003 | TC-FE10-004 | Not Started |

Summary:

| Item | Count | Fully Mapped? |
| --- | ---:| --- |
| AC | 4 | Yes |
| FR | 4 | Yes |
| BR | 4 | Yes |
| Test Cases | 4 | Yes |

---

## 17. Review Checklist

- [ ] Email failures do not break core business flows.
- [ ] No secret leakage (OTP/token) in logs or storage.
- [ ] Retry policy is bounded and documented.
- [ ] Traceability matrix maps ACs to tests.
