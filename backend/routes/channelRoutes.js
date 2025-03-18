const express = require("express");
const router = express.Router();
const channelController = require("../controllers/channelController");
const Channel = require("../models/Channel");
const Video = require("../models/Video");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// ✅ Ensure "uploads/" and "uploads/videos/" folder structure exists
const uploadDirs = ["uploads/", "uploads/videos/"];
uploadDirs.forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// ✅ Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, "uploads/");
    } else if (file.mimetype.startsWith("video/")) {
      cb(null, "uploads/videos/");
    } else {
      cb(new Error("Invalid file type!"), false);
    }
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

// ✅ File Filter - Allow Only Images & Videos
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    "image/jpeg", "image/png", "image/jpg", "image/webp",
    "video/mp4", "video/mkv", "video/webm"
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only images (JPEG, PNG, JPG, WEBP) and videos (MP4, MKV, WEBM) are allowed!"), false);
  }
};

const upload = multer({ storage, fileFilter });

// ✅ Get all channels
router.get("/", async (req, res) => {
  try {
    await channelController.getAllChannels(req, res);
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// ✅ Get a specific channel by ID
router.get("/:channelId", async (req, res) => {
  try {
    await channelController.getChannelById(req, res);
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// ✅ Create a new channel
router.post("/", async (req, res) => {
  try {
    const { channelId, channelName, owner, description, profileImage, channelBanner } = req.body;
    if (!profileImage || !channelBanner) {
      return res.status(400).json({ message: "Profile image and banner are required." });
    }
    const newChannel = new Channel({ channelId, channelName, owner, description, profileImage, channelBanner });
    await newChannel.save();
    res.status(201).json({ message: "Channel Created Successfully", channel: newChannel });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// ✅ Upload Profile Image & Channel Banner
router.put(
  "/:channelId",
  upload.fields([
    { name: "profileImage", maxCount: 1 },
    { name: "channelBanner", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      await channelController.updateChannel(req, res);
    } catch (error) {
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
);



// Upload video and store it in the channel
router.post("/uploadVideo", async (req, res) => {
  try {
    const { title, description, videoUrl, channelId } = req.body;

    // ✅ Find the channel where the video should be added
    const channel = await Channel.findOne({ channelId });
    if (!channel) {
      return res.status(404).json({ message: "Channel not found" });
    }

    // ✅ Create a new video object
    const newVideo = {
      title,
      description,
      videoUrl,
      uploadedAt: new Date(),
    };

    // ✅ Push to the channel's videos array
    channel.videos.push(newVideo);
    await channel.save();

    res.status(200).json({ message: "Video uploaded successfully!", video: newVideo });
  } catch (error) {
    console.error("❌ Error uploading video:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.get("/user/:username", async (req, res) => {
  try {
    const channel = await Channel.findOne({ owner: req.params.username });
    if (!channel) {
      return res.status(404).json({ message: "Channel not found" });
    }
    res.json({ channel });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/:channelId/subscribe", async (req, res) => {
  try {
    const { channelId } = req.params;
    const channel = await Channel.findOne({ channelId });

    if (!channel) {
      return res.status(404).json({ message: "Channel not found" });
    }

    channel.subscribers += 1; // Increase subscriber count
    await channel.save();

    res.json(channel);
  } catch (error) {
    console.error("❌ Subscription error:", error);
    res.status(500).json({ message: "Server error" });
  }
});



router.put("/:channelId/videos/:videoId", async (req, res) => {
  try {
    const { channelId, videoId } = req.params;
    const { title, description, owner } = req.body;

    // Find the channel by owner
    const channel = await Channel.findOne({ owner });

    if (!channel) {
      return res.status(404).json({ message: "Channel not found" });
    }

    // Find and update the video inside the channel's videos array
    const videoIndex = channel.videos.findIndex((video) => video._id.toString() === videoId);
    if (videoIndex === -1) {
      return res.status(404).json({ message: "Video not found" });
    }

    channel.videos[videoIndex].title = title;
    channel.videos[videoIndex].description = description;

    await channel.save();
    res.json({ message: "Video updated successfully", updatedVideo: channel.videos[videoIndex] });

  } catch (error) {
    console.error("Error updating video:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.delete("/:channelId/videos/:videoId", async (req, res) => {
  try {
    const { channelId, videoId } = req.params;
    const { owner } = req.body;

    // Find the channel by owner
    const channel = await Channel.findOne({ owner });

    if (!channel) {
      return res.status(404).json({ message: "Channel not found" });
    }

    // Filter out the video from the array
    const updatedVideos = channel.videos.filter((video) => video._id.toString() !== videoId);

    if (updatedVideos.length === channel.videos.length) {
      return res.status(404).json({ message: "Video not found" });
    }

    channel.videos = updatedVideos;
    await channel.save();

    res.json({ message: "Video deleted successfully" });

  } catch (error) {
    console.error("Error deleting video:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});


// ✅ Delete a channel
router.delete("/:channelId", async (req, res) => {
  try {
    await channelController.deleteChannel(req, res);
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = router;
