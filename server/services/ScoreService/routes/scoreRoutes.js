const express = require("express");
const router = express.Router();
const scoreController = require("../controllers/scoreControllers");
const upload = require('../middlewares/upload');

router.get('/:id/scores-by-semester', scoreController.getStudentScoresGroupedBySemester);
router.get('/:id/scores', scoreController.getStudentScoresBySemester);
router.get('/:id/accumulated-gpa', scoreController.getAccumulatedGPA);
router.get('/filter-gpa', scoreController.filterStudentsByGpaWithName);
router.post('/import-scores', upload.single('file'), scoreController.importStudentScores);

module.exports = router;
