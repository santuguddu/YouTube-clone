const Channel = require("../models/Channel");
const Video = require("../models/Video");
const fs = require("fs");
const path = require("path");

// ✅ Upload Video to a Channel
exports.uploadVideo = async (req, res) => {
  try {
    const { channelId } = req.params;
    const { title, description } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "❌ No video uploaded!" });
    }

    const videoUrl = `/uploads/${req.file.filename}`;

    // Find the channel
    const channel = await Channel.findOne({ channelId });
    if (!channel) {
      return res.status(404).json({ message: "❌ Channel not found!" });
    }

    // Create a new video entry
    const newVideo = new Video({
      title: title || "Untitled Video",
      description: description || "",
      videoUrl,
      uploadDate: new Date(),
      channel: channel._id,
    });

    await newVideo.save();

    // Add the new video to the channel's videos list
    channel.videos.push(newVideo._id);
    await channel.save();

    res.status(201).json({ message: "✅ Video uploaded successfully!", video: newVideo });
  } catch (error) {
    console.error("🔥 Error uploading video:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

// ✅ Get all channels
exports.getAllChannels = async (req, res) => {
  try {
    const channels = await Channel.find().populate("videos");
    res.json(channels);
  } catch (error) {
    console.error("❌ Error fetching channels:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// ✅ Get a specific channel by ID
exports.getChannelById = async (req, res) => {
  try {
    const { channelId } = req.params;
    console.log(`🔹 Fetching channel with ID: ${channelId}`);

    const channel = await Channel.findOne({ channelId }).populate("videos");

    if (!channel) {
      return res.status(404).json({ message: "❌ Channel not found" });
    }

    res.json(channel);
  } catch (error) {
    console.error("❌ Error fetching channel:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// ✅ Create a new channel
exports.createChannel = async (req, res) => {
  try {
    console.log("🔹 Received Form Data:", req.body);

    const { channelName, owner, description } = req.body;
    if (!channelName || !owner) {
      return res.status(400).json({ message: "❌ Channel name and owner are required." });
    }

    // ✅ Generate a Unique `channelId`
    const uniqueChannelId = `${channelName.toLowerCase().replace(/\s+/g, "_")}_${Date.now()}`;

    // ✅ Handle file uploads
    const profileImagePath = req.body.profileImage || "/uploads/default-avatar.png";
    const channelBannerPath = req.body.channelBanner || "/uploads/default-banner.png";

    const newChannel = new Channel({
      channelId: uniqueChannelId,
      channelName,
      owner,
      description: description || "",
      profileImage: profileImagePath,
      channelBanner: channelBannerPath,
      subscribers: 0,
      videos: [],
    });

    await newChannel.save();
    return res.status(201).json({ message: "✅ Channel created successfully", channel: newChannel });
  } catch (error) {
    console.error("🔥 Error creating channel:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// ✅ Update channel details (including profile image & banner)
exports.updateChannel = async (req, res) => {
  try {
    console.log("🔹 Update Data Received:", req.body);

    let updateData = {};
    if (req.body.channelName) updateData.channelName = req.body.channelName;
    if (req.body.description) updateData.description = req.body.description;

    // ✅ Handle Image Updates
    if (req.files?.profileImage) {
      updateData.profileImage = `/uploads/${req.files.profileImage[0].filename}`;
    }
    if (req.files?.channelBanner) {
      updateData.channelBanner = `/uploads/${req.files.channelBanner[0].filename}`;
    }

    const updatedChannel = await Channel.findOneAndUpdate(
      { channelId: req.params.channelId },
      updateData,
      { new: true }
    );

    if (!updatedChannel) {
      return res.status(404).json({ message: "❌ Channel not found" });
    }

    res.json({ message: "✅ Channel updated successfully", channel: updatedChannel });
  } catch (error) {
    console.error("❌ Error updating channel:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


