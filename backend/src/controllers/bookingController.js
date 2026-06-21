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

function extractHoldCode(text) {
  const match = String(text || '').match(/HOLD-[0-9]+-[A-Z0-9]+/i);
  return match ? match[0].toUpperCase() : '';
}

function normalizeWebhookTransactions(body) {
  if (Array.isArray(body?.data)) {
    return body.data;
  }

  if (Array.isArray(body?.transactions)) {
    return body.transactions;
  }

  if (body?.data && typeof body.data === 'object') {
    return [body.data];
  }

  return [body || {}];
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
      payment: result.payment,
      message: 'Thanh toan thanh cong. Booking da duoc xac nhan.',
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

async function paymentStatus(req, res) {
  try {
    if (req.user?.role !== 'Customer') {
      return sendError(res, 403, 'Chi tai khoan Customer moi xem duoc trang thai thanh toan.');
    }

    const holdCode = String(req.params.holdCode || '').trim();
    if (!holdCode) {
      return sendError(res, 400, 'Ma giu lich khong hop le.');
    }

    const result = await Booking.getHoldPaymentStatus({
      customerId: req.user.id,
      holdCode,
    });

    return res.json({
      success: true,
      data: result,
      ...result,
    });
  } catch (error) {
    console.error('Payment status error:', error);
    return sendError(res, error.status || 500, error.message || 'Loi may chu khi kiem tra thanh toan.');
  }
}

async function vietQrWebhook(req, res) {
  try {
    const configuredSecret = process.env.VIETQR_WEBHOOK_SECRET || '';
    if (configuredSecret) {
      const receivedSecret = req.get('x-webhook-secret') || req.get('secure-token') || req.query.secret || '';
      if (receivedSecret !== configuredSecret) {
        return sendError(res, 401, 'Webhook token khong hop le.');
      }
    }

    const transactions = normalizeWebhookTransactions(req.body);
    const confirmed = [];
    const ignored = [];

    for (const item of transactions) {
      const description = item.description || item.content || item.addInfo || item.memo || '';
      const holdCode = extractHoldCode(description);
      const amount = Number(item.amount || item.transferAmount || item.creditAmount || item.money || 0);

      if (!holdCode || amount <= 0) {
        ignored.push({ reason: 'missing_hold_or_amount', description });
        continue;
      }

      try {
        const result = await Booking.confirmHoldPayment({
          holdCode,
          paidAmount: amount,
          rawResponse: item,
        });
        confirmed.push({
          holdCode,
          bookingCode: result.booking?.bookingCode,
          amount,
        });
      } catch (error) {
        ignored.push({ holdCode, reason: error.message });
      }
    }

    return res.json({
      success: true,
      message: confirmed.length ? 'Da ghi nhan giao dich VietQR.' : 'Khong co giao dich phu hop.',
      confirmed,
      ignored,
    });
  } catch (error) {
    console.error('VietQR webhook error:', error);
    return sendError(res, error.status || 500, error.message || 'Loi may chu khi xu ly webhook VietQR.');
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
  paymentStatus,
  vietQrWebhook,
};
