const { query } = require('../config/db');

function parseFacilities(value) {
  if (!value) {
    return [];
  }

  if (Array.isArray(value)) {
    return value;
  }

  try {
    return JSON.parse(value);
  } catch {
    return [];
  }
}

function normalizeTime(value) {
  if (!value) {
    return '';
  }

  return String(value).slice(0, 5);
}

function formatVnd(value) {
  return `${Math.round(Number(value || 0) / 1000)}K/slot`;
}

function mapSettings(row) {
  if (!row) {
    return null;
  }

  return {
    venueName: row.venue_name,
    city: row.city,
    address: row.address,
    phone: row.phone,
    email: row.email,
    openTime: normalizeTime(row.open_time),
    closeTime: normalizeTime(row.close_time),
    slotMinutes: Number(row.slot_minutes || 60),
    holdMinutes: Number(row.hold_minutes || 10),
    timezone: row.timezone,
    currency: row.currency,
  };
}

function mapCourt(row, settings = null) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    code: row.code,
    name: row.name,
    type: row.court_type,
    surfaceType: row.surface_type,
    basePricePerHour: Number(row.base_price_per_hour || 0),
    peakPricePerSlot: Number(row.peak_price_per_slot || 0),
    offPeakPricePerSlot: Number(row.off_peak_price_per_slot || 0),
    facilities: parseFacilities(row.facilities),
    status: row.status,
    statusLabel: statusLabel(row.status),
    count: 1,
    district: settings?.city || 'Ha Noi',
    address: settings?.address || '',
    hotline: settings?.phone || '',
    hours: settings ? `${settings.openTime} - ${settings.closeTime}` : '',
    venueName: settings?.venueName || '',
    intro: `${row.name} thuộc ${settings?.venueName || 'cơ sở pickleball'}, mặt sân ${row.surface_type}, trạng thái ${statusLabel(row.status).toLowerCase()}.`,
    locationQuery: `${settings?.address || settings?.venueName || row.name}, ${settings?.city || 'Ha Noi'}`,
  };
}

function mapPriceRule(row) {
  return {
    id: row.id,
    courtId: row.court_id,
    name: row.name,
    dayOfWeek: row.day_of_week,
    startTime: normalizeTime(row.start_time),
    endTime: normalizeTime(row.end_time),
    pricePerSlot: Number(row.price_per_slot || 0),
    priceLabel: formatVnd(row.price_per_slot),
    priority: row.priority,
  };
}

async function getSettings() {
  const rows = await query(
    `SELECT venue_name, city, address, phone, email, open_time, close_time,
            slot_minutes, hold_minutes, timezone, currency
     FROM settings
     ORDER BY id ASC
     LIMIT 1`,
  );

  return mapSettings(rows[0]);
}

async function list({ type = 'all' } = {}) {
  const settings = await getSettings();
  const params = {};
  const typeClause = type && type !== 'all' ? 'WHERE court_type = :type' : '';

  if (typeClause) {
    params.type = type;
  }

  const rows = await query(
    `SELECT id, code, name, court_type, surface_type, base_price_per_hour,
            peak_price_per_slot, off_peak_price_per_slot, facilities, status
     FROM courts
     ${typeClause}
     ORDER BY code ASC, name ASC`,
    params,
  );

  return {
    settings,
    courts: rows.map((row) => mapCourt(row, settings)),
  };
}

async function findById(id) {
  const settings = await getSettings();
  const rows = await query(
    `SELECT id, code, name, court_type, surface_type, base_price_per_hour,
            peak_price_per_slot, off_peak_price_per_slot, facilities, status
     FROM courts
     WHERE id = :id
     LIMIT 1`,
    { id },
  );

  const court = mapCourt(rows[0], settings);
  if (!court) {
    return null;
  }

  const priceRows = await query(
    `SELECT id, court_id, name, day_of_week, start_time, end_time,
            price_per_slot, priority
     FROM price_rules
     WHERE is_active = TRUE
       AND (court_id IS NULL OR court_id = :id)
     ORDER BY COALESCE(day_of_week, 0), start_time ASC, priority ASC`,
    { id },
  );

  return {
    ...court,
    settings,
    priceRules: priceRows.map(mapPriceRule),
  };
}

async function availability(courtId, date) {
  const detail = await findById(courtId);
  if (!detail) {
    return null;
  }

  const slotMinutes = detail.settings?.slotMinutes || 60;
  const slots = buildSlots(detail.settings?.openTime || '05:00', detail.settings?.closeTime || '22:00', slotMinutes)
    .filter((slot) => isFutureSlot(date, slot.startTime));
  const occupiedRows = await query(
    `SELECT bs.start_time, bs.end_time, b.booking_status AS status
     FROM booking_slots bs
     JOIN bookings b ON b.id = bs.booking_id
     WHERE bs.court_id = :courtId
       AND bs.booking_date = :date
       AND b.booking_status IN ('pending', 'confirmed', 'checked_in')
     UNION ALL
     SELECT start_time, end_time, status
     FROM slot_holds
     WHERE court_id = :courtId
       AND booking_date = :date
       AND status = 'active'
       AND expires_at > NOW()`,
    { courtId, date },
  );

  const occupied = occupiedRows.map((row) => ({
    startTime: normalizeTime(row.start_time),
    endTime: normalizeTime(row.end_time),
    status: row.status,
  }));

  return {
    courtId: detail.id,
    date,
    slots: slots.map((slot) => ({
      ...slot,
      price: findPrice(detail.priceRules, slot.startTime),
      status: findOverlap(slot, occupied) ? 'booked' : 'available',
    })),
  };
}

function buildSlots(openTime, closeTime, slotMinutes) {
  const slots = [];
  let current = toMinutes(openTime);
  const close = toMinutes(closeTime);

  while (current + slotMinutes <= close) {
    slots.push({
      startTime: fromMinutes(current),
      endTime: fromMinutes(current + slotMinutes),
    });
    current += slotMinutes;
  }

  return slots;
}

function statusLabel(status) {
  const labels = {
    available: 'Đang hoạt động',
    maintenance: 'Đang bảo trì',
    inactive: 'Tạm ngưng',
  };

  return labels[status] || status;
}

function isFutureSlot(date, startTime) {
  const now = new Date();
  const today = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0'),
  ].join('-');

  if (date < today) {
    return false;
  }

  if (date > today) {
    return true;
  }

  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  return toMinutes(startTime) > currentMinutes;
}

function toMinutes(time) {
  const [hours, minutes] = normalizeTime(time).split(':').map(Number);
  return hours * 60 + minutes;
}

function fromMinutes(total) {
  const hours = String(Math.floor(total / 60)).padStart(2, '0');
  const minutes = String(total % 60).padStart(2, '0');
  return `${hours}:${minutes}`;
}

function findOverlap(slot, occupied) {
  return occupied.some((item) => slot.startTime < item.endTime && slot.endTime > item.startTime);
}

function findPrice(priceRules, startTime) {
  const rule = priceRules.find((item) => startTime >= item.startTime && startTime < item.endTime);
  return rule ? rule.pricePerSlot : 0;
}

module.exports = {
  availability,
  findById,
  list,
};
