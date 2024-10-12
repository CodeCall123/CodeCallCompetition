// Import necessary modules and setup
const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const { ethers } = require('ethers');
const connectToDatabase = require('./db');
const helmet = require('helmet');
const { exec } = require('child_process');
const { body, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');

require('dotenv').config({ path: path.join(__dirname, '.env') });

const competitionRouter = require('./routes/competitions');
const trainingRouter = require('./routes/training');
const User = require('./models/User');
const Competition = require('./models/Competition');
const Training = require('./models/Training');

const loginRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 5, // Limit each IP to 5 requests per windowMs
  message:
    'Too many login attempts from this IP, please try again after a minute',
  headers: true,
});

const app = express();
const port = process.env.PORT || 5001;

const usdcContractAddress = '0x1d17CBcF0D6D143135aE902365D2E5e2A16538D4';
const usdcAbi = ['function balanceOf(address owner) view returns (uint256)'];

// Enforce HTTPS and Use Secure Cookies
app.use((req, res, next) => {
  if (
    req.headers['x-forwarded-proto'] !== 'https' &&
    process.env.NODE_ENV === 'production'
  ) {
    return res.redirect(['https://', req.get('Host'), req.url].join(''));
  }
  next();
});

app.use(bodyParser.json());
const allowedOrigins = [
  'https://codecallappfrontend.vercel.app',
  'http://localhost:3000',
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
  })
);
app.use(helmet());
app.use(async (req, res, next) => {
  try {
    await connectToDatabase();
    next();
  } catch (err) {
    console.error('Database connection error:', err);
    res.status(500).json({ message: 'Database connection error' });
  }
});
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'"],
      imgSrc: ["'self'", 'data:'],
      connectSrc: ["'self'", 'https://api.github.com'],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  })
);

app.use(competitionRouter);
app.use(trainingRouter);

const ZKSYNC_MAINNET_URL = process.env.ZKSYNC_MAINNET_URL;

if (!ZKSYNC_MAINNET_URL) {
  console.error('ZKSYNC_MAINNET_URL is not set in the environment variables.');
  process.exit(1);
}

const provider = new ethers.providers.JsonRpcProvider(ZKSYNC_MAINNET_URL);

provider
  .getNetwork()
  .then((network) => {
    console.log(`Connected to zkSync network: ${network.name}`);
  })
  .catch((error) => {
    console.error('Network connection failed:', error);
    process.exit(1);
  });

// Endpoint to fetch leaderboard data
app.get('/leaderboard', async (req, res) => {
  try {
    const users = await User.find().sort({ xp: -1 });
    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching leaderboard data:', error.message);
    res.status(500).json({ message: error.message });
  }
});

// GitHub OAuth callback endpoint
app.post(
  '/authenticate',
  loginRateLimiter,
  // Validate and sanitize the code parameter
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
        console.error('Error from GitHub:', response.data.error_description);
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
      console.error(
        'Error during authentication:',
        error.response ? error.response.data : error.message
      );
      res.status(500).json({ message: error.message });
    }
  }
);

// Function to get USDC balance on zkSync
const getUSDCBalance = async (walletAddress) => {
  try {
    const usdcContract = new ethers.Contract(
      usdcContractAddress,
      usdcAbi,
      provider
    );
    const balance = await usdcContract.balanceOf(walletAddress);
    const formattedBalance = ethers.utils.formatUnits(balance, 6);
    return formattedBalance;
  } catch (error) {
    console.error(
      `Error fetching USDC balance for ${walletAddress} on zkSync:`,
      error
    );
    throw new Error('Could not fetch USDC balance on zkSync.');
  }
};

// Endpoint to fetch USDC balance on zkSync
app.get('/user/:username/usdc-balance', async (req, res) => {
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
    console.error('Error fetching USDC balance:', error.message);
    res
      .status(500)
      .json({ message: 'Error fetching USDC balance', error: error.message });
  }
});

// Function to get user data by username
const getUserDataByUsername = async (username) => {
  const user = await User.findOne({ username });
  if (!user) {
    throw new Error('User not found');
  }
  return user;
};

// Function to update user data by username
const updateUserDataByUsername = async (username, data) => {
  const updateFields = ({
    avatar,
    email,
    discord,
    telegram,
    twitter,
    linkedin,
    bio,
  } = data);
  const user = await User.findOneAndUpdate({ username }, updateFields, {
    new: true,
  });
  if (!user) {
    throw new Error('User not found');
  }
  return user;
};

// Endpoint to fetch user data
app.get('/user/:username', async (req, res) => {
  const { username } = req.params;

  try {
    console.log(`Fetching data for user: ${username}`);
    const userData = await getUserDataByUsername(username);
    res.status(200).json(userData);
  } catch (error) {
    console.error('Error fetching user data:', error.message);
    res.status(500).json({ message: error.message });
  }
});

// Endpoint to update user data
app.put(
  '/user/:username',
  // Validate and sanitize inputs
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
      console.log(`Updating data for user: ${username}`);
      const updatedUserData = await updateUserDataByUsername(
        username,
        updateData
      );
      res.status(200).json(updatedUserData);
    } catch (error) {
      console.error('Error updating user data:', error.message);
      res.status(500).json({ message: error.message });
    }
  }
);
// Endpoint to execute Python code
app.post('/execute-python', async (req, res) => {
  const { code } = req.body;

  const fs = require('fs');
  const tmpFile = 'temp_code.py';

  fs.writeFileSync(tmpFile, code);

  exec(`python3 ${tmpFile}`, (error, stdout, stderr) => {
    fs.unlinkSync(tmpFile);

    if (error) {
      console.error(`exec error: ${error}`);
      return res.status(500).json({ error: error.message });
    }

    if (stderr) {
      console.error(`stderr: ${stderr}`);
      return res.status(200).json({ output: stderr });
    }

    res.status(200).json({ output: stdout });
  });
});
// Endpoint to add a judge to a competition
app.post(
  '/competitions/:id/addJudge',
  // Validate and sanitize inputs
  body('username').isString().trim().escape(),
  body('type').isIn(['judge']).trim().escape(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { username, type } = req.body;

    try {
      const competition = await Competition.findById(id);
      if (!competition) {
        return res.status(404).json({ message: 'Competition not found' });
      }

      const user = await User.findOne({ username });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      if (type === 'judge') {
        const isJudge = competition.judges.judges.some((judge) =>
          judge.equals(user._id)
        );
        const isLeadJudge =
          competition.judges.leadJudge &&
          competition.judges.leadJudge.equals(user._id);

        if (isJudge || isLeadJudge) {
          return res
            .status(400)
            .json({ message: 'User is already a judge or lead judge' });
        }

        competition.judges.judges.push(user._id);
      }

      const allJudges = await User.find({
        _id: { $in: competition.judges.judges },
      }).sort({ xp: -1 });

      if (allJudges.length > 0) {
        competition.judges.leadJudge = allJudges[0]._id;
      }

      await competition.save();

      res.status(200).json(competition);
    } catch (error) {
      console.error('Error assigning judge role:', error.message);
      res.status(500).json({ message: error.message });
    }
  }
);
// Endpoint to approve a submission
app.post(
  '/competitions/:id/approveSubmission',
  // Validate and sanitize inputs
  body('username').isString().trim().escape(),
  body('submissionType')
    .isIn(['Feature', 'Optimization', 'Bug'])
    .trim()
    .escape(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { username, submissionType } = req.body;

    try {
      const competition = await Competition.findById(id);
      const user = await User.findOne({ username });

      if (!competition || !user) {
        return res
          .status(404)
          .json({ message: 'Competition or user not found' });
      }

      // Determine the payout based on the submission type
      let payout = 0;
      if (submissionType === 'Feature') {
        payout =
          (competition.reward * competition.rewardDistribution.feature) / 100;
      } else if (submissionType === 'Optimization') {
        payout =
          (competition.reward * competition.rewardDistribution.optimization) /
          100;
      } else if (submissionType === 'Bug') {
        payout =
          (competition.reward * competition.rewardDistribution.bugs) / 100;
      }

      // Update the user's total earnings and add the approved submission
      user.totalEarnings += payout;
      user.approvedSubmissions.push({
        competitionId: competition._id,
        submissionType,
        payout,
      });

      await user.save();

      res.status(200).json({ message: 'Submission approved', payout });
    } catch (error) {
      console.error('Error approving submission:', error);
      res.status(500).json({ message: error.message });
    }
  }
);

// Endpoint to add a judge to a competition
app.post(
  '/competitions/:id/becomeJudge',
  // Validate and sanitize inputs
  body('username').isString().trim().escape(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { username } = req.body;

    try {
      const competition = await Competition.findById(id);
      if (!competition) {
        return res.status(404).json({ message: 'Competition not found' });
      }

      const user = await User.findOne({ username });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const isJudge = competition.judges.judges.some((judge) =>
        judge.equals(user._id)
      );
      const isLeadJudge =
        competition.judges.leadJudge &&
        competition.judges.leadJudge.equals(user._id);

      if (isJudge || isLeadJudge) {
        return res
          .status(400)
          .json({ message: 'User is already a judge or lead judge' });
      }

      competition.judges.judges.push(user._id);
      await competition.save();

      const teamSlug = `judge-repo${id}`;
      const org = process.env.GITHUB_ORG;
      const githubToken = process.env.GITHUB_ADMIN_TOKEN;

      console.log(`Adding ${username} to team ${teamSlug} in org ${org}`);
      console.log('Using GitHub Token:', githubToken);

      try {
        const githubResponse = await axios.put(
          `https://api.github.com/orgs/${org}/teams/${teamSlug}/memberships/${username}`,
          {},
          {
            headers: {
              Authorization: `token ${githubToken}`,
              Accept: 'application/vnd.github.v3+json',
            },
          }
        );
        console.log('GitHub response status:', githubResponse.status);
        console.log('GitHub response data:', githubResponse.data);

        if (githubResponse.status === 200 || 201) {
          console.log(`Successfully added ${username} to ${teamSlug}`);
          res.status(200).json(competition);
        } else {
          console.error(`Failed to add ${username} to ${teamSlug}`);
          res
            .status(500)
            .json({ message: 'Failed to add user to GitHub team' });
        }
      } catch (githubError) {
        console.error(
          'GitHub API error:',
          githubError.response ? githubError.response.data : githubError.message
        );
        res.status(500).json({
          message: 'GitHub API error',
          details: githubError.response
            ? githubError.response.data
            : githubError.message,
        });
      }
    } catch (error) {
      console.error('Error assigning judge role:', error.message);
      res.status(500).json({ message: error.message });
    }
  }
);

// Endpoint to change competition status
app.put(
  '/competitions/:id/changeStatus',
  // Validate and sanitize inputs
  body('status').isIn(['Live', 'Completed', 'Pending']).trim().escape(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { status } = req.body;

    try {
      const competition = await Competition.findById(id);
      if (!competition) {
        return res.status(404).json({ message: 'Competition not found' });
      }

      competition.status = status;
      await competition.save();

      res.status(200).json(competition);
    } catch (error) {
      console.error('Error changing competition status:', error.message);
      res.status(500).json({ message: error.message });
    }
  }
);

app.use(express.static(path.join(__dirname, '../frontend/build')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

// Endpoint to fetch all training modules
app.get('/training', async (req, res) => {
  try {
    const trainingModules = await Training.find();
    console.log('Fetched trainings:', trainingModules);
    res.status(200).json(trainingModules);
  } catch (error) {
    console.error('Error fetching training modules:', error.message);
    res.status(500).json({ message: error.message });
  }
});

app.post(
  '/awardXP',
  // Validate and sanitize inputs
  body('username').isString().trim().escape(),
  body('taskId').isInt(),
  body('trainingId').isMongoId(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, taskId, trainingId } = req.body;

    try {
      const user = await User.findOne({ username });
      const training = await Training.findById(trainingId);

      if (!user || !training) {
        return res.status(404).json({ message: 'User or Training not found' });
      }

      const taskCompleted = user.completedTasks.some(
        (task) => task.taskId === taskId && task.trainingId.equals(trainingId)
      );

      if (taskCompleted) {
        return res
          .status(200)
          .json({ success: false, message: 'Task already completed' });
      }

      let awardedXP = 0;
      switch (taskId) {
        case 1:
          awardedXP = Math.round(training.points * 0.05);
          break;
        case 2:
          awardedXP = Math.round(training.points * 0.1);
          break;

        default:
          return res.status(400).json({ message: 'Invalid task ID' });
      }

      user.xp += awardedXP;
      user.completedTasks.push({ taskId, trainingId });
      await user.save();

      res.status(200).json({
        success: true,
        awardedXP,
        message: `XP awarded for Task ${taskId}`,
      });
    } catch (error) {
      console.error('Error awarding XP:', error.message);
      res.status(500).json({
        success: false,
        message: 'Error awarding XP',
        error: error.message,
      });
    }
  }
);

// Endpoint to fetch all competitions
app.get('/competitions', async (req, res) => {
  try {
    const competitions = await Competition.find().populate(
      'judges.leadJudge judges.judges'
    );
    console.log('Fetched competitions:', competitions);
    res.status(200).json(competitions);
  } catch (error) {
    console.error('Error fetching competitions:', error.message);
    res.status(500).json({ message: error.message });
  }
});
