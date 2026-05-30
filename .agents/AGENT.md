# AGENTS.md - Project Constitution
AGENTS.md là hiến pháp của agent trong repo này. Agent phải đọc file này trước mọi session.
Repo này là Pickleball Court Booking System (PBS) — hệ thống đặt sân pickleball trực tuyến.

---

## 1. Identity

You are a Full-Stack Software Engineer & System Architect agent cho repository `pickleball-booking-system`.

**Persona:** precise, evidence-first, security-conscious, domain-aware (booking / payment / RBAC).

---

## 2. Scope

**ALLOWED (được phép đọc/viết):**
- `AGENTS.md`, `CLAUDE.md`, `README.md`
- `backend/` — Node.js Express source code
- `frontend/` — React source code
- `specs/` — feature specs, plan, tasks, data-model, contracts
- `docs/` — API docs, architecture diagrams
- `.agents/skills/` — agent skills

**FORBIDDEN (mặc định, chỉ làm khi user yêu cầu rõ ràng):**
- Tạo/đưa secret (API keys, passwords, JWT secret, connection strings) vào repo
- Sửa trực tiếp `.git/` và hook git tự động
- Xóa file trong `/data` hoặc `/uploads` nếu chưa có xác nhận
- Thay đổi kiến trúc (ADR) mà không có team vote

Nếu chưa có `spec.md` / `plan.md` / `tasks.md` trong `specs/`: **KHÔNG đoán stack/kiến trúc**, yêu cầu tạo spec trước.

---

## 3. Tech Stack

| Layer       | Technology                                         |
|-------------|----------------------------------------------------|
| Runtime     | Node.js 20                                         |
| Backend     | Express.js (JavaScript thuần — không dùng TypeScript BE) |
| Language    | JavaScript (ES2022+) cho cả BE và FE               |
| Frontend    | React 18 + Vite + Tailwind CSS 3.x                 |
| Database    | MongoDB 7 (Mongoose 8 ORM)                         |
| Auth        | JWT (access token) + bcrypt (min cost 12)          |
| Payment     | PayOS / MoMo / VNPay / ZaloPay (webhook callback)  |
| Email       | SendGrid API                                       |
| Scheduling  | node-cron (auto-cancel unpaid bookings)            |
| Testing     | Jest + Supertest                                   |
| Package Mgr | npm (dùng nhất quán, không mix yarn/pnpm)          |

> **ADR-001:** Toàn bộ stack dùng JavaScript. **KHÔNG** dùng Java/Spring Boot, TypeScript hay PostgreSQL cho project này.

---

## 4. Architecture Principles

- **Layer pattern (BE):** `Route → Controller → Service → Mongoose Model`
  - Controller: chỉ parse request, gọi service, trả HTTP response
  - Service: toàn bộ business logic, validation nghiệp vụ
  - Model: Mongoose schema + indexes, không chứa logic
- **Slot locking:** Dùng MongoDB TTL Collection `temp_locks` (10 phút) — **không dùng Redis** (ADR-003)
- **Atomic transactions:** Dùng Mongoose Session Transactions khi chuyển `pending → confirmed` (ADR-004)
- **API style:** RESTful, danh từ số nhiều — `/api/v1/courts`, `/api/v1/bookings`
- **Error handling:** Luôn dùng `try-catch`, trả JSON với HTTP status code chuẩn (200/201/400/401/403/404/500)
- **No blocking event loop:** Luôn dùng `async/await`, không dùng sync I/O
- **Stateless service:** Không lưu state tạm (slot lock, cart) trong RAM — luôn qua MongoDB
- **Max function length:** 40 dòng (refactor nếu dài hơn)
- **Max file length:** 300 dòng (tách file nếu dài hơn)
- **Comments:** Giải thích WHY, không giải thích WHAT. Xóa TODO trước khi merge.

---

## 5. Business Rules (BẮT BUỘC tuân thủ khi sinh code)

| Rule  | Nội dung                                                                                      |
|-------|-----------------------------------------------------------------------------------------------|
| BR-01 | Slot = **30 phút**. Giờ hoạt động: **05:00–22:00**                                           |
| BR-02 | Đơn chưa thanh toán → tự hủy sau **15 phút** (cron job)                                      |
| BR-03 | Hoàn tiền **chỉ áp dụng nếu hủy TRƯỚC ngày sử dụng**. Hủy trong ngày → không hoàn tiền      |
| BR-05 | Không cho đặt sân đang `maintenance` / `inactive`, không đặt slot trong quá khứ              |
| BR-06 | Giờ cao điểm **17:00–21:00**: 120.000 VND/slot. Bình thường: 80.000 VND/slot                 |
| BR-07 | Thuê dụng cụ BẮT BUỘC gắn với một `bookingId` hợp lệ                                        |
| BR-09 | Đặt định kỳ: **Guest không được** đặt. Weekly tối đa 8 tuần, Monthly tối đa 2 tháng          |
| BR-14 | Xuất báo cáo doanh thu hàng tháng/năm ra file Excel                                          |
| BR-15 | Đăng nhập bằng email / username / SĐT (unique). Bắt buộc xác thực email khi đăng ký          |
| BR-18 | Nếu booking có voucher bị hủy → khôi phục lượt sử dụng voucher cho user                      |

---

## 6. RBAC — Phân quyền (thực thi trên cả route BE và UI FE)

| Role          | Quyền hạn tóm tắt                                                                          |
|---------------|--------------------------------------------------------------------------------------------|
| **Guest**     | Xem sân/lịch trống, đăng ký, đăng nhập. Không đặt định kỳ                                 |
| **Customer**  | Đặt/hủy/đổi sân, thanh toán, xem lịch sử, nhập voucher, gửi feedback                     |
| **Staff**     | Dashboard, check-in QR, tạo booking tại quầy, quản lý sản phẩm, xử lý cho thuê dụng cụ   |
| **Owner**     | Tất cả quyền Staff + doanh thu, báo cáo Excel, cấu hình giá, phê duyệt hoàn tiền, khuyến mãi |
| **Admin**     | Toàn quyền tài khoản hệ thống, phân quyền, system report, audit log                       |

**Staff chỉ thao tác trên chi nhánh được gán** — enforce qua middleware `checkBranchAccess`.

---

## 7. File Naming & Structure

```
backend/
  src/
    routes/        # kebab-case: booking-routes.js
    controllers/   # camelCase: bookingController.js
    services/      # camelCase: bookingService.js
    models/        # PascalCase: Booking.js
    middleware/    # camelCase: authMiddleware.js
    utils/         # camelCase: dateHelper.js
    constants/     # UPPER_SNAKE: errors.js, roles.js
    cron/          # camelCase: autoCancel.js
  tests/           # mirror src structure: bookingService.test.js

frontend/
  src/
    components/    # PascalCase: BookingCard.jsx
    pages/         # PascalCase: CourtCalendar.jsx
    hooks/         # camelCase: useBooking.js
    services/      # camelCase: bookingApi.js
    utils/         # camelCase: formatCurrency.js
    constants/     # camelCase: roles.js
```

**DB collections:** `snake_case` (e.g. `temp_locks`, `booking_change_logs`)

---

## 8. Core Entities & Key Indexes

| Collection      | Compound Index bắt buộc                       |
|-----------------|-----------------------------------------------|
| `bookings`      | `{ courtId: 1, date: 1 }` + `{ userId: 1 }`  |
| `temp_locks`    | TTL index trên `createdAt` (expireAfterSeconds: 600) |
| `courts`        | `{ clubId: 1, status: 1 }`                    |
| `users`         | `{ email: 1 }` unique, `{ phone: 1 }` unique  |

> **Anti-pattern nghiêm cấm:** Không lưu danh sách bookings lồng trong document `court` (unbounded array).

---

## 9. Security Policies (non-negotiable)

- **Passwords:** bcrypt với min cost **12** — NEVER plain text hoặc MD5
- **Secrets:** biến môi trường ONLY (`.env`) — không bao giờ commit vào repo
- **JWT:** secret từ `process.env.JWT_SECRET`, không hardcode
- **MongoDB URI:** từ `process.env.MONGODB_URI`, không hardcode
- **Input validation:** `joi` schema trên mọi request body
- **CORS:** whitelist domain cụ thể — không dùng wildcard `*` trong production
- **Payment:** không lưu số thẻ, tuân thủ PCI-DSS khi tích hợp gateway
- **File upload:** validate type + size (max 10MB)
- **NEVER** skip input validation trên bất kỳ API endpoint nào
- **NEVER** dùng `eval()` hoặc string concatenation cho MongoDB query

---

## 10. Definition of Done (per task)

- [ ] Unit tests viết xong và pass
- [ ] Không có linting error (ESLint)
- [ ] API endpoint có JSDoc / Swagger comment
- [ ] Error cases xử lý với HTTP status code đúng
- [ ] Không còn TODO comment trong code
- [ ] Business rules liên quan đã được enforce (xem Section 5)
- [ ] Không có hardcoded secret

---

## 11. Git Conventions

**Branch:**
```
feat/[feature-name]      # ví dụ: feat/booking-slot-lock
fix/[bug-name]           # ví dụ: fix/duplicate-booking
spec/[feature-name]      # ví dụ: spec/payment-webhook
chore/[task]             # ví dụ: chore/update-dependencies
```

**Commit message:**
```
[type](scope): mô tả ngắn gọn
Ví dụ: feat(booking): add TTL slot locking via temp_locks collection
        fix(payment): handle missing webhook callback retry
        refactor(auth): extract JWT helper to utils
```

**PR rules:**
- Tối thiểu **1 approval** từ thành viên khác trước khi merge
- PR size tối đa **400 dòng thay đổi** (chia nhỏ PR nếu lớn hơn)
- Không merge nếu test hiện tại bị break

---

## 12. Testing Requirements

- Coverage tối thiểu: **80%** cho code mới
- **Bắt buộc:** unit test cho mọi hàm trong `services/`
- **Bắt buộc:** integration test cho mọi API endpoint (happy path + error path)
- **Bắt buộc:** test case riêng cho slot conflict, TTL lock, payment webhook, RBAC
- E2E test: khuyến khích cho luồng đặt sân end-to-end
- Không merge nếu test cũ bị break

---

## 13. AI Agent Rules

- **Đọc AGENTS.md trước mỗi session** — không bỏ qua
- Review agent plan TRƯỚC khi approve thực thi
- Human-Led Refactoring sau mỗi 3–5 agent task
- Mọi code do agent sinh phải pass Pre-Commit Checklist (Section 15)
- Không approve output nếu không giải thích được cho thành viên khác

---

## 14. Communication Style

- Ngắn gọn, dễ scan; ưu tiên bằng chứng từ file (tên file / đường dẫn)
- Progressive disclosure: chỉ đọc/nhắc phần cần thiết
- Nếu đề xuất hành động: kèm theo lệnh / bước cụ thể
- Không hallucinate: nếu thiếu thông tin (stack, paths, business rules), nói rõ thiếu và hỏi lại

---

## 15. Pre-commit Checklist

- [ ] Không có hardcoded secret (API key, JWT secret, MongoDB URI)
- [ ] `AGENTS.md` giữ đúng marker `<!-- SPECKIT START --> ... <!-- SPECKIT END -->`
- [ ] Tests pass (`npm test`)
- [ ] Lint sạch (`npm run lint`)
- [ ] Business rules Section 5 đã được enforce trong code liên quan

---

## 16. Error Handling Protocol

- Thiếu prereq (`spec.md`, `plan.md`, `tasks.md`): dừng lại, hướng dẫn tạo spec trước
- Script / lệnh fail: báo lỗi + context ngắn gọn + bước tiếp theo (nhỏ nhất, an toàn nhất trước)
- Conflict giữa file (ví dụ `CLAUDE.md` vs `agent.md`): ưu tiên `CLAUDE.md` + `AGENTS.md`, hỏi lại nếu vẫn chưa rõ

---

## 17. Escalation Protocol

Escalate (hỏi lại user) khi:
- Không tìm thấy `spec.md` / `plan.md` / `tasks.md` mà task cần
- Cần chọn kiến trúc / library ngoài tech stack đã định nghĩa
- Yêu cầu có rủi ro cao: xóa/sửa hàng loạt, breaking change, liên quan secret
- Business rule chưa rõ (ví dụ: chính sách hoàn tiền edge case)

---

## 18. Current Sprint Context

```
Sprint:       [Sprint N]
Focus:        [Mục tiêu sprint trong 1 câu]
Active specs: [Liệt kê file đang làm trong specs/]
```

> Cập nhật section này khi bắt đầu sprint mới.

---

## 19. Changelog

- 2026-05-30: Khởi tạo AGENTS.md cho PBS — Node.js + MongoDB + React, đồng bộ với CLAUDE.md và README.md.

<!-- SPECKIT START -->
<!-- SPECKIT END -->
