# Constitution - Pickleball Court Booking System

Version: 0.2.0
Status: DRAFT
Owner: Project Team
Last Updated: 2026-06-23

## 1. Project Purpose

This project is a Pickleball Court Booking System for SWP391. It supports a
small multi-branch venue operation in Ha Noi where customers can view courts,
hold slots, book court time, pay, receive notifications, and review their
history. Staff operate daily bookings at the counter. Owners and admins manage
courts, branches, pricing, add-on services, vouchers, accounts, and reports.

The system exists to solve four practical problems:

- Customers need a clear way to find available court time and book it without
  calling staff manually.
- Staff need a reliable daily operations screen for confirmation, check-in,
  check-out, payment recording, cancellation, and add-on stock updates.
- Owners need controlled management tools for pricing, courts, branches,
  vouchers, services, and reports.
- The team needs a specification source of truth so code, database, UI, and
  feature scope stay aligned.

## 2. Approved Technical Stack

| Layer | Approved Decision | Notes |
| --- | --- | --- |
| Backend runtime | Node.js | Existing backend uses CommonJS modules |
| Backend framework | Express.js | REST API under `/api/*` |
| Frontend | React with Vite | Main UI currently lives in `frontend/src/App.jsx` |
| Database | MySQL 8.0+ | Canonical import file: `mysql-workbench-schema.sql` |
| SQL engine | InnoDB | Required for FK constraints and transactions |
| Charset/collation | `utf8mb4` / `utf8mb4_unicode_ci` | Supports Vietnamese text |
| API style | RESTful API | JSON request/response |
| Auth | Token-based application auth | Gmail-only customer rule in current phase |
| Currency | VND | Stored as integer amounts |
| Timezone | `Asia/Ho_Chi_Minh` | Business operation timezone |

Any change to this stack must update this constitution, `shared_context.md`,
affected ADRs, feature specs, and setup instructions.

## 3. Development Method

The team follows Hybrid Spec-Driven and Agent-Driven Development.

### 3.1 Spec-Driven Development

Spec-Driven Development is mandatory for:

- Feature scope and user stories.
- Business rules such as hold expiry, refund policy, and double-booking
  prevention.
- Database design, constraints, triggers, and financial record keeping.
- API contracts and authorization rules.
- Security-sensitive flows such as auth, OTP, staff actions, payment, refund,
  and account management.

No core feature should be implemented until its `SPEC.md` is clear enough to
answer:

- Who can use it?
- What data does it create/read/update?
- What business rule can reject the operation?
- What response should the UI receive?
- What state transition happens on success?
- What should be logged or audited?

### 3.2 Agent-Driven Development

Agent assistance can be used for:

- Drafting or refining specs.
- Generating implementation plans.
- Producing focused code changes that follow approved specs.
- Writing tests, verification notes, and review checklists.
- Refactoring modules without changing behavior.
- Updating docs after behavior changes.

Agent output must still be reviewed against the SDD source of truth.

## 4. Source Of Truth

The project-level source of truth is:

```text
.sdd/specs/PROJECT_SPEC.md
```

The feature-level source of truth is:

```text
.sdd/specs/feature-{name}/SPEC.md
```

Implementation must follow this order:

1. Feature `SPEC.md`
2. Feature `PLAN.md`
3. Feature `TASKS.md`
4. `.sdd/specs/PROJECT_SPEC.md`
5. `.sdd/constraints/*.md`
6. `.sdd/shared_context.md`
7. Database/schema documents
8. Current code implementation

If code conflicts with an approved spec, update the spec before treating the
code as the intended behavior.

## 5. Domain Principles

- DP-001: Availability must be accurate. The system must never knowingly allow
  two active bookings or holds for the same court/time overlap.
- DP-002: Server-side state is authoritative. Client-side totals, availability,
  roles, and payment status are hints only.
- DP-003: Time windows must be explicit. Booking, hold expiry, cancellation,
  refund, check-in, and check-out logic must use clear timestamps.
- DP-004: Financial history is append-first. Failed payments, successful
  payments, refunds, and manual actions should be preserved for audit and
  reporting instead of silently overwritten.
- DP-005: Role boundaries matter. Staff, owner, and admin capabilities must be
  enforced by backend authorization, not only UI visibility.
- DP-006: Operational failures must be safe. Email, webhook, or report failures
  must not corrupt booking/payment state.

## 6. Change Control

### 6.1 Feature Change

Any observable behavior change must update:

- The related feature `SPEC.md`.
- The related `CHANGELOG.md`.
- `PROJECT_SPEC.md` if the behavior is project-wide.
- Acceptance criteria if the expected result changes.

### 6.2 Data Model Change

Any table, column, enum, trigger, index, or relationship change must update:

- `mysql-workbench-schema.sql`
- `database.md`
- Affected feature specs
- `shared_context.md` if the entity model changes
- ADRs if the database strategy changes

### 6.3 Security Change

Any auth, token, password, OTP, role, permission, audit, payment, or sensitive
logging change must be reviewed against:

```text
.sdd/constraints/safety.md
```

### 6.4 Documentation Compatibility

The project currently has both `constitution.md` and `constitutions.md`.
`constitution.md` is canonical. `constitutions.md` is kept as a compatibility
pointer only.

## 7. Review Gates

Before a feature is considered ready for implementation:

- The scope is clear.
- Actors and permissions are defined.
- Main and alternative flows are described.
- Business rules have stable IDs.
- API contract is listed.
- Data model impact is listed.
- Acceptance criteria are testable.
- Open questions are either resolved or explicitly marked as out of scope.

Before a feature is considered done:

- Code follows the approved spec.
- Manual or automated verification was performed.
- Security and role checks were considered.
- Database changes, if any, are documented.
- `CHANGELOG.md` is updated.

## 8. Non-Negotiable Rules

- Never commit secrets.
- Never trust frontend role checks as the security boundary.
- Never return passwords, password hashes, raw OTP values, reset tokens, or
  private auth material in API responses.
- Never create a booking/hold if the requested court/time overlaps an active
  booking or hold.
- Never change payment/refund behavior without updating the financial spec.
- Never import unrelated domain specs as active requirements.
