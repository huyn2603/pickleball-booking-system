const { query, transaction } = require('../config/db');

function normalizeTime(value) {
  return value ? String(value).slice(0, 5) : null;
}

function mapBooking(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    bookingCode: row.booking_code,
    branchId: row.branch_id,
    branchName: row.branch_name,
    customerName: row.customer_name,
    customerEmail: row.customer_email,
    customerPhone: row.customer_phone,
    courtId: row.court_id,
    courtName: row.court_name,
    courtCode: row.court_code,
    bookingDate: row.booking_date,
    startTime: normalizeTime(row.start_time),
    endTime: normalizeTime(row.end_time),
    totalAmount: row.total_amount,
    paymentStatus: row.payment_status,
    bookingStatus: row.booking_status,
    cancelReason: row.cancel_reason,
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

function mapCourt(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    branchId: row.branch_id,
    branchName: row.branch_name,
    code: row.code,
    name: row.name,
    status: row.status,
  };
}

function createTransactionCode() {
  return `PAY-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

function branchScope(operator, column = 'b.branch_id') {
  if (operator?.role === 'Admin') {
    return { sql: '', params: {} };
  }

  if (!operator?.branchId) {
    return { sql: ' AND 1 = 0', params: {} };
  }

  return {
    sql: ` AND ${column} = :operatorBranchId`,
    params: { operatorBranchId: operator.branchId },
  };
}

function assertBranchAccess(record, operator) {
  if (operator?.role !== 'Admin' && (!operator?.branchId || Number(record.branch_id) !== Number(operator.branchId))) {
    const error = new Error('Bạn không được thao tác dữ liệu ngoài chi nhánh được phân công.');
    error.status = 403;
    throw error;
  }
}

async function writeAudit(connection, {
  userId,
  action,
  tableName,
  recordId,
  oldData = null,
  newData = null,
}) {
  await connection.execute(
    `INSERT INTO audit_logs (user_id, action, table_name, record_id, old_data, new_data)
     VALUES (:userId, :action, :tableName, :recordId, :oldData, :newData)`,
    {
      userId,
      action,
      tableName,
      recordId,
      oldData: oldData ? JSON.stringify(oldData) : null,
      newData: newData ? JSON.stringify(newData) : null,
    },
  );
}

const bookingSelect = `
  SELECT
    b.id, b.booking_code, b.branch_id, b.court_id, b.booking_date,
    b.total_amount, b.payment_status, b.booking_status, b.cancel_reason,
    b.checked_in_at, b.checked_out_at,
    br.name AS branch_name,
    u.full_name AS customer_name, u.email AS customer_email, u.phone AS customer_phone,
    c.name AS court_name, c.code AS court_code,
    MIN(bs.start_time) AS start_time,
    MAX(bs.end_time) AS end_time,
    COALESCE((
      SELECT SUM(pt.amount)
      FROM payment_transactions pt
      WHERE pt.booking_id = b.id AND pt.status = 'success'
    ), 0) AS paid_amount
  FROM bookings b
  JOIN branches br ON br.id = b.branch_id
  JOIN users u ON u.id = b.customer_id
  JOIN courts c ON c.id = b.court_id
  LEFT JOIN booking_slots bs ON bs.booking_id = b.id
`;

async function listTodayBookings(date, operator, search = '') {
  const scope = branchScope(operator);
  const keyword = String(search || '').trim();
  const searchSql = keyword
    ? ` AND (
        b.booking_code LIKE :keyword
        OR u.full_name LIKE :keyword
        OR u.email LIKE :keyword
        OR u.phone LIKE :keyword
      )`
    : '';
  const rows = await query(
    `${bookingSelect}
     WHERE b.booking_date = :date
     ${scope.sql}
     ${searchSql}
     GROUP BY b.id
     ORDER BY c.code ASC, start_time ASC, b.created_at ASC`,
    {
      date,
      ...scope.params,
      ...(keyword ? { keyword: `%${keyword}%` } : {}),
    },
  );

  return rows.map(mapBooking);
}

async function findBooking(id, operator = null) {
  const scope = branchScope(operator);
  const rows = await query(
    `${bookingSelect}
     WHERE b.id = :id
     ${scope.sql}
     GROUP BY b.id
     LIMIT 1`,
    { id, ...scope.params },
  );

  return mapBooking(rows[0]);
}

async function updateBookingStatus({ bookingId, operator, expectedStatuses, status, action, extraSet = '', params = {} }) {
  await transaction(async (connection) => {
    const [rows] = await connection.execute(
      `SELECT id, branch_id, booking_status, payment_status
       FROM bookings WHERE id = :bookingId FOR UPDATE`,
      { bookingId },
    );
    const booking = rows[0];

    if (!booking) {
      const error = new Error('Không tìm thấy booking.');
      error.status = 404;
      throw error;
    }

    assertBranchAccess(booking, operator);
    if (!expectedStatuses.includes(booking.booking_status)) {
      const error = new Error(`Không thể chuyển booking từ trạng thái ${booking.booking_status}.`);
      error.status = 400;
      throw error;
    }

    await connection.execute(
      `UPDATE bookings
       SET booking_status = :status, staff_id = :staffId ${extraSet}
       WHERE id = :bookingId`,
      { bookingId, status, staffId: operator.id, ...params },
    );
    await writeAudit(connection, {
      userId: operator.id,
      action,
      tableName: 'bookings',
      recordId: bookingId,
      oldData: { bookingStatus: booking.booking_status },
      newData: { bookingStatus: status, ...params },
    });
  });

  return findBooking(bookingId, operator);
}

async function checkIn(bookingId, operator) {
  return updateBookingStatus({
    bookingId,
    operator,
    expectedStatuses: ['confirmed'],
    status: 'checked_in',
    action: 'STAFF_CHECK_IN',
    extraSet: ', checked_in_at = NOW()',
  });
}

async function confirmBooking(bookingId, operator) {
  return updateBookingStatus({
    bookingId,
    operator,
    expectedStatuses: ['pending'],
    status: 'confirmed',
    action: 'STAFF_CONFIRM_BOOKING',
  });
}

async function cancelBooking(bookingId, operator, cancelReason = '') {
  const reason = String(cancelReason || '').trim() || 'Hủy bởi nhân viên vận hành';
  return updateBookingStatus({
    bookingId,
    operator,
    expectedStatuses: ['pending', 'confirmed', 'checked_in'],
    status: 'cancelled',
    action: 'STAFF_CANCEL_BOOKING',
    extraSet: ', cancel_reason = :cancelReason',
    params: { cancelReason: reason },
  });
}

async function markNoShow(bookingId, operator, reason = '') {
  const noShowReason = String(reason || '').trim() || 'Khách không đến sân';
  return updateBookingStatus({
    bookingId,
    operator,
    expectedStatuses: ['confirmed'],
    status: 'no_show',
    action: 'STAFF_MARK_NO_SHOW',
    extraSet: ', cancel_reason = :cancelReason',
    params: { cancelReason: noShowReason },
  });
}

async function checkOut(bookingId, operator) {
  let extraMinutes = 0;

  await transaction(async (connection) => {
    const [rows] = await connection.execute(
      `SELECT b.id, b.branch_id, b.booking_status, b.booking_date,
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
      const error = new Error('Không tìm thấy booking.');
      error.status = 404;
      throw error;
    }

    assertBranchAccess(booking, operator);
    if (booking.booking_status !== 'checked_in') {
      const error = new Error('Chỉ booking đang checked-in mới được check-out.');
      error.status = 400;
      throw error;
    }

    const [extraRows] = await connection.execute(
      `SELECT GREATEST(
         TIMESTAMPDIFF(MINUTE, TIMESTAMP(:bookingDate, :endTime), NOW()), 0
       ) AS extra_minutes`,
      { bookingDate: booking.booking_date, endTime: booking.end_time || '00:00:00' },
    );
    extraMinutes = extraRows[0]?.extra_minutes || 0;

    await connection.execute(
      `UPDATE bookings
       SET booking_status = 'completed', checked_out_at = NOW(), staff_id = :staffId
       WHERE id = :bookingId`,
      { bookingId, staffId: operator.id },
    );
    await writeAudit(connection, {
      userId: operator.id,
      action: 'STAFF_CHECK_OUT',
      tableName: 'bookings',
      recordId: bookingId,
      oldData: { bookingStatus: booking.booking_status },
      newData: { bookingStatus: 'completed', extraMinutes },
    });
  });

  return { booking: await findBooking(bookingId, operator), extraMinutes };
}

async function recordCounterPayment({ bookingId, operator, paymentMethod, note }) {
  await transaction(async (connection) => {
    const [rows] = await connection.execute(
      `SELECT id, branch_id, customer_id, total_amount, payment_status, booking_status
       FROM bookings WHERE id = :bookingId FOR UPDATE`,
      { bookingId },
    );
    const booking = rows[0];

    if (!booking) {
      const error = new Error('Không tìm thấy booking.');
      error.status = 404;
      throw error;
    }

    assertBranchAccess(booking, operator);
    if (booking.payment_status === 'paid') {
      const error = new Error('Booking này đã được thanh toán.');
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
        note: note || 'Thanh toán tại quầy do Staff ghi nhận',
      },
    );
    await connection.execute(
      `UPDATE bookings
       SET payment_status = 'paid',
           booking_status = CASE WHEN booking_status = 'pending' THEN 'confirmed' ELSE booking_status END,
           staff_id = :staffId
       WHERE id = :bookingId`,
      { bookingId, staffId: operator.id },
    );
    await writeAudit(connection, {
      userId: operator.id,
      action: 'STAFF_RECORD_PAYMENT',
      tableName: 'bookings',
      recordId: bookingId,
      oldData: { paymentStatus: booking.payment_status, bookingStatus: booking.booking_status },
      newData: { paymentStatus: 'paid', paymentMethod, amount: booking.total_amount },
    });
  });

  return findBooking(bookingId, operator);
}

async function listAddons() {
  const rows = await query(
    `SELECT a.id, a.code, a.name, a.service_type, a.unit_price, a.stock_quantity,
            a.status, c.name AS category_name
     FROM addon_services a
     JOIN categories c ON c.id = a.category_id
     ORDER BY c.name ASC, a.name ASC`,
  );
  return rows.map(mapAddon);
}

async function updateAddonStock(addonId, stockQuantity, operator) {
  await transaction(async (connection) => {
    const [rows] = await connection.execute(
      'SELECT id, stock_quantity, status FROM addon_services WHERE id = :addonId FOR UPDATE',
      { addonId },
    );
    const addon = rows[0];
    if (!addon) {
      const error = new Error('Không tìm thấy addon.');
      error.status = 404;
      throw error;
    }

    const status = stockQuantity === 0 ? 'inactive' : 'active';
    await connection.execute(
      `UPDATE addon_services SET stock_quantity = :stockQuantity, status = :status
       WHERE id = :addonId`,
      { addonId, stockQuantity, status },
    );
    await writeAudit(connection, {
      userId: operator.id,
      action: 'STAFF_UPDATE_ADDON_STOCK',
      tableName: 'addon_services',
      recordId: addonId,
      oldData: { stockQuantity: addon.stock_quantity, status: addon.status },
      newData: { stockQuantity, status },
    });
  });

  const rows = await query(
    `SELECT a.id, a.code, a.name, a.service_type, a.unit_price, a.stock_quantity,
            a.status, c.name AS category_name
     FROM addon_services a
     JOIN categories c ON c.id = a.category_id
     WHERE a.id = :addonId LIMIT 1`,
    { addonId },
  );
  return mapAddon(rows[0]);
}

async function listCourts(operator) {
  const scope = branchScope(operator, 'c.branch_id');
  const rows = await query(
    `SELECT c.id, c.branch_id, c.code, c.name, c.status, b.name AS branch_name
     FROM courts c
     JOIN branches b ON b.id = c.branch_id
     WHERE 1 = 1 ${scope.sql}
     ORDER BY b.code, c.code`,
    scope.params,
  );
  return rows.map(mapCourt);
}

async function setCourtStatus({ courtId, operator, status, reason }) {
  let affectedBookings = [];
  await transaction(async (connection) => {
    const [rows] = await connection.execute(
      `SELECT id, branch_id, code, name, status
       FROM courts WHERE id = :courtId FOR UPDATE`,
      { courtId },
    );
    const court = rows[0];
    if (!court) {
      const error = new Error('Không tìm thấy sân.');
      error.status = 404;
      throw error;
    }

    assertBranchAccess(court, operator);
    await connection.execute(
      'UPDATE courts SET status = :status WHERE id = :courtId',
      { courtId, status },
    );

    if (status === 'maintenance') {
      const [bookingRows] = await connection.execute(
        `SELECT b.id, b.booking_code, b.booking_date, b.booking_status,
                u.full_name AS customer_name, u.phone AS customer_phone,
                MIN(bs.start_time) AS start_time, MAX(bs.end_time) AS end_time
         FROM bookings b
         JOIN users u ON u.id = b.customer_id
         LEFT JOIN booking_slots bs ON bs.booking_id = b.id
         WHERE b.court_id = :courtId
           AND b.booking_date >= CURDATE()
           AND b.booking_status IN ('pending', 'confirmed', 'checked_in')
         GROUP BY b.id
         ORDER BY b.booking_date, start_time`,
        { courtId },
      );
      affectedBookings = bookingRows.map((row) => ({
        id: row.id,
        bookingCode: row.booking_code,
        bookingDate: row.booking_date,
        bookingStatus: row.booking_status,
        customerName: row.customer_name,
        customerPhone: row.customer_phone,
        startTime: normalizeTime(row.start_time),
        endTime: normalizeTime(row.end_time),
      }));
    }

    await writeAudit(connection, {
      userId: operator.id,
      action: status === 'maintenance' ? 'STAFF_START_COURT_MAINTENANCE' : 'STAFF_END_COURT_MAINTENANCE',
      tableName: 'courts',
      recordId: courtId,
      oldData: { status: court.status },
      newData: { status, reason: String(reason || '').trim(), affectedBookingIds: affectedBookings.map((item) => item.id) },
    });
  });

  const courts = await listCourts(operator);
  return { court: courts.find((item) => Number(item.id) === Number(courtId)), affectedBookings };
}

module.exports = {
  cancelBooking,
  checkIn,
  checkOut,
  confirmBooking,
  listAddons,
  listCourts,
  listTodayBookings,
  markNoShow,
  recordCounterPayment,
  setCourtStatus,
  updateAddonStock,
};
