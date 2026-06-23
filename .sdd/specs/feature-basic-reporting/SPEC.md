# SPEC.md - FE07 Basic Reporting

Version: 0.1.0
Status: DRAFT
Owner: Dat
Last Updated: 2026-06-23
Feature ID: FE07
Feature folder: `.sdd/specs/feature-basic-reporting/`

Business context (short): Basic reporting provides daily/monthly operational and revenue snapshots to Owner/Admin. It depends on authoritative booking/payment/refund data and must apply consistent revenue definitions to avoid reconciliation issues.

---

## 1. Feature Overview

### 1.1 Feature Name

FE07 Basic Reporting

### 1.2 Business Context

Owners use basic reporting for daily decisions and reconciliation. Incorrect aggregation (double-counting, ignoring refunds, inconsistent date ranges) creates financial and operational risk.

### 1.3 Goal / Outcome

The system will:

- Provide daily and monthly KPIs (bookings, gross revenue, net revenue, refunds, cancellation fees).
- Support branch-scoped and system-wide views based on role permissions.
- Ensure metrics are consistent with the underlying payment/refund records.

### 1.4 Scope Level

- [x] Standard Spec
- [ ] Full Spec
- [ ] Light Spec

---

## 2. Actors and Permissions

| Actor | Description | Permission / Responsibility |
| --- | --- | --- |
| Owner | Business owner | View branch reports; may view system-wide if permitted |
| Admin | System admin | View system-wide and branch-level reports |
| Staff | Operator | Optional: may view limited metrics (policy-defined) |
| Reporting Engine | Backend aggregation | Computes metrics consistently |

---

## 3. Preconditions

- PRE-FE07-001: Payment and refund data exists (`payment_transactions`, `refunds`).
- PRE-FE07-002: Date range inputs are validated and bounded.
- PRE-FE07-003: Role permissions for branch vs system scope are defined.

---

## 4. Main Flows

### MF-FE07-001: Daily Report by Branch

1. Owner selects branch and date.
2. System aggregates booking counts by status and revenue metrics for the day.
3. System returns a KPI snapshot.

### MF-FE07-002: Monthly Report (System-wide)

1. Admin selects month and optional branch filter.
2. System aggregates metrics for the month and returns totals (and per-branch breakdown if requested).

---

## 5. Alternative Flows

| ID | Alternative Flow |
| --- | --- |
| AF-FE07-001 | User without system-wide permission requests system scope → reject or downgrade to branch scope. |
| AF-FE07-002 | Date range too large → reject with validation error or require pagination. |

---

## 6. Business Rules

- BR-FE07-001: Reporting must not double-count bookings due to multiple payment attempts.
- BR-FE07-002: Net revenue must subtract successful refunds and include cancellation fees consistently.
- BR-FE07-003: Report scope must respect role permissions and branch assignment rules.
- BR-FE07-004: Metrics must be computed from authoritative transaction tables.

---

## 7. Functional Requirements

- FR-FE07-001: When a report is requested, the system shall return booking counts and revenue metrics for the selected period.
- FR-FE07-002: If refunds exist for the period, then the system shall reflect them in net revenue calculations.
- FR-FE07-003: When a user requests a scope they are not permitted to view, the system shall deny or restrict the scope.

---

## 8. Acceptance Criteria

- AC-FE07-001: Given an Owner selects a branch and date, when requesting a report, then booking totals and net revenue are returned.
- AC-FE07-002: Given an Admin selects system-wide monthly report, when requesting the report, then totals and per-branch breakdown are returned.
- AC-FE07-003: Given cancelled bookings and refunds exist, when net revenue is computed, then refunds are subtracted and cancellation fees are represented separately.

---

## 9. Edge Cases and Error Handling

| ID | Edge Case / Error | Expected System Behavior |
| --- | --- | --- |
| EC-FE07-001 | Multiple failed payment attempts for one booking | Do not count as revenue |
| EC-FE07-002 | Refund recorded after report period | Respect transaction timestamps and defined reporting cutoff |
| EC-FE07-003 | Missing branch filter | Apply role-based default scope |

---

## 10. Data Requirements

### 10.1 Entities Involved

| Entity | Purpose in this feature |
| --- | --- |
| `bookings` | Booking counts and statuses |
| `payment_transactions` | Source of gross revenue |
| `refunds` | Source of refunds/cancellation fees |
| `branches` | Scope grouping and filtering |

### 10.2 Data Fields

| Field | Type | Required | Validation / Notes |
| --- | --- | --- | --- |
| `payment_transactions.amount` | number | Yes | Sum of successful payments |
| `refunds.amount` | number | Yes | Sum of successful refunds |
| `bookings.branch_id` | id | Yes | Used for scope filtering |
| `bookings.booking_date` | date | Yes | Used for date grouping |

---

## 11. API / Interface Contract

| Method | Endpoint | Actor | Request | Response | Notes |
| --- | --- | --- | --- | --- | --- |
| GET | `/api/reports/basic/daily` | Owner/Admin | `?branchId&date` | `{ success, metrics }` | Branch daily |
| GET | `/api/reports/basic/monthly` | Admin | `?month&year&branchId?` | `{ success, metrics }` | Optional breakdown |

---

## 12. Non-functional Requirements

### 12.1 Security

- NFR-FE07-SEC-001: Reporting endpoints must enforce role-based scope.

### 12.2 Transaction Integrity

- NFR-FE07-TXN-001: Aggregation must be consistent with booking/payment/refund definitions (no partial states).

### 12.3 Performance

- NFR-FE07-PERF-001: Default queries must enforce bounded date ranges to avoid heavy scans.

### 12.4 Logging and Audit

- NFR-FE07-LOG-001: Report requests should be logged (actor, parameters) for audit and troubleshooting.

### 12.5 Usability

- NFR-FE07-UX-001: Metrics must use consistent labels (gross, net, refund, fee) to avoid operator confusion.

---

## 13. Out of Scope

- Advanced analytics (owned by FE16).
- BI exports and scheduled report emailing (future).

---

## 14. Dependencies

| Dependency | Type | Notes |
| --- | --- | --- |
| FE03 Payment & Refund | Internal | Defines revenue/refund source of truth |
| FE05 Branch & Court | Internal | Branch filters |
| Database (MySQL) | Technical | Reporting queries read transactional tables |

---

## 15. Open Questions

| ID | Question | Owner | Status |
| --- | --- | --- | --- |
| Q-FE07-001 | What is the exact definition of “gross revenue” vs “net revenue” for partial refunds? | Dat | Open |

---

## 16. Traceability Matrix

| AC ID | Related FR ID | Related BR ID | Test Case ID | Status |
| --- | --- | --- | --- | --- |
| AC-FE07-001 | FR-FE07-001 | BR-FE07-002 | TC-FE07-001 | Not Started |
| AC-FE07-002 | FR-FE07-001 | BR-FE07-003 | TC-FE07-002 | Not Started |
| AC-FE07-003 | FR-FE07-002 | BR-FE07-001 | TC-FE07-003 | Not Started |

Summary:

| Item | Count | Fully Mapped? |
| --- | ---:| --- |
| AC | 3 | Yes |
| FR | 3 | Yes |
| BR | 4 | Yes |
| Test Cases | 3 | Yes |

---

## 17. Review Checklist

- [ ] Revenue definitions are explicit and consistent with payment/refund tables.
- [ ] Scope and permissions are enforced.
- [ ] Date range validation and default bounds are defined.
- [ ] Traceability matrix maps ACs to tests.
