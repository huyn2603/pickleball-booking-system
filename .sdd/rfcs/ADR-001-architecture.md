# ADR-001 - Application Architecture

Status: DRAFT
Date: 2026-06-23

## Context

The project is a web-based Pickleball Court Booking System. It has a customer
booking experience and internal operations for staff, owner, and admin users.
The project already contains a React frontend, an Express backend, and a MySQL
schema.

The highest-risk workflows are:

- Preventing double-booking when users hold/book the same court/time.
- Keeping booking and payment state consistent.
- Enforcing role-based access for staff/owner/admin operations.
- Keeping financial records traceable.
- Avoiding scope creep across 20 feature areas.

## Decision

Use a two-application architecture:

- Frontend: React + Vite single-page application.
- Backend: Node.js + Express.js REST API.
- Database: MySQL 8.0+ using InnoDB.

Backend code is organized by:

- `routes`: Express route definitions.
- `controllers`: request/response orchestration.
- `models`: database access and domain operations.
- `middleware`: auth and request pipeline behavior.
- `utils`: token, password, mail, Google credential helpers.
- `config`: database connection and shared config.

The current backend uses CommonJS modules and plain functions. Creating ES
classes is not required for architecture consistency.

## Alternatives Considered

| Alternative | Reason Not Chosen |
| --- | --- |
| Monolithic frontend-only app with direct DB access | Unsafe and not compatible with server-side rules |
| Full MVC framework | More structure than needed for current project size |
| Microservices | Too much operational complexity for SWP391/MVP scope |
| GraphQL API | REST is simpler and already used by the project |

## Consequences

- REST endpoints are the main client/server contract.
- Backend remains the authority for roles, availability, totals, and state
  transitions.
- Feature specs must define endpoint behavior before implementation.
- Controllers can grow large if service modules are not introduced later.
- Future refactor candidates include `BookingService`, `PricingService`,
  `PaymentService`, `RefundService`, and `AuditService`.

## Follow-Up Work

- Add service modules when booking/payment/pricing code becomes difficult to
  maintain in model/controller modules.
- Split `frontend/src/App.jsx` into smaller components when doing UI-focused
  refactors.
- Add request validation helpers to reduce repeated validation logic.
