# Hệ Thống Đặt Sân Pickleball Trực Tuyến (Pickleball Court Booking System)

**Project**: `pickleball-booking-system`

**Created**: 2026-05-26

**Scope**: Một cơ sở pickleball tại Hà Nội

**Tech Stack**: React + Node.js + MySQL

**Status**: Development

---

## Mục Tiêu Dự Án

Xây dựng hệ thống đặt sân pickleball trực tuyến phục vụ thể thao cho một cơ sở tại Hà Nội. Hệ thống cho phép người dùng xem lịch trống, đặt sân, thanh toán, hủy lịch và xem lịch sử đặt sân. Owner/Staff/Admin quản lý lịch đặt sân, trạng thái sân, sản phẩm/dịch vụ thuê kèm, thanh toán và báo cáo cơ bản.

### Quy trình đặt sân

```
Khách chưa đăng nhập → Đăng ký / Đăng nhập
         ↓
Customer xem lịch trống theo ngày/sân/khung giờ
         ↓
Customer chọn sân + ngày + khung giờ
         ↓
Hệ thống tạo slot hold 10 phút
         ↓
Customer thanh toán
         ↓
Thanh toán thành công → Booking confirmed
         ↓
Staff theo dõi, check-in / check-out
```

### Phạm vi

| Có                                              | Không                                        |
| ----------------------------------------------- | -------------------------------------------- |
| Một cơ sở pickleball tại Hà Nội                 | Quản lý nhiều khu vực / nhiều chi nhánh      |
| Nhiều sân trong cùng một cơ sở                  | Module giải đấu                              |
| Xem lịch trống theo ngày / giờ                  | Tích hợp ERP / CRM                           |
| Đặt sân online và giữ slot tạm thời (10 phút)   | Lưu thông tin thẻ thanh toán                 |
| Thanh toán và ghi nhận giao dịch                | Quản lý hợp đồng HLV chuyên sâu             |
| Hủy lịch và hoàn tiền theo chính sách           | Multi-tenant                                 |
| Owner/Staff/Admin quản lý booking, sân, addon, payment, report | Không có module ranking thi đấu |

---

## Tech Stack

| Tầng       | Công nghệ            |
| ---------- | -------------------- |
| Frontend   | React + Vite         |
| Backend    | Node.js + Express    |
| Database   | MySQL 8.0            |
| DB Driver  | mysql2/promise       |
| Auth       | HMAC token từ backend |
| Password   | Plain text (yêu cầu hiện tại) |

---

## Priority Levels

| Priority          | Ý nghĩa      | Mô tả                  |
| ----------------- | ------------ | ---------------------- |
| **P1 - Bắt buộc** | Must Have    | Nghiệp vụ cốt lõi      |
| **P2 - Nên có**   | Should Have  | Tăng hiệu quả vận hành |
| **P3 - Nếu có**   | Nice to Have | Cải thiện trải nghiệm  |

---

## Tổng Quan User Stories

### P1 - Bắt buộc

| ID       | Tên                        | Mô tả                                                              |
| -------- | -------------------------- | ------------------------------------------------------------------ |
| US-PB-01 | Đăng ký / Đăng nhập        | Khách chưa đăng nhập tạo tài khoản Customer bằng email Gmail       |
| US-PB-02 | Xem lịch sân               | Customer xem lịch trống theo ngày, sân, khung giờ                  |
| US-PB-03 | Đặt sân online             | Customer chọn sân và giữ slot trong 10 phút                        |
| US-PB-04 | Thanh toán                 | Hệ thống ghi nhận payment và xác nhận booking                      |
| US-PB-05 | Hủy lịch / Hoàn tiền       | Customer hủy lịch theo chính sách, hoàn tiền tương ứng             |
| US-PB-06 | Staff quản lý lịch         | Staff xem danh sách booking, check-in / check-out                  |
| US-PB-07 | Quản lý addon              | Owner/Staff/Admin quản lý vợt, bóng, nước uống và dịch vụ kèm     |
| US-PB-08 | Báo cáo cơ bản             | Owner/Admin xem doanh thu, tỷ lệ lấp đầy, booking theo ngày        |

### P2 - Nên có

| ID       | Tên                              | Mô tả                                                    |
| -------- | -------------------------------- | -------------------------------------------------------- |
| US-PB-10 | Quản lý giá theo khung giờ       | Cấu hình giá thường / cao điểm / cuối tuần               |
| US-PB-11 | Feedback & Đánh giá              | Customer gửi đánh giá sau buổi chơi, Owner/Staff xem     |
| US-PB-12 | Thông báo email                  | Gửi email xác nhận đặt sân, nhắc lịch, xác nhận hủy     |
| US-PB-13 | Lịch sử giao dịch Customer       | Customer xem lại các lần đặt sân, trạng thái, hóa đơn   |

### P3 - Nếu có

| ID       | Tên                              | Mô tả                                                    |
| -------- | -------------------------------- | -------------------------------------------------------- |
| US-PB-16 | Tái đặt nhanh                    | Customer tái đặt sân yêu thích từ lịch sử chỉ 1 click   |
| US-PB-17 | Bảo trì sân                      | Staff/Admin đóng sân tạm thời, ghi nhận lý do            |
| US-PB-18 | Thống kê nâng cao                | Biểu đồ doanh thu theo tuần/tháng, top sân được đặt nhiều |

---

## User Stories Chi tiết

### US-PB-01: Đăng ký / Đăng nhập (P1)

**Mô tả**: Khách chưa có tài khoản đăng ký bằng email Gmail để trở thành Customer và đăng nhập vào hệ thống.

**Quy tắc nghiệp vụ**:
- Email bắt buộc có đuôi `@gmail.com`.
- Password lưu plain text theo yêu cầu hiện tại.
- Auth bằng HMAC token từ backend.

**Acceptance Scenarios**:

1. **Given** truy cập trang đăng ký, **When** Guest nhập tên, email `@gmail.com`, mật khẩu và xác nhận, **Then** hệ thống tạo tài khoản Customer, trả về token, chuyển hướng đến trang chủ.

2. **Given** email đã tồn tại trong hệ thống, **When** Guest đăng ký lại cùng email, **Then** hệ thống báo lỗi "Email đã được sử dụng".

3. **Given** email không có đuôi `@gmail.com`, **When** Guest nhập và gửi form, **Then** hệ thống từ chối: "Chỉ chấp nhận email Gmail".

4. **Given** Customer có tài khoản, **When** đăng nhập đúng email và mật khẩu, **Then** hệ thống trả về token, Customer truy cập được các chức năng đặt sân.

5. **Given** Customer nhập sai mật khẩu, **When** gửi form đăng nhập, **Then** hệ thống báo lỗi "Email hoặc mật khẩu không đúng", không tiết lộ trường nào sai.

---

### US-PB-02: Xem Lịch Sân (P1)

**Mô tả**: Customer xem lịch trống theo ngày, sân và khung giờ để chọn slot phù hợp.

**Quy tắc nghiệp vụ**:
- Giờ mở cửa mặc định: 05:00 – 22:00.
- Khung giờ cao điểm mặc định: 17:00 – 21:00.
- Không hiển thị slot trong quá khứ.

**Acceptance Scenarios**:

1. **Given** Customer truy cập trang đặt sân, **When** chọn ngày hôm nay, **Then** hiển thị toàn bộ sân và trạng thái từng khung giờ (Trống / Đã đặt / Đang giữ / Bảo trì).

2. **Given** xem lịch sân, **When** lọc theo khung giờ cao điểm 17h–21h, **Then** chỉ hiển thị các slot trong khung giờ đó kèm giá cao điểm.

3. **Given** tất cả sân đã kín lịch ngày đã chọn, **When** Customer xem, **Then** hệ thống hiển thị "Không còn sân trống ngày này".

4. **Given** Customer chọn ngày trong quá khứ, **When** xem lịch, **Then** hệ thống không cho đặt, các slot hiển thị ở chế độ chỉ xem.

---

### US-PB-03: Đặt Sân Online (P1)

**Mô tả**: Customer chọn sân, ngày và khung giờ; hệ thống giữ slot tạm thời 10 phút trong khi Customer hoàn tất thanh toán.

**Quy tắc nghiệp vụ**:
- Slot hold mặc định: 10 phút.
- Một booking chiếm sân khi trạng thái là `pending`, `confirmed`, `checked_in`.
- Không cho đặt trùng cùng sân, cùng ngày, giao nhau về thời gian.
- Không cho đặt sân trong quá khứ.
- Backend tính tiền; frontend không được gửi tổng tiền để tin trực tiếp.

**Acceptance Scenarios**:

1. **Given** Customer chọn Sân 01 khung 9h–11h ngày mai, **When** xác nhận chọn, **Then** hệ thống tạo slot hold 10 phút, hiển thị thông tin đặt sân và đồng hồ đếm ngược.

2. **Given** hold 10 phút hết hạn mà Customer chưa thanh toán, **When** hết thời gian, **Then** hệ thống tự động giải phóng slot, thông báo "Phiên đặt sân đã hết hạn, vui lòng chọn lại".

3. **Given** hai Customer cùng chọn một sân và khung giờ, **When** đồng thời, **Then** chỉ một người được hold slot; người còn lại thấy thông báo "Sân vừa được giữ, vui lòng chọn sân khác".

4. **Given** Customer cố đặt sân trong quá khứ, **When** gửi yêu cầu, **Then** backend từ chối: "Không thể đặt sân trong quá khứ".

---

### US-PB-04: Thanh Toán (P1)

**Mô tả**: Hệ thống ghi nhận thanh toán (tại quầy hoặc chuyển khoản), xác nhận booking và cập nhật trạng thái.

**Quy tắc nghiệp vụ**:
- Backend tính tổng tiền dựa trên `price_rules`; không tin tổng tiền do frontend gửi lên.
- Transaction data không xóa vật lý; chỉ cập nhật bằng trạng thái.

**Acceptance Scenarios**:

1. **Given** Customer có slot hold hợp lệ, **When** Staff/hệ thống ghi nhận thanh toán thành công, **Then** booking chuyển trạng thái `confirmed`, slot hold được chuyển thành booking chính thức.

2. **Given** thanh toán thất bại hoặc hết thời gian hold, **When** giao dịch không hoàn tất, **Then** booking hủy, slot được giải phóng, ghi nhận giao dịch thất bại vào `payment_transactions`.

3. **Given** Staff thu tiền mặt tại quầy, **When** xác nhận thanh toán trên hệ thống, **Then** booking chuyển `confirmed`, ghi nhận hình thức "Tiền mặt", người thu và thời gian.

4. **Given** booking đã `confirmed`, **When** kiểm tra lại tổng tiền, **Then** giá trị phải khớp với `price_rules` tại thời điểm đặt, không phụ thuộc vào dữ liệu frontend gửi lên.

---

### US-PB-05: Hủy Lịch / Hoàn Tiền (P1)

**Mô tả**: Customer hủy lịch đặt sân; hệ thống áp dụng chính sách phí hủy theo thời gian còn lại trước giờ chơi và xử lý hoàn tiền.

**Acceptance Scenarios**:

1. **Given** Customer hủy trước 24h so với giờ chơi, **When** xác nhận hủy, **Then** hoàn 100% tiền, tạo bản ghi `refunds`, slot trả về "Trống".

2. **Given** Customer hủy trong vòng 2–24h trước giờ chơi, **When** xác nhận hủy, **Then** hoàn 50%, phí hủy 50% ghi nhận vào doanh thu.

3. **Given** Customer hủy trong vòng 2h trước giờ chơi hoặc no-show, **When** hủy hoặc hệ thống phát hiện no-show, **Then** không hoàn tiền, booking chuyển `cancelled`.

4. **Given** Staff đóng sân khẩn cấp khi đã có booking, **When** xác nhận đóng sân, **Then** hệ thống tự động hủy booking bị ảnh hưởng và hoàn 100% tiền cho Customer.

---

### US-PB-06: Staff Quản lý Lịch (P1)

**Mô tả**: Staff xem danh sách booking trong ngày, thực hiện check-in khi khách đến và check-out khi kết thúc buổi chơi.

**Acceptance Scenarios**:

1. **Given** đăng nhập là Staff, **When** mở dashboard, **Then** hiển thị danh sách booking hôm nay theo từng sân: mã booking, tên khách, khung giờ, trạng thái.

2. **Given** Customer đến sân, **When** Staff check-in bằng mã booking, **Then** trạng thái chuyển `checked_in`, ghi nhận giờ vào thực tế.

3. **Given** kết thúc buổi chơi, **When** Staff check-out, **Then** trạng thái chuyển `completed`, ghi nhận giờ ra, tính thêm giờ phát sinh nếu có.

4. **Given** Staff muốn xem lịch sân tổng quan, **When** mở trang quản lý sân, **Then** hiển thị tất cả sân theo khung giờ trong ngày với màu trạng thái: xanh = Trống, đỏ = Đã đặt, vàng = Đang giữ (hold).

---

### US-PB-07: Quản lý Addon (P1)

**Mô tả**: Owner/Staff/Admin quản lý danh mục dịch vụ thuê kèm (vợt, bóng, nước uống,...); Customer thêm addon vào booking khi đặt sân.

**Acceptance Scenarios**:

1. **Given** Owner thêm addon "Vợt – thuê 50.000đ/buổi", **When** lưu, **Then** addon xuất hiện trong danh sách dịch vụ kèm khi Customer đặt sân.

2. **Given** Customer thêm 2 vợt vào đơn đặt sân, **When** thanh toán, **Then** tổng tiền = tiền sân + tiền thuê vợt, chi tiết addon ghi nhận trong `booking_addons`.

3. **Given** Staff cập nhật số lượng vợt còn lại về 0, **When** Customer muốn thêm vợt vào booking mới, **Then** hệ thống báo "Dịch vụ này hiện không khả dụng".

4. **Given** Owner vô hiệu hóa một addon, **When** lưu thay đổi, **Then** addon không hiển thị cho Customer nhưng vẫn giữ dữ liệu lịch sử trong các booking cũ.

---

### US-PB-08: Báo Cáo Cơ Bản (P1)

**Mô tả**: Owner và Admin xem báo cáo doanh thu, số lượng booking và tỷ lệ lấp đầy sân theo ngày.

**Acceptance Scenarios**:

1. **Given** đăng nhập là Owner, **When** mở trang báo cáo và chọn ngày hôm nay, **Then** hiển thị: tổng booking, tổng doanh thu, số slot trống còn lại, tỷ lệ lấp đầy (%).

2. **Given** Owner chọn khoảng thời gian tháng 5, **When** chạy báo cáo, **Then** hiển thị doanh thu theo từng ngày, tổng tháng, số booking theo trạng thái (confirmed / cancelled / no-show).

3. **Given** Owner xuất báo cáo, **When** chọn xuất Excel/PDF, **Then** file tải về có: ngày, sân, số booking, doanh thu, tỷ lệ lấp đầy, chi tiết từng booking.

---

### US-PB-10: Quản lý Giá theo Khung Giờ (P2)

**Mô tả**: Admin/Owner cấu hình bảng giá linh hoạt theo khung giờ thường, cao điểm và cuối tuần thông qua `price_rules`.

**Acceptance Scenarios**:

1. **Given** Admin cấu hình giờ cao điểm 17h–21h với giá 150.000đ/giờ, **When** Customer đặt sân khung 18h–20h, **Then** backend tính giá theo `price_rules` cao điểm = 300.000đ.

2. **Given** Customer đặt sân khung 9h–11h (giờ thường 80.000đ/giờ), **When** thanh toán, **Then** tổng tiền = 160.000đ, hiển thị đúng giá trước khi xác nhận.

3. **Given** Admin thay đổi bảng giá, **When** lưu, **Then** các booking đã `confirmed` không bị ảnh hưởng; chỉ áp dụng cho booking mới.

---

### US-PB-11: Feedback & Đánh giá (P2)

**Mô tả**: Customer gửi đánh giá sau buổi chơi; Owner/Staff xem để cải thiện dịch vụ.

**Acceptance Scenarios**:

1. **Given** booking chuyển trạng thái `completed`, **When** Customer vào lịch sử và chọn đánh giá, **Then** hiển thị form: chọn số sao (1–5) và nhập nhận xét, gửi lưu vào `feedback`.

2. **Given** Customer gửi đánh giá 2 sao kèm khiếu nại, **When** lưu, **Then** hệ thống gắn cờ "Cần xử lý", Staff/Owner nhận thông báo.

3. **Given** Owner xem tổng hợp feedback, **When** lọc theo tháng, **Then** hiển thị điểm trung bình, phân bổ số sao, danh sách feedback chưa xử lý.

---

### US-PB-12: Thông Báo Email (P2)

**Mô tả**: Hệ thống tự động gửi email xác nhận đặt sân, nhắc lịch trước giờ chơi và xác nhận hủy qua `email_logs`.

**Acceptance Scenarios**:

1. **Given** booking chuyển `confirmed`, **When** hệ thống kích hoạt, **Then** gửi email đến Customer trong vòng 1 phút bao gồm: sân, ngày giờ, mã booking, hướng dẫn check-in.

2. **Given** còn 2 giờ trước giờ chơi, **When** hệ thống chạy job nhắc lịch, **Then** gửi email nhắc đến Customer.

3. **Given** email gửi thất bại, **When** Mail Service báo lỗi, **Then** hệ thống retry tối đa 3 lần, ghi log kết quả vào `email_logs`.

---

### US-PB-13: Lịch sử Giao dịch Customer (P2)

**Mô tả**: Customer xem lại danh sách các lần đặt sân, trạng thái và thông tin thanh toán của từng booking.

**Acceptance Scenarios**:

1. **Given** Customer đăng nhập, **When** vào trang lịch sử, **Then** hiển thị danh sách booking: mã, sân, ngày giờ, addon, tổng tiền, trạng thái.

2. **Given** Customer xem chi tiết một booking đã hoàn thành, **When** click xem, **Then** hiển thị đầy đủ: thông tin sân, khung giờ thực tế, addon đã dùng, giao dịch thanh toán, hoàn tiền (nếu có).

3. **Given** Customer tìm kiếm booking cụ thể, **When** nhập mã booking hoặc lọc theo tháng, **Then** kết quả lọc hiển thị chính xác.

---

### Edge Cases

- **Đặt trùng lịch**: Không cho phép; slot bị hold ngay khi Customer bắt đầu quy trình đặt, tối đa 10 phút.
- **Hai người giữ cùng slot**: Chỉ một hold thành công; người còn lại nhận thông báo và được gợi ý slot khác.
- **Hold hết hạn không thanh toán**: Slot tự động giải phóng sau 10 phút, booking không được tạo.
- **Hủy sau khi check-in**: Staff xác nhận thủ công; áp dụng chính sách no-show, không hoàn tiền.
- **Sân hỏng đột xuất khi có booking**: Staff/Admin đóng sân, hệ thống tự động hủy booking bị ảnh hưởng và hoàn 100% tiền.
- **Email sai định dạng**: Backend validate bắt buộc đuôi `@gmail.com`, từ chối đăng ký.
- **Frontend gửi tổng tiền sai**: Backend luôn tính lại từ `price_rules`, bỏ qua giá trị frontend gửi lên.
- **Transaction data**: Không xóa vật lý; chỉ cập nhật bằng trạng thái để đảm bảo audit trail.

---

## Requirements

### Nhóm A: Nghiệp vụ Cốt lõi

- **FR-A01**: CHO PHÉP Guest đăng ký tài khoản Customer bằng email `@gmail.com`.
- **FR-A02**: CHO PHÉP Customer xem lịch sân real-time theo ngày, sân và khung giờ.
- **FR-A03**: KHÔNG CHO PHÉP đặt sân trùng slot đang hold hoặc đã confirmed.
- **FR-A04**: KHÔNG CHO PHÉP đặt sân trong quá khứ.
- **FR-A05**: CHO PHÉP giữ slot tạm thời tối đa 10 phút khi Customer đang thanh toán.
- **FR-A06**: CHO PHÉP Customer hủy sân; tự động áp chính sách phí hủy và hoàn tiền tương ứng.
- **FR-A07**: CHO PHÉP Staff check-in/check-out và cập nhật trạng thái booking sau thanh toán: `confirmed` → `checked_in` → `completed` / `cancelled`.

### Nhóm B: Thanh Toán & Tài Chính

- **FR-B01**: BACKEND tính tổng tiền dựa trên `price_rules`; không tin tổng tiền do frontend gửi lên.
- **FR-B02**: CHO PHÉP Staff ghi nhận thanh toán tại quầy (tiền mặt, chuyển khoản).
- **FR-B03**: GHI NHẬN toàn bộ giao dịch vào `payment_transactions`; không xóa vật lý.
- **FR-B04**: CHO PHÉP tạo bản ghi hoàn tiền vào `refunds` khi hủy đủ điều kiện.

### Nhóm C: Quản lý Sân & Cơ sở

- **FR-C01**: CHO PHÉP Admin/Owner cấu hình sân: mã, tên, trạng thái, giờ mở cửa (mặc định 05:00–22:00).
- **FR-C02**: CHO PHÉP cấu hình `price_rules`: giá theo khung giờ thường, cao điểm (mặc định 17:00–21:00), cuối tuần.
- **FR-C03**: CHO PHÉP Staff/Admin đóng sân tạm thời kèm lý do; tự động hủy booking bị ảnh hưởng.

### Nhóm D: Addon & Dịch vụ Kèm

- **FR-D01**: CHO PHÉP Owner/Admin quản lý danh mục addon: tên, giá, số lượng.
- **FR-D02**: CHO PHÉP Customer thêm addon vào booking; backend tính tiền addon vào tổng đơn.
- **FR-D03**: KHÔNG CHO PHÉP thêm addon đã hết hoặc bị vô hiệu hóa vào booking mới.

### Nhóm E: Báo Cáo

- **FR-E01**: CHO PHÉP Owner/Admin xem báo cáo doanh thu, số booking, tỷ lệ lấp đầy theo ngày/tháng.
- **FR-E02**: CHO PHÉP xuất báo cáo Excel/PDF.
- **FR-E03**: GHI NHẬN audit log: ai, khi nào, làm gì, dữ liệu cũ/mới.

### Nhóm F: Phân quyền & Bảo mật

- **FR-F01**: CHO PHÉP phân quyền theo vai trò RBAC: Admin, Owner, Staff, Customer.
- **FR-F02**: XÁC THỰC bằng HMAC token từ backend cho mọi request cần bảo vệ.
- **FR-F03**: VALIDATE email bắt buộc đuôi `@gmail.com` ở cả frontend và backend.
- **FR-F04**: GHI NHẬN audit log toàn bộ thao tác quản trị vào `audit_logs`.

---

## Key Entities

- **`settings`**: Thông tin cơ sở Hà Nội, giờ mở cửa, cấu hình slot hold.
- **`users`**: Tài khoản Admin / Owner / Staff / Customer.
- **`roles`**: Danh sách vai trò.
- **`courts`**: Danh sách sân trong cơ sở.
- **`price_rules`**: Bảng giá theo khung giờ (thường / cao điểm / cuối tuần).
- **`slot_holds`**: Giữ slot tạm thời 10 phút.
- **`bookings`**: Đơn đặt sân.
- **`booking_slots`**: Các khung giờ trong booking.
- **`addon_services`**: Dịch vụ / sản phẩm thuê kèm.
- **`booking_addons`**: Addon gắn với booking.
- **`payment_transactions`**: Giao dịch thanh toán (không xóa vật lý).
- **`refunds`**: Yêu cầu / kết quả hoàn tiền.
- **`feedback`**: Đánh giá sau buổi chơi.
- **`email_logs`**: Log email / thông báo.
- **`audit_logs`**: Log thao tác quản trị.

---

## Cấu Trúc Thư Mục

```
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

---

## Cài Đặt Nhanh

### Database

Mở MySQL Workbench và chạy:

```sql
mysql-workbench-schema.sql
```

Database được tạo:

```
pickleball_booking_system
```

User demo:

| Email                            | Password | Role     |
| -------------------------------- | -------- | -------- |
| pickleball.admin@gmail.com       | 123456   | Admin    |
| pickleball.owner@gmail.com       | 123456   | Owner    |
| pickleball.staff@gmail.com       | 123456   | Staff    |
| pickleball.customer@gmail.com    | 123456   | Customer |

### Backend

```bash
cd backend
npm install
npm run dev
```

Can cau hinh them bien moi truong neu muon dung Google login va OTP email that:

```env
GOOGLE_CLIENT_ID=your-google-web-client-id
SMTP_SERVICE=gmail
SMTP_USER=your-mail@gmail.com
SMTP_PASS=your-gmail-app-password
SMTP_FROM="Pickleball Booking System <your-mail@gmail.com>"
PASSWORD_RESET_OTP_EXPIRES_MINUTES=10
PASSWORD_RESET_OTP_MAX_ATTEMPTS=5
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Neu dung Google Sign-In o frontend:

```env
VITE_GOOGLE_CLIENT_ID=your-google-web-client-id
```

---

## API Hiện Có

| Method | Endpoint                  | Mô tả                        |
| ------ | ------------------------- | ---------------------------- |
| GET    | `/api/health`             | Kiểm tra server hoạt động    |
| POST   | `/api/auth/register`      | Đăng ký tài khoản Customer   |
| POST   | `/api/auth/login`         | Đăng nhập                    |
| POST   | `/api/auth/password`      | Đổi mật khẩu                 |
| GET    | `/api/auth/me`            | Lấy thông tin người dùng hiện tại |
| POST   | `/api/bookings/hold`      | Giữ lịch đặt sân tạm thời 10 phút |
| POST   | `/api/bookings/from-hold` | Ghi nhận thanh toán online và tạo booking confirmed từ lịch đang giữ |
| GET    | `/api/bookings/my`        | Customer xem sân đang đặt và lịch sử đặt sân của mình |

---

## Success Criteria

- **SC-001**: Customer xem lịch trống và đặt sân trong dưới 3 phút.
- **SC-002**: Không xảy ra double-booking dưới bất kỳ điều kiện đồng thời nào.
- **SC-003**: Booking được cập nhật trạng thái chính xác sau khi ghi nhận payment.
- **SC-004**: Owner/Staff/Admin xem được lịch trong ngày và quản lý check-in/check-out.
- **SC-005**: Báo cáo cơ bản hiển thị đúng doanh thu và số booking theo ngày.
- **SC-006**: Slot hold tự động hết hạn và giải phóng đúng sau 10 phút.
- **SC-007**: Backend từ chối mọi request đặt sân có tổng tiền sai lệch so với `price_rules`.

---

## Assumptions

### Người dùng & Môi trường

- Customer có smartphone hoặc máy tính kết nối internet để đặt sân online.
- Cơ sở có internet ổn định để Staff cập nhật trạng thái sân real-time.
- Staff sử dụng máy tính/tablet tại quầy.
- Owner và Admin sử dụng máy tính để xem báo cáo và cấu hình.

### Phạm vi

- Chỉ một cơ sở duy nhất tại Hà Nội; không hỗ trợ multi-tenant hay nhiều chi nhánh.
- Booking được xác nhận sau khi Staff/hệ thống ghi nhận thanh toán thành công.
- Email đăng ký bắt buộc đuôi `@gmail.com`.
- Password lưu plain text theo yêu cầu hiện tại (cần nâng cấp hash trước khi production).

### Dữ liệu

- Đồng tiền: VND.
- Transaction data không xóa vật lý; chỉ cập nhật bằng trạng thái.
- Dữ liệu lưu trữ tối thiểu 2 năm, backup hàng ngày.

### Phân quyền theo Vai trò (Role-Based Access Control)

| Vai trò (Role) | Phạm vi & Quyền hạn                                                                                                          |
| :------------- | :--------------------------------------------------------------------------------------------------------------------------- |
| **Admin**      | Toàn quyền cấu hình hệ thống, quản lý tài khoản người dùng, phân quyền, xem audit log, sao lưu và khôi phục dữ liệu.        |
| **Owner**      | Xem doanh thu và báo cáo, cấu hình sân và bảng giá, quản lý addon, quản lý nhân sự, xem và xử lý feedback từ Customer.                       |
| **Staff**      | Xem và quản lý booking trong ngày, check-in/check-out khách hàng, ghi nhận thanh toán tại quầy, quản lý addon tại cơ sở.    |
| **Customer**   | Xem lịch sân, tự đặt sân online, thanh toán, hủy lịch, thêm addon, gửi feedback, xem lịch sử đặt sân của bản thân.          |
| **Guest**      | Xem HomePage, đăng kí tài khoản           |
