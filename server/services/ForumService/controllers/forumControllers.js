const Post = require("../models/Post");
const Comment = require("../models/Comment");
const Feed = require("../models/Feed");
const axios = require("axios");

// Lấy danh sách bài viết theo class_id
exports.getPostsByClass = async (req, res) => {
    try {
      const { classId } = req.params;
  
      const posts = await Post.find({ class_id: classId })
        .sort({ created_at: -1 })
        .populate("comments");
  
      res.status(200).json(posts);
    } catch (err) {
      console.error("[Forum] Lỗi lấy bài viết theo lớp:", err);
      res.status(500).json({ message: "Lỗi server" });
    }
};

// Tạo bài viết mới
// exports.createPost = async (req, res) => {
//     try {
//       const { author_id, author_name, content } = req.body;
  
//       // Gọi ClassService để lấy class_id của user
//       const classRes = await axios.get(`http://localhost:4000/api/students/${author_id}/class`);
//       const class_id = classRes.data?.class?.class_id;
  
//       if (!class_id) {
//         return res.status(400).json({ message: "Không tìm thấy lớp học của người dùng" });
//       }
  
//       const newPost = new Post({
//         author_id,
//         author_name,
//         class_id,
//         content,
//       });
  
//       const savedPost = await newPost.save();
  
//       let feed = await Feed.findOne({ class_id });
//       if (!feed) {
//         feed = new Feed({ class_id, posts: [savedPost._id] });
//       } else {
//         feed.posts.push(savedPost._id);
//       }
//       await feed.save();
  
//       res.status(201).json(savedPost);
//     } catch (err) {
//       console.error("[Forum] Lỗi tạo bài viết:", err.message);
//       res.status(500).json({ message: "Lỗi server" });
//     }
// };
exports.createPost = async (req, res) => {
    try {
      const { author_id, author_name, content, role } = req.body;
  
      let classRes;
      if (role === 'student') {
        classRes = await axios.get(`http://localhost:4000/api/students/${author_id}/class`);
      } else if (role === 'advisor') {
        classRes = await axios.get(`http://localhost:4000/api/teachers/${author_id}/class`);
      } else {
        return res.status(403).json({ message: 'Vai trò không hợp lệ để đăng bài' });
      }
  
      const class_id = classRes.data?.class?.class_id;
      if (!class_id) {
        return res.status(400).json({ message: "Không tìm thấy lớp học của người dùng" });
      }
  
      const newPost = new Post({ author_id, author_name, class_id, content });
      const savedPost = await newPost.save();
  
      let feed = await Feed.findOne({ class_id });
      if (!feed) {
        feed = new Feed({ class_id, posts: [savedPost._id] });
      } else {
        feed.posts.push(savedPost._id);
      }
      await feed.save();
  
      res.status(201).json(savedPost);
    } catch (err) {
      console.error("[Forum] Lỗi tạo bài viết:", err.message);
      res.status(500).json({ message: "Lỗi server" });
    }
  };
  

// Bình luận vào bài viết
exports.addComment = async (req, res) => {
    try {
      const { postId } = req.params;
      const { author_id, author_name, content } = req.body;
  
      const newComment = new Comment({
        post_id: postId,
        author_id,
        author_name,
        content,
      });
  
      const savedComment = await newComment.save();
  
      await Post.findByIdAndUpdate(postId, {
        $push: { comments: savedComment._id },
      });
  
      res.status(201).json(savedComment);
    } catch (err) {
      console.error("[Forum] Lỗi thêm bình luận:", err.message);
      res.status(500).json({ message: "Lỗi server" });
    }
};

// Like / Unlike bài viết
exports.toggleLike = async (req, res) => {
    try {
      const { postId } = req.params;
      const { user_id } = req.body;
  
      const post = await Post.findById(postId);
      if (!post) return res.status(404).json({ message: "Bài viết không tồn tại" });
  
      const alreadyLiked = post.liked_by.includes(user_id);
  
      if (alreadyLiked) {
        post.liked_by = post.liked_by.filter(id => id !== user_id);
      } else {
        post.liked_by.push(user_id);
      }
  
      await post.save();
      res.status(200).json({ liked: !alreadyLiked, totalLikes: post.liked_by.length });
    } catch (err) {
      console.error("[Forum] Lỗi toggle like:", err.message);
      res.status(500).json({ message: "Lỗi server" });
    }
};
