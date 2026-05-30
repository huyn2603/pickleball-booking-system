# Hệ Thống Đặt Sân Pickleball (Pickleball Court Booking System)

**Feature Branch**: `001-pickleball-court-booking-system`

**Created**: 2026-05-26

**Status**: Draft

---

## Mục Tiêu Dự Án

Xây dựng hệ thống đặt sân pickleball trực tuyến phục vụ chuỗi cơ sở thể thao với nhiều địa điểm (chi nhánh). Hệ thống cho phép khách hàng tự đặt sân – hủy sân – thanh toán online qua web/app; hỗ trợ Staff quản lý lịch sân, sản phẩm và booking; Owner theo dõi doanh thu, quản lý khuyến mãi và cấu hình sân; Admin quản trị hệ thống và phân quyền. Hệ thống tích hợp Payment Gateway để xử lý thanh toán và Mail Service để gửi thông báo xác nhận. Đặt sân được xác nhận tự động sau khi thanh toán thành công, không cần duyệt thủ công.

### Quy trình đặt sân

```
Guest đăng ký tài khoản → Customer
         ↓
Customer chọn sân & khung giờ trên web/app
         ↓
Hệ thống kiểm tra lịch trống
         ↓
Customer thanh toán qua Payment Gateway
         ↓
Hệ thống tự động xác nhận booking
         ↓
Mail Service gửi email xác nhận → Customer
         ↓
Staff theo dõi & quản lý booking
```

### Phạm vi

| Có                                          | Không                                                              |
| ------------------------------------------- | ------------------------------------------------------------------ |
| Đặt sân online (web/app) tự phục vụ         | Module Quản lý Giải đấu chuyên nghiệp                              |
| Hủy sân & hoàn tiền theo chính sách         | Module CRM chuyên sâu                                              |
| Thanh toán online qua Payment Gateway       | Tích hợp ERP                                                       |
| Quản lý gói thành viên (Membership)         | Hệ thống tính điểm ranking thi đấu chuyên nghiệp                   |
| Quản lý khuyến mãi (Owner)                  | Quản lý hợp đồng HLV chuyên sâu                                    |
| Gửi email xác nhận qua Mail Service         |                                                                    |
| Báo cáo doanh thu cho Owner                 |                                                                    |
| Phân quyền theo chi nhánh & chức danh       |                                                                    |

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

| ID       | Tên                                         | Mô tả                                                                      |
| -------- | ------------------------------------------- | -------------------------------------------------------------------------- |
| US-PB-01 | Đăng ký & Quản lý Tài khoản                 | Guest đăng ký, Customer quản lý hồ sơ cá nhân                              |
| US-PB-02 | Xem Lịch Sân & Tìm Kiếm                     | Customer xem lịch trống, lọc theo chi nhánh, loại sân, khung giờ           |
| US-PB-03 | Đặt Sân Online & Xác nhận Tự động           | Customer chọn sân, đặt, thanh toán → hệ thống xác nhận ngay               |
| US-PB-04 | Thanh Toán qua Payment Gateway              | Tích hợp cổng thanh toán, xử lý kết quả, ghi nhận giao dịch               |
| US-PB-05 | Hủy Sân & Hoàn Tiền                         | Hủy theo chính sách, tính phí hủy, hoàn tiền tự động                      |
| US-PB-06 | Thông Báo Email (Mail Service)              | Gửi email xác nhận đặt sân, hủy sân, nhắc lịch                            |
| US-PB-07 | Staff Quản lý Booking & Lịch Sân            | Staff xem danh sách booking, cập nhật trạng thái, quản lý sản phẩm        |
| US-PB-08 | Owner Xem Doanh thu & Cấu hình Sân          | Owner theo dõi revenue report, set số sân, quản lý khuyến mãi             |
| US-PB-09 | Admin Quản trị Hệ thống & Phân quyền        | Admin quản lý tài khoản, phân quyền, xem báo cáo hệ thống                 |
| US-PB-23 | Báo cáo Chi tiết Doanh thu                  | Report templates đầy đủ theo sân, khung giờ, chi nhánh                    |

### P2 - Nên có

| ID       | Tên                                   | Mô tả                                                         |
| -------- | ------------------------------------- | ------------------------------------------------------------- |
| US-PB-10 | Quản lý Gói Thành viên (Membership)   | Gói theo giờ, theo tháng, ưu đãi, gia hạn                     |
| US-PB-11 | Quản lý Khuyến mãi & Voucher          | Owner tạo mã giảm giá, khuyến mãi theo mùa, áp dụng khi đặt  |
| US-PB-12 | Điều Chuyển & Đổi Lịch Đặt Sân        | Customer tự đổi khung giờ/sân nếu còn slot trống             |
| US-PB-13 | Quản lý Sản phẩm & Dịch vụ Kèm        | Cho thuê vợt, bóng; bán đồ uống; ghi nhận vào đơn            |
| US-PB-14 | Sơ đồ Sân Trực quan                   | Hiển thị layout sân, màu sắc trạng thái real-time            |
| US-PB-15 | Feedback & Đánh giá                   | Customer gửi feedback sau buổi chơi, Owner/Staff xem          |
| US-PB-22 | Phân quyền theo Chi nhánh & Chức danh | Role-based access control                                     |

### P3 - Nếu có

| ID       | Tên                                   | Mô tả                                                         |
| -------- | ------------------------------------- | ------------------------------------------------------------- |
| US-PB-16 | Quản lý Huấn luyện viên               | Đặt sân kèm HLV, quản lý lịch HLV                            |
| US-PB-17 | Kiểm soát Bảo trì Sân                 | Ghi nhận hư hỏng, lịch bảo trì, đóng sân tạm thời            |
| US-PB-18 | Thông báo Push (In-app/Zalo)          | Nhắc lịch, cảnh báo hủy, thông báo khuyến mãi                |
| US-PB-19 | Lịch sử Giao dịch & Tái đặt nhanh    | Customer xem lịch sử, tái đặt sân yêu thích chỉ 1 click      |

---

## User Stories Chi tiết

### US-PB-01: Đăng ký & Quản lý Tài khoản (P1)

**Mô tả**: Guest đăng ký tài khoản để trở thành Customer, quản lý hồ sơ cá nhân và xem lịch sử đặt sân.

**Acceptance Scenarios**:

1. **Given** truy cập trang đăng ký, **When** Guest nhập tên, SĐT, email, mật khẩu và xác nhận, **Then** hệ thống tạo tài khoản Customer, gửi email xác nhận đăng ký, chuyển hướng đến trang chủ.

2. **Given** email đã tồn tại trong hệ thống, **When** Guest đăng ký lại, **Then** hệ thống báo lỗi "Email đã được sử dụng", đề nghị đăng nhập hoặc khôi phục mật khẩu.

3. **Given** đăng nhập thành công, **When** Customer vào trang hồ sơ, **Then** hiển thị thông tin cá nhân, lịch sử đặt sân, gói thành viên đang dùng (nếu có).

4. **Given** Customer quên mật khẩu, **When** nhập email, **Then** Mail Service gửi link đặt lại mật khẩu trong vòng 5 phút.

---

### US-PB-02: Xem Lịch Sân & Tìm Kiếm (P1)

**Mô tả**: Customer xem lịch sân trống theo chi nhánh, ngày, loại sân để chọn khung giờ phù hợp.

**Acceptance Scenarios**:

1. **Given** truy cập trang đặt sân, **When** Customer chọn chi nhánh Cầu Giấy và ngày 28/5, **Then** hiển thị toàn bộ sân và trạng thái từng khung giờ trong ngày (Trống/Đã đặt/Bảo trì).

2. **Given** xem lịch sân, **When** lọc theo "Sân trong nhà" và khung "18h–20h", **Then** chỉ hiển thị các sân trong nhà còn trống khung giờ đó.

3. **Given** tất cả sân đã kín lịch ngày đã chọn, **When** Customer xem, **Then** hệ thống thông báo "Hết sân ngày này" và gợi ý ngày gần nhất còn slot trống.

---

### US-PB-03: Đặt Sân Online & Xác nhận Tự động (P1)

**Mô tả**: Customer chọn sân, khung giờ và hoàn tất thanh toán – hệ thống tự động xác nhận booking, không cần Staff duyệt.

**Quy trình**:

1. Customer chọn chi nhánh, sân, ngày, khung giờ
2. Hệ thống kiểm tra và tạm giữ slot (hold 10 phút)
3. Customer xác nhận thông tin và chọn hình thức thanh toán
4. Customer thanh toán qua Payment Gateway
5. Payment Gateway trả kết quả về hệ thống
   - Thành công → **DA_XAC_NHAN**, Mail Service gửi email xác nhận
   - Thất bại → **DA_HUY**, slot được giải phóng, thông báo lỗi cho Customer
6. Staff theo dõi booking mới trên dashboard

**Trạng thái booking**:
`CHO_THANH_TOAN` → `DA_XAC_NHAN` → `DANG_SU_DUNG` → `HOAN_THANH` / `DA_HUY`

**Acceptance Scenarios**:

1. **Given** Customer chọn Sân A1 khung 9h–11h ngày mai, **When** thanh toán thành công, **Then** hệ thống xác nhận ngay, khung giờ bị khóa, email xác nhận gửi đến Customer trong vòng 1 phút.

2. **Given** Customer đang trong bước thanh toán, **When** hold 10 phút hết hạn mà chưa thanh toán, **Then** hệ thống tự động giải phóng slot, thông báo "Phiên đặt sân đã hết hạn".

3. **Given** hai Customer cùng chọn một sân cùng khung giờ, **When** cùng lúc, **Then** chỉ một người được hold slot, người còn lại thấy thông báo "Sân vừa được đặt, vui lòng chọn sân khác".

4. **Given** Customer có gói thành viên còn giờ, **When** đặt sân, **Then** hệ thống tự động áp giá ưu đãi gói, trừ số giờ từ gói thay vì thanh toán tiền mặt.

---

### US-PB-04: Thanh Toán qua Payment Gateway (P1)

**Mô tả**: Tích hợp cổng thanh toán để xử lý giao dịch online (thẻ ngân hàng, ví điện tử), ghi nhận kết quả và đồng bộ trạng thái booking.

**Acceptance Scenarios**:

1. **Given** Customer xác nhận đặt sân, **When** chọn thanh toán qua VNPay, **Then** hệ thống chuyển hướng đến Payment Gateway với thông tin đơn hàng chính xác.

2. **Given** thanh toán thành công, **When** Payment Gateway callback về hệ thống, **Then** ghi nhận giao dịch, cập nhật trạng thái booking thành `DA_XAC_NHAN`, kích hoạt gửi email xác nhận.

3. **Given** thanh toán thất bại (hết tiền/hủy giao dịch), **When** Payment Gateway trả kết quả thất bại, **Then** booking chuyển `DA_HUY`, slot được giải phóng, thông báo lỗi rõ ràng cho Customer.

4. **Given** callback từ Payment Gateway bị mất kết nối, **When** hệ thống không nhận được kết quả, **Then** tự động query lại trạng thái giao dịch sau 30 giây, tối đa 3 lần trước khi hủy booking.

---

### US-PB-05: Hủy Sân & Hoàn Tiền (P1)

**Mô tả**: Customer hủy lịch đặt sân, hệ thống áp dụng chính sách phí hủy theo thời gian và xử lý hoàn tiền tự động qua Payment Gateway.

**Acceptance Scenarios**:

1. **Given** Customer hủy trước 24h so với giờ chơi, **When** xác nhận hủy, **Then** hoàn 100% tiền, tạo giao dịch hoàn tiền qua Payment Gateway, slot trả về "Trống", email xác nhận hủy gửi đến Customer.

2. **Given** Customer hủy trong vòng 2–24h trước giờ chơi, **When** xác nhận hủy, **Then** hoàn 50% tiền, phí hủy 50% ghi nhận vào doanh thu.

3. **Given** Customer hủy trong vòng 2h hoặc không đến (no-show), **When** hủy hoặc hệ thống phát hiện no-show, **Then** không hoàn tiền, email thông báo gửi cho Customer.

4. **Given** Staff phát hiện sân hỏng bất ngờ khi đã có booking, **When** đóng sân khẩn cấp, **Then** hệ thống tự động hủy toàn bộ booking bị ảnh hưởng, hoàn 100% tiền và gửi email xin lỗi đến từng Customer.

---

### US-PB-06: Thông Báo Email qua Mail Service (P1)

**Mô tả**: Tích hợp Mail Service để gửi các email thông báo tự động theo từng sự kiện trong vòng đời booking.

**Acceptance Scenarios**:

1. **Given** booking được xác nhận, **When** hệ thống kích hoạt, **Then** Mail Service gửi email xác nhận đến Customer trong vòng 1 phút, bao gồm: sân, chi nhánh, ngày giờ, mã booking, hướng dẫn check-in.

2. **Given** còn 2 giờ trước giờ chơi, **When** hệ thống chạy job nhắc lịch, **Then** Mail Service gửi email nhắc lịch đến Customer.

3. **Given** booking bị hủy (bởi Customer hoặc hệ thống), **When** hủy thành công, **Then** Mail Service gửi email xác nhận hủy kèm thông tin hoàn tiền (nếu có).

4. **Given** email gửi thất bại lần đầu, **When** Mail Service báo lỗi, **Then** hệ thống tự động retry tối đa 3 lần với khoảng cách 5 phút, ghi log kết quả.

---

### US-PB-07: Staff Quản lý Booking & Lịch Sân (P1)

**Mô tả**: Staff theo dõi danh sách booking, cập nhật trạng thái sử dụng sân (check-in/check-out), quản lý sản phẩm và hỗ trợ Customer khi cần.

**Acceptance Scenarios**:

1. **Given** đăng nhập là Staff, **When** mở dashboard, **Then** hiển thị danh sách booking hôm nay theo từng sân, trạng thái từng slot, booking sắp tới.

2. **Given** Customer đến sân, **When** Staff check-in bằng mã booking, **Then** trạng thái chuyển `DANG_SU_DUNG`, ghi nhận giờ vào thực tế.

3. **Given** kết thúc buổi chơi, **When** Staff check-out, **Then** trạng thái chuyển `HOAN_THANH`, ghi nhận giờ ra, tính thêm giờ phát sinh nếu có.

4. **Given** Staff cập nhật trạng thái booking, **When** lưu thay đổi, **Then** lịch sân real-time được cập nhật ngay, phản ánh cho tất cả người dùng đang xem.

---

### US-PB-08: Owner Xem Doanh thu & Cấu hình Sân (P1)

**Mô tả**: Owner theo dõi báo cáo doanh thu, cấu hình số lượng và thông tin sân, quản lý chương trình khuyến mãi.

**Acceptance Scenarios**:

1. **Given** đăng nhập là Owner, **When** xem revenue report, **Then** hiển thị: tổng doanh thu hôm nay/tuần/tháng, doanh thu theo từng sân, tỷ lệ lấp đầy, so sánh kỳ trước.

2. **Given** Owner muốn thêm sân mới, **When** cấu hình sân (mã, tên, loại, giá giờ), **Then** sân xuất hiện trên lịch đặt và sẵn sàng nhận booking.

3. **Given** Owner tạo chương trình khuyến mãi "Giảm 20% cuối tuần", **When** áp dụng, **Then** giá đặt sân cuối tuần tự động hiển thị giá sau giảm, mã khuyến mãi được áp dụng khi Customer thanh toán.

4. **Given** Owner xem feedback từ Customer, **When** lọc theo chi nhánh và tháng, **Then** hiển thị danh sách đánh giá, điểm trung bình, các vấn đề nổi bật.

---

### US-PB-09: Admin Quản trị Hệ thống & Phân quyền (P1)

**Mô tả**: Admin quản lý toàn bộ tài khoản người dùng, phân quyền theo vai trò, xử lý yêu cầu cập nhật từ Customer và xem báo cáo hệ thống.

**Acceptance Scenarios**:

1. **Given** đăng nhập là Admin, **When** nhận yêu cầu cập nhật thông tin từ Customer, **Then** có thể chỉnh sửa hồ sơ Customer (tên, SĐT, email) và lưu thay đổi.

2. **Given** Admin nhận yêu cầu cấp quyền Staff mới, **When** tạo tài khoản và gán vai trò Staff kèm chi nhánh, **Then** tài khoản mới đăng nhập được và chỉ thao tác chi nhánh được gán.

3. **Given** Admin xem system report, **When** chọn khoảng thời gian, **Then** hiển thị: tổng user đăng ký, tổng booking, tỷ lệ hủy, tỷ lệ thanh toán thành công/thất bại, log lỗi hệ thống.

4. **Given** phát hiện tài khoản vi phạm, **When** Admin khóa tài khoản, **Then** Customer đó không thể đăng nhập, các booking đang chờ bị hủy tự động với hoàn tiền đầy đủ.

---

### US-PB-10: Quản lý Gói Thành viên (P2)

**Mô tả**: Owner/Admin cấu hình các gói thành viên; Customer mua gói để hưởng giá ưu đãi và đặt sân bằng giờ trong gói.

**Acceptance Scenarios**:

1. **Given** Owner tạo gói "20 giờ/tháng – 1.800.000đ", **When** lưu, **Then** gói xuất hiện trên trang mua thành viên dành cho Customer.

2. **Given** Customer mua gói thành viên và thanh toán thành công, **When** hoàn tất, **Then** tài khoản được gắn gói: 20 giờ còn lại, ngày hết hạn, chi nhánh áp dụng.

3. **Given** Customer đặt sân bằng gói, **When** thanh toán, **Then** hệ thống trừ giờ từ gói thay vì tính tiền, hiển thị số giờ còn lại sau khi đặt.

4. **Given** gói thành viên còn dưới 3 giờ, **When** Customer đặt sân, **Then** hệ thống cảnh báo "Gói sắp hết" và đề xuất gia hạn.

---

### US-PB-11: Quản lý Khuyến mãi & Voucher (P2)

**Mô tả**: Owner tạo và quản lý các chương trình khuyến mãi, mã voucher; Customer áp dụng khi đặt sân.

**Acceptance Scenarios**:

1. **Given** Owner tạo voucher "PICKLEBALL20" giảm 20% tối đa 100.000đ, hạn dùng đến 30/6, **When** lưu, **Then** mã được kích hoạt và sẵn sàng để Customer nhập khi thanh toán.

2. **Given** Customer nhập mã "PICKLEBALL20" ở bước thanh toán, **When** áp dụng, **Then** hệ thống xác minh mã hợp lệ, hiển thị số tiền giảm, cập nhật tổng thanh toán.

3. **Given** mã voucher đã dùng hết lượt hoặc hết hạn, **When** Customer nhập, **Then** hệ thống báo lỗi rõ lý do: "Mã đã hết lượt sử dụng" hoặc "Mã đã hết hạn".

---

### US-PB-12: Điều Chuyển & Đổi Lịch Đặt Sân (P2)

**Mô tả**: Customer tự đổi khung giờ hoặc sân cho booking đã xác nhận, trong phạm vi chính sách cho phép.

**Acceptance Scenarios**:

1. **Given** Customer có booking Sân A1 lúc 9h–11h, **When** đổi sang khung 14h–16h cùng sân (còn trống), **Then** lịch cũ được giải phóng, lịch mới được xác nhận, email thông báo thay đổi gửi đến Customer.

2. **Given** Customer muốn đổi sang khung giờ đã bị đặt, **When** thực hiện, **Then** hệ thống từ chối và gợi ý các khung giờ trống gần nhất.

3. **Given** Customer đổi lịch trong vòng 2h trước giờ chơi, **When** thực hiện, **Then** hệ thống từ chối theo chính sách: "Không thể đổi lịch trong vòng 2 giờ trước giờ chơi".

---

### US-PB-13: Quản lý Sản phẩm & Dịch vụ Kèm (P2)

**Mô tả**: Staff quản lý danh mục sản phẩm cho thuê/bán tại chi nhánh; Customer thêm dịch vụ kèm khi đặt sân.

**Acceptance Scenarios**:

1. **Given** Owner thêm sản phẩm "Vợt Yonex – thuê 50.000đ/buổi", **When** lưu, **Then** sản phẩm hiển thị trong danh sách dịch vụ kèm khi Customer đặt sân tại chi nhánh đó.

2. **Given** Customer thêm 2 vợt thuê vào đơn đặt sân, **When** thanh toán, **Then** tổng tiền bao gồm tiền sân + tiền thuê vợt, ghi nhận dịch vụ kèm trong booking.

3. **Given** số lượng vợt cho thuê còn 1 cái, **When** Customer muốn thuê 2, **Then** hệ thống báo "Chỉ còn 1 vợt available", Customer chọn số lượng phù hợp hoặc bỏ qua.

---

### US-PB-14: Sơ đồ Sân Trực quan (P2)

**Mô tả**: Hiển thị sơ đồ layout sân theo chi nhánh với màu sắc trạng thái real-time, giúp Customer và Staff dễ chọn sân.

**Acceptance Scenarios**:

1. **Given** Customer vào trang đặt sân, **When** chọn chế độ "Xem sơ đồ", **Then** hiển thị layout chi nhánh với tên từng sân, màu xanh = Trống, đỏ = Đã đặt, xám = Bảo trì.

2. **Given** Customer click vào sân đang trống trên sơ đồ, **When** click, **Then** hiển thị popup thông tin sân (loại, giá, khung giờ trống) và nút "Đặt ngay".

3. **Given** có booking mới được xác nhận, **When** sơ đồ đang được xem, **Then** màu sân cập nhật real-time mà không cần tải lại trang.

---

### US-PB-15: Feedback & Đánh giá (P2)

**Mô tả**: Customer gửi feedback sau buổi chơi; Owner và Staff xem và phản hồi để cải thiện dịch vụ.

**Acceptance Scenarios**:

1. **Given** booking chuyển trạng thái `HOAN_THANH`, **When** hệ thống gửi email nhắc feedback sau 1 giờ, **Then** Customer vào link đánh giá: chọn số sao (1–5), nhập nhận xét, gửi.

2. **Given** Customer gửi feedback 2 sao kèm nội dung khiếu nại, **When** lưu, **Then** hệ thống gắn cờ "Cần xử lý", thông báo Owner và Staff phụ trách chi nhánh.

3. **Given** Owner xem tổng hợp feedback tháng, **When** lọc theo chi nhánh, **Then** hiển thị: điểm trung bình, phân bổ số sao, top vấn đề nổi bật, feedback chưa xử lý.

---

### US-PB-22: Phân quyền theo Chi nhánh & Chức danh (P2)

**Mô tả**: Kiểm soát truy cập dựa trên vai trò (Role-Based Access Control) phân chia rõ ràng nhiệm vụ của từng đối tượng trong hệ thống:

- **Admin**: Quản trị hệ thống, quản lý tài khoản, phân quyền, xem system report.
- **Owner**: Xem doanh thu, cấu hình sân, quản lý khuyến mãi, xem feedback.
- **Staff**: Quản lý booking, check-in/check-out, quản lý sản phẩm tại chi nhánh được gán.
- **Customer**: Tự đặt sân, hủy, đổi lịch, mua gói thành viên, gửi feedback.
- **Guest**: Xem thông tin chi nhánh/sân, đăng ký tài khoản (chưa đặt được sân).
- **Report Viewer**: Chỉ đọc dữ liệu và xuất báo cáo, không thực hiện giao dịch.

**Acceptance Scenarios**:

1. **Given** đăng nhập là Admin, **When** vào trang quản lý người dùng, **Then** có thể tạo tài khoản, gán vai trò và chi nhánh tương ứng cho từng nhân viên.

2. **Given** đăng nhập là Staff chi nhánh Cầu Giấy, **When** cố truy cập dữ liệu chi nhánh Hoàng Mai, **Then** hệ thống từ chối: "Bạn không có quyền truy cập chi nhánh này".

3. **Given** đăng nhập là Owner, **When** xem revenue report, **Then** thấy dữ liệu tất cả chi nhánh mình quản lý nhưng không thể thay đổi booking hay tài khoản người dùng.

4. **Given** Guest chưa đăng nhập, **When** cố truy cập trang đặt sân, **Then** hệ thống chuyển hướng đến trang đăng nhập kèm thông báo "Vui lòng đăng nhập để đặt sân".

5. **Given** đăng nhập là Customer, **When** truy cập trang quản trị, **Then** hệ thống từ chối và chuyển về trang chủ Customer.

---

### US-PB-23: Báo cáo Chi tiết Doanh thu (P1)

**Mô tả**: Báo cáo đầy đủ booking, doanh thu, tỷ lệ lấp đầy, dịch vụ kèm và hiệu suất sân theo nhiều chiều.

**Acceptance Scenarios**:

1. **Given** Owner xem báo cáo booking tháng 5, **When** chọn loại và khoảng thời gian, **Then** hiển thị: tổng booking, tổng giờ sân, tổng doanh thu, tỷ lệ hủy, chi tiết từng đơn.

2. **Given** cần báo cáo tỷ lệ lấp đầy theo sân, **When** chạy báo cáo, **Then** hiển thị: mã sân, tên sân, tổng giờ đặt, tổng giờ trống, tỷ lệ lấp đầy (%), so sánh tháng trước.

3. **Given** cần báo cáo doanh thu theo hình thức thanh toán, **When** chạy, **Then** phân loại: VNPay, MoMo, ZaloPay, gói thành viên, kèm số lượng giao dịch và tổng tiền mỗi loại.

4. **Given** Owner xuất báo cáo tháng, **When** chọn xuất Excel/PDF, **Then** file tải về có đầy đủ dữ liệu: doanh thu theo sân, theo ngày, theo hình thức thanh toán, top khách hàng.

---

### Edge Cases

- **Đặt trùng lịch**: Không cho phép; slot bị hold ngay khi Customer bắt đầu thanh toán, tối đa 10 phút.
- **Thanh toán đồng thời**: Chỉ một giao dịch thành công cho một slot; người còn lại nhận thông báo và được gợi ý slot khác.
- **Payment Gateway timeout**: Tự động query lại tối đa 3 lần; nếu không xác nhận được thì hủy booking và hoàn tiền.
- **Mail Service lỗi**: Retry tối đa 3 lần; ghi log để Admin kiểm tra, không ảnh hưởng đến trạng thái booking.
- **Hủy sau khi check-in**: Staff xác nhận thủ công; áp dụng chính sách no-show, không hoàn tiền.
- **Sân hỏng đột xuất khi có booking**: Hệ thống tự động hủy booking bị ảnh hưởng, hoàn 100% tiền, gửi email thông báo đến Customer.
- **Voucher hết lượt đồng thời**: Kiểm tra và trừ lượt theo cơ chế atomic để tránh oversell voucher.
- **Gói thành viên hết giờ giữa chừng**: Hệ thống thông báo và tính phần vượt giờ theo giá thường.
- **Customer đăng ký email đã tồn tại**: Báo lỗi rõ ràng, đề nghị đăng nhập hoặc đặt lại mật khẩu.

---

## Requirements

### Nhóm A: Nghiệp vụ Cốt lõi

- **FR-A01**: CHO PHÉP Guest đăng ký tài khoản Customer qua web/app.
- **FR-A02**: CHO PHÉP Customer xem lịch sân real-time theo chi nhánh, ngày, loại sân.
- **FR-A03**: KHÔNG CHO PHÉP đặt sân trùng khung giờ đã hold hoặc đã xác nhận.
- **FR-A04**: CHO PHÉP Customer tự đặt sân, chọn dịch vụ kèm và thanh toán online.
- **FR-A05**: TỰ ĐỘNG xác nhận booking sau khi Payment Gateway trả kết quả thanh toán thành công.
- **FR-A06**: CHO PHÉP Customer hủy sân; tự động áp chính sách phí hủy và hoàn tiền qua Payment Gateway.
- **FR-A07**: CHO PHÉP Staff check-in/check-out và cập nhật trạng thái sân: `CHO_THANH_TOAN` → `DA_XAC_NHAN` → `DANG_SU_DUNG` → `HOAN_THANH` / `DA_HUY`.

### Nhóm B: Tích hợp Bên ngoài

- **FR-B01**: TÍCH HỢP Payment Gateway để xử lý thanh toán online (thẻ ngân hàng, ví điện tử).
- **FR-B02**: XỬ LÝ callback từ Payment Gateway để cập nhật trạng thái booking tự động.
- **FR-B03**: TỰ ĐỘNG retry query trạng thái giao dịch khi callback bị mất, tối đa 3 lần.
- **FR-B04**: TÍCH HỢP Mail Service để gửi email xác nhận đặt sân, hủy sân, nhắc lịch.
- **FR-B05**: TỰ ĐỘNG retry gửi email khi Mail Service lỗi, tối đa 3 lần, ghi log kết quả.

### Nhóm C: Quản lý Sân & Chi nhánh

- **FR-C01**: CHO PHÉP Owner/Admin cấu hình chi nhánh và sân: mã, tên, loại, giá, trạng thái.
- **FR-C02**: CHO PHÉP hiển thị sơ đồ sân trực quan với màu trạng thái real-time.
- **FR-C03**: TỰ ĐỘNG hủy booking và hoàn tiền khi sân bị đóng khẩn cấp.

### Nhóm D: Quản lý Giá & Khuyến mãi

- **FR-D01**: CHO PHÉP cấu hình giá theo giờ thường, giờ cao điểm, cuối tuần, ngày lễ.
- **FR-D02**: CHO PHÉP Owner tạo và quản lý chương trình khuyến mãi, mã voucher.
- **FR-D03**: TỰ ĐỘNG áp giá ưu đãi khi Customer dùng gói thành viên hoặc nhập voucher hợp lệ.
- **FR-D04**: KHÔNG CHO PHÉP Staff tự ý thay đổi giá niêm yết; chỉ Owner/Admin được cập nhật bảng giá.

### Nhóm E: Gói Thành viên & Dịch vụ

- **FR-E01**: CHO PHÉP Owner cấu hình gói thành viên (số giờ, giá, thời hạn, chi nhánh áp dụng).
- **FR-E02**: CHO PHÉP Customer mua gói và sử dụng giờ trong gói khi đặt sân.
- **FR-E03**: CHO PHÉP Customer thêm dịch vụ kèm (thuê vợt, bóng, mua đồ uống) vào đơn đặt sân.
- **FR-E04**: CHO PHÉP Customer đổi lịch đặt sân theo chính sách (không trong vòng 2h trước giờ chơi).

### Nhóm F: Kiểm soát & Báo cáo

- **FR-F01**: CHO PHÉP Owner xem revenue report theo ngày/tuần/tháng, theo sân và chi nhánh.
- **FR-F02**: CHO PHÉP Admin xem system report: user, giao dịch, tỷ lệ lỗi, log hệ thống.
- **FR-F03**: CHO PHÉP xuất báo cáo Excel/PDF.
- **FR-F04**: GỬI CẢNH BÁO khi tỷ lệ lấp đầy sân dưới ngưỡng cấu hình.
- **FR-F05**: CHO PHÉP Customer gửi feedback sau buổi chơi; Owner/Staff xem và xử lý.

### Nhóm G: Phân quyền & Bảo mật

- **FR-G01**: CHO PHÉP phân quyền theo chi nhánh: Staff chỉ thao tác chi nhánh được gán.
- **FR-G02**: CHO PHÉP phân quyền theo vai trò RBAC: Admin, Owner, Staff, Customer, Guest, Report Viewer.
- **FR-G03**: GHI NHẬN audit log: ai, khi nào, làm gì, dữ liệu cũ/mới. Admin xem toàn bộ log; Owner xem log chi nhánh mình quản lý.
- **FR-G04**: BẢO MẬT thông tin thanh toán: không lưu số thẻ, tuân thủ PCI-DSS khi tích hợp Payment Gateway.

---

## Key Entities

- **Chi nhánh (Branch)**: Mã, tên, địa chỉ, SĐT, người quản lý, danh sách sân.
- **Sân (Court)**: Mã, tên, loại (trong nhà/ngoài trời), chi nhánh, giá giờ thường, giá giờ cao điểm, trạng thái (Trống/Đang dùng/Bảo trì).
- **Người dùng (User)**: Mã, tên, email, SĐT, vai trò (Admin/Owner/Staff/Customer/Guest), chi nhánh được gán (với Staff).
- **Booking**: Số đơn, Customer, sân, ngày chơi, khung giờ, dịch vụ kèm, tổng tiền, trạng thái (`CHO_THANH_TOAN` → `DA_XAC_NHAN` → `DANG_SU_DUNG` → `HOAN_THANH`/`DA_HUY`), thời gian tạo.
- **Slot Hold**: Booking tạm, sân, khung giờ, Customer, thời gian hold, thời gian hết hạn (10 phút).
- **Giao dịch Thanh toán (PaymentTransaction)**: Mã giao dịch, booking, số tiền, hình thức (VNPay/MoMo/ZaloPay/Gói), trạng thái (pending/success/failed), thời gian, mã tham chiếu Payment Gateway.
- **Hoàn tiền (Refund)**: Mã, booking, số tiền hoàn, lý do, trạng thái, thời gian xử lý.
- **Gói Thành viên (MembershipPlan)**: Mã gói, tên, số giờ, giá, thời hạn hiệu lực (ngày), chi nhánh áp dụng.
- **Thẻ Thành viên (MembershipCard)**: Mã thẻ, Customer, gói, số giờ còn lại, ngày hết hạn, trạng thái.
- **Khuyến mãi (Promotion)**: Mã, tên, loại (% hoặc tiền cố định), giá trị, điều kiện, hạn sử dụng, số lượt còn lại.
- **Voucher**: Mã code, khuyến mãi, lượt sử dụng tối đa, lượt đã dùng, trạng thái.
- **Dịch vụ Kèm (AddonService)**: Mã, tên, loại (cho thuê/bán), đơn giá, số lượng tồn tại chi nhánh.
- **Chi tiết Booking Dịch vụ (BookingAddon)**: Booking, dịch vụ, số lượng, đơn giá tại thời điểm đặt.
- **Lịch sử Đổi lịch (BookingChangeLog)**: Mã, booking, sân cũ, sân mới, giờ cũ, giờ mới, người thực hiện, thời gian, lý do.
- **Phiếu Bảo trì (MaintenanceTicket)**: Mã, sân, ngày, mô tả, trạng thái, ngày hoàn thành, hình ảnh.
- **Feedback**: Mã, booking, Customer, số sao (1–5), nội dung, thời gian, trạng thái xử lý.
- **Email Log**: Mã, loại email, người nhận, thời gian gửi, trạng thái (sent/failed), số lần retry.
- **Audit Log**: ID, người dùng, hành động, bảng ảnh hưởng, dữ liệu cũ, dữ liệu mới, thời gian.

---

## Success Criteria

- **SC-001**: Customer hoàn thành đặt sân (chọn sân đến thanh toán xong) trong 3 phút.
- **SC-002**: Xử lý 200 người dùng đồng thời, response time < 3s.
- **SC-003**: Lịch sân chính xác 100%, không xảy ra đặt trùng slot.
- **SC-004**: Booking được xác nhận tự động trong vòng 30 giây sau khi Payment Gateway callback thành công.
- **SC-005**: Email xác nhận gửi đến Customer trong vòng 1 phút sau khi booking xác nhận.
- **SC-006**: Phân quyền chính xác 100%, không rò rỉ dữ liệu giữa chi nhánh.
- **SC-007**: Tỷ lệ giao dịch thanh toán thành công ≥ 95%.
- **SC-008**: Tỷ lệ lấp đầy sân tăng 20% sau 3 tháng nhờ hệ thống đặt online và nhắc lịch.
- **SC-009**: Tỷ lệ no-show giảm 40% sau 6 tháng nhờ email nhắc lịch tự động.
- **SC-010**: Uptime hệ thống ≥ 99.5%/tháng.

---

## Assumptions

### Người dùng & Môi trường

- Customer có smartphone hoặc máy tính kết nối internet để đặt sân online.
- Chi nhánh có internet ổn định để Staff cập nhật trạng thái sân real-time.
- Staff sử dụng máy tính/tablet tại quầy để quản lý booking và check-in/out.
- Owner và Admin sử dụng máy tính để xem báo cáo và cấu hình hệ thống.
- Mỗi chi nhánh có ít nhất 1 Staff trực ca.

### Phạm vi

- Hệ thống hoạt động độc lập, không tích hợp ERP. Các nghiệp vụ quản lý booking, thanh toán và báo cáo được xử lý hoàn toàn trong hệ thống.
- Tích hợp Payment Gateway (VNPay, MoMo, ZaloPay) và Mail Service là tích hợp bên ngoài duy nhất.
- Hệ thống phục vụ đặt sân pickleball tiêu chuẩn; không bao gồm quản lý giải đấu chuyên nghiệp hay hệ thống ranking.
- Booking được xác nhận tự động sau thanh toán; không có bước duyệt thủ công bởi Staff.

### Dữ liệu & Tích hợp

- Dữ liệu sân, bảng giá khởi tạo import từ Excel.
- Đồng tiền: VND.
- Payment Gateway cung cấp API callback và query trạng thái giao dịch.

### Quy mô

- Tối đa 10 chi nhánh, 5–20 sân/chi nhánh, 2.000+ Customer, 5.000+ booking/tháng.
- Lưu trữ tối thiểu 5 năm, backup hàng ngày.

### Phân quyền theo Vai trò (Role-Based Access Control)

| Vai trò (Role)              | Phạm vi & Quyền hạn trên hệ thống                                                                                                                                      |
| :-------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Admin**                   | Toàn quyền cấu hình hệ thống, quản lý tài khoản người dùng (bao gồm xử lý yêu cầu cập nhật từ Customer), phân quyền, xem system report, sao lưu và khôi phục dữ liệu. |
| **Owner**                   | Xem revenue report toàn bộ chi nhánh mình quản lý, cấu hình sân và bảng giá, tạo và quản lý khuyến mãi/voucher, xem và xử lý feedback từ Customer.                    |
| **Staff**                   | Quản lý booking tại chi nhánh được gán, check-in/check-out Customer, quản lý sản phẩm và dịch vụ kèm, xem lịch sân, hỗ trợ Customer khi có vấn đề tại chỗ.            |
| **Customer**                | Tự đặt sân online, hủy sân, đổi lịch, mua gói thành viên, nhập voucher, thêm dịch vụ kèm, gửi feedback, xem lịch sử đặt sân của bản thân.                             |
| **Guest**                   | Xem thông tin chi nhánh, sân và lịch trống; đăng ký tài khoản. Chưa thực hiện được giao dịch đặt sân.                                                                  |
| **Report Viewer**           | Chỉ đọc dữ liệu và xuất báo cáo thống kê (doanh thu, tỷ lệ lấp đầy, hiệu suất), không thực hiện giao dịch hay cấu hình hệ thống.                                      |
| **Tác nhân ngoài (External)** | **Payment Gateway**: nhận yêu cầu thanh toán, trả kết quả qua callback. **Mail Service**: nhận yêu cầu gửi email, trả trạng thái gửi.                                 |
