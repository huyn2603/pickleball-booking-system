# SDD Workspace - Pickleball Court Booking System

Version: 0.2.0
Status: DRAFT
Last Updated: 2026-06-23

This folder stores the Spec-Driven Development source of truth for the
Pickleball Court Booking System. It is intentionally written as project
documentation, not just notes for one developer. A teammate should be able to
open this folder and understand the project boundary, core domain rules,
feature map, architecture decisions, database impact, safety rules, and current
implementation layers.

The archive provided by the user contained a detailed `.sdd` structure for a
Library Management System. This project is a Pickleball Court Booking System,
so this folder keeps the same SDD style and folder classes, but rewrites the
content for the actual project domain.

## 1. Folder Structure

| Path | Purpose | Owner / Usage |
| --- | --- | --- |
| `constitution.md` | Project-wide rules: source of truth, approved stack, change control, review gates | Read before implementing core features |
| `constitutions.md` | Legacy compatibility file that points to `constitution.md` | Kept because the project already had this filename |
| `shared_context.md` | Shared domain context, actors, flows, modules, entities, and glossary | Use when onboarding or starting a new feature |
| `class_inventory.md` | Inventory of backend modules, frontend components, database entities, and missing class/service opportunities | Use when checking "classes/layers" before implementation |
| `constraints/` | Global engineering, business, and safety constraints | Must be respected by every feature |
| `specs/` | Project spec, feature specs, plans, tasks, changelogs, templates | Main feature source of truth |
| `rfcs/` | Architecture Decision Records and request-for-comment documents | Use for decisions that affect many features |
| `reviews/` | Review notes, import decisions, gap checks, closeout records | Use to record why decisions were made |
| `skills/` | Reusable project/agent guidance | Optional support material |

## 2. Source Of Truth Order

When there is a conflict, resolve it in this order:

1. Feature `SPEC.md` in `.sdd/specs/feature-*`
2. Feature `PLAN.md`
3. Feature `TASKS.md`
4. `.sdd/specs/PROJECT_SPEC.md`
5. `.sdd/constraints/*.md`
6. `.sdd/shared_context.md`
7. `mysql-workbench-schema.sql`
8. `database.md`
9. Current code implementation

If code conflicts with a feature spec, either update and re-approve the spec or
treat the code as a defect.

## 3. Current Feature Map

| Folder | Feature / User Story |
| --- | --- |
| `feature-auth` | FE01 / US-PB-01 Authentication |
| `feature-schedule-booking` | FE02 / US-PB-02, US-PB-03 Schedule, hold, booking |
| `feature-payment-refund` | FE03 / US-PB-04, US-PB-05 Payment and refund |
| `feature-staff-daily-operation` | FE04 / US-PB-06 Daily staff operations |
| `feature-branch-court` | FE05 / US-PB-07 Branch and court management |
| `feature-addon` | FE06 / US-PB-08 Add-on services |
| `feature-basic-reporting` | FE07 / US-PB-09 Basic reporting |
| `feature-pricing` | FE08 / US-PB-10 Pricing rules |
| `feature-customer-history` | FE09 / US-PB-11 Customer history |
| `feature-notification` | FE10 / US-PB-12 Notifications |
| `feature-feedback` | FE11 / US-PB-13 Feedback |
| `feature-internal-account` | FE12 / US-PB-14 Internal account management |
| `feature-voucher` | FE13 / US-PB-15 Voucher management |
| `feature-maintenance` | FE14 / US-PB-16 Court maintenance |
| `feature-quick-rebook` | FE15 / US-PB-17 Quick rebook |
| `feature-advanced-reporting` | FE16 / US-PB-18 Advanced reporting |
| `feature-slot-suggestion` | FE17 / US-PB-19 Slot suggestion |
| `feature-ops-dashboard` | FE18 / US-PB-20 Operations dashboard |

## 4. How To Add A New Feature

1. Create `.sdd/specs/feature-{name}/`.
2. Copy the structure from `.sdd/specs/_template.md`.
3. Write `SPEC.md` first with scope, actors, flows, business rules, data impact,
   API contract, acceptance criteria, and open questions.
4. Write `PLAN.md` only after the spec is clear.
5. Write `TASKS.md` as implementation-ready checklist items.
6. Update `CHANGELOG.md` whenever observable behavior changes.
7. Update `PROJECT_SPEC.md`, `shared_context.md`, or constraints if the feature
   changes project-level rules.

## 5. Import Note

The source `.sdd.zip` had many library-domain specs such as book management,
borrowing, inventory copies, fines, and membership management. Those were not
copied into this project because they conflict with the pickleball domain.
The decision is recorded in:

```text
.sdd/reviews/sdd-import-gap-review-2026-06-23.md
```
