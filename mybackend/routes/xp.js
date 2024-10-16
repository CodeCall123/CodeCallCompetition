const express = require('express');
const XPController = require('../controller/xp');

const router = express.Router();
const xpController = new XPController();

router.post('/awardXP', xpController.awardXP);

module.exports = router