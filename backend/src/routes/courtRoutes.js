const express = require('express');
const courtController = require('../controllers/courtController');
const requireAuth = require('../middleware/auth');

const router = express.Router();

router.get('/', requireAuth, courtController.listCourts);
router.get('/:id', requireAuth, courtController.courtDetail);
router.get('/:id/availability', requireAuth, courtController.courtAvailability);

module.exports = router;
