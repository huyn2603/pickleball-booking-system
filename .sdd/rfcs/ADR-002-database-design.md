# ADR-002 - Database Design

Status: DRAFT
Date: 2026-06-23

## Context

The system needs a relational model for a venue booking domain. The database
must support:

- Multiple branches in Ha Noi.
- Courts under each branch.
- Time slot availability.
- Temporary holds.
- Bookings and booking slots.
- Add-ons and stock.
- Payments and refunds.
- Roles and account status.
- Email and audit logs.

The database must also protect the core invariant: one court/time overlap cannot
be actively held or booked by multiple customers.

## Decision

Use MySQL 8.0+ with InnoDB. The canonical import file is:

```text
mysql-workbench-schema.sql
```

The human-readable schema explanation is:

```text
database.md
```

The schema uses:

- Foreign keys for core relationships.
- Indexes for lookup paths such as branch/date/status.
- Check constraints for times, amounts, OTP attempts, rating, and usage limits.
- Triggers to prevent overlapping active bookings/holds.
- Integer VND amounts to avoid floating point currency errors.

## Main Table Groups

| Group | Tables |
| --- | --- |
| System/branch | `settings`, `branches` |
| Auth/account | `roles`, `users`, `password_reset_otps` |
| Court/pricing | `courts`, `price_rules` |
| Promotions | `promotions`, `vouchers` |
| Booking | `slot_holds`, `bookings`, `booking_slots` |
| Add-ons | `categories`, `addon_services`, `booking_addons` |
| Finance | `payment_transactions`, `refunds` |
| Operations | `feedback`, `email_logs`, `audit_logs` |

## Alternatives Considered

| Alternative | Reason Not Chosen |
| --- | --- |
| SQL Server from the provided library SDD | Current project code/schema are MySQL-based |
| NoSQL document store | Booking overlap and financial relationships are better expressed relationally |
| Application-only overlap checks | Race conditions can still create double-booking |

## Consequences

- Code and docs must remain aligned with MySQL, not SQL Server.
- Any schema change must update `mysql-workbench-schema.sql`, `database.md`,
  and affected specs.
- Booking/hold writes should be handled with transaction awareness.
- Reporting can derive from relational joins over booking, payment, refund, and
  add-on tables.
- Triggers protect overlap invariants but application logic still needs clear
  validation and friendly error handling.

## Follow-Up Work

- Add migration strategy if the team moves beyond one import SQL file.
- Review overlap triggers whenever booking statuses or hold statuses change.
- Consider stronger audit trigger coverage for staff/owner/admin actions.
