# Business Constraints - Pickleball Court Booking System

Version: 0.2.0
Status: DRAFT
Last Updated: 2026-06-23

These are project-wide business rules. Feature specs may add more detailed
rules, but they must not weaken these constraints.

## 1. Venue And Branch Scope

| ID | Rule | Notes |
| --- | --- | --- |
| BR-G-001 | The system manages multiple small pickleball branches in Ha Noi only. | No multi-city/multi-tenant franchise scope in Phase 1. |
| BR-G-002 | Every court belongs to exactly one branch. | Enforced through `courts.branch_id`. |
| BR-G-003 | Branches can be `active`, `maintenance`, or `inactive`. | Non-active branches should not accept new operational bookings. |
| BR-G-004 | Branch open/close times must be valid and should override or align with system settings. | `open_time < close_time`. |

## 2. Court And Availability Rules

| ID | Rule | Feature Link |
| --- | --- | --- |
| BR-G-005 | A court cannot be booked for overlapping active booking slots. | FE02 |
| BR-G-006 | A court cannot be held for overlapping active holds. | FE02 |
| BR-G-007 | Active holds also block booking creation until converted, expired, or cancelled. | FE02 |
| BR-G-008 | Courts with `maintenance` or `inactive` status cannot accept new holds/bookings. | FE02, FE14 |
| BR-G-009 | Bookings and holds cannot be created for past time slots. | FE02 |
| BR-G-010 | Slot duration must align with configured `slot_minutes`. | FE02 |
| BR-G-011 | Availability shown to users must include booking state, active hold state, court status, and future/past status. | FE02 |

## 3. Hold Rules

| ID | Rule | Notes |
| --- | --- | --- |
| BR-G-012 | Slot holds expire automatically based on `settings.hold_minutes`. | Default is 10 minutes. |
| BR-G-013 | A hold can be converted to a booking only by the customer who owns it. | Prevents taking over another user's hold. |
| BR-G-014 | Expired holds cannot create bookings. | User must create a new hold. |
| BR-G-015 | Hold expiry must release availability; it must not permanently block the court. | Required for reliability. |

## 4. Booking State Rules

| ID | Rule | Notes |
| --- | --- | --- |
| BR-G-016 | Booking status must follow a clear lifecycle: `pending`, `confirmed`, `checked_in`, `completed`, `cancelled`, `expired`, `no_show`. | Matches schema enum. |
| BR-G-017 | A booking cannot skip required state transitions without staff/owner/admin action. | Example: direct `pending` to `completed` should not happen automatically. |
| BR-G-018 | Check-in requires a valid booking that is not cancelled/expired/no-show. | FE04. |
| BR-G-019 | Check-out requires a checked-in booking. | FE04. |
| BR-G-020 | Staff operational changes should record who performed the action where possible. | Audit/logging expectation. |

## 5. Pricing, Add-On, Voucher Rules

| ID | Rule | Notes |
| --- | --- | --- |
| BR-G-021 | Booking totals are calculated or validated on the server. | Client totals are never trusted. |
| BR-G-022 | Price rules must be applied by branch/court/day/time/priority. | FE08. |
| BR-G-023 | Voucher usage cannot exceed configured usage limits. | `used_count <= max_usage`. |
| BR-G-024 | Percentage discounts must remain within 1-100 percent. | Schema constraint. |
| BR-G-025 | Add-on quantity must be positive and stock must not become invalid. | FE06. |
| BR-G-026 | Add-on line totals are derived from quantity and unit price. | `booking_addons.line_total`. |

## 6. Payment And Refund Rules

| ID | Rule | Notes |
| --- | --- | --- |
| BR-G-027 | A confirmed booking should have a successful payment record unless explicitly documented as a staff exception. | Financial integrity. |
| BR-G-028 | Payment attempts must be retained, including failures. | Reconciliation. |
| BR-G-029 | Duplicate payment webhook events must not create duplicate successful payments. | Idempotency. |
| BR-G-030 | Refund decisions must be traceable with amount, reason, percentage, status, and processor when available. | FE03. |
| BR-G-031 | Customer cancellation/refund windows must be applied consistently from booking start time. | FE03. |
| BR-G-032 | No automatic cancellation/refund after check-in unless a staff/owner/admin exception is defined. | Operational safety. |

## 7. Account And Role Rules

| ID | Rule | Notes |
| --- | --- | --- |
| BR-G-033 | User roles are `Admin`, `Owner`, `Staff`, and `Customer`. | Matches seed data. |
| BR-G-034 | Customer registration is Gmail-only in the current phase. | FE01. |
| BR-G-035 | Internal account management is role-restricted. | FE12. |
| BR-G-036 | Staff and owner branch scope must be respected when branch assignment is used. | Open project question but should be designed for. |
| BR-G-037 | Disabled, inactive, blocked, or unverified accounts must not be allowed to perform protected actions unless explicitly allowed by spec. | Auth safety. |

## 8. Notification And Feedback Rules

| ID | Rule | Notes |
| --- | --- | --- |
| BR-G-038 | Email failure must not corrupt booking/payment state. | Notifications are side effects. |
| BR-G-039 | Email logs must not store secrets or raw OTPs. | Safety. |
| BR-G-040 | A booking may have at most one feedback record. | `uq_feedback_booking`. |
| BR-G-041 | Feedback rating must be 1-5. | Schema constraint. |

## 9. Reporting Rules

| ID | Rule | Notes |
| --- | --- | --- |
| BR-G-042 | Reports should derive from authoritative booking, payment, refund, and add-on records. | Avoid UI-only calculations. |
| BR-G-043 | Reporting endpoints should use bounded date ranges by default. | Performance. |
| BR-G-044 | Revenue reporting must distinguish gross booking total, discounts, successful payments, refunds, and net revenue when possible. | Financial clarity. |
