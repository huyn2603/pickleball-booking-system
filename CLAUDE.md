# CLAUDE.md - Pickleball Booking System v1.1
## Hệ thống đặt sân pickleball nhiều chi nhánh nhỏ tại Hà Nội

---

## TL;DR (Đọc trước - 60 giây)

> Đây là hệ thống đặt sân pickleball trực tuyến cho **nhiều chi nhánh nhỏ trong Hà Nội**.
>
> Backend: Node.js + Express + MySQL 8.0 + `mysql2/promise`
> Frontend: React + Vite
> Auth: HMAC token từ backend
> Password: plain text theo yêu cầu hiện tại, không phải production best practice
>
> Branch model: `branches` -> `courts`; Staff/Owner có thể gắn `users.branch_id`.
> Booking model: `slot_holds` giữ slot 10 phút; `bookings` + `booking_slots` chống trùng lịch.

### Đọc trước

1. `AGENT.md` - constitution, forbidden patterns, domain invariants.
2. `README.md` - project description, user stories, acceptance criteria.
3. `database.md` - database model và quy tắc chi nhánh.
4. `mysql-workbench-schema.sql` - schema/seed source of truth.
5. File này - architecture, workflow, conventions và lessons learned.

---

## KIẾN TRÚC HỆ THỐNG

### Sơ đồ tổng quan

```text
React + Vite Frontend
  - Customer booking flow
  - Staff dashboard
  - Admin/Owner management
          |
          | HTTP JSON
          v
Node.js Express API
  - Auth/account routes
  - Court availability
  - Booking/payment/refund workflow
  - Staff operations
          |
          | mysql2/promise
          v
MySQL 8.0
  - branches, courts
  - slot_holds, bookings, booking_slots
  - payment_transactions, refunds
  - audit_logs, email_logs
```

### Backend layer architecture

```text
Route Layer
  - endpoint definitions
  - auth middleware binding
        |
        v
Controller Layer
  - request parsing
  - basic validation
  - response format
        |
        v
Service Layer
  - booking/payment/refund business logic
  - transaction orchestration
  - branch-aware invariants
        |
        v
Model Layer
  - SQL queries
  - row mapping
  - named placeholders
        |
        v
MySQL
```

### Repository structure

```text
pickleball-booking-system/
├── .agents/
├── .sdd/
├── .specify/
├── backend/
│   ├── app.js
│   ├── server.js
│   └── src/
│       ├── config/
│       ├── controllers/
│       ├── middleware/
│       ├── models/
│       ├── routes/
│       ├── services/
│       └── utils/
├── frontend/
│   ├── public/
│   └── src/
├── AGENT.md
├── CLAUDE.md
├── README.md
├── database.md
├── IMPLEMENTATION.md
├── mysql-workbench-import.md
└── mysql-workbench-schema.sql
```

---

## QUYẾT ĐỊNH KIẾN TRÚC QUAN TRỌNG (ADR)

### ADR-001: Node.js + Express cho backend

Quyết định: Giữ backend Node.js + Express theo code hiện tại.
Lý do: Phù hợp repo hiện có, đơn giản cho REST API, dễ phát triển nhanh trong Sprint 1.
Trade-off: Cần kỷ luật service/transaction rõ để tránh controller quá dày.
Status: Approved.

### ADR-002: MySQL 8.0 + mysql2/promise

Quyết định: Dùng MySQL 8.0 và `mysql2/promise`, không chuyển sang ORM khác.
Lý do: Schema đã được thiết kế cho MySQL Workbench, có trigger chống overlap và seed data.
Trade-off: Query thủ công phải cẩn thận parameterized SQL.
Status: Approved.

### ADR-003: Branch-aware model, không multi-tenant

Quyết định: Dùng `branches` cho nhiều chi nhánh nhỏ trong Hà Nội; không tạo tenant/company isolation.
Lý do: Nghiệp vụ cần nhiều địa điểm vận hành nhưng vẫn là một hệ thống/brand.
Trade-off: Nếu sau này mở rộng franchise/multi-city cần refactor scope.
Status: Approved.

### ADR-004: Backend owns pricing

Quyết định: Backend tính toàn bộ tiền sân/addon/discount bằng `price_rules`.
Lý do: Tránh gian lận hoặc sai lệch từ frontend.
Trade-off: Frontend phải gọi API preview/quote thay vì tự tính tổng.
Status: Approved.

### ADR-005: Hybrid SDD + ADD workflow

Quyết định: Dùng spec cho phần rủi ro cao và agent cho implementation lặp nhanh.
Lý do: Theo playbook Spec-Driven & Agent-Driven Development, spec bảo vệ correctness, agent tăng tốc delivery.
Trade-off: Cần giữ docs/spec/code đồng bộ để tránh context drift.
Status: Approved.

---

## NHỮNG GÌ CẦN GHI NHỚ (Lessons Learned)

### LESSON-001: README phải khớp schema

README từng nói "một cơ sở" trong khi database đã có `branches`. Khi sửa scope, phải kiểm tra cả README, database docs, SQL seed, AGENT và CLAUDE.

### LESSON-002: Branch là business boundary

Không chỉ filter UI. Booking, slot hold, price rule, dashboard và staff scope đều cần hiểu `branch_id`.

### LESSON-003: Double-booking là lỗi nghiêm trọng nhất

Mọi thay đổi vào availability, slot hold, booking slot hoặc booking status phải xem lại active statuses và trigger overlap.

### LESSON-004: Plain text password là constraint tạm thời

Repo hiện theo yêu cầu plain text password, nhưng mọi tài liệu/code liên quan phải nhắc rõ đây không phải production best practice và không được expose password.

---

## DEVELOPMENT WORKFLOW

### Standard Hybrid Flow

```text
Idea
  -> Spec / clarify scope
  -> Plan
  -> Implement with agent
  -> Validate by tests + spec checklist
  -> Human review
  -> Update docs if behavior changed
```

### Khi nào dùng SDD

Use Full/Standard spec for:

- Database schema and migrations.
- API contracts and response format.
- Booking concurrency and slot overlap rules.
- Payment/refund transaction flow.
- Auth/security and RBAC.
- Any branch scope rule that affects data isolation.

### Khi nào dùng ADD

Use agentic implementation for:

- UI components and screens.
- Boilerplate route/controller/model patterns.
- Focused docs updates.
- Test scaffolding.
- Small refactors with clear constraints.

### Validation Gate

Sau khi agent báo "done", không tin bằng cảm giác. Kiểm tra:

1. Automated checks: `node --check`, tests/build/lint nếu có.
2. Spec compliance: từng acceptance scenario còn đúng không.
3. Constitution compliance: có vi phạm `AGENT.md` không.
4. System fit: không phá branch boundary, pricing, auth, transaction.

---

## DATABASE SCOPE

Database phục vụ nhiều chi nhánh nhỏ trong Hà Nội, không multi-tenant theo công ty riêng biệt.

Dùng:

- `settings` cho cấu hình chung toàn hệ thống.
- `branches` cho từng chi nhánh trong Hà Nội.
- `courts` cho sân con thuộc chi nhánh.
- `roles` và `users` cho phân quyền; Staff/Owner có thể gắn `branch_id`.
- `price_rules` cho giá theo toàn hệ thống, chi nhánh hoặc sân.
- `slot_holds`, `bookings`, `booking_slots` cho đặt sân và giữ slot.
- `promotions`, `vouchers` cho khuyến mãi.
- `payment_transactions`, `refunds` cho thanh toán và hoàn tiền.
- `audit_logs` cho lịch sử thao tác quản trị/nghiệp vụ.

Không tự ý thêm:

- Multi-region ngoài Hà Nội.
- Multi-tenant/company isolation.
- Database stack khác MySQL.
- Entity `clubs`, `regions` hoặc tenant fields nếu chưa có spec mở rộng.

---

## BUSINESS RULES

- Email user bắt buộc kết thúc bằng `@gmail.com`.
- Không đặt sân trong quá khứ.
- Không cho double-booking.
- Slot hold mặc định 10 phút.
- Giờ mở cửa mặc định: `05:00` - `22:00`.
- Giờ cao điểm mặc định: `17:00` - `21:00`.
- Backend tính tiền, không tin tổng tiền từ frontend.
- Transaction data không xóa vật lý; cập nhật bằng `status`.
- Staff/Owner có thể gắn với `branch_id` để giới hạn phạm vi vận hành.
- Booking phải gắn với chi nhánh của sân được đặt.
- Payment success phải update payment + booking trong cùng transaction.
- Refund/cancellation phải ghi lại dữ liệu audit/log cần thiết.

Booking statuses:

| Nhóm | Status |
| --- | --- |
| Chiếm sân | `pending`, `confirmed`, `checked_in` |
| Không chiếm sân | `cancelled`, `expired`, `completed`, `no_show` |

---

## API RESPONSE FORMAT

Thành công:

```json
{
  "success": true,
  "data": {}
}
```

Lỗi:

```json
{
  "success": false,
  "message": "Error message"
}
```

---

## CURRENT API

Auth/account:

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

Courts:

- `GET /api/courts`
- `POST /api/courts`
- `GET /api/courts/:id`
- `PATCH /api/courts/:id`
- `DELETE /api/courts/:id`
- `GET /api/courts/:id/availability`

Staff:

- `GET /api/staff/dashboard`
- `POST /api/staff/bookings/:id/check-in`
- `POST /api/staff/bookings/:id/check-out`
- `POST /api/staff/bookings/:id/payment`
- `PATCH /api/staff/addons/:id/stock`

System:

- `GET /api/health`

---

## ENV CONFIG

Tạo `backend/.env` dựa trên `backend/.env.example` nếu có:

```env
PORT=5000
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=pickleball_booking_system
DB_CONNECTION_LIMIT=10
AUTH_TOKEN_SECRET=replace_this_secret
```

Không commit `.env` thật, DB password, token secret, payment secret hoặc API key production.

---

## CODING RULES

- Giữ JavaScript CommonJS theo code hiện tại.
- Dùng `mysql2/promise`, không dùng Mongoose/JPA/Hibernate.
- SQL dùng named placeholders hoặc parameterized queries.
- Không nối chuỗi input user trực tiếp vào SQL.
- Tên biến/function bằng tiếng Anh rõ nghĩa.
- Không refactor rộng ngoài scope.
- Không hard-code secret.
- Không thêm `console.log` mới cho production logging.
- Khi sửa JS quan trọng, chạy `node --check` cho file liên quan.
- Khi thêm/sửa endpoint, cập nhật docs liên quan nếu cần.
- Khi sửa logic `branches`/`branch_id`, đồng bộ `database.md`, `mysql-workbench-schema.sql`, backend model/controller và seed data nếu bị ảnh hưởng.

---

## FRONTEND RULES

- Ưu tiên workflow thật: chọn chi nhánh -> xem lịch -> giữ slot -> thanh toán -> lịch sử.
- Không tạo landing page marketing khi đang làm chức năng chính.
- Component React nên tách nhỏ và dễ đọc.
- Không tính tổng tiền booking ở frontend.
- Form cần có loading/error state.
- Lịch sân cần scan nhanh trạng thái: trống, đang giữ, đã đặt, đang sử dụng, bảo trì.
- UI quản lý nên gọn, rõ, phù hợp tác vụ lặp lại của Staff/Admin.
- Khi hiển thị lịch/booking cho Staff, luôn xét phạm vi chi nhánh được phân công.

---

## NAMING CONVENTIONS

| Type | Convention | Example |
| --- | --- | --- |
| React components | PascalCase | `CourtSchedule.jsx` |
| JS functions | camelCase | `calculateBookingTotal()` |
| API routes | kebab-case | `/api/court-availability` |
| Database tables | snake_case | `slot_holds` |
| Database columns | snake_case | `branch_id` |
| Git branches | slash pattern | `feat/branch-aware-booking` |

---

## GIT CONVENTIONS

### Branch naming

```text
feat/[feature-name]
fix/[bug-name]
spec/[feature-name]
docs/[short-name]
chore/[short-name]
```

### Commit format

```text
[type]([scope]): [description]
```

Examples:

- `feat(booking): add branch-aware slot hold`
- `fix(courts): prevent cross-branch availability leak`
- `docs(readme): align scope with Hanoi branches`

### Pull request rules

- Minimum 1 approval before merge in team workflow.
- Keep PRs focused by spec/feature.
- All relevant checks should pass.
- No TODO comments left in completed code.

---

## ANTI-PATTERNS (Tránh xa)

### Code anti-patterns

| Anti-pattern | Why it is bad | How to avoid |
| --- | --- | --- |
| Fat controller | Khó test, trộn business logic với HTTP | Move workflow logic to services |
| SQL string concat | SQL injection risk | Use placeholders |
| Frontend pricing | Dễ gian lận tổng tiền | Backend owns pricing |
| Cross-branch leakage | Staff thấy/sửa dữ liệu sai chi nhánh | Always filter by branch scope |
| Status deletion | Mất audit trail | Use status cancellation |

### Agent anti-patterns

| Anti-pattern | Why it is bad | How to avoid |
| --- | --- | --- |
| Vibe coding | Nhanh lúc đầu, dễ drift và nợ kỹ thuật | Start from README/spec/context |
| Blind "done" trust | Agent confidence không đồng nghĩa correctness | Run validation gate |
| Feature creep | Agent thêm ngoài yêu cầu | Compare diff with acceptance criteria |
| Context conflict | AGENT/CLAUDE/README mâu thuẫn | Keep one source of truth per topic |

---

## DEFINITION OF DONE

- Code chạy được với React + Node.js + MySQL.
- Nội dung đúng domain pickleball, không còn WMS/Spring/PostgreSQL.
- Schema và docs không mâu thuẫn về scope nhiều chi nhánh tại Hà Nội.
- API không expose `password`.
- Register validate email `@gmail.com`.
- MySQL schema import được bằng Workbench nếu schema thay đổi.
- Nhiều thao tác ghi quan trọng được bọc transaction.
- Các file JS đã sửa pass `node --check` khi phù hợp.
- Tests/build/lint liên quan đã chạy hoặc lý do không chạy được được báo rõ.
- Acceptance criteria trong README/spec được kiểm lại sau thay đổi.

---

## KNOWN CONSTRAINTS

- Password plain text là yêu cầu hiện tại, không phải khuyến nghị bảo mật production.
- MySQL local cần user/password để import schema và chạy backend.
- Một số API booking/payment/refund có thể chưa đầy đủ tùy sprint.
- Scope hiện tại là nhiều chi nhánh nhỏ trong Hà Nội, không phải multi-city hoặc multi-tenant.
- Khi sửa branch-aware logic, cần kiểm tra cả docs, SQL, backend và frontend để tránh spec-code drift.

---

## COMMUNICATION STYLE

- Trả lời ngắn gọn, nêu rõ file đã sửa.
- Nêu rõ lệnh kiểm tra đã chạy và kết quả.
- Nếu không chạy được test/import DB do thiếu MySQL password hoặc môi trường, báo rõ.
- Nếu gặp mâu thuẫn giữa docs và schema, nêu rõ mâu thuẫn và đề xuất cách đồng bộ.
