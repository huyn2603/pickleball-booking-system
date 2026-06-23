# SPEC.md - FE12 Internal Account Management

Version: 0.1.0
Status: DRAFT
Owner: Dat
Last Updated: 2026-06-23
Feature ID: FE12
Feature folder: `.sdd/specs/feature-internal-account/`

Business context (short): Owner/Admin must manage internal accounts (Staff) and enforce role + branch scope. This depends on FE01 authentication and uses the `users` table (role_id, branch_id, status). Incorrect implementation risks privilege escalation and data leakage.

---

## 1. Feature Overview

### 1.1 Feature Name

FE12 Internal Account Management

### 1.2 Business Context

This feature directly controls who can operate the system. Any mistake can enable unauthorized access, cross-branch leakage, or privilege escalation.

### 1.3 Goal / Outcome

The system will:

- Allow Owner/Admin to create Staff accounts and assign branch scope.
- Allow Owner/Admin to update role/status for internal accounts.
- Allow Owner/Admin to deactivate/block accounts and immediately revoke access.
- Ensure management responses never expose passwords/hashes.

### 1.4 Scope Level

- [x] Full Spec — high security and authorization impact
- [ ] Standard Spec
- [ ] Light Spec

---

## 2. Actors and Permissions

| Actor | Description | Permission / Responsibility |
| --- | --- | --- |
| Admin | System administrator | Full internal account management |
| Owner | Business owner | Manage staff accounts in allowed scope |
| Staff | Internal operator | Cannot self-escalate role; limited self profile only (if any) |
| Audit Log Store | Storage | Records account changes for accountability |

---

## 3. Preconditions

- PRE-FE12-001: Admin/Owner is authenticated and authorized.
- PRE-FE12-002: Roles exist in `roles` table with stable codes.
- PRE-FE12-003: Branch records exist for assignment (if branch-scoped staff is enabled).

---

## 4. Main Flows

### MF-FE12-001: Create Staff Account

1. Admin/Owner submits staff profile (full name, Gmail email, phone), role, and branch assignment (if required).
2. System validates input and uniqueness constraints.
3. System creates user with `status = Active` (or `Unverified` if requiring setup flow) and role_id.
4. System returns safe user profile (no password fields).

### MF-FE12-002: Update Account Role/Status/Branch

1. Admin/Owner selects an account.
2. System validates permissions (Owner cannot assign higher roles than allowed).
3. System updates role/status/branch fields and records audit log.

### MF-FE12-003: Deactivate/Block Account

1. Admin/Owner sets `status` to `Inactive` or `Blocked`.
2. System invalidates existing sessions/tokens per auth strategy.
3. System returns updated profile.

---

## 5. Alternative Flows

| ID | Alternative Flow |
| --- | --- |
| AF-FE12-001 | Attempt to assign Admin role by non-Admin → reject. |
| AF-FE12-002 | Attempt to manage account outside scope → reject. |
| AF-FE12-003 | Email duplicate → reject with validation error. |

---

## 6. Business Rules

- BR-FE12-001: Only Admin/Owner can manage internal accounts.
- BR-FE12-002: Non-Admin cannot grant roles higher than their own (no privilege escalation).
- BR-FE12-003: Blocked/Inactive accounts cannot authenticate or use existing tokens.
- BR-FE12-004: Passwords and password hashes must never be returned in management responses.

---

## 7. Functional Requirements

- FR-FE12-001: When an internal account is created, the system shall validate Gmail-only email and uniqueness.
- FR-FE12-002: When role/status is updated, the system shall enforce authorization constraints and record an audit entry.
- FR-FE12-003: If an account is blocked/inactive, then the system shall deny login and protected actions.

---

## 8. Acceptance Criteria

- AC-FE12-001: Given Admin creates a Staff account with Gmail email, when saved, then staff can authenticate and is scoped appropriately.
- AC-FE12-002: Given Owner sets staff status to inactive, when staff tries to login, then login is denied immediately.
- AC-FE12-003: Given a user management endpoint returns a user, when responding, then no password fields are present.
- AC-FE12-004: Given Staff attempts to change their role, when request is made, then system rejects.

---

## 9. Edge Cases and Error Handling

| ID | Edge Case / Error | Expected System Behavior |
| --- | --- | --- |
| EC-FE12-001 | Token still valid after blocking | Enforce status checks on each request or token revocation strategy |
| EC-FE12-002 | Owner tries to manage Admin accounts | Reject |
| EC-FE12-003 | Account tied to historical audit logs | Preserve history; do not delete user records |

---

## 10. Data Requirements

### 10.1 Entities Involved

| Entity | Purpose in this feature |
| --- | --- |
| `users` | Stores staff identity, branch assignment, role, status |
| `roles` | Role mapping and codes |
| `branches` | Branch assignment for staff scope |
| `audit_logs` | Audit account changes |

### 10.2 Data Fields

| Field | Type | Required | Validation / Notes |
| --- | --- | --- | --- |
| `users.email` | string | Yes | Gmail-only, unique |
| `users.role_id` | id | Yes | Must refer to roles |
| `users.branch_id` | id | No | Required if staff is branch-scoped |
| `users.status` | enum | Yes | Active/Inactive/Blocked/Unverified |

---

## 11. API / Interface Contract

| Method | Endpoint | Actor | Request | Response | Notes |
| --- | --- | --- | --- | --- | --- |
| GET | `/api/admin/users` | Admin/Owner | `?role&branchId&status` | `{ success, items }` | Paginated |
| POST | `/api/admin/users` | Admin/Owner | `{ fullName, email, phone, roleId, branchId? }` | `{ success, user }` | Create |
| PATCH | `/api/admin/users/:id` | Admin/Owner | `{ roleId?, status?, branchId? }` | `{ success, user }` | Update |

---

## 12. Non-functional Requirements

### 12.1 Security

- NFR-FE12-SEC-001: Strict role checks for every endpoint (no privilege escalation).
- NFR-FE12-SEC-002: Prevent IDOR; verify scope for every managed account access.

### 12.2 Transaction Integrity

- NFR-FE12-TXN-001: Account updates and audit log entries should be consistent.

### 12.3 Performance

- NFR-FE12-PERF-001: Admin user listing must be paginated and indexed by role/status/branch.

### 12.4 Logging and Audit

- NFR-FE12-LOG-001: Account changes must be auditable (who changed what, when).

### 12.5 Usability

- NFR-FE12-UX-001: Admin errors should indicate why a change is not allowed (role escalation, invalid scope).

---

## 13. Out of Scope

- Full HR onboarding automation.
- MFA enforcement policies.

---

## 14. Dependencies

| Dependency | Type | Notes |
| --- | --- | --- |
| FE01 Authentication | Internal | Enforces account status on auth |
| FE05 Branch & Court | Internal | Branch assignment reference |
| Database (MySQL) | Technical | `users`, `roles` tables |

---

## 15. Open Questions

| ID | Question | Owner | Status |
| --- | --- | --- | --- |
| Q-FE12-001 | Do internal accounts require forced password setup via email link in Phase 1? | Dat | Open |
| Q-FE12-002 | Is Staff strictly branch-scoped or can staff operate across branches? | Dat | Open |

---

## 16. Traceability Matrix

| AC ID | Related FR ID | Related BR ID | Test Case ID | Status |
| --- | --- | --- | --- | --- |
| AC-FE12-001 | FR-FE12-001 | BR-FE12-001 | TC-FE12-001 | Not Started |
| AC-FE12-002 | FR-FE12-003 | BR-FE12-003 | TC-FE12-002 | Not Started |
| AC-FE12-003 | FR-FE12-002 | BR-FE12-004 | TC-FE12-003 | Not Started |
| AC-FE12-004 | FR-FE12-002 | BR-FE12-002 | TC-FE12-004 | Not Started |

Summary:

| Item | Count | Fully Mapped? |
| --- | ---:| --- |
| AC | 4 | Yes |
| FR | 3 | Yes |
| BR | 4 | Yes |
| Test Cases | 4 | Yes |

---

## 17. Review Checklist

- [ ] Privilege escalation and scope rules are explicit and tested.
- [ ] Status enforcement is clarified (deny login + deny API).
- [ ] No password exposure in responses.
- [ ] Traceability matrix maps ACs to tests.
