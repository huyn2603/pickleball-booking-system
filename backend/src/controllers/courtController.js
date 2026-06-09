const Court = require('../models/Court');

function sendError(res, status, message) {
  return res.status(status).json({ success: false, message });
}

function isValidDate(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(String(value || ''));
}

async function listCourts(req, res) {
  try {
    const type = req.query.type || 'all';
    if (!['all', 'indoor', 'outdoor'].includes(type)) {
      return sendError(res, 400, 'Loai san khong hop le.');
    }

    const result = await Court.list({ type });
    return res.json({ success: true, ...result });
  } catch (error) {
    console.error('List courts error:', error);
    return sendError(res, 500, 'Loi may chu khi tai danh sach san.');
  }
}

async function courtDetail(req, res) {
  try {
    const court = await Court.findById(req.params.id);
    if (!court) {
      return sendError(res, 404, 'Khong tim thay san.');
    }

    return res.json({ success: true, court });
  } catch (error) {
    console.error('Court detail error:', error);
    return sendError(res, 500, 'Loi may chu khi tai chi tiet san.');
  }
}

async function courtAvailability(req, res) {
  try {
    const date = req.query.date;
    if (!isValidDate(date)) {
      return sendError(res, 400, 'Ngay xem lich phai co dinh dang YYYY-MM-DD.');
    }

    const availability = await Court.availability(req.params.id, date);
    if (!availability) {
      return sendError(res, 404, 'Khong tim thay san.');
    }

    return res.json({ success: true, availability });
  } catch (error) {
    console.error('Court availability error:', error);
    return sendError(res, 500, 'Loi may chu khi tai lich trong.');
  }
}

module.exports = {
  courtAvailability,
  courtDetail,
  listCourts,
};
