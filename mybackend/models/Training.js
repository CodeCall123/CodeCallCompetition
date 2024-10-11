const mongoose = require('mongoose');

const trainingSchema = new mongoose.Schema({
  name: String,
  description: String,
  difficulty: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Beginner' },
  points: Number,
  languages: [String],
  types: [String],
  status: { type: String, default: 'Live' },
  startDate: Date,
  endDate: Date,
  image: String,
  repositoryLink: String,
  trainingDetails: String,
  howToGuide: String,
  scope: String,
  starterCode:String,
  judges: {
    judges: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ]
  },
  submissions: [
    {
      userId: mongoose.Schema.Types.ObjectId,
      codeLink: String,
      timestamp: Date
    }
  ],
  tests: [
    {
      input: String,
      expectedOutput: String,
    }
  ],
  hints: [String]
});

const Training = mongoose.model('Training', trainingSchema);

module.exports = Training;
