# Version: 4.1 | Updated: 2026-06-21 | Project: Pickleball Booking System

## 1. PROJECT OVERVIEW

Name: Pickleball Booking System
Type: Full-stack Web Application + REST API
Domain: Online court booking / branch operations / payments / staff workflow
Stage: Development 



Mục tiêu chính: xây dựng hệ thống đặt sân pickleball trực tuyến cho **nhiều chi nhánh nhỏ trong Hà Nội**, giúp Customer xem lịch trống, giữ slot, đặt sân, thanh toán, hủy lịch/hoàn tiền và giúp Staff/Owner/Admin vận hành chi nhánh với dữ liệu rõ ràng, chống trùng lịch và có audit trail đầy đủ.

Đọc trước:

1. `CLAUDE.md` - kiến trúc hệ thống, workflow, diagrams, conventions và lessons learned.
2. `README.md` - product scope, user stories, acceptance scenarios, requirements.
3. `database.md` - thiết kế database MySQL cho mô hình nhiều chi nhánh.
4. `mysql-workbench-schema.sql` - source of truth cho schema import MySQL Workbench.
5. File này - quy tắc vận hành cụ thể cho agent khi sửa code/docs.

## 2. TECH STACK (STRICT - do not deviate)

Backend: Node.js + Express 5
Frontend: React 19 + Vite
Database: MySQL 8.0+
DB Driver: `mysql2/promise`
Auth: HMAC token từ backend
Password: plain text theo yêu cầu hiện tại
Package manager: npm
Email: Nodemailer, dùng SMTP khi có cấu hình môi trường
Google Sign-In: `google-auth-library` khi có `GOOGLE_CLIENT_ID`

Không tự ý đổi sang stack backend, frontend hoặc database khác nếu user không yêu cầu rõ. Repo hiện tại đã có backend Express, frontend Vite và schema MySQL; mọi thay đổi phải đi cùng kiến trúc đó.

## 3. ARCHITECTURE PRINCIPLES

- Follow layered backend architecture: Route -> Controller -> Model/Service Logic -> MySQL.
- Routes chỉ khai báo endpoint, middleware và binding controller.
- Controllers xử lý request/response, status code, validation cơ bản và gọi model/helper phù hợp.
- Models chứa SQL query, mapping dữ liệu và các thao tác database có tham số.
- Khi workflow bắt đầu phức tạp như booking/payment/refund, ưu tiên tách service layer rõ ràng thay vì nhồi logic vào controller.
- Frontend ưu tiên workflow thật: chọn chi nhánh -> xem lịch -> giữ slot -> thanh toán -> lịch sử; không biến trang chính thành landing page marketing khi đang làm tính năng vận hành.
- Backend luôn sở hữu pricing; frontend không được gửi `total_amount` để backend tin trực tiếp.
- Mọi thao tác booking/payment/refund nhiều bước phải dùng transaction khi implement đầy đủ.
- Branch boundary là invariant: booking, booking slot, slot hold, staff dashboard và price rule phải khớp chi nhánh.
- Double-booking, booking quá khứ, cross-branch access, password exposure và trust frontend pricing là lỗi nghiêm trọng.

## 4. FILE NAMING & STRUCTURE

JavaScript files: camelCase hoặc pattern hiện có của repo.
React components: PascalCase.
React hooks/utilities: camelCase.
API endpoints: kebab-case resource naming khi thêm endpoint mới.
Database tables/columns: snake_case.
Specs: `specs/[number]-[feature-name]/` hoặc `.sdd/features/[feature-name]/` nếu làm theo SDD workflow.

Thư mục chính:

- `backend/` - Node.js Express API.
- `backend/app.js` - Express app, middleware, route mounting.
- `backend/server.js` - server bootstrap.
- `backend/src/config/` - database configuration.
- `backend/src/controllers/` - request handlers.
- `backend/src/middleware/` - auth middleware.
- `backend/src/models/` - SQL/data access.
- `backend/src/routes/` - Express routers.
- `backend/src/utils/` - token, password, mailer, Google auth helpers.
- `frontend/` - React + Vite UI.
- `frontend/src/` - application source.
- `frontend/public/` - static assets.
- `README.md` - product spec tổng quan theo form user gửi.
- `CLAUDE.md` - project memory, diagrams, workflow, anti-patterns.
- `AGENT.md` - agent constitution.
- `database.md` - database documentation.
- `mysql-workbench-schema.sql` - executable schema/seed data.

## 5. PHẠM VI HOẠT ĐỘNG

### Được phép

- Đọc và chỉnh sửa code/docs trong `backend/`, `frontend/`, `README.md`, `CLAUDE.md`, `AGENT.md`, `database.md`, `IMPLEMENTATION.md`, `mysql-workbench-schema.sql`, `mysql-workbench-import.md`, `.sdd/`, `.agents/`, `specs/`.
- Chạy `npm install`, `npm run dev`, `npm run build`, `npm run lint`, `npm test`, `node --check` khi phù hợp.
- Tạo branch Git theo pattern: `feat/*`, `fix/*`, `spec/*`, `docs/*`, `chore/*`.
- Cập nhật docs khi thay đổi endpoint, schema, business rule, validation hoặc workflow.
- Thêm test hoặc script kiểm tra khi thay đổi logic quan trọng.
- Sửa lỗi encoding/nội dung tài liệu khi nội dung bị lệch domain hoặc còn sót domain/stack khác.

### Cấm tuyệt đối

- KHÔNG xóa dữ liệu nghiệp vụ, migration/schema quan trọng hoặc file do user tạo nếu không được yêu cầu rõ.
- KHÔNG reset git history, sửa `.git/`, hoặc commit trực tiếp vào `main`/`production`.
- KHÔNG đọc/ghi secrets thật: `.env`, credentials, private keys, production passwords.
- KHÔNG hard-code DB password, token secret, SMTP password, payment secret hoặc API key.
- KHÔNG đổi stack công nghệ khi chưa được user yêu cầu.
- KHÔNG mở rộng scope thành multi-tenant, multi-city hoặc franchise platform khi chưa có spec.
- KHÔNG bỏ qua input validation ở write endpoints.
- KHÔNG expose `password` trong API response.
- KHÔNG xóa vật lý payment/refund/audit transaction.
- KHÔNG sửa file code không liên quan nếu task chỉ là tài liệu.

## 6. FORBIDDEN PATTERNS

- NEVER allow double-booking for active booking statuses.
- NEVER allow booking in the past.
- NEVER trust `total_amount`, `branch_id`, `price`, `discount_amount` or role fields from frontend without server-side verification.
- NEVER concatenate user input directly into SQL.
- NEVER physically delete transaction/audit/payment/refund data; use status-based cancellation.
- NEVER assign a booking to a branch that does not own the selected court.
- NEVER let Staff access or mutate bookings outside assigned branch unless role explicitly permits.
- NEVER return `password` or reset token hashes in API responses.
- NEVER store secrets in source control.
- NEVER leave debug `console.log` in production code.
- NEVER add TODO/FIXME comments to completed task code.
- NEVER introduce unrelated business-domain or technology-stack terms into this project.
- NEVER introduce feature creep outside approved spec/user request.

## 7. PICKLEBALL DOMAIN RULES

### Branch and court rules

1. System scope is **multiple small branches in Hà Nội only**.
2. `branches` stores each branch; no `regions`, no tenant/company isolation in current scope.
3. Every court belongs to exactly one branch through `courts.branch_id`.
4. Staff/Owner may be scoped by `users.branch_id`.
5. Booking, booking slot and slot hold must carry the branch of the selected court.
6. A Staff dashboard must filter by assigned branch unless role is Admin or an explicitly global Owner.
7. Court status controls availability: `available` can be booked, `maintenance` and `inactive` cannot be booked.

### Booking rules

1. Slot hold default is 10 minutes.
2. Slot duration default is 30 minutes unless settings change.
3. Opening hours default: `05:00` - `22:00`; branch-specific hours may override when implemented.
4. Peak hours default: `17:00` - `21:00`.
5. Active booking statuses occupying a court: `pending`, `confirmed`, `checked_in`.
6. Non-occupying statuses: `cancelled`, `expired`, `completed`, `no_show`.
7. Active hold status occupying a court: `active`.
8. Converted, expired or cancelled holds must not block a court.
9. Booking in the past is invalid even if frontend allows a crafted request.
10. Payment success must update payment and booking atomically.
11. Cancellation/refund must write refund/payment/audit records where applicable.
12. Backend must calculate pricing from `price_rules`, addon lines, vouchers and current business policy.

### User and security rules

1. User email must end with `@gmail.com`.
2. Password is currently plain text by requirement, but this is not production best practice.
3. API responses must never include `password`.
4. Authenticated requests use HMAC token from backend.
5. Money is stored as integer VND.
6. Master data uses `status` or `is_active`.
7. Google login must validate Google token with configured client ID; do not trust frontend profile data alone.
8. OTP reset flow stores hashes and expiry; never store or return raw OTP beyond sending email.

### Addon, payment and reporting rules

1. Addon selected for a booking must store price at booking time.
2. Addon with zero stock or inactive status cannot be selected for new bookings.
3. Payment transaction data is append/update by status, not physical deletion.
4. Refund percentage must stay between 0 and 100.
5. Revenue reports should use paid/completed/confirmed data according to report definition, and exclude fully refunded bookings from actual revenue.
6. Feedback is tied to a completed booking and should not be duplicated per booking unless spec changes.

## 8. CODE & QUALITY RULES

- Prefer existing repo patterns over new abstractions.
- Keep changes tightly scoped to the user request.
- Use English names for variables/functions/classes.
- Keep user-facing Vietnamese text consistent and readable.
- Use `mysql2/promise` and parameterized/named placeholders.
- Use transactions for booking/payment/refund writes.
- Validate role and branch scope in backend, not only frontend.
- When editing important JS files, run `node --check` for touched backend files.
- When editing frontend behavior, run `npm run build` and/or `npm run lint` when feasible.
- Comments should explain why, not narrate obvious code.
- If adding/changing endpoints, update `README.md`, `CLAUDE.md`, `database.md` or API docs when relevant.
- Keep docs consistent: README product rules, CLAUDE architecture/workflow, AGENT operating rules, database.md schema details.
- Do not refactor broad areas unless required to complete the task safely.

## 9. XỬ LÝ LỖI & AN TOÀN THAO TÁC

- Nếu yêu cầu mơ hồ hoặc thiếu domain context quan trọng, hỏi lại thay vì đoán.
- Nếu docs và SQL/schema mâu thuẫn, nêu rõ mâu thuẫn và đồng bộ trong cùng thay đổi nếu scope cho phép.
- Trước thay đổi rủi ro cao với booking/payment/refund, đọc controller, model, database docs và SQL liên quan.
- Nếu không có GitNexus/impact-analysis tooling trong môi trường hiện tại, dùng `rg`, đọc call sites thủ công và báo rõ giới hạn khi cần.
- Không thực hiện thao tác phá hủy dữ liệu nếu chưa có yêu cầu rõ.
- Khi sandbox/network khiến lệnh quan trọng thất bại, xin quyền escalation đúng quy trình.
- Khi gặp worktree dirty, không revert thay đổi không phải của mình.
- Nếu sửa docs theo mẫu user gửi, loại bỏ tiêu đề/thông tin không thuộc form mẫu hoặc không đúng dự án.

## 10. DEFINITION OF DONE (per task)

- [ ] Nội dung/code đúng domain pickleball, không còn domain/stack khác.
- [ ] Scope nhiều chi nhánh nhỏ tại Hà Nội được đồng bộ giữa docs, SQL, backend và frontend khi liên quan.
- [ ] Không có double-booking hoặc past-booking path mới.
- [ ] Backend tính tiền; không tin tổng tiền frontend gửi lên.
- [ ] API không expose `password`.
- [ ] Register validate email `@gmail.com`.
- [ ] Branch boundary được kiểm tra với booking, court, staff dashboard và report.
- [ ] MySQL schema vẫn import được bằng Workbench nếu có thay đổi SQL.
- [ ] Các file JS đã sửa pass `node --check` khi phù hợp.
- [ ] Tests/build/lint liên quan đã chạy hoặc lý do chưa chạy được đã được báo rõ.
- [ ] Không có secrets, debug logs hoặc TODO/FIXME mới.
- [ ] Docs đã cập nhật nếu thay đổi behavior, API, schema hoặc business rule.

## 11. GIT CONVENTIONS

### Branch naming

`feat/[feature-name]` - tính năng mới
`fix/[bug-name]` - sửa lỗi
`spec/[feature-name]` - viết/cập nhật spec
`docs/[short-name]` - cập nhật tài liệu
`chore/[short-name]` - bảo trì nhỏ

### Commit format

`[type]([scope]): [description]`

Example:
`docs(readme): align pickleball spec with template`

### PR rules

- Min 1 approval before merge when working in a team.
- Keep PRs focused by spec/feature.
- All relevant checks should pass.
- Never commit directly into `main`/`production`.
- No TODO comments left in completed code.

## 12. CURRENT SPRINT CONTEXT

Sprint: Sprint 1
Focus: Auth, account management, database schema, court management, staff dashboard, branch-aware booking foundation
Active project: Pickleball Booking System for small Hanoi branches
Core docs/schema: `README.md`, `CLAUDE.md`, `AGENT.md`, `database.md`, `mysql-workbench-schema.sql`

Implemented API groups currently visible in repo:

- Health: `/api/health`
- Auth/account: `/api/auth/*`
- Courts: `/api/courts/*`
- Staff operations: `/api/staff/*`

Important sprint caveat: database already contains booking/payment/refund tables, but some booking/payment/refund workflows may still be incremental. Do not document an endpoint as fully implemented unless the route/controller exists.

## 13. PROJECT CONTEXT REFERENCES

- `CLAUDE.md` - system architecture, workflow, diagrams, lessons learned, anti-patterns.
- `README.md` - product overview, user stories, acceptance criteria, requirements.
- `database.md` - database design, table meanings, ER diagram, seed data.
- `mysql-workbench-schema.sql` - executable MySQL schema and seed data.
- `IMPLEMENTATION.md` - current technical implementation notes.
- `.sdd/` - SDD workspace and constraints if used.
- `.agents/` - local agent definitions and context if used.

## 14. GITNEXUS INTEGRATION

### Always do

- Run available impact analysis tooling before broad symbol edits if GitNexus exists in the environment.
- If GitNexus is not available, use `rg`, inspect imports/routes/controllers/models manually and report that manual impact analysis was used.
- Before committing, inspect `git status --short` and review the diff.

### Never do

- NEVER block all progress only because GitNexus is absent in this environment.
- NEVER claim GitNexus checks passed if the tooling was not available or not run.
- NEVER ignore HIGH or CRITICAL risk warnings if impact tooling returns them.
- NEVER rename with blind find-and-replace when a safe refactor path is available.

### Resources

| Resource | Use for |
| --- | --- |
| `gitnexus://repo/document/context` | Codebase overview when GitNexus MCP is configured |
| `gitnexus://repo/document/clusters` | Functional areas when GitNexus MCP is configured |
| `gitnexus://repo/document/processes` | Execution flows when GitNexus MCP is configured |

Note: Môi trường hiện tại có thể không có GitNexus tooling. Khi không có, agent phải nói rõ giới hạn và tiếp tục bằng phân tích thủ công dựa trên repo thật.
