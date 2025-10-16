const express = require('express');
const router = express.Router();
const transcriptController = require('../controllers/transcript.controller');
const { optionalAuth } = require('../middleware/auth.middleware');

router.get('/:callId', optionalAuth, transcriptController.getTranscript);

module.exports = router;