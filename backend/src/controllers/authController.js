const User = require('../models/User');
const { hashPassword, verifyPassword } = require('../utils/password');
const { createToken } = require('../utils/token');

function sendError(res, status, message) {
  return res.status(status).json({ success: false, message });
}

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

function buildAuthResponse(user) {
  return {
    success: true,
    token: createToken(user),
    user: user.toSafeObject(),
  };
}

async function register(req, res) {
  try {
    const { fullName, email, phone, password } = req.body;
    const cleanEmail = normalizeEmail(email);

    if (!fullName || !cleanEmail || !phone || !password) {
      return sendError(res, 400, 'Vui lòng nhập đầy đủ họ tên, email, số điện thoại và mật khẩu.');
    }

    if (String(password).length < 6) {
      return sendError(res, 400, 'Mật khẩu phải có ít nhất 6 ký tự.');
    }

    const existed = await User.findOne({ email: cleanEmail });
    if (existed) {
      return sendError(res, 409, 'Email đã được sử dụng. Vui lòng đăng nhập.');
    }

    const user = await User.create({
      fullName: String(fullName).trim(),
      email: cleanEmail,
      phone: String(phone).trim(),
      passwordHash: hashPassword(password),
      role: 'Customer',
      status: 'Active',
    });

    return res.status(201).json(buildAuthResponse(user));
  } catch (error) {
    if (error.code === 11000) {
      return sendError(res, 409, 'Email đã được sử dụng. Vui lòng dùng email khác.');
    }

    if (error.name === 'ValidationError') {
      return sendError(res, 400, 'Thông tin đăng ký chưa hợp lệ.');
    }

    console.error('Register error:', error);
    return sendError(res, 500, 'Lỗi máy chủ khi đăng ký. Vui lòng thử lại.');
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;
    const cleanEmail = normalizeEmail(email);

    if (!cleanEmail || !password) {
      return sendError(res, 400, 'Vui lòng nhập email và mật khẩu.');
    }

    const user = await User.findOne({ email: cleanEmail });
    if (!user || !verifyPassword(password, user.passwordHash)) {
      return sendError(res, 401, 'Email hoặc mật khẩu không đúng.');
    }

    if (['Blocked', 'Inactive', 'Unverified'].includes(user.status)) {
      return sendError(res, 403, 'Tài khoản hiện không thể đăng nhập.');
    }

    return res.json(buildAuthResponse(user));
  } catch (error) {
    console.error('Login error:', error);
    return sendError(res, 500, 'Lỗi máy chủ khi đăng nhập. Vui lòng thử lại.');
  }
}

function makePasswordHash(req, res) {
  try {
    const { password } = req.body;
    return res.json({ success: true, passwordHash: hashPassword(password) });
  } catch (error) {
    return sendError(res, 400, error.message);
  }
}

function me(req, res) {
  return res.json({ success: true, user: req.user.toSafeObject() });
}

module.exports = {
  login,
  makePasswordHash,
  me,
  register,
};
