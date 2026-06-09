const express = require('express');
const authController = require('../controllers/authController');
const requireAuth = require('../middleware/auth');

const router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/google-login', authController.googleLogin);
router.post('/forgot-password/request-otp', authController.requestPasswordResetOtp);
router.post('/forgot-password/verify-otp', authController.verifyPasswordResetOtp);
router.post('/forgot-password/reset', authController.resetPasswordWithOtp);
router.post('/password', authController.getPlainPassword);
router.get('/me', requireAuth, authController.me);
router.put('/me', requireAuth, authController.updateMe);
router.get('/accounts', requireAuth, authController.listManagedAccounts);
router.patch('/accounts/:id/status', requireAuth, authController.updateManagedAccountStatus);
router.delete('/accounts/:id', requireAuth, authController.deleteManagedAccount);

module.exports = router;
