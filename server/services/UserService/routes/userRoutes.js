const express = require("express");
const router = express.Router();
const userController = require("../controllers/usersControllers");
const upload = require('../middlewares/upload');

router.get('/advisors', userController.getAllAdvisors);
router.post('/batch', userController.getUsersByIds);
router.put('/:id', userController.updateUserProfile);
router.get('/:id', userController.getUserById);
router.post('/import-file', upload.single('file'), userController.importUsersFromFile);
router.post('/get-ids-by-emails', userController.getUserIdsByEmails);
router.post("/import-advisors", upload.single("file"), userController.importAdvisors);
router.get('/tdt/:tdt_id', userController.getUserByTdtId);
router.delete('/:id', userController.deleteAdvisor);
router.post("/add-student", userController.addStudentByAdmin);
router.post("/add-advisor", userController.addAdvisorByAdmin);
router.get("/", userController.getAllStudents);
router.delete("/full-delete/:id", userController.fullDeleteStudent);

module.exports = router;
