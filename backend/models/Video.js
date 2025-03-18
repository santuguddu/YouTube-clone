const mongoose = require("mongoose");

const VideoSchema = new mongoose.Schema({
  videoId: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  thumbnailUrl: { type: String, required: true },
  description: { type: String, required: true },
  channelId: { type: String, required: true },
  uploader: { type: String, required: true },
  views: { type: Number, default: 0 },
  likes: { type: Number, default: 0 },
  dislikes: { type: Number, default: 0 },
  uploadDate: { type: Date, default: Date.now },
  duration: { type: String, required: true },
  comments: [
    {
      commentId: { type: String, required: true }, // 🔹 Keep as String or change to ObjectId if needed
      userId: { type: String, required: true }, // 🔹 Change to `mongoose.Schema.Types.ObjectId` if referencing Users
      text: { type: String, required: true },
      timestamp: { type: Date, default: Date.now },
    },
  ],
});

// 🔹 Export Video Model
module.exports = mongoose.model("Video", VideoSchema);
