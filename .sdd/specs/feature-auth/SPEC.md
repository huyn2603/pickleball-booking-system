# SPEC.md - FE01 Authentication

Version: 0.1.0
Status: DRAFT
Owner: Dat
Last Updated: 2026-06-23
Feature ID: FE01
Feature folder: `.sdd/specs/feature-auth/`

Business context (short): Authentication enables Guest/Customer/Staff/Owner/Admin to identify themselves and obtain an access token so all protected workflows (booking, payment, staff operations) can be executed safely. It depends on the database schema (`users`, `roles`, `password_reset_otps`) and the email notification mechanism for OTP delivery.

---

## 1. Feature Overview

### 1.1 Feature Name

FE01 Authentication

### 1.2 Business Context

Authentication is the foundation for authorization, auditability, and customer trust. If implemented incorrectly, the system is at risk of account takeover, user data leakage, and operational abuse (e.g., unauthorized booking cancellations or staff operations).

### 1.3 Goal / Outcome

The system will:

- Register users (Customer in v1) using Gmail-only email addresses.
- Authenticate users and issue an access token with enforced expiry.
- Provide an authenticated “current user” endpoint for frontend routing and scope checks.
- Support password reset via email OTP without exposing sensitive data or enabling user enumeration.

### 1.4 Scope Level

- [x] Full Spec — core security logic, high risk if incorrect
- [ ] Standard Spec
- [ ] Light Spec

---

## 2. Actors and Permissions

| Actor | Description | Permission / Responsibility |
| --- | --- | --- |
| Guest | Unauthenticated visitor | Can register/login; can request password reset OTP |
| Customer | Authenticated end-user | Can access protected customer endpoints after login |
| Staff | Internal operator | Can access staff endpoints after login (role-based) |
| Owner | Branch/business owner | Can access management/reporting endpoints after login |
| Admin | System administrator | Full access to protected endpoints after login |
| Email Service (SMTP) | External service | Delivers OTP emails; failures must be handled safely |
| Audit Log Store | Database table/system | Records auth events where required without storing secrets |

---

## 3. Preconditions

- PRE-FE01-001: Database schema exists and is reachable (tables: `users`, `roles`, `password_reset_otps`).
- PRE-FE01-002: `AUTH_TOKEN_SECRET` is configured for non-development environments.
- PRE-FE01-003: SMTP configuration exists to deliver OTP (optional for dev; if missing, system must fail safely).

---

## 4. Main Flows

### MF-FE01-001: Register (Gmail-only)

1. Guest opens the registration form and provides `full_name`, `email`, `phone`, `password`.
2. System validates input format and enforces Gmail-only email rule.
3. System checks email uniqueness in `users`.
4. System hashes the password and stores the user record with `role_id = Customer` and appropriate `status`.
5. System returns a safe response and an access token (if policy is “auto-login after register” for v1).

### MF-FE01-002: Login

1. Guest submits `email` and `password`.
2. System validates input and performs a constant-shape authentication check.
3. System verifies password hash and user status.
4. System issues an access token with expiry and returns safe current user context (`id`, `email`, `role`, `status`).

### MF-FE01-003: Forgot Password via OTP

1. Customer requests OTP by providing the email address.
2. System returns a generic success response (to avoid email enumeration).
3. If the email exists and account is eligible, system creates an OTP record:
   - stores `otp_hash`
   - sets `expires_at`
   - sets `attempt_count = 0`
4. System sends OTP via email if SMTP is configured.
5. Customer verifies OTP; system marks `verified_at` if valid.
6. Customer resets password; system updates `users.password` (hashed) and sets `used_at` on OTP record.

---

## 5. Alternative Flows

| ID | Alternative Flow |
| --- | --- |
| AF-FE01-001 | Registration fails because email is not `@gmail.com`. |
| AF-FE01-002 | Registration fails because email already exists. |
| AF-FE01-003 | Login fails due to wrong password; response remains generic. |
| AF-FE01-004 | OTP verification fails because OTP expired or attempt limit exceeded. |
| AF-FE01-005 | SMTP is not configured; OTP request still returns generic success and logs a safe failure. |

---

## 6. Business Rules

- BR-FE01-001: Registration email must end with `@gmail.com` (validated server-side).
- BR-FE01-002: The system must never return `password` or password hash in any API response.
- BR-FE01-003: Access tokens must have server-enforced expiry.
- BR-FE01-004: OTP values must be stored as hashes only; raw OTP must not be stored.
- BR-FE01-005: OTP must expire and must not be reusable after `used_at` is set.
- BR-FE01-006: Forgot-password responses must be generic to avoid revealing whether an email exists.
- BR-FE01-007: Password reset attempts must be rate-limited via `attempt_count` rules.

---

## 7. Functional Requirements

- FR-FE01-001: When a Guest submits registration, the system shall validate Gmail-only email format and required fields.
- FR-FE01-002: If the email already exists, then the system shall reject registration with a safe error.
- FR-FE01-003: When a user logs in with valid credentials, the system shall issue an access token and return current user context.
- FR-FE01-004: If credentials are invalid, then the system shall return a generic authentication error.
- FR-FE01-005: When a Customer requests password reset OTP, the system shall create a hashed OTP record with expiry for eligible accounts.
- FR-FE01-006: If OTP is expired or already used, then the system shall reject verification/reset safely.
- FR-FE01-007: When password reset succeeds, the system shall update the stored password hash and invalidate the OTP record.
- FR-FE01-008: When accessing `/api/auth/me`, the system shall return the current authenticated user context.

---

## 8. Acceptance Criteria

- AC-FE01-001: Given a Guest provides a valid Gmail email and password, when they register, then the system creates a Customer user and returns a token.
- AC-FE01-002: Given an email already exists, when a Guest registers again, then the system rejects with a safe error.
- AC-FE01-003: Given a non-Gmail email, when a Guest registers, then the system rejects consistently (frontend + backend rule aligned).
- AC-FE01-004: Given a Customer provides correct credentials, when they login, then the system returns a token and role in the response.
- AC-FE01-005: Given a Customer provides wrong credentials, when they login, then the system returns a generic error without revealing which field is wrong.
- AC-FE01-006: Given a Customer requests OTP for password reset, when the email exists and SMTP is configured, then an OTP is created (hashed) and an email is sent.
- AC-FE01-007: Given an OTP is wrong or expired, when the Customer resets password, then the system rejects and does not change the password.
- AC-FE01-008: Given an OTP is valid and not used, when the Customer resets password, then the password is updated and the OTP becomes unusable.
- AC-FE01-009: Given a valid access token, when calling `/api/auth/me`, then the system returns safe current user context.

---

## 9. Edge Cases and Error Handling

| ID | Edge Case / Error | Expected System Behavior |
| --- | --- | --- |
| EC-FE01-001 | Gmail rule mismatch between UI and API | Backend is authoritative; UI should align but must not be trusted |
| EC-FE01-002 | User enumeration via forgot password | Always return generic success for OTP request |
| EC-FE01-003 | OTP reuse attempt | Reject if `used_at` is set |
| EC-FE01-004 | OTP brute force | Increment `attempt_count` and block after threshold |
| EC-FE01-005 | Token signature mismatch | Return 401 and do not reveal details |

---

## 10. Data Requirements

### 10.1 Entities Involved

| Entity | Purpose in this feature |
| --- | --- |
| `users` | Stores identities, roles, statuses, and password hashes |
| `roles` | Maps role_id to role semantics (Admin/Owner/Staff/Customer) |
| `password_reset_otps` | Stores hashed OTP reset attempts with expiry and usage state |
| `email_logs` | Records email delivery attempts without storing raw OTP values |
| `audit_logs` | Records auth events (login, password reset) without secrets |

### 10.2 Data Fields

| Field | Type | Required | Validation / Notes |
| --- | --- | --- | --- |
| `users.email` | string | Yes | Unique; must satisfy Gmail-only policy for v1 |
| `users.password` | string | Yes | Must be a password hash; never returned |
| `users.role_id` | int | Yes | Role mapping to `roles` |
| `users.status` | enum | Yes | Must block access if not Active |
| `password_reset_otps.otp_hash` | string | Yes | SHA-256 or equivalent hash; never store raw OTP |
| `password_reset_otps.expires_at` | datetime | Yes | Enforced at verify/reset time |
| `password_reset_otps.used_at` | datetime | No | Set once the OTP reset is completed |

---

## 11. API / Interface Contract

| Method | Endpoint | Actor | Request | Response | Notes |
| --- | --- | --- | --- | --- | --- |
| POST | `/api/auth/register` | Guest | `{ fullName, email, phone, password }` | `{ success, token, user }` | Gmail-only; safe errors |
| POST | `/api/auth/login` | Guest | `{ email, password }` | `{ success, token, user }` | Generic error on failures |
| GET | `/api/auth/me` | Customer/Staff/Owner/Admin | N/A | `{ success, user }` | Requires auth |
| POST | `/api/auth/forgot-password/request-otp` | Guest | `{ email }` | `{ success, message }` | Generic response; no enumeration |
| POST | `/api/auth/forgot-password/verify-otp` | Guest | `{ email, otp }` | `{ success, message }` | Marks `verified_at` if valid |
| POST | `/api/auth/forgot-password/reset` | Guest | `{ email, otp, newPassword }` | `{ success, message }` | Sets `used_at` and updates password |

---

## 12. Non-functional Requirements

### 12.1 Security

- NFR-FE01-SEC-001: All auth inputs must be validated server-side (email format, password presence).
- NFR-FE01-SEC-002: No raw passwords, OTPs, tokens, or secrets may be logged or committed.
- NFR-FE01-SEC-003: Token verification must use constant-time comparison and enforce expiry.

### 12.2 Transaction Integrity

- NFR-FE01-TXN-001: Password reset must update user password and OTP usage state atomically (no partial updates).

### 12.3 Performance

- NFR-FE01-PERF-001: Login and token verification should be fast enough for interactive UX under typical load.

### 12.4 Logging and Audit

- NFR-FE01-LOG-001: Record login success/failure and password reset attempts with timestamp and actor id (if known), without secrets.

### 12.5 Usability

- NFR-FE01-UX-001: Error messages must be understandable and must not expose which credential field is wrong.

---

## 13. Out of Scope

- MFA/2FA.
- OAuth/SSO and production-grade Google OAuth integration.
- Device/session revocation management beyond a single access token.

---

## 14. Dependencies

| Dependency | Type | Notes |
| --- | --- | --- |
| Database (MySQL) | Technical | Required tables: `users`, `roles`, `password_reset_otps` |
| Email service (SMTP) | Technical | Needed for OTP delivery; must fail safely if missing |
| Feature: Schedule/Booking | Internal | Protected endpoints depend on authenticated identity |

---

## 15. Open Questions

| ID | Question | Owner | Status |
| --- | --- | --- | --- |
| Q-FE01-001 | Should token expiry be 24h (current util) or 15m access token + refresh token? | Dat | Open |
| Q-FE01-002 | Should registration create a token immediately or require email verification first? | Dat | Open |
| Q-FE01-003 | Should Staff/Owner/Admin accounts require forced password setup flow? | Dat | Open |

---

## 16. Traceability Matrix

| AC ID | Related FR ID | Related BR ID | Test Case ID | Status |
| --- | --- | --- | --- | --- |
| AC-FE01-001 | FR-FE01-001 | BR-FE01-001 | TC-FE01-001 | Not Started |
| AC-FE01-002 | FR-FE01-002 | BR-FE01-001 | TC-FE01-002 | Not Started |
| AC-FE01-003 | FR-FE01-001 | BR-FE01-001 | TC-FE01-003 | Not Started |
| AC-FE01-004 | FR-FE01-003 | BR-FE01-003 | TC-FE01-004 | Not Started |
| AC-FE01-005 | FR-FE01-004 | BR-FE01-006 | TC-FE01-005 | Not Started |
| AC-FE01-006 | FR-FE01-005 | BR-FE01-004 | TC-FE01-006 | Not Started |
| AC-FE01-007 | FR-FE01-006 | BR-FE01-005 | TC-FE01-007 | Not Started |
| AC-FE01-008 | FR-FE01-007 | BR-FE01-005 | TC-FE01-008 | Not Started |
| AC-FE01-009 | FR-FE01-008 | BR-FE01-003 | TC-FE01-009 | Not Started |

Summary:

| Item | Count | Fully Mapped? |
| --- | ---:| --- |
| AC | 9 | Yes |
| FR | 8 | Yes |
| BR | 7 | Yes |
| Test Cases | 9 | Yes |

---

## 17. Review Checklist

- [ ] Business context is clear and matches project scope.
- [ ] Actors and permissions include non-user actors (SMTP, audit logs).
- [ ] Preconditions are explicit and testable.
- [ ] All BR/FR/AC/EC IDs follow the required format and are unique.
- [ ] API contract matches implemented routes or clearly marked TBD.
- [ ] Non-functional requirements include security, txn integrity, logging.
- [ ] Open questions are actionable and owned.
- [ ] Traceability matrix covers all ACs with tests.
