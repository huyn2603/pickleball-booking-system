# Version: 4.1 | Updated: 2026-06-21 | Project: Pickleball Booking System

## 1. PROJECT OVERVIEW

Name: Pickleball Booking System
Type: Full-stack Web Application + REST API
Domain: Online court booking / branch operations / payments
Stage: Development (Sprint 1)

Báº¡n lÃ  má»™t ká»¹ sÆ° pháº§n má»m senior trong dá»± Ã¡n Pickleball Booking System.

Má»¥c tiÃªu chÃ­nh: XÃ¢y dá»±ng há»‡ thá»‘ng Ä‘áº·t sÃ¢n pickleball trá»±c tuyáº¿n cho **nhiá»u chi nhÃ¡nh nhá» trong HÃ  Ná»™i**. Há»‡ thá»‘ng pháº£i Ä‘áº£m báº£o ngÆ°á»i dÃ¹ng xem lá»‹ch trá»‘ng theo chi nhÃ¡nh, Ä‘áº·t sÃ¢n khÃ´ng trÃ¹ng slot, giá»¯ slot táº¡m thá»i, thanh toÃ¡n, há»§y lá»‹ch/hoÃ n tiá»n, vÃ  Ä‘á»ƒ Staff/Owner/Admin váº­n hÃ nh chi nhÃ¡nh vá»›i audit trail rÃµ rÃ ng.

Äá»c trÆ°á»›c:

1. `README.md` - product scope, user stories, acceptance scenarios.
2. `CLAUDE.md` - kiáº¿n trÃºc, workflow, patterns, conventions.
3. `database.md` - thiáº¿t káº¿ database theo nhiá»u chi nhÃ¡nh.
4. `mysql-workbench-schema.sql` - source of truth cho schema import MySQL Workbench.
5. File nÃ y - quy táº¯c váº­n hÃ nh cá»¥ thá»ƒ cho agent.

## 2. TECH STACK (STRICT - do not deviate)

Backend: Node.js + Express
Frontend: React + Vite
Database: MySQL 8.0+
DB Driver: `mysql2/promise`
Auth: HMAC token tá»« backend
Password: plain text theo yÃªu cáº§u hiá»‡n táº¡i
Package manager: npm

KhÃ´ng tá»± Ã½ Ä‘á»•i sang Spring Boot, Java, PostgreSQL, MongoDB, JPA/Hibernate, Prisma, Next.js hoáº·c stack khÃ¡c náº¿u user khÃ´ng yÃªu cáº§u rÃµ.

## 3. ARCHITECTURE PRINCIPLES

- Follow layered backend architecture: Route -> Controller -> Service -> Model -> MySQL.
- Routes chá»‰ khai bÃ¡o endpoint, middleware vÃ  binding.
- Controllers xá»­ lÃ½ request/response, validation cÆ¡ báº£n vÃ  status code.
- Services chá»©a business logic phá»©c táº¡p, pricing, booking/payment/refund workflow vÃ  transaction.
- Models chá»©a SQL query, named placeholders vÃ  row mapping.
- Frontend Æ°u tiÃªn workflow Ä‘áº·t sÃ¢n tháº­t, khÃ´ng táº¡o landing page marketing khi Ä‘ang lÃ m feature váº­n hÃ nh.
- Backend luÃ´n tÃ­nh tiá»n booking; frontend khÃ´ng Ä‘Æ°á»£c gá»­i tá»•ng tiá»n Ä‘á»ƒ backend tin trá»±c tiáº¿p.
- Má»i thao tÃ¡c booking/payment/refund nhiá»u bÆ°á»›c pháº£i dÃ¹ng transaction.
- Domain rules quanh branch, slot hold, double-booking, past-booking vÃ  audit log lÃ  invariants, khÃ´ng pháº£i optional validations.
- Ãp dá»¥ng tinh tháº§n Hybrid SDD + ADD: spec rÃµ cho architecture/API/schema/security; agent Ä‘Æ°á»£c dÃ¹ng linh hoáº¡t cho implementation, tests, docs vÃ  UI láº·p nhanh.

## 4. FILE NAMING & STRUCTURE

JavaScript files: camelCase hoáº·c pattern hiá»‡n cÃ³ cá»§a repo.
React components: PascalCase.
API endpoints: kebab-case resource naming khi thÃªm endpoint má»›i.
Database tables/columns: snake_case.
Specs: `specs/[number]-[feature-name]/` hoáº·c `.sdd/features/[feature-name]/` náº¿u lÃ m theo workflow SDD.

ThÆ° má»¥c chÃ­nh:

- `backend/` - Node.js Express API.
- `frontend/` - React + Vite UI.
- `database.md` - database documentation.
- `mysql-workbench-schema.sql` - schema import chÃ­nh.
- `README.md` - product spec tá»•ng quan.
- `CLAUDE.md` - project memory vÃ  workflow.
- `AGENT.md` - agent constitution.

## 5. PHáº M VI HOáº T Äá»˜NG

### ÄÆ°á»£c phÃ©p

- Äá»c vÃ  chá»‰nh sá»­a code/docs trong `backend/`, `frontend/`, `README.md`, `CLAUDE.md`, `AGENT.md`, `database.md`, `IMPLEMENTATION.md`, `mysql-workbench-schema.sql`, `mysql-workbench-import.md`, `.sdd/`, `.agents/`, `specs/`.
- Cháº¡y `npm install`, `npm run dev`, `npm test`, `npm run build`, `node --check` khi phÃ¹ há»£p.
- Táº¡o branch Git theo pattern: `feat/*`, `fix/*`, `spec/*`, `docs/*`, `chore/*`.
- Cáº­p nháº­t docs khi thay Ä‘á»•i endpoint, schema, business rule hoáº·c workflow.

### Cáº¥m tuyá»‡t Ä‘á»‘i

- KHÃ”NG xÃ³a dá»¯ liá»‡u nghiá»‡p vá»¥, migration/schema quan trá»ng hoáº·c file do user táº¡o náº¿u khÃ´ng Ä‘Æ°á»£c yÃªu cáº§u rÃµ.
- KHÃ”NG reset git history, sá»­a `.git/`, hoáº·c commit trá»±c tiáº¿p vÃ o `main`/`production`.
- KHÃ”NG Ä‘á»c/ghi secrets tháº­t: `.env`, credentials, private keys, production passwords.
- KHÃ”NG hard-code DB password, token secret, payment secret hoáº·c API key.
- KHÃ”NG Ä‘á»•i stack cÃ´ng nghá»‡ khi chÆ°a Ä‘Æ°á»£c user yÃªu cáº§u.
- KHÃ”NG má»Ÿ rá»™ng scope thÃ nh multi-tenant, nhiá»u tá»‰nh/thÃ nh phá»‘ hoáº·c franchise platform.
- KHÃ”NG bá» qua input validation á»Ÿ write endpoints.
- KHÃ”NG expose `password` trong API response.

## 6. FORBIDDEN PATTERNS

- NEVER allow double-booking for active booking statuses.
- NEVER allow booking in the past.
- NEVER trust `total_amount` from frontend.
- NEVER concatenate user input directly into SQL.
- NEVER physically delete transaction/audit data; use status-based cancellation.
- NEVER assign a booking to a branch that does not own the selected court.
- NEVER add TODO/FIXME comments to completed task code.
- NEVER leave debug `console.log` in production code.
- NEVER introduce feature creep outside approved spec/user request.

## 7. PICKLEBALL DOMAIN RULES

### Branch rules

1. System scope is **multiple small branches in HÃ  Ná»™i only**.
2. `branches` stores each branch; no `regions`, no multi-company tenant model.
3. Every court belongs to exactly one branch through `courts.branch_id`.
4. Staff/Owner may be scoped by `users.branch_id`.
5. Booking, booking slots and slot holds must carry the branch of the selected court.

### Booking rules

1. Slot hold default is 10 minutes.
2. Opening hours default: `05:00` - `22:00`; branch-specific hours may override when implemented.
3. Peak hours default: `17:00` - `21:00`.
4. Active booking statuses occupying a court: `pending`, `confirmed`, `checked_in`.
5. Non-occupying statuses: `cancelled`, `expired`, `completed`, `no_show`.
6. Payment success must update payment and booking atomically in one transaction.
7. Cancellation/refund must write refund/payment/audit records where applicable.

### User and security rules

1. User email must end with `@gmail.com`.
2. Password is currently plain text by requirement, but this is not production best practice.
3. API responses must never include `password`.
4. Money is stored as integer VND.
5. Master data uses `status` or `is_active`.

## 8. CODE & QUALITY RULES

- Prefer existing repo patterns over new abstractions.
- Keep changes tightly scoped to the user request.
- Use English names for variables/functions/classes.
- Use `mysql2/promise` and parameterized/named placeholders.
- Use transactions for booking/payment/refund writes.
- When editing important JS files, run `node --check` for touched files.
- When editing frontend behavior, run build/lint/test if available.
- Comments should explain why, not narrate obvious code.
- If adding/changing endpoints, update `README.md`, `CLAUDE.md` or API docs when relevant.

## 9. SDD + ADD WORKFLOW

Use the playbook principle from `spec-driven-&-agent-driven-development.pdf`:

- Avoid vibe coding: do not jump from vague prompt to broad code changes.
- Treat spec/context as infrastructure. `README.md`, `database.md`, `CLAUDE.md` and `AGENT.md` must stay consistent.
- Use SDD for high-risk CORE: database schema, API contracts, auth/security, booking concurrency, payment/refund logic.
- Use ADD for lower-risk SHELL: UI components, docs, boilerplate, focused tests and incremental refactors.
- Prefer Plan -> Act -> Check for multi-file work.
- After agent says "done", verify by tests, syntax checks, diff review and spec compliance.
- If an agent loop repeats the same failure 3 times, use an escape hatch: stop, manually inspect/fix, document the learning in docs if it affects future work.

## 10. Xá»¬ LÃ Lá»–I & AN TOÃ€N THAO TÃC

- Neu yeu cau mo ho hoac thieu domain context quan trong, hoi lai thay vi doan.
- Neu docs va SQL/schema mau thuan, neu ro mau thuan va dong bo trong cung thay doi neu scope cho phep.
- Truoc thay doi co rui ro cao voi booking/payment/refund, doc file lien quan va xac dinh blast radius.
- Neu khong co GitNexus/impact-analysis tooling trong moi truong hien tai, dung `rg`, doc call sites thu cong va bao ro gioi han khi can.
- Khong thuc hien thao tac pha huy du lieu neu chua co yeu cau ro.

## 11. CURRENT IMPLEMENTED API

- `GET /api/health`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/google-login`
- `POST /api/auth/forgot-password/request-otp`
- `POST /api/auth/forgot-password/verify-otp`
- `POST /api/auth/forgot-password/reset`
- `POST /api/auth/password`
- `GET /api/auth/me`
- `PUT /api/auth/me`
- `GET /api/auth/accounts`
- `POST /api/auth/accounts`
- `PATCH /api/auth/accounts/:id/status`
- `DELETE /api/auth/accounts/:id`
- `GET /api/courts`
- `POST /api/courts`
- `GET /api/courts/:id`
- `PATCH /api/courts/:id`
- `DELETE /api/courts/:id`
- `GET /api/courts/:id/availability`
- `POST /api/bookings/hold`
- `POST /api/bookings/from-hold`
- `GET /api/bookings/my`
- `GET /api/staff/dashboard`
- `POST /api/staff/bookings/:id/check-in`
- `POST /api/staff/bookings/:id/check-out`
- `POST /api/staff/bookings/:id/payment`
- `PATCH /api/staff/addons/:id/stock`

## 12. DEFINITION OF DONE (per task)

- [ ] Ná»™i dung/code Ä‘Ãºng domain pickleball, khÃ´ng cÃ²n WMS/Spring/PostgreSQL.
- [ ] Scope nhiá»u chi nhÃ¡nh nhá» táº¡i HÃ  Ná»™i Ä‘Æ°á»£c Ä‘á»“ng bá»™ giá»¯a docs, SQL, backend vÃ  frontend khi liÃªn quan.
- [ ] KhÃ´ng cÃ³ double-booking hoáº·c past-booking path má»›i.
- [ ] Backend tÃ­nh tiá»n; khÃ´ng tin tá»•ng tiá»n frontend gá»­i lÃªn.
- [ ] API khÃ´ng expose `password`.
- [ ] Register validate email `@gmail.com`.
- [ ] MySQL schema váº«n import Ä‘Æ°á»£c báº±ng Workbench náº¿u cÃ³ thay Ä‘á»•i SQL.
- [ ] CÃ¡c file JS Ä‘Ã£ sá»­a pass `node --check` khi phÃ¹ há»£p.
- [ ] Tests/build/lint liÃªn quan Ä‘Ã£ cháº¡y hoáº·c lÃ½ do chÆ°a cháº¡y Ä‘Æ°á»£c Ä‘Ã£ Ä‘Æ°á»£c bÃ¡o rÃµ.
- [ ] KhÃ´ng cÃ³ secrets, debug logs hoáº·c TODO/FIXME má»›i.

## 13. GIT CONVENTIONS

### Branch naming

`feat/[feature-name]` - tÃ­nh nÄƒng má»›i
`fix/[bug-name]` - sá»­a lá»—i
`spec/[feature-name]` - viáº¿t/cáº­p nháº­t spec
`docs/[short-name]` - cáº­p nháº­t tÃ i liá»‡u
`chore/[short-name]` - báº£o trÃ¬ nhá»

### Commit format

`[type]([scope]): [description]`

Examples:

- `feat(booking): add branch-aware slot hold`
- `fix(courts): prevent cross-branch availability query`
- `docs(readme): align scope with Hanoi branches`

### PR rules

- Min 1 approval before merge when working in a team.
- Avoid giant PRs; split broad work by feature/spec.
- Never commit directly into `main`/`production`.
- Verify spec acceptance criteria before merge.

## 14. CURRENT SPRINT CONTEXT

Sprint: Sprint 1
Focus: Auth, database schema, court schedule, branch-aware booking flow
Active project: Pickleball Booking System for small Hanoi branches
Core specs/docs: `README.md`, `database.md`, `mysql-workbench-schema.sql`

## 15. PROJECT CONTEXT REFERENCES

- `README.md` - product overview, user stories, acceptance scenarios.
- `CLAUDE.md` - architecture, workflow, conventions, lessons learned.
- `database.md` - database design and branch model.
- `mysql-workbench-schema.sql` - executable schema/seed data.
- `.sdd/` - SDD workspace and constraints if used.

## 16. COMMUNICATION STYLE

- Tráº£ lá»i ngáº¯n gá»n, nÃ³i rÃµ file Ä‘Ã£ sá»­a vÃ  kiá»ƒm tra Ä‘Ã£ cháº¡y.
- Náº¿u khÃ´ng cháº¡y Ä‘Æ°á»£c test/import DB do thiáº¿u MySQL password hoáº·c mÃ´i trÆ°á»ng, bÃ¡o rÃµ.
- Náº¿u yÃªu cáº§u vÆ°á»£t khá»i scope nhiá»u chi nhÃ¡nh táº¡i HÃ  Ná»™i, há»i láº¡i trÆ°á»›c khi má»Ÿ rá»™ng.
