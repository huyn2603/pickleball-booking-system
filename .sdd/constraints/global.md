# Global Constraints - Pickleball Court Booking System

Version: 0.2.0
Status: DRAFT
Last Updated: 2026-06-23

These constraints apply to every feature. A feature spec may add stricter rules,
but it should not weaken these project-wide rules.

## 1. Scope And Spec Rules

| ID | Rule | Rationale | Applies To |
| --- | --- | --- | --- |
| GLB-001 | No core feature is implemented without an approved feature `SPEC.md`. | Prevents code-first feature drift. | All feature work |
| GLB-002 | Implement only behavior described in `SPEC.md`, `PLAN.md`, and `TASKS.md`. | Keeps MVP scope controllable. | Backend, frontend, DB |
| GLB-003 | If implementation and spec conflict, update the spec first or treat implementation as a defect. | Maintains a stable source of truth. | Reviews, bug fixes |
| GLB-004 | Every observable behavior change updates the related `CHANGELOG.md`. | Helps teammates and reviewers trace changes. | All features |
| GLB-005 | Open questions must be explicitly resolved, deferred, or marked out of scope before implementation. | Avoids hidden assumptions. | Feature planning |

## 2. Architecture Rules

| ID | Rule | Rationale | Applies To |
| --- | --- | --- | --- |
| GLB-006 | Approved stack is Node.js, Express.js, React + Vite, MySQL, and RESTful APIs. | Matches existing project implementation. | Whole project |
| GLB-007 | Backend should keep route, controller, model, utility, middleware, and config responsibilities separate. | Makes code easier to review and test. | Backend |
| GLB-008 | Controllers should validate request shape and orchestrate responses; heavy business logic should live in models or future service modules. | Prevents controllers from becoming unmaintainable. | Backend |
| GLB-009 | Database operations that change booking/payment/refund state should use transactions when multiple writes must succeed together. | Prevents partial state. | Backend, DB |
| GLB-010 | Frontend should not duplicate business-critical calculations as authoritative logic. | Prevents manipulated totals or stale availability. | Frontend |
| GLB-011 | Large frontend components should be split only when it improves maintainability and does not change behavior. | Avoids risky refactors during feature work. | Frontend |

## 3. API Rules

| ID | Rule | Rationale |
| --- | --- | --- |
| GLB-012 | API paths use `/api/*` and JSON payloads. | Consistent client/server contract. |
| GLB-013 | Responses should follow a stable shape such as `{ success, message?, data? }` where practical. | Easier frontend handling. |
| GLB-014 | Errors should be safe, short, and actionable without leaking stack traces or SQL details. | Security and user experience. |
| GLB-015 | Protected endpoints must require auth middleware and role checks where needed. | Prevents unauthorized access. |
| GLB-016 | Date and time inputs must use explicit formats, typically `YYYY-MM-DD` and `HH:mm`/SQL `TIME`. | Avoids timezone ambiguity. |

## 4. Data Rules

| ID | Rule | Rationale |
| --- | --- | --- |
| GLB-017 | `mysql-workbench-schema.sql` is the canonical database import file. | One reliable source for MySQL Workbench. |
| GLB-018 | `database.md` must explain schema changes in human-readable form. | Helps teammates review the model. |
| GLB-019 | MySQL constraints/triggers should enforce critical invariants where feasible. | Protects against application bugs. |
| GLB-020 | Financial and audit records should be append-friendly and traceable. | Supports reconciliation. |
| GLB-021 | VND money amounts are stored as integers. | Avoids floating point currency errors. |

## 5. Testing And Verification Rules

| ID | Rule | Rationale |
| --- | --- | --- |
| GLB-022 | High-risk features need explicit verification notes even if automated tests are not yet present. | Keeps quality visible. |
| GLB-023 | Booking overlap, hold expiry, payment confirmation, refund windows, and role access must be manually or automatically verified before release. | These are core risks. |
| GLB-024 | UI changes must be checked at common desktop and mobile widths when they affect user workflows. | Prevents broken flows. |
| GLB-025 | DB changes must be importable in MySQL Workbench after edits. | Protects the team setup path. |

## 6. Documentation Rules

| ID | Rule | Rationale |
| --- | --- | --- |
| GLB-026 | New feature folders must include `SPEC.md`, `PLAN.md`, `TASKS.md`, `CONTEXT.md`, and `CHANGELOG.md` unless intentionally scoped smaller. | Matches existing project SDD style. |
| GLB-027 | Architecture-wide decisions must be recorded in `rfcs/ADR-*.md`. | Avoids lost decisions. |
| GLB-028 | Review/gap findings should be stored in `reviews/`. | Preserves reasoning for later teammates. |
| GLB-029 | Imported external SDD material must be adapted to this project domain before becoming active requirements. | Prevents library-domain requirements from polluting pickleball specs. |
