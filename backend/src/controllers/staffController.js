const Staff = require('../models/Staff');

function sendError(res, status, message) {
  return res.status(status).json({ success: false, message });
}

function requireStaffRole(req, res) {
  if (!['Admin', 'Owner', 'Staff'].includes(req.user?.role)) {
    sendError(res, 403, 'Ban khong co quyen thuc hien thao tac nay.');
    return false;
  }

  return true;
}

function isValidDate(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(String(value || ''));
}

function parseId(value) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function getTodayString() {
  const now = new Date();
  return [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0'),
  ].join('-');
}

async function dashboard(req, res) {
  try {
    if (!requireStaffRole(req, res)) {
      return null;
    }

    const date = req.query.date || getTodayString();
    if (!isValidDate(date)) {
      return sendError(res, 400, 'Ngay phai co dinh dang YYYY-MM-DD.');
    }

    const [bookings, addons] = await Promise.all([
      Staff.listTodayBookings(date),
      Staff.listAddons(),
    ]);

    return res.json({ success: true, date, bookings, addons });
  } catch (error) {
    console.error('Staff dashboard error:', error);
    return sendError(res, 500, 'Loi may chu khi tai dashboard Staff.');
  }
}

async function checkIn(req, res) {
  try {
    if (!requireStaffRole(req, res)) {
      return null;
    }

    const bookingId = parseId(req.params.id);
    if (!bookingId) {
      return sendError(res, 400, 'Ma booking khong hop le.');
    }

    const booking = await Staff.checkIn(bookingId, req.user.id);
    return res.json({ success: true, booking, message: 'Check-in thanh cong.' });
  } catch (error) {
    console.error('Staff check-in error:', error);
    return sendError(res, error.status || 500, error.message || 'Loi may chu khi check-in.');
  }
}

async function confirmBooking(req, res) {
  try {
    if (!requireStaffRole(req, res)) {
      return null;
    }

    const bookingId = parseId(req.params.id);
    if (!bookingId) {
      return sendError(res, 400, 'Ma booking khong hop le.');
    }

    const booking = await Staff.confirmBooking(bookingId, req.user.id);
    return res.json({ success: true, booking, message: 'Da xac nhan booking.' });
  } catch (error) {
    console.error('Staff confirm booking error:', error);
    return sendError(res, error.status || 500, error.message || 'Loi may chu khi xac nhan booking.');
  }
}

async function cancelBooking(req, res) {
  try {
    if (!requireStaffRole(req, res)) {
      return null;
    }

    const bookingId = parseId(req.params.id);
    if (!bookingId) {
      return sendError(res, 400, 'Ma booking khong hop le.');
    }

    const booking = await Staff.cancelBooking(bookingId, req.user.id, req.body?.cancelReason);
    return res.json({ success: true, booking, message: 'Da huy booking.' });
  } catch (error) {
    console.error('Staff cancel booking error:', error);
    return sendError(res, error.status || 500, error.message || 'Loi may chu khi huy booking.');
  }
}

async function checkOut(req, res) {
  try {
    if (!requireStaffRole(req, res)) {
      return null;
    }

    const bookingId = parseId(req.params.id);
    if (!bookingId) {
      return sendError(res, 400, 'Ma booking khong hop le.');
    }

    const result = await Staff.checkOut(bookingId, req.user.id);
    return res.json({ success: true, ...result, message: 'Check-out thanh cong.' });
  } catch (error) {
    console.error('Staff check-out error:', error);
    return sendError(res, error.status || 500, error.message || 'Loi may chu khi check-out.');
  }
}

async function recordPayment(req, res) {
  try {
    if (!requireStaffRole(req, res)) {
      return null;
    }

    const bookingId = parseId(req.params.id);
    if (!bookingId) {
      return sendError(res, 400, 'Ma booking khong hop le.');
    }

    const paymentMethod = req.body.paymentMethod || 'cash';
    if (!['cash', 'bank_transfer'].includes(paymentMethod)) {
      return sendError(res, 400, 'Staff chi ghi nhan tien mat hoac chuyen khoan tai quay.');
    }

    const booking = await Staff.recordCounterPayment({
      bookingId,
      staffId: req.user.id,
      paymentMethod,
      note: req.body.note,
    });

    return res.json({ success: true, booking, message: 'Da ghi nhan thanh toan tai quay.' });
  } catch (error) {
    console.error('Staff payment error:', error);
    return sendError(res, error.status || 500, error.message || 'Loi may chu khi ghi nhan thanh toan.');
  }
}

async function updateAddonStock(req, res) {
  try {
    if (!requireStaffRole(req, res)) {
      return null;
    }

    const addonId = parseId(req.params.id);
    const stockQuantity = Number(req.body.stockQuantity);
    if (!addonId || !Number.isInteger(stockQuantity) || stockQuantity < 0) {
      return sendError(res, 400, 'So luong addon khong hop le.');
    }

    const addon = await Staff.updateAddonStock(addonId, stockQuantity);
    if (!addon) {
      return sendError(res, 404, 'Khong tim thay addon.');
    }

    return res.json({ success: true, addon, message: 'Da cap nhat so luong addon.' });
  } catch (error) {
    console.error('Staff addon stock error:', error);
    return sendError(res, 500, 'Loi may chu khi cap nhat addon.');
  }
}

module.exports = {
  cancelBooking,
  checkIn,
  checkOut,
  confirmBooking,
  dashboard,
  recordPayment,
  updateAddonStock,
};
