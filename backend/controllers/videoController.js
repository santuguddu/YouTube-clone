const Video = require("../models/Video"); // ✅ Ensure Video model is imported

// ✅ Fetch all videos
exports.getVideos = async (req, res) => {
  try {
    const videos = await Video.find();
    res.status(200).json(videos);
  } catch (error) {
    console.error("Error fetching videos:", error);
    res.status(500).json({ message: "Error fetching videos" });
  }
};

// ✅ Fetch a single video by ID
exports.getVideoById = async (req, res) => {
  console.log("Fetching video for ID:", req.params.videoId);
  try {
    const video = await Video.findOne({ videoId: req.params.videoId });

    if (!video) {
      console.error("Video not found:", req.params.videoId);
      return res.status(404).json({ message: "Video not found" });
    }

    // ✅ Return the complete video details
    res.status(200).json(video);
  } catch (error) {
    console.error("Error fetching video:", error);
    res.status(500).json({ message: "Error fetching video" });
  }
};

// ✅ Add a new comment to a video
exports.postComment = async (req, res) => {
  const { videoId } = req.params;
  const { userId, text } = req.body;

  if (!userId || !text) {
    return res.status(400).json({ message: "User ID and comment text are required" });
  }

  try {
    const video = await Video.findOne({ videoId });

    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }

    // Generate a unique comment ID (use MongoDB ObjectId if needed)
    const newComment = {
      commentId: Date.now().toString(),
      userId,
      text,
      timestamp: new Date().toISOString(),
    };

    video.comments.push(newComment);
    await video.save();

    res.status(201).json(newComment);
  } catch (error) {
    console.error("Error posting comment:", error);
    res.status(500).json({ message: "Error posting comment" });
  }
};

// ✅ Update an existing comment
exports.updateComment = async (req, res) => {
  const { videoId, commentId } = req.params;
  const { text } = req.body;

  try {
    const video = await Video.findOne({ videoId });

    if (!video) return res.status(404).json({ message: "Video not found" });

    // 🔥 FIXED: Properly find the comment using `find()`
    const comment = video.comments.find((c) => c.commentId === commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    comment.text = text;
    await video.save();

    res.json(comment);
  } catch (error) {
    console.error("Error updating comment:", error);
    res.status(500).json({ message: "Error updating comment" });
  }
};

// ✅ Delete a comment
exports.deleteComment = async (req, res) => {
  const { videoId, commentId } = req.params;

  try {
    const video = await Video.findOne({ videoId });

    if (!video) return res.status(404).json({ message: "Video not found" });

    // 🔥 FIXED: Properly find the comment by `commentId`
    const commentIndex = video.comments.findIndex((c) => c.commentId === commentId);
    if (commentIndex === -1) return res.status(404).json({ message: "Comment not found" });

    video.comments.splice(commentIndex, 1);
    await video.save();

    res.json({ message: "Comment deleted successfully" });
  } catch (error) {
    console.error("Error deleting comment:", error);
    res.status(500).json({ message: "Error deleting comment" });
  }
};

// ✅ Update Like Count
exports.updateLike = async (req, res) => {
  const { videoId } = req.params;

  try {
    const video = await Video.findOneAndUpdate(
      { videoId },
      { $inc: { likes: 1 } }, // Increment likes by 1
      { new: true }
    );

    if (!video) return res.status(404).json({ message: "Video not found" });

    res.status(200).json({ likes: video.likes });
  } catch (error) {
    console.error("Error updating likes:", error);
    res.status(500).json({ message: "Error updating likes" });
  }
};

// ✅ Update Dislike Count
exports.updateDislike = async (req, res) => {
  const { videoId } = req.params;

  try {
    const video = await Video.findOneAndUpdate(
      { videoId },
      { $inc: { dislikes: 1 } }, // Increment dislikes by 1
      { new: true }
    );

    if (!video) return res.status(404).json({ message: "Video not found" });

    res.status(200).json({ dislikes: video.dislikes });
  } catch (error) {
    console.error("Error updating dislikes:", error);
    res.status(500).json({ message: "Error updating dislikes" });
  }
};
