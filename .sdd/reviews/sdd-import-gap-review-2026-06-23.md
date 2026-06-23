# SDD Import Gap Review - 2026-06-23

Status: COMPLETED
Reviewer: Codex
Target Project: Pickleball Court Booking System

## 1. Source

Reviewed archive:

```text
C:\Users\admin\Downloads\library-management-system\library-management-system\.sdd.zip
```

The archive contained a complete `.sdd` folder for a Library Management System.
It had project-level constitution/context files, constraints, review records,
ADRs/RFCs, a skills folder, and many detailed feature specs.

## 2. Current Project State Before Import

The target project already had:

- `.sdd/specs/PROJECT_SPEC.md`
- `.sdd/specs/README.md`
- `.sdd/specs/template.md`
- Pickleball feature folders for auth, booking, payment/refund, staff operation,
  branch/court management, add-ons, pricing, reporting, notification, feedback,
  voucher, maintenance, quick rebook, slot suggestion, and operations dashboard.
- Empty `.sdd/README.md`
- Empty `.sdd/constitutions.md`

The target project did not yet have detailed SDD-level:

- Canonical constitution file.
- Shared context file.
- Constraints folder.
- RFC/ADR folder.
- Reviews folder.
- Skills folder.
- Dedicated class/layer inventory.

## 3. Import Decision

The reusable SDD structure was imported/adapted, but the content was rewritten
for the pickleball project.

Library-specific feature specs were not imported as active requirements because
they describe a different business:

- Books and book copies.
- Borrowing and returning.
- Overdue fines.
- Library members/readers.
- Librarian workflows.
- SQL Server stack assumptions.

The target project instead uses:

- Courts and branches.
- Slot holds and bookings.
- Staff daily booking operations.
- Payments and refunds.
- Add-on services and vouchers.
- MySQL schema.

## 4. Added Or Expanded Files

| File | Action | Purpose |
| --- | --- | --- |
| `.sdd/README.md` | Expanded | SDD index, feature map, source-of-truth order |
| `.sdd/constitution.md` | Added/expanded | Project principles, stack, change control, review gates |
| `.sdd/constitutions.md` | Filled | Compatibility pointer to canonical `constitution.md` |
| `.sdd/shared_context.md` | Added/expanded | Domain summary, actors, workflows, state machines, data groups |
| `.sdd/class_inventory.md` | Added | Backend/frontend/database class and layer inventory |
| `.sdd/constraints/global.md` | Added/expanded | Engineering, API, data, testing, documentation rules |
| `.sdd/constraints/business.md` | Added/expanded | Pickleball business rules with stable IDs |
| `.sdd/constraints/safety.md` | Added/expanded | Security, auth, payment, logging, UI safety rules |
| `.sdd/rfcs/README.md` | Added/expanded | ADR usage guide |
| `.sdd/rfcs/ADR-001-architecture.md` | Added/expanded | Application architecture decision |
| `.sdd/rfcs/ADR-002-database-design.md` | Added/expanded | MySQL/database design decision |
| `.sdd/rfcs/ADR-003-authentication-approach.md` | Added/expanded | Token/Gmail/role auth decision |
| `.sdd/reviews/README.md` | Added/expanded | Review file conventions |
| `.sdd/reviews/sdd-import-gap-review-2026-06-23.md` | Added/expanded | This import decision record |
| `.sdd/skills/README.md` | Added/expanded | Reusable project review skills |
| `.sdd/skills/.gitkeep` | Added | Keep folder tracked |
| `.sdd/rfcs/.gitkeep` | Added | Keep folder tracked |
| `.sdd/specs/_template.md` | Added/expanded | Detailed feature spec template |

## 5. Existing Project Specs Kept

The existing pickleball feature specs were kept as the active domain source of
truth:

```text
.sdd/specs/feature-*
```

Reason: They already describe the actual target project and match
`PROJECT_SPEC.md`.

## 6. Class And Layer Check

The backend currently uses CommonJS modules and function exports, not ES
`class` declarations. Therefore, no literal JavaScript class files were copied.

Current backend modules include:

- `backend/src/models/User.js`
- `backend/src/models/Booking.js`
- `backend/src/models/Court.js`
- `backend/src/models/Staff.js`
- `backend/src/models/PasswordResetOtp.js`
- `backend/src/controllers/authController.js`
- `backend/src/controllers/bookingController.js`
- `backend/src/controllers/courtController.js`
- `backend/src/controllers/staffController.js`
- `backend/src/routes/authRoutes.js`
- `backend/src/routes/bookingRoutes.js`
- `backend/src/routes/courtRoutes.js`
- `backend/src/routes/staffRoutes.js`

The detailed inventory is now documented in:

```text
.sdd/class_inventory.md
```

## 7. Not Imported

The following archive areas are intentionally not imported as active specs:

| Archive Folder | Reason |
| --- | --- |
| `.sdd/specs/feat-book-management` | Library-specific book catalog domain |
| `.sdd/specs/feat-borrowing-management` | Library borrowing/returning domain |
| `.sdd/specs/feat-fine-management` | Library overdue fine domain |
| `.sdd/specs/feat-inventory-book-copy` | Book-copy inventory domain |
| `.sdd/specs/feat-membership-management` | Library member domain |
| `.sdd/specs/feat-public-browse` | Similar name, different library browsing behavior |
| `.sdd/specs/feat-reporting-statistics` | Reporting exists here, but metrics differ |
| `.sdd/specs/feat-reservation-management` | Similar reservation concept, different entities |
| `.sdd/specs/feat-user-profile` | Similar user concept, but existing pickleball spec should remain source |
| `.sdd/specs/feat-user-role-management` | Similar role concept, but existing internal account spec should remain source |
| `.sdd/specs/feat-notification-management` | Similar notification concept, but content is library-specific |

## 8. Risks Avoided

- Avoided mixing book/borrow/fine requirements into a court-booking system.
- Avoided changing implementation code from documentation import alone.
- Avoided forcing ES classes into a project that currently uses function-based
  CommonJS modules.
- Avoided treating SQL Server assumptions from the archive as active MySQL
  requirements.

## 9. Remaining Gaps

| Gap | Impact | Suggested Follow-Up |
| --- | --- | --- |
| Many backend rules still live directly in model/controller modules | Harder to test booking/payment logic independently | Add service modules when implementing larger features |
| `frontend/src/App.jsx` is large | Harder UI maintenance | Split into components after behavior is stable |
| No dedicated validator layer | Repeated validation logic | Add validators for auth, booking, staff, court forms |
| Branch-scope authorization is still an open design question | Potential data leakage if staff should be branch-limited | Resolve in relevant feature specs |
| Token expiry policy needs final confirmation | Auth security/UX tradeoff | Resolve in FE01 |

## 10. Final Verdict

The project now has the missing SDD structure and detailed project-level files
adapted to the pickleball domain. The external library specs should remain
reference material only, not active requirements.
