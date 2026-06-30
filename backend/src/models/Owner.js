const { query, transaction } = require('../config/db');

function time(value) {
  return value ? String(value).slice(0, 5) : '';
}

async function getWorkspace(date) {
  const [schedules, priceRules, promotions, feedback, report, bookingStatuses, lowStock] = await Promise.all([
    query(`SELECT id, code, name, open_time, close_time, status FROM branches ORDER BY name`),
    query(`SELECT pr.*, c.code AS court_code, b.name AS branch_name
      FROM price_rules pr LEFT JOIN courts c ON c.id = pr.court_id LEFT JOIN branches b ON b.id = pr.branch_id
      ORDER BY pr.priority, pr.start_time`),
    query(`SELECT * FROM promotions ORDER BY start_date DESC`),
    query(`SELECT f.id, f.rating, f.content, f.status, f.created_at, u.full_name AS customer_name,
      b.booking_code, c.name AS court_name
      FROM feedback f JOIN users u ON u.id=f.customer_id JOIN bookings b ON b.id=f.booking_id
      JOIN courts c ON c.id=b.court_id ORDER BY f.created_at DESC`),
    query(`SELECT COUNT(*) AS total_bookings,
      COALESCE(SUM(CASE WHEN booking_status IN ('confirmed','checked_in','completed') THEN 1 ELSE 0 END),0) AS successful_bookings,
      COALESCE(SUM(CASE WHEN booking_status='cancelled' THEN 1 ELSE 0 END),0) AS cancelled_bookings,
      COALESCE(SUM(CASE WHEN payment_status='paid' THEN total_amount ELSE 0 END),0) AS revenue
      FROM bookings WHERE booking_date=:date`, { date }),
    query(`SELECT booking_status AS label, COUNT(*) AS value FROM bookings WHERE booking_date=:date GROUP BY booking_status`, { date }),
    query(`SELECT id, name, stock_quantity FROM addon_services WHERE stock_quantity <= 10 OR status <> 'active' ORDER BY stock_quantity`),
  ]);

  const pending = Number((bookingStatuses.find((item) => item.label === 'pending') || {}).value || 0);
  const newFeedback = feedback.filter((item) => ['new', 'flagged'].includes(item.status)).length;
  const notifications = [
    ...(pending ? [{ id: 'pending-bookings', type: 'booking', title: `${pending} đơn đặt sân đang chờ xác nhận`, detail: `Dữ liệu ngày ${date}` }] : []),
    ...(newFeedback ? [{ id: 'new-feedback', type: 'feedback', title: `${newFeedback} phản hồi cần xử lý`, detail: 'Ưu tiên các đánh giá thấp' }] : []),
    ...lowStock.map((item) => ({ id: `stock-${item.id}`, type: 'stock', title: `${item.name} sắp hết`, detail: `Còn ${item.stock_quantity} sản phẩm` })),
  ];

  return {
    schedules: schedules.map((item) => ({ ...item, open_time: time(item.open_time), close_time: time(item.close_time) })),
    priceRules: priceRules.map((item) => ({ ...item, start_time: time(item.start_time), end_time: time(item.end_time) })),
    promotions,
    feedback,
    report: report[0] || {},
    bookingStatuses,
    notifications,
  };
}

async function updateSchedule(id, data) {
  await query(`UPDATE branches SET open_time=:openTime, close_time=:closeTime, status=:status WHERE id=:id`, { id, ...data });
}

async function createPriceRule(data) {
  await query(`INSERT INTO price_rules (branch_id,court_id,name,day_of_week,start_time,end_time,price_per_slot,priority,is_active)
    VALUES (:branchId,:courtId,:name,:dayOfWeek,:startTime,:endTime,:pricePerSlot,:priority,:isActive)`, data);
}

async function updatePriceRule(id, data) {
  await query(`UPDATE price_rules SET name=:name,day_of_week=:dayOfWeek,start_time=:startTime,end_time=:endTime,
    price_per_slot=:pricePerSlot,priority=:priority,is_active=:isActive WHERE id=:id`, { id, ...data });
}

async function deletePriceRule(id) { await query('DELETE FROM price_rules WHERE id=:id', { id }); }

async function createPromotion(data) {
  await query(`INSERT INTO promotions (code,name,description,discount_type,discount_value,max_discount_amount,min_order_amount,start_date,end_date,usage_limit,is_active)
    VALUES (:code,:name,:description,:discountType,:discountValue,:maxDiscountAmount,:minOrderAmount,:startDate,:endDate,:usageLimit,:isActive)`, data);
}

async function updatePromotion(id, data) {
  await query(`UPDATE promotions SET name=:name,description=:description,discount_type=:discountType,discount_value=:discountValue,
    max_discount_amount=:maxDiscountAmount,min_order_amount=:minOrderAmount,start_date=:startDate,end_date=:endDate,
    usage_limit=:usageLimit,is_active=:isActive WHERE id=:id`, { id, ...data });
}

async function deletePromotion(id) { await query('DELETE FROM promotions WHERE id=:id AND used_count=0', { id }); }

async function updateFeedback(id, status, userId) {
  await query('UPDATE feedback SET status=:status, handled_by=:userId, handled_at=NOW() WHERE id=:id', { id, status, userId });
}

async function rescheduleBooking(id, bookingDate, startTime, endTime) {
  await transaction(async (connection) => {
    const [rows] = await connection.execute('SELECT id, booking_status FROM bookings WHERE id=:id FOR UPDATE', { id });
    if (!rows[0] || ['completed', 'cancelled', 'expired'].includes(rows[0].booking_status)) throw new Error('Đơn đặt sân không thể chỉnh sửa.');
    await connection.execute('UPDATE bookings SET booking_date=:bookingDate WHERE id=:id', { id, bookingDate });
    await connection.execute(`UPDATE booking_slots SET booking_date=:bookingDate, start_time=:startTime, end_time=:endTime WHERE booking_id=:id`, { id, bookingDate, startTime, endTime });
  });
}

async function createService(data) {
  await query(`INSERT INTO addon_services (category_id,code,name,service_type,unit_price,stock_quantity,status)
    VALUES ((SELECT id FROM categories ORDER BY id LIMIT 1),:code,:name,:serviceType,:unitPrice,:stockQuantity,:status)`, data);
}
async function updateService(id, data) { await query(`UPDATE addon_services SET name=:name,service_type=:serviceType,unit_price=:unitPrice,stock_quantity=:stockQuantity,status=:status WHERE id=:id`, { id, ...data }); }
async function deleteService(id) { await query('DELETE FROM addon_services WHERE id=:id', { id }); }

module.exports = { createPriceRule, createPromotion, createService, deletePriceRule, deletePromotion, deleteService, getWorkspace, rescheduleBooking, updateFeedback, updatePriceRule, updatePromotion, updateSchedule, updateService };
