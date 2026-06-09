const express = require('express');
const staffController = require('../controllers/staffController');
const requireAuth = require('../middleware/auth');

const router = express.Router();

router.get('/dashboard', requireAuth, staffController.dashboard);
router.post('/bookings/:id/check-in', requireAuth, staffController.checkIn);
router.post('/bookings/:id/check-out', requireAuth, staffController.checkOut);
router.post('/bookings/:id/payment', requireAuth, staffController.recordPayment);
router.patch('/addons/:id/stock', requireAuth, staffController.updateAddonStock);

module.exports = router;
