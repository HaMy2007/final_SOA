const express = require("express");
const router = express.Router();
const semesterController = require("../controllers/semesterControllers");
const upload = require('../middlewares/upload');
const { authenticateToken, authorizeRoles } = require("../../../middleware/auth");

router.get('/:id', semesterController.getSemesterById);
router.get('/', semesterController.getAllSemesters);
router.post('/import-semesters', upload.single('file'), authenticateToken, authorizeRoles('admin', 'advisor'), semesterController.importSemesters);
router.get('/code/:code', semesterController.getSemesterByCode);

module.exports = router;
