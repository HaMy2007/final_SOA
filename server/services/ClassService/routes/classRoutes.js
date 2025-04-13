const express = require("express");
const router = express.Router();
const classController = require("../controllers/classControllers");
const upload = require('../middlewares/upload');

router.get('/classes/:id/students', classController.getClassStudents);
router.get('/teachers/:id/class', classController.getClassesByTeacher);
router.get('/students/:id/advisor', classController.getAdvisorOfStudent);
router.post('/classes', classController.addClass);
router.get('/class-size', classController.getClassSizeById);
router.post('/classes/:classId/import-students', upload.single('file'), classController.importStudentsToClass);
router.get('/students/:id/class', classController.getClassByStudentId);
router.get('/classes/:classId/advisor', classController.getAdvisorByClassId);
router.delete('/classes/:classId/remove-student/:userId', classController.removeStudentFromClass);
router.post('/classes/:classId/add-student', classController.addStudentToClass);
router.get("/classes", classController.getAllClasses);

module.exports = router;
