const express = require("express");
const router = express.Router();
const departmentController = require("../controllers/departmentControllers");

router.get("/:id", departmentController.getDepartmentDetail);
router.get('/', departmentController.getAllDepartment);
router.post("/:departmentId/add-teacher", departmentController.addTeacherToDepartment);
router.delete("/:departmentId/subjects/:subjectId/users/:userId", departmentController.removeTeacherFromSubject);

module.exports = router;
