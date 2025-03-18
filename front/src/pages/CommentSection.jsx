import { useState, useEffect } from "react";
import { Edit, Trash2, Save, X } from "lucide-react"; // Icons for Edit/Delete

const CommentSection = ({ videoId, username }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editedCommentText, setEditedCommentText] = useState("");

  // ✅ Fetch comments when component mounts
  useEffect(() => {
    console.log("Received videoId:", videoId);
    if (!videoId) {
      setError("Invalid video ID");
      setLoading(false);
      return;
    }

    fetch(`http://localhost:5000/api/videos/${videoId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Video not found");
        return res.json();
      })
      .then((data) => {
        console.log("Fetched comments:", data.comments);
        setComments(data.comments || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching comments:", err);
        setError("Error fetching comments");
        setLoading(false);
      });
  }, [videoId]);

  // ✅ Add new comment
  const addComment = async () => {
    if (!newComment.trim() || !videoId) {
      setError("Invalid video ID or empty comment");
      return;
    }

    if (!username) {
      setError("User must be logged in to comment");
      return;
    }

    const newCmt = { text: newComment, userId: username };

    try {
      console.log("Sending comment to:", `http://localhost:5000/api/videos/${videoId}/comments`);

      const res = await fetch(`http://localhost:5000/api/videos/${videoId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCmt),
      });

      if (!res.ok) {
        const errorMsg = await res.text();
        throw new Error(`Failed to add comment: ${errorMsg}`);
      }

      const savedComment = await res.json();
      setComments((prevComments) => [...prevComments, savedComment]);
      setNewComment("");
      setError("");
    } catch (err) {
      console.error("Error adding comment:", err.message);
      setError(err.message || "Failed to add comment");
    }
  };

  // ✏️ Edit comment
  const editComment = (comment) => {
    setEditingCommentId(comment.commentId);
    setEditedCommentText(comment.text);
  };

  // ✅ Save edited comment
  const saveEditedComment = async (commentId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/videos/${videoId}/comments/${commentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: editedCommentText }),
      });

      if (!res.ok) {
        throw new Error("Failed to update comment");
      }

      setComments((prevComments) =>
        prevComments.map((comment) =>
          comment.commentId === commentId ? { ...comment, text: editedCommentText } : comment
        )
      );

      setEditingCommentId(null);
      setEditedCommentText("");
    } catch (err) {
      console.error("Error updating comment:", err.message);
      setError(err.message || "Failed to update comment");
    }
  };

  // ❌ Delete comment
  const deleteComment = async (commentId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/videos/${videoId}/comments/${commentId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to delete comment");
      }

      setComments((prevComments) => prevComments.filter((comment) => comment.commentId !== commentId));
    } catch (err) {
      console.error("Error deleting comment:", err.message);
      setError(err.message || "Failed to delete comment");
    }
  };

  return (
    <div className="mt-6">
      <h3 className="text-xl font-semibold mb-4">Comments</h3>
      {error && <p className="text-red-500">{error}</p>}
      {loading ? <p>Loading comments...</p> : null}

      {/* Add Comment Input */}
      <div className="flex items-center space-x-2 mb-4">
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          className="w-full border px-3 py-2 rounded focus:ring focus:ring-blue-300"
        />
        <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600" onClick={addComment}>
          Comment
        </button>
      </div>

      {/* Comment List */}
      <ul className="space-y-3">
        {comments.map((comment) => (
          <li key={comment.commentId} className="p-3 border rounded flex flex-col">
            <div className="flex justify-between items-center">
              <div className="flex-1">
                <p className="text-gray-500 font-semibold">@{comment.userId}</p>
                {editingCommentId === comment.commentId ? (
                  <div className="flex w-full mt-1">
                    <input
                      type="text"
                      value={editedCommentText}
                      onChange={(e) => setEditedCommentText(e.target.value)}
                      className="flex-1 border px-2 py-1 rounded mr-2"
                    />
                    <button className="px-2 py-1 bg-green-500 text-white rounded mr-1" onClick={() => saveEditedComment(comment.commentId)}>
                      <Save size={16} />
                    </button>
                    <button className="px-2 py-1 bg-gray-500 text-white rounded" onClick={() => setEditingCommentId(null)}>
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <p className="text-gray-800 mt-1">{comment.text}</p>
                )}
              </div>

              {/* Ensure the edit and delete buttons are visible for all comments */}
              {username && username === comment.userId && (
                <div className="flex space-x-2">
                  <button className="text-blue-500 hover:text-blue-700" onClick={() => editComment(comment)}>
                    <Edit size={18} />
                  </button>
                  <button className="text-red-500 hover:text-red-700" onClick={() => deleteComment(comment.commentId)}>
                    <Trash2 size={18} />
                  </button>
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CommentSection;
