# Project Specification — Pickleball Court Booking System

Version: 0.1.0
Status: DRAFT
Owner: Dat
Last Updated: 2026-06-23

## 1. Purpose

This document is the single high-level specification for the whole project. It defines the domain boundaries, actors, core workflows, shared rules, and non-functional expectations.

Feature-level details live in `.sdd/specs/feature-*/SPEC.md`. If there is any conflict, the feature `SPEC.md` is the source of truth for that feature, while this file defines project-wide constraints and consistency rules.

## 2. Business Context

The system supports a multi-branch pickleball venue operation in Hà Nội:

- Customers book courts online by branch, date, court, and time slots.
- The system prevents double-booking using slot holds.
- Staff operate daily bookings: confirm payments at the counter, check-in, check-out, cancel, and handle refunds.
- Owners/Admin configure operational data: branches, courts, pricing rules, add-ons, vouchers, and reporting.

## 3. Scope (Project-Level)

### In Scope (MVP / Phase 1)

- Gmail-only registration/login for customers.
- Schedule viewing, slot hold (default 10 minutes), booking creation.
- Payment recording (including staff counter payment) and booking confirmation.
- Cancellation and refund policy windows.
- Staff daily operation endpoints (dashboard, confirm/cancel, check-in/out, payment record, stock updates).
- Operational configuration (courts/branches basics, pricing rules, add-ons, vouchers).
- Customer history and feedback (phase-dependent).
- Email notifications (OTP and operational emails) with safe failure behavior if SMTP is missing.
- Basic reporting and advanced dashboards (phase-dependent).

### Out of Scope (Phase 1)

- Tournament/league management.
- Multi-tenant franchise across multiple cities/provinces.
- Storing customer card details.
- MFA/SSO/OAuth (unless explicitly added later).
- Deep BI platform integrations.

## 4. Actors and Permissions

| Actor | Description | Core Permissions |
| --- | --- | --- |
| Guest | Not logged in | View public pages, register/login |
| Customer | Books courts | View schedule, hold slot, book, pay, cancel per policy, view history, submit feedback |
| Staff | Operates bookings in branch scope | View daily dashboard, confirm/cancel, record payment, check-in/out, manage add-on stock |
| Owner | Manages operations | Configure branches/courts/pricing/add-ons/vouchers, view reports/dashboards |
| Admin | System administrator | Full access to configuration and internal account management |

Project-wide authorization rules:

- Every protected API must require authentication and enforce role-based access.
- Never trust frontend enforcement as security.
- Staff/Owner/Admin actions must be auditable (at least with metadata).

## 5. Core Workflows

### 5.1 Booking Workflow (Customer)

1. Customer logs in (Gmail-only in v1).
2. Customer selects branch and date.
3. Customer views court availability by time slots.
4. Customer selects slot(s) and optional add-ons/voucher.
5. System validates availability and creates a slot hold (default 10 minutes).
6. Customer pays (or Staff records payment at counter).
7. System confirms booking and persists payment transaction.
8. Staff checks in/out and finalizes booking status.

### 5.2 Cancellation / Refund Workflow

1. Customer requests cancellation for a confirmed booking.
2. System evaluates refund policy based on time before start.
3. System updates booking status and creates refund record as applicable.
4. Staff/Owner may handle edge cases (late cancellation, special cases).

### 5.3 Daily Staff Workflow

1. Staff logs in.
2. Staff opens dashboard for today (or selected date).
3. Staff confirms pending bookings after payment verification.
4. Staff check-in customers on arrival and check-out when session ends.
5. Staff records counter payments and updates add-on stock.

## 6. Shared Business Rules (Project-Level)

These rules must be consistent across all features:

- BR-PJ-001: The system must prevent double-booking of the same court/time slot.
- BR-PJ-002: Slot holds must expire (default 10 minutes) and release availability.
- BR-PJ-003: Bookings cannot be created for past time slots.
- BR-PJ-004: Court status `maintenance` or `inactive` must block new holds/bookings.
- BR-PJ-005: Booking totals must be calculated server-side; client totals are not trusted.
- BR-PJ-006: Auth responses must never include password or password hash.
- BR-PJ-007: Error responses for auth flows must avoid user enumeration where possible.

## 7. Data Model Overview

Authoritative schema reference: `mysql-workbench-schema.sql`.

Key entities:

- Settings: open/close time, slot length, hold minutes.
- Branches, Courts: operational structure, court status.
- Price Rules: time-based pricing rules with priorities.
- Slot Holds: temporary holds to prevent booking conflicts.
- Bookings, Booking Slots: confirmed/pending/cancelled/completed bookings and their time ranges.
- Add-on Services, Booking Add-ons: optional services linked to bookings.
- Payment Transactions, Refunds: financial records linked to bookings.
- Feedback: customer feedback linked to bookings.
- Users, Roles, Staff: identity, authorization, and internal accounts.
- Email Logs, Audit Logs: operational logs (must not contain secrets).

## 8. API Conventions

### 8.1 Base Conventions

- Base path: `/api/*`.
- Responses should be consistent: `{ success: boolean, message?: string, data?: any }` where applicable.
- Use safe error messages; do not leak secrets or internal stack traces.

### 8.2 Key Endpoint Areas (High-Level)

- Auth: `/api/auth/*`
- Courts / Availability: `/api/courts/*`
- Bookings: `/api/bookings/*`
- Staff operations: `/api/staff/*`

Feature-level `SPEC.md` files define detailed endpoints and payloads.

## 9. Non-Functional Requirements (Project-Level)

### 9.1 Security

- NFR-PJ-SEC-001: All inputs must be validated server-side.
- NFR-PJ-SEC-002: No secrets/tokens/passwords may be hardcoded or logged.
- NFR-PJ-SEC-003: Protected endpoints must enforce authentication + role checks.
- NFR-PJ-SEC-004: Token expiry must be enforced server-side.

### 9.2 Reliability

- NFR-PJ-REL-001: Booking/payment state transitions must be consistent and resilient to retries (idempotency where needed).
- NFR-PJ-REL-002: Hold expiry must not leave slots permanently blocked.

### 9.3 Performance

- NFR-PJ-PERF-001: Availability queries must remain responsive for typical daily usage (single day, single branch/court).
- NFR-PJ-PERF-002: Reporting endpoints should enforce bounded date ranges by default.

### 9.4 Logging and Audit

- NFR-PJ-LOG-001: Key actions should be traceable (who, when, what, result).
- NFR-PJ-LOG-002: Never store raw OTP/token values in logs.

## 10. Feature List and Traceability

Feature-to-user-story mapping is maintained in `.sdd/specs/README.md`.

- `feature-auth` -> US-PB-01
- `feature-schedule-booking` -> US-PB-02, US-PB-03
- `feature-payment-refund` -> US-PB-04, US-PB-05
- `feature-staff-daily-operation` -> US-PB-06
- `feature-branch-court` -> US-PB-07
- `feature-addon` -> US-PB-08
- `feature-basic-reporting` -> US-PB-09
- `feature-pricing` -> US-PB-10
- `feature-customer-history` -> US-PB-11
- `feature-notification` -> US-PB-12
- `feature-feedback` -> US-PB-13
- `feature-internal-account` -> US-PB-14
- `feature-voucher` -> US-PB-15
- `feature-maintenance` -> US-PB-16
- `feature-quick-rebook` -> US-PB-17
- `feature-advanced-reporting` -> US-PB-18
- `feature-slot-suggestion` -> US-PB-19
- `feature-ops-dashboard` -> US-PB-20

## 11. Known Risks (Project-Level)

- Race conditions causing double-booking if holds/bookings are not enforced transactionally.
- Inconsistent payment/booking state without clear state machine rules.
- Authorization gaps leading to cross-branch data leakage.
- Notification/OTP leakage via logs if not handled carefully.

## 12. Open Questions

| ID | Question | Owner | Status |
| --- | --- | --- | --- |
| Q-PJ-001 | Do we require branch-scoped authorization for Staff beyond role checks (staff assigned to specific branches)? | Dat | Open |
| Q-PJ-002 | Do we standardize token expiry to 15 minutes (JWT) + refresh token, or keep current 24h token? | Dat | Open |
| Q-PJ-003 | Which reporting endpoints are required in Phase 1 vs Phase 2? | Dat | Open |
