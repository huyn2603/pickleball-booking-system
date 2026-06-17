const Court = require('../models/Court');

function sendError(res, status, message) {
  return res.status(status).json({ success: false, message });
}

function isValidDate(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(String(value || ''));
}

function canManageCourts(req, res) {
  if (!['Admin', 'Owner'].includes(req.user?.role)) {
    sendError(res, 403, 'Ban khong co quyen quan ly san.');
    return false;
  }

  return true;
}

function normalizeCourtPayload(body) {
  const branchId = Number(body?.branchId || body?.branch_id || 0) || null;
  const code = String(body?.code || '').trim().toUpperCase();
  const name = String(body?.name || '').trim();
  const address = String(body?.address || '').trim();
  const type = body?.type === 'outdoor' ? 'outdoor' : 'indoor';
  const surfaceType = ['standard', 'premium', 'synthetic', 'concrete', 'wood'].includes(body?.surfaceType)
    ? body.surfaceType
    : 'standard';
  const status = ['available', 'maintenance', 'inactive'].includes(body?.status)
    ? body.status
    : 'available';
  const basePricePerHour = Number(body?.basePricePerHour || 160000);
  const facilities = Array.isArray(body?.facilities)
    ? body.facilities.map((item) => String(item).trim()).filter(Boolean)
    : String(body?.facilities || '')
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);

  return { branchId, code, name, address, type, surfaceType, status, basePricePerHour, facilities };
}

function validateCourtPayload(payload) {
  if (!payload.code || !payload.name || !payload.address) {
    return 'Vui long nhap ma san, ten san va dia chi.';
  }

  if (!Number.isFinite(payload.basePricePerHour) || payload.basePricePerHour < 0) {
    return 'Gia san phai la so khong am.';
  }

  return '';
}

function isPositiveInteger(value) {
  return /^[1-9]\d*$/.test(String(value || ''));
}

async function listCourts(req, res) {
  try {
    const type = req.query.type || 'all';
    const branchId = Number(req.query.branchId || req.query.branch_id || 0) || null;
    if (!['all', 'indoor', 'outdoor'].includes(type)) {
      return sendError(res, 400, 'Loai san khong hop le.');
    }

    const result = await Court.list({ type, branchId });
    return res.json({ success: true, data: result, ...result });
  } catch (error) {
    console.error('List courts error:', error);
    return sendError(res, 500, 'Loi may chu khi tai danh sach san.');
  }
}

async function courtDetail(req, res) {
  try {
    if (!isPositiveInteger(req.params.id)) {
      return sendError(res, 400, 'Ma san khong hop le.');
    }

    const court = await Court.findById(req.params.id);
    if (!court) {
      return sendError(res, 404, 'Khong tim thay san.');
    }

    return res.json({ success: true, data: { court }, court });
  } catch (error) {
    console.error('Court detail error:', error);
    return sendError(res, 500, 'Loi may chu khi tai chi tiet san.');
  }
}

async function courtAvailability(req, res) {
  try {
    if (!isPositiveInteger(req.params.id)) {
      return sendError(res, 400, 'Ma san khong hop le.');
    }

    const date = req.query.date;
    if (!isValidDate(date)) {
      return sendError(res, 400, 'Ngay xem lich phai co dinh dang YYYY-MM-DD.');
    }

    const availability = await Court.availability(req.params.id, date);
    if (!availability) {
      return sendError(res, 404, 'Khong tim thay san.');
    }

    return res.json({ success: true, data: { availability }, availability });
  } catch (error) {
    console.error('Court availability error:', error);
    return sendError(res, 500, 'Loi may chu khi tai lich trong.');
  }
}

async function createCourt(req, res) {
  try {
    if (!canManageCourts(req, res)) {
      return null;
    }

    const payload = normalizeCourtPayload(req.body);
    const error = validateCourtPayload(payload);
    if (error) {
      return sendError(res, 400, error);
    }

    const court = await Court.create(payload);
    return res.status(201).json({ success: true, court });
  } catch (error) {
    console.error('Create court error:', error);
    return sendError(res, 500, 'Loi may chu khi them san.');
  }
}

async function updateCourt(req, res) {
  try {
    if (!canManageCourts(req, res)) {
      return null;
    }

    const existing = await Court.findById(req.params.id);
    if (!existing) {
      return sendError(res, 404, 'Khong tim thay san.');
    }

    const payload = normalizeCourtPayload(req.body);
    const error = validateCourtPayload(payload);
    if (error) {
      return sendError(res, 400, error);
    }

    const court = await Court.update(req.params.id, payload);
    return res.json({ success: true, court });
  } catch (error) {
    console.error('Update court error:', error);
    return sendError(res, 500, 'Loi may chu khi sua san.');
  }
}

async function deleteCourt(req, res) {
  try {
    if (!canManageCourts(req, res)) {
      return null;
    }

    const existing = await Court.findById(req.params.id);
    if (!existing) {
      return sendError(res, 404, 'Khong tim thay san.');
    }

    await Court.remove(req.params.id);
    return res.json({ success: true, message: 'San da duoc xoa.' });
  } catch (error) {
    console.error('Delete court error:', error);
    return sendError(res, 500, 'Loi may chu khi xoa san. Neu san da co booking, hay chuyen sang bao tri.');
  }
}

module.exports = {
  createCourt,
  courtAvailability,
  courtDetail,
  deleteCourt,
  listCourts,
  updateCourt,
};
