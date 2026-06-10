const crypto = require('crypto');
const { query } = require('../config/db');

const TABLE_NAME = 'password_reset_otps';
let ensureTablePromise = null;

function hashValue(value) {
  return crypto.createHash('sha256').update(String(value)).digest('hex');
}

function generateOtp() {
  return String(crypto.randomInt(0, 1000000)).padStart(6, '0');
}

function generateResetToken() {
  return crypto.randomBytes(32).toString('hex');
}

async function ensureTable() {
  if (!ensureTablePromise) {
    ensureTablePromise = query(`
      CREATE TABLE IF NOT EXISTS ${TABLE_NAME} (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        user_id BIGINT UNSIGNED NOT NULL,
        email VARCHAR(150) NOT NULL,
        otp_hash CHAR(64) NOT NULL,
        reset_token_hash CHAR(64) NULL,
        attempt_count TINYINT UNSIGNED NOT NULL DEFAULT 0,
        expires_at DATETIME NOT NULL,
        verified_at DATETIME NULL,
        used_at DATETIME NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        KEY idx_password_reset_email_status (email, expires_at, verified_at, used_at),
        CONSTRAINT fk_password_reset_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        CONSTRAINT chk_password_reset_attempts CHECK (attempt_count <= 10)
      ) ENGINE=InnoDB;
    `).catch((error) => {
      ensureTablePromise = null;
      throw error;
    });
  }

  return ensureTablePromise;
}

async function invalidateActiveByEmail(email) {
  await ensureTable();
  await query(
    `UPDATE ${TABLE_NAME}
     SET used_at = NOW()
     WHERE email = :email
       AND used_at IS NULL
       AND expires_at >= NOW()`,
    { email },
  );
}

async function createOtp({ userId, email, expiresAt }) {
  await ensureTable();
  const otp = generateOtp();

  const result = await query(
    `INSERT INTO ${TABLE_NAME} (user_id, email, otp_hash, expires_at)
     VALUES (:userId, :email, :otpHash, :expiresAt)`,
    {
      userId,
      email,
      otpHash: hashValue(otp),
      expiresAt,
    },
  );

  return {
    id: result.insertId,
    otp,
    expiresAt,
  };
}

async function findLatestByEmail(email) {
  await ensureTable();
  const rows = await query(
    `SELECT *
     FROM ${TABLE_NAME}
     WHERE email = :email
     ORDER BY created_at DESC
     LIMIT 1`,
    { email },
  );

  return rows[0] || null;
}

async function findLatestActiveByEmail(email) {
  await ensureTable();
  const rows = await query(
    `SELECT *
     FROM ${TABLE_NAME}
     WHERE email = :email
       AND used_at IS NULL
       AND expires_at >= NOW()
     ORDER BY created_at DESC
     LIMIT 1`,
    { email },
  );

  return rows[0] || null;
}

async function incrementAttempts(id) {
  await ensureTable();
  await query(
    `UPDATE ${TABLE_NAME}
     SET attempt_count = attempt_count + 1
     WHERE id = :id`,
    { id },
  );
}

async function markVerified(id, resetToken) {
  await ensureTable();
  await query(
    `UPDATE ${TABLE_NAME}
     SET verified_at = NOW(),
         reset_token_hash = :resetTokenHash
     WHERE id = :id`,
    {
      id,
      resetTokenHash: hashValue(resetToken),
    },
  );
}

async function findByResetToken(email, resetToken) {
  await ensureTable();
  const rows = await query(
    `SELECT *
     FROM ${TABLE_NAME}
     WHERE email = :email
       AND reset_token_hash = :resetTokenHash
     ORDER BY created_at DESC
     LIMIT 1`,
    {
      email,
      resetTokenHash: hashValue(resetToken),
    },
  );

  return rows[0] || null;
}

async function markUsed(id) {
  await ensureTable();
  await query(
    `UPDATE ${TABLE_NAME}
     SET used_at = NOW()
     WHERE id = :id`,
    { id },
  );
}

module.exports = {
  createOtp,
  ensureTable,
  findLatestActiveByEmail,
  findByResetToken,
  findLatestByEmail,
  generateResetToken,
  hashValue,
  incrementAttempts,
  invalidateActiveByEmail,
  markUsed,
  markVerified,
};
