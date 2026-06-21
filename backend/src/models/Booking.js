const { query, transaction } = require('../config/db');

function normalizeTime(value) {
  return String(value || '').slice(0, 5);
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

function toSqlTime(time) {
  return `${normalizeTime(time)}:00`;
}

function getDayOfWeek(date) {
  const day = new Date(`${date}T00:00:00`).getDay();
  return day === 0 ? 7 : day;
}

function createHoldCode() {
  return `HOLD-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

function createBookingCode() {
  return `BK-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

function createTransactionCode() {
  return `PAY-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

function createAppError(message, status = 400) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function isFutureStart(date, startTime) {
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

function mapHold(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    holdCode: row.hold_code,
    customerId: row.customer_id,
    branchId: row.branch_id,
    courtId: row.court_id,
    bookingDate: row.booking_date,
    startTime: normalizeTime(row.start_time),
    endTime: normalizeTime(row.end_time),
    status: row.status,
    expiresAt: row.expires_at,
    createdAt: row.created_at,
  };
}

function mapBooking(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    bookingCode: row.booking_code,
    customerId: row.customer_id,
    branchId: row.branch_id,
    courtId: row.court_id,
    courtCode: row.court_code,
    courtName: row.court_name,
    branchName: row.branch_name,
    bookingDate: row.booking_date,
    startTime: normalizeTime(row.start_time),
    endTime: normalizeTime(row.end_time),
    subTotal: Number(row.sub_total || 0),
    discountAmount: Number(row.discount_amount || 0),
    totalAmount: Number(row.total_amount || 0),
    paymentStatus: row.payment_status,
    bookingStatus: row.booking_status,
    expiresAt: row.expires_at,
    createdAt: row.created_at,
  };
}

async function getSettings(connection) {
  const [rows] = await connection.execute(
    `SELECT open_time, close_time, slot_minutes, hold_minutes
     FROM settings
     ORDER BY id ASC
     LIMIT 1`,
  );

  return rows[0] || null;
}

async function getCourt(connection, courtId) {
  const [rows] = await connection.execute(
    `SELECT
       c.id,
       c.branch_id,
       c.code,
       c.name,
       c.status,
       b.name AS branch_name,
       b.open_time AS branch_open_time,
       b.close_time AS branch_close_time,
       b.status AS branch_status
     FROM courts c
     JOIN branches b ON b.id = c.branch_id
     WHERE c.id = :courtId
     LIMIT 1`,
    { courtId },
  );

  return rows[0] || null;
}

async function getPriceRules(connection, { branchId, courtId, date }) {
  const dayOfWeek = getDayOfWeek(date);
  const [rows] = await connection.execute(
    `SELECT id, branch_id, court_id, day_of_week, start_time, end_time, price_per_slot, priority
     FROM price_rules
     WHERE is_active = TRUE
       AND (branch_id IS NULL OR branch_id = :branchId)
       AND (court_id IS NULL OR court_id = :courtId)
       AND (day_of_week IS NULL OR day_of_week = :dayOfWeek)
       AND (valid_from IS NULL OR valid_from <= :date)
       AND (valid_to IS NULL OR valid_to >= :date)
     ORDER BY priority ASC, court_id IS NULL ASC, branch_id IS NULL ASC`,
    { branchId, courtId, dayOfWeek, date },
  );

  return rows;
}

function findSlotPrice(priceRules, startTime) {
  const start = normalizeTime(startTime);
  const rule = priceRules.find((item) => start >= normalizeTime(item.start_time) && start < normalizeTime(item.end_time));
  return Number(rule?.price_per_slot || 0);
}

function buildBookingSlots({ startTime, endTime, slotMinutes, priceRules }) {
  const slots = [];
  let current = toMinutes(startTime);
  const end = toMinutes(endTime);

  while (current < end) {
    const slotStart = fromMinutes(current);
    const slotEnd = fromMinutes(current + slotMinutes);
    slots.push({
      startTime: slotStart,
      endTime: slotEnd,
      price: findSlotPrice(priceRules, slotStart),
    });
    current += slotMinutes;
  }

  return slots;
}

async function findActiveHoldByCode(holdCode) {
  const rows = await query(
    `SELECT id, hold_code, customer_id, branch_id, court_id, booking_date,
            start_time, end_time, status, expires_at, created_at
     FROM slot_holds
     WHERE hold_code = :holdCode
     LIMIT 1`,
    { holdCode },
  );

  return mapHold(rows[0]);
}

async function findBookingById(bookingId) {
  const rows = await query(
    `SELECT
       b.id,
       b.booking_code,
       b.customer_id,
       b.branch_id,
       b.court_id,
       b.booking_date,
       b.sub_total,
       b.discount_amount,
       b.total_amount,
       b.payment_status,
       b.booking_status,
       b.expires_at,
       b.created_at,
       c.code AS court_code,
       c.name AS court_name,
       br.name AS branch_name,
       MIN(bs.start_time) AS start_time,
       MAX(bs.end_time) AS end_time
     FROM bookings b
     JOIN courts c ON c.id = b.court_id
     JOIN branches br ON br.id = b.branch_id
     LEFT JOIN booking_slots bs ON bs.booking_id = b.id
     WHERE b.id = :bookingId
     GROUP BY b.id
     LIMIT 1`,
    { bookingId },
  );

  return mapBooking(rows[0]);
}

async function expirePendingBookings() {
  await query(
    `UPDATE bookings
     SET booking_status = 'expired',
         payment_status = CASE WHEN payment_status = 'unpaid' THEN 'failed' ELSE payment_status END
     WHERE booking_status = 'pending'
       AND payment_status IN ('unpaid', 'pending')
       AND expires_at IS NOT NULL
       AND expires_at <= NOW()`,
  );
}

async function listCustomerBookings(customerId) {
  await expirePendingBookings();

  const rows = await query(
    `SELECT
       b.id,
       b.booking_code,
       b.customer_id,
       b.branch_id,
       b.court_id,
       b.booking_date,
       b.sub_total,
       b.discount_amount,
       b.total_amount,
       b.payment_status,
       b.booking_status,
       b.expires_at,
       b.created_at,
       c.code AS court_code,
       c.name AS court_name,
       br.name AS branch_name,
       MIN(bs.start_time) AS start_time,
       MAX(bs.end_time) AS end_time
     FROM bookings b
     JOIN courts c ON c.id = b.court_id
     JOIN branches br ON br.id = b.branch_id
     LEFT JOIN booking_slots bs ON bs.booking_id = b.id
     WHERE b.customer_id = :customerId
     GROUP BY b.id
     ORDER BY b.booking_date DESC, MIN(bs.start_time) DESC, b.created_at DESC`,
    { customerId },
  );

  return rows.map(mapBooking);
}

async function createHold({ customerId, courtId, bookingDate, startTime, durationHours }) {
  let holdCode = '';
  let priceSlots = [];
  let totalAmount = 0;
  let holdMinutes = 10;
  let courtInfo = null;

  await transaction(async (connection) => {
    await connection.execute(
      `UPDATE slot_holds
       SET status = 'expired'
       WHERE status = 'active' AND expires_at <= NOW()`,
    );

    const settings = await getSettings(connection);
    const court = await getCourt(connection, courtId);
    if (!court) {
      throw createAppError('Khong tim thay san.', 404);
    }

    if (court.status !== 'available' || court.branch_status !== 'active') {
      throw createAppError('San hien khong kha dung de dat.');
    }

    const slotMinutes = Number(settings?.slot_minutes || 30);
    holdMinutes = Number(settings?.hold_minutes || 10);
    const durationMinutes = Math.round(Number(durationHours || 0) * 60);
    const safeStartTime = normalizeTime(startTime);
    const endTime = fromMinutes(toMinutes(safeStartTime) + durationMinutes);
    const openTime = normalizeTime(court.branch_open_time || settings?.open_time || '05:00:00');
    const closeTime = normalizeTime(court.branch_close_time || settings?.close_time || '22:00:00');

    if (durationMinutes <= 0 || durationMinutes % slotMinutes !== 0) {
      throw createAppError('Thoi luong dat san khong hop le.');
    }

    if (!isFutureStart(bookingDate, safeStartTime)) {
      throw createAppError('Khong the dat san trong qua khu.');
    }

    if (safeStartTime < openTime || endTime > closeTime || safeStartTime >= endTime) {
      throw createAppError('Khung gio nam ngoai gio hoat dong cua san.');
    }

    const priceRules = await getPriceRules(connection, {
      branchId: court.branch_id,
      courtId,
      date: bookingDate,
    });
    priceSlots = buildBookingSlots({
      startTime: safeStartTime,
      endTime,
      slotMinutes,
      priceRules,
    });
    totalAmount = priceSlots.reduce((total, slot) => total + slot.price, 0);

    if (priceSlots.length === 0 || totalAmount <= 0) {
      throw createAppError('Chua co bang gia hop le cho khung gio nay.');
    }

    holdCode = createHoldCode();
    await connection.execute(
      `INSERT INTO slot_holds
        (hold_code, customer_id, branch_id, court_id, booking_date, start_time, end_time, status, expires_at)
       VALUES
        (:holdCode, :customerId, :branchId, :courtId, :bookingDate, :startTime, :endTime, 'active', DATE_ADD(NOW(), INTERVAL :holdMinutes MINUTE))`,
      {
        holdCode,
        customerId,
        branchId: court.branch_id,
        courtId,
        bookingDate,
        startTime: toSqlTime(safeStartTime),
        endTime: toSqlTime(endTime),
        holdMinutes,
      },
    );

    courtInfo = {
      id: court.id,
      branchId: court.branch_id,
      code: court.code,
      name: court.name,
      branchName: court.branch_name,
    };
  });

  const hold = await findActiveHoldByCode(holdCode);
  return {
    hold,
    court: courtInfo,
    slots: priceSlots,
    totalAmount,
    holdMinutes,
  };
}

async function createBookingFromHold({ customerId, holdCode }) {
  let bookingId = null;
  let totalAmount = 0;
  let priceSlots = [];
  let transactionCode = '';

  await transaction(async (connection) => {
    await connection.execute(
      `UPDATE slot_holds
       SET status = 'expired'
       WHERE status = 'active' AND expires_at <= NOW()`,
    );

    const [holdRows] = await connection.execute(
      `SELECT id, hold_code, customer_id, branch_id, court_id, booking_date,
              start_time, end_time, status, expires_at
       FROM slot_holds
       WHERE hold_code = :holdCode
         AND customer_id = :customerId
       LIMIT 1
       FOR UPDATE`,
      { holdCode, customerId },
    );
    const hold = holdRows[0];

    if (!hold) {
      throw createAppError('Khong tim thay lich dang giu.', 404);
    }

    if (hold.status !== 'active') {
      throw createAppError('Lich dang giu khong con hieu luc.');
    }

    const [expiryRows] = await connection.execute(
      'SELECT (:expiresAt <= NOW()) AS is_expired',
      { expiresAt: hold.expires_at },
    );
    if (expiryRows[0]?.is_expired) {
      await connection.execute(
        `UPDATE slot_holds
         SET status = 'expired'
         WHERE id = :holdId`,
        { holdId: hold.id },
      );
      throw createAppError('Phien giu lich da het han. Vui long chon lai.');
    }

    const settings = await getSettings(connection);
    const priceRules = await getPriceRules(connection, {
      branchId: hold.branch_id,
      courtId: hold.court_id,
      date: hold.booking_date,
    });
    priceSlots = buildBookingSlots({
      startTime: normalizeTime(hold.start_time),
      endTime: normalizeTime(hold.end_time),
      slotMinutes: Number(settings?.slot_minutes || 30),
      priceRules,
    });
    totalAmount = priceSlots.reduce((total, slot) => total + slot.price, 0);

    if (priceSlots.length === 0 || totalAmount <= 0) {
      throw createAppError('Chua co bang gia hop le cho khung gio nay.');
    }

    await connection.execute(
      `UPDATE slot_holds
       SET status = 'converted'
       WHERE id = :holdId`,
      { holdId: hold.id },
    );

    const bookingCode = createBookingCode();
    const [bookingResult] = await connection.execute(
      `INSERT INTO bookings
        (booking_code, customer_id, branch_id, court_id, booking_date,
         sub_total, discount_amount, total_amount, payment_status, booking_status, source, expires_at)
       VALUES
        (:bookingCode, :customerId, :branchId, :courtId, :bookingDate,
         :subTotal, 0, :totalAmount, 'paid', 'confirmed', 'online', NULL)`,
      {
        bookingCode,
        customerId,
        branchId: hold.branch_id,
        courtId: hold.court_id,
        bookingDate: hold.booking_date,
        subTotal: totalAmount,
        totalAmount,
      },
    );
    bookingId = bookingResult.insertId;

    for (const slot of priceSlots) {
      await connection.execute(
        `INSERT INTO booking_slots
          (booking_id, branch_id, court_id, booking_date, start_time, end_time, price)
         VALUES
          (:bookingId, :branchId, :courtId, :bookingDate, :startTime, :endTime, :price)`,
        {
          bookingId,
          branchId: hold.branch_id,
          courtId: hold.court_id,
          bookingDate: hold.booking_date,
          startTime: toSqlTime(slot.startTime),
          endTime: toSqlTime(slot.endTime),
          price: slot.price,
        },
      );
    }

    transactionCode = createTransactionCode();
    await connection.execute(
      `INSERT INTO payment_transactions
        (transaction_code, booking_id, customer_id, amount, payment_method,
         gateway_reference, status, paid_at, note, raw_response)
       VALUES
        (:transactionCode, :bookingId, :customerId, :amount, 'bank_transfer',
         :gatewayReference, 'success', NOW(), :note, :rawResponse)`,
      {
        transactionCode,
        bookingId,
        customerId,
        amount: totalAmount,
        gatewayReference: hold.hold_code,
        note: 'Online bank transfer confirmed from slot hold',
        rawResponse: JSON.stringify({
          source: 'demo_bank_transfer',
          holdCode: hold.hold_code,
          confirmedAt: new Date().toISOString(),
        }),
      },
    );
  });

  const booking = await findBookingById(bookingId);
  return {
    booking,
    payment: {
      transactionCode,
      amount: totalAmount,
      method: 'bank_transfer',
      status: 'success',
    },
    slots: priceSlots,
    totalAmount,
  };
}

module.exports = {
  createHold,
  createBookingFromHold,
  expirePendingBookings,
  listCustomerBookings,
};
