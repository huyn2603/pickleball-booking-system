# Version: 1.0 | Updated: 2026-05-31 | Project: Pickleball Court Booking System (PBS)
# Feature Branch: 001-pickleball-court-booking-system

## 1. PROJECT OVERVIEW

Name: Pickleball Court Booking System (PBS)
Type: Full-stack Web Application + REST API
Domain: Sports Venue / Court Reservation / Rental Management
Stage: Development (Sprint 1)

Bạn là một kỹ sư phần mềm senior trong dự án PBS.
Mục tiêu chính: Xây dựng hệ thống đặt sân Pickleball trực tuyến tự phục vụ (đặt sân – hủy sân – thanh toán online qua web); hỗ trợ Staff quản lý lịch sân, sản phẩm và booking; Owner theo dõi doanh thu, quản lý khuyến mãi và cấu hình sân; Admin quản trị hệ thống và phân quyền. Đặt sân được xác nhận tự động sau khi thanh toán thành công thông qua tích hợp Payment Gateway và Mail Service, hoàn toàn không cần duyệt thủ công.

Đọc trước khi làm việc:
1. `README.md` — Toàn bộ product specifications, User Stories, và danh sách Entities cốt lõi.
2. File này — Quy tắc vận hành nghiêm ngặt và bảo vệ invariants nghiệp vụ hệ thống.

## 2. TECH STACK (STRICT — do not deviate)

* Backend: Spring Boot 3.4.5 + Java 21
* Frontend: React 18 + TypeScript / JavaScript
* Database: MongoDB (Cấu trúc dữ liệu dạng tài liệu)
* Integrations: Payment Gateways (VNPay / MoMo / ZaloPay), Mail Service (Email Confirmation, OTP, Reminder)
* Architectural Style: Pure RESTful API với tiền tố `/api/v1/`

## 3. ARCHITECTURE PRINCIPLES

* Follow layered architecture: Controller -> Service -> Repository -> Model/Entity.
  * Controllers: Chỉ xử lý routing, mapping dữ liệu và request validation.
  * Services: Nơi thực thi 100% logic nghiệp vụ, tính toán tiền và kiểm tra điều kiện biên.
* API Style: REST với định dạng kebab-case và danh từ số nhiều (Ví dụ: `/api/v1/court-slots`, `/api/v1/payment-transactions`).
* Error Handling: Tập trung qua Centralized Exception Handling với HTTP status codes chuẩn (200, 201, 400, 401, 403, 500).
* Concurrency Control: Sử dụng cơ chế khóa (locking) hoặc toán tử nguyên tố (atomic operations) để xử lý các thao tác nhạy cảm (Giữ chỗ slot, Trừ lượt voucher đồng thời) nhằm ngăn chặn tuyệt đối tình trạng double-booking hoặc oversell.
* Bảo mật: Tuyệt đối không hardcode chuỗi kết nối MongoDB, mã bí mật JWT, hay thông tin cổng thanh toán. Sử dụng biến môi trường hoặc file cấu hình an toàn. Tuân thủ PCI-DSS khi tích hợp Payment Gateway.
* No `System.out` or `console.log` trong code production; sử dụng logger hệ thống để ghi vết.

## 4. PHẠM VI HOẠT ĐỘNG & QUY TẮC CẤM (FORBIDDEN PATTERNS)

### Thao tác hệ thống
* KHÔNG được commit trực tiếp vào branch `main` hoặc `production`. Mọi thay đổi phải đi qua Pull Request trên branch `001-pickleball-court-booking-system`.
* KHÔNG được bỏ qua validation đầu vào (Jakarta Validation / DTO Validation) trên các API write endpoints.
* KHÔNG được xóa vĩnh viễn dữ liệu giao dịch nghiệp vụ (Transaction data). Áp dụng quy tắc Soft Delete: Master data cập nhật `is_active = false`, Transaction data cập nhật `status = cancelled`.

### Luật nghiệp vụ cốt lõi (System Invariants)
* NEVER allow double-booking: Không cho phép hai Customer cùng đặt hoặc giữ chỗ chung một sân tại cùng một khung giờ.
* NEVER allow past-booking: Ngày chơi (`booking.date`) và khung giờ chơi phải thuộc về tương lai (`booking.date >= current_date`).
* NEVER let a Staff member change listed court pricing directly without predefined Owner configurations or system price rules.
* NEVER let a Guest user create recurring bookings (weekly/monthly).
* NEVER bypass email verification during account registration for new Customer accounts.

## 5. PBS DOMAIN & BUSINESS RULES

Khi viết code hoặc xử lý logic, bạn BẮT BUỘC phải thực thi chính xác 20 quy tắc nghiệp vụ sau:

* **BR-01 & BR-06 (Khung giờ & Bảng giá):** Độ dài cố định của mỗi slot đặt sân là **30 phút**. Sân mở cửa từ **05:00 AM đến 10:00 PM** hàng ngày. Áp dụng giá động: Khung giờ cao điểm (**17:00 – 21:00**) có giá **120,000 VND / slot**; Khung giờ bình thường (Off-peak) có giá **80,000 VND / slot**. Giá này có thể cấu hình linh hoạt theo cuối tuần/ngày lễ bởi Owner/Admin.
* **BR-02 & BR-08 (Slot Holding & Hủy tự động):** Tất cả lịch đặt trực tuyến phải thanh toán trước. Hệ thống áp dụng **Slot Hold 10 phút** (Tối đa 15 phút theo cấu hình cron-job). Nếu hết thời gian tạm giữ mà giao dịch chưa thành công, hệ thống chạy Auto-Release Job để hủy đơn (`status = DA_HUY`) và giải phóng slot ngay lập tức.
* **BR-03 (Chính sách Hoàn tiền - Refund):** Customer chỉ được hoàn tiền khi thực hiện hủy lịch **TRƯỚC ngày đặt sân**. Hủy trước 24h hoàn 100%, hủy từ 2–24h hoàn 50% (50% giữ lại ghi nhận doanh thu). Hủy trong vòng 2h trước giờ chơi hoặc không đến (no-show) sẽ **KHÔNG được hoàn tiền**.
* **BR-05 (Đóng sân khẩn cấp):** Khi phát hiện sân hỏng/bảo trì bất ngờ, hệ thống tự động đóng sân, hủy toàn bộ booking bị ảnh hưởng, kích hoạt hoàn tiền tự động 100% và gửi email xin lỗi qua Mail Service.
* **BR-07 (Dịch vụ kèm - Addon):** Sản phẩm cho thuê (vợt, bóng, nước uống) chỉ được đặt khi gắn liền với một mã đặt sân hợp lệ. Không xử lý thuê dụng cụ độc lập.
* **BR-09, BR-10 & BR-11 (Lịch định kỳ):** Chỉ Customer mới được đặt lịch định kỳ (Lịch tuần tối đa trước **8 tuần**, Lịch tháng tối đa trước **2 tháng**).
* **BR-18 (Khôi phục Khuyến mãi):** Nếu đơn đặt sân có áp dụng mã Voucher bị hủy hợp lệ theo chính sách, hệ thống phải khôi phục lại lượt sử dụng mã đó cho Customer (nếu voucher còn hạn).
* **BR-20 (Thao tác tại quầy):** Hỗ trợ Staff đặt sân trực tiếp (click trực tiếp vào ô trống trên sơ đồ trực quan) cho khách vãng lai bằng cách nhập thông tin định danh trực tiếp.

## 6. MA TRẬN PHÂN QUYỀN VAI TRÒ (RBAC MATRIX)

Kiểm soát chặt chẽ quyền truy cập API và giao diện dựa trên vai trò gán cho User:
* **Admin:** Toàn quyền cấu hình hệ thống, quản lý tài khoản người dùng, phân quyền vai trò, hỗ trợ cập nhật hồ sơ khách hàng, xem toàn bộ hệ thống log (Audit Log/System Report).
* **Owner:** Xem báo cáo doanh thu chi tiết (Revenue Dashboard/Report) của toàn bộ chi nhánh thuộc quyền quản lý, xuất báo cáo ra file Excel/PDF, cấu hình sân/bảng giá/ngày lễ, tạo và điều phối các chiến dịch khuyến mãi/voucher, kiểm duyệt/xử lý feedback và các yêu cầu hoàn tiền phức tạp.
* **Staff:** Quản lý và theo dõi lịch đặt sân real-time tại chi nhánh được gán (Không được xem chi nhánh khác), xử lý check-in/check-out cho khách, quản lý kho dụng cụ cho thuê/bán tại quầy, tạo booking trực tiếp tại quầy cho khách vãng lai, xử lý hoàn tiền thủ công khi có lỗi hệ thống xảy ra.
* **Customer:** Xem lịch sân trống real-time, tự đặt sân, thanh toán online, hủy/đổi lịch đặt sân (thỏa mãn quy tắc >2h), mua gói thành viên, quản lý thẻ thành viên, nhập mã voucher giảm giá, gửi feedback sau buổi chơi (khi booking chuyển sang trạng thái `HOAN_THANH`).
* **Guest:** Xem thông tin chi nhánh, danh sách sân, sơ đồ lịch trống trực quan, thực hiện đăng ký tài khoản mới. Không có quyền tạo giao dịch đặt sân online khi chưa đăng nhập.
* **Report Viewer:** Quyền đọc dữ liệu phân tích (Read-only), xem và xuất các báo cáo thống kê hiệu suất, tỷ lệ lấp đầy, không được phép thực hiện bất kỳ thao tác thay đổi dữ liệu hay cấu hình nào.

## 7. MÔ HÌNH DỮ LIỆU ĐƯỢC CHẤP NHẬN (KEY ENTITIES REFS)

Khi định nghĩa các Model/Document trong MongoDB, phải ánh xạ đúng cấu trúc dữ liệu gồm 27 thực thể cốt lõi sau:
1. `Branch` (Chi nhánh) | 2. `Court` (Sân) | 3. `User` (Người dùng)
4. `Booking` (Đơn đặt sân: `CHO_THANH_TOAN` -> `DA_XAC_NHAN` -> `DANG_SU_DUNG` -> `HOAN_THANH` / `DA_HUY`)
5. `SlotHold` (Tạm giữ slot) | 6. `PaymentTransaction` (Giao dịch thanh toán) | 7. `Refund` (Hoàn tiền)
8. `MembershipPlan` (Gói thành viên) | 9. `MembershipCard` (Thẻ thành viên của khách)
10. `Promotion` (Khuyến mãi) | 11. `Voucher` (Mã giảm giá) | 12. `AddonService` (Dịch vụ kèm)
13. `BookingAddon` (Chi tiết dịch vụ đi kèm đơn) | 14. `BookingChangeLog` (Lịch sử đổi lịch)
15. `MaintenanceTicket` (Phiếu bảo trì sân) | 16. `Feedback` (Đánh giá)
17. `EmailLog` (Ghi vết mail gửi & số lần retry) | 18. `AuditLog` (Ghi vết thao tác: ai, làm gì, trước/sau)

## 8. INTEGRATION & QUALITY GATEWAYS

* **Payment Gateway Integration:** API callback cần xử lý bất đồng bộ, cập nhật trạng thái đơn lập tức thành `DA_XAC_NHAN`. Nếu callback timeout hoặc mất kết nối, hệ thống phải tự động kích hoạt tiến trình query lại trạng thái giao dịch (Tự động retry tối đa 3 lần, mỗi lần cách nhau 30 giây).
* **Mail Service Integration:** Gửi email xác nhận đặt sân thành công hoặc hủy sân trong vòng tối đa 1 phút. Nếu Mail Service trả về lỗi, tự động retry gửi lại tối đa 3 lần (khoảng cách 5 phút) và ghi nhận kết quả vào `EmailLog`.
* **Định nghĩa Hoàn thành (Definition of Done):** Code sinh ra phải sạch, biến và hàm đặt tên tiếng Anh mang tính gợi nghĩa, xử lý triệt để lỗi ép kiểu hoặc rò rỉ bộ nhớ. Đảm bảo tính toán tiền tệ chính xác bằng kiểu dữ liệu có độ chính xác cao (Tránh sai số tiền tệ).
