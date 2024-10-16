const express = require('express');
const checkRole = require('../middleware/checkRole');
const CompetitionController  = require('../controller/competition');

const router = express.Router();

const competitionController = new CompetitionController();

router.get('/competitions', competitionController.allCompetitions);
router.get('/competitions/:id', competitionController.selectedCompetition);
router.post("/competitions/:id/addJudge", competitionController.addJudge);
router.patch('/competitions/:id/becomeJudge', competitionController.makeJudge);
router.post('competitions/:id/mergePR', checkRole('judge'), competitionController.approveAndMergePR);
router.put('/competitions/:id/changeStatus', competitionController.updateCompetitionStatus);
router.put('/competitions/:id/approveSubmission', competitionController.approveSubmission);

module.exports = router;
