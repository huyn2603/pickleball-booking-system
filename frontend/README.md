# Pickleball Booking System Frontend

Frontend du an su dung React + Vite.

## Scripts

```bash
npm install
npm run dev
npm run build
```

Mac dinh Vite chay o:

- `http://localhost:5173`

Backend API mac dinh:

- `http://localhost:5000/api`

## Ket noi backend

Backend hien co cac endpoint auth:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/google-login`
- `POST /api/auth/forgot-password/request-otp`
- `POST /api/auth/forgot-password/verify-otp`
- `POST /api/auth/forgot-password/reset`
- `POST /api/auth/password`
- `GET /api/auth/me`
- `POST /api/bookings/hold`
- `POST /api/bookings/from-hold` (ghi nhan thanh toan online va confirm booking)
- `GET /api/bookings/my`

Bien moi truong de bat nut dang nhap Gmail:

```env
VITE_GOOGLE_CLIENT_ID=your-google-web-client-id
```

Khi goi endpoint can dang nhap, gui token trong header:

```http
Authorization: Bearer <token>
```

## Ghi chu

- Khong tinh tien booking o frontend; backend phai tinh lai gia tu MySQL.
- Frontend chi gui lua chon cua user: san, ngay, gio, addon, voucher.
- Khong luu token hoac thong tin nhay cam theo cach khong an toan.
