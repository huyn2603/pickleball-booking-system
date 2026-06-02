const express = require('express');
const authController = require('../controllers/authController');
const requireAuth = require('../middleware/auth');

const router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.post('/password', authController.getPlainPassword);
router.get('/me', requireAuth, authController.me);
router.put('/me', requireAuth, authController.updateMe);
router.delete('/me', requireAuth, authController.deleteMe);

module.exports = router;
