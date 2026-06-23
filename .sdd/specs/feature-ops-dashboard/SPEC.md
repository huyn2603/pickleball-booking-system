# SPEC.md - FE18 Ops Dashboard

Version: 0.1.0
Status: DRAFT
Owner: Dat
Last Updated: 2026-06-23
Feature ID: FE18
Feature folder: `.sdd/specs/feature-ops-dashboard/`

Business context (short): Ops dashboard provides a strategic view combining reporting and quality signals (utilization, cancellations, feedback, staff/branch performance). It depends on FE07/FE16 metrics and FE11 feedback, and must enforce scope permissions.

---

## 1. Feature Overview

### 1.1 Feature Name

FE18 Ops Dashboard

### 1.2 Business Context

This dashboard is used for management decisions. If it leaks cross-branch data or uses inconsistent revenue definitions, it becomes misleading and risky.

### 1.3 Goal / Outcome

The system will:

- Provide a dashboard view for Owner/Admin with KPI tiles and branch comparisons.
- Highlight operational exceptions (high cancellation rate, low ratings, anomalies).
- Respect role-based scope and branch filters.

### 1.4 Scope Level

- [x] Light Spec
- [ ] Standard Spec
- [ ] Full Spec

---

## 2. Actors and Permissions

| Actor | Description | Permission / Responsibility |
| --- | --- | --- |
| Owner | Manager | Can view dashboards within permitted scope |
| Admin | System admin | Can view system-wide dashboards |
| Dashboard Engine | Backend | Aggregates metrics from reporting and feedback sources |

---

## 3. Preconditions

- PRE-FE18-001: Reporting metrics endpoints exist (FE07/FE16) or equivalent queries exist.
- PRE-FE18-002: Feedback data exists (FE11) for quality signals.
- PRE-FE18-003: Scope permission model is defined (branch vs system).

---

## 4. Main Flows

### MF-FE18-001: View Monthly Dashboard

1. Owner/Admin selects period (month) and optional branch filter.
2. System returns KPI tiles (utilization, revenue, cancellations, refunds) and exceptions.

### MF-FE18-002: Branch Comparison

1. Admin requests system-wide comparison for a period.
2. System returns per-branch ranked metrics and highlights outliers.

---

## 5. Alternative Flows

| ID | Alternative Flow |
| --- | --- |
| AF-FE18-001 | User requests out-of-scope branch data → reject or restrict. |
| AF-FE18-002 | Period too large → require bounded range. |

---

## 6. Business Rules

- BR-FE18-001: Dashboard metrics must use the same revenue definitions as FE07/FE16.
- BR-FE18-002: Dashboard must respect role-based scope.
- BR-FE18-003: Exception highlights must be derived from defined thresholds.

---

## 7. Functional Requirements

- FR-FE18-001: When dashboard is requested, the system shall return KPI tiles for the selected period and scope.
- FR-FE18-002: If the user lacks permission for the requested scope, then the system shall reject or restrict output.
- FR-FE18-003: When exceptions are computed, the system shall apply configured thresholds and return explainable flags.

---

## 8. Acceptance Criteria

- AC-FE18-001: Given Admin requests system dashboard for current month, when loading, then per-branch comparison is returned.
- AC-FE18-002: Given a branch has many low ratings, when viewing dashboard, then that branch is flagged for follow-up.
- AC-FE18-003: Given a user without system scope requests system dashboard, when loading, then access is denied safely.

---

## 9. Edge Cases and Error Handling

| ID | Edge Case / Error | Expected System Behavior |
| --- | --- | --- |
| EC-FE18-001 | Data mismatch between basic and advanced reporting | Flag discrepancy and ensure consistent definitions |
| EC-FE18-002 | Missing feedback data | Show “no data” rather than misleading zeros |

---

## 10. Data Requirements

### 10.1 Entities Involved

| Entity | Purpose in this feature |
| --- | --- |
| Reporting metrics | Revenue/utilization base data |
| Feedback metrics | Quality signals |
| Branches | Grouping and comparison |

### 10.2 Data Fields

| Field | Type | Required | Validation / Notes |
| --- | --- | --- | --- |
| `branch_id` | id | Yes | Scope filter |
| `period` | date range | Yes | Bounded |
| `net_revenue` | number | Yes | Consistent definition |

---

## 11. API / Interface Contract

| Method | Endpoint | Actor | Request | Response | Notes |
| --- | --- | --- | --- | --- | --- |
| GET | `/api/dashboard/ops` | Owner/Admin | `?from&to&branchId?` | `{ success, dashboard }` | Aggregated response |

---

## 12. Non-functional Requirements

### 12.1 Security

- NFR-FE18-SEC-001: Enforce scope permissions for all dashboard data.

### 12.2 Transaction Integrity

- NFR-FE18-TXN-001: Dashboard must use consistent aggregation definitions (no partial states).

### 12.3 Performance

- NFR-FE18-PERF-001: Enforce bounded date ranges and caching where safe.

### 12.4 Logging and Audit

- NFR-FE18-LOG-001: Log dashboard requests (actor, scope) for monitoring.

### 12.5 Usability

- NFR-FE18-UX-001: Dashboard must clearly label KPIs and thresholds.

---

## 13. Out of Scope

- Real-time monitoring/alerting system with paging.

---

## 14. Dependencies

| Dependency | Type | Notes |
| --- | --- | --- |
| FE07 Basic Reporting | Internal | KPI source definitions |
| FE16 Advanced Reporting | Internal | Advanced metrics |
| FE11 Feedback | Internal | Quality signals |

---

## 15. Open Questions

| ID | Question | Owner | Status |
| --- | --- | --- | --- |
| Q-FE18-001 | What are the thresholds for “high cancellation rate” and “low rating” alerts? | Dat | Open |

---

## 16. Traceability Matrix

| AC ID | Related FR ID | Related BR ID | Test Case ID | Status |
| --- | --- | --- | --- | --- |
| AC-FE18-001 | FR-FE18-001 | BR-FE18-001 | TC-FE18-001 | Not Started |
| AC-FE18-002 | FR-FE18-003 | BR-FE18-003 | TC-FE18-002 | Not Started |
| AC-FE18-003 | FR-FE18-002 | BR-FE18-002 | TC-FE18-003 | Not Started |

Summary:

| Item | Count | Fully Mapped? |
| --- | ---:| --- |
| AC | 3 | Yes |
| FR | 3 | Yes |
| BR | 3 | Yes |
| Test Cases | 3 | Yes |

---

## 17. Review Checklist

- [ ] Scope permissions and revenue definitions are consistent with reporting features.
- [ ] Exception thresholds are defined or captured as open questions.
- [ ] Traceability matrix maps ACs to tests.
