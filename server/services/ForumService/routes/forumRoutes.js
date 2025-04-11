const express = require('express');
const router = express.Router();
const forumController = require('../controllers/forumControllers');

// Lấy danh sách bài viết theo class_id
router.get("/class/:classId/posts", forumController.getPostsByClass);
router.post("/posts", forumController.createPost);
router.post("/posts/:postId/comments", forumController.addComment);
router.post("/posts/:postId/like", forumController.toggleLike);
router.delete("/posts/:postId", forumController.deletePost);


module.exports = router; 
