const express = require("express");
const router = express.Router();
const userController = require("../controllers/usersControllers");
const upload = require('../middlewares/upload');
const { authenticateToken, authorizeRoles } = require("../../../middleware/auth");

router.get('/advisors', userController.getAllAdvisors);
router.post('/batch', userController.getUsersByIds);
router.put('/:id', userController.updateUserProfile);
router.get('/:id', userController.getUserById);
router.post('/import-file', upload.single('file'), userController.importUsersFromFile);  //admin import user
router.post('/get-ids-by-emails', userController.getUserIdsByEmails);  //lay id của user thông qua email
router.post("/import-advisors", upload.single("file"), authenticateToken, authorizeRoles("admin"), userController.importAdvisors); //admin import cố vấn
router.get('/tdt/:tdt_id', userController.getUserByTdtId);
router.delete('/:id', authenticateToken, authorizeRoles("admin"), userController.deleteAdvisor);  
router.post("/add-student", authenticateToken, authorizeRoles("admin"), userController.addStudentByAdmin);
router.post("/add-advisor", authenticateToken, authorizeRoles("admin"), userController.addAdvisorByAdmin);
router.get("/", userController.getAllStudents);
router.delete("/full-delete/:id", authenticateToken, authorizeRoles("admin"), userController.fullDeleteStudent); 

module.exports = router;
