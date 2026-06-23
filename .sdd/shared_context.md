# Shared Context - Pickleball Court Booking System

Version: 0.2.0
Status: DRAFT
Last Updated: 2026-06-23

## 1. Project Summary

The system supports a multi-branch pickleball venue operation in Ha Noi.
Customers can browse courts, view availability, hold a slot, create a booking,
pay or wait for counter confirmation, receive notifications, and view booking
history. Staff operate daily booking flows. Owners and admins manage operational
configuration and reports.

This shared context exists so all feature specs use the same language for
actors, states, database entities, modules, and business workflows.

## 2. Business Context

The business is not a generic sports marketplace. It is a venue-focused booking
system for several small branches in Ha Noi. That affects the scope:

- There is no multi-city, multi-country, or franchise tenant model in Phase 1.
- Branches are operational units, not separate tenants.
- Courts belong to branches.
- Customers book by court, date, start time, and duration/slots.
- Staff use the system for real-world counter operations.
- Owners/admins configure the operational data behind booking.

## 3. Approved Stack

| Layer | Decision | Source |
| --- | --- | --- |
| Backend | Node.js + Express.js | Existing code and project spec |
| Frontend | React + Vite | Existing frontend |
| Database | MySQL 8.0+ | `mysql-workbench-schema.sql` |
| API | RESTful JSON API | `/api/*` routes |
| Auth | Token-based auth | `backend/src/utils/token.js` |
| Timezone | `Asia/Ho_Chi_Minh` | DB settings |
| Currency | VND integer amounts | DB settings |

## 4. Main Actors

| Actor | Description | Main Goals | Risk If Wrong |
| --- | --- | --- | --- |
| Guest | Visitor without login | View public pages, register, login | Guest may access protected data |
| Customer | End user who books courts | View schedule, hold/book slots, pay, view history, update profile | Booking/payment privacy issues |
| Staff | Internal operator | Confirm/cancel bookings, check-in/out, record counter payment, update add-on stock | Unauthorized operations |
| Owner | Business owner/manager | Manage courts, staff, services, pricing, vouchers, reports | Configuration mistakes affect revenue |
| Admin | System administrator | Full system/account control | Highest privilege abuse risk |
| Payment Provider | External system/webhook | Notify payment success/failure | Duplicate/forged events |
| Email Service | SMTP provider | Send OTP and operational emails | Secret leakage or failed notification |

## 5. Core Workflows

### 5.1 Customer Booking Workflow

1. Customer logs in or registers using Gmail-only account rules.
2. Customer selects branch, court, date, and time range.
3. System computes availability from court status, active holds, active booking
   slots, open/close time, and past/future status.
4. Customer creates a hold.
5. System stores a `slot_holds` record with `expires_at`.
6. Customer confirms booking from hold.
7. System creates `bookings` and `booking_slots`.
8. Customer pays or staff records counter payment.
9. System confirms booking after successful payment.
10. Staff checks customer in/out during real-world play.

### 5.2 Staff Daily Operation Workflow

1. Staff logs in.
2. Staff opens dashboard for today or selected date.
3. Staff sees pending/confirmed/checked-in bookings.
4. Staff confirms payment when needed.
5. Staff checks in customers on arrival.
6. Staff checks out customers after the session.
7. Staff cancels operationally when allowed.
8. Staff updates add-on stock.

### 5.3 Owner/Admin Management Workflow

1. Owner/Admin logs in.
2. Owner/Admin manages courts, branches, staff, accounts, services, pricing,
   vouchers, and reporting views.
3. System validates role and branch scope.
4. Changes are saved in the operational tables.
5. Important actions should be auditable.

## 6. Backend Layers And Current Modules

The backend uses CommonJS modules and functions instead of ES classes. This is
acceptable for the current project. See `.sdd/class_inventory.md` for a detailed
file/class/layer inventory.

| Layer | Current modules |
| --- | --- |
| Routes | `authRoutes.js`, `bookingRoutes.js`, `courtRoutes.js`, `staffRoutes.js` |
| Controllers | `authController.js`, `bookingController.js`, `courtController.js`, `staffController.js` |
| Models | `User.js`, `Booking.js`, `Court.js`, `Staff.js`, `PasswordResetOtp.js` |
| Middleware | `auth.js` |
| Utilities | `token.js`, `password.js`, `mailer.js`, `googleAuth.js` |
| Config | `db.js` |

## 7. Data Model Summary

| Group | Tables | Notes |
| --- | --- | --- |
| System and branches | `settings`, `branches` | Venue-wide and branch-level configuration |
| Accounts and auth | `roles`, `users`, `password_reset_otps` | Gmail rule, roles, OTP lifecycle |
| Courts and pricing | `courts`, `price_rules` | Availability and price calculation |
| Promotions | `promotions`, `vouchers` | Discount campaigns and voucher codes |
| Booking | `slot_holds`, `bookings`, `booking_slots` | Core booking lifecycle |
| Add-ons | `categories`, `addon_services`, `booking_addons` | Rental/sale services |
| Finance | `payment_transactions`, `refunds` | Payment and refund audit trail |
| Operations | `feedback`, `email_logs`, `audit_logs` | Feedback, notification logs, audit trail |

## 8. Important State Machines

### 8.1 Hold Status

| Status | Meaning |
| --- | --- |
| `active` | Currently blocks availability |
| `converted` | Used to create a booking |
| `expired` | No longer usable |
| `cancelled` | Manually or system-cancelled |

### 8.2 Booking Status

| Status | Meaning |
| --- | --- |
| `pending` | Booking created but not fully confirmed |
| `confirmed` | Booking accepted and ready for play |
| `checked_in` | Customer has arrived and session started/validated |
| `completed` | Session finished |
| `cancelled` | Booking cancelled |
| `expired` | Booking/hold flow expired before completion |
| `no_show` | Customer did not arrive |

### 8.3 Payment Status

| Status | Meaning |
| --- | --- |
| `unpaid` | No successful payment yet |
| `pending` | Payment is in progress |
| `paid` | Payment success |
| `partially_refunded` | Some amount refunded |
| `refunded` | Full amount refunded |
| `failed` | Payment failed |

## 9. Feature Dependencies

| Feature | Depends On | Reason |
| --- | --- | --- |
| FE01 Auth | roles/users/password_reset_otps/email | Identity and access |
| FE02 Schedule & Booking | FE01, branches, courts, settings, slot_holds, bookings | Holds require authenticated customer and court data |
| FE03 Payment & Refund | FE02, payment_transactions, refunds | Payments attach to bookings |
| FE04 Staff Daily Operation | FE01, FE02, FE03, Staff role | Staff operates booking lifecycle |
| FE05 Branch/Court | settings, branches, courts | Availability and management |
| FE06 Add-on | categories, addon_services, booking_addons | Optional booking services |
| FE08 Pricing | price_rules, bookings, booking_slots | Server-side totals |
| FE10 Notification | email_logs, mailer | OTP and booking emails |
| FE12 Internal Account | users, roles | Staff/owner/admin management |

## 10. Glossary

| Term | Meaning |
| --- | --- |
| Slot | A bookable time unit, configured by `settings.slot_minutes` |
| Hold | Temporary reservation that blocks a slot before payment/booking finalization |
| Booking | Customer reservation for a court/time range |
| Booking Slot | Individual slot row under a booking |
| Counter Payment | Payment recorded by staff at venue counter |
| Branch Scope | Restricting internal users/actions to a branch |
| Add-on | Extra rental/sale item such as paddle rental, drinks, balls |
| Voucher | Customer-entered discount code |
| Promotion | Campaign that backs one or many vouchers |

## 11. Canonical Project Documents

- High-level SDD spec: `.sdd/specs/PROJECT_SPEC.md`
- Feature specs: `.sdd/specs/feature-*/SPEC.md`
- Class/layer inventory: `.sdd/class_inventory.md`
- Database schema: `mysql-workbench-schema.sql`
- Database notes: `database.md`
- Implementation notes: `IMPLEMENTATION.md`

## 12. Known Open Questions

| ID | Question | Current Handling |
| --- | --- | --- |
| Q-SC-001 | Should staff be strictly branch-scoped? | Design should support it; enforce when feature spec requires |
| Q-SC-002 | Should token expiry become shorter with refresh tokens? | Current token approach remains until FE01 changes |
| Q-SC-003 | Which reports are Phase 1 vs Phase 2? | Follow feature reporting specs |
| Q-SC-004 | Should services be split from model modules? | Candidate future refactor; not required for import |
