const express = require("express");
const { 
  getVideos, 
  getVideoById, 
  postComment, 
  updateComment, 
  deleteComment,  // ✅ Added deleteComment
  updateLike,     // ✅ Added updateLike
  updateDislike   // ✅ Added updateDislike
} = require("../controllers/videoController");

const router = express.Router();

// ✅ Fetch all videos
router.get("/videos", getVideos);

// ✅ Fetch a single video
router.get("/videos/:videoId", getVideoById);

// ✅ Add a new comment
router.post("/videos/:videoId/comments", postComment);

// ✅ Update a comment
router.put("/videos/:videoId/comments/:commentId", updateComment);

// ✅ Delete a comment
router.delete("/videos/:videoId/comments/:commentId", deleteComment);

// ✅ Update likes
router.put("/videos/:videoId/like", updateLike);

// ✅ Update dislikes
router.put("/videos/:videoId/dislike", updateDislike);

module.exports = router;
