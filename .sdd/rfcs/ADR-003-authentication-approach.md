# ADR-003 - Authentication Approach

Status: DRAFT
Date: 2026-06-23

## Context

The system has public browsing, customer booking, staff operations, owner/admin
management, profile updates, Google login support, and password reset via OTP.
Auth is foundational because incorrect auth affects bookings, payments,
refunds, account management, and auditability.

## Decision

Use backend-issued application tokens for authenticated API access. Customer
registration/login is Gmail-only in the current phase. Backend middleware must
verify the token and load the current user before protected controllers execute.

Protected actions must enforce role checks on the server:

- Customer: own profile/bookings/payment flow.
- Staff: daily booking operations and add-on stock operations.
- Owner: operational management and reporting.
- Admin: full administrative control.

Password-reset OTP values must be hashed in storage. Reset tokens must also be
hashed or otherwise protected.

## Alternatives Considered

| Alternative | Reason Not Chosen |
| --- | --- |
| Session cookies only | Current API is already token-based |
| External SSO for all roles | Out of Phase 1 scope |
| Frontend-only role checking | Not secure |
| Importing the library SDD auth assumptions directly | That project used different domain/database assumptions |

## Consequences

- Auth responses must return safe user objects only.
- Password, password hash, raw OTP, and reset-token data must never be returned.
- Forgot-password responses should avoid user enumeration.
- Token expiry behavior must remain consistent with FE01.
- Internal role escalation rules must be explicit in FE12.
- Future security improvements can be added behind utility functions without
  changing every controller.

## Follow-Up Work

- Confirm final token expiry policy.
- Improve password storage if the current project phase allows it.
- Add rate limiting for auth and OTP endpoints if not already present.
- Add branch-scope checks for staff/owner features when branch assignment is
  enforced.
