const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settings.controller');
const { optionalAuth } = require('../middleware/auth.middleware');

router.post('/update', optionalAuth, settingsController.updateSettings);
router.get('/', optionalAuth, settingsController.getSettings);

module.exports = router;