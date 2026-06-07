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
    if (!user || !verifyPassword(password, user.password)) {
      return sendError(res, 401, 'Email hoac mat khau khong dung.');
    }

    if (['Blocked', 'Inactive', 'Unverified'].includes(user.status)) {
      return sendError(res, 403, 'Tai khoan hien khong the dang nhap.');
    }

    const updatedUser = await User.updateLastLogin(user.id);
    return res.json(buildAuthResponse(updatedUser));
  } catch (error) {
    console.error('Login error:', error);
    return sendError(res, 500, 'Loi may chu khi dang nhap. Vui long thu lai.');
  }
}

async function forgotPassword(req, res) {
  try {
    const { email, password } = req.body;
    const cleanEmail = normalizeEmail(email);

    if (!cleanEmail || !password) {
      return sendError(res, 400, 'Vui long nhap email va mat khau moi.');
    }

    if (!isGmail(cleanEmail)) {
      return sendError(res, 400, 'Email phai co duoi @gmail.com.');
    }

    if (String(password).length < 6) {
      return sendError(res, 400, 'Mat khau moi phai co it nhat 6 ky tu.');
    }

    const user = await User.findByEmail(cleanEmail);
    if (!user) {
      return sendError(res, 404, 'Khong tim thay tai khoan voi email nay.');
    }

    await User.updatePassword(user.id, storePassword(password));
    return res.json({ success: true, message: 'Mat khau da duoc dat lai. Vui long dang nhap.' });
  } catch (error) {
    console.error('Forgot password error:', error);
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
  deleteManagedAccount,
  forgotPassword,
  getPlainPassword,
  listManagedAccounts,
  login,
  me,
  register,
  updateManagedAccountStatus,
  updateMe,
};
