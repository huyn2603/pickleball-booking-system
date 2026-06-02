const User = require('../models/User');
const { verifyToken } = require('../utils/token');

async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    const payload = verifyToken(token);

    if (!payload) {
      return res.status(401).json({ success: false, message: 'Phien dang nhap khong hop le.' });
    }

    const user = await User.findById(payload.sub);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Khong tim thay tai khoan.' });
    }

    req.user = user;
    return next();
  } catch (error) {
    return next(error);
  }
}

module.exports = requireAuth;
