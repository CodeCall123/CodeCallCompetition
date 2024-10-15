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

require('dotenv').config({ path: path.join(__dirname, '.env') });

const competitionRouter = require('./routes/competitions');
const trainingRouter = require('./routes/training');
const User = require('./models/User');
const Competition = require('./models/Competition');
const Training = require('./models/Training');

const app = express();
const port = process.env.PORT || 5001;

const usdcContractAddress = '0x1d17CBcF0D6D143135aE902365D2E5e2A16538D4'; 
const usdcAbi = ["function balanceOf(address owner) view returns (uint256)"];

app.use(bodyParser.json());
const allowedOrigins = ['https://codecallappfrontend.vercel.app', 'http://localhost:3000'];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
}));
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
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],  
    scriptSrc: ["'self'"],  
    styleSrc: ["'self'"], 
    imgSrc: ["'self'", "data:"],  
    connectSrc: ["'self'", "https://api.github.com"],  
    objectSrc: ["'none'"],  
    upgradeInsecureRequests: [] 
  }
}));

app.use(competitionRouter);
app.use(trainingRouter);





const ZKSYNC_MAINNET_URL = process.env.ZKSYNC_MAINNET_URL;

if (!ZKSYNC_MAINNET_URL) {
  console.error("ZKSYNC_MAINNET_URL is not set in the environment variables.");
  process.exit(1);
}

const provider = new ethers.JsonRpcProvider(ZKSYNC_MAINNET_URL);

provider.getNetwork().then((network) => {
  console.log(`Connected to zkSync network: ${network.name}`);
}).catch((error) => {
  console.error("Network connection failed:", error);
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
app.post('/authenticate', async (req, res) => {
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
      return res.status(500).json({ message: response.data.error_description });
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
        linkedin: ''
      });
      await user.save();
    }

    res.status(200).json({ username: user.username, accessToken: access_token });
  } catch (error) {
    console.error('Error during authentication:', error.response ? error.response.data : error.message);
    res.status(500).json({ message: error.message });
  }
});

// Function to get USDC balance on zkSync
const getUSDCBalance = async (walletAddress) => {
  try {
    const usdcContract = new ethers.Contract(usdcContractAddress, usdcAbi, provider);
    const balance = await usdcContract.balanceOf(walletAddress);
    const formattedBalance = ethers.utils.formatUnits(balance, 6); 
    return formattedBalance;
  } catch (error) {
    console.error(`Error fetching USDC balance for ${walletAddress} on zkSync:`, error);
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
    res.status(200).json({ walletAddress: user.walletAddress, usdcBalance: balance });
  } catch (error) {
    console.error('Error fetching USDC balance:', error.message);
    res.status(500).json({ message: 'Error fetching USDC balance', error: error.message });
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
  const updateFields = { avatar, email, discord, telegram, twitter, linkedin, bio } = data;
  const user = await User.findOneAndUpdate({ username }, updateFields, { new: true });
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
app.put('/user/:username', async (req, res) => {
  const { username } = req.params;
  const updateData = req.body;
  try {
    console.log(`Updating data for user: ${username}`);
    const updatedUserData = await updateUserDataByUsername(username, updateData);
    res.status(200).json(updatedUserData);
  } catch (error) {
    console.error('Error updating user data:', error.message);
    res.status(500).json({ message: error.message });
  }
});
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

app.use(express.static(path.join(__dirname, '../frontend/build')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

app.post('/awardXP', async (req, res) => {
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
      return res.status(200).json({ success: false, message: 'Task already completed' });
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

    res.status(200).json({ success: true, awardedXP, message: `XP awarded for Task ${taskId}` });
  } catch (error) {
    console.error('Error awarding XP:', error.message);
    res.status(500).json({ success: false, message: 'Error awarding XP', error: error.message });
  }
});
