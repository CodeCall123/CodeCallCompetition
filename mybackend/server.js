const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { ethers } = require('ethers');
const connectToDatabase = require('./db');
const helmet = require('helmet');
const { exec } = require('child_process');
const redisClient = require('./redis');

const competitionRouter = require('./routes/competitions');
const trainingRouter = require('./routes/training');
const userRouter = require('./routes/user');

const User = require('./models/User');

const app = express();
const port = process.env.PORT || 5001;

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

app.use('/user', userRouter);
app.use('/competitions', competitionRouter);
app.use('/training', trainingRouter);

// Endpoint to fetch leaderboard data
app.get('/leaderboard', async (req, res) => {
  try {
    const cachedLeaderboard = await redisClient.get('leaderboard');
    if (cachedLeaderboard) {
      console.log('Serving from Redis cache');
      return res.status(200).json(JSON.parse(cachedLeaderboard));
    }

    const users = await User.find().sort({ xp: -1 });
    await redisClient.setEx('leaderboard', 60, JSON.stringify(users));

    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching leaderboard data:', error.message);
    res.status(500).json({ message: error.message });
  }
});

// ZKSync setup
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
