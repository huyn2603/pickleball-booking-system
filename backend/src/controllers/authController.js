const User = require('../models/User');
const { storePassword, verifyPassword } = require('../utils/password');
const { createToken } = require('../utils/token');

function sendError(res, status, message) {
  return res.status(status).json({ success: false, message });
}

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

function isGmail(email) {
  return email.endsWith('@gmail.com');
}

function buildAuthResponse(user) {
  return {
    success: true,
    token: createToken(user),
    user: User.toSafeObject(user),
  };
}

async function register(req, res) {
  try {
    const { fullName, email, phone, password } = req.body;
    const cleanEmail = normalizeEmail(email);

    if (!fullName || !cleanEmail || !phone || !password) {
      return sendError(res, 400, 'Vui lòng nhập đầy đủ họ tên, email, số điện thoại và mật khẩu.');
    }

    if (!isGmail(cleanEmail)) {
      return sendError(res, 400, 'Email phải có đuôi @gmail.com.');
    }

    if (String(password).length < 6) {
      return sendError(res, 400, 'Mật khẩu phải có ít nhất 6 ký tự.');
    }

    const existed = await User.findByEmail(cleanEmail);
    if (existed) {
      return sendError(res, 409, 'Email đã được sử dụng. Vui lòng đăng nhập.');
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
      return sendError(res, 409, 'Email đã được sử dụng. Vui lòng dùng email khác.');
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

    const user = await User.findByEmail(cleanEmail);
    if (!user || !verifyPassword(password, user.password)) {
      return sendError(res, 401, 'Email hoặc mật khẩu không đúng.');
    }

    if (['Blocked', 'Inactive', 'Unverified'].includes(user.status)) {
      return sendError(res, 403, 'Tài khoản hiện không thể đăng nhập.');
    }

    const updatedUser = await User.updateLastLogin(user.id);
    return res.json(buildAuthResponse(updatedUser));
  } catch (error) {
    console.error('Login error:', error);
    return sendError(res, 500, 'Lỗi máy chủ khi đăng nhập. Vui lòng thử lại.');
  }
}

async function forgotPassword(req, res) {
  try {
    const { email, password } = req.body;
    const cleanEmail = normalizeEmail(email);

    if (!cleanEmail || !password) {
      return sendError(res, 400, 'Vui lòng nhập email và mật khẩu mới.');
    }

    if (!isGmail(cleanEmail)) {
      return sendError(res, 400, 'Email phải có đuôi @gmail.com.');
    }

    if (String(password).length < 6) {
      return sendError(res, 400, 'Mật khẩu mới phải có ít nhất 6 ký tự.');
    }

    const user = await User.findByEmail(cleanEmail);
    if (!user) {
      return sendError(res, 404, 'Không tìm thấy tài khoản với email này.');
    }

    await User.updatePassword(user.id, storePassword(password));
    return res.json({ success: true, message: 'Mật khẩu đã được đặt lại. Vui lòng đăng nhập.' });
  } catch (error) {
    console.error('Forgot password error:', error);
    return sendError(res, 500, 'Lỗi máy chủ khi đặt lại mật khẩu. Vui lòng thử lại.');
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

function requireOwner(req, res) {
  if (req.user.role !== 'Owner') {
    sendError(res, 403, 'Chỉ Owner được quản lý tài khoản.');
    return false;
  }

  return true;
}

async function updateMe(req, res) {
  try {
    const { fullName, email, phone } = req.body;
    const cleanEmail = normalizeEmail(email);

    if (!fullName || !cleanEmail || !phone) {
      return sendError(res, 400, 'Vui lòng nhập đầy đủ họ tên, email và số điện thoại.');
    }

    if (!isGmail(cleanEmail)) {
      return sendError(res, 400, 'Email phải có đuôi @gmail.com.');
    }

    const existed = await User.findByEmail(cleanEmail);
    if (existed && Number(existed.id) !== Number(req.user.id)) {
      return sendError(res, 409, 'Email đã được sử dụng bởi tài khoản khác.');
    }

    const user = await User.updateProfile(req.user.id, {
      fullName: String(fullName).trim(),
      email: cleanEmail,
      phone: String(phone).trim(),
    });

    return res.json({ success: true, user: User.toSafeObject(user) });
  } catch (error) {
    console.error('Update profile error:', error);
    return sendError(res, 500, 'Lỗi máy chủ khi cập nhật hồ sơ. Vui lòng thử lại.');
  }
}

async function deleteMe(req, res) {
  try {
    await User.deactivate(req.user.id);
    return res.json({ success: true, message: 'Tài khoản đã được xóa khỏi trạng thái hoạt động.' });
  } catch (error) {
    console.error('Delete profile error:', error);
    return sendError(res, 500, 'Lỗi máy chủ khi xóa tài khoản. Vui lòng thử lại.');
  }
}

async function listUsers(req, res) {
  try {
    if (!requireOwner(req, res)) {
      return null;
    }

    const users = await User.listAll();
    return res.json({ success: true, users: users.map(User.toSafeObject) });
  } catch (error) {
    console.error('List users error:', error);
    return sendError(res, 500, 'Lỗi máy chủ khi lấy danh sách tài khoản. Vui lòng thử lại.');
  }
}

async function changeUserBanStatus(req, res, nextStatus, action) {
  try {
    if (!requireOwner(req, res)) {
      return null;
    }

    const targetId = Number(req.params.id);
    const reason = String(req.body.reason || '').trim();

    if (!targetId) {
      return sendError(res, 400, 'Tài khoản không hợp lệ.');
    }

    if (targetId === Number(req.user.id)) {
      return sendError(res, 400, 'Owner không thể tự ban hoặc gỡ ban tài khoản của mình.');
    }

    if (!reason) {
      return sendError(res, 400, 'Vui lòng nhập lý do.');
    }

    const target = await User.findById(targetId);
    if (!target) {
      return sendError(res, 404, 'Không tìm thấy tài khoản.');
    }

    if (target.role !== 'Customer') {
      return sendError(res, 403, 'Owner chỉ được ban hoặc gỡ ban tài khoản Customer.');
    }

    const updatedUser = await User.updateStatus(targetId, nextStatus);
    await User.createAuditLog({
      actorId: req.user.id,
      action,
      recordId: targetId,
      oldData: { status: target.status },
      newData: {
        status: nextStatus,
        reason,
        targetEmail: target.email,
        targetRole: target.role,
      },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    return res.json({ success: true, user: User.toSafeObject(updatedUser) });
  } catch (error) {
    console.error(`${action} error:`, error);
    return sendError(res, 500, 'Lỗi máy chủ khi cập nhật trạng thái tài khoản. Vui lòng thử lại.');
  }
}

function banUser(req, res) {
  return changeUserBanStatus(req, res, 'Blocked', 'BAN_USER');
}

function unbanUser(req, res) {
  return changeUserBanStatus(req, res, 'Active', 'UNBAN_USER');
}

module.exports = {
  banUser,
  deleteMe,
  forgotPassword,
  getPlainPassword,
  listUsers,
  login,
  me,
  register,
  unbanUser,
  updateMe,
};
