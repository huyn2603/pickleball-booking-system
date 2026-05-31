const crypto = require('crypto');

const HASH_PREFIX = 'scrypt';
const KEY_LENGTH = 64;

function hashPassword(password) {
  if (!password || password.length < 6) {
    throw new Error('Password must contain at least 6 characters.');
  }

  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, KEY_LENGTH).toString('hex');
  return `${HASH_PREFIX}$${salt}$${hash}`;
}

function verifyPassword(password, passwordHash) {
  if (!password || !passwordHash) {
    return false;
  }

  const [prefix, salt, storedHash] = passwordHash.split('$');
  if (prefix !== HASH_PREFIX || !salt || !storedHash) {
    return false;
  }

  const hashBuffer = crypto.scryptSync(password, salt, KEY_LENGTH);
  const storedBuffer = Buffer.from(storedHash, 'hex');

  if (hashBuffer.length !== storedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(hashBuffer, storedBuffer);
}

module.exports = {
  hashPassword,
  verifyPassword,
};
