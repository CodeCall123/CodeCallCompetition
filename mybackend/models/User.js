// User model (User.js)
const mongoose = require('mongoose');
const encrypt = require('mongoose-encryption');
require('dotenv').config({ path: './.env' });

const userSchema = new mongoose.Schema({
  username: String,
  avatar: String,
  email: String,
  github: String,
  totalEarnings: Number,
  xp: Number,
  Features: Number,
  Bugs: Number,
  Optimisations: Number,
  walletAddress: String,
  discord: String,
  telegram: String,
  twitter: String,
  linkedin: String,
  bio: String,
  completedTasks: [
    { taskId: Number, trainingId: mongoose.Schema.Types.ObjectId },
  ],

  approvedSubmissions: [
    {
      competitionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Competition',
      },
      submissionType: {
        type: String,
        enum: ['Feature', 'Optimization', 'Bug'],
      },
      payout: Number,
    },
  ],
});

const encryptionFields = [
  'email',
  'walletAddress',
  'discord',
  'telegram',
  'twitter',
  'linkedin',
];

// Implement advanced encryption for user data stored in MongoDB.
userSchema.plugin(encrypt, {
  secret: process.env.ENCRYPTION_KEY,
  encryptedFields: encryptionFields,
  excludeFromEncryption: [
    'username',
    'avatar',
    'github',
    'totalEarnings',
    'xp',
    'Features',
    'Bugs',
    'Optimisations',
    'bio',
    'completedTasks',
    'approvedSubmissions',
  ],
});

const User = mongoose.model('User', userSchema);
module.exports = User;
