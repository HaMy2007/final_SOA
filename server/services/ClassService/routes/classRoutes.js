const express = require("express");
const router = express.Router();
const classController = require("../controllers/classControllers");
const upload = require('../middlewares/upload');

router.get('/classes/:id/students', classController.getClassStudents);
router.get('/teachers/:id/classes', classController.getClassesByTeacher);
router.get('/students/:id/advisor', classController.getAdvisorOfStudent);
router.post('/classes', classController.addClass);
router.get('/class-size', classController.getClassSizeById);
router.post('/classes/:classId/import-students', upload.single('file'), classController.importStudentsToClass);

module.exports = router;
