const express = require('express');
const { UserController } = require('../controller/users');

const router = express.Router();

const userController = new UserController();

router.get('/users/:username', userController.getUser);
// add authentication here
router.put('/users/:username', userController.updateUserData);
router.get('/user/:username/usdc-balance', userController.fetchUSDCBalance);
// move it later
router.get('/leaderboard', userController.fetchLeaderboard);

module.exports = router;