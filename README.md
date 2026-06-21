# Hệ Thống Đặt Sân Pickleball Trực Tuyến (Pickleball Court Booking System)

**Feature Branch**: `001-pickleball-booking-system`

**Created**: 2026-05-26

**Status**: Development

---

## Mục Tiêu Dự Án

Xây dựng hệ thống đặt sân pickleball trực tuyến cho mô hình nhiều chi nhánh nhỏ tại Hà Nội. Hệ thống phục vụ cả khách hàng tự đặt sân online và đội ngũ vận hành tại sân, giúp quy trình xem lịch, giữ slot, thanh toán, check-in, check-out, hủy lịch, hoàn tiền và báo cáo được quản lý tập trung trên một nền tảng.

Dự án tập trung vào bài toán vận hành thực tế của các cụm sân pickleball: mỗi chi nhánh có nhiều sân con, mỗi sân có lịch theo ngày và khung giờ, mỗi lượt đặt có thể phát sinh dịch vụ kèm như thuê vợt, mua bóng, nước uống hoặc phụ kiện. Hệ thống phải ngăn trùng lịch, không cho đặt quá khứ, giữ slot tạm thời trong thời gian khách thanh toán, ghi nhận giao dịch đầy đủ và hỗ trợ phân quyền rõ giữa Admin, Owner, Staff, Customer và Guest.

Hệ thống không phải nền tảng giải đấu, không phải CRM/ERP, không mở rộng thành multi-tenant hoặc chuỗi franchise nhiều tỉnh thành trong giai đoạn hiện tại. Phạm vi chính là đặt sân và vận hành các chi nhánh nhỏ trong Hà Nội với dữ liệu minh bạch, dễ kiểm tra và đủ nền tảng để phát triển các sprint tiếp theo.

### Quy trình đặt sân

```
Guest truy cập hệ thống
       ↓
Đăng ký / Đăng nhập bằng email Gmail
       ↓
Customer chọn chi nhánh tại Hà Nội
       ↓
Customer xem lịch trống theo ngày, sân và khung giờ
       ↓
Customer chọn sân + khung giờ + addon nếu có
       ↓
Hệ thống kiểm tra trùng lịch, giờ quá khứ và trạng thái sân
       ↓
Hệ thống tạo slot hold tạm thời trong 10 phút
       ↓
Customer thanh toán hoặc Staff ghi nhận thanh toán tại quầy
       ↓
Thanh toán thành công → Booking confirmed
       ↓
Staff theo dõi lịch trong ngày, check-in / check-out
       ↓
Booking completed hoặc cancelled / refunded theo chính sách
```

### Phạm vi

| Có | Không |
| --- | --- |
| Đặt sân pickleball online theo chi nhánh, ngày, sân và khung giờ | Module giải đấu, bảng xếp hạng hoặc livestream trận đấu |
| Nhiều chi nhánh nhỏ trong Hà Nội | Quản lý nhiều tỉnh/thành phố hoặc multi-tenant theo công ty |
| Mỗi chi nhánh có nhiều sân indoor/outdoor | Quản lý franchise độc lập với tenant riêng |
| Giữ slot tạm thời trong 10 phút để tránh tranh chấp đặt sân | Lưu thông tin thẻ thanh toán của khách hàng |
| Chống double-booking bằng trạng thái booking và slot hold | Tích hợp ERP/CRM/kế toán chuyên sâu |
| Staff check-in, check-out, ghi nhận thanh toán tại quầy | Quản lý hợp đồng HLV chuyên sâu |
| Owner/Admin cấu hình chi nhánh, sân, giá, addon và báo cáo | Module bán hàng thương mại điện tử đầy đủ |
| Customer xem lịch sử, hủy lịch, nhận email và gửi feedback | App mobile native riêng trong giai đoạn hiện tại |
| Báo cáo doanh thu, số booking, tỷ lệ lấp đầy theo chi nhánh | Phân tích BI nâng cao ngoài phạm vi MVP |

---

## Priority Levels

| Priority | Ý nghĩa | Mô tả |
| --- | --- | --- |
| **P1 - Bắt buộc** | Must Have | Nghiệp vụ cốt lõi để hệ thống đặt sân vận hành được |
| **P2 - Nên có** | Should Have | Tăng hiệu quả quản trị, chăm sóc khách hàng và kiểm soát dữ liệu |
| **P3 - Nếu có** | Nice to Have | Cải thiện trải nghiệm, tối ưu vận hành hoặc mở rộng báo cáo |

---

## Tổng Quan User Stories

### P1 - Bắt buộc

| ID | Tên | Mô tả |
| --- | --- | --- |
| US-PB-01 | Đăng ký / Đăng nhập | Guest tạo tài khoản Customer bằng email Gmail, đăng nhập và nhận token |
| US-PB-02 | Xem lịch sân | Customer xem lịch trống theo chi nhánh, ngày, sân và khung giờ |
| US-PB-03 | Giữ slot và đặt sân online | Customer chọn sân, hệ thống giữ slot 10 phút và ngăn trùng lịch |
| US-PB-04 | Thanh toán và xác nhận booking | Ghi nhận thanh toán, chuyển booking từ pending sang confirmed |
| US-PB-05 | Hủy lịch / Hoàn tiền | Customer hủy lịch, hệ thống áp dụng chính sách hoàn tiền |
| US-PB-06 | Staff quản lý lịch trong ngày | Staff xem booking theo chi nhánh, check-in, check-out và cập nhật trạng thái |
| US-PB-07 | Quản lý sân và chi nhánh | Admin/Owner quản lý chi nhánh, sân, trạng thái sân và thông tin vận hành |
| US-PB-08 | Quản lý addon | Owner/Staff/Admin quản lý dịch vụ kèm như vợt, bóng, nước uống |
| US-PB-09 | Báo cáo cơ bản | Owner/Admin xem doanh thu, số booking và tỷ lệ lấp đầy |

### P2 - Nên có

| ID | Tên | Mô tả |
| --- | --- | --- |
| US-PB-10 | Quản lý giá theo khung giờ | Cấu hình giá theo hệ thống, chi nhánh, sân, giờ thường, giờ cao điểm và cuối tuần |
| US-PB-11 | Lịch sử giao dịch Customer | Customer xem lại booking, payment, refund và addon đã sử dụng |
| US-PB-12 | Thông báo email | Gửi email xác nhận đặt sân, nhắc lịch, OTP và xác nhận hủy |
| US-PB-13 | Feedback & Đánh giá | Customer đánh giá sau buổi chơi, Staff/Owner xử lý phản hồi |
| US-PB-14 | Quản lý tài khoản nội bộ | Admin/Owner tạo và khóa/mở tài khoản Staff hoặc Customer |
| US-PB-15 | Voucher / khuyến mãi | Áp dụng mã giảm giá và kiểm soát số lần sử dụng |
| US-PB-16 | Quản lý bảo trì sân | Staff/Admin đóng sân tạm thời, ghi nhận lý do và xử lý booking bị ảnh hưởng |

### P3 - Nếu có

| ID | Tên | Mô tả |
| --- | --- | --- |
| US-PB-17 | Tái đặt nhanh | Customer đặt lại sân yêu thích từ lịch sử trong một vài thao tác |
| US-PB-18 | Thống kê nâng cao | Biểu đồ doanh thu, giờ cao điểm, top sân và xu hướng đặt sân |
| US-PB-19 | Gợi ý slot thay thế | Khi sân đã kín, hệ thống gợi ý slot hoặc chi nhánh gần nhất còn trống |
| US-PB-20 | Dashboard vận hành nâng cao | Owner xem hiệu suất từng chi nhánh, nhân sự, addon và phản hồi khách hàng |

---

## User Stories Chi tiết

### US-PB-01: Đăng ký / Đăng nhập (P1)

**Mô tả**: Guest đăng ký tài khoản bằng email Gmail để trở thành Customer. Sau khi đăng nhập thành công, hệ thống trả về HMAC token để Customer sử dụng các chức năng đặt sân, xem lịch sử và quản lý thông tin cá nhân.

**Acceptance Scenarios**:

1. **Given** Guest mở form đăng ký, **When** nhập họ tên, email có đuôi `@gmail.com`, mật khẩu và gửi form, **Then** hệ thống tạo tài khoản Customer ở trạng thái hợp lệ, trả về token và cho phép truy cập trang đặt sân.

2. **Given** email đã tồn tại, **When** Guest đăng ký lại cùng email, **Then** hệ thống từ chối và hiển thị thông báo email đã được sử dụng.

3. **Given** Guest nhập email không phải Gmail, **When** gửi form đăng ký, **Then** frontend và backend đều phải từ chối theo cùng một quy tắc.

4. **Given** Customer đã có tài khoản, **When** đăng nhập đúng email và mật khẩu, **Then** hệ thống trả về token, thông tin người dùng hiện tại và role để frontend điều hướng đúng màn hình.

5. **Given** Customer nhập sai email hoặc mật khẩu, **When** đăng nhập, **Then** hệ thống trả về lỗi chung, không tiết lộ trường nào sai và không trả về password trong response.

6. **Given** Customer quên mật khẩu, **When** yêu cầu OTP qua email, **Then** hệ thống tạo OTP có hạn sử dụng, lưu hash OTP và gửi email nếu cấu hình SMTP hợp lệ.

---

### US-PB-02: Xem lịch sân (P1)

**Mô tả**: Customer chọn chi nhánh và ngày muốn chơi để xem trạng thái từng sân theo khung giờ. Lịch phải thể hiện rõ slot trống, đã đặt, đang giữ, đang sử dụng hoặc bảo trì.

**Acceptance Scenarios**:

1. **Given** Customer đã đăng nhập, **When** chọn chi nhánh Tây Hồ và ngày hôm nay, **Then** hệ thống hiển thị danh sách sân thuộc chi nhánh đó, không hiển thị sân của chi nhánh khác.

2. **Given** chi nhánh có nhiều sân indoor/outdoor, **When** Customer lọc theo loại sân, **Then** lịch chỉ hiển thị các sân phù hợp với bộ lọc.

3. **Given** một slot đang có booking `confirmed`, **When** Customer xem lịch, **Then** slot đó hiển thị là đã đặt và không thể chọn.

4. **Given** một slot đang có hold `active` chưa hết hạn, **When** Customer khác xem lịch, **Then** slot đó hiển thị đang giữ và không thể giữ trùng.

5. **Given** Customer chọn ngày trong quá khứ, **When** mở lịch, **Then** hệ thống chỉ cho xem dữ liệu lịch sử, không cho tạo booking mới.

6. **Given** tất cả sân trong một chi nhánh đã kín lịch, **When** Customer xem ngày đó, **Then** hệ thống hiển thị trạng thái hết slot và có thể gợi ý ngày hoặc chi nhánh khác trong phạm vi Hà Nội.

---

### US-PB-03: Giữ slot và đặt sân online (P1)

**Mô tả**: Customer chọn sân, ngày và khung giờ. Trước khi thanh toán, hệ thống tạo `slot_holds` trong 10 phút để tránh hai khách cùng thanh toán cho một slot.

**Acceptance Scenarios**:

1. **Given** Customer chọn Sân A1 khung 09:00-10:00 ngày mai, **When** xác nhận chọn slot, **Then** hệ thống kiểm tra trạng thái sân, kiểm tra trùng lịch và tạo hold 10 phút nếu slot hợp lệ.

2. **Given** hold đã được tạo, **When** Customer ở màn hình thanh toán, **Then** giao diện hiển thị chi nhánh, sân, ngày, giờ, giá dự kiến, addon và đồng hồ đếm ngược.

3. **Given** hold hết hạn, **When** Customer chưa thanh toán, **Then** hệ thống chuyển hold sang `expired`, giải phóng slot và yêu cầu Customer chọn lại.

4. **Given** hai Customer cùng đặt một slot, **When** request đến gần như đồng thời, **Then** chỉ một hold được tạo thành công; request còn lại bị từ chối bằng thông báo slot vừa được giữ.

5. **Given** frontend gửi tổng tiền tự tính, **When** backend xử lý booking, **Then** backend bỏ qua tổng tiền không tin cậy và tự tính lại từ `price_rules`, addon và voucher hợp lệ.

6. **Given** sân đang ở trạng thái `maintenance` hoặc `inactive`, **When** Customer cố đặt sân, **Then** hệ thống từ chối trước khi tạo hold.

---

### US-PB-04: Thanh toán và xác nhận booking (P1)

**Mô tả**: Hệ thống ghi nhận thanh toán cho booking. Trong MVP, thanh toán có thể được Staff xác nhận tại quầy bằng tiền mặt hoặc chuyển khoản; dữ liệu giao dịch phải được lưu trong `payment_transactions`.

**Acceptance Scenarios**:

1. **Given** Customer có slot hold hợp lệ, **When** thanh toán thành công, **Then** booking được tạo hoặc cập nhật sang `confirmed`, payment status chuyển `paid` và hold chuyển `converted`.

2. **Given** Staff thu tiền mặt tại quầy, **When** bấm xác nhận thanh toán, **Then** hệ thống ghi nhận payment method, số tiền, người xử lý và thời gian thanh toán.

3. **Given** thanh toán thất bại, **When** hệ thống nhận kết quả lỗi, **Then** ghi nhận giao dịch `failed`, không xác nhận booking và không xóa dữ liệu giao dịch.

4. **Given** booking đã thanh toán, **When** Customer xem lịch sử, **Then** hiển thị mã booking, số tiền, phương thức thanh toán, trạng thái và thời điểm thanh toán.

5. **Given** backend tính giá khác với dữ liệu frontend gửi lên, **When** xử lý thanh toán, **Then** backend dùng giá do server tính và trả thông tin chênh lệch nếu cần xác nhận lại.

---

### US-PB-05: Hủy lịch / Hoàn tiền (P1)

**Mô tả**: Customer có thể hủy booking theo chính sách thời gian trước giờ chơi. Hệ thống ghi nhận refund, phí hủy và trạng thái booking để đảm bảo lịch sử giao dịch đầy đủ.

**Acceptance Scenarios**:

1. **Given** Customer hủy trước giờ chơi ít nhất 24 giờ, **When** xác nhận hủy, **Then** booking chuyển `cancelled`, hệ thống tạo refund 100% và slot được mở lại.

2. **Given** Customer hủy trong khoảng 2-24 giờ trước giờ chơi, **When** xác nhận hủy, **Then** hệ thống hoàn 50%, ghi nhận phần còn lại là phí hủy.

3. **Given** Customer hủy trong vòng 2 giờ trước giờ chơi, **When** xác nhận hủy, **Then** hệ thống không hoàn tiền hoặc yêu cầu Staff/Owner duyệt ngoại lệ.

4. **Given** Customer đã check-in, **When** yêu cầu hủy, **Then** hệ thống không cho hủy tự động và chuyển sang quy trình xử lý thủ công bởi Staff.

5. **Given** Staff đóng sân khẩn cấp vì bảo trì, **When** booking bị ảnh hưởng, **Then** hệ thống tự động đánh dấu cần hoàn 100% và ghi log lý do.

---

### US-PB-06: Staff quản lý lịch trong ngày (P1)

**Mô tả**: Staff vận hành tại sân cần xem lịch trong ngày theo chi nhánh được phân công, xác nhận khách đến, ghi nhận thanh toán và hoàn tất buổi chơi.

**Acceptance Scenarios**:

1. **Given** Staff đăng nhập, **When** mở dashboard, **Then** hệ thống chỉ hiển thị booking thuộc chi nhánh Staff được gán hoặc phạm vi quyền được cho phép.

2. **Given** Customer đến sân, **When** Staff tìm bằng mã booking và bấm check-in, **Then** booking chuyển `checked_in`, lưu thời gian thực tế và người thao tác.

3. **Given** buổi chơi kết thúc, **When** Staff bấm check-out, **Then** booking chuyển `completed`, lưu thời gian ra và có thể tính phụ thu nếu phát sinh thêm giờ ở sprint sau.

4. **Given** booking chưa thanh toán, **When** Staff ghi nhận thanh toán tại quầy, **Then** payment được lưu trước hoặc cùng lúc với xác nhận booking theo transaction.

5. **Given** Staff không thuộc chi nhánh của booking, **When** cố check-in hoặc check-out, **Then** hệ thống từ chối theo phân quyền.

---

### US-PB-07: Quản lý sân và chi nhánh (P1)

**Mô tả**: Admin/Owner quản lý danh sách chi nhánh, sân con, trạng thái sân, giá cơ bản, loại sân và thông tin vận hành như giờ mở cửa, địa chỉ, tiện ích.

**Acceptance Scenarios**:

1. **Given** Admin tạo chi nhánh mới tại Hà Nội, **When** nhập mã, tên, quận, địa chỉ, hotline và giờ mở cửa, **Then** chi nhánh được lưu ở `branches` và có thể gán sân.

2. **Given** Owner thêm sân mới vào chi nhánh, **When** nhập mã sân, loại sân, mặt sân và giá cơ bản, **Then** sân xuất hiện trong danh sách và có thể xem lịch nếu trạng thái `available`.

3. **Given** sân cần bảo trì, **When** Staff/Admin chuyển trạng thái sang `maintenance`, **Then** sân không cho đặt mới trong thời gian bảo trì.

4. **Given** một sân đã có booking trong tương lai, **When** Admin muốn xóa sân, **Then** hệ thống không xóa vật lý nếu gây mất audit trail; ưu tiên chuyển trạng thái inactive.

5. **Given** Owner xem danh sách sân, **When** lọc theo chi nhánh, **Then** chỉ hiển thị sân thuộc chi nhánh đó và số liệu đặt sân liên quan.

---

### US-PB-08: Quản lý addon (P1)

**Mô tả**: Addon là các dịch vụ hoặc sản phẩm đi kèm booking như thuê vợt, mua bóng, nước uống. Hệ thống phải kiểm soát giá, tồn kho và trạng thái addon.

**Acceptance Scenarios**:

1. **Given** Owner tạo addon "Thuê vợt tiêu chuẩn", **When** nhập giá và số lượng, **Then** addon xuất hiện cho Customer chọn khi đặt sân.

2. **Given** Customer chọn 2 vợt và 1 chai nước, **When** thanh toán, **Then** backend tính thêm addon vào tổng tiền và lưu chi tiết trong `booking_addons`.

3. **Given** addon hết hàng, **When** Customer muốn thêm vào booking mới, **Then** hệ thống từ chối và hiển thị trạng thái không khả dụng.

4. **Given** Staff cập nhật tồn kho addon sau ca làm việc, **When** lưu, **Then** số lượng mới được áp dụng cho booking sau đó và thao tác được ghi audit nếu cần.

5. **Given** Owner vô hiệu hóa addon, **When** xem booking cũ, **Then** lịch sử addon vẫn còn để đối soát doanh thu.

---

### US-PB-09: Báo cáo cơ bản (P1)

**Mô tả**: Owner/Admin cần xem nhanh doanh thu, số booking, trạng thái đặt sân và tỷ lệ lấp đầy theo ngày, theo chi nhánh hoặc toàn hệ thống tùy quyền.

**Acceptance Scenarios**:

1. **Given** Owner mở dashboard báo cáo, **When** chọn chi nhánh và ngày, **Then** hiển thị tổng booking, booking confirmed/completed/cancelled, doanh thu và tỷ lệ lấp đầy.

2. **Given** Admin chọn toàn hệ thống, **When** xem báo cáo tháng, **Then** hiển thị số liệu tổng hợp theo từng chi nhánh.

3. **Given** Owner cần đối soát cuối ngày, **When** xem payment report, **Then** hệ thống liệt kê thanh toán tiền mặt, chuyển khoản, hoàn tiền và booking liên quan.

4. **Given** dữ liệu có booking đã hủy, **When** tính doanh thu, **Then** hệ thống không tính booking chưa thanh toán hoặc đã refund toàn bộ vào doanh thu thực nhận.

---

### US-PB-10: Quản lý giá theo khung giờ (P2)

**Mô tả**: Admin/Owner cấu hình `price_rules` để tính giá linh hoạt theo toàn hệ thống, chi nhánh hoặc sân; theo ngày trong tuần, giờ thường, giờ cao điểm và cuối tuần.

**Acceptance Scenarios**:

1. **Given** Admin tạo rule giờ cao điểm 17:00-21:00 với giá 120.000đ/slot, **When** Customer đặt sân trong khung giờ này, **Then** backend tính theo giá cao điểm.

2. **Given** một chi nhánh có giá riêng, **When** Customer đặt sân tại chi nhánh đó, **Then** rule cấp chi nhánh được ưu tiên hơn rule toàn hệ thống nếu priority phù hợp.

3. **Given** một sân premium có giá riêng, **When** Customer đặt đúng sân đó, **Then** rule cấp sân được áp dụng trước rule cấp chi nhánh.

4. **Given** Admin thay đổi giá, **When** booking cũ đã confirmed, **Then** booking cũ không bị thay đổi tổng tiền.

---

### US-PB-11: Lịch sử giao dịch Customer (P2)

**Mô tả**: Customer xem lại tất cả booking của mình, bao gồm trạng thái, sân, thời gian, addon, thanh toán và hoàn tiền.

**Acceptance Scenarios**:

1. **Given** Customer đăng nhập, **When** mở lịch sử đặt sân, **Then** hệ thống hiển thị danh sách booking theo thời gian mới nhất trước.

2. **Given** Customer chọn một booking, **When** xem chi tiết, **Then** hiển thị mã booking, chi nhánh, sân, khung giờ, addon, payment và refund nếu có.

3. **Given** Customer lọc theo tháng hoặc trạng thái, **When** áp dụng bộ lọc, **Then** danh sách chỉ hiển thị booking phù hợp.

---

### US-PB-12: Thông báo email (P2)

**Mô tả**: Hệ thống gửi email cho các sự kiện quan trọng như đăng ký, OTP quên mật khẩu, xác nhận booking, nhắc lịch và xác nhận hủy.

**Acceptance Scenarios**:

1. **Given** booking chuyển `confirmed`, **When** email service được cấu hình, **Then** hệ thống gửi email xác nhận gồm mã booking, chi nhánh, sân, ngày, giờ và hướng dẫn check-in.

2. **Given** còn 2 giờ trước giờ chơi, **When** job nhắc lịch chạy, **Then** Customer nhận email nhắc lịch nếu chưa hủy.

3. **Given** gửi email thất bại, **When** service trả lỗi, **Then** hệ thống ghi `email_logs`, tăng retry count và không làm hỏng booking flow.

---

### US-PB-13: Feedback & Đánh giá (P2)

**Mô tả**: Sau khi booking hoàn thành, Customer gửi đánh giá sao và nhận xét. Owner/Staff dùng phản hồi này để cải thiện chất lượng sân và dịch vụ.

**Acceptance Scenarios**:

1. **Given** booking đã `completed`, **When** Customer gửi đánh giá 1-5 sao, **Then** hệ thống lưu vào `feedback` và gắn với đúng booking.

2. **Given** Customer gửi đánh giá thấp, **When** Owner xem danh sách feedback, **Then** feedback được ưu tiên xử lý và có trạng thái theo dõi.

3. **Given** Customer đã đánh giá một booking, **When** gửi lần nữa, **Then** hệ thống không tạo trùng nếu quy tắc mỗi booking chỉ có một feedback được áp dụng.

---

### US-PB-14: Quản lý tài khoản nội bộ (P2)

**Mô tả**: Admin/Owner có thể tạo, cập nhật, khóa hoặc mở tài khoản Staff/Customer phù hợp với phân quyền.

**Acceptance Scenarios**:

1. **Given** Admin mở trang tài khoản, **When** tạo Staff mới bằng email Gmail và gán chi nhánh, **Then** Staff có thể đăng nhập và chỉ thấy dữ liệu trong phạm vi được gán.

2. **Given** một nhân viên nghỉ việc, **When** Owner chuyển trạng thái tài khoản sang inactive, **Then** tài khoản không thể đăng nhập nhưng lịch sử thao tác vẫn được giữ.

3. **Given** Admin cập nhật thông tin Customer, **When** lưu thay đổi, **Then** hệ thống validate email, role và không trả password trong response.

---

### US-PB-15: Voucher / khuyến mãi (P2)

**Mô tả**: Hệ thống hỗ trợ mã khuyến mãi cho booking hợp lệ, kiểm soát thời gian hiệu lực, giới hạn sử dụng và giá trị giảm tối đa.

**Acceptance Scenarios**:

1. **Given** voucher `WELCOME20` còn hiệu lực, **When** Customer nhập mã trước thanh toán, **Then** backend kiểm tra điều kiện và tính discount.

2. **Given** voucher đã hết lượt dùng, **When** Customer áp mã, **Then** hệ thống từ chối và không giảm tổng tiền.

3. **Given** booking bị hủy hoàn tiền, **When** xử lý refund, **Then** hệ thống ghi nhận discount đã áp dụng để đối soát đúng số tiền thực thu.

---

### US-PB-16: Quản lý bảo trì sân (P2)

**Mô tả**: Staff/Admin đóng sân tạm thời khi cần sửa chữa, vệ sinh hoặc có sự cố. Hệ thống phải ngăn booking mới và xử lý booking đã tồn tại nếu bị ảnh hưởng.

**Acceptance Scenarios**:

1. **Given** Staff phát hiện sân hỏng, **When** chuyển trạng thái sân sang maintenance kèm lý do, **Then** sân không còn xuất hiện như slot có thể đặt.

2. **Given** sân đã có booking trong thời gian bảo trì, **When** xác nhận bảo trì, **Then** hệ thống liệt kê booking bị ảnh hưởng để Staff liên hệ khách hoặc hoàn tiền.

3. **Given** sân sửa xong, **When** Admin chuyển lại `available`, **Then** lịch đặt mới hoạt động bình thường.

---

### US-PB-17: Tái đặt nhanh (P3)

**Mô tả**: Customer có thể đặt lại sân từng chơi từ lịch sử để giảm thao tác khi thường xuyên chơi cùng giờ hoặc cùng chi nhánh.

**Acceptance Scenarios**:

1. **Given** Customer có booking đã completed, **When** chọn "Đặt lại", **Then** hệ thống mở form đặt sân với chi nhánh, sân và khung giờ được điền sẵn.

2. **Given** slot cũ không còn trống, **When** Customer đặt lại, **Then** hệ thống thông báo và gợi ý slot gần nhất.

---

### US-PB-18: Thống kê nâng cao (P3)

**Mô tả**: Owner xem biểu đồ nâng cao về doanh thu, top sân, giờ cao điểm, tỷ lệ hủy, addon bán chạy và hiệu suất chi nhánh.

**Acceptance Scenarios**:

1. **Given** Owner chọn khoảng thời gian 30 ngày, **When** mở thống kê nâng cao, **Then** hệ thống hiển thị doanh thu theo ngày và booking theo trạng thái.

2. **Given** một sân có tỷ lệ lấp đầy cao, **When** Owner xem top sân, **Then** sân đó xuất hiện trong danh sách để phục vụ quyết định giá hoặc bảo trì.

---

### US-PB-19: Gợi ý slot thay thế (P3)

**Mô tả**: Khi slot khách chọn không còn trống, hệ thống gợi ý các slot gần về thời gian, cùng chi nhánh hoặc chi nhánh khác trong Hà Nội.

**Acceptance Scenarios**:

1. **Given** slot 18:00-19:00 đã kín, **When** Customer cố đặt, **Then** hệ thống gợi ý slot 17:00-18:00 hoặc 19:00-20:00 nếu còn trống.

2. **Given** chi nhánh hiện tại kín lịch, **When** Customer muốn tìm sân, **Then** hệ thống gợi ý chi nhánh khác có sân trống trong cùng ngày.

---

### US-PB-20: Dashboard vận hành nâng cao (P3)

**Mô tả**: Owner/Admin xem hiệu suất vận hành theo chi nhánh, bao gồm doanh thu, tỷ lệ lấp đầy, booking bị hủy, feedback chưa xử lý và addon bán chạy.

**Acceptance Scenarios**:

1. **Given** Admin mở dashboard toàn hệ thống, **When** chọn tháng hiện tại, **Then** hiển thị so sánh các chi nhánh theo doanh thu và tỷ lệ lấp đầy.

2. **Given** một chi nhánh có nhiều feedback xấu, **When** Owner xem dashboard, **Then** chi nhánh đó được đánh dấu cần xử lý.

---

### Edge Cases

- **Đặt trùng lịch**: Không cho phép tạo booking hoặc hold nếu trùng với booking active hoặc hold active.
- **Đặt sân trong quá khứ**: Frontend có thể chặn sớm nhưng backend vẫn phải là lớp kiểm tra cuối cùng.
- **Hold hết hạn**: Slot hold chuyển `expired`, slot được giải phóng, Customer phải chọn lại.
- **Thanh toán chậm sau khi hold hết hạn**: Không xác nhận booking nếu hold không còn hợp lệ.
- **Frontend gửi sai tổng tiền**: Backend luôn tính lại giá, discount và addon.
- **Sân thuộc chi nhánh khác**: Booking phải lưu đúng `branch_id` của sân; không nhận branch_id do frontend tự khai báo nếu không khớp.
- **Staff truy cập sai chi nhánh**: Staff không được xem hoặc thao tác booking ngoài phạm vi được gán.
- **Sân bảo trì khi đã có booking**: Hệ thống cần liệt kê booking bị ảnh hưởng và hỗ trợ hoàn tiền/liên hệ khách.
- **Hủy sau check-in**: Không tự động hoàn tiền; cần Staff/Owner xử lý ngoại lệ.
- **Payment/refund data**: Không xóa vật lý; chỉ cập nhật trạng thái để giữ audit trail.
- **Email service lỗi**: Không làm hỏng booking chính; ghi log và retry theo cấu hình.
- **Voucher hết hạn hoặc vượt số lượt**: Không áp dụng discount và trả lý do rõ ràng.
- **Password plain text**: Là ràng buộc hiện tại của dự án, nhưng không phải khuyến nghị production.

---

## Requirements

### Nhóm A: Nghiệp vụ Cốt lõi

- **FR-A01**: CHO PHÉP Guest đăng ký tài khoản Customer bằng email có đuôi `@gmail.com`.
- **FR-A02**: CHO PHÉP Customer đăng nhập và nhận HMAC token từ backend.
- **FR-A03**: CHO PHÉP Customer xem lịch sân theo chi nhánh, ngày, sân và khung giờ.
- **FR-A04**: KHÔNG CHO PHÉP đặt sân trong quá khứ.
- **FR-A05**: KHÔNG CHO PHÉP double-booking với booking active hoặc hold active.
- **FR-A06**: CHO PHÉP giữ slot tạm thời tối đa 10 phút trong quá trình thanh toán.
- **FR-A07**: CHO PHÉP tạo booking từ slot hold hợp lệ.
- **FR-A08**: CHO PHÉP Customer hủy booking theo chính sách thời gian.
- **FR-A09**: CHO PHÉP Staff check-in/check-out và cập nhật trạng thái booking.

### Nhóm B: Thanh toán & Hoàn tiền

- **FR-B01**: BACKEND phải tự tính tổng tiền dựa trên `price_rules`, addon, voucher và chính sách hợp lệ.
- **FR-B02**: CHO PHÉP ghi nhận thanh toán tiền mặt hoặc chuyển khoản tại quầy.
- **FR-B03**: GHI NHẬN toàn bộ giao dịch vào `payment_transactions`.
- **FR-B04**: CHO PHÉP tạo refund vào `refunds` khi booking hủy đủ điều kiện.
- **FR-B05**: KHÔNG XÓA vật lý payment/refund transaction; chỉ cập nhật trạng thái.
- **FR-B06**: Payment success phải cập nhật booking và payment trong cùng một transaction nghiệp vụ.

### Nhóm C: Chi nhánh, Sân & Lịch

- **FR-C01**: CHO PHÉP Admin/Owner quản lý chi nhánh tại Hà Nội gồm mã, tên, quận, địa chỉ, hotline, email và giờ mở cửa.
- **FR-C02**: CHO PHÉP Admin/Owner quản lý sân thuộc chi nhánh gồm mã sân, loại sân, mặt sân, giá cơ bản, tiện ích và trạng thái.
- **FR-C03**: MỖI sân bắt buộc thuộc đúng một chi nhánh thông qua `courts.branch_id`.
- **FR-C04**: CHO PHÉP cấu hình giá theo toàn hệ thống, chi nhánh hoặc sân thông qua `price_rules`.
- **FR-C05**: CHO PHÉP Staff/Admin đóng sân bảo trì và ghi lý do.
- **FR-C06**: Lịch hiển thị phải phân biệt trống, đang giữ, đã đặt, đang chơi, hoàn tất, hủy và bảo trì.

### Nhóm D: Addon & Dịch vụ kèm

- **FR-D01**: CHO PHÉP Owner/Admin quản lý category addon.
- **FR-D02**: CHO PHÉP Owner/Staff/Admin quản lý addon gồm tên, mã, loại dịch vụ, đơn giá, tồn kho và trạng thái.
- **FR-D03**: CHO PHÉP Customer thêm addon vào booking trước thanh toán.
- **FR-D04**: KHÔNG CHO PHÉP chọn addon đã hết hàng hoặc inactive.
- **FR-D05**: Giá addon tại thời điểm booking phải được lưu vào `booking_addons` để giữ lịch sử đối soát.

### Nhóm E: Tương tác nội bộ & Xuất dữ liệu

- **FR-E01**: CHO PHÉP Staff xem dashboard lịch trong ngày theo chi nhánh.
- **FR-E02**: CHO PHÉP Owner/Admin xem báo cáo doanh thu, số booking và tỷ lệ lấp đầy.
- **FR-E03**: CHO PHÉP Customer xem lịch sử booking và giao dịch của chính mình.
- **FR-E04**: CHO PHÉP hệ thống gửi email xác nhận, OTP, nhắc lịch và xác nhận hủy khi cấu hình mail hợp lệ.
- **FR-E05**: CHO PHÉP xuất báo cáo Excel/PDF ở giai đoạn mở rộng nếu scope sprint cho phép.

### Nhóm F: Kiểm soát & Báo cáo

- **FR-F01**: GHI NHẬN audit log cho thao tác quản trị quan trọng.
- **FR-F02**: CHO PHÉP báo cáo theo ngày, tháng, chi nhánh, sân và trạng thái booking.
- **FR-F03**: CHO PHÉP xem feedback và đánh dấu trạng thái xử lý.
- **FR-F04**: CẢNH BÁO hoặc đánh dấu booking/payment/refund cần xử lý thủ công khi phát sinh lỗi.
- **FR-F05**: Dữ liệu báo cáo phải loại trừ booking chưa thanh toán hoặc đã hoàn tiền toàn bộ khỏi doanh thu thực nhận.

### Nhóm G: Vận hành chi nhánh & Chăm sóc khách hàng

- **FR-G01**: CHO PHÉP gán Staff/Owner vào `branch_id` để giới hạn phạm vi vận hành.
- **FR-G02**: CHO PHÉP Staff tìm booking bằng mã booking, tên khách, email hoặc ngày chơi.
- **FR-G03**: CHO PHÉP ghi nhận lý do hủy, no-show hoặc bảo trì sân.
- **FR-G04**: CHO PHÉP Customer gửi feedback sau khi booking completed.
- **FR-G05**: CHO PHÉP Owner theo dõi feedback xấu để cải thiện chất lượng dịch vụ.

### Nhóm H: Phân quyền & Bảo mật

- **FR-H01**: CHO PHÉP phân quyền theo vai trò: Admin, Owner, Staff, Customer, Guest.
- **FR-H02**: XÁC THỰC request cần bảo vệ bằng HMAC token từ backend.
- **FR-H03**: API KHÔNG ĐƯỢC trả về trường `password`.
- **FR-H04**: Email đăng ký phải có đuôi `@gmail.com`.
- **FR-H05**: KHÔNG hard-code secret, database password hoặc token secret trong source code.
- **FR-H06**: Password hiện đang lưu plain text theo yêu cầu hiện tại, nhưng phải ghi rõ đây không phải best practice production.

## Key Entities

- **Chi nhánh (`branches`)**: Mã, tên, quận, địa chỉ, hotline, email, giờ mở cửa, trạng thái. Đại diện cho từng cơ sở pickleball nhỏ trong Hà Nội.
- **Sân (`courts`)**: Sân con thuộc một chi nhánh, có loại sân, mặt sân, giá cơ bản, tiện ích và trạng thái vận hành.
- **Người dùng (`users`)**: Tài khoản Admin, Owner, Staff, Customer; Staff/Owner có thể gắn với `branch_id`.
- **Vai trò (`roles`)**: Danh sách quyền nghiệp vụ để phân biệt quản trị, vận hành và khách hàng.
- **Cấu hình (`settings`)**: Giờ mở cửa mặc định, thời lượng slot, thời gian giữ slot, timezone và currency.
- **Bảng giá (`price_rules`)**: Quy tắc tính giá theo hệ thống, chi nhánh, sân, ngày trong tuần, giờ bắt đầu/kết thúc và priority.
- **Giữ slot (`slot_holds`)**: Bản ghi giữ sân tạm thời trong 10 phút trước khi thanh toán.
- **Booking (`bookings`)**: Đơn đặt sân cấp tổng, chứa customer, staff, branch, court, trạng thái booking, trạng thái thanh toán và tổng tiền.
- **Khung giờ booking (`booking_slots`)**: Các khoảng giờ cụ thể của booking dùng để chống trùng lịch.
- **Danh mục addon (`categories`)**: Nhóm dịch vụ như thuê vợt, bóng, nước uống.
- **Dịch vụ kèm (`addon_services`)**: Addon có mã, tên, loại, đơn giá, tồn kho và trạng thái.
- **Addon trong booking (`booking_addons`)**: Addon Customer chọn tại thời điểm đặt sân.
- **Khuyến mãi (`promotions`)**: Chương trình giảm giá có thời gian hiệu lực và giới hạn sử dụng.
- **Voucher (`vouchers`)**: Mã giảm giá cụ thể thuộc promotion.
- **Thanh toán (`payment_transactions`)**: Giao dịch thanh toán, trạng thái, phương thức, số tiền, thời điểm và dữ liệu gateway nếu có.
- **Hoàn tiền (`refunds`)**: Yêu cầu/kết quả hoàn tiền, phần trăm hoàn, số tiền, lý do và người xử lý.
- **Feedback (`feedback`)**: Đánh giá của Customer sau buổi chơi.
- **Email log (`email_logs`)**: Nhật ký gửi email xác nhận, OTP, nhắc lịch và lỗi gửi mail.
- **Audit log (`audit_logs`)**: Nhật ký thao tác quản trị, dữ liệu cũ/mới, người thao tác và thời gian.

---

## Success Criteria

- **SC-001**: Customer có thể xem lịch trống và hoàn tất giữ slot trong dưới 3 phút.
- **SC-002**: Không xảy ra double-booking trong mọi tình huống đồng thời phổ biến.
- **SC-003**: 100% booking active gắn đúng `branch_id` của sân được đặt.
- **SC-004**: Booking được xác nhận chính xác sau khi payment thành công.
- **SC-005**: Slot hold hết hạn đúng sau 10 phút và không tiếp tục chặn sân.
- **SC-006**: Staff có thể check-in/check-out booking trong ngày theo chi nhánh được phân công.
- **SC-007**: Owner/Admin xem được doanh thu và số booking theo ngày/chi nhánh.
- **SC-008**: API không trả về password trong mọi response người dùng.
- **SC-009**: Backend từ chối booking trong quá khứ và booking có tổng tiền không khớp.
- **SC-010**: Dữ liệu payment/refund/audit không bị xóa vật lý trong quá trình vận hành.

---

## Assumptions

### Người dùng & Môi trường

- Customer sử dụng điện thoại hoặc máy tính có internet để xem lịch và đặt sân.
- Staff dùng máy tính hoặc tablet tại quầy để quản lý booking trong ngày.
- Owner/Admin dùng laptop hoặc desktop để cấu hình chi nhánh, sân, giá, addon và báo cáo.
- Các chi nhánh có kết nối internet đủ ổn định để Staff cập nhật trạng thái gần real-time.
- Email service có thể chưa được cấu hình ở môi trường local; khi chưa cấu hình, email log vẫn nên ghi nhận lỗi rõ ràng.

### Phạm vi

- Hệ thống chỉ phục vụ nhiều chi nhánh nhỏ trong Hà Nội ở giai đoạn hiện tại.
- Không hỗ trợ nhiều tỉnh/thành phố, franchise tenant riêng hoặc nhiều brand độc lập.
- Mỗi sân thuộc đúng một chi nhánh; booking, booking slot và slot hold phải mang đúng branch.
- Booking online cần hold slot trước khi thanh toán.
- Staff/Owner có thể bị giới hạn dữ liệu theo chi nhánh được gán.
- Các module booking/payment/refund có thể được hoàn thiện dần theo sprint, nhưng database đã có nền tảng chính.

### Dữ liệu & Tích hợp

- Database chính là MySQL 8.0 với schema `pickleball_booking_system`.
- Đồng tiền sử dụng là VND, lưu bằng số nguyên.
- Timezone mặc định là `Asia/Ho_Chi_Minh`.
- Auth sử dụng HMAC token từ backend.
- Password đang lưu plain text theo yêu cầu hiện tại; trước production cần chuyển sang hash.
- Google login và OTP email phụ thuộc biến môi trường tương ứng.
- Không lưu thông tin thẻ thanh toán; chỉ lưu trạng thái và dữ liệu giao dịch cần đối soát.

### Quy mô

- Giai đoạn đầu giả định 3 chi nhánh seed: Tây Hồ, Cầu Giấy, Hà Đông.
- Mỗi chi nhánh có nhiều sân indoor/outdoor và có thể mở rộng số sân.
- Hệ thống hướng tới hàng trăm booking mỗi ngày khi vận hành ổn định.
- Dữ liệu giao dịch, booking, refund và audit nên lưu tối thiểu 2 năm.
- Backup database nên chạy hằng ngày trong môi trường vận hành thật.

### Phân quyền theo Vai trò (Role-Based Access Control)

| Vai trò (Role) | Phạm vi & Quyền hạn trên hệ thống |
| :--- | :--- |
| **Admin** | Toàn quyền cấu hình hệ thống, quản lý tài khoản, phân quyền, xem toàn bộ chi nhánh, audit log, báo cáo và dữ liệu vận hành. |
| **Owner** | Quản lý chi nhánh/sân/bảng giá/addon, xem báo cáo, xử lý feedback, theo dõi doanh thu và quản lý Staff trong phạm vi được cấp quyền. |
| **Staff** | Xem lịch trong ngày tại chi nhánh được phân công, check-in/check-out, ghi nhận thanh toán tại quầy, cập nhật tồn addon và hỗ trợ khách hủy/đổi lịch theo chính sách. |
| **Customer** | Đăng ký, đăng nhập, xem lịch sân, giữ slot, đặt sân, thanh toán, hủy lịch, xem lịch sử, dùng voucher, chọn addon và gửi feedback. |
| **Guest** | Xem trang giới thiệu hoặc luồng bắt đầu, đăng ký tài khoản và đăng nhập; không được đặt sân khi chưa xác thực. |
