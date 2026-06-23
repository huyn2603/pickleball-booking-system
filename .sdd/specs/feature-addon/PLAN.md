# PLAN.md - FE06 Add-ons

Status: READY FOR REVIEW
Date: 2026-06-23
Owner: Dat

## 1. Purpose

Implement FE06 Add-ons according to the approved `SPEC.md` and the MySQL schema, enabling staff/admin to manage optional services attached to bookings.

## 2. Source Documents

- `.sdd/specs/feature-addon/SPEC.md`
- `README.md` (US-PB-08 scope)
- `mysql-workbench-schema.sql` (tables: `categories`, `addon_services`, `booking_addons`, `bookings`, `audit_logs`)
- `backend/src/routes/staffRoutes.js` (addon stock update)
- `backend/src/controllers/staffController.js`
- `backend/src/models/Staff.js`

## 3. Scope

### In Scope

- List add-on catalog for use in booking flow.
- Attach add-ons to a booking and persist selected items.
- Staff updates add-on stock quantity.
- Server-side validation: no negative stock; only authorized roles can update stock.

### Out Of Scope

- Full add-on CRUD UI/API beyond MVP if not implemented yet (planned).
- Complex inventory reservations per booking slot (phase 2+).

## 4. Approved Technical Decisions

| Area | Decision |
| --- | --- |
| Data model | Add-ons stored in `addon_services` and linked via `booking_addons`. |
| Stock updates | Stock changes via staff endpoint, role-protected. |
| Pricing | Backend remains source of truth for totals when add-ons are involved. |

## 5. Database Dependencies

Required tables/fields exist in `mysql-workbench-schema.sql`:

- `categories`, `addon_services`: add-on catalog and stock.
- `booking_addons`: association between booking and add-ons.
- `bookings`: totals and linkage.
- `audit_logs`: record inventory changes (planned/partial).

## 6. API Endpoints

Implement/verify FE06 endpoints (current + planned):

| Method | Endpoint | Purpose |
| --- | --- | --- |
| PATCH | `/api/staff/addons/:id/stock` | Update addon stock quantity. |

Add-on catalog endpoints (list/create/update): TBD if required by `SPEC.md` and not yet implemented.

## 7. Backend File Plan

Expected backend files:

```text
backend/src/routes/staffRoutes.js
backend/src/controllers/staffController.js
backend/src/models/Staff.js
backend/src/models/Booking.js (booking totals)
```

## 8. Frontend File Plan

Expected frontend integration files:

```text
frontend/src/pages/* (addon management, addon selection in booking)
frontend/src/services/* (addon client)
```

## 9. Test Strategy

### Unit Tests

- Stock update validation (non-negative).
- Add-on total calculation rules (when attached to booking).

### Integration Tests

- Staff updates stock successfully; unauthorized role is blocked.
- Booking includes add-ons and persists correctly in `booking_addons`.

## 10. Risks And Mitigations

| Risk | Mitigation |
| --- | --- |
| Stock inconsistencies | Validate inputs and record changes; consider transactional updates. |
| Price mismatch | Recalculate totals server-side and return authoritative totals. |
| Unauthorized inventory changes | Enforce auth + role checks. |

## 11. Validation Gate

- All TASKS.md items are complete.
- Stock update endpoint is protected and validated.
- Booking flow can include add-ons without breaking totals.
