const Booking = require('../models/Booking');

function sendError(res, status, message) {
  return res.status(status).json({ success: false, message });
}

function isValidDate(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(String(value || ''));
}

function isValidTime(value) {
  return /^\d{2}:\d{2}$/.test(String(value || ''));
}

function parsePositiveInteger(value) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

async function createHold(req, res) {
  try {
    if (req.user?.role !== 'Customer') {
      return sendError(res, 403, 'Chi tai khoan Customer moi duoc dat san online.');
    }

    const courtId = parsePositiveInteger(req.body?.courtId);
    const bookingDate = String(req.body?.date || req.body?.bookingDate || '').trim();
    const startTime = String(req.body?.startTime || '').trim();
    const durationHours = Number(req.body?.durationHours || 0);

    if (!courtId) {
      return sendError(res, 400, 'Ma san khong hop le.');
    }

    if (!isValidDate(bookingDate)) {
      return sendError(res, 400, 'Ngay dat san phai co dinh dang YYYY-MM-DD.');
    }

    if (!isValidTime(startTime)) {
      return sendError(res, 400, 'Gio bat dau phai co dinh dang HH:mm.');
    }

    if (!Number.isFinite(durationHours) || durationHours <= 0 || durationHours > 4) {
      return sendError(res, 400, 'Thoi luong dat san khong hop le.');
    }

    const result = await Booking.createHold({
      customerId: req.user.id,
      courtId,
      bookingDate,
      startTime,
      durationHours,
    });

    return res.status(201).json({
      success: true,
      data: result,
      hold: result.hold,
      totalAmount: result.totalAmount,
      message: 'Da giu lich tam thoi. Vui long hoan tat thanh toan trong 10 phut.',
    });
  } catch (error) {
    const duplicateMessages = [
      'Court hold overlaps an active hold',
      'Court hold overlaps an active booking',
      'Court slot overlaps an active booking',
      'Court slot overlaps an active hold',
    ];

    if (duplicateMessages.includes(error.sqlMessage || error.message)) {
      return sendError(res, 409, 'San vua duoc giu hoac da co nguoi dat. Vui long chon khung gio khac.');
    }

    console.error('Create booking hold error:', error);
    return sendError(res, error.status || 500, error.message || 'Loi may chu khi giu lich.');
  }
}

async function createBookingFromHold(req, res) {
  try {
    if (req.user?.role !== 'Customer') {
      return sendError(res, 403, 'Chi tai khoan Customer moi duoc dat san online.');
    }

    const holdCode = String(req.body?.holdCode || '').trim();
    if (!holdCode) {
      return sendError(res, 400, 'Ma giu lich khong hop le.');
    }

    const result = await Booking.createBookingFromHold({
      customerId: req.user.id,
      holdCode,
    });

    return res.status(201).json({
      success: true,
      data: result,
      booking: result.booking,
      message: 'Da tao yeu cau dat san. Nhan vien se xac nhan va huong dan thanh toan.',
    });
  } catch (error) {
    const duplicateMessages = [
      'Court hold overlaps an active hold',
      'Court hold overlaps an active booking',
      'Court slot overlaps an active booking',
      'Court slot overlaps an active hold',
    ];

    if (duplicateMessages.includes(error.sqlMessage || error.message)) {
      return sendError(res, 409, 'San vua duoc giu hoac da co nguoi dat. Vui long chon khung gio khac.');
    }

    console.error('Create booking from hold error:', error);
    return sendError(res, error.status || 500, error.message || 'Loi may chu khi tao booking.');
  }
}

async function listMyBookings(req, res) {
  try {
    if (req.user?.role !== 'Customer') {
      return sendError(res, 403, 'Chi tai khoan Customer moi xem duoc lich dat san cua minh.');
    }

    const bookings = await Booking.listCustomerBookings(req.user.id);
    return res.json({
      success: true,
      data: { bookings },
      bookings,
    });
  } catch (error) {
    console.error('List customer bookings error:', error);
    return sendError(res, error.status || 500, error.message || 'Loi may chu khi tai lich dat san.');
  }
}

module.exports = {
  createBookingFromHold,
  createHold,
  listMyBookings,
};
