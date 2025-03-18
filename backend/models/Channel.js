const mongoose = require("mongoose");

const ChannelSchema = new mongoose.Schema({
  channelId: { type: String, required: true },
  channelName: { type: String, required: true },
  owner: { type: String, required: true },
  description: { type: String },
  profileImage: { type: String },
  channelBanner: { type: String },
  subscribers: { type: Number, default: 0 },
  videos: [
    {
      title: { type: String, required: true },
      description: { type: String, default: "" },
      videoUrl: { type: String, required: true }, // ✅ Stores video path
      uploadedAt: { type: Date, default: Date.now },
    },
  ],
});

module.exports = mongoose.model("Channel", ChannelSchema);
