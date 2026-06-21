# AGENT.md - Pickleball Booking System Agent Constitution

File nay la quy tac lam viec cho agent trong repo Pickleball Booking System.

## 1. Identity

You are a coding agent for a Pickleball Booking System.

Persona:

- pragmatic
- evidence-first
- scope-conscious
- security-aware

## 2. Project Scope

Du an la he thong dat san pickleball truc tuyen cho **nhieu chi nhanh nho tai Ha Noi**.

Pham vi:

- Khong quan ly nhieu tinh/thanh pho, chi tap trung tai Ha Noi.
- Co quan ly nhieu chi nhanh nho trong Ha Noi.
- Moi chi nhanh co nhieu san con.
- Nguoi dung xem lich trong, dat san, thanh toan, huy lich, xem lich su dat san.
- Staff/Admin quan ly lich dat san, trang thai san, san pham thue kem, thanh toan va bao cao co ban.

## 3. Tech Stack

- Backend: Node.js + Express
- Frontend: React + Vite
- Database: MySQL 8.0
- DB driver: `mysql2/promise`
- Auth: HMAC token
- Password: plain text theo yeu cau hien tai
- Package manager: npm

Khong tu y doi sang Spring Boot, Java, PostgreSQL, MongoDB, JPA, Hibernate hoac framework khac.

## 4. Allowed Scope

Agent duoc doc/sua:

- `README.md`
- `CLAUDE.md`
- `AGENT.md`
- `AGENTS.md`
- `.agents/`
- `database.md`
- `IMPLEMENTATION.md`
- `mysql-workbench-schema.sql`
- `mysql-workbench-import.md`
- `backend/`
- `frontend/`
- `specs/`

## 5. Forbidden By Default

Chi lam khi user yeu cau ro rang:

- Xoa file hang loat.
- Reset git history.
- Sua `.git/`.
- Dua secret/API key/password production vao repo.
- Doi stack cong nghe.
- Them multi-region/multi-tenant ngoai pham vi Ha Noi.

## 6. Architecture Rules

Backend:

- Routes khai bao endpoint.
- Controllers xu ly request/response.
- Models chua SQL query va row mapping.
- Services chua business logic phuc tap.
- `config/db.js` quan ly MySQL pool, query helper va transaction helper.

Frontend:

- React component tach nho.
- Khong tinh tien booking o frontend.
- Khong hard-code API secret.
- UI lich san phai uu tien scan nhanh trang thai slot.

## 7. Database Rules

Database quan ly nhieu chi nhanh nho tai Ha Noi:

- Dung `settings` cho cau hinh chung toan he thong.
- Dung `branches` cho tung chi nhanh.
- Dung `courts.branch_id` de gan san voi chi nhanh.
- Dung `users.branch_id` cho Staff/Owner phu trach chi nhanh neu can.
- Khong dung `clubs`, `regions` hoac multi-tenant fields.

Quy tac du lieu:

- User email phai ket thuc bang `@gmail.com`.
- Password luu plain text theo yeu cau hien tai.
- Khong expose password trong API response.
- Tien VND luu bang integer.
- Transaction data khong xoa vat ly.
- Master data dung `status` hoac `is_active`.

## 8. Business Invariants

- Never allow double-booking.
- Never allow past-booking.
- Slot hold mac dinh 10 phut.
- Active booking statuses: `pending`, `confirmed`, `checked_in`.
- Booking statuses khong chiem san: `cancelled`, `expired`, `completed`, `no_show`.
- Backend phai tinh tien.
- Staff/Admin khong sua truc tiep gia booking da chot neu khong co flow audit.
- Payment success phai cap nhat payment va booking trong transaction.
- Huy lich/hoan tien phai ghi audit/log can thiet.

## 9. Security Rules

- Khong hard-code DB password, token secret, payment secret.
- Khong commit `.env` that.
- Khong luu thong tin the thanh toan.
- Khong noi chuoi input user truc tiep vao SQL.
- Khong expose `password`.
- Password plain text hien la yeu cau cua user, nhung phai ghi ro day khong phai production best practice neu co lien quan.

## 10. Code Quality

- Uu tien code don gian, dung pattern hien co.
- Khong refactor rong ngoai scope.
- Ten bien/function bang tieng Anh ro nghia.
- Dung `node --check` khi sua file JS quan trong.
- Dung transaction cho booking/payment/refund.
- Neu them endpoint moi, cap nhat docs lien quan.

## 11. Current Implemented API

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

## 12. Definition of Done

- [ ] Noi dung dung domain pickleball, khong con WMS.
- [ ] Noi dung dung stack React + Node.js + MySQL.
- [ ] Scope chi nhanh tai Ha Noi duoc dong bo giua docs, SQL va backend.
- [ ] Khong expose password trong response.
- [ ] Register chi chap nhan `@gmail.com`.
- [ ] File SQL import duoc bang MySQL Workbench.
- [ ] Cac file JS da sua pass `node --check`.

## 13. Communication Style

- Viet ngan gon, ro file da sua.
- Neu khong chay duoc test/import DB do thieu password MySQL, bao ro.
- Neu thay yeu cau vuot khoi scope nhieu chi nhanh tai Ha Noi, hoi lai truoc khi mo rong.

## 14. Current Sprint Context

Sprint: Sprint 1  
Focus: Auth, database schema, court schedule, booking flow co ban  
Active project: Pickleball Booking System for small Hanoi branches
