import React, { useState } from "react";
import { PostType } from "../types/post";
import { MdDelete } from "react-icons/md";

const Forum = () => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const [posts, setPosts] = useState<PostType[]>([]);
  const [newPost, setNewPost] = useState("");

  const handlePost = () => {
    if (!newPost.trim()) return;

    const newPostData: PostType = {
      id: Date.now().toString(),
      authorId: user.id,
      authorName: user.name,
      authorRole: user.role,
      content: newPost,
      createdAt: new Date().toLocaleString(),
      likes: [],
      comments: [],
    };

    setPosts([newPostData, ...posts]);
    setNewPost("");
  };

  const toggleLike = (postId: string) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? {
              ...p,
              likes: p.likes.includes(user.id)
                ? p.likes.filter((id) => id !== user.id)
                : [...p.likes, user.id],
            }
          : p
      )
    );
  };

  const handleAddComment = (postId: string, commentContent: string) => {
    if (!commentContent.trim()) return;

    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? {
              ...p,
              comments: [
                ...p.comments,
                {
                  id: Date.now().toString(),
                  userId: user.id,
                  userName: user.name,
                  content: commentContent,
                  createdAt: new Date().toLocaleString(),
                },
              ],
            }
          : p
      )
    );
  };

  const handleDeletePost = (postId: string) => {
    const confirmDelete = window.confirm("Bạn có chắc chắn muốn xóa bài này?");
    if (!confirmDelete) return;

    const updatedPosts = posts.filter((p) => p.id !== postId);
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
          key={post.id}
          className="bg-white p-4 rounded shadow mb-4 relative"
        >
          <div className="mb-2 text-sm text-gray-600">
            <strong>{post.authorName}</strong> ({post.authorRole}) •{" "}
            {post.createdAt}
          </div>

          {post.authorId === user.id && (
            <button
              onClick={() => handleDeletePost(post.id)}
              className="text-red-500 text-sm hover:underline absolute top-0 right-0"
            >
              <MdDelete className="text-red-500 text-xl" />
            </button>
          )}
          <div className="mb-3">{post.content}</div>
          <button
            onClick={() => toggleLike(post.id)}
            className="text-blue-500 text-sm"
          >
            👍 {post.likes.length} Like
          </button>

          <div className="mt-3">
            <h4 className="font-semibold text-sm mb-1">Bình luận</h4>
            {post.comments.map((c) => (
              <div key={c.id} className="text-sm mb-1">
                <strong>{c.userName}</strong>: {c.content}{" "}
                <span className="text-xs text-gray-500">({c.createdAt})</span>
              </div>
            ))}

            <div className="mt-2">
              <input
                type="text"
                placeholder="Viết bình luận..."
                className="border p-1 rounded text-sm w-full"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleAddComment(post.id, e.currentTarget.value);
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
