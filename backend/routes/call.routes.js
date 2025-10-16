const express = require('express');
const multer = require('multer');
const router = express.Router();
const callController = require('../controllers/call.controller');
const { optionalAuth } = require('../middleware/auth.middleware');

const upload = multer({ limits: { fileSize: 10 * 1024 * 1024 } });

router.post('/upload-csv', optionalAuth, upload.single('csv'), callController.uploadCSV);
router.post('/start-calls', optionalAuth, callController.startCalls);
router.get('/dashboard', optionalAuth, callController.getDashboardStats);
router.get('/debug', optionalAuth, callController.debugCalls);
router.get('/', optionalAuth, callController.getCalls);

// TwiML and speech handling
router.get('/twiml/:callId', callController.getTwiML);
router.post('/webhook/response/:callId', express.urlencoded({ extended: false }), callController.handleSpeechResponse);
router.post('/webhook/call-status', callController.handleCallStatus);
router.post('/webhook/recording-status', callController.handleRecordingStatus);

module.exports = router;