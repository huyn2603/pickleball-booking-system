# CLAUDE.md - Pickleball Booking System

Huong dan lam viec cho Claude/Codex khi doc, sua va mo rong du an **Pickleball Booking System**.

## 1. Project Snapshot

He thong dat san pickleball truc tuyen, phuc vu **nhieu chi nhanh nho tai Ha Noi**.

Nguoi dung co the:

- Xem san va lich trong theo chi nhanh.
- Dat san, giu slot tam thoi, thanh toan va huy lich.
- Xem lich su dat san va thong tin tai khoan.

Nhan vien/Admin co the:

- Quan ly tai khoan, san, lich dat, trang thai san.
- Check-in/check-out booking.
- Ghi nhan thanh toan tai quay.
- Quan ly dich vu kem va bao cao van hanh co ban.

## 2. Tech Stack

| Layer | Cong nghe |
| --- | --- |
| Frontend | React + Vite |
| Backend | Node.js + Express |
| Database | MySQL 8.0+ |
| DB driver | `mysql2/promise` |
| Auth | HMAC token |
| Package manager | npm |

Luu y bao mat:

- Password hien dang luu plain text theo yeu cau hien tai cua du an.
- Khong xem day la production best practice.
- API khong duoc expose `password` trong response.

## 3. Read First

Truoc khi sua logic lon, doc nhanh cac file sau:

1. `README.md` - tong quan san pham va workflow.
2. `database.md` - thiet ke database theo nghiep vu hien tai.
3. `mysql-workbench-schema.sql` - script import MySQL Workbench.
4. `backend/src/config/db.js` - MySQL pool, query helper, transaction helper.
5. `AGENT.md` - quy tac lam viec chung cua agent trong repo.

Neu `database.md` va `mysql-workbench-schema.sql` khac nhau, uu tien hoi lai hoac dong bo ca hai file trong cung mot thay doi.

## 4. Architecture

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

Backend layout:

```text
backend/src/
  config/       database/env config
  routes/       endpoint + middleware binding
  controllers/  request validation co ban + response
  models/       SQL query + row mapping
  services/     business logic lon: booking, pricing, payment, refund
  middleware/   auth, guard, error handling
  utils/        token, password, mailer, Google auth helpers
```

Nguyen tac:

- Controller giu mong, khong nhot business logic phuc tap.
- Model chi nen chua query va map du lieu.
- Nhieu thao tac ghi lien quan booking/payment/refund/voucher phai dung transaction.
- Service la noi dat logic co nhieu buoc hoac can transaction.

## 5. Database Scope

Database phuc vu nhieu chi nhanh nho trong Ha Noi, khong multi-tenant theo cong ty rieng biet.

Dung:

- `settings` cho cau hinh chung toan he thong.
- `branches` cho tung chi nhanh trong Ha Noi.
- `courts` cho san con thuoc chi nhanh.
- `roles` va `users` cho phan quyen.
- `bookings`, `booking_slots`, `slot_holds` cho dat san va giu slot.
- `promotions`, `vouchers` cho khuyen mai.
- `payment_transactions`, `refunds` cho thanh toan va hoan tien.

Khong tu y them:

- Multi-region ngoai Ha Noi.
- Multi-tenant/company isolation.
- Stack database khac MySQL.

## 6. Business Rules

- Email user bat buoc ket thuc bang `@gmail.com`.
- Khong dat san trong qua khu.
- Khong cho double-booking.
- Slot hold mac dinh 10 phut.
- Gio mo cua mac dinh: `05:00` - `22:00`.
- Gio cao diem mac dinh: `17:00` - `21:00`.
- Backend tinh tien, khong tin tong tien tu frontend.
- Transaction data khong xoa vat ly; cap nhat bang `status`.
- Staff/Owner co the gan voi `branch_id` de gioi han pham vi van hanh.
- Booking phai gan voi chi nhanh cua san duoc dat.

Booking statuses:

| Nhom | Status |
| --- | --- |
| Chiem san | `pending`, `confirmed`, `checked_in` |
| Khong chiem san | `cancelled`, `expired`, `completed`, `no_show` |

## 7. API Response Format

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

## 8. Current API

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
- `POST /api/bookings/hold`
- `POST /api/bookings/from-hold`
- `GET /api/bookings/my`

Staff:

- `GET /api/staff/dashboard`
- `POST /api/staff/bookings/:id/check-in`
- `POST /api/staff/bookings/:id/check-out`
- `POST /api/staff/bookings/:id/payment`
- `PATCH /api/staff/addons/:id/stock`

System:

- `GET /api/health`

## 9. Env Config

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

Khong commit `.env` that, DB password, token secret, payment secret hoac API key production.

## 10. Coding Rules

- Giu JavaScript CommonJS theo code hien tai.
- Dung `mysql2/promise`, khong dung Mongoose/JPA/Hibernate.
- SQL dung named placeholders.
- Khong noi chuoi input user truc tiep vao SQL.
- Ten bien/function bang tieng Anh ro nghia.
- Khong refactor rong ngoai scope.
- Khong hard-code secret.
- Khong them `console.log` moi cho production logging.
- Khi sua JS quan trong, chay `node --check` cho file lien quan.
- Khi them/sua endpoint, cap nhat docs lien quan neu can.

## 11. Frontend Rules

- Uu tien workflow that, khong tao landing page marketing khi dang lam chuc nang chinh.
- Component React nen tach nho va de doc.
- Khong tinh tong tien booking o frontend.
- Form can co loading/error state.
- Lich san can scan nhanh cac trang thai: trong, dang giu, da dat, dang su dung, bao tri.
- UI quan ly nen gon, ro, phu hop tac vu lap lai cua Staff/Admin.

## 12. Definition of Done

- Code chay duoc voi React + Node.js + MySQL.
- Noi dung dung domain pickleball, khong con WMS/Spring/PostgreSQL.
- Schema va docs khong mau thuan ve scope chi nhanh.
- API khong expose `password`.
- Register validate email `@gmail.com`.
- MySQL schema import duoc bang Workbench.
- Nhieu thao tac ghi quan trong duoc boc transaction.
- Cac file JS da sua pass `node --check` khi phu hop.

## 13. Known Constraints

- Password plain text la yeu cau hien tai, khong phai khuyen nghi bao mat production.
- MySQL local can dung user/password de import schema va chay backend.
- Mot so API booking/payment/refund co the chua day du tuy theo sprint.
- Khi sua logic `branches`/`branch_id`, can dong bo dong thoi `database.md`, `mysql-workbench-schema.sql`, backend model/controller va seed data.

## 14. Communication Style

- Tra loi ngan gon, noi ro file da sua.
- Neu khong chay duoc test/import DB do thieu MySQL password, bao ro.
- Neu gap mau thuan giua docs va schema, neu ro mau thuan va de xuat cach dong bo.
