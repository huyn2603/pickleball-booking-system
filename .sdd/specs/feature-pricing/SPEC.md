# SPEC.md - FE08 Pricing Rules

Version: 0.1.0
Status: DRAFT
Owner: Dat
Last Updated: 2026-06-23
Feature ID: FE08
Feature folder: `.sdd/specs/feature-pricing/`

Business context (short): Pricing rules determine the authoritative price per slot for bookings. Owner/Admin configure time-based rules at system/branch/court scope. It depends on FE05 court data and is consumed by FE02 booking totals and FE03 payments.

---

## 1. Feature Overview

### 1.1 Feature Name

FE08 Pricing Rules

### 1.2 Business Context

Pricing errors directly impact revenue and customer trust. Priority and overlap handling must be deterministic to avoid inconsistent totals across API calls and reports.

### 1.3 Goal / Outcome

The system will:

- Support pricing rules by day-of-week and time windows.
- Support scoping: system-wide, branch-specific, and court-specific.
- Apply deterministic rule selection using `priority`.
- Freeze final booking totals when a booking is confirmed (pricing changes must not retroactively modify past confirmed bookings).

### 1.4 Scope Level

- [x] Standard Spec
- [ ] Full Spec
- [ ] Light Spec

---

## 2. Actors and Permissions

| Actor | Description | Permission / Responsibility |
| --- | --- | --- |
| Owner/Admin | Configures pricing | Can create/update/disable pricing rules |
| Customer | Pays booking price | Consumes calculated totals only |
| Pricing Engine | Backend logic | Selects applicable rule deterministically |

---

## 3. Preconditions

- PRE-FE08-001: Actor is authenticated and authorized to manage pricing.
- PRE-FE08-002: Courts/branches exist for scoping.
- PRE-FE08-003: Booking service uses pricing engine for totals.

---

## 4. Main Flows

### MF-FE08-001: Create Pricing Rule

1. Owner/Admin submits a `price_rules` record: scope (branch_id/court_id), day_of_week, time window, price_per_slot, priority, validity dates.
2. System validates time window and range constraints.
3. System persists and returns the rule.

### MF-FE08-002: Apply Pricing Rule During Booking

1. Booking service requests price calculation for a specific court/date/time.
2. Pricing engine selects the best rule using scope specificity and `priority`.
3. System returns price_per_slot and calculation metadata.

---

## 5. Alternative Flows

| ID | Alternative Flow |
| --- | --- |
| AF-FE08-001 | Overlapping rules with equal priority cause ambiguity → reject on create or define tie-breaker. |
| AF-FE08-002 | Rule expired/inactive → ignore in selection. |

---

## 6. Business Rules

- BR-FE08-001: Pricing rule selection must be deterministic for the same inputs.
- BR-FE08-002: Court-level rules take precedence over branch-level rules, which take precedence over system-wide rules (unless priority model defines otherwise).
- BR-FE08-003: For overlapping applicable rules, the one with lowest `priority` value (highest priority) must be selected.
- BR-FE08-004: Pricing changes must not modify totals for already confirmed bookings.

---

## 7. Functional Requirements

- FR-FE08-001: When creating/updating a pricing rule, the system shall validate time window constraints and required fields.
- FR-FE08-002: When calculating booking price, the system shall select the applicable rule deterministically.
- FR-FE08-003: If no rule applies, then the system shall fall back to court default pricing safely.
- FR-FE08-004: When a booking is confirmed, the system shall persist the computed totals and not recompute retroactively.

---

## 8. Acceptance Criteria

- AC-FE08-001: Given a peak-hour rule exists, when booking within its time window, then the peak price is applied.
- AC-FE08-002: Given branch-specific and system-wide rules exist, when booking in that branch, then branch rule is applied if priority qualifies.
- AC-FE08-003: Given a court-specific rule exists, when booking that court, then court rule is applied as highest specificity.
- AC-FE08-004: Given pricing rules change, when viewing a previously confirmed booking, then its stored total does not change.

---

## 9. Edge Cases and Error Handling

| ID | Edge Case / Error | Expected System Behavior |
| --- | --- | --- |
| EC-FE08-001 | Overlapping rules with same priority | Reject rule creation or enforce stable tie-breaker |
| EC-FE08-002 | Rule valid_to before valid_from | Reject with validation error |
| EC-FE08-003 | Invalid day_of_week values | Reject with validation error |

---

## 10. Data Requirements

### 10.1 Entities Involved

| Entity | Purpose in this feature |
| --- | --- |
| `price_rules` | Stores rule definitions and priorities |
| `courts` | Provides defaults and scope reference |
| `branches` | Provides scope reference |

### 10.2 Data Fields

| Field | Type | Required | Validation / Notes |
| --- | --- | --- | --- |
| `price_rules.start_time` | time | Yes | Must be < end_time |
| `price_rules.end_time` | time | Yes | Must be > start_time |
| `price_rules.price_per_slot` | number | Yes | Must be >= 0 |
| `price_rules.priority` | number | Yes | Lower means higher priority |
| `price_rules.is_active` | boolean | Yes | Inactive rules are ignored |

---

## 11. API / Interface Contract

| Method | Endpoint | Actor | Request | Response | Notes |
| --- | --- | --- | --- | --- | --- |
| GET | `/api/pricing/rules` | Owner/Admin | `?branchId&courtId` | `{ success, rules }` | Management listing |
| POST | `/api/pricing/rules` | Owner/Admin | `{ ... }` | `{ success, rule }` | Create |
| PATCH | `/api/pricing/rules/:id` | Owner/Admin | `{ ... }` | `{ success, rule }` | Update |
| GET | `/api/pricing/quote` | Auth user | `?courtId&date&startTime&endTime` | `{ success, quote }` | Used by booking totals |

---

## 12. Non-functional Requirements

### 12.1 Security

- NFR-FE08-SEC-001: Only Owner/Admin can modify pricing rules.

### 12.2 Transaction Integrity

- NFR-FE08-TXN-001: Rule updates must not cause partial reads; apply standard transactional write behavior.

### 12.3 Performance

- NFR-FE08-PERF-001: Pricing selection must be efficient for interactive booking totals calculation.

### 12.4 Logging and Audit

- NFR-FE08-LOG-001: Pricing rule changes must be auditable (actor, timestamp).

### 12.5 Usability

- NFR-FE08-UX-001: Rule conflicts must be clearly explained to admins (overlaps, ambiguity).

---

## 13. Out of Scope

- Dynamic demand-based pricing.
- Coupon stacking policies (owned by voucher feature).

---

## 14. Dependencies

| Dependency | Type | Notes |
| --- | --- | --- |
| FE05 Branch & Court | Internal | Provides scope entities |
| FE02 Schedule & Booking | Internal | Consumes quotes for totals |
| Database (MySQL) | Technical | `price_rules` |

---

## 15. Open Questions

| ID | Question | Owner | Status |
| --- | --- | --- | --- |
| Q-FE08-001 | What is the exact rule tie-breaker when two applicable rules have the same priority? | Dat | Open |

---

## 16. Traceability Matrix

| AC ID | Related FR ID | Related BR ID | Test Case ID | Status |
| --- | --- | --- | --- | --- |
| AC-FE08-001 | FR-FE08-002 | BR-FE08-003 | TC-FE08-001 | Not Started |
| AC-FE08-002 | FR-FE08-002 | BR-FE08-002 | TC-FE08-002 | Not Started |
| AC-FE08-003 | FR-FE08-002 | BR-FE08-002 | TC-FE08-003 | Not Started |
| AC-FE08-004 | FR-FE08-004 | BR-FE08-004 | TC-FE08-004 | Not Started |

Summary:

| Item | Count | Fully Mapped? |
| --- | ---:| --- |
| AC | 4 | Yes |
| FR | 4 | Yes |
| BR | 4 | Yes |
| Test Cases | 4 | Yes |

---

## 17. Review Checklist

- [ ] Rule selection and tie-breakers are deterministic and documented.
- [ ] Booking total freezing policy is explicit.
- [ ] API contract is aligned or marked TBD.
- [ ] Traceability matrix maps ACs to tests.
