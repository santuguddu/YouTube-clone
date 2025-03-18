import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Search, Menu, Home, Flame, ListVideo, Video, Clock, ThumbsUp, Bell, Mic,
  Music, Clapperboard, Play, Newspaper
} from "lucide-react";

export default function ChannelPage() {
  const { channelId } = useParams();
  const navigate = useNavigate();
  const [channel, setChannel] = useState(null);
  const [videos, setVideos] = useState([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [editingVideoId, setEditingVideoId] = useState(null);
  const [updatedTitle, setUpdatedTitle] = useState("");
  const [updatedDescription, setUpdatedDescription] = useState("");
  useEffect(() => {
    fetch(`http://localhost:5000/api/channels/${channelId}`)
      .then((res) => res.json())
      .then((data) => {
        setChannel(data);
        setVideos(data.videos || []);
      })
      .catch((err) => console.error("❌ Error fetching channel:", err));
  }, [channelId]);

  if (!channel) {
    return <div className="text-center mt-10 text-lg">Loading...</div>;
  }

  const baseUrl = "http://localhost:5000";
  const bannerUrl = channel.channelBanner
    ? `${baseUrl}${channel.channelBanner}`
    : "/default-banner.jpg";
  const profileUrl = channel.profileImage
    ? `${baseUrl}${channel.profileImage}`
    : "/default-avatar.png";

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };
  const handleUpload = async () => {
    if (!selectedFile || !title.trim() || !description.trim()) {
      alert("Please fill in all fields and select a video file.");
      return;
    }

    const formData = new FormData();
    formData.append("videoFile", selectedFile);

    try {
      console.log("🔹 Uploading file:", selectedFile.name);
      const response = await fetch("http://localhost:5000/api/uploads/video", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorResponse = await response.text();
        console.error("❌ Server Error:", errorResponse);
        throw new Error(`Upload failed: ${errorResponse}`);
      }

      const result = await response.json();
      console.log("✅ Upload successful:", result);

      // Save video details to the channel after uploading
      await saveVideoToChannel(result.videoUrl);

      alert("Upload successful! ");
      window.location.reload();
      setShowUploadModal(false);
      setTitle("");
      setDescription("");
      setSelectedFile(null);

      // ✅ Redirect to homepage after successful upload


    } catch (error) {
      console.error("❌ Upload error:", error.message);
      alert(`Upload failed. Error: ${error.message}`);
    }
  };


  const saveVideoToChannel = async (videoUrl) => {
    const videoData = {
      title,
      description,
      videoUrl, // URL of uploaded video
      channelId, // Extracted from useParams()
      userId: "654321", // Replace with actual user ID
    };

    try {
      console.log("📤 Saving video details to channel...");
      const response = await fetch("http://localhost:5000/api/channels/uploadVideo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(videoData),
      });

      const data = await response.json();
      console.log("✅ Video saved to channel:", data);

      if (!response.ok) {
        throw new Error(data.message || "Failed to save video to channel");
      }
    } catch (error) {
      console.error("❌ Error saving video to channel:", error);
      alert(`Error saving video: ${error.message}`);
    }
  };

  const startEditing = (video) => {
    setEditingVideoId(video._id);
    setEditTitle(video.title);
    setEditDescription(video.description);
  };

  // Handle update request
  const handleUpdateVideo = async (videoId) => {
    if (!updatedTitle.trim() || !updatedDescription.trim()) {
      alert("Please fill in all fields.");
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/channels/${channelId}/videos/${videoId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: updatedTitle,
          description: updatedDescription,
          owner: channel.owner,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update video.");
      }

      const result = await response.json();
      console.log("✅ Video updated:", result);

      setVideos((prevVideos) =>
        prevVideos.map((video) =>
          video._id === videoId ? { ...video, title: updatedTitle, description: updatedDescription } : video
        )
      );

      setEditingVideoId(null);
    } catch (error) {
      console.error("❌ Update error:", error);
      alert("Error updating video.");
    }
  };


  // Handle delete request
  const handleDeleteVideo = async (videoId) => {
    if (!window.confirm("Are you sure you want to delete this video?")) return;

    try {
      const response = await fetch(`http://localhost:5000/api/channels/${channelId}/videos/${videoId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ owner: channel.owner }),
      });

      if (!response.ok) {
        throw new Error("Failed to delete video.");
      }

      console.log("✅ Video deleted");

      setVideos((prevVideos) => prevVideos.filter((video) => video._id !== videoId));
    } catch (error) {
      console.error("❌ Delete error:", error);
      alert("Error deleting video.");
    }
  };

  const handleSubscribe = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/channels/${channelId}/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: "yourUserId" }), // Replace with actual user ID
      });

      if (!response.ok) {
        throw new Error("Failed to subscribe");
      }

      const updatedChannel = await response.json();
      setChannel(updatedChannel); // Update state with new subscriber count
    } catch (error) {
      console.error("❌ Subscription error:", error.message);
      alert("Failed to subscribe. Try again.");
    }
  };


  return (

                
    <div className="bg-white text-black min-h-screen">
      
      <div className="relative w-full h-64">
        <img src={bannerUrl} alt="Channel Banner" className="w-full h-full object-cover" />
      </div>

      <div className="relative flex items-center p-6">
        <div className="absolute left-6 top-[0px]">
          <img src={profileUrl} alt="Profile" className="w-32 h-32 rounded-full border-4 border-white shadow-lg" />
        </div>
        <div className="ml-40">
          <h1 className="text-3xl font-bold">{channel.channelName || "Unknown Channel"}</h1>
          <p className="text-gray-600">@{channelId}</p>
          <p className="text-gray-600">{channel.subscribers || 0} subscribers</p>
        </div>
        <button onClick={() => setShowUploadModal(true)} className="ml-auto bg-blue-600 text-white px-5 py-2 rounded-full hover:bg-blue-700 mr-4">
          Upload Video
        </button>
        <button
          onClick={handleSubscribe}
          className={`flex items-center space-x-2 px-6 py-2 font-bold rounded-full transition ${channel.subscribers > 0 ? "bg-gray-300 text-black" : "bg-red-600 text-white hover:bg-red-700"
            }`}
        >
          {channel.subscribers > 0 ? (
            <>
              <Bell size={20} /> {channel.subscribers} Subscribed
            </>
          ) : (
            "Subscribe"
          )}
        </button>

      </div>

      <div className="border-b border-gray-300 flex space-x-6 px-6 py-3">
        <p className="text-black font-semibold cursor-pointer border-b-2 border-black">Home</p>
        <p className="text-gray-600 cursor-pointer">Videos</p>
        <p className="text-gray-600 cursor-pointer">Shorts</p>
        <p className="text-gray-600 cursor-pointer">Live</p>
        <p className="text-gray-600 cursor-pointer">Playlists</p>
        <p className="text-gray-600 cursor-pointer">Posts</p>
      </div>

      {showUploadModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-xl font-bold mb-4">Upload Video</h2>
            <input type="text" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full mb-3 border p-2" />
            <textarea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full mb-3 border p-2"></textarea>
            <input type="hidden" value={channelId} readOnly />
            <input type="file" accept="video/*" onChange={handleFileChange} className="w-full mb-4 border p-2" />

            <button onClick={handleUpload} className="bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700">
              Upload
            </button>
            <button onClick={() => setShowUploadModal(false)} className="ml-2 bg-gray-400 text-white px-4 py-2 rounded-full hover:bg-gray-500">
              Cancel
            </button>
          </div>
        </div>
      )}



      {/* ✅ Display All Videos in Channel */}
      <div className="p-6">
        <h2 className="text-xl font-bold">All Videos in Channel</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          {videos.map((video, index) => (
            <div key={index} className="border p-4 flex flex-col items-center">
              <video width="450" height="180" controls>
                <source src={`http://localhost:5000${video.videoUrl}`} type="video/mp4" />
              </video>
              <div className="mt-2 text-center">
                {editingVideoId === video._id ? (
                  <div className="flex flex-col items-center">
                    <input
                      type="text"
                      value={updatedTitle}
                      onChange={(e) => setUpdatedTitle(e.target.value)}
                      className="border p-2 w-full"
                    />
                    <textarea
                      value={updatedDescription}
                      onChange={(e) => setUpdatedDescription(e.target.value)}
                      className="border p-2 w-full mt-2"
                    />
                    <button onClick={() => handleUpdateVideo(video._id)} className="bg-green-600 text-white px-3 py-1 mt-2 rounded">
                      Save
                    </button>
                    <button onClick={() => setEditingVideoId(null)} className="bg-gray-500 text-white px-3 py-1 mt-2 rounded">
                      Cancel
                    </button>
                  </div>
                ) : (
                  <>
                    <h2 className="text-lg font-semibold">{video.title}</h2>
                    <p className="text-gray-600">{video.description}</p>
                    <button onClick={() => setEditingVideoId(video._id)} className="bg-yellow-500 text-white px-3 py-1 mt-2 rounded">
                      Edit
                    </button>
                    <button onClick={() => handleDeleteVideo(video._id)} className="bg-red-600 text-white px-3 py-1 mt-2 rounded ml-2">
                      Delete
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}




        </div>
      </div>

    </div>
  );
}
