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

function mapScheduleCourt(row) {
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    status: row.status,
    statusLabel: row.status_label,
    openTime: normalizeTime(row.open_time),
    closeTime: normalizeTime(row.close_time),
  };
}

function createTransactionCode() {
  return `PAY-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
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

function buildSlots(openTime = '05:00', closeTime = '22:00', slotMinutes = 60) {
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

function findOverlap(slot, items) {
  return items.find((item) => slot.startTime < item.endTime && slot.endTime > item.startTime);
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

async function listCourtSchedule(date) {
  const settingsRows = await query(
    `SELECT open_time, close_time, slot_minutes
     FROM settings
     ORDER BY id ASC
     LIMIT 1`,
  );
  const settings = settingsRows[0] || {};
  const defaultOpen = normalizeTime(settings.open_time) || '05:00';
  const defaultClose = normalizeTime(settings.close_time) || '22:00';
  const slotMinutes = Number(settings.slot_minutes || 60);

  const courtRows = await query(
    `SELECT
       c.id,
       c.code,
       c.name,
       c.status,
       CASE
         WHEN c.status = 'available' THEN 'Trống'
         WHEN c.status = 'maintenance' THEN 'Bảo trì'
         ELSE 'Tạm ngưng'
       END AS status_label,
       COALESCE(b.open_time, :defaultOpen) AS open_time,
       COALESCE(b.close_time, :defaultClose) AS close_time
     FROM courts c
     JOIN branches b ON b.id = c.branch_id
     ORDER BY b.code ASC, c.code ASC`,
    { defaultOpen, defaultClose },
  );
  const courts = courtRows.map(mapScheduleCourt);
  const timeSlots = buildSlots(defaultOpen, defaultClose, slotMinutes);

  const bookingRows = await query(
    `SELECT
       bs.court_id,
       bs.start_time,
       bs.end_time,
       b.booking_code,
       b.booking_status,
       u.full_name AS customer_name
     FROM booking_slots bs
     JOIN bookings b ON b.id = bs.booking_id
     JOIN users u ON u.id = b.customer_id
     WHERE bs.booking_date = :date
       AND b.booking_status IN ('pending', 'confirmed', 'checked_in')
     ORDER BY bs.court_id ASC, bs.start_time ASC`,
    { date },
  );

  const holdRows = await query(
    `SELECT court_id, start_time, end_time, hold_code
     FROM slot_holds
     WHERE booking_date = :date
       AND status = 'active'
       AND expires_at > NOW()
     ORDER BY court_id ASC, start_time ASC`,
    { date },
  );

  const bookingsByCourt = new Map();
  bookingRows.forEach((row) => {
    const courtId = Number(row.court_id);
    const items = bookingsByCourt.get(courtId) || [];
    items.push({
      startTime: normalizeTime(row.start_time),
      endTime: normalizeTime(row.end_time),
      bookingCode: row.booking_code,
      bookingStatus: row.booking_status,
      customerName: row.customer_name,
    });
    bookingsByCourt.set(courtId, items);
  });

  const holdsByCourt = new Map();
  holdRows.forEach((row) => {
    const courtId = Number(row.court_id);
    const items = holdsByCourt.get(courtId) || [];
    items.push({
      startTime: normalizeTime(row.start_time),
      endTime: normalizeTime(row.end_time),
      holdCode: row.hold_code,
    });
    holdsByCourt.set(courtId, items);
  });

  return {
    date,
    timeSlots,
    courts: courts.map((court) => {
      const courtOpen = court.openTime || defaultOpen;
      const courtClose = court.closeTime || defaultClose;
      const courtBookings = bookingsByCourt.get(Number(court.id)) || [];
      const courtHolds = holdsByCourt.get(Number(court.id)) || [];

      return {
        ...court,
        slots: timeSlots.map((slot) => {
          if (slot.startTime < courtOpen || slot.endTime > courtClose || court.status !== 'available') {
            return { ...slot, status: 'maintenance', label: court.statusLabel };
          }

          const booking = findOverlap(slot, courtBookings);
          if (booking) {
            return {
              ...slot,
              status: booking.bookingStatus === 'pending' ? 'hold' : 'booked',
              label: booking.bookingStatus === 'pending' ? 'Đang giữ' : 'Đã đặt',
              bookingCode: booking.bookingCode,
              customerName: booking.customerName,
            };
          }

          const hold = findOverlap(slot, courtHolds);
          if (hold) {
            return { ...slot, status: 'hold', label: 'Đang giữ', holdCode: hold.holdCode };
          }

          return { ...slot, status: 'available', label: 'Trống' };
        }),
      };
    }),
  };
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
      'SELECT id, booking_status, payment_status FROM bookings WHERE id = :bookingId FOR UPDATE',
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

    if (booking.payment_status !== 'paid') {
      const error = new Error('Vui long ghi nhan thanh toan tai quay truoc khi check-in.');
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

async function confirmBooking(bookingId, staffId) {
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

    if (booking.booking_status !== 'pending') {
      const error = new Error('Chi booking dang cho moi duoc xac nhan.');
      error.status = 400;
      throw error;
    }

    await connection.execute(
      `UPDATE bookings
       SET booking_status = 'confirmed', staff_id = :staffId
       WHERE id = :bookingId`,
      { bookingId, staffId },
    );
  });

  return findBooking(bookingId);
}

async function cancelBooking(bookingId, staffId, cancelReason = '') {
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

    if (['completed', 'cancelled', 'expired'].includes(booking.booking_status)) {
      const error = new Error('Booking nay khong the huy.');
      error.status = 400;
      throw error;
    }

    await connection.execute(
      `UPDATE bookings
       SET booking_status = 'cancelled',
           cancel_reason = :cancelReason,
           staff_id = :staffId
       WHERE id = :bookingId`,
      { bookingId, staffId, cancelReason: cancelReason || 'Cancelled by operator' },
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

    if (!['pending', 'confirmed', 'checked_in'].includes(booking.booking_status)) {
      const error = new Error('Chi co the ghi nhan thanh toan cho booking dang giu, da xac nhan hoac dang choi.');
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
  cancelBooking,
  confirmBooking,
  listAddons,
  listCourtSchedule,
  listTodayBookings,
  recordCounterPayment,
  updateAddonStock,
};
