# MySQL Workbench Import Guide

File database: `mysql-workbench-schema.sql`

## Scope

Schema nay dung cho mot co so pickleball tai Ha Noi.

- Khong co `branches`.
- Khong co `regions`.
- Khong co `clubs`.
- Khong co multi-tenant.

## Cach import

1. Mo MySQL Workbench va ket noi vao MySQL Server.
2. Chon `File > Open SQL Script`.
3. Mo file `mysql-workbench-schema.sql`.
4. Chay toan bo script.
5. Refresh tab `Schemas`.
6. Chon database `pickleball_booking_system`.

## Bang duoc tao

- Cau hinh co so: `settings`
- Tai khoan va phan quyen: `roles`, `users`
- San va bang gia: `courts`, `price_rules`
- Booking: `slot_holds`, `bookings`, `booking_slots`
- Dich vu kem: `categories`, `addon_services`, `booking_addons`
- Khuyen mai: `promotions`, `vouchers`
- Thanh toan/hoan tien: `payment_transactions`, `refunds`
- Van hanh: `feedback`, `email_logs`, `audit_logs`

## User demo

Tat ca user demo dung mat khau plain text:

```text
123456
```

Email demo:

- `pickleball.admin@gmail.com`
- `pickleball.staff@gmail.com`
- `pickleball.customer@gmail.com`

## Luu y

- Email user bat buoc co duoi `@gmail.com`.
- Password duoc luu plain text theo yeu cau hien tai.
- Trigger da duoc them de chan dat trung slot dang giu hoac booking dang active.
- Khi chuyen tu `slot_holds` sang booking that, service nen doi hold sang `converted` truoc khi insert `booking_slots`, hoac thuc hien logic chuyen doi bang transaction.
