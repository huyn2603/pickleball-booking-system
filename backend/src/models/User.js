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
    u.status,
    u.email_verified_at,
    u.last_login_at,
    u.created_at,
    u.updated_at,
    r.code AS role_code
  FROM users u
  JOIN roles r ON r.id = u.role_id
`;

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
  role = 'Customer',
  status = 'Active',
  emailVerifiedAt = null,
}) {
  const roleId = await getRoleIdByCode(role);
  if (!roleId) {
    throw new Error(`Role does not exist: ${role}`);
  }

  const result = await query(
    `INSERT INTO users (full_name, email, phone, password, role_id, status, email_verified_at)
     VALUES (:fullName, :email, :phone, :password, :roleId, :status, :emailVerifiedAt)`,
    {
      fullName,
      email,
      phone,
      password,
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

async function updateProfile(id, { fullName, email, phone }) {
  await query(
    `UPDATE users
     SET full_name = :fullName, email = :email, phone = :phone
     WHERE id = :id`,
    { id, fullName, email, phone },
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
  const rows = await query(
    `${baseSelect}
     WHERE r.code IN (:roles)
     ORDER BY u.created_at DESC`,
    { roles },
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
  await query(
    `DELETE u FROM users u
     JOIN roles r ON r.id = u.role_id
     WHERE u.id = :id AND r.code IN (:roles)`,
    { id, roles },
  );
}

module.exports = {
  create,
  findByEmail,
  findById,
  listBanned,
  listByRoles,
  removeByRoles,
  toSafeObject,
  updateLastLogin,
  updatePassword,
  updateProfile,
  updateStatus,
};
