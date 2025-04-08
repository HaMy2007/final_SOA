const express = require("express");
const router = express.Router();
const semesterController = require("../controllers/semesterControllers");
const upload = require('../middlewares/upload');

router.get('/', semesterController.getAllSemesters);
router.post('/import-semesters', upload.single('file'), semesterController.importSemesters);
router.get('/code/:code', semesterController.getSemesterByCode);

module.exports = router;
