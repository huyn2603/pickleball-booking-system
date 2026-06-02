# CLAUDE.md - Pickleball Booking System

Huong dan lam viec cho du an dat san pickleball truc tuyen.

## TL;DR

Day la he thong dat san pickleball truc tuyen cho **mot co so tai Ha Noi**.

- Khong quan ly nhieu khu vuc.
- Khong quan ly nhieu chi nhanh.
- Khong multi-tenant.
- Nguoi dung xem lich trong, dat san, thanh toan, huy lich, xem lich su.
- Staff/Admin quan ly lich dat san, trang thai san, addon, thanh toan va bao cao co ban.

Tech stack:

- Frontend: React + Vite
- Backend: Node.js + Express
- Database: MySQL 8.0
- DB driver: `mysql2/promise`
- Auth: HMAC token
- Password: plain text theo yeu cau hien tai

## Doc Truoc Khi Sua

1. `README.md` - product scope va user stories.
2. `database.md` - thiet ke MySQL.
3. `mysql-workbench-schema.sql` - source of truth cho bang/cot DB.
4. `backend/src/config/db.js` - MySQL pool/query/transaction helpers.
5. `AGENTS.md` - quy tac agent cua repo.

## Architecture

```text
React Frontend
      |
      | HTTP JSON
      v
Node.js Express API
      |
      | mysql2/promise
      v
MySQL 8.0
```

## Backend Layers

```text
routes/       -> khai bao endpoint va middleware
controllers/  -> nhan request, validate co ban, tra response
models/       -> SQL query va map row snake_case sang object camelCase
services/     -> business logic lon: booking, pricing, payment, refund
middleware/   -> auth, error handling
config/       -> database/env config
utils/        -> token, password helper
```

Controller khong nen chua business logic phuc tap. Booking/payment/refund nen duoc tach vao service khi implement.

## Database Scope

Database chi phuc vu mot co so tai Ha Noi.

Dung:

- `settings` de luu thong tin co so.
- `courts` de luu cac san con.
- `users` + `roles` de phan quyen.
- `bookings` + `booking_slots` de dat san.
- `slot_holds` de giu cho tam thoi.

Khong them:

- `branches`
- `regions`
- `clubs`
- multi-tenant fields

## Business Rules

- Email user bat buoc ket thuc bang `@gmail.com`.
- Password luu plain text theo yeu cau hien tai.
- Khong expose `password` trong API response.
- Khong dat san trong qua khu.
- Khong cho double-booking.
- Active booking statuses: `pending`, `confirmed`, `checked_in`.
- Non-active booking statuses: `cancelled`, `expired`, `completed`, `no_show`.
- Slot hold mac dinh 10 phut.
- Gio mo cua mac dinh: 05:00 - 22:00.
- Gio cao diem mac dinh: 17:00 - 21:00.
- Backend tinh tien, khong tin tong tien tu frontend.
- Transaction data khong xoa vat ly; cap nhat bang status.

## API Response Format

Thanh cong:

```json
{
  "success": true,
  "data": {}
}
```

Loi:

```json
{
  "success": false,
  "message": "Error message"
}
```

## Current API

- `GET /api/health`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/password`
- `GET /api/auth/me`

## Env Config

Tao `backend/.env` dua tren `backend/.env.example`:

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

## Coding Rules

- JavaScript CommonJS theo code hien tai.
- Dung `mysql2/promise`, khong dung Mongoose.
- SQL dung named placeholders.
- Nhieu thao tac ghi lien quan booking/payment/voucher phai dung transaction.
- Ten bien/function bang tieng Anh ro nghia.
- Khong hard-code DB password, auth secret, payment secret.
- Khong dung `console.log` cho production logging moi; neu can log loi, dung error middleware/logger sau nay.
- Khong viet query string bang cach noi input user truc tiep vao SQL.

## Frontend Rules

- React component tach nho, uu tien UI ro rang cho lich san.
- Khong tinh tong tien o frontend.
- Form can co loading/error state.
- Lich san can hien trang thai: trong, dang giu, da dat, dang su dung, bao tri.
- Khong them landing page marketing neu dang lam workflow chinh.

## Definition of Done

- Code chay duoc voi stack React + Node.js + MySQL.
- Khong con noi dung WMS/Spring/PostgreSQL trong docs cua du an.
- API khong expose password.
- Register validate email `@gmail.com`.
- MySQL schema import duoc bang Workbench.
- Neu thay doi auth/db, chay `node --check` cho cac file lien quan.

## Known Constraints

- Hien chua co API booking/payment/refund day du.
- Hien password plain text la yeu cau cua du an, du khong phai khuyen nghi bao mat production.
- MySQL local can user/password dung de import va chay backend.
