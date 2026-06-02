# He Thong Dat San Pickleball Truc Tuyen

**Project**: Pickleball Booking System  
**Scope**: Mot san/co so pickleball tai Ha Noi  
**Tech stack**: React + Node.js + MySQL  
**Status**: Development

---

## Muc Tieu Du An

Xay dung he thong dat san pickleball truc tuyen phuc vu the thao cho mot co so tai Ha Noi. He thong cho phep nguoi dung xem lich trong, dat san, thanh toan, huy lich va xem lich su dat san. Owner/Staff/Admin quan ly lich dat san, trang thai san, san pham/dich vu thue kem, thanh toan va bao cao co ban.

## Pham Vi Hien Tai

| Co | Khong |
| --- | --- |
| Mot co so pickleball tai Ha Noi | Khong quan ly nhieu khu vuc |
| Nhieu san con trong cung mot co so | Khong quan ly nhieu chi nhanh |
| Xem lich trong theo ngay/gio | Khong co module giai dau |
| Dat san online va giu slot tam thoi | Khong tich hop ERP/CRM |
| Thanh toan va ghi nhan giao dich | Khong luu thong tin the thanh toan |
| Huy lich va hoan tien theo chinh sach | Khong quan ly hop dong HLV chuyen sau |
| Owner/Staff/Admin quan ly booking, san, addon, payment, report | Khong co multi-tenant |

## Tech Stack

| Tang | Cong nghe |
| --- | --- |
| Frontend | React + Vite |
| Backend | Node.js + Express |
| Database | MySQL 8.0 |
| DB Driver | mysql2/promise |
| Auth | HMAC token tu backend |
| Password | Plain text theo yeu cau hien tai |

## Quy Trinh Dat San

```text
Khach chua dang nhap dang ky/dang nhap
        |
Customer xem lich trong
        |
Customer chon san + ngay + khung gio
        |
He thong tao slot hold 10 phut
        |
Customer thanh toan
        |
Thanh toan thanh cong -> booking confirmed
        |
Staff theo doi, check-in/check-out
```

## Vai Tro

| Role | Quyen chinh |
| --- | --- |
| Admin | Quan tri tai khoan, cau hinh he thong, xem bao cao |
| Owner | Quan ly co so, doanh thu, nhan su va cau hinh van hanh |
| Staff | Quan ly lich dat san, check-in/check-out, addon, payment tai quay |
| Customer | Xem lich trong, dat san, thanh toan, huy lich, xem lich su |

Email user bat buoc co duoi `@gmail.com`.

## User Stories P1

| ID | Ten | Mo ta |
| --- | --- | --- |
| US-PB-01 | Dang ky/Dang nhap | Khach chua dang nhap tao tai khoan Customer bang email Gmail |
| US-PB-02 | Xem lich san | Customer xem lich trong theo ngay, san, khung gio |
| US-PB-03 | Dat san online | Customer chon san va giu slot trong 10 phut |
| US-PB-04 | Thanh toan | He thong ghi nhan payment va xac nhan booking |
| US-PB-05 | Huy lich/Hoan tien | Customer huy lich theo chinh sach |
| US-PB-06 | Staff quan ly lich | Staff xem booking, check-in/check-out |
| US-PB-07 | Quan ly addon | Owner/Staff/Admin quan ly vat, bong, nuoc uong/dich vu kem |
| US-PB-08 | Bao cao co ban | Owner/Admin xem doanh thu, ti le lap day, booking theo ngay |

## Quy Tac Nghiep Vu Cot Loi

- Mot booking chiem san khi trang thai la `pending`, `confirmed`, `checked_in`.
- Khong cho dat trung cung san, cung ngay, giao nhau ve thoi gian.
- Khong cho dat san trong qua khu.
- Slot hold mac dinh 10 phut.
- Gio mo cua mac dinh: 05:00 - 22:00.
- Khung gio cao diem mac dinh: 17:00 - 21:00.
- Backend tinh tien, frontend khong duoc gui tong tien de tin truc tiep.
- Password luu plain text theo yeu cau hien tai.
- Email user phai ket thuc bang `@gmail.com`.
- Transaction data khong xoa vat ly; cap nhat bang trang thai.

## Key Entities

- `settings`: thong tin co so Ha Noi, gio mo cua, cau hinh slot/hold.
- `users`: tai khoan Admin/Owner/Staff/Customer.
- `roles`: danh sach vai tro.
- `courts`: danh sach san con trong co so.
- `price_rules`: bang gia theo khung gio.
- `slot_holds`: giu slot tam thoi.
- `bookings`: don dat san.
- `booking_slots`: cac khung gio trong booking.
- `addon_services`: dich vu/san pham thue kem.
- `booking_addons`: addon gan voi booking.
- `payment_transactions`: giao dich thanh toan.
- `refunds`: yeu cau/ket qua hoan tien.
- `feedback`: danh gia sau buoi choi.
- `email_logs`: log email/thong bao.
- `audit_logs`: log thao tac quan tri.

## Cau Truc Thu Muc

```text
backend/
  app.js
  server.js
  src/
    config/
    controllers/
    middleware/
    models/
    routes/
    utils/

frontend/
  src/
  public/

mysql-workbench-schema.sql
database.md
IMPLEMENTATION.md
AGENTS.md
CLAUDE.md
```

## Cai Dat Nhanh

### Database

Mo MySQL Workbench va chay:

```text
mysql-workbench-schema.sql
```

Database duoc tao:

```text
pickleball_booking_system
```

User demo:

```text
pickleball.admin@gmail.com / 123456
pickleball.owner@gmail.com / 123456
pickleball.staff@gmail.com / 123456
pickleball.customer@gmail.com / 123456
```

### Backend

```bash
cd backend
npm install
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## API Hien Co

- `GET /api/health`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/password`
- `GET /api/auth/me`

## Success Criteria

- Customer co the xem lich trong va dat san trong duoi 3 phut.
- Khong xay ra double-booking.
- Booking duoc cap nhat trang thai sau payment.
- Owner/Staff/Admin xem duoc lich trong ngay va quan ly check-in/check-out.
- Bao cao co ban hien thi doanh thu va so booking theo ngay.
