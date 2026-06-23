# Class And Layer Inventory - Pickleball Court Booking System

Version: 0.1.0
Status: DRAFT
Last Updated: 2026-06-23

## 1. Purpose

This document answers the "files and classes/layers" part of the SDD import
review. The current project does not use ES `class` declarations as the main
architecture style. It uses CommonJS modules, plain functions, controller
functions, model modules, route modules, React component functions, and MySQL
entities.

Therefore, "missing classes" should be interpreted as missing implementation
layers or domain modules, not literal JavaScript `class` declarations.

## 2. Backend Layer Inventory

| Layer | File | Main Responsibilities | Status |
| --- | --- | --- | --- |
| App bootstrap | `backend/app.js` | Express app, CORS, middleware, route mounting, health behavior | Present |
| Server bootstrap | `backend/server.js` | Starts backend HTTP server | Present |
| DB config | `backend/src/config/db.js` | MySQL connection pool, query helper, transaction helper | Present |
| Auth middleware | `backend/src/middleware/auth.js` | Token validation and current user loading | Present |
| Auth routes | `backend/src/routes/authRoutes.js` | Auth endpoints | Present |
| Court routes | `backend/src/routes/courtRoutes.js` | Court listing/detail/availability endpoints | Present |
| Booking routes | `backend/src/routes/bookingRoutes.js` | Holds, payment status, webhook, my bookings | Present |
| Staff routes | `backend/src/routes/staffRoutes.js` | Daily operations and stock update endpoints | Present |
| Auth controller | `backend/src/controllers/authController.js` | Register/login/google login/OTP/profile/account management | Present |
| Court controller | `backend/src/controllers/courtController.js` | Court list/detail/availability/create/update/delete | Present |
| Booking controller | `backend/src/controllers/bookingController.js` | Hold creation, booking conversion, payment status, webhook, history | Present |
| Staff controller | `backend/src/controllers/staffController.js` | Dashboard, confirm/cancel/check-in/check-out/payment/stock | Present |
| User model module | `backend/src/models/User.js` | User lookup, role lookup, account CRUD, profile, history | Present |
| Court model module | `backend/src/models/Court.js` | Settings, branches, courts, availability, price lookup | Present |
| Booking model module | `backend/src/models/Booking.js` | Holds, booking creation, payment conversion, customer bookings | Present |
| Staff model module | `backend/src/models/Staff.js` | Staff dashboard/actions/add-on stock/counter payment | Present |
| OTP model module | `backend/src/models/PasswordResetOtp.js` | OTP creation, hashing, verification, reset token lifecycle | Present |
| Token utility | `backend/src/utils/token.js` | App token creation and verification | Present |
| Password utility | `backend/src/utils/password.js` | Password storage/verification abstraction | Present |
| Mailer utility | `backend/src/utils/mailer.js` | SMTP transport and safe email sending | Present |
| Google auth utility | `backend/src/utils/googleAuth.js` | Google credential verification | Present |

## 3. Frontend Component Inventory

| Component / Function | File | Purpose | Status |
| --- | --- | --- | --- |
| `App` | `frontend/src/App.jsx` | Main app state, routing-like view switching, auth/session, API orchestration | Present |
| `Field` | `frontend/src/App.jsx` | Shared labeled input field | Present |
| `ProfileCard` | `frontend/src/App.jsx` | Current user profile summary | Present |
| `MyBookingsPage` | `frontend/src/App.jsx` | Customer booking history page | Present |
| `BookingListPanel` | `frontend/src/App.jsx` | Shared booking list display | Present |
| `AdminAccounts` | `frontend/src/App.jsx` | Admin/owner account management panel | Present |
| `LegacyOwnerTools` | `frontend/src/App.jsx` | Older owner tooling UI | Present |
| `OwnerTools` | `frontend/src/App.jsx` | Owner management view container | Present |
| `CourtEditor` | `frontend/src/App.jsx` | Court create/edit form | Present |
| `CourtManagementList` | `frontend/src/App.jsx` | Court management list | Present |
| `OwnerBookingPanel` | `frontend/src/App.jsx` | Owner booking operations | Present |
| `OwnerServicesPanel` | `frontend/src/App.jsx` | Add-on/service stock management | Present |
| `OwnerRevenuePanel` | `frontend/src/App.jsx` | Revenue/reporting view | Present |
| `OwnerCustomerPanel` | `frontend/src/App.jsx` | Customer management/history view | Present |
| `StaffEditor` | `frontend/src/App.jsx` | Staff account form | Present |
| `StaffTools` | `frontend/src/App.jsx` | Staff tools entry view | Present |
| `StaffToolsPanel` | `frontend/src/App.jsx` | Staff dashboard actions | Present |
| `CustomerTools` | `frontend/src/App.jsx` | Customer action entry view | Present |
| `CourtDetailPage` | `frontend/src/App.jsx` | Court detail and availability display | Present |
| `BookingPage` | `frontend/src/App.jsx` | Booking form, hold/payment flow | Present |
| `BookingSummaryCard` | `frontend/src/App.jsx` | Court booking summary card | Present |
| `CourtCard` | `frontend/src/App.jsx` | Public court card | Present |
| `AccountGroup` | `frontend/src/App.jsx` | Grouped user/account list | Present |
| `FeaturePanel` | `frontend/src/App.jsx` | Feature list panel | Present |

## 4. Database Entity Inventory

| Entity | Domain Class Equivalent | Purpose |
| --- | --- | --- |
| `settings` | SystemSettings | Global venue settings, timezone, slot length, hold duration |
| `branches` | Branch | Venue branch in Ha Noi |
| `roles` | Role | Admin/Owner/Staff/Customer role catalog |
| `users` | User / Account | Customer and internal account identity |
| `password_reset_otps` | PasswordResetOtp | OTP and reset-token lifecycle |
| `courts` | Court | Bookable court under a branch |
| `price_rules` | PriceRule | Dynamic slot pricing rule |
| `categories` | AddonCategory | Add-on grouping |
| `addon_services` | AddonService | Rental/sale services attached to bookings |
| `promotions` | Promotion | Promotion campaign |
| `vouchers` | Voucher | Redeemable voucher code |
| `bookings` | Booking | Main booking aggregate |
| `booking_slots` | BookingSlot | Slot-level booked time ranges |
| `slot_holds` | SlotHold | Temporary hold before booking/payment |
| `booking_addons` | BookingAddon | Add-on items attached to a booking |
| `payment_transactions` | PaymentTransaction | Payment attempt/result record |
| `refunds` | Refund | Refund request/processing record |
| `feedback` | Feedback | Customer post-booking feedback |
| `email_logs` | EmailLog | Notification delivery record |
| `audit_logs` | AuditLog | Operational audit trail |

## 5. Missing Or Future Candidate Layers

These are not required to copy from the Library Management archive. They are
future improvements if the team wants a cleaner layered architecture.

| Candidate | Why It May Be Useful | Priority |
| --- | --- | --- |
| `services/AuthService.js` | Move auth workflows out of controller once logic grows | Medium |
| `services/BookingService.js` | Centralize hold, booking, and overlap orchestration | High |
| `services/PricingService.js` | Centralize price calculation and voucher application | High |
| `services/PaymentService.js` | Centralize payment transaction and webhook idempotency | High |
| `services/RefundService.js` | Centralize refund policy windows and status transitions | Medium |
| `services/NotificationService.js` | Centralize email logging and retry behavior | Medium |
| `services/AuditService.js` | Standardize audit log creation for staff/owner/admin actions | Medium |
| `validators/` | Reusable request validation for routes/controllers | Medium |
| `repositories/` | Useful if SQL grows too large inside model modules | Low/Medium |
| `frontend/src/components/` | Split large `App.jsx` into focused components | Medium |
| `frontend/src/api/` | Centralize API request helpers and auth header handling | Medium |

## 6. Import Decision

No source-code class was imported from the provided `.sdd.zip` because the zip
contained documentation for a Library Management System, not source classes for
this project. The correct action is to document the current pickleball layers
and add missing SDD documents, then implement new code classes/services only
when a pickleball feature spec requires them.
