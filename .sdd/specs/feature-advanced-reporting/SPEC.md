# SPEC.md - FE16 Advanced Reporting

Version: 0.1.0
Status: DRAFT
Owner: Dat
Last Updated: 2026-06-23
Feature ID: FE16
Feature folder: `.sdd/specs/feature-advanced-reporting/`

Business context (short): Advanced reporting supports analysis and optimization (peak hours, top courts, trends, add-on performance). It depends on FE07 definitions, and must remain consistent with booking/payment/refund sources of truth.

---

## 1. Feature Overview

### 1.1 Feature Name

FE16 Advanced Reporting

### 1.2 Business Context

Advanced metrics influence pricing and staffing decisions. If inconsistent with basic reporting or double-counts transactions, it leads to wrong business decisions.

### 1.3 Goal / Outcome

The system will:

- Provide analytics metrics: peak hours, top courts, booking trends, cancellation rate, top add-ons.
- Support bounded date ranges for queries.
- Ensure aggregation logic does not double-count payments per booking.

### 1.4 Scope Level

- [x] Standard Spec
- [ ] Full Spec
- [ ] Light Spec

---

## 2. Actors and Permissions

| Actor | Description | Permission / Responsibility |
| --- | --- | --- |
| Owner/Admin | Analysts | Can view advanced metrics |
| Reporting Engine | Backend | Computes metrics and ensures consistency |

---

## 3. Preconditions

- PRE-FE16-001: Basic reporting definitions are agreed (FE07).
- PRE-FE16-002: Data exists for a minimum period to compute trends.
- PRE-FE16-003: Date range limits are defined.

---

## 4. Main Flows

### MF-FE16-001: Trend Dashboard

1. Owner selects a date range (e.g., last 30 days) and optional branch.
2. System returns time-series revenue and booking counts per day.

### MF-FE16-002: Peak Hour and Top Court

1. Owner requests peak-hour metrics for the range.
2. System aggregates bookings by hour and by court, returns ranked lists.

### MF-FE16-003: Add-on Performance

1. Owner requests top add-ons by revenue or quantity.
2. System returns ranked results and time-series if requested.

---

## 5. Alternative Flows

| ID | Alternative Flow |
| --- | --- |
| AF-FE16-001 | Date range too large → reject or require aggregation granularity. |
| AF-FE16-002 | Missing data for period → return empty metrics with clear messaging. |

---

## 6. Business Rules

- BR-FE16-001: Aggregations must not double-count bookings due to multiple payment attempts.
- BR-FE16-002: Metrics must remain consistent with FE07 within the same period and filters.
- BR-FE16-003: Reporting endpoints must enforce role scope.

---

## 7. Functional Requirements

- FR-FE16-001: When advanced metrics are requested, the system shall compute peak hour, top courts, and trends for the selected range.
- FR-FE16-002: If multiple transactions exist per booking, then the system shall use the final successful payment/refund model to avoid double counting.
- FR-FE16-003: When a user lacks permission for the requested scope, the system shall reject or restrict the scope.

---

## 8. Acceptance Criteria

- AC-FE16-001: Given Owner selects last 30 days, when requesting trends, then daily revenue and booking counts are returned.
- AC-FE16-002: Given bookings exist in peak hours, when requesting peak hour metrics, then hours are ranked by utilization.
- AC-FE16-003: Given add-ons are sold, when requesting top add-ons, then top add-ons are returned by revenue or quantity.
- AC-FE16-004: Given multiple payment attempts exist, when computing revenue metrics, then bookings are not double-counted.

---

## 9. Edge Cases and Error Handling

| ID | Edge Case / Error | Expected System Behavior |
| --- | --- | --- |
| EC-FE16-001 | Booking cancelled after payment | Use refund rules to reflect net revenue correctly |
| EC-FE16-002 | Timezone/date boundary | Use consistent system timezone for grouping |

---

## 10. Data Requirements

### 10.1 Entities Involved

| Entity | Purpose in this feature |
| --- | --- |
| `bookings` | Utilization and counts |
| `payment_transactions` | Revenue source |
| `refunds` | Net adjustments |
| `booking_addons` | Add-on performance |
| `courts` | Top courts grouping |

### 10.2 Data Fields

| Field | Type | Required | Validation / Notes |
| --- | --- | --- | --- |
| `bookings.booking_date` | date | Yes | Trend grouping |
| `booking_slots.start_time` | time | Yes | Peak hour computation |
| `payment_transactions.amount` | number | Yes | Revenue aggregation |

---

## 11. API / Interface Contract

| Method | Endpoint | Actor | Request | Response | Notes |
| --- | --- | --- | --- | --- | --- |
| GET | `/api/reports/advanced/trends` | Owner/Admin | `?from&to&branchId?` | `{ success, series }` | Bounded |
| GET | `/api/reports/advanced/peak-hours` | Owner/Admin | `?from&to&branchId?` | `{ success, items }` | Ranked |
| GET | `/api/reports/advanced/top-courts` | Owner/Admin | `?from&to&branchId?` | `{ success, items }` | Ranked |
| GET | `/api/reports/advanced/top-addons` | Owner/Admin | `?from&to&branchId?&by=revenue|qty` | `{ success, items }` | Ranked |

---

## 12. Non-functional Requirements

### 12.1 Security

- NFR-FE16-SEC-001: Reporting endpoints must enforce scope by role.

### 12.2 Transaction Integrity

- NFR-FE16-TXN-001: Aggregation must use consistent definitions for revenue/refunds.

### 12.3 Performance

- NFR-FE16-PERF-001: Default endpoints must enforce bounded date ranges and indexes.

### 12.4 Logging and Audit

- NFR-FE16-LOG-001: Report requests should be logged for troubleshooting.

### 12.5 Usability

- NFR-FE16-UX-001: Metrics must clearly define their computation basis (net/gross, refunds).

---

## 13. Out of Scope

- External BI integrations and data warehouse exports.

---

## 14. Dependencies

| Dependency | Type | Notes |
| --- | --- | --- |
| FE07 Basic Reporting | Internal | Definitions consistency |
| FE03 Payment & Refund | Internal | Transaction sources |
| Database (MySQL) | Technical | Aggregation queries |

---

## 15. Open Questions

| ID | Question | Owner | Status |
| --- | --- | --- | --- |
| Q-FE16-001 | Do we precompute materialized aggregates or compute on demand in Phase 1? | Dat | Open |

---

## 16. Traceability Matrix

| AC ID | Related FR ID | Related BR ID | Test Case ID | Status |
| --- | --- | --- | --- | --- |
| AC-FE16-001 | FR-FE16-001 | BR-FE16-002 | TC-FE16-001 | Not Started |
| AC-FE16-002 | FR-FE16-001 | BR-FE16-002 | TC-FE16-002 | Not Started |
| AC-FE16-003 | FR-FE16-001 | BR-FE16-002 | TC-FE16-003 | Not Started |
| AC-FE16-004 | FR-FE16-002 | BR-FE16-001 | TC-FE16-004 | Not Started |

Summary:

| Item | Count | Fully Mapped? |
| --- | ---:| --- |
| AC | 4 | Yes |
| FR | 3 | Yes |
| BR | 3 | Yes |
| Test Cases | 4 | Yes |

---

## 17. Review Checklist

- [ ] Metrics definitions are consistent with basic reporting.
- [ ] Double-count prevention is explicitly tested.
- [ ] Date range limits and performance constraints are defined.
- [ ] Traceability matrix maps ACs to tests.
