const { query, transaction } = require('../config/db');

function normalizeTime(value) {
  if (!value) {
    return null;
  }

  return String(value).slice(0, 5);
}

function mapBooking(row) {
  return {
    id: row.id,
    bookingCode: row.booking_code,
    customerName: row.customer_name,
    customerEmail: row.customer_email,
    customerPhone: row.customer_phone,
    courtName: row.court_name,
    courtCode: row.court_code,
    bookingDate: row.booking_date,
    startTime: normalizeTime(row.start_time),
    endTime: normalizeTime(row.end_time),
    totalAmount: row.total_amount,
    paymentStatus: row.payment_status,
    bookingStatus: row.booking_status,
    checkedInAt: row.checked_in_at,
    checkedOutAt: row.checked_out_at,
    paidAmount: row.paid_amount || 0,
  };
}

function mapAddon(row) {
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    categoryName: row.category_name,
    serviceType: row.service_type,
    unitPrice: row.unit_price,
    stockQuantity: row.stock_quantity,
    status: row.status,
  };
}

function createTransactionCode() {
  return `PAY-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

async function listTodayBookings(date) {
  const rows = await query(
    `SELECT
       b.id,
       b.booking_code,
       b.booking_date,
       b.total_amount,
       b.payment_status,
       b.booking_status,
       b.checked_in_at,
       b.checked_out_at,
       u.full_name AS customer_name,
       u.email AS customer_email,
       u.phone AS customer_phone,
       c.name AS court_name,
       c.code AS court_code,
       MIN(bs.start_time) AS start_time,
       MAX(bs.end_time) AS end_time,
       COALESCE(SUM(CASE WHEN pt.status = 'success' THEN pt.amount ELSE 0 END), 0) AS paid_amount
     FROM bookings b
     JOIN users u ON u.id = b.customer_id
     JOIN courts c ON c.id = b.court_id
     LEFT JOIN booking_slots bs ON bs.booking_id = b.id
     LEFT JOIN payment_transactions pt ON pt.booking_id = b.id
     WHERE b.booking_date = :date
     GROUP BY b.id
     ORDER BY c.code ASC, start_time ASC, b.created_at ASC`,
    { date },
  );

  return rows.map(mapBooking);
}

async function findBooking(id) {
  const rows = await query(
    `SELECT
       b.id,
       b.booking_code,
       b.booking_date,
       b.total_amount,
       b.payment_status,
       b.booking_status,
       b.checked_in_at,
       b.checked_out_at,
       u.full_name AS customer_name,
       u.email AS customer_email,
       u.phone AS customer_phone,
       c.name AS court_name,
       c.code AS court_code,
       MIN(bs.start_time) AS start_time,
       MAX(bs.end_time) AS end_time,
       COALESCE(SUM(CASE WHEN pt.status = 'success' THEN pt.amount ELSE 0 END), 0) AS paid_amount
     FROM bookings b
     JOIN users u ON u.id = b.customer_id
     JOIN courts c ON c.id = b.court_id
     LEFT JOIN booking_slots bs ON bs.booking_id = b.id
     LEFT JOIN payment_transactions pt ON pt.booking_id = b.id
     WHERE b.id = :id
     GROUP BY b.id
     LIMIT 1`,
    { id },
  );

  return mapBooking(rows[0]);
}

async function checkIn(bookingId, staffId) {
  await transaction(async (connection) => {
    const [rows] = await connection.execute(
      'SELECT id, booking_status FROM bookings WHERE id = :bookingId FOR UPDATE',
      { bookingId },
    );
    const booking = rows[0];

    if (!booking) {
      const error = new Error('Khong tim thay booking.');
      error.status = 404;
      throw error;
    }

    if (booking.booking_status !== 'confirmed') {
      const error = new Error('Chi booking da xac nhan moi duoc check-in.');
      error.status = 400;
      throw error;
    }

    await connection.execute(
      `UPDATE bookings
       SET booking_status = 'checked_in', checked_in_at = NOW(), staff_id = :staffId
       WHERE id = :bookingId`,
      { bookingId, staffId },
    );
  });

  return findBooking(bookingId);
}

async function checkOut(bookingId, staffId) {
  let extraMinutes = 0;

  await transaction(async (connection) => {
    const [rows] = await connection.execute(
      `SELECT
         b.id,
         b.booking_status,
         b.booking_date,
         MAX(bs.end_time) AS end_time
       FROM bookings b
       LEFT JOIN booking_slots bs ON bs.booking_id = b.id
       WHERE b.id = :bookingId
       GROUP BY b.id
       FOR UPDATE`,
      { bookingId },
    );
    const booking = rows[0];

    if (!booking) {
      const error = new Error('Khong tim thay booking.');
      error.status = 404;
      throw error;
    }

    if (booking.booking_status !== 'checked_in') {
      const error = new Error('Chi booking dang checked-in moi duoc check-out.');
      error.status = 400;
      throw error;
    }

    const [extraRows] = await connection.execute(
      `SELECT GREATEST(
         TIMESTAMPDIFF(MINUTE, TIMESTAMP(:bookingDate, :endTime), NOW()),
         0
       ) AS extra_minutes`,
      {
        bookingDate: booking.booking_date,
        endTime: booking.end_time || '00:00:00',
      },
    );
    extraMinutes = extraRows[0]?.extra_minutes || 0;

    await connection.execute(
      `UPDATE bookings
       SET booking_status = 'completed', checked_out_at = NOW(), staff_id = :staffId
       WHERE id = :bookingId`,
      { bookingId, staffId },
    );
  });

  const booking = await findBooking(bookingId);
  return { booking, extraMinutes };
}

async function recordCounterPayment({ bookingId, staffId, paymentMethod, note }) {
  await transaction(async (connection) => {
    const [rows] = await connection.execute(
      `SELECT id, customer_id, total_amount, payment_status, booking_status
       FROM bookings
       WHERE id = :bookingId
       FOR UPDATE`,
      { bookingId },
    );
    const booking = rows[0];

    if (!booking) {
      const error = new Error('Khong tim thay booking.');
      error.status = 404;
      throw error;
    }

    if (booking.payment_status === 'paid') {
      const error = new Error('Booking nay da duoc thanh toan.');
      error.status = 400;
      throw error;
    }

    await connection.execute(
      `INSERT INTO payment_transactions
        (transaction_code, booking_id, customer_id, amount, payment_method, status, paid_at, note)
       VALUES
        (:transactionCode, :bookingId, :customerId, :amount, :paymentMethod, 'success', NOW(), :note)`,
      {
        transactionCode: createTransactionCode(),
        bookingId,
        customerId: booking.customer_id,
        amount: booking.total_amount,
        paymentMethod,
        note: note || 'Counter payment recorded by staff',
      },
    );

    await connection.execute(
      `UPDATE bookings
       SET payment_status = 'paid',
           booking_status = CASE WHEN booking_status = 'pending' THEN 'confirmed' ELSE booking_status END,
           staff_id = :staffId
       WHERE id = :bookingId`,
      { bookingId, staffId },
    );
  });

  return findBooking(bookingId);
}

async function listAddons() {
  const rows = await query(
    `SELECT
       a.id,
       a.code,
       a.name,
       a.service_type,
       a.unit_price,
       a.stock_quantity,
       a.status,
       c.name AS category_name
     FROM addon_services a
     JOIN categories c ON c.id = a.category_id
     ORDER BY c.name ASC, a.name ASC`,
  );

  return rows.map(mapAddon);
}

async function updateAddonStock(addonId, stockQuantity) {
  await query(
    `UPDATE addon_services
     SET stock_quantity = :stockQuantity,
         status = CASE WHEN :stockQuantity = 0 THEN 'inactive' ELSE 'active' END
     WHERE id = :addonId`,
    { addonId, stockQuantity },
  );

  const rows = await query(
    `SELECT
       a.id,
       a.code,
       a.name,
       a.service_type,
       a.unit_price,
       a.stock_quantity,
       a.status,
       c.name AS category_name
     FROM addon_services a
     JOIN categories c ON c.id = a.category_id
     WHERE a.id = :addonId
     LIMIT 1`,
    { addonId },
  );

  return mapAddon(rows[0]);
}

module.exports = {
  checkIn,
  checkOut,
  listAddons,
  listTodayBookings,
  recordCounterPayment,
  updateAddonStock,
};
