# PLAN.md - FE05 Branch & Court Management

Status: READY FOR REVIEW
Date: 2026-06-23
Owner: Dat

## 1. Purpose

Implement FE05 Branch & Court Management according to the approved `SPEC.md` and the MySQL schema for branches/courts, enabling Admin/Owner to manage operational data that booking depends on.

## 2. Source Documents

- `.sdd/specs/feature-branch-court/SPEC.md`
- `README.md` (US-PB-07 scope)
- `mysql-workbench-schema.sql` (tables: `branches`, `courts`, `settings`, `audit_logs`)
- `backend/src/routes/courtRoutes.js`
- `backend/src/controllers/courtController.js`
- `backend/src/models/Court.js`

## 3. Scope

### In Scope

- List courts (with branch context).
- Create/update/delete courts (Admin/Owner only).
- Update court status: `available` / `maintenance` / `inactive`.
- Serve court availability for scheduling.
- Branch visibility in schedule via joins in `Court.list()` (branches table).

### Out Of Scope

- Full branch CRUD API if not present in backend yet (planned).
- Multi-tenant franchise management.

## 4. Approved Technical Decisions

| Area | Decision |
| --- | --- |
| Authorization | Only `Admin`/`Owner` can manage courts. |
| Status model | Court status blocks booking when `maintenance` or `inactive`. |
| Data safety | If a court has bookings, deletion should be avoided; use maintenance/inactive instead. |

## 5. Database Dependencies

Required tables/fields exist in `mysql-workbench-schema.sql`:

- `branches`: operational branch info and open/close times.
- `courts`: court info, type, surface, status, pricing fields.
- `settings`: fallback open/close times.
- `audit_logs`: record admin/staff management actions (planned/partial).

## 6. API Endpoints

Implement/verify FE05 endpoints:

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/api/courts` | List courts (filter by branch/type). |
| POST | `/api/courts` | Create court (Admin/Owner). |
| GET | `/api/courts/:id` | Court detail. |
| PATCH | `/api/courts/:id` | Update court (Admin/Owner). |
| DELETE | `/api/courts/:id` | Delete court (Admin/Owner). |
| GET | `/api/courts/:id/availability?date=YYYY-MM-DD` | Court availability. |

Branch CRUD endpoints: TBD if required by `SPEC.md` and not yet implemented.

## 7. Backend File Plan

Expected backend files:

```text
backend/src/routes/courtRoutes.js
backend/src/controllers/courtController.js
backend/src/models/Court.js
backend/src/middleware/auth.js
```

## 8. Frontend File Plan

Expected frontend integration files:

```text
frontend/src/pages/* (admin branch/court management)
frontend/src/services/* (court client)
```

## 9. Test Strategy

### Unit Tests

- Court payload validation and status rules.
- Authorization checks for Admin/Owner.

### Integration Tests

- Admin creates/updates a court; non-admin is blocked.
- Court in maintenance is not bookable (availability reflects it).

## 10. Risks And Mitigations

| Risk | Mitigation |
| --- | --- |
| Deleting courts with bookings breaks integrity | Prefer soft-disable via status; prevent delete when linked to bookings. |
| Missing branch CRUD blocks admin workflows | Implement branch endpoints as a follow-up if required. |
| Incorrect status enforcement | Enforce status checks in booking/hold logic and availability endpoint. |

## 11. Validation Gate

- All TASKS.md items are complete.
- Court status correctly blocks holds/bookings.
- Admin/Owner authorization enforced for management endpoints.
