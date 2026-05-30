# CLAUDE.md - Pickleball Booking System

Tài liệu hướng dẫn cho AI Agent khi làm việc trong dự án Pickleball Booking System.

## 1. Tổng Quan Dự Án

Dự án là hệ thống đặt sân pickleball trực tuyến cho **một sân/cơ sở tại Hà Nội**.

Phạm vi hiện tại:

- Không quản lý nhiều khu vực.
- Không quản lý nhiều chi nhánh.
- Chỉ quản lý một cơ sở pickleball tại Hà Nội.
- Người dùng có thể xem lịch trống, đặt sân, thanh toán, hủy lịch và xem lịch sử đặt sân.
- Staff/Admin quản lý lịch đặt sân, trạng thái sân, sản phẩm thuê kèm, thanh toán và báo cáo cơ bản.

## 2. Tech Stack

| Tầng | Công nghệ | Ghi chú |
| --- | --- | --- |
| Frontend | React + Vite | Xây dựng giao diện web |
| Backend | Node.js + Express | Xây dựng REST API |
| Database | MongoDB + Mongoose | Lưu dữ liệu chính |
| Styling | Tailwind CSS | Nếu project đang dùng |
| Auth | JWT + bcrypt | Đăng nhập và bảo mật mật khẩu |

Nguyên tắc chính: dự án ưu tiên stack **React + Node.js + MongoDB**, không thêm công nghệ mới nếu không có lý do rõ ràng.

## 3. Kiến Trúc Tổng Quan

```text
React Frontend
      |
      | HTTP / JSON API
      v
Node.js Backend
      |
      | Mongoose
      v
MongoDB
```

Backend nên chia theo các lớp:

| Lớp | Thư mục gợi ý | Trách nhiệm |
| --- | --- | --- |
| Routes | `routes/` | Khai báo endpoint và middleware |
| Controllers | `controllers/` | Nhận request, gọi service, trả response |
| Services | `services/` | Xử lý business logic |
| Models | `models/` | Định nghĩa Mongoose schema |
| Middlewares | `middlewares/` | Auth, validate, error handler |
| Config | `config/` | Kết nối database, env config |

## 4. Phạm Vi Quản Lý Sân Hà Nội

Hệ thống chỉ có một địa điểm vận hành:

| Trường | Giá trị |
| --- | --- |
| Tên cơ sở | Pickleball Hà Nội |
| Thành phố | Hà Nội |
| Mô hình | Một cơ sở, nhiều sân con nếu cần |
| Quản lý chi nhánh | Không |
| Quản lý khu vực | Không |
| Timezone | Asia/Ho_Chi_Minh |
| Tiền tệ | VND |

Nếu cần lưu thông tin địa điểm, lưu trực tiếp trong cấu hình hệ thống hoặc collection `settings`. Không tạo collection `branches`, `clubs`, `regions` nếu chưa có nhu cầu thật sự.

## 5. API Chính

| Nhóm API | Endpoint gợi ý | Mục đích |
| --- | --- | --- |
| Auth | `/api/auth` | Đăng ký, đăng nhập, lấy thông tin người dùng |
| Users | `/api/users` | Quản lý tài khoản |
| Courts | `/api/courts` | Quản lý sân con trong cơ sở Hà Nội |
| Bookings | `/api/bookings` | Đặt sân, hủy sân, xem lịch sử |
| Payments | `/api/payments` | Tạo và cập nhật thanh toán |
| Products | `/api/products` | Quản lý sản phẩm/dụng cụ thuê kèm |
| Promotions | `/api/promotions` | Quản lý mã giảm giá |
| Reports | `/api/reports` | Báo cáo doanh thu cơ bản |

Format response nên thống nhất:

```json
{
  "success": true,
  "message": "OK",
  "data": {}
}
```

Khi lỗi:

```json
{
  "success": false,
  "message": "Error message"
}
```

## 6. Collections MongoDB

Danh sách collection chính:

| Collection | Vai trò | Ghi chú |
| --- | --- | --- |
| `users` | Lưu tài khoản khách hàng, staff, admin | Không lưu mật khẩu plain text |
| `courts` | Lưu thông tin các sân con trong cơ sở Hà Nội | Không cần `branchId` hoặc `clubId` |
| `bookings` | Lưu đơn đặt sân | Liên kết `userId`, `courtId` |
| `payments` | Lưu giao dịch thanh toán | Liên kết `bookingId` |
| `refunds` | Lưu yêu cầu hoàn tiền | Nếu có tính năng hủy và hoàn tiền |
| `products` | Lưu sản phẩm/dụng cụ thuê kèm | Ví dụ vợt, bóng, nước uống |
| `categories` | Lưu danh mục sản phẩm | Ví dụ dụng cụ, đồ uống |
| `promotions` | Lưu mã giảm giá | Áp dụng cho booking |
| `temp_locks` | Giữ slot tạm thời | Dùng TTL index để tự hết hạn |
| `settings` | Cấu hình cơ sở Hà Nội | Tên sân, địa chỉ, giờ mở cửa |

Không dùng trong phạm vi hiện tại:

| Collection | Lý do bỏ |
| --- | --- |
| `branches` | Không quản lý nhiều chi nhánh |
| `clubs` | Không quản lý nhiều cụm sân |
| `regions` | Không quản lý nhiều khu vực |

## 7. Schema Gợi Ý

### 7.1 `settings`

Lưu cấu hình chung cho một cơ sở tại Hà Nội.

| Trường | Kiểu | Bắt buộc | Ghi chú |
| --- | --- | --- | --- |
| `_id` | ObjectId | Có | Khóa chính |
| `venueName` | String | Có | Ví dụ `Pickleball Hà Nội` |
| `city` | String | Có | Luôn là `Hà Nội` |
| `address` | String | Có | Địa chỉ sân |
| `phone` | String | Không | Số điện thoại liên hệ |
| `email` | String | Không | Email liên hệ |
| `openTime` | String | Có | Ví dụ `06:00` |
| `closeTime` | String | Có | Ví dụ `22:00` |
| `timezone` | String | Có | `Asia/Ho_Chi_Minh` |
| `createdAt` | Date | Có | Tự sinh |
| `updatedAt` | Date | Có | Tự sinh |

```js
const settingSchema = new Schema({
  venueName: { type: String, required: true, trim: true },
  city: { type: String, default: 'Hà Nội', trim: true },
  address: { type: String, required: true, trim: true },
  phone: { type: String, trim: true },
  email: { type: String, trim: true, lowercase: true },
  openTime: { type: String, required: true },
  closeTime: { type: String, required: true },
  timezone: { type: String, default: 'Asia/Ho_Chi_Minh' }
}, { timestamps: true });
```

### 7.2 `users`

| Trường | Kiểu | Bắt buộc | Ghi chú |
| --- | --- | --- | --- |
| `_id` | ObjectId | Có | Khóa chính |
| `fullName` | String | Có | Họ tên |
| `email` | String | Có | Unique |
| `phone` | String | Có | Số điện thoại |
| `passwordHash` | String | Có | Mật khẩu đã hash |
| `role` | String | Có | `customer`, `staff`, `admin` |
| `status` | String | Có | `active`, `inactive`, `blocked` |
| `createdAt` | Date | Có | Tự sinh |
| `updatedAt` | Date | Có | Tự sinh |

```js
const userSchema = new Schema({
  fullName: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone: { type: String, required: true, trim: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['customer', 'staff', 'admin'], default: 'customer' },
  status: { type: String, enum: ['active', 'inactive', 'blocked'], default: 'active' }
}, { timestamps: true });
```

### 7.3 `courts`

Collection này lưu các sân con trong cùng một cơ sở Hà Nội. Ví dụ: Sân A1, Sân A2, Sân VIP.

| Trường | Kiểu | Bắt buộc | Ghi chú |
| --- | --- | --- | --- |
| `_id` | ObjectId | Có | Khóa chính |
| `name` | String | Có | Ví dụ `Sân A1` |
| `code` | String | Có | Unique, ví dụ `A1` |
| `type` | String | Có | `indoor`, `outdoor` |
| `surfaceType` | String | Không | Loại mặt sân |
| `basePricePerHour` | Number | Có | Giá theo giờ, VND |
| `facilities` | Array String | Không | Đèn, mái che, bãi xe |
| `status` | String | Có | `available`, `maintenance`, `inactive` |
| `createdAt` | Date | Có | Tự sinh |
| `updatedAt` | Date | Có | Tự sinh |

Không thêm `branchId`, `clubId`, `regionId` trong schema này.

```js
const courtSchema = new Schema({
  name: { type: String, required: true, trim: true },
  code: { type: String, required: true, unique: true, uppercase: true, trim: true },
  type: { type: String, enum: ['indoor', 'outdoor'], required: true },
  surfaceType: { type: String, trim: true },
  basePricePerHour: { type: Number, required: true, min: 0 },
  facilities: [{ type: String, trim: true }],
  status: { type: String, enum: ['available', 'maintenance', 'inactive'], default: 'available' }
}, { timestamps: true });
```

### 7.4 `bookings`

| Trường | Kiểu | Bắt buộc | Ghi chú |
| --- | --- | --- | --- |
| `_id` | ObjectId | Có | Khóa chính |
| `bookingCode` | String | Có | Unique, ví dụ `BK-20260530-0001` |
| `userId` | ObjectId | Có | Tham chiếu `users._id` |
| `staffId` | ObjectId | Không | Staff xử lý/check-in |
| `courtId` | ObjectId | Có | Tham chiếu `courts._id` |
| `bookingDate` | Date | Có | Ngày chơi |
| `startTime` | String | Có | Format `HH:mm` |
| `endTime` | String | Có | Format `HH:mm` |
| `courtPrice` | Number | Có | Giá sân tại thời điểm đặt |
| `productItems` | Array Object | Không | Dụng cụ/sản phẩm kèm |
| `promotionId` | ObjectId | Không | Tham chiếu `promotions._id` |
| `discountAmount` | Number | Có | Mặc định 0 |
| `totalAmount` | Number | Có | Tổng tiền cuối cùng |
| `paymentStatus` | String | Có | `unpaid`, `pending`, `paid`, `refunded`, `failed` |
| `bookingStatus` | String | Có | `pending`, `confirmed`, `checked_in`, `completed`, `cancelled`, `expired`, `no_show` |
| `expiresAt` | Date | Không | Hết hạn giữ chỗ |
| `createdAt` | Date | Có | Tự sinh |
| `updatedAt` | Date | Có | Tự sinh |

```js
const productItemSchema = new Schema({
  productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true, min: 0 }
}, { _id: false });

const bookingSchema = new Schema({
  bookingCode: { type: String, required: true, unique: true, trim: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  staffId: { type: Schema.Types.ObjectId, ref: 'User' },
  courtId: { type: Schema.Types.ObjectId, ref: 'Court', required: true, index: true },
  bookingDate: { type: Date, required: true, index: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  courtPrice: { type: Number, required: true, min: 0 },
  productItems: { type: [productItemSchema], default: [] },
  promotionId: { type: Schema.Types.ObjectId, ref: 'Promotion' },
  discountAmount: { type: Number, default: 0, min: 0 },
  totalAmount: { type: Number, required: true, min: 0 },
  paymentStatus: {
    type: String,
    enum: ['unpaid', 'pending', 'paid', 'refunded', 'failed'],
    default: 'unpaid'
  },
  bookingStatus: {
    type: String,
    enum: ['pending', 'confirmed', 'checked_in', 'completed', 'cancelled', 'expired', 'no_show'],
    default: 'pending'
  },
  expiresAt: { type: Date }
}, { timestamps: true });
```

### 7.5 `temp_locks`

Dùng để giữ slot tạm thời trong lúc khách thanh toán. Collection này có TTL index để tự xóa.

| Trường | Kiểu | Bắt buộc | Ghi chú |
| --- | --- | --- | --- |
| `_id` | ObjectId | Có | Khóa chính |
| `userId` | ObjectId | Có | Người giữ chỗ |
| `courtId` | ObjectId | Có | Sân được giữ |
| `bookingDate` | Date | Có | Ngày chơi |
| `startTime` | String | Có | Giờ bắt đầu |
| `endTime` | String | Có | Giờ kết thúc |
| `expiresAt` | Date | Có | Thời điểm hết hạn |
| `createdAt` | Date | Có | Tự sinh |

```js
const tempLockSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  courtId: { type: Schema.Types.ObjectId, ref: 'Court', required: true, index: true },
  bookingDate: { type: Date, required: true, index: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  expiresAt: { type: Date, required: true, index: true }
}, { timestamps: true });

tempLockSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
tempLockSchema.index({ courtId: 1, bookingDate: 1, startTime: 1, endTime: 1 }, { unique: true });
```

### 7.6 `payments`

| Trường | Kiểu | Bắt buộc | Ghi chú |
| --- | --- | --- | --- |
| `_id` | ObjectId | Có | Khóa chính |
| `bookingId` | ObjectId | Có | Tham chiếu `bookings._id` |
| `userId` | ObjectId | Có | Người thanh toán |
| `amount` | Number | Có | Số tiền VND |
| `paymentMethod` | String | Có | `cash`, `bank_transfer`, `momo`, `vnpay`, `zalopay`, `card` |
| `transactionId` | String | Không | Mã giao dịch cổng thanh toán |
| `status` | String | Có | `pending`, `success`, `failed`, `cancelled`, `refunded` |
| `paidAt` | Date | Không | Thời điểm thanh toán thành công |
| `createdAt` | Date | Có | Tự sinh |
| `updatedAt` | Date | Có | Tự sinh |

### 7.7 `products`

| Trường | Kiểu | Bắt buộc | Ghi chú |
| --- | --- | --- | --- |
| `_id` | ObjectId | Có | Khóa chính |
| `categoryId` | ObjectId | Có | Tham chiếu `categories._id` |
| `name` | String | Có | Tên sản phẩm |
| `price` | Number | Có | Giá thuê/bán |
| `stockQuantity` | Number | Có | Tồn kho |
| `status` | String | Có | `active`, `inactive`, `out_of_stock` |
| `createdAt` | Date | Có | Tự sinh |
| `updatedAt` | Date | Có | Tự sinh |

### 7.8 `promotions`

| Trường | Kiểu | Bắt buộc | Ghi chú |
| --- | --- | --- | --- |
| `_id` | ObjectId | Có | Khóa chính |
| `code` | String | Có | Unique |
| `description` | String | Không | Mô tả |
| `discountType` | String | Có | `percentage`, `fixed_amount` |
| `discountValue` | Number | Có | Giá trị giảm |
| `maxDiscountAmount` | Number | Không | Mức giảm tối đa |
| `startDate` | Date | Có | Ngày bắt đầu |
| `endDate` | Date | Có | Ngày kết thúc |
| `usageLimit` | Number | Không | Giới hạn lượt dùng |
| `usedCount` | Number | Có | Mặc định 0 |
| `isActive` | Boolean | Có | Mặc định true |

## 8. Index Khuyến Nghị

```js
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ phone: 1 });

db.courts.createIndex({ code: 1 }, { unique: true });
db.courts.createIndex({ status: 1 });

db.bookings.createIndex({ bookingCode: 1 }, { unique: true });
db.bookings.createIndex({ userId: 1, createdAt: -1 });
db.bookings.createIndex({ courtId: 1, bookingDate: 1, bookingStatus: 1 });
db.bookings.createIndex({ paymentStatus: 1, bookingStatus: 1 });

db.temp_locks.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
db.temp_locks.createIndex(
  { courtId: 1, bookingDate: 1, startTime: 1, endTime: 1 },
  { unique: true }
);

db.payments.createIndex({ bookingId: 1, status: 1 });
db.payments.createIndex({ transactionId: 1 }, { unique: true, sparse: true });

db.products.createIndex({ categoryId: 1, status: 1 });
db.promotions.createIndex({ code: 1 }, { unique: true });
```

## 9. Quy Tắc Nghiệp Vụ

### Đặt sân

- Không cho đặt sân nếu `court.status != available`.
- Không cho đặt ngày trong quá khứ.
- `startTime` phải nhỏ hơn `endTime`.
- Không cho hai booking active trùng cùng `courtId`, `bookingDate`, `startTime`, `endTime`.
- Trạng thái chiếm sân: `pending`, `confirmed`, `checked_in`.
- Trạng thái không còn chiếm sân: `cancelled`, `expired`, `completed`, `no_show`.

### Thanh toán

- Booking mới tạo có `bookingStatus = pending` và `paymentStatus = unpaid`.
- Khi thanh toán thành công, cập nhật `paymentStatus = paid` và `bookingStatus = confirmed`.
- Khi thanh toán thất bại hoặc hết hạn giữ chỗ, cập nhật `bookingStatus = expired` hoặc `cancelled`.
- Không tin giá gửi từ frontend. Backend phải tự tính lại giá.

### Giữ chỗ tạm thời

- Khi khách chọn sân và chuẩn bị thanh toán, tạo document trong `temp_locks`.
- Thời gian giữ chỗ mặc định: 10 phút.
- Nếu hết hạn mà chưa thanh toán, TTL index tự xóa lock.
- Booking lịch sử không được xóa bằng TTL. Chỉ `temp_locks` được dùng TTL.

### Hủy và hoàn tiền

- Chỉ hoàn tiền cho booking đã thanh toán.
- Tổng tiền hoàn không được vượt quá số tiền đã thanh toán.
- Khi hoàn tiền toàn bộ, cập nhật `paymentStatus = refunded`.
- Chính sách hủy nên xử lý ở service, không viết trực tiếp trong controller.

## 10. Quy Ước Frontend React

- Component dùng lại đặt trong `src/components`.
- Page đặt trong `src/pages` nếu project có thư mục này.
- API client đặt trong `src/services` hoặc `src/api`.
- Component không chứa business logic đặt sân phức tạp.
- Form cần có loading, error và validate cơ bản.
- Bảng lịch sân cần tránh re-render toàn bộ khi chỉ một ô thay đổi.

## 11. Quy Ước Backend Node.js

- Route chỉ khai báo endpoint và middleware.
- Controller chỉ đọc request, gọi service và trả response.
- Service xử lý logic chính: kiểm tra trùng lịch, tính tiền, giữ chỗ, cập nhật thanh toán.
- Model chỉ định nghĩa schema, index, hook cần thiết.
- Middleware dùng cho auth, validate request và error handling.
- Không hard-code secret, API key, JWT secret trong code.

## 12. Anti-Patterns Cần Tránh

| Anti-pattern | Lý do |
| --- | --- |
| Thêm `branchId`, `clubId`, `regionId` vào mọi bảng | Dự án hiện chỉ quản lý một cơ sở ở Hà Nội |
| Lưu booking trực tiếp trong document `courts` | Dễ vượt giới hạn document và khó query |
| Dùng TTL để xóa booking thật | Mất lịch sử giao dịch |
| Tính tiền ở frontend | Dễ bị chỉnh sửa dữ liệu |
| Lưu password plain text | Rủi ro bảo mật nghiêm trọng |
| Viết logic booking trong React component | Khó test và khó bảo trì |
| Viết toàn bộ logic trong Express route | Code khó mở rộng |

## 13. Checklist Trước Khi Push Git

- `CLAUDE.md` không còn mô tả mô hình nhiều khu vực hoặc nhiều chi nhánh.
- Schema `courts` không còn `branchId`, `clubId`, `regionId`.
- Các bảng/collection chính đã thống nhất theo mô hình một cơ sở Hà Nội.
- Có collection `settings` nếu cần lưu thông tin địa điểm.
- Booking dùng `courtId`, `bookingDate`, `startTime`, `endTime` để kiểm tra trùng lịch.
- `temp_locks` dùng TTL, còn `bookings` giữ lịch sử.
- Không có secret/API key trong tài liệu.
- Các ví dụ code dùng JavaScript/Mongoose, phù hợp Node.js backend.
