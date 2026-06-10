const User = require('../models/User');
const PasswordResetOtp = require('../models/PasswordResetOtp');
const { storePassword, verifyPassword } = require('../utils/password');
const { createToken } = require('../utils/token');
const { sendMail } = require('../utils/mailer');
const { verifyGoogleCredential } = require('../utils/googleAuth');

const OTP_EXPIRES_MINUTES = Number(process.env.PASSWORD_RESET_OTP_EXPIRES_MINUTES || 10);
const MAX_OTP_ATTEMPTS = Number(process.env.PASSWORD_RESET_OTP_MAX_ATTEMPTS || 5);
const OTP_RESEND_COOLDOWN_SECONDS = Number(process.env.PASSWORD_RESET_OTP_RESEND_COOLDOWN_SECONDS || 60);

function sendError(res, status, message) {
  return res.status(status).json({ success: false, message });
}

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

function isGmail(email) {
  return email.endsWith('@gmail.com');
}

function isDisabledStatus(status) {
  return ['Blocked', 'Inactive', 'Unverified'].includes(status);
}

function buildFallbackName(email) {
  return email.split('@')[0] || 'Google User';
}

function buildOtpEmail(fullName, otp, email) {
  const greetingName = fullName || email;
  return {
    subject: 'Ma OTP dat lai mat khau Pickleball Booking System',
    text: [
      `Xin chao ${greetingName},`,
      '',
      `Ma OTP cua ban la: ${otp}`,
      `Ma co hieu luc trong ${OTP_EXPIRES_MINUTES} phut.`,
      'Neu ban khong yeu cau dat lai mat khau, vui long bo qua email nay.',
    ].join('\n'),
    html: `
      <div style="font-family: Arial, sans-serif; color: #111111; line-height: 1.6;">
        <h2>Dat lai mat khau</h2>
        <p>Xin chao <strong>${greetingName}</strong>,</p>
        <p>Ma OTP cua ban la:</p>
        <p style="font-size: 28px; font-weight: 700; letter-spacing: 6px;">${otp}</p>
        <p>Ma co hieu luc trong <strong>${OTP_EXPIRES_MINUTES} phut</strong>.</p>
        <p>Neu ban khong yeu cau dat lai mat khau, vui long bo qua email nay.</p>
      </div>
    `,
  };
}

function getOtpCooldownRemainingSeconds(otpRecord) {
  if (!otpRecord?.created_at) {
    return 0;
  }

  const createdAt = new Date(otpRecord.created_at).getTime();
  const allowedAt = createdAt + OTP_RESEND_COOLDOWN_SECONDS * 1000;
  return Math.max(0, Math.ceil((allowedAt - Date.now()) / 1000));
}

function canUse(req, res, roles) {
  if (!roles.includes(req.user.role)) {
    sendError(res, 403, 'Ban khong co quyen thuc hien thao tac nay.');
    return false;
  }

  return true;
}

function buildAuthResponse(user) {
  return {
    success: true,
    token: createToken(user),
    user: User.toSafeObject(user),
  };
}

function manageableRolesFor(userRole) {
  if (userRole === 'Admin') {
    return ['Customer', 'Owner', 'Staff'];
  }

  if (userRole === 'Owner') {
    return ['Customer', 'Staff'];
  }

  return [];
}

async function register(req, res) {
  try {
    const { fullName, email, phone, password } = req.body;
    const cleanEmail = normalizeEmail(email);

    if (!fullName || !cleanEmail || !phone || !password) {
      return sendError(res, 400, 'Vui long nhap day du ho ten, email, so dien thoai va mat khau.');
    }

    if (!isGmail(cleanEmail)) {
      return sendError(res, 400, 'Email phai co duoi @gmail.com.');
    }

    if (String(password).length < 6) {
      return sendError(res, 400, 'Mat khau phai co it nhat 6 ky tu.');
    }

    const existed = await User.findByEmail(cleanEmail);
    if (existed) {
      return sendError(res, 409, 'Email da duoc su dung. Vui long dang nhap.');
    }

    const user = await User.create({
      fullName: String(fullName).trim(),
      email: cleanEmail,
      phone: String(phone).trim(),
      password: storePassword(password),
      role: 'Customer',
      status: 'Active',
    });

    return res.status(201).json(buildAuthResponse(user));
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return sendError(res, 409, 'Email da duoc su dung. Vui long dung email khac.');
    }

    console.error('Register error:', error);
    return sendError(res, 500, 'Loi may chu khi dang ky. Vui long thu lai.');
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;
    const cleanEmail = normalizeEmail(email);

    if (!cleanEmail || !password) {
      return sendError(res, 400, 'Vui long nhap email va mat khau.');
    }

    const user = await User.findByEmail(cleanEmail);
    if (user && !user.password) {
      return sendError(res, 400, 'Tai khoan nay chua co mat khau. Vui long dang nhap bang Google hoac dat lai mat khau qua OTP.');
    }

    if (!user || !verifyPassword(password, user.password)) {
      return sendError(res, 401, 'Email hoac mat khau khong dung.');
    }

    if (isDisabledStatus(user.status)) {
      return sendError(res, 403, 'Tai khoan hien khong the dang nhap.');
    }

    const updatedUser = await User.updateLastLogin(user.id);
    return res.json(buildAuthResponse(updatedUser));
  } catch (error) {
    console.error('Login error:', error);
    return sendError(res, 500, 'Loi may chu khi dang nhap. Vui long thu lai.');
  }
}

async function googleLogin(req, res) {
  try {
    const { credential } = req.body;
    const payload = await verifyGoogleCredential(credential);
    const cleanEmail = normalizeEmail(payload.email);

    if (!payload.email_verified) {
      return sendError(res, 403, 'Tai khoan Google nay chua xac minh email.');
    }

    if (!isGmail(cleanEmail)) {
      return sendError(res, 400, 'Chi ho tro dang nhap bang tai khoan Gmail.');
    }

    let user = await User.findByEmail(cleanEmail);
    if (!user) {
      user = await User.create({
        fullName: String(payload.name || buildFallbackName(cleanEmail)).trim(),
        email: cleanEmail,
        phone: '',
        password: `google-${payload.sub}`,
        role: 'Customer',
        status: 'Active',
        emailVerifiedAt: new Date(),
      });
    }

    if (isDisabledStatus(user.status)) {
      return sendError(res, 403, 'Tai khoan hien khong the dang nhap.');
    }

    const updatedUser = await User.updateLastLogin(user.id);
    return res.json(buildAuthResponse(updatedUser));
  } catch (error) {
    console.error('Google login error:', error);
    return sendError(res, 500, error.message || 'Loi may chu khi dang nhap Google.');
  }
}

async function requestPasswordResetOtp(req, res) {
  try {
    const { email } = req.body;
    const cleanEmail = normalizeEmail(email);

    if (!cleanEmail) {
      return sendError(res, 400, 'Vui long nhap email da dang ky.');
    }

    if (!isGmail(cleanEmail)) {
      return sendError(res, 400, 'Email phai co duoi @gmail.com.');
    }

    const user = await User.findByEmail(cleanEmail);
    if (!user) {
      return sendError(res, 404, 'Khong tim thay tai khoan voi email nay.');
    }

    if (isDisabledStatus(user.status)) {
      return sendError(res, 403, 'Tai khoan hien khong the dat lai mat khau.');
    }

    const latestActiveOtp = await PasswordResetOtp.findLatestActiveByEmail(cleanEmail);
    const cooldownRemainingSeconds = getOtpCooldownRemainingSeconds(latestActiveOtp);
    if (cooldownRemainingSeconds > 0) {
      return res.status(429).json({
        success: false,
        message: `Vui long cho ${cooldownRemainingSeconds} giay truoc khi gui lai OTP.`,
        retryAfterSeconds: cooldownRemainingSeconds,
      });
    }

    await PasswordResetOtp.invalidateActiveByEmail(cleanEmail);
    const expiresAt = new Date(Date.now() + OTP_EXPIRES_MINUTES * 60 * 1000);
    const otpRecord = await PasswordResetOtp.createOtp({
      userId: user.id,
      email: cleanEmail,
      expiresAt,
    });
    const mailContent = buildOtpEmail(user.fullName, otpRecord.otp, cleanEmail);

    try {
      await sendMail({
        to: cleanEmail,
        ...mailContent,
      });
    } catch (mailError) {
      await PasswordResetOtp.markUsed(otpRecord.id);
      throw mailError;
    }

    return res.json({
      success: true,
      message: `Ma OTP da duoc gui toi ${cleanEmail}. Vui long kiem tra email.`,
    });
  } catch (error) {
    console.error('Request password reset OTP error:', error);
    return sendError(res, 500, error.message || 'Khong the gui OTP. Vui long thu lai.');
  }
}

async function verifyPasswordResetOtp(req, res) {
  try {
    const { email, otp } = req.body;
    const cleanEmail = normalizeEmail(email);
    const cleanOtp = String(otp || '').trim();

    if (!cleanEmail || !cleanOtp) {
      return sendError(res, 400, 'Vui long nhap email va ma OTP.');
    }

    const otpRecord = await PasswordResetOtp.findLatestByEmail(cleanEmail);
    if (!otpRecord || otpRecord.used_at) {
      return sendError(res, 400, 'Khong tim thay yeu cau OTP hop le. Vui long gui lai ma moi.');
    }

    if (otpRecord.verified_at) {
      return sendError(res, 400, 'Ma OTP nay da duoc xac nhan. Vui long tiep tuc doi mat khau.');
    }

    if (new Date(otpRecord.expires_at).getTime() < Date.now()) {
      return sendError(res, 400, 'Ma OTP da het han. Vui long yeu cau ma moi.');
    }

    if (Number(otpRecord.attempt_count) >= MAX_OTP_ATTEMPTS) {
      return sendError(res, 400, 'Ban da nhap sai OTP qua nhieu lan. Vui long gui lai ma moi.');
    }

    if (PasswordResetOtp.hashValue(cleanOtp) !== otpRecord.otp_hash) {
      await PasswordResetOtp.incrementAttempts(otpRecord.id);
      return sendError(res, 400, 'Ma OTP khong dung.');
    }

    const resetToken = PasswordResetOtp.generateResetToken();
    await PasswordResetOtp.markVerified(otpRecord.id, resetToken);

    return res.json({
      success: true,
      message: 'Xac minh OTP thanh cong. Ban co the dat mat khau moi.',
      resetToken,
    });
  } catch (error) {
    console.error('Verify password reset OTP error:', error);
    return sendError(res, 500, 'Loi may chu khi xac minh OTP. Vui long thu lai.');
  }
}

async function resetPasswordWithOtp(req, res) {
  try {
    const { email, password, resetToken } = req.body;
    const cleanEmail = normalizeEmail(email);

    if (!cleanEmail || !password || !resetToken) {
      return sendError(res, 400, 'Vui long nhap email, mat khau moi va token dat lai hop le.');
    }

    if (!isGmail(cleanEmail)) {
      return sendError(res, 400, 'Email phai co duoi @gmail.com.');
    }

    if (String(password).length < 6) {
      return sendError(res, 400, 'Mat khau moi phai co it nhat 6 ky tu.');
    }

    const otpRecord = await PasswordResetOtp.findByResetToken(cleanEmail, resetToken);
    if (!otpRecord || otpRecord.used_at || !otpRecord.verified_at) {
      return sendError(res, 400, 'Phien dat lai mat khau khong hop le.');
    }

    if (new Date(otpRecord.expires_at).getTime() < Date.now()) {
      return sendError(res, 400, 'Phien dat lai mat khau da het han. Vui long yeu cau OTP moi.');
    }

    const user = await User.findById(otpRecord.user_id);
    if (!user) {
      return sendError(res, 404, 'Khong tim thay tai khoan can cap nhat mat khau.');
    }

    await User.updatePassword(user.id, storePassword(password));
    await PasswordResetOtp.markUsed(otpRecord.id);

    return res.json({
      success: true,
      message: 'Mat khau da duoc dat lai. Vui long dang nhap lai.',
    });
  } catch (error) {
    console.error('Reset password with OTP error:', error);
    return sendError(res, 500, 'Loi may chu khi dat lai mat khau. Vui long thu lai.');
  }
}

function getPlainPassword(req, res) {
  try {
    const { password } = req.body;
    return res.json({ success: true, password: storePassword(password) });
  } catch (error) {
    return sendError(res, 400, error.message);
  }
}

function me(req, res) {
  return res.json({ success: true, user: User.toSafeObject(req.user) });
}

async function updateMe(req, res) {
  try {
    const { fullName, email, phone } = req.body;
    const avatarUrl = Object.prototype.hasOwnProperty.call(req.body, 'avatarUrl')
      ? req.body.avatarUrl
      : req.user.avatarUrl;
    const cleanEmail = normalizeEmail(email);

    if (!fullName || !cleanEmail || !phone) {
      return sendError(res, 400, 'Vui long nhap day du ho ten, email va so dien thoai.');
    }

    if (!isGmail(cleanEmail)) {
      return sendError(res, 400, 'Email phai co duoi @gmail.com.');
    }

    const existed = await User.findByEmail(cleanEmail);
    if (existed && Number(existed.id) !== Number(req.user.id)) {
      return sendError(res, 409, 'Email da duoc su dung boi tai khoan khac.');
    }

    const user = await User.updateProfile(req.user.id, {
      fullName: String(fullName).trim(),
      email: cleanEmail,
      phone: String(phone).trim(),
      avatarUrl: avatarUrl ? String(avatarUrl) : null,
    });

    return res.json({ success: true, user: User.toSafeObject(user) });
  } catch (error) {
    console.error('Update profile error:', error);
    return sendError(res, 500, 'Loi may chu khi cap nhat ho so. Vui long thu lai.');
  }
}

async function listManagedAccounts(req, res) {
  try {
    if (!canUse(req, res, ['Admin', 'Owner'])) {
      return null;
    }

    const managedRoles = manageableRolesFor(req.user.role);
    const users = await User.listByRoles(managedRoles);
    const banned = await User.listBanned();
    const byRole = managedRoles.reduce((groups, role) => {
      groups[role] = users
        .filter((user) => user.role === role)
        .map(User.toSafeObject);
      return groups;
    }, {});

    return res.json({
      success: true,
      accounts: {
        banned: banned.map(User.toSafeObject),
        byRole,
      },
    });
  } catch (error) {
    console.error('List accounts error:', error);
    return sendError(res, 500, 'Loi may chu khi tai danh sach tai khoan.');
  }
}

async function createManagedAccount(req, res) {
  try {
    if (!canUse(req, res, ['Admin', 'Owner'])) {
      return null;
    }

    const managedRoles = manageableRolesFor(req.user.role);
    const role = managedRoles.includes(req.body?.role) ? req.body.role : 'Staff';
    if (!managedRoles.includes(role)) {
      return sendError(res, 403, 'Ban khong co quyen tao vai tro nay.');
    }

    const fullName = String(req.body?.fullName || '').trim();
    const cleanEmail = normalizeEmail(req.body?.email);
    const phone = String(req.body?.phone || '').trim();
    const password = String(req.body?.password || '123456');

    if (!fullName || !cleanEmail || !phone || !password) {
      return sendError(res, 400, 'Vui long nhap day du ho ten, email, so dien thoai va mat khau.');
    }

    if (!isGmail(cleanEmail)) {
      return sendError(res, 400, 'Email phai co duoi @gmail.com.');
    }

    if (password.length < 6) {
      return sendError(res, 400, 'Mat khau phai co it nhat 6 ky tu.');
    }

    const existed = await User.findByEmail(cleanEmail);
    if (existed) {
      return sendError(res, 409, 'Email da duoc su dung.');
    }

    const user = await User.create({
      fullName,
      email: cleanEmail,
      phone,
      password: storePassword(password),
      avatarUrl: req.body?.avatarUrl ? String(req.body.avatarUrl) : null,
      role,
      status: 'Active',
    });

    return res.status(201).json({ success: true, user: User.toSafeObject(user) });
  } catch (error) {
    console.error('Create managed account error:', error);
    return sendError(res, 500, 'Loi may chu khi tao tai khoan.');
  }
}

async function updateManagedAccountStatus(req, res) {
  try {
    if (!canUse(req, res, ['Admin', 'Owner'])) {
      return null;
    }

    const user = await User.findById(req.params.id);
    const managedRoles = manageableRolesFor(req.user.role);
    if (!user || !managedRoles.includes(user.role)) {
      return sendError(res, 404, 'Khong tim thay tai khoan duoc phep quan ly.');
    }

    const status = req.body?.status === 'Active' ? 'Active' : 'Blocked';
    const updatedUser = await User.updateStatus(user.id, status);
    return res.json({ success: true, user: User.toSafeObject(updatedUser) });
  } catch (error) {
    console.error('Update managed account status error:', error);
    return sendError(res, 500, 'Loi may chu khi cap nhat trang thai tai khoan.');
  }
}

async function deleteManagedAccount(req, res) {
  try {
    if (!canUse(req, res, ['Admin', 'Owner'])) {
      return null;
    }

    const user = await User.findById(req.params.id);
    const managedRoles = manageableRolesFor(req.user.role);
    if (!user || !managedRoles.includes(user.role)) {
      return sendError(res, 404, 'Khong tim thay tai khoan duoc phep quan ly.');
    }

    await User.removeByRoles(user.id, managedRoles);
    return res.json({ success: true, message: 'Tai khoan da duoc xoa.' });
  } catch (error) {
    console.error('Delete managed account error:', error);
    return sendError(res, 500, 'Loi may chu khi xoa tai khoan.');
  }
}

module.exports = {
  createManagedAccount,
  deleteManagedAccount,
  getPlainPassword,
  googleLogin,
  listManagedAccounts,
  login,
  me,
  register,
  requestPasswordResetOtp,
  resetPasswordWithOtp,
  updateManagedAccountStatus,
  updateMe,
  verifyPasswordResetOtp,
};
