# Implementation Notes

Trang nay mo ta hien trang ky thuat cua codebase.

## Stack

- Frontend: React + Vite
- Backend: Node.js + Express
- Database: MySQL 8.0
- MySQL driver: `mysql2/promise`
- Auth: HMAC token tu `backend/src/utils/token.js`, password luu plain text theo yeu cau hien tai

## Database

Source of truth:

- `mysql-workbench-schema.sql`
- `database.md`
- `mysql-workbench-import.md`

Database mac dinh:

```text
pickleball_booking_system
```

## Backend setup

Tao file `.env` trong `backend/` dua tren `.env.example`:

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

Chay backend:

```bash
cd backend
npm install
npm run dev
```

## Frontend setup

```bash
cd frontend
npm install
npm run dev
```

## Implemented API

- `GET /api/health`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/password`
- `GET /api/auth/me`
- `POST /api/bookings/hold`
- `POST /api/bookings/from-hold`
- `GET /api/bookings/my`

## Important notes

- Codebase da chuyen sang MySQL; khong dung MongoDB/Mongoose.
- Seed data trong SQL dung email `@gmail.com`.
- API dang ky chi chap nhan email co duoi `@gmail.com`.
- User seed dang nhap bang mat khau plain text `123456`.
- Booking da co API giu slot tam thoi `POST /api/bookings/hold`, ghi nhan thanh toan online va tao booking confirmed/paid tu hold `POST /api/bookings/from-hold`, va Customer xem lich dat cua minh qua `GET /api/bookings/my`; refund chua duoc implement API day du.
