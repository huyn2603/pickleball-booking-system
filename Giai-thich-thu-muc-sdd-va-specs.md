# Giai thich thu muc `.sdd` va `.sdd/specs`

Ngay lap: 2026-06-24  
Du an: `pickleball-booking-system`  
Thu muc phan tich: `.sdd`

## 1. Tom tat

Thu muc `.sdd` la bo tai lieu Spec-Driven Development cua du an Pickleball Court Booking System. No khong phai source code chay truc tiep, ma la noi luu yeu cau, quy tac nghiep vu, ke hoach trien khai, task, quyet dinh kien truc va review.

Trong du an nay, `.sdd` dong vai tro nhu "source of truth" ve nghiep vu. Khi code va tai lieu bi mau thuan, feature spec trong `.sdd/specs/feature-*/SPEC.md` duoc uu tien cho feature tuong ung.

## 2. Cau truc tong quan cua `.sdd`

| Path | Vai tro |
| --- | --- |
| `.sdd/README.md` | Gioi thieu SDD workspace, cau truc folder, source-of-truth order va feature map FE01-FE18. |
| `.sdd/constitution.md` | Luat cap du an: stack duoc phe duyet, change control, review gates, quy tac bao mat/chat luong. |
| `.sdd/constitutions.md` | File tuong thich cu, tro den `constitution.md`. |
| `.sdd/shared_context.md` | Boi canh chung: actor, workflow, stack, module, entity, state machine, glossary. |
| `.sdd/class_inventory.md` | Kiem ke backend modules, frontend components, database entities va cac lop/service co the can them. |
| `.sdd/constraints/` | Rang buoc global, business va safety ma moi feature phai tuan theo. |
| `.sdd/specs/` | Trung tam dac ta tinh nang: project spec, feature specs, plans, tasks, contexts, changelogs, templates. |
| `.sdd/rfcs/` | Architecture Decision Records: architecture, database design, authentication approach. |
| `.sdd/reviews/` | Review notes va gap review, ghi lai ly do ra quyet dinh. |
| `.sdd/skills/` | Huong dan tai su dung cho agent/team. |

## 3. Thu tu uu tien source of truth

Theo `.sdd/README.md`, khi co mau thuan thi uu tien theo thu tu:

1. Feature `SPEC.md` trong `.sdd/specs/feature-*`
2. Feature `PLAN.md`
3. Feature `TASKS.md`
4. `.sdd/specs/PROJECT_SPEC.md`
5. `.sdd/constraints/*.md`
6. `.sdd/shared_context.md`
7. `mysql-workbench-schema.sql`
8. `database.md`
9. Code hien tai

Y nghia quan trong: code hien tai khong mac dinh la dung neu no trai voi spec. Team can sua code, hoac cap nhat/approve spec neu muon doi nghiep vu.

## 4. Folder `.sdd/specs`

Folder `.sdd/specs` la phan quan trong nhat cua `.sdd`. No gom:

- 4 file cap goc: `README.md`, `PROJECT_SPEC.md`, `template.md`, `_template.md`
- 18 feature folders, tu `feature-auth` den `feature-ops-dashboard`
- Moi feature hau het co 5 file: `SPEC.md`, `PLAN.md`, `TASKS.md`, `CONTEXT.md`, `CHANGELOG.md`

### 4.1 File cap goc trong `.sdd/specs`

| File | Giai thich |
| --- | --- |
| `.sdd/specs/README.md` | Muc luc feature spec. Map tung feature folder voi user story `US-PB-01` den `US-PB-20`. |
| `.sdd/specs/PROJECT_SPEC.md` | Dac ta cap du an: purpose, scope, actors, workflows, business rules, data model, API conventions, NFR, risks, open questions. |
| `.sdd/specs/template.md` | Template cu cho `SPEC.md` va `CHANGELOG.md`. Co ve bi loi encoding tieng Viet o mot so doan. |
| `.sdd/specs/_template.md` | Template moi va day du hon cho feature moi: `SPEC.md`, `PLAN.md`, `TASKS.md`, `CONTEXT.md`, `CHANGELOG.md`. |

### 4.2 Y nghia 5 file trong moi feature

| File | Vai tro |
| --- | --- |
| `SPEC.md` | File quan trong nhat. Chua business context, actors, flows, rules, functional requirements, acceptance criteria, data/API/NFR, dependencies va traceability. |
| `PLAN.md` | Ke hoach implement dua tren spec: scope, technical decisions, DB dependency, endpoint, backend/frontend plan, tests, risks, validation gate. |
| `TASKS.md` | Checklist thuc thi: task ID, mapping voi spec/use case, dependency, Definition of Done, thu tu lam viec. |
| `CONTEXT.md` | Boi canh rieng cua feature: purpose, real-world workflow, boundary, data notes, risks, dependencies. |
| `CHANGELOG.md` | Lich su thay doi cua bo tai lieu feature. |

## 5. Noi dung chinh cua `PROJECT_SPEC.md`

`PROJECT_SPEC.md` mo ta he thong dat san pickleball nhieu chi nhanh tai Ha Noi:

- Customer xem lich, giu slot, tao booking, thanh toan/huy booking.
- Staff van hanh hang ngay: confirm/cancel, check-in/out, counter payment.
- Owner/Admin quan ly branch, court, pricing, addon, voucher, report.

Scope MVP/Phase 1 gom:

- Gmail-only register/login.
- Schedule viewing, slot hold mac dinh 10 phut, booking creation.
- Payment recording, booking confirmation, cancellation/refund.
- Staff daily operation.
- Branch/court, pricing, add-on, voucher management.
- Notification, customer history, feedback, reporting tuy phase.

Business rules toan cuc quan trong:

- Khong double-book cung court/time slot.
- Hold phai het han va release availability.
- Khong booking slot trong qua khu.
- Court maintenance/inactive chan hold/booking.
- Tong tien phai tinh server-side.
- Auth response khong tra password/hash.
- Auth error nen tranh user enumeration.

## 6. Danh sach feature trong `.sdd/specs`

| Folder | Feature | User story |
| --- | --- | --- |
| `feature-auth` | FE01 Authentication | US-PB-01 |
| `feature-schedule-booking` | FE02 Schedule & Booking | US-PB-02, US-PB-03 |
| `feature-payment-refund` | FE03 Payment & Refund | US-PB-04, US-PB-05 |
| `feature-staff-daily-operation` | FE04 Staff Daily Operation | US-PB-06 |
| `feature-branch-court` | FE05 Branch & Court Management | US-PB-07 |
| `feature-addon` | FE06 Add-ons | US-PB-08 |
| `feature-basic-reporting` | FE07 Basic Reporting | US-PB-09 |
| `feature-pricing` | FE08 Pricing Rules | US-PB-10 |
| `feature-customer-history` | FE09 Customer History | US-PB-11 |
| `feature-notification` | FE10 Email Notification | US-PB-12 |
| `feature-feedback` | FE11 Feedback | US-PB-13 |
| `feature-internal-account` | FE12 Internal Account Management | US-PB-14 |
| `feature-voucher` | FE13 Voucher | US-PB-15 |
| `feature-maintenance` | FE14 Court Maintenance | US-PB-16 |
| `feature-quick-rebook` | FE15 Quick Rebook | US-PB-17 |
| `feature-advanced-reporting` | FE16 Advanced Reporting | US-PB-18 |
| `feature-slot-suggestion` | FE17 Slot Suggestion | US-PB-19 |
| `feature-ops-dashboard` | FE18 Ops Dashboard | US-PB-20 |

## 7. Giai thich chi tiet cac feature folders

### 7.1 `feature-auth` - FE01 Authentication

Muc tieu: dang ky/dang nhap, lay current user va forgot password bang OTP email. Day la nen tang cho tat ca protected workflows.

File noi dung:

- `SPEC.md`: Gmail-only registration, login, `/api/auth/me`, forgot-password OTP, rule khong tra password/hash, token expiry, OTP hash, generic forgot-password response.
- `PLAN.md`: Ke hoach implement dua tren `authRoutes.js`, `authController.js`, `token.js`, `mailer.js`, bang `users`, `roles`, `password_reset_otps`.
- `TASKS.md`: 10 task, gom verify route, enforce Gmail-only, hash password, token secret/expiry, OTP flow, rate limit, audit/email logs, tests, frontend wiring, changelog.
- `CONTEXT.md`: Workflow auth, feature boundary, risks nhu missing authorization va bad error handling.
- `CHANGELOG.md`: Lich su tao/cap nhat bo docs FE01.

API chinh:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/auth/forgot-password/request-otp`
- `POST /api/auth/forgot-password/verify-otp`
- `POST /api/auth/forgot-password/reset`

Rui ro: leak password/token/OTP, OTP reuse, token expiry khong enforce, response lam lo email ton tai.

### 7.2 `feature-schedule-booking` - FE02 Schedule & Booking

Muc tieu: customer xem availability, tao hold 10 phut, tao booking draft tu hold. Day la core booking logic va co rui ro double-booking.

File noi dung:

- `SPEC.md`: Availability, hold, booking draft, rule overlap, court maintenance/inactive, server-side totals.
- `PLAN.md`: Ke hoach implement availability, atomic hold, booking-from-hold, dependency FE01/FE05/FE08.
- `TASKS.md`: Validate court/date/time, hold expiry, booking slots, tests concurrency.
- `CONTEXT.md`: Booking workflow va data `slot_holds`, `bookings`, `booking_slots`.
- `CHANGELOG.md`: Lich su FE02 docs.

API chinh:

- `GET /api/courts?branchId=...`
- `GET /api/courts/:id/availability?date=YYYY-MM-DD`
- `POST /api/bookings/hold`
- `POST /api/bookings/from-hold`

Rui ro: concurrent hold cung slot, hold het han van booking duoc, court maintenance sau khi hold, client gia mao total.

### 7.3 `feature-payment-refund` - FE03 Payment & Refund

Muc tieu: ghi nhan payment, confirm booking, cancel/refund theo policy. Day la feature tai chinh nen can transaction va audit.

File noi dung:

- `SPEC.md`: Payment transaction, booking confirmation, cancellation/refund policy: >=24h refund 100%, 2-24h refund 50%, <2h manual/no automatic refund.
- `PLAN.md`: Link FE02 booking draft voi payment/refund, webhook idempotency, staff counter payment.
- `TASKS.md`: Transactional update booking + payment/refund, tests policy windows.
- `CONTEXT.md`: Financial workflow va data `payment_transactions`, `refunds`.
- `CHANGELOG.md`: Lich su FE03 docs.

API chinh:

- `GET /api/bookings/payment-status/:holdCode`
- `POST /api/staff/bookings/:id/payment`
- `POST /api/staff/bookings/:id/confirm`
- `POST /api/staff/bookings/:id/cancel`
- `POST /api/bookings/vietqr/webhook`

Rui ro: payment thanh cong nhung booking khong confirmed, webhook duplicate, refund sai policy, financial history bi mat.

### 7.4 `feature-staff-daily-operation` - FE04 Staff Daily Operation

Muc tieu: staff console cho van hanh hang ngay: dashboard, confirm/cancel, check-in/out, counter payment, stock updates.

API chinh:

- `GET /api/staff/dashboard`
- `POST /api/staff/bookings/:id/check-in`
- `POST /api/staff/bookings/:id/check-out`
- `POST /api/staff/bookings/:id/payment`

Rui ro: staff thao tac ngoai branch/quyen, state transition sai, payment tai quay khong dong bo booking status.

### 7.5 `feature-branch-court` - FE05 Branch & Court Management

Muc tieu: quan ly branch va court, day la du lieu nen cho availability, pricing va operations.

API chinh:

- `GET /api/branches`
- `POST /api/branches`
- `GET /api/courts`
- `POST /api/courts`
- `PATCH /api/courts/:id/status`

Rui ro: court status sai lam booking sai, duplicate court code, staff/owner sua du lieu vuot quyen.

### 7.6 `feature-addon` - FE06 Add-ons

Muc tieu: quan ly dich vu cong them nhu thue vot, bong, nuoc; customer chon add-on trong booking; staff/owner quan ly stock.

API chinh:

- `GET /api/addons`
- `POST /api/addons`
- `PATCH /api/addons/:id`
- `PATCH /api/addons/:id/stock`

Rui ro: stock am, customer chon inactive add-on, client tu tinh tien add-on, stock update khong audit.

### 7.7 `feature-basic-reporting` - FE07 Basic Reporting

Muc tieu: bao cao co ban cho Owner/Admin: doanh thu, booking, payment/refund theo ngay/thang.

API chinh:

- `GET /api/reports/basic/daily`
- `GET /api/reports/basic/monthly`

Rui ro: tinh doanh thu khong tru refund, sai timezone, leak branch scope.

### 7.8 `feature-pricing` - FE08 Pricing Rules

Muc tieu: quan ly gia theo thoi gian/branch/court/priority va tinh quote server-side.

API chinh:

- `GET /api/pricing/rules`
- `POST /api/pricing/rules`
- `PATCH /api/pricing/rules/:id`
- `GET /api/pricing/quote`

Rui ro: overlapping rule khong co priority ro, client tu tinh gia, sai timezone, booking total khac payment amount.

### 7.9 `feature-customer-history` - FE09 Customer History

Muc tieu: customer xem lich su booking, payment, refund, add-on cua chinh minh.

API chinh:

- `GET /api/me/bookings`
- `GET /api/me/bookings/:id`

Rui ro: customer xem duoc booking cua nguoi khac, thieu refund/payment detail, filter status/date sai.

### 7.10 `feature-notification` - FE10 Email Notification

Muc tieu: gui OTP, booking confirmation, cancellation, reminder va ghi log email an toan. Email khong duoc lam hong core flow neu SMTP loi.

API chinh:

- `POST /api/notifications/test-email`

Rui ro: log raw OTP/token, SMTP loi lam fail booking/payment, duplicate email, thieu tracking.

### 7.11 `feature-feedback` - FE11 Feedback

Muc tieu: customer gui rating/comment sau booking completed; staff/owner xem feedback de cai thien service.

API chinh:

- `POST /api/feedback`
- `GET /api/staff/feedback`

Rui ro: feedback cho booking chua completed, customer feedback booking cua nguoi khac, duplicate feedback.

### 7.12 `feature-internal-account` - FE12 Internal Account Management

Muc tieu: Owner/Admin quan ly tai khoan noi bo Staff/Owner/Admin, role, branch scope, status.

API chinh:

- `GET /api/admin/users`
- `POST /api/admin/users`
- `PATCH /api/admin/users/:id`

Rui ro: privilege escalation, Owner tao Admin trai phep, Staff gan sai branch, tra password/hash.

### 7.13 `feature-voucher` - FE13 Voucher

Muc tieu: quan ly ma giam gia/voucher va ap dung voucher trong checkout server-side.

API chinh:

- `POST /api/bookings/:id/apply-voucher`
- `GET /api/admin/vouchers`
- `POST /api/admin/vouchers`
- `PATCH /api/admin/vouchers/:id`

Rui ro: ap voucher het han, vuot usage limit, duplicate apply, client tu tinh discount, race condition voi usage limit.

### 7.14 `feature-maintenance` - FE14 Court Maintenance

Muc tieu: staff/admin danh dau court maintenance de chan booking moi va xem booking tuong lai bi anh huong.

API chinh:

- `PATCH /api/courts/:id/status`
- `GET /api/staff/courts/:id/impacted-bookings`

Rui ro: court maintenance van cho booking, khong thay impacted bookings, permission chua ro.

### 7.15 `feature-quick-rebook` - FE15 Quick Rebook

Muc tieu: customer dat lai nhanh tu booking cu bang cach prefill thong tin va tao hold moi neu slot kha dung.

API chinh:

- `POST /api/me/bookings/:id/rebook`

Rui ro: copy nham booking cu thanh paid booking moi, rebook slot khong available, cross-user access.

### 7.16 `feature-advanced-reporting` - FE16 Advanced Reporting

Muc tieu: bao cao nang cao ve trend, peak hours, top courts, top add-ons de toi uu van hanh.

API chinh:

- `GET /api/reports/advanced/trends`
- `GET /api/reports/advanced/peak-hours`
- `GET /api/reports/advanced/top-courts`
- `GET /api/reports/advanced/top-addons`

Rui ro: query qua rong lam cham, metrics khong thong nhat voi FE07, leak branch scope.

### 7.17 `feature-slot-suggestion` - FE17 Slot Suggestion

Muc tieu: goi y slot thay the gan nhat khi slot mong muon khong kha dung.

API chinh:

- `GET /api/suggestions/slots`

Rui ro: goi y slot da bi hold/booked, goi y court maintenance, ranking kho hieu, slot qua khu.

### 7.18 `feature-ops-dashboard` - FE18 Ops Dashboard

Muc tieu: dashboard tong hop van hanh cho Owner/Admin: utilization, cancellation, feedback, staff/branch performance.

API chinh:

- `GET /api/dashboard/ops`

Rui ro: dashboard tinh khac reporting, query nang, leak data giua branch, permission chua ro.

## 8. Diem dang chu y

1. Bo specs cover day du `US-PB-01` den `US-PB-20`.
2. `feature-schedule-booking` gom `US-PB-02` va `US-PB-03` vi chung flow xem lich -> hold -> booking.
3. `feature-payment-refund` gom `US-PB-04` va `US-PB-05` vi cung nghiep vu tai chinh.
4. Template nen dung cho feature moi la `.sdd/specs/_template.md`.
5. Nhieu feature phu thuoc nhau, nen implement theo dependency thay vi lam tuy tien.

## 9. Cach dung khi phat trien

Quy trinh de xuat:

1. Chon feature can lam.
2. Doc `SPEC.md` truoc.
3. Doc `CONTEXT.md` de hieu boi canh va rui ro.
4. Doc `PLAN.md` de biet cach trien khai.
5. Doc `TASKS.md` de chia viec va theo doi Definition of Done.
6. Implement code theo task.
7. Viet/chay test theo acceptance criteria.
8. Cap nhat `CHANGELOG.md` neu behavior/spec thay doi.

## 10. Thu tu implement de xuat

Nen uu tien theo dependency:

1. FE01 Authentication
2. FE05 Branch & Court
3. FE08 Pricing
4. FE02 Schedule & Booking
5. FE03 Payment & Refund
6. FE04 Staff Daily Operation
7. Feature mo rong: Add-ons, Voucher, History, Notification, Reporting, Feedback, Maintenance, Rebook, Suggestion, Dashboard

## 11. Ket luan

`.sdd` la bo tai lieu quan tri yeu cau va thiet ke theo spec-driven. `.sdd/specs` la phan quan trong nhat vi chia du an thanh 18 feature ro rang, moi feature co dac ta, ke hoach, task, boi canh va changelog.

Gia tri chinh cua folder nay:

- Giup team hieu scope truoc khi code.
- Truy vet tu user story -> requirement -> acceptance criteria -> task -> test.
- Giam rui ro nghiep vu nhu double-booking, refund sai, leak data, sai authorization.
- De review, chia viec va bao ve quyet dinh khi lam viec nhom hoac nop bai.
