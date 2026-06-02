const crypto = require('crypto');

const DEFAULT_EXPIRES_IN_SECONDS = 60 * 60 * 24;

function base64UrlEncode(value) {
  return Buffer.from(JSON.stringify(value)).toString('base64url');
}

function signPayload(payload) {
  const secret = process.env.AUTH_TOKEN_SECRET || 'dev-auth-secret';
  return crypto.createHmac('sha256', secret).update(payload).digest('base64url');
}

function createToken(user) {
  const header = base64UrlEncode({ alg: 'HS256', typ: 'JWT' });
  const now = Math.floor(Date.now() / 1000);
  const payload = base64UrlEncode({
    sub: String(user.id),
    email: user.email,
    role: user.role,
    iat: now,
    exp: now + DEFAULT_EXPIRES_IN_SECONDS,
  });
  const signature = signPayload(`${header}.${payload}`);

  return `${header}.${payload}.${signature}`;
}

function verifyToken(token) {
  if (!token) {
    return null;
  }

  const [header, payload, signature] = token.split('.');
  if (!header || !payload || !signature) {
    return null;
  }

  const expectedSignature = signPayload(`${header}.${payload}`);
  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (
    signatureBuffer.length !== expectedBuffer.length ||
    !crypto.timingSafeEqual(signatureBuffer, expectedBuffer)
  ) {
    return null;
  }

  const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
  if (decoded.exp && decoded.exp < Math.floor(Date.now() / 1000)) {
    return null;
  }

  return decoded;
}

module.exports = {
  createToken,
  verifyToken,
};
