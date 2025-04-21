const express = require("express");
const router = express.Router();
const subjectController = require("../controllers/subjectControllers");
const upload = require('../middlewares/upload');

router.get('/', subjectController.getAllSubjects);
router.post('/batch', subjectController.getSubjectsByIds);
router.post('/import-subjects', upload.single('file'), subjectController.importSubjects);
router.get('/code/:code', subjectController.getSubjectByCode);
router.get('/:id', subjectController.getSubjectById); 

module.exports = router;
