const User = require('../models/User');
const { verifyToken } = require('../utils/token');

async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  const payload = verifyToken(token);

  if (!payload) {
    return res.status(401).json({ message: 'Phiên đăng nhập không hợp lệ.' });
  }

  const user = await User.findById(payload.sub);
  if (!user) {
    return res.status(401).json({ message: 'Không tìm thấy tài khoản.' });
  }

  req.user = user;
  return next();
}

module.exports = requireAuth;
