const nodemailer = require('nodemailer');

let transporterPromise = null;

function readBool(value, fallback = false) {
  if (value == null || value === '') {
    return fallback;
  }

  return String(value).toLowerCase() === 'true';
}

async function createTransporter() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const secure = readBool(process.env.SMTP_SECURE, port === 465);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const service = process.env.SMTP_SERVICE;

  if (!user || !pass) {
    throw new Error('Chua cau hinh SMTP_USER va SMTP_PASS de gui email OTP.');
  }

  const transportConfig = service
    ? {
        service,
        auth: { user, pass },
      }
    : {
        host: host || 'smtp.gmail.com',
        port,
        secure,
        auth: { user, pass },
      };

  const transporter = nodemailer.createTransport(transportConfig);
  await transporter.verify();
  return transporter;
}

async function getTransporter() {
  if (!transporterPromise) {
    transporterPromise = createTransporter().catch((error) => {
      transporterPromise = null;
      throw error;
    });
  }

  return transporterPromise;
}

async function sendMail({ to, subject, text, html }) {
  const transporter = await getTransporter();
  const from = process.env.SMTP_FROM || process.env.SMTP_USER;

  return transporter.sendMail({
    from,
    to,
    subject,
    text,
    html,
  });
}

module.exports = {
  sendMail,
};
