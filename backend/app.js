const cors = require('cors');
const express = require('express');
const authRoutes = require('./src/routes/authRoutes');
const bookingRoutes = require('./src/routes/bookingRoutes');
const courtRoutes = require('./src/routes/courtRoutes');
const staffRoutes = require('./src/routes/staffRoutes');
const ownerRoutes = require('./src/routes/ownerRoutes');

const app = express();

const allowedOrigins = (
  process.env.FRONTEND_ORIGIN ||
  'http://localhost:5173,http://127.0.0.1:5173,http://localhost:5174,http://127.0.0.1:5174'
)
  .split(',')
  .map((origin) => origin.trim());

function isAllowedOrigin(origin) {
  if (!origin) {
    return true;
  }

  if (allowedOrigins.includes(origin)) {
    return true;
  }

  try {
    const url = new URL(origin);
    return ['localhost', '127.0.0.1', '::1'].includes(url.hostname);
  } catch {
    return false;
  }
}

app.use(cors({
  origin(origin, callback) {
    callback(null, isAllowedOrigin(origin));
  },
}));
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    status: 'ok',
    database: process.env.DB_NAME || 'pickleball_booking_system',
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/courts', courtRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/owner', ownerRoutes);

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Khong tim thay API.' });
});

app.use((error, req, res, next) => {
  console.error('Unhandled API error:', error);
  res.status(500).json({
    success: false,
    message: 'Loi may chu. Vui long thu lai.',
  });
});

module.exports = app;
