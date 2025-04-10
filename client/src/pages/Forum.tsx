import React, { useState, useEffect } from "react";
import { PostType } from "../types/post";
import axios from "axios";
import { MdDelete } from "react-icons/md";

const Forum = () => {
  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const token = localStorage.getItem("token");

  const [posts, setPosts] = useState<PostType[]>([]);
  const [newPost, setNewPost] = useState("");

  useEffect(() => {
    fetchUserAndPosts();
  }, []);

  const fetchClassId = async () => {
    try {
      if (storedUser.role === 'student') {
        const res = await axios.get(`http://localhost:4000/api/students/${storedUser._id}/class`);
        return res.data?.class?.class_id;
      } else if (storedUser.role === 'advisor') {
        const res = await axios.get(`http://localhost:4000/api/teachers/${storedUser._id}/class`);
        return res.data?.class?.class_id;
      }
      return null;
    } catch (err) {
      console.error("Lỗi lấy class_id:", err);
      return null;
    }
  };

  const fetchUserAndPosts = async () => {
    try {
      const classId = await fetchClassId();
      if (!classId) {
        console.error("Không tìm thấy class_id");
        return;
      }
  
      const postRes = await axios.get(`http://localhost:4004/api/class/${classId}/posts`);
      setPosts(postRes.data);
    } catch (err) {
      console.error("Lỗi khi tải dữ liệu người dùng và bài viết:", err);
    }
  };  

  const handlePost = async () => {
    if (!newPost.trim()) return;

    const author_id = storedUser._id || storedUser.id;
    if (!author_id) {
      console.error("Không tìm thấy author_id");
      return;
    }

    try {
      await axios.post(
        "http://localhost:4004/api/posts",
        {
          author_id,
          author_name: storedUser.name,
          content: newPost,
          role: storedUser.role,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setNewPost("");
      fetchUserAndPosts(); // reload bài viết
    } catch (err) {
      console.error("Lỗi khi đăng bài:", err);
    }
  };

  const toggleLike = async (postId: string) => {
    try {
      await axios.post(
        `http://localhost:4004/api/posts/${postId}/like`,
        { user_id: storedUser._id },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      fetchUserAndPosts();
    } catch (err) {
      console.error("Lỗi khi like bài viết:", err);
    }
  };

  const handleAddComment = async (postId: string, commentContent: string) => {
    if (!commentContent.trim()) return;
    try {
      await axios.post(
        `http://localhost:4004/api/posts/${postId}/comments`,
        {
          author_id: storedUser._id,
          author_name: storedUser.name,
          content: commentContent,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      fetchUserAndPosts();
    } catch (err) {
      console.error("Lỗi khi thêm bình luận:", err);
    }
  };

  const handleDeletePost = (postId: string) => {
    const confirmDelete = window.confirm("Bạn có chắc chắn muốn xóa bài viết này?");
    if (!confirmDelete) return;

    // Chức năng xóa sẽ thêm sau nếu API hỗ trợ
    const updatedPosts = posts.filter((p) => p._id !== postId);
    setPosts(updatedPosts);
  };

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Diễn đàn</h1>

      <div className="mb-6">
        <textarea
          placeholder="Chia sẻ điều gì đó..."
          className="w-full p-3 border rounded mb-2"
          value={newPost}
          onChange={(e) => setNewPost(e.target.value)}
        />
        <button
          onClick={handlePost}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Đăng bài
        </button>
      </div>

      {posts.map((post) => (
        <div
          key={post._id}
          className="bg-white p-4 rounded shadow mb-4 relative"
        >
          <div className="mb-2 text-sm text-gray-600">
          <strong>{post.author_name}</strong> • {new Date(post.created_at).toLocaleString()}
          </div>

          {post.author_id === storedUser._id && (
            <button
              onClick={() => handleDeletePost(post._id)}
              className="text-red-500 text-sm hover:underline absolute top-0 right-0"
            >
              <MdDelete className="text-red-500 text-xl" />
            </button>
          )}
          <div className="mb-3">{post.content}</div>
          <button
            onClick={() => toggleLike(post._id)}
            className="text-blue-500 text-sm"
          >
            👍 {post.liked_by.length} Like
          </button>

          <div className="mt-3">
            <h4 className="font-semibold text-sm mb-1">Bình luận</h4>
            {post.comments.map((c) => (
              <div key={c._id} className="text-sm mb-1">
                <strong>{c.author_name}</strong>: {c.content}{" "}
                <span className="text-xs text-gray-500">({c.created_at})</span>
              </div>
            ))}

            <div className="mt-2">
              <input
                type="text"
                placeholder="Viết bình luận..."
                className="border p-1 rounded text-sm w-full"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleAddComment(post._id, e.currentTarget.value);
                    e.currentTarget.value = "";
                  }
                }}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Forum;
