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

function mapBranch(row) {
  if (!row?.id) {
    return null;
  }

  return {
    id: row.id,
    code: row.code,
    name: row.name,
    district: row.district,
    address: row.address,
    phone: row.phone,
    email: row.email,
    openTime: normalizeTime(row.open_time),
    closeTime: normalizeTime(row.close_time),
    status: row.status,
  };
}

function mapCourt(row, settings = null) {
  if (!row) {
    return null;
  }

  const branch = mapBranch({
    id: row.branch_id,
    code: row.branch_code,
    name: row.branch_name,
    district: row.branch_district,
    address: row.branch_address,
    phone: row.branch_phone,
    email: row.branch_email,
    open_time: row.branch_open_time,
    close_time: row.branch_close_time,
    status: row.branch_status,
  });
  const openTime = branch?.openTime || settings?.openTime || '';
  const closeTime = branch?.closeTime || settings?.closeTime || '';

  return {
    id: row.id,
    branchId: row.branch_id,
    branchCode: row.branch_code,
    branchName: row.branch_name,
    branch,
    code: row.code,
    name: row.name,
    type: row.court_type,
    surfaceType: row.surface_type,
    surfaceLabel: surfaceLabel(row.surface_type),
    basePricePerHour: Number(row.base_price_per_hour || 0),
    peakPricePerSlot: Number(row.peak_price_per_slot || 0),
    offPeakPricePerSlot: Number(row.off_peak_price_per_slot || 0),
    facilities: parseFacilities(row.facilities),
    status: row.status,
    statusLabel: statusLabel(row.status),
    count: 1,
    district: branch?.district || settings?.city || 'Ha Noi',
    address: row.address || branch?.address || settings?.address || '',
    hotline: branch?.phone || settings?.phone || '',
    hours: openTime && closeTime ? `${openTime} - ${closeTime}` : '',
    venueName: branch?.name || settings?.venueName || '',
    intro: `${row.name} thuoc ${branch?.name || settings?.venueName || 'he thong pickleball'}, mat san ${row.surface_type}, trang thai ${statusLabel(row.status).toLowerCase()}.`,
    locationQuery: `${row.address || branch?.address || settings?.address || settings?.venueName || row.name}, ${branch?.district || settings?.city || 'Ha Noi'}`,
  };
}

function mapPriceRule(row) {
  return {
    id: row.id,
    branchId: row.branch_id,
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

async function listBranches() {
  const rows = await query(
    `SELECT id, code, name, district, address, phone, email, open_time, close_time, status
     FROM branches
     ORDER BY status = 'active' DESC, code ASC`,
  );

  return rows.map(mapBranch);
}

async function getDefaultBranchId() {
  const rows = await query(
    `SELECT id
     FROM branches
     WHERE status = 'active'
     ORDER BY id ASC
     LIMIT 1`,
  );

  return rows[0]?.id || null;
}

async function list({ type = 'all', branchId = null } = {}) {
  const settings = await getSettings();
  const branches = await listBranches();
  const params = {};
  const where = [];

  if (type && type !== 'all') {
    where.push('c.court_type = :type');
    params.type = type;
  }

  if (branchId) {
    where.push('c.branch_id = :branchId');
    params.branchId = branchId;
  }

  const rows = await query(
    `SELECT c.id, c.branch_id, c.code, c.name, c.address, c.court_type, c.surface_type,
            c.base_price_per_hour, c.peak_price_per_slot, c.off_peak_price_per_slot,
            c.facilities, c.status,
            b.code AS branch_code, b.name AS branch_name, b.district AS branch_district,
            b.address AS branch_address, b.phone AS branch_phone, b.email AS branch_email,
            b.open_time AS branch_open_time, b.close_time AS branch_close_time,
            b.status AS branch_status
     FROM courts c
     JOIN branches b ON b.id = c.branch_id
     ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
     ORDER BY b.code ASC, c.code ASC, c.name ASC`,
    params,
  );

  return {
    settings,
    branches,
    courts: rows.map((row) => mapCourt(row, settings)),
  };
}

async function findById(id) {
  const settings = await getSettings();
  const rows = await query(
    `SELECT c.id, c.branch_id, c.code, c.name, c.address, c.court_type, c.surface_type,
            c.base_price_per_hour, c.peak_price_per_slot, c.off_peak_price_per_slot,
            c.facilities, c.status,
            b.code AS branch_code, b.name AS branch_name, b.district AS branch_district,
            b.address AS branch_address, b.phone AS branch_phone, b.email AS branch_email,
            b.open_time AS branch_open_time, b.close_time AS branch_close_time,
            b.status AS branch_status
     FROM courts c
     JOIN branches b ON b.id = c.branch_id
     WHERE c.id = :id
     LIMIT 1`,
    { id },
  );

  const court = mapCourt(rows[0], settings);
  if (!court) {
    return null;
  }

  const priceRows = await query(
    `SELECT id, branch_id, court_id, name, day_of_week, start_time, end_time,
            price_per_slot, priority
     FROM price_rules
     WHERE is_active = TRUE
       AND (court_id IS NULL OR court_id = :id)
       AND (branch_id IS NULL OR branch_id = :branchId)
     ORDER BY COALESCE(day_of_week, 0), start_time ASC, priority ASC`,
    { id, branchId: court.branchId },
  );

  return {
    ...court,
    settings,
    priceRules: priceRows.map(mapPriceRule),
  };
}

async function create({
  branchId,
  code,
  name,
  address,
  type,
  surfaceType = 'standard',
  basePricePerHour = 160000,
  status = 'available',
  facilities = [],
}) {
  const safeBranchId = branchId || await getDefaultBranchId();
  if (!safeBranchId) {
    throw new Error('No active branch exists.');
  }

  const result = await query(
    `INSERT INTO courts (branch_id, code, name, address, court_type, surface_type, base_price_per_hour, facilities, status)
     VALUES (:branchId, :code, :name, :address, :type, :surfaceType, :basePricePerHour, :facilities, :status)`,
    {
      branchId: safeBranchId,
      code,
      name,
      address,
      type,
      surfaceType,
      basePricePerHour,
      status,
      facilities: JSON.stringify(facilities),
    },
  );

  return findById(result.insertId);
}

async function update(
  id,
  {
    branchId,
    code,
    name,
    address,
    type,
    surfaceType = 'standard',
    basePricePerHour = 160000,
    status = 'available',
    facilities = [],
  },
) {
  const safeBranchId = branchId || await getDefaultBranchId();
  if (!safeBranchId) {
    throw new Error('No active branch exists.');
  }

  await query(
    `UPDATE courts
     SET branch_id = :branchId,
         code = :code,
         name = :name,
         address = :address,
         court_type = :type,
         surface_type = :surfaceType,
         base_price_per_hour = :basePricePerHour,
         facilities = :facilities,
         status = :status
     WHERE id = :id`,
    {
      id,
      branchId: safeBranchId,
      code,
      name,
      address,
      type,
      surfaceType,
      basePricePerHour,
      status,
      facilities: JSON.stringify(facilities),
    },
  );

  return findById(id);
}

async function remove(id) {
  await query('DELETE FROM courts WHERE id = :id', { id });
}

async function availability(courtId, date) {
  const detail = await findById(courtId);
  if (!detail) {
    return null;
  }

  await query(
    `UPDATE bookings
     SET booking_status = 'expired',
         payment_status = CASE WHEN payment_status = 'unpaid' THEN 'failed' ELSE payment_status END
     WHERE booking_status = 'pending'
       AND payment_status IN ('unpaid', 'pending')
       AND expires_at IS NOT NULL
       AND expires_at <= NOW()`,
  );
  await query(
    `UPDATE slot_holds
     SET status = 'expired'
     WHERE status = 'active' AND expires_at <= NOW()`,
  );

  const slotMinutes = detail.settings?.slotMinutes || 60;
  const slots = buildSlots(detail.branch?.openTime || detail.settings?.openTime || '05:00', detail.branch?.closeTime || detail.settings?.closeTime || '22:00', slotMinutes)
    .filter((slot) => isFutureSlot(date, slot.startTime));
  const occupiedRows = await query(
    `SELECT bs.start_time, bs.end_time, b.booking_status AS status
     FROM booking_slots bs
     JOIN bookings b ON b.id = bs.booking_id
     WHERE bs.court_id = :courtId
       AND bs.booking_date = :date
       AND b.booking_status IN ('pending', 'confirmed', 'checked_in')
     UNION ALL
     SELECT start_time, end_time, 'held' AS status
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
    branchId: detail.branchId,
    date,
    slots: slots.map((slot) => ({
      ...slot,
      price: findPrice(detail.priceRules, slot.startTime),
      status: resolveSlotStatus(slot, occupied, detail.status),
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
    available: 'Dang hoat dong',
    maintenance: 'Dang bao tri',
    inactive: 'Tam ngung',
  };

  return labels[status] || status;
}

function surfaceLabel(surfaceType) {
  const labels = {
    standard: 'Tieu chuan',
    premium: 'Cao cap',
    synthetic: 'San tong hop',
    concrete: 'Be tong',
    wood: 'San go',
  };

  return labels[surfaceType] || surfaceType;
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
  return occupied.find((item) => slot.startTime < item.endTime && slot.endTime > item.startTime);
}

function resolveSlotStatus(slot, occupied, courtStatus) {
  if (courtStatus === 'maintenance') {
    return 'maintenance';
  }

  if (courtStatus === 'inactive') {
    return 'inactive';
  }

  const overlap = findOverlap(slot, occupied);
  if (!overlap) {
    return 'available';
  }

  if (overlap.status === 'held' || overlap.status === 'pending') {
    return 'held';
  }

  if (overlap.status === 'checked_in') {
    return 'in_use';
  }

  return 'booked';
}

function findPrice(priceRules, startTime) {
  const rule = priceRules.find((item) => startTime >= item.startTime && startTime < item.endTime);
  return rule ? rule.pricePerSlot : 0;
}

module.exports = {
  availability,
  create,
  findById,
  list,
  listBranches,
  remove,
  update,
};
