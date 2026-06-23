# SPEC.md - FE05 Branch & Court Management

Version: 0.1.0
Status: DRAFT
Owner: Dat
Last Updated: 2026-06-23
Feature ID: FE05
Feature folder: `.sdd/specs/feature-branch-court/`

Business context (short): This feature maintains authoritative branch and court data used by schedule/booking and operations. It involves Owner/Admin/Staff and depends on database tables `branches` and `courts`. Errors here break availability and pricing correctness.

---

## 1. Feature Overview

### 1.1 Feature Name

FE05 Branch & Court Management

### 1.2 Business Context

Branches and courts are master data for all downstream flows. Wrong status or incorrect branch/court mapping can lead to bookings on closed courts, incorrect reporting, and operational incidents.

### 1.3 Goal / Outcome

The system will:

- Allow Owner/Admin to create and maintain branches.
- Allow Owner/Admin to create and maintain courts under a branch.
- Enforce court status gating (`available`, `maintenance`, `inactive`) for booking eligibility.
- Prefer soft-deactivation over hard delete to preserve history.

### 1.4 Scope Level

- [x] Standard Spec
- [ ] Full Spec
- [ ] Light Spec

---

## 2. Actors and Permissions

| Actor | Description | Permission / Responsibility |
| --- | --- | --- |
| Owner | Business owner | Create/update/disable branches and courts |
| Admin | System admin | Full management access |
| Staff | Operational staff | May update court status to maintenance (policy-dependent) |
| Customer | Books courts | Read-only usage via availability views |
| Database | Storage | Stores `branches`, `courts` |

---

## 3. Preconditions

- PRE-FE05-001: Actor is authenticated and authorized (Owner/Admin; Staff if allowed for maintenance).
- PRE-FE05-002: Branch code and court code uniqueness constraints exist.

---

## 4. Main Flows

### MF-FE05-001: Create/Update Branch

1. Owner/Admin submits branch details (`code`, `name`, `address`, `open_time`, `close_time`, `status`).
2. System validates uniqueness and business constraints (open < close).
3. System persists and returns the branch record.

### MF-FE05-002: Create/Update Court

1. Owner/Admin selects a branch and submits court details (`code`, `name`, `court_type`, `surface_type`, pricing defaults, `status`).
2. System validates uniqueness within branch and pricing constraints.
3. System persists and returns the court record.

### MF-FE05-003: Change Court Status

1. Owner/Admin (or Staff if allowed) changes court status to `maintenance`/`inactive`/`available`.
2. System persists status change and ensures availability logic respects the new status immediately.

---

## 5. Alternative Flows

| ID | Alternative Flow |
| --- | --- |
| AF-FE05-001 | Branch code already exists → reject with safe validation error. |
| AF-FE05-002 | Court code already exists within branch → reject. |
| AF-FE05-003 | Attempt to hard delete a court with future bookings → reject or require deactivation. |

---

## 6. Business Rules

- BR-FE05-001: Branch `code` must be unique.
- BR-FE05-002: Court `code` must be unique per branch.
- BR-FE05-003: Courts in `maintenance` or `inactive` must not be eligible for holds/bookings.
- BR-FE05-004: Courts must not be hard-deleted if it breaks booking/audit history; use deactivation.

---

## 7. Functional Requirements

- FR-FE05-001: When Owner/Admin creates a branch, the system shall validate unique `code` and required fields.
- FR-FE05-002: When Owner/Admin creates a court, the system shall validate branch existence and unique `(branch_id, code)`.
- FR-FE05-003: When court status is updated, the system shall enforce booking eligibility gating immediately.
- FR-FE05-004: If a delete request would break history, then the system shall reject or convert to soft deactivation.

---

## 8. Acceptance Criteria

- AC-FE05-001: Given Admin provides valid branch data, when creating a branch, then the branch is persisted and can host courts.
- AC-FE05-002: Given Owner creates a new court under a branch, when status is `available`, then it appears in availability views.
- AC-FE05-003: Given a court is set to `maintenance`, when Customers view availability, then the court is not bookable.
- AC-FE05-004: Given a court has future bookings, when attempting to delete, then the system prevents hard delete and preserves history.

---

## 9. Edge Cases and Error Handling

| ID | Edge Case / Error | Expected System Behavior |
| --- | --- | --- |
| EC-FE05-001 | Renaming codes after bookings exist | Prefer immutable codes; if allowed, preserve history and update references safely |
| EC-FE05-002 | Court toggled to maintenance while holds exist | Booking/hold creation must re-check; existing holds may be invalidated per policy |

---

## 10. Data Requirements

### 10.1 Entities Involved

| Entity | Purpose in this feature |
| --- | --- |
| `branches` | Branch master data and operating hours |
| `courts` | Court master data, defaults, and status |

### 10.2 Data Fields

| Field | Type | Required | Validation / Notes |
| --- | --- | --- | --- |
| `branches.code` | string | Yes | Unique |
| `branches.open_time` | time | Yes | Must be < `close_time` |
| `courts.branch_id` | id | Yes | FK to branches |
| `courts.status` | enum | Yes | `available`/`maintenance`/`inactive` |
| `courts.base_price_per_hour` | number | Yes | Must be >= 0 |

---

## 11. API / Interface Contract

| Method | Endpoint | Actor | Request | Response | Notes |
| --- | --- | --- | --- | --- | --- |
| GET | `/api/branches` | Owner/Admin | N/A | `{ success, branches }` | Management list |
| POST | `/api/branches` | Owner/Admin | `{ code, name, ... }` | `{ success, branch }` | Validate unique code |
| GET | `/api/courts` | Owner/Admin/Customer | `?branchId=...` | `{ success, courts }` | Customer may use read-only |
| POST | `/api/courts` | Owner/Admin | `{ branchId, code, name, ... }` | `{ success, court }` | Validate unique code per branch |
| PATCH | `/api/courts/:id/status` | Owner/Admin/Staff | `{ status, reason? }` | `{ success, court }` | Policy decides Staff permission |

---

## 12. Non-functional Requirements

### 12.1 Security

- NFR-FE05-SEC-001: Only authorized roles can create/update/disable branches and courts.

### 12.2 Transaction Integrity

- NFR-FE05-TXN-001: Status updates must not leave courts in inconsistent states (single-row update, consistent view for availability).

### 12.3 Performance

- NFR-FE05-PERF-001: Listing courts by branch must remain responsive under typical dataset sizes.

### 12.4 Logging and Audit

- NFR-FE05-LOG-001: Status changes should be logged with actor id and timestamp.

### 12.5 Usability

- NFR-FE05-UX-001: Validation errors should clearly indicate which field violates constraints (without leaking sensitive data).

---

## 13. Out of Scope

- Detailed pricing strategy (owned by FE08).
- Maintenance scheduling windows (owned by FE14).

---

## 14. Dependencies

| Dependency | Type | Notes |
| --- | --- | --- |
| Database (MySQL) | Technical | `branches`, `courts` tables |
| FE02 Schedule & Booking | Internal | Reads court statuses |
| FE08 Pricing Rules | Internal | Uses court pricing defaults and overrides |

---

## 15. Open Questions

| ID | Question | Owner | Status |
| --- | --- | --- | --- |
| Q-FE05-001 | Can Staff change court status to maintenance in v1, or only Owner/Admin? | Dat | Open |
| Q-FE05-002 | Are branch/court codes immutable after creation? | Dat | Open |

---

## 16. Traceability Matrix

| AC ID | Related FR ID | Related BR ID | Test Case ID | Status |
| --- | --- | --- | --- | --- |
| AC-FE05-001 | FR-FE05-001 | BR-FE05-001 | TC-FE05-001 | Not Started |
| AC-FE05-002 | FR-FE05-002 | BR-FE05-002 | TC-FE05-002 | Not Started |
| AC-FE05-003 | FR-FE05-003 | BR-FE05-003 | TC-FE05-003 | Not Started |
| AC-FE05-004 | FR-FE05-004 | BR-FE05-004 | TC-FE05-004 | Not Started |

Summary:

| Item | Count | Fully Mapped? |
| --- | ---:| --- |
| AC | 4 | Yes |
| FR | 4 | Yes |
| BR | 4 | Yes |
| Test Cases | 4 | Yes |

---

## 17. Review Checklist

- [ ] Role permissions and status gating rules are explicit.
- [ ] Soft-delete policy is documented and testable.
- [ ] API contract aligns with current routes or is marked TBD.
- [ ] Traceability matrix maps ACs to tests.
