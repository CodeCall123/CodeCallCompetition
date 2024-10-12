// routes/user.js
const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const axios = require('axios');
const rateLimit = require('express-rate-limit');
const { ethers } = require('ethers');

const redisClient = require('../redis');
const User = require('../models/User');
const {
  getUSDCBalance,
  getUserDataByUsername,
  updateUserDataByUsername,
} = require('../controllers/userController');

// Set up rate limiting for login
const loginRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 5, // Limit each IP to 5 requests per windowMs
  message: 'Too many login attempts, please try again after a minute.',
});

// GitHub OAuth callback endpoint
router.post(
  '/authenticate',
  loginRateLimiter,
  body('code').isString().trim().escape(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { code } = req.body;
    const clientID = process.env.GITHUB_CLIENT_ID;
    const clientSecret = process.env.GITHUB_CLIENT_SECRET;

    try {
      const response = await axios.post(
        `https://github.com/login/oauth/access_token`,
        { client_id: clientID, client_secret: clientSecret, code },
        { headers: { accept: 'application/json' } }
      );

      if (response.data.error) {
        return res
          .status(500)
          .json({ message: response.data.error_description });
      }

      const { access_token } = response.data;
      const githubResponse = await axios.get('https://api.github.com/user', {
        headers: { Authorization: `token ${access_token}` },
      });

      const { login, avatar_url, email } = githubResponse.data;
      let user = await User.findOne({ username: login });

      if (!user) {
        const wallet = ethers.Wallet.createRandom();
        user = new User({
          username: login,
          avatar: avatar_url,
          email: email,
          github: login,
          totalEarnings: 0,
          xp: 0,
          Features: 0,
          Bugs: 0,
          Optimisations: 0,
          walletAddress: wallet.address,
          discord: '',
          telegram: '',
          twitter: '',
          linkedin: '',
        });
        await user.save();
      }

      res
        .status(200)
        .json({ username: user.username, accessToken: access_token });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// Endpoint to fetch user data
router.get('/:username', async (req, res) => {
  const { username } = req.params;

  try {
    const cachedUser = await redisClient.get(`user:${username}`);
    if (cachedUser) {
      return res.status(200).json(JSON.parse(cachedUser));
    }

    const userData = await getUserDataByUsername(username);
    await redisClient.setEx(`user:${username}`, 60, JSON.stringify(userData));

    res.status(200).json(userData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Endpoint to update user data
router.put(
  '/:username',
  body('email').isEmail().normalizeEmail(),
  body('discord').optional().isString().trim().escape(),
  body('telegram').optional().isString().trim().escape(),
  body('twitter').optional().isString().trim().escape(),
  body('linkedin').optional().isString().trim().escape(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username } = req.params;
    const updateData = req.body;

    try {
      const updatedUserData = await updateUserDataByUsername(
        username,
        updateData
      );
      await redisClient.del(`user:${username}`);
      res.status(200).json(updatedUserData);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// Endpoint to fetch USDC balance
router.get('/:username/usdc-balance', async (req, res) => {
  const { username } = req.params;

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const balance = await getUSDCBalance(user.walletAddress);
    res
      .status(200)
      .json({ walletAddress: user.walletAddress, usdcBalance: balance });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
