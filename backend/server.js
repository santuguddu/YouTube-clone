const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const mongoose = require("mongoose");
require("dotenv").config();
const Channel = require("./models/Channel");

const app = express();


// ✅ Ensure 'uploads/' directory exists
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// ✅ Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(uploadDir));
app.use("/uploads/videos", express.static("uploads/videos"));

// ✅ MongoDB Connection
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/youtubeClone";

mongoose
  .connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB Connected Successfully"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// ✅ Multer Configuration for File Uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Store files in 'uploads/' folder
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
  },
});

const upload = multer({ storage });

// ✅ Middleware to handle both profileImage & channelBanner uploads
const uploadFields = upload.fields([
  { name: "profileImage", maxCount: 1 },
  { name: "channelBanner", maxCount: 1 },
]);

// ✅ Multer Configuration for Video Uploads
const videoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/videos/"); // Store videos in 'uploads/videos/'
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
  },
});

// ✅ Multer Middleware for Video Uploads (Max 100MB)
const uploadVideo = multer({
  storage: videoStorage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["video/mp4", "video/mkv", "video/avi", "video/webm"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      console.error("❌ Invalid file type:", file.mimetype);
      cb(new Error("Invalid file type. Only MP4, MKV, AVI, and WEBM allowed."));
    }
  },
});

// ✅ Upload Video Route with Detailed Logging
app.post("/api/uploads/video", (req, res) => {
  uploadVideo.single("videoFile")(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      console.error("❌ Multer Error:", err.message);
      return res.status(400).json({ error: `Multer error: ${err.message}` });
    } else if (err) {
      console.error("❌ Upload Error:", err.message);
      return res.status(400).json({ error: `Upload error: ${err.message}` });
    }

    if (!req.file) {
      console.warn("⚠️ No file received.");
      return res.status(400).json({ message: "No video uploaded" });
    }

    console.log("✅ Video uploaded successfully:", req.file.filename);
    res.json({ videoUrl: `/uploads/videos/${req.file.filename}` });
  });
});

// ✅ Routes
const authRoutes = require("./routes/authRoutes");
const videoRoutes = require("./routes/videoRoutes");
const channelRoutes = require("./routes/channelRoutes");

app.use("/api/auth", authRoutes);
app.use("/api", videoRoutes);
app.use("/api/channels", channelRoutes);

// ✅ Upload Profile Image Route
app.post("/api/uploads/profile", upload.single("profileImage"), (req, res) => {
  console.log("🔹 Received Profile Image:", req.file);
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }
  res.json({ imageUrl: `/uploads/${req.file.filename}` });
});

// ✅ Upload Channel Banner Route
app.post("/api/uploads/banner", upload.single("channelBanner"), (req, res) => {
  console.log("🔹 Received Channel Banner:", req.file);
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }
  res.json({ bannerUrl: `/uploads/${req.file.filename}` });
});

// ✅ Upload Multiple Files Route
app.post("/api/uploads/multiple", uploadFields, (req, res) => {
  console.log("🔹 Received Profile Image:", req.files.profileImage);
  console.log("🔹 Received Channel Banner:", req.files.channelBanner);
  if (!req.files.profileImage && !req.files.channelBanner) {
    return res.status(400).json({ message: "No files uploaded" });
  }
  res.json({
    profileImageUrl: req.files.profileImage ? `/uploads/${req.files.profileImage[0].filename}` : null,
    channelBannerUrl: req.files.channelBanner ? `/uploads/${req.files.channelBanner[0].filename}` : null,
  });
});

// ✅ Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

app.get("/api/channels/:username", async (req, res) => {
  try {
    console.log("🔎 Searching for channel with owner:", req.params.username);

    const channel = await Channel.findOne({ owner: req.params.username });

    if (!channel) {
      console.log("❌ Channel not found for:", req.params.username);
      return res.status(404).json({ message: "❌ Channel not found" });
    }

    console.log("✅ Channel found:", channel);
    res.json(channel);
  } catch (err) {
    console.error("❌ Server error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});




