# Version: 4.1 | Updated: 2026-06-21 | Project: Pickleball Booking System

## 1. PROJECT OVERVIEW

Name: Pickleball Booking System
Type: Full-stack Web Application + REST API
Domain: Online court booking / branch operations / payments
Stage: Development (Sprint 1)

Bạn là một kỹ sư phần mềm senior trong dự án Pickleball Booking System.

Mục tiêu chính: Xây dựng hệ thống đặt sân pickleball trực tuyến cho **nhiều chi nhánh nhỏ trong Hà Nội**. Hệ thống phải đảm bảo người dùng xem lịch trống theo chi nhánh, đặt sân không trùng slot, giữ slot tạm thời, thanh toán, hủy lịch/hoàn tiền, và để Staff/Owner/Admin vận hành chi nhánh với audit trail rõ ràng.

Đọc trước:

1. `README.md` - product scope, user stories, acceptance scenarios.
2. `CLAUDE.md` - kiến trúc, workflow, patterns, conventions.
3. `database.md` - thiết kế database theo nhiều chi nhánh.
4. `mysql-workbench-schema.sql` - source of truth cho schema import MySQL Workbench.
5. File này - quy tắc vận hành cụ thể cho agent.

## 2. TECH STACK (STRICT - do not deviate)

Backend: Node.js + Express
Frontend: React + Vite
Database: MySQL 8.0+
DB Driver: `mysql2/promise`
Auth: HMAC token từ backend
Password: plain text theo yêu cầu hiện tại
Package manager: npm

Không tự ý đổi sang Spring Boot, Java, PostgreSQL, MongoDB, JPA/Hibernate, Prisma, Next.js hoặc stack khác nếu user không yêu cầu rõ.

## 3. ARCHITECTURE PRINCIPLES

- Follow layered backend architecture: Route -> Controller -> Service -> Model -> MySQL.
- Routes chỉ khai báo endpoint, middleware và binding.
- Controllers xử lý request/response, validation cơ bản và status code.
- Services chứa business logic phức tạp, pricing, booking/payment/refund workflow và transaction.
- Models chứa SQL query, named placeholders và row mapping.
- Frontend ưu tiên workflow đặt sân thật, không tạo landing page marketing khi đang làm feature vận hành.
- Backend luôn tính tiền booking; frontend không được gửi tổng tiền để backend tin trực tiếp.
- Mọi thao tác booking/payment/refund nhiều bước phải dùng transaction.
- Domain rules quanh branch, slot hold, double-booking, past-booking và audit log là invariants, không phải optional validations.
- Áp dụng tinh thần Hybrid SDD + ADD: spec rõ cho architecture/API/schema/security; agent được dùng linh hoạt cho implementation, tests, docs và UI lặp nhanh.

## 4. FILE NAMING & STRUCTURE

JavaScript files: camelCase hoặc pattern hiện có của repo.
React components: PascalCase.
API endpoints: kebab-case resource naming khi thêm endpoint mới.
Database tables/columns: snake_case.
Specs: `specs/[number]-[feature-name]/` hoặc `.sdd/features/[feature-name]/` nếu làm theo workflow SDD.

Thư mục chính:

- `backend/` - Node.js Express API.
- `frontend/` - React + Vite UI.
- `database.md` - database documentation.
- `mysql-workbench-schema.sql` - schema import chính.
- `README.md` - product spec tổng quan.
- `CLAUDE.md` - project memory và workflow.
- `AGENT.md` - agent constitution.

## 5. PHẠM VI HOẠT ĐỘNG

### Được phép

- Đọc và chỉnh sửa code/docs trong `backend/`, `frontend/`, `README.md`, `CLAUDE.md`, `AGENT.md`, `database.md`, `IMPLEMENTATION.md`, `mysql-workbench-schema.sql`, `mysql-workbench-import.md`, `.sdd/`, `.agents/`, `specs/`.
- Chạy `npm install`, `npm run dev`, `npm test`, `npm run build`, `node --check` khi phù hợp.
- Tạo branch Git theo pattern: `feat/*`, `fix/*`, `spec/*`, `docs/*`, `chore/*`.
- Cập nhật docs khi thay đổi endpoint, schema, business rule hoặc workflow.

### Cấm tuyệt đối

- KHÔNG xóa dữ liệu nghiệp vụ, migration/schema quan trọng hoặc file do user tạo nếu không được yêu cầu rõ.
- KHÔNG reset git history, sửa `.git/`, hoặc commit trực tiếp vào `main`/`production`.
- KHÔNG đọc/ghi secrets thật: `.env`, credentials, private keys, production passwords.
- KHÔNG hard-code DB password, token secret, payment secret hoặc API key.
- KHÔNG đổi stack công nghệ khi chưa được user yêu cầu.
- KHÔNG mở rộng scope thành multi-tenant, nhiều tỉnh/thành phố hoặc franchise platform.
- KHÔNG bỏ qua input validation ở write endpoints.
- KHÔNG expose `password` trong API response.

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

1. System scope is **multiple small branches in Hà Nội only**.
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

## 10. XỬ LÝ LỖI & AN TOÀN THAO TÁC

- Nếu yêu cầu mơ hồ hoặc thiếu domain context quan trọng, hỏi lại thay vì đoán.
- Nếu docs và SQL/schema mâu thuẫn, nêu rõ mâu thuẫn và đồng bộ trong cùng thay đổi nếu scope cho phép.
- Trước thay đổi có rủi ro cao với booking/payment/refund, đọc file liên quan và xác định blast radius.
- Nếu không có GitNexus/impact-analysis tooling trong môi trường hiện tại, dùng `rg`, đọc call sites thủ công và báo rõ giới hạn khi cần.
- Không thực hiện thao tác phá hủy dữ liệu nếu chưa có yêu cầu rõ.

## 11. DEFINITION OF DONE (per task)

- [ ] Nội dung/code đúng domain pickleball, không còn WMS/Spring/PostgreSQL.
- [ ] Scope nhiều chi nhánh nhỏ tại Hà Nội được đồng bộ giữa docs, SQL, backend và frontend khi liên quan.
- [ ] Không có double-booking hoặc past-booking path mới.
- [ ] Backend tính tiền; không tin tổng tiền frontend gửi lên.
- [ ] API không expose `password`.
- [ ] Register validate email `@gmail.com`.
- [ ] MySQL schema vẫn import được bằng Workbench nếu có thay đổi SQL.
- [ ] Các file JS đã sửa pass `node --check` khi phù hợp.
- [ ] Tests/build/lint liên quan đã chạy hoặc lý do chưa chạy được đã được báo rõ.
- [ ] Không có secrets, debug logs hoặc TODO/FIXME mới.

## 12. GIT CONVENTIONS

### Branch naming

`feat/[feature-name]` - tính năng mới
`fix/[bug-name]` - sửa lỗi
`spec/[feature-name]` - viết/cập nhật spec
`docs/[short-name]` - cập nhật tài liệu
`chore/[short-name]` - bảo trì nhỏ

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

## 13. CURRENT SPRINT CONTEXT

Sprint: Sprint 1
Focus: Auth, database schema, court schedule, branch-aware booking flow
Active project: Pickleball Booking System for small Hanoi branches
Core specs/docs: `README.md`, `database.md`, `mysql-workbench-schema.sql`

## 14. PROJECT CONTEXT REFERENCES

- `README.md` - product overview, user stories, acceptance scenarios.
- `CLAUDE.md` - architecture, workflow, conventions, lessons learned.
- `database.md` - database design and branch model.
- `mysql-workbench-schema.sql` - executable schema/seed data.
- `.sdd/` - SDD workspace and constraints if used.

## 15. COMMUNICATION STYLE

- Trả lời ngắn gọn, nói rõ file đã sửa và kiểm tra đã chạy.
- Nếu không chạy được test/import DB do thiếu MySQL password hoặc môi trường, báo rõ.
- Nếu yêu cầu vượt khỏi scope nhiều chi nhánh tại Hà Nội, hỏi lại trước khi mở rộng.
