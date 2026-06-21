const express = require('express');
const bookingController = require('../controllers/bookingController');
const requireAuth = require('../middleware/auth');

const router = express.Router();

router.get('/my', requireAuth, bookingController.listMyBookings);
router.post('/hold', requireAuth, bookingController.createHold);
router.post('/from-hold', requireAuth, bookingController.createBookingFromHold);

module.exports = router;
