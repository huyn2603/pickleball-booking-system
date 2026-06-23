# CONTEXT.md - FE18 Ops Dashboard

# Version: 0.1.0

# Status: DRAFT

# Owner: Dat

# Last Updated: 2026-06-23

# Feature folder: .sdd/specs/feature-ops-dashboard/

---

## 1. Feature Purpose

This feature exists to deliver the user journeys defined in SPEC.md for this module.

This feature must keep three things consistent:

- Business rules
- Authorization boundaries
- Audit logs for key events

---

## 2. Real-World Workflow

Typical workflow:

1. User triggers the flow for this feature.
2. System validates input and permissions.
3. System reads/writes data in database tables as needed.
4. System returns a result and logs critical events.
5. Client updates UI and handles error states.

---

## 3. Feature Boundary

FE18 includes:

- Implement all acceptance scenarios in SPEC.md
- Validate input on server
- Enforce role/branch scope where applicable

FE18 does not include:

- Anything explicitly out of scope in SPEC.md

---

## 4. Current Data Model Notes

The current SQL script includes tables such as:

- settings, branches, roles, users, password_reset_otps, courts, price_rules, categories, addon_services, promotions, vouchers, bookings, booking_slots, slot_holds, booking_addons, payment_transactions, refunds, feedback, email_logs, audit_logs

Potential issues to review:

- Use transactions for multi-step operations
- Do not trust client-calculated totals
- Avoid exposing sensitive fields

---

## 5. Main Use Cases From Assignment Sheet

| Use Case ID | Use Case Name | Owner |
| ----------- | ------------- | ----- |
| US-PB-20 | Dashboard vận hành nâng cao | Dat |

---

## 6. Feature Tests From Assignment Sheet

| Test ID | Test Name | Owner |
| ------- | --------- | ----- |
| FT-US-PB-20 | Dashboard vận hành nâng cao | Dat |

---

## 7. Key Risks

- Missing authorization checks
- Inconsistent state without transactions
- Poor error handling causes bad UX

---

## 8. Dependencies

| Dependency | Why It Matters |
| ---------- | -------------- |
| Database | Stores feature data and audit logs |
| Auth | Protects endpoints and user scope |
| Frontend | Implements UI flow and error states |

---

## 9. Resolved Questions For Team / Teacher

| ID | Approved Decision | Source | Status |
| -- | ----------------- | ------ | ------ |
| N/A | TBD | TBD | TBD |

---

## 10. Notes For Implementation Later

- Do not implement until SPEC.md is reviewed and approved.
- PLAN.md and TASKS.md stay NOT STARTED until approval.
- Use parameterized queries.
- Do not log secrets.
