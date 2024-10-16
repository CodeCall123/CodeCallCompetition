const express = require('express');
const TrainingController = require('../controller/training');

const router = express.Router();

const trainingModuleController = new TrainingController();

router.get('/training', trainingModuleController.trainingModules);
router.get('/training/:id', trainingModuleController.fetchTrainingModule);
router.post('/training/:id/submit', trainingModuleController.submitTrainingModuleWork);

module.exports = router;
