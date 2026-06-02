function normalizePassword(password) {
  return String(password || '');
}

function storePassword(password) {
  const plainPassword = normalizePassword(password);

  if (plainPassword.length < 6) {
    throw new Error('Password must contain at least 6 characters.');
  }

  return plainPassword;
}

function verifyPassword(password, storedPassword) {
  return normalizePassword(password) === normalizePassword(storedPassword);
}

module.exports = {
  storePassword,
  verifyPassword,
};
