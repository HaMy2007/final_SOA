const express = require('express');
const router = express.Router();
const forumController = require('../controllers/forumControllers');

// Lấy danh sách bài viết theo class_id
router.get("/class/:classId/posts", forumController.getPostsByClass);

// Tạo bài viết mới
router.post("/posts", forumController.createPost);

// Bình luận vào bài viết
router.post("/posts/:postId/comments", forumController.addComment);

// Like / Unlike bài viết
router.post("/posts/:postId/like", forumController.toggleLike);

module.exports = router; 
