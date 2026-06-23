# SPEC.md - FE06 Add-ons

Version: 0.1.0
Status: DRAFT
Owner: Dat
Last Updated: 2026-06-23
Feature ID: FE06
Feature folder: `.sdd/specs/feature-addon/`

Business context (short): Add-ons (rental/sale items) increase revenue and are attached to bookings. Owners/Staff manage catalog and stock; Customers select add-ons during booking. It depends on FE02 booking creation and server-side totals, and uses `addon_services` and `booking_addons`.

---

## 1. Feature Overview

### 1.1 Feature Name

FE06 Add-ons

### 1.2 Business Context

Incorrect add-on pricing/stock handling causes revenue leakage and disputes at the counter. Stock must not go negative, and historical bookings must retain the add-on price at purchase time for reconciliation.

### 1.3 Goal / Outcome

The system will:

- Allow Owner/Admin (and Staff where permitted) to create/update/disable add-on services.
- Track stock and availability for add-ons.
- Attach selected add-ons to bookings and compute totals server-side.
- Preserve add-on history for past bookings even if catalog items are later disabled.

### 1.4 Scope Level

- [x] Standard Spec
- [ ] Full Spec
- [ ] Light Spec

---

## 2. Actors and Permissions

| Actor | Description | Permission / Responsibility |
| --- | --- | --- |
| Customer | Purchases add-ons | Can select add-ons during booking and view details in history |
| Staff | Operates stock | Can adjust stock quantities (policy-defined) |
| Owner/Admin | Manages catalog | Full CRUD and activation state |
| Database | Storage | Stores catalog and booking-linked add-ons |

---

## 3. Preconditions

- PRE-FE06-001: Actor is authenticated and authorized for catalog/stock actions.
- PRE-FE06-002: Add-on categories exist (if required by schema) and are active.
- PRE-FE06-003: Booking creation flow supports add-on selection (FE02/FE03 integration).

---

## 4. Main Flows

### MF-FE06-001: Manage Add-on Catalog

1. Owner/Admin creates an add-on service with `code`, `name`, `service_type`, `price`, `stock_quantity`, and `is_active`.
2. System validates unique code and non-negative price/stock.
3. System returns the updated catalog.

### MF-FE06-002: Select Add-ons During Booking

1. Customer selects one or more add-ons with quantities during booking draft creation.
2. System validates add-on is active and sufficient stock exists.
3. System stores booking-linked add-ons with unit price at the time of booking.
4. System recalculates totals server-side.

### MF-FE06-003: Staff Stock Adjustment

1. Staff updates `stock_quantity` for an add-on (e.g., end-of-day reconciliation).
2. System validates stock cannot be negative.
3. System persists and logs the change.

---

## 5. Alternative Flows

| ID | Alternative Flow |
| --- | --- |
| AF-FE06-001 | Customer selects an inactive add-on → reject selection. |
| AF-FE06-002 | Customer requests quantity exceeding stock → reject. |
| AF-FE06-003 | Concurrent bookings attempt to consume the last stock → enforce consistency or reject conflict. |

---

## 6. Business Rules

- BR-FE06-001: Only active add-ons with sufficient stock may be selected for new bookings.
- BR-FE06-002: Stock quantity must never become negative.
- BR-FE06-003: Historical bookings must preserve the add-on unit price at purchase time.
- BR-FE06-004: Disabling an add-on must not delete historical booking add-on records.
- BR-FE06-005: Add-on totals must be calculated server-side and included in booking totals.

---

## 7. Functional Requirements

- FR-FE06-001: When an admin manages add-ons, the system shall validate unique codes and store catalog data.
- FR-FE06-002: If an add-on is inactive or out of stock, then the system shall reject selection for new bookings.
- FR-FE06-003: When add-ons are attached to a booking, the system shall store quantity and unit price at booking time.
- FR-FE06-004: When totals are computed, the system shall include add-on costs and ignore client totals.
- FR-FE06-005: When staff updates stock, the system shall validate stock >= 0 and persist audit metadata.

---

## 8. Acceptance Criteria

- AC-FE06-001: Given Owner creates an add-on with valid fields, when saved, then it appears as selectable for bookings (if active).
- AC-FE06-002: Given an add-on is out of stock, when a Customer selects it, then the system rejects and indicates not available.
- AC-FE06-003: Given an add-on is disabled later, when viewing old bookings, then add-on line items still appear in history.
- AC-FE06-004: Given a Customer sends manipulated add-on totals, when creating booking, then backend calculates add-on totals authoritatively.

---

## 9. Edge Cases and Error Handling

| ID | Edge Case / Error | Expected System Behavior |
| --- | --- | --- |
| EC-FE06-001 | Stock race condition | Use transactional decrement or safe conflict handling |
| EC-FE06-002 | Price changes after booking | Do not modify past booking add-on prices |
| EC-FE06-003 | Negative stock update | Reject with validation error |

---

## 10. Data Requirements

### 10.1 Entities Involved

| Entity | Purpose in this feature |
| --- | --- |
| `addon_services` | Catalog of add-ons (rental/sale), price, active status, stock |
| `booking_addons` | Booking-linked add-ons with quantity and unit price |
| `categories` | Catalog grouping (if used) |

### 10.2 Data Fields

| Field | Type | Required | Validation / Notes |
| --- | --- | --- | --- |
| `addon_services.code` | string | Yes | Unique |
| `addon_services.price` | number | Yes | Must be >= 0 |
| `addon_services.stock_quantity` | number | Yes | Must be >= 0 |
| `booking_addons.quantity` | number | Yes | Must be >= 1 |
| `booking_addons.unit_price` | number | Yes | Frozen at booking time |

---

## 11. API / Interface Contract

| Method | Endpoint | Actor | Request | Response | Notes |
| --- | --- | --- | --- | --- | --- |
| GET | `/api/addons` | Customer/Staff/Owner/Admin | `?active=true` | `{ success, addons }` | Customer uses active-only |
| POST | `/api/addons` | Owner/Admin | `{ code, name, ... }` | `{ success, addon }` | Create |
| PATCH | `/api/addons/:id` | Owner/Admin | `{ ... }` | `{ success, addon }` | Update |
| PATCH | `/api/addons/:id/stock` | Staff/Owner/Admin | `{ stockQuantity }` | `{ success, addon }` | Stock adjustment |

---

## 12. Non-functional Requirements

### 12.1 Security

- NFR-FE06-SEC-001: Catalog and stock endpoints must enforce role-based access.

### 12.2 Transaction Integrity

- NFR-FE06-TXN-001: Booking add-on creation and booking total calculation must be consistent.
- NFR-FE06-TXN-002: Stock adjustments must not result in negative stock.

### 12.3 Performance

- NFR-FE06-PERF-001: Add-on listing must be fast enough for booking UI.

### 12.4 Logging and Audit

- NFR-FE06-LOG-001: Stock changes should record actor and timestamp for reconciliation.

### 12.5 Usability

- NFR-FE06-UX-001: The system must provide clear “out of stock” feedback during selection.

---

## 13. Out of Scope

- Supplier procurement and purchase orders.
- Warehouse multi-location inventory.

---

## 14. Dependencies

| Dependency | Type | Notes |
| --- | --- | --- |
| FE02 Schedule & Booking | Internal | Add-ons attach during booking draft creation |
| FE03 Payment & Refund | Internal | Stock reservation/commit policy depends on payment confirmation |
| Database (MySQL) | Technical | `addon_services`, `booking_addons` |

---

## 15. Open Questions

| ID | Question | Owner | Status |
| --- | --- | --- | --- |
| Q-FE06-001 | When is stock decremented: on hold, on booking draft, or on payment confirmation? | Dat | Open |
| Q-FE06-002 | Are add-ons branch-specific or global catalog in v1? | Dat | Open |

---

## 16. Traceability Matrix

| AC ID | Related FR ID | Related BR ID | Test Case ID | Status |
| --- | --- | --- | --- | --- |
| AC-FE06-001 | FR-FE06-001 | BR-FE06-001 | TC-FE06-001 | Not Started |
| AC-FE06-002 | FR-FE06-002 | BR-FE06-002 | TC-FE06-002 | Not Started |
| AC-FE06-003 | FR-FE06-003 | BR-FE06-004 | TC-FE06-003 | Not Started |
| AC-FE06-004 | FR-FE06-004 | BR-FE06-005 | TC-FE06-004 | Not Started |

Summary:

| Item | Count | Fully Mapped? |
| --- | ---:| --- |
| AC | 4 | Yes |
| FR | 5 | Yes |
| BR | 5 | Yes |
| Test Cases | 4 | Yes |

---

## 17. Review Checklist

- [ ] Stock handling policy (decrement timing) is decided or captured in open questions.
- [ ] Server-side totals and unit price freezing are explicit.
- [ ] Role permissions for catalog/stock endpoints are clear.
- [ ] Traceability matrix maps ACs to tests.
