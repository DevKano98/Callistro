const express = require('express');
const router = express.Router();
const agentController = require('../controllers/agent.controller');
const { optionalAuth } = require('../middleware/auth.middleware');

router.post('/create', optionalAuth, agentController.createAgent);
router.get('/', optionalAuth, agentController.getAgents);

module.exports = router;