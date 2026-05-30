## CLAUDE.md — Pickleball Booking System (PBS) v1.0

Hệ Thống Đặt Sân Pickleball Trực Tuyến (Mô hình Web-Only)

1. TL;DR (Đọc trước — 60 giây)

Đây là hệ thống đặt sân Pickleball (Pickleball Booking System) vận hành hoàn
toàn trên nền tảng Web:

  - Backend: Node.js (Express) + MongoDB (Mongoose) - Viết bằng JavaScript
    thuần.
  - Frontend: React + Tailwind CSS + Vite - Viết bằng JavaScript thuần (JSX), hỗ
    trợ hiển thị đáp ứng (Responsive) tốt trên cả máy tính và điện thoại di động
    [ADR-001, ADR-002].
  - Xử lý khóa trùng lịch: Sử dụng cơ chế khóa tạm thời trực tiếp trên MongoDB
    (TTL Collection) thay vì các hệ thống lưu trữ ngoài [ADR-003].
  - Quy mô: 3 cụm sân (Hà Nội, Đà Nẵng, Hồ Chí Minh), tổng cộng 15+ sân (trong
    nhà/ngoài trời), 5000+ người dùng, 2000+ lượt đặt sân/tháng.

Tài liệu cần đọc trước khi code:

  - AGENTS.md → Quy chuẩn toàn diện cho AI Agent (Tech stack, domain model).
  - CONSTITUTION.md → Nguyên tắc phát triển và thỏa thuận của đội ngũ.
  - File này (CLAUDE.md) → Quy trình làm việc, mẫu thiết kế và quy ước của dự
    án.

2. KIẾN TRÚC HỆ THỐNG

2.1 Sơ đồ tổng quan kiến trúc

┌─────────────────────────────────────────────────────────────────────────┐
│                    FRONTEND (React Web App)                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐ │
│  │Dashboard │  │Court     │  │Booking   │  │Payment   │  │Web QR    │ │
│  │& Analytics│ │Explorer  │  │Calendar  │  │Gateway   │  │Check-in  │ │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘ │
└───────┼─────────────┼─────────────┼─────────────┼─────────────┼───────┘
        │             │             │             │             │
        ▼             ▼             ▼             ▼             ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    BACKEND (Node.js + Express)                          │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                    REST API Layer (Routing)                     │   │
│  │  /api/auth  /api/courts  /api/bookings  /api/payments  /api/users│   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                              │                                          │
│                              ▼                                          │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                 Service Layer (Business Logic)                  │   │
│  │  AuthService  CourtService  BookingService  PaymentService       │   │
│  │  NotificationService  ScheduleService                           │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                              │                                          │
│                              ▼                                          │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │              DataAccess Layer (Mongoose Models)                  │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┴─────────────────────┐
        ▼                                           ▼
┌─────────────────┐                       ┌─────────────────┐
│    MongoDB      │                       │   Third-Party   │
│  (Primary DB &  │                       │  (PayOS/Momo/   │
│  Temporary Lock)│                       │   SendGrid API) │
└─────────────────┘                       └─────────────────┘

2.2 Sơ đồ phân lớp kiến trúc (Layer Architecture Backend)

┌─────────────────────────────────────────┐
│            Routing Layer                │  express.Router()
│   - Định nghĩa các đầu cuối (Endpoints) │  - Áp dụng Middleware xác thực
│   - Kiểm tra định dạng dữ liệu đầu vào  │  - Điều phối luồng xử lý chính
└─────────────────┬─────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│           Controller Layer              │  controllers/
│   - Trích xuất dữ liệu từ Request       │  - Gọi dịch vụ nghiệp vụ tương ứng
│   - Trả về mã trạng thái HTTP chuẩn    │  - Bọc bắt lỗi tập trung (Error Handler)
└─────────────────┬─────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│           Service Layer                  │  services/
│   - Logic xử lý nghiệp vụ chính         │  - Xác thực quy tắc đặt khung giờ
│   - Tạo mã QR & Kiểm tra lượt check-in   │  - Khởi tạo cổng thanh toán
│   - Quản lý giao dịch ghi (Transactions)│  
└─────────────────┬─────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│           Mongoose Models               │  models/
│   - Định nghĩa Schema dữ liệu MongoDB   │  - Cấu hình chỉ mục (Indexes)
│   - Các hàm tiền xử lý (Hooks)          │  
└─────────────────────────────────────────┘

3. QUYẾT ĐỊNH KIẾN TRÚC QUAN TRỌNG (ADR)

ADR-001: Sử dụng bộ ba React, Node.js và MongoDB làm nền tảng cốt lõi

  - Quyết định: Toàn bộ hệ thống chỉ sử dụng ba công nghệ chính: React cho giao
    diện người dùng, Node.js cho logic máy chủ và MongoDB làm cơ sở dữ liệu duy
    nhất [ADR-001, ADR-002].
  - Lý do: Giảm thiểu sự phức tạp khi triển khai, đồng bộ hóa định dạng dữ liệu
    JSON xuyên suốt từ tầng lưu trữ (BSON) tới hiển thị (React state) [ADR-001,
    ADR-002]. Sử dụng ngôn ngữ JavaScript nhất quán trên cả Frontend và Backend
    giúp đẩy nhanh tốc độ xây dựng tính năng.
  - Trạng thái: ✅ Approved

ADR-002: Thiết kế đa thiết bị dựa trên nền tảng Web duy nhất (Không dùng Mobile App)

  - Quyết định: Không phát triển ứng dụng di động riêng biệt. Hệ thống sử dụng
    thiết kế Responsive Web thích ứng linh hoạt.
  - Lý do: Tiết kiệm chi phí bảo trì và phát triển. Giao diện quản lý dành cho
    nhân viên tại sân (bao gồm tính năng quét mã QR check-in) sẽ được tích hợp
    trực tiếp trên trang Web quản trị, chạy trực tiếp bằng trình duyệt trên
    thiết bị di động hoặc máy tính bảng của nhân viên [ADR-003, ADR-004].
  - Trạng thái: ✅ Approved

ADR-003: Cơ chế khóa đặt sân tạm thời bằng MongoDB TTL (Time-To-Live)

  - Quyết định: Sử dụng một Collection phụ trong MongoDB có tên là temp_locks đi
    kèm chỉ mục tự hủy TTL để khóa giữ chỗ tạm thời (10 phút) trong thời gian
    chờ thanh toán [ADR-003].
  - Lý do: Không cần cài đặt và vận hành thêm hệ thống Redis, duy trì kiến trúc
    tối giản và tiết kiệm tài nguyên hạ tầng.
  - Trạng thái: ✅ Approved

ADR-004: Giao dịch nguyên tử qua Mongoose Session Transactions

  - Quyết định: Toàn bộ tiến trình chuyển đổi trạng thái từ giữ chỗ tạm thời
    sang xác nhận thanh toán thành công phải chạy trong một Mongoose Session
    Transaction [ADR-004].
  - Lý do: Đảm bảo tính nhất quán của dữ liệu. Tránh trường hợp tiền của người
    dùng đã bị trừ nhưng giao dịch đặt sân không được chuyển sang trạng thái
    "CONFIRMED".
  - Trạng thái: ✅ Approved

4. NHỮNG GÌ ĐÃ KHÔNG HOẠT ĐỘNG (Lessons Learned)

LESSON-001: Tránh lưu trạng thái rảnh/bận theo từng phút đơn lẻ

  - Biến cố: Thiết kế ban đầu lưu trạng thái sân theo dạng một mảng chứa 1440
    phần tử tương ứng với 1440 phút trong ngày để phục vụ việc đặt giờ tự do
    khiến hệ thống truy vấn chậm nghiêm trọng khi lượng sân tăng.
  - Khắc phục: Quy chuẩn hóa khung giờ đặt sân theo các mốc thời gian cố định
    (60 phút, 90 phút hoặc 120 phút bắt đầu từ các giờ chẵn hoặc nửa giờ, ví
    dụ: 08:00, 09:30).

LESSON-002: Tuyệt đối không sử dụng múi giờ của máy trạm phía Client

  - Biến cố: Người dùng ở nước ngoài đặt sân bị lệch giờ hiển thị trên máy tính
    quản lý tại sân (Việt Nam - UTC+7).
  - Khắc phục: Toàn bộ lịch trình và thời gian đặt sân được lưu dưới dạng chuỗi
    chuẩn ISO UTC (YYYY-MM-DDTHH:mm:ss.sssZ) trong cơ sở dữ liệu và chỉ ép về
    múi giờ Asia/Ho_Chi_Minh khi tính toán doanh thu hoặc hiển thị giờ thực tế
    trên giao diện web tại sân.

LESSON-003: Giải phóng các giao dịch thanh toán quá hạn bằng Background Job tuần tự

  - Biến cố: Người dùng chọn sân xong, đi tới cổng thanh toán rồi tắt trình
    duyệt khiến sân đó bị khóa ở trạng thái pending mà không được giải phóng
    kịp thời.
  - Khắc phục: Xây dựng một tác vụ nền chạy tuần tự trong Node.js (sử dụng thư
    viện node-cron đơn giản) để quét định kỳ mỗi phút và tự động giải phóng các
    yêu cầu đặt sân ở trạng thái pending quá thời gian quy định trong cơ sở dữ
    liệu.

5. FILE STRUCTURE (Cấu trúc thư mục chi tiết)

5.1 Cấu trúc thư mục Backend (Node.js + Express)

backend/
├── src/
│   ├── config/             # Cấu hình DB & Biến môi trường
│   │   └── db.js
│   ├── controllers/        # Express controllers (Xử lý HTTP requests)
│   │   ├── court.controller.js
│   │   └── booking.controller.js
│   ├── services/           # Lớp logic nghiệp vụ cốt lõi
│   │   ├── court.service.js
│   │   ├── booking.service.js
│   │   └── payment.service.js
│   ├── models/             # Định nghĩa schemas & models Mongoose
│   │   ├── Court.js
│   │   ├── Booking.js
│   │   ├── User.js
│   │   └── TempLock.js     # Chứa khóa giữ chỗ tạm thời (TTL)
│   ├── middlewares/        # Custom middlewares
│   │   ├── auth.middleware.js
│   │   └── error.middleware.js
│   ├── routes/             # Định nghĩa các tuyến đường API
│   │   ├── court.routes.js
│   │   └── booking.routes.js
│   ├── utils/              # Các hàm tiện ích (Tạo mã QR, xử lý ngày tháng)
│   │   └── dateHelper.js
│   └── app.js              # Khởi tạo và thiết lập Express App
├── tests/                  # Thư mục kiểm thử tự động
└── package.json

5.2 Cấu trúc thư mục Frontend (React Web App)

frontend/
├── src/
│   ├── assets/            # Tài nguyên tĩnh (Hình ảnh, logo)
│   ├── components/        # Các thành phần giao diện tái sử dụng
│   │   ├── common/
│   │   │   └── Button.jsx
│   │   ├── court/
│   │   │   ├── CourtCard.jsx
│   │   │   └── CourtFilter.jsx
│   │   └── booking/
│   │       └── BookingCalendar.jsx
│   ├── pages/             # Các trang nghiệp vụ chính
│   │   ├── HomePage.jsx
│   │   ├── CourtDetailPage.jsx
│   │   ├── BookingSummaryPage.jsx
│   │   └── StaffCheckInPage.jsx  # Trang Web dành cho nhân viên quét mã QR
│   ├── hooks/             # Custom React Hooks
│   │   ├── useAuth.js
│   │   └── useBookings.js
│   ├── services/          # Các cuộc gọi API (sử dụng Axios)
│   │   └── api.js
│   ├── context/           # Quản lý trạng thái toàn cục (Auth, Cart)
│   ├── utils/             # Các hàm bổ trợ xử lý hiển thị giao diện
│   └── index.css
├── index.html
├── tailwind.config.js
└── vite.config.js

6. DEVELOPMENT WORKFLOW (Quy trình phát triển)

Dự án tuân thủ nghiêm ngặt quy trình phát triển dựa trên tài liệu đặc tả
(Spec-Driven Development):

┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│   /spec  →  /plan  →  /build  →  /test  →  /review  →  /deploy     │
│   Define    Plan     Build     Verify    Review     Deploy         │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘

7. RULES & GUIDELINES (Quy tắc & Hướng dẫn)

7.1 Luôn luôn làm (ALWAYS DO)

  - Sử dụng Mongoose Transaction: Cho tất cả các tác vụ ghi đồng thời liên quan
    đến tài chính và thay đổi trạng thái chỗ đặt [ADR-004].
  - Kiểm tra trùng lịch (Overlap Check): Luôn viết logic kiểm tra chồng chéo giờ
    bắt đầu và kết thúc của Booking mới so với các Booking khác trong hệ thống
    trước khi xác nhận.
  - Sử dụng chuẩn UTC cho thời gian: Mọi dữ liệu về ngày tháng gửi lên từ Client
    hoặc lưu trữ dưới Database bắt buộc phải tuân theo định dạng ISO 8601 UTC.
  - Xử lý lỗi tập trung: Luôn bao bọc các hàm controller bằng khối try-catch và
    đẩy lỗi xuống hàm next(error) để middleware xử lý tập trung.
  - Đánh giá dữ liệu đầu vào: Sử dụng kiểm tra tính hợp lệ của dữ liệu đầu vào
    (Body, Params, Query) tại tầng Router trước khi thực thi logic nghiệp vụ.

7.2 Không được làm (NEVER DO)

  - Không sử dụng Raw Queries không index: Cấm viết các câu lệnh truy vấn tìm
    kiếm lịch trống của sân bóng mà không đánh chỉ mục (Index) cho các trường
    courtId và date.
  - Không lưu mật khẩu dạng văn bản thô: Bắt buộc phải mã hóa mật khẩu người
    dùng thông qua thư viện bcrypt trước khi lưu vào MongoDB.
  - Không tin tưởng thông tin giá từ Client: Luôn tính toán lại tổng số tiền
    thanh toán tại Backend dựa trên cấu hình giá sân lấy từ Database, không sử
    dụng giá trị tiền gửi lên từ phía Client.
  - Không trả về dữ liệu nhạy cảm: Tuyệt đối không đưa các trường chứa thông tin
    bảo mật như password hay refreshToken vào dữ liệu JSON phản hồi về Client.

7.3 Tiêu chuẩn chất lượng Code

  - Độ dài tối đa của một hàm Controller: 35 dòng.
  - Độ dài tối đa của một hàm Service: 60 dòng.
  - Tỷ lệ phủ của Unit Test cho các Services chính: Tối thiểu 80%.

8. NAMING CONVENTIONS (Quy ước đặt tên)

8.1 Backend (Node.js/JavaScript)

  - Thư mục / Tập tin: Định dạng camelCase hoặc kebab-case (ví dụ:
    court.controller.js, booking-helper.js).
  - Tên Lớp (Class): Định dạng PascalCase (ví dụ: BookingService,
    PaymentService).
  - Tên Hàm (Function): Định dạng camelCase (ví dụ: getAvailableSlots(),
    calculatePrice()).
  - Mô hình Dữ liệu (MongoDB): Viết thường hoàn toàn và ở dạng số nhiều (ví dụ:
    courts, bookings, users).
  - Biến hằng số (Constants): Viết hoa hoàn toàn phân tách bằng dấu gạch dưới
    (ví dụ: MAX_BOOKING_DAYS_AHEAD, DEFAULT_SLOT_DURATION).

8.2 Frontend (React/JavaScript)

  - Thành phần giao diện (Components): Định dạng PascalCase (ví dụ:
    CourtCalendar.jsx, BookingForm.jsx).
  - Móc tùy chỉnh (Custom Hooks): Định dạng camelCase bắt đầu bằng tiền tố use
    (ví dụ: useBookingCart.js).
  - Kiểu dữ liệu: Sử dụng định dạng CamelCase chuẩn để quản lý các Object State
    của React.

9. SƠ ĐỒ QUY TRÌNH NGHIỆP VỤ (Swimlane Diagrams)

9.1 Quy trình Đặt Sân và Thanh Toán (Booking & Payment)

┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│ BOOKING & PAYMENT PROCESS SWIMLANES                                                         │
├───────────────┬───────────────┬───────────────┬───────────────────────────────┬─────────────┤
│    PLAYER     │  WEB FRONTEND │  WEB BACKEND  │            MONGODB            │ PAYMENT GW  │
├───────────────┼───────────────┼───────────────┼───────────────────────────────┼─────────────┤
│               │               │               │                               │             │
│ Chọn sân & giờ│               │               │                               │             │
│ ─────────────►│               │               │                               │             │
│               │ Gửi req đặt   │               │                               │             │
│               │ ─────────────►│ Check trùng   │                               │             │
│               │               │ ─────────────►│                               │             │
│               │               │               │ Ghi khóa tạm vào TempLock     │             │
│               │               │               │ (Tự hủy sau 10 phút)          │             │
│               │               │               │ ─────────────────────────────►│             │
│               │               │               │                               │             │
│               │               │               │ Tạo booking với trạng thái    │             │
│               │               │               │ "PENDING"                     │             │
│               │               │               │ ─────────────────────────────►│             │
│               │               │ Tạo link pay  │                               │             │
│               │               │ ─────────────────────────────────────────────►│             │
│               │ Trả link pay  │               │                               │             │
│               │◄──────────────│               │                               │             │
│               │               │               │                               │             │
│ Thực hiện     │               │               │                               │             │
│ thanh toán    │               │               │                               │             │
│ ─────────────────────────────────────────────────────────────────────────────►│             │
│               │               │               │                               │ Xử lý gd    │
│               │               │               │                               │ và trả về   │
│               │               │               │                               │ webhook     │
│               │               │ Webhook nhận  │                               │ ◄───────────│
│               │               │ ◄─────────────────────────────────────────────│             │
│               │               │               │                               │             │
│               │               │ Cập nhật trạng│                               │             │
│               │               │ thái "CONFIRMED"                              │             │
│               │               │ ─────────────────────────────►│               │             │
│               │               │               │                               │             │
│               │               │ Xóa khóa tạm  │                               │             │
│               │               │ trong TempLock│                               │             │
│               │               │ ─────────────►│                               │             │
│               │               │               │                               │             │
└───────────────┴───────────────┴───────────────┴───────────────────────────────┴─────────────┘

9.2 Quy trình Check-in bằng mã QR tại sân (Trình duyệt Web của Nhân viên)

┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│ QR CODE CHECK-IN SWIMLANES (WEB ONLY)                                                       │
├───────────────┬───────────────┬──────────────────────┬────────────────┬─────────────────────┤
│    PLAYER     │ STAFF (WEB)   │   WEB FRONTEND       │  WEB BACKEND   │       MONGODB       │
├───────────────┼───────────────┼──────────────────────┼────────────────┼─────────────────────┤
│               │               │                      │                │                     │
│ Mở vé đã đặt  │               │                      │                │                     │
│ ─────────────►│               │                      │                │                     │
│               │ Hiển thị QR   │                      │                │                     │
│               │ trên Web      │                      │                │                     │
│               │ ─────────────►│                      │                │                     │
│               │               │                      │                │                     │
│               │ Quét mã QR    │                      │                │                     │
│               │ bằng Camera   │                      │                │                     │
│               │ trình duyệt   │                      │                │                     │
│               │ ─────────────►│ Gửi dữ liệu          │                │                     │
│               │               │ giải mã QR           │                │                     │
│               │               │ ─────────────►───────│ Xác thực       │                     │
│               │               │                      │ token QR &     │                     │
│               │               │                      │ trạng thái vé  │                     │
│               │               │                      │ ──────────────►│                     │
│               │               │                      │                │ Lấy thông tin đặt   │
│               │               │                      │                │ sân và cập nhật sang│
│               │               │                      │                │ "CHECKED_IN"        │
│               │               │                      │                │ ◄───────────────────│
│               │               │                      │                │                     │
│               │               │ Trả kết quả          │                │                     │
│               │               │ thành công           │                │                     │
│               │               │ ◄────────────────────│                │                     │
│               │ Hiển thị thông│                      │                │                     │
│               │ báo check-in  │                      │                │                     │
│               │ ◄─────────────│                      │                │                     │
│               │               │                      │                │                     │
└───────────────┴───────────────┴──────────────────────┴────────────────┴─────────────────────┘

10. ANTI-PATTERNS CẦN TRÁNH (Tránh xa dứt khoát)

10.1 Database Anti-Patterns (MongoDB)

  - Thiết kế mảng lồng vô hạn (Unbounded Arrays): Không lưu trực tiếp hàng nghìn
    lịch đặt sân vào bên trong một tài liệu sân bóng (court.bookings). Tài liệu
    sẽ nhanh chóng vượt giới hạn dung lượng 16MB của MongoDB và gây sụt giảm
    hiệu năng. Lịch đặt sân được tách thành một Collection riêng biệt mang tên
    bookings và liên kết thông qua trường courtId.
  - Không đánh chỉ mục (Indexes) cho các trường tìm kiếm chính: Làm chậm nghiêm
    trọng các truy vấn lọc giờ trống của sân theo ngày khi lượng dữ liệu lớn
    dần. Bắt buộc tạo Compound Index trên hai trường { courtId: 1, date: 1 }.

10.2 Node.js Anti-Patterns

  - Làm tắc nghẽn luồng xử lý chính (Blocking Event Loop): Sử dụng các vòng lặp
    đồng bộ quá sâu để kiểm tra giờ hoặc phân tích tệp dữ liệu dung lượng lớn
    khiến toàn bộ các yêu cầu HTTP khác của người dùng bị dừng phản hồi. Tận
    dụng tối đa sức mạnh xử lý bất đồng bộ của Node.js.
  - Lưu trữ dữ liệu trạng thái tạm thời trong bộ nhớ ứng dụng (Stateful
    Service): Lưu danh sách các khung giờ bị khóa trực tiếp vào biến cục bộ
    (RAM) của ứng dụng Express. Khi triển khai lên môi trường chạy song song
    nhiều máy chủ, dữ liệu giữ chỗ sẽ bị sai lệch. Do đó, toàn bộ khóa tạm
    được chuyển hóa qua Collection temp_locks của MongoDB [ADR-003].

10.3 React Anti-Patterns

  - Re-render dư thừa trên bảng đặt sân: Người dùng bấm chọn một ô giờ cụ thể
    khiến toàn bộ bảng lịch trình chứa 15-20 sân bóng phải render lại toàn bộ,
    gây hiện tượng đơ lag trên trình duyệt điện thoại. Chia nhỏ các ô chọn giờ
    thành các component độc lập và sử dụng React.memo để tránh re-render không
    đáng có.

11. CORE ENTITIES (Mô hình Dữ liệu Chính)

11.1 Court Schema (Thông tin Sân bóng)

{
  _id: ObjectId,
  name: String,         // Ví dụ: "Sân 01 - Trong Nhà"
  clubId: ObjectId,     // Tham chiếu tới Cụm Sân (Hà Nội, HCM...)
  type: String,         // "indoor" | "outdoor"
  basePrice: Number,    // Giá gốc thuê sân/giờ (ví dụ: 150000 VNĐ)
  status: String,       // "active" | "maintenance" | "inactive"
  pricingRules: [{      // Cấu hình khung giờ vàng (Peak Hours)
    dayOfWeek: [Number], // 0: Chủ nhật, 1-6: Thứ 2-7
    startHour: String,   // Ví dụ: "17:00"
    endHour: String,     // Ví dụ: "21:00"
    surcharge: Number    // Phụ thu (ví dụ: +50000 VNĐ/giờ)
  }]
}

11.2 Booking Schema (Thông tin Đặt Sân)

{
  _id: ObjectId,
  bookingNumber: String, // Mã đặt sân duy nhất (e.g. PKB-102948)
  userId: ObjectId,      // Người đặt sân
  courtId: ObjectId,     // Sân bóng được đặt
  date: String,          // Ngày đặt (YYYY-MM-DD)
  startTime: String,     // Giờ bắt đầu (e.g. "08:00")
  endTime: String,       // Giờ kết thúc (e.g. "09:30")
  totalPrice: Number,    // Tổng số tiền thực tế (đã tính phụ thu)
  paymentStatus: String, // "pending" | "paid" | "refunded" | "failed"
  bookingStatus: String, // "pending" | "confirmed" | "checked_in" | "cancelled"
  qrToken: String,       // Token để giải mã và hiển thị QR kiểm tra lúc check-in
  createdAt: Date
}

11.3 TempLock Schema (Thông tin Khóa Giữ Chỗ Tạm Thời)

{
  _id: ObjectId,
  courtId: ObjectId,     // Sân bóng bị khóa
  date: String,          // Ngày đặt (YYYY-MM-DD)
  startTime: String,     // Giờ bắt đầu
  endTime: String,       // Giờ kết thúc
  userId: ObjectId,      // Người dùng giữ chỗ
  createdAt: Date        // Được đánh chỉ mục TTL để tự động xóa sau 10 phút (600 giây)
}
