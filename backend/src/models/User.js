const { query } = require('../config/db');

function mapUser(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    fullName: row.full_name,
    email: row.email,
    phone: row.phone,
    password: row.password,
    avatarUrl: row.avatar_url,
    branchId: row.branch_id,
    branchCode: row.branch_code,
    branchName: row.branch_name,
    role: row.role_code,
    status: row.status,
    emailVerifiedAt: row.email_verified_at,
    lastLoginAt: row.last_login_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toSafeObject(user) {
  if (!user) {
    return null;
  }

  const { password, ...safeUser } = user;
  return safeUser;
}

const baseSelect = `
  SELECT
    u.id,
    u.full_name,
    u.email,
    u.phone,
    u.password,
    u.avatar_url,
    u.branch_id,
    u.status,
    u.email_verified_at,
    u.last_login_at,
    u.created_at,
    u.updated_at,
    r.code AS role_code,
    b.code AS branch_code,
    b.name AS branch_name
  FROM users u
  JOIN roles r ON r.id = u.role_id
  LEFT JOIN branches b ON b.id = u.branch_id
`;

function buildRoleFilter(roles) {
  const safeRoles = Array.isArray(roles) ? roles.filter(Boolean) : [];
  const params = {};
  const placeholders = safeRoles.map((role, index) => {
    const key = `role${index}`;
    params[key] = role;
    return `:${key}`;
  });

  return {
    params,
    sql: placeholders.length ? placeholders.join(', ') : "''",
  };
}

async function findByEmail(email) {
  const rows = await query(
    `${baseSelect}
     WHERE u.email = :email
     LIMIT 1`,
    { email },
  );

  return mapUser(rows[0]);
}

async function findById(id) {
  const rows = await query(
    `${baseSelect}
     WHERE u.id = :id
     LIMIT 1`,
    { id },
  );

  return mapUser(rows[0]);
}

async function getRoleIdByCode(code) {
  const rows = await query(
    'SELECT id FROM roles WHERE code = :code LIMIT 1',
    { code },
  );

  return rows[0]?.id || null;
}


async function create({
  fullName,
  email,
  phone = '',
  password,
  avatarUrl = null,
  branchId = null,
  role = 'Customer',
  status = 'Active',
  emailVerifiedAt = null,
}) {
  const roleId = await getRoleIdByCode(role);
  if (!roleId) {
    throw new Error(`Role does not exist: ${role}`);
  }

  const result = await query(
    `INSERT INTO users (
      full_name,
      email,
      phone,
      password,
      avatar_url,
      branch_id,
      role_id,
      status,
      email_verified_at
    )
    VALUES (
      :fullName,
      :email,
      :phone,
      :password,
      :avatarUrl,
      :branchId,
      :roleId,
      :status,
      :emailVerifiedAt
    )`,
    {
      fullName,
      email,
      phone,
      password,
      avatarUrl,
      branchId,
      roleId,
      status,
      emailVerifiedAt,
    },
  );

  return findById(result.insertId);
}

async function updateLastLogin(id) {
  await query(
    'UPDATE users SET last_login_at = NOW() WHERE id = :id',
    { id },
  );

  return findById(id);
}

async function updatePassword(id, password) {
  await query(
    'UPDATE users SET password = :password WHERE id = :id',
    { id, password },
  );

  return findById(id);
}

async function updateProfile(id, { fullName, email, phone, avatarUrl = null }) {
  await query(
    `UPDATE users
     SET full_name = :fullName, email = :email, phone = :phone, avatar_url = :avatarUrl
     WHERE id = :id`,
    { id, fullName, email, phone, avatarUrl },
  );

  return findById(id);
}

async function updateManagedAccount(id, { fullName, email, phone, branchId = null, status = 'Active' }) {
  await query(
    `UPDATE users
     SET full_name = :fullName,
         email = :email,
         phone = :phone,
         branch_id = :branchId,
         status = :status
     WHERE id = :id`,
    { id, fullName, email, phone, branchId, status },
  );

  return findById(id);
}

async function updateStatus(id, status) {
  await query(
    'UPDATE users SET status = :status WHERE id = :id',
    { id, status },
  );

  return findById(id);
}

async function listByRoles(roles) {
  const roleFilter = buildRoleFilter(roles);
  const rows = await query(
    `${baseSelect}
     WHERE r.code IN (${roleFilter.sql})
     ORDER BY u.created_at DESC`,
    roleFilter.params,
  );

  return rows.map(mapUser);
}

async function listBanned() {
  const rows = await query(
    `${baseSelect}
     WHERE u.status = "Blocked"
     ORDER BY u.updated_at DESC`,
  );

  return rows.map(mapUser);
}

async function removeByRoles(id, roles) {
  const roleFilter = buildRoleFilter(roles);
  await query(
    `DELETE u FROM users u
     JOIN roles r ON r.id = u.role_id
     WHERE u.id = :id AND r.code IN (${roleFilter.sql})`,
    { id, ...roleFilter.params },
  );
}

async function listBookingHistory(id) {
  const rows = await query(
    `SELECT
       b.id,
       b.booking_code,
       b.booking_date,
       b.total_amount,
       b.payment_status,
       b.booking_status,
       c.code AS court_code,
       c.name AS court_name,
       MIN(bs.start_time) AS start_time,
       MAX(bs.end_time) AS end_time
     FROM bookings b
     JOIN courts c ON c.id = b.court_id
     LEFT JOIN booking_slots bs ON bs.booking_id = b.id
     WHERE b.customer_id = :id
     GROUP BY b.id
     ORDER BY b.booking_date DESC, b.created_at DESC`,
    { id },
  );

  return rows.map((row) => ({
    id: row.id,
    bookingCode: row.booking_code,
    bookingDate: row.booking_date,
    courtCode: row.court_code,
    courtName: row.court_name,
    startTime: row.start_time ? String(row.start_time).slice(0, 5) : '',
    endTime: row.end_time ? String(row.end_time).slice(0, 5) : '',
    totalAmount: row.total_amount,
    paymentStatus: row.payment_status,
    bookingStatus: row.booking_status,
  }));
}

module.exports = {
  create,
  findByEmail,
  findById,
  listBookingHistory,
  listBanned,
  listByRoles,
  removeByRoles,
  toSafeObject,
  updateLastLogin,
  updateManagedAccount,
  updatePassword,
  updateProfile,
  updateStatus,
};
