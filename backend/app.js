const cors = require('cors');
const express = require('express');
const authRoutes = require('./src/routes/authRoutes');

const app = express();

const allowedOrigins = (
  process.env.FRONTEND_ORIGIN ||
  'http://localhost:5173,http://127.0.0.1:5173,http://localhost:5174,http://127.0.0.1:5174'
)
  .split(',')
  .map((origin) => origin.trim());

app.use(cors({ origin: allowedOrigins }));
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ success: true, status: 'ok', database: 'SWP' });
});

app.use('/api/auth', authRoutes);

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Không tìm thấy API.' });
});

app.use((error, req, res, next) => {
  console.error('Unhandled API error:', error);
  res.status(500).json({
    success: false,
    message: 'Lỗi máy chủ. Vui lòng thử lại.',
  });
});

module.exports = app;
