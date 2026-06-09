const { OAuth2Client } = require('google-auth-library');

let cachedClient = null;

function getGoogleClientId() {
  return process.env.GOOGLE_CLIENT_ID || '';
}

function getClient() {
  const clientId = getGoogleClientId();
  if (!clientId) {
    throw new Error('Chua cau hinh GOOGLE_CLIENT_ID cho dang nhap Google.');
  }

  if (!cachedClient) {
    cachedClient = new OAuth2Client(clientId);
  }

  return cachedClient;
}

async function verifyGoogleCredential(credential) {
  if (!credential) {
    throw new Error('Thieu Google credential.');
  }

  const clientId = getGoogleClientId();
  const client = getClient();
  const ticket = await client.verifyIdToken({
    idToken: credential,
    audience: clientId,
  });

  const payload = ticket.getPayload();
  if (!payload?.email) {
    throw new Error('Khong lay duoc email tu Google.');
  }

  return payload;
}

module.exports = {
  getGoogleClientId,
  verifyGoogleCredential,
};
