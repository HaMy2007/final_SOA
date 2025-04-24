const express = require('express');
const router = express.Router();
const forumController = require('../controllers/forumControllers');
const { authenticateToken, allowStudentAndAdvisorOnlyAndOwner, authorizeRoles } = require("../../../middleware/auth");

router.get("/class/:classId/posts", forumController.getPostsByClass);
router.post("/posts", authenticateToken, allowStudentAndAdvisorOnlyAndOwner, forumController.createPost);
router.post("/posts/:postId/comments", forumController.addComment);
router.post("/posts/:postId/like", forumController.toggleLike);
router.delete("/posts/:postId", forumController.deletePost);


module.exports = router; 
