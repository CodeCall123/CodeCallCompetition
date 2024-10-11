const express = require('express');
const router = express.Router();
const Training = require('../models/Training');

// Endpoint to fetch all training modules
router.get('/training', async (req, res) => {
  try {
    const trainingModules = await Training.find();
    console.log('Fetched training modules:', trainingModules);
    res.status(200).json(trainingModules);
  } catch (error) {
    console.error('Error fetching training modules:', error.message);
    res.status(500).json({ message: error.message });
  }
});

// Endpoint to fetch a training module by ID
router.get('/training/:id', async (req, res) => {
  try {
    const trainingModule = await Training.findById(req.params.id);
    if (!trainingModule) {
      return res.status(404).json({ message: 'Training module not found' });
    }
    res.status(200).json(trainingModule);
  } catch (error) {
    console.error('Error fetching training module:', error.message);
    res.status(500).json({ message: error.message });
  }
});


// Endpoint to submit work for a training module
router.post('/training/:id/submit', async (req, res) => {
  const { id } = req.params;
  const { userId, codeLink } = req.body;

  try {
    const trainingModule = await Training.findById(id);
    if (!trainingModule) {
      return res.status(404).json({ message: 'Training module not found' });
    }

    trainingModule.submissions.push({ userId, codeLink, timestamp: new Date() });
    await trainingModule.save();

    res.status(200).json({ message: 'Submission added successfully' });
  } catch (error) {
    console.error('Error submitting work:', error.message);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
