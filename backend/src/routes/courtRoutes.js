const express = require('express');
const courtController = require('../controllers/courtController');
const requireAuth = require('../middleware/auth');

const router = express.Router();

router.get('/', requireAuth, courtController.listCourts);
router.post('/', requireAuth, courtController.createCourt);
router.get('/:id', requireAuth, courtController.courtDetail);
router.patch('/:id', requireAuth, courtController.updateCourt);
router.delete('/:id', requireAuth, courtController.deleteCourt);
router.get('/:id/availability', requireAuth, courtController.courtAvailability);

module.exports = router;
