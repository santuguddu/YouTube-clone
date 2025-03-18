import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Search, Menu, Bell, Mic, Home, Flame, ListVideo, Video, Clock, ThumbsUp, Music, Clapperboard, Play, Newspaper } from "lucide-react";
import { ThumbsDown, Share2, Scissors, } from "lucide-react";
import CommentSection from "./CommentSection";
import ProfileMenu from "./ProfileMenu";
import { motion } from "framer-motion";
import axios from "axios";
export default function VideoPlayer() {
  const [likes, setLikes] = useState(0);
  const [dislikes, setDislikes] = useState(0);
  const { videoId } = useParams();
  const navigate = useNavigate();
  const [video, setVideo] = useState(null);
  const [videos, setVideos] = useState([]);
  const [filteredVideos, setFilteredVideos] = useState([]);
  const [username, setUsername] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [subscribed, setSubscribed] = useState(false);
  const storedUser = localStorage.getItem("username");

  // Function to format large numbers (e.g., 1000 -> 1K, 1000000 -> 1M)
const formatNumber = (num) => {
  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M"; // 1.2M
  }
  if (num >= 1_000) {
    return (num / 1_000).toFixed(1).replace(/\.0$/, "") + "K"; // 1.2K
  }
  return num.toString(); // Below 1000, show as is
};

  useEffect(() => {
    axios.get(`http://localhost:5000/api/videos/${videoId}`)
      .then(response => {
        setLikes(response.data.likes);
        setDislikes(response.data.dislikes);
      })
      .catch(error => console.error("Error fetching video data:", error));
  }, [videoId]); // ✅ Dependencies should not change frequently

  const handleLike = async () => {
    try {
      const response = await axios.put(`http://localhost:5000/api/videos/${videoId}/like`);
      setLikes(response.data.likes);
    } catch (error) {
      console.error("Error updating like:", error);
    }
  };

  const handleDislike = async () => {
    try {
      const response = await axios.put(`http://localhost:5000/api/videos/${videoId}/dislike`);
      setDislikes(response.data.dislikes);
    } catch (error) {
      console.error("Error updating dislike:", error);
    }
  };

  // Edit a comment
  const updateComment = (id) => {
    setComments(comments.map((cmt) => (cmt.commentId === id ? { ...cmt, text: editedText } : cmt)));
    setEditingComment(null);
  };

  // Delete a comment
  const deleteComment = (id) => {
    setComments(comments.filter((cmt) => cmt.commentId !== id));
  };



  useEffect(() => {
    fetch(`http://localhost:5000/api/videos/${videoId}`)
      .then((res) => res.json())
      .then((data) => setVideo(data))
      .catch((error) => console.error("Error fetching video:", error));

    fetch("http://localhost:5000/api/videos")
      .then((res) => res.json())
      .then((data) => {
        setVideos(data);
        setFilteredVideos(data);
      })
      .catch((error) => console.error("Error fetching videos:", error));
  }, [videoId]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetch("http://localhost:5000/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => {
          if (!res.ok) throw new Error("Unauthorized");
          return res.json();
        })
        .then((data) => {
          if (data.username) {
            setUsername(data.username);
          }
        })
        .catch(() => {
          localStorage.removeItem("token");
          navigate("/login");
        });
    } else {
      navigate("/login");
    }
  }, [navigate]);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredVideos(videos);
    } else {
      const filtered = videos.filter(
        (vid) => vid.title && vid.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredVideos(filtered);
    }
  }, [searchTerm, videos]);

  if (!video) return console.log("Fetched video:", video);
  const firstLetter = username ? username.charAt(0).toUpperCase() : "U";

  const formatDuration = (isoDuration) => {
    const match = isoDuration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
    const hours = match[1] ? match[1].replace("H", "") : "0";
    const minutes = match[2] ? match[2].replace("M", "") : "0";
    const seconds = match[3] ? match[3].replace("S", "") : "0";
  
    if (hours !== "0") {
      return `${hours}:${minutes.padStart(2, "0")}:${seconds.padStart(2, "0")}`;
    }
    return `${minutes}:${seconds.padStart(2, "0")}`;
  };
  

  return (
    <div className="flex min-h-screen bg-white text-black">
      <aside className={`fixed top-0 left-0 h-full p-4 space-y-6 bg-white transition-all duration-300 shadow-md z-20 ${sidebarOpen ? "w-64" : "w-16"} md:w-64`}>
        <div className="relative flex items-center">
          <button onClick={() => setSidebarOpen(!sidebarOpen)}>
            <Menu className="w-6 h-6" />
          </button>
        </div>
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/b/b8/YouTube_Logo_2017.svg"
          alt="YouTube Logo"
          className="h-6 absolute left-12 top-0"
          style={{ position: "fixed", top: "-7px", left: "80px", transition: "left 0.3s ease" }}
        />
      <nav className="space-y-4 mt-10">
  {[
    { icon: Home, label: "Home", onClick: () => navigate("/sign") }, // ✅ Navigate to homepage
    { icon: Flame, label: "Trending" },
    { icon: ListVideo, label: "Subscriptions" },
    { icon: Video, label: "Library" },
    { icon: Clock, label: "Watch later" },
    { icon: ThumbsUp, label: "Liked videos" },
    { icon: Music, label: "Music" },
    { icon: Clapperboard, label: "Movies" },
    { icon: Play, label: "Songs" },
    { icon: Newspaper, label: "News" },
  ].map(({ icon: Icon, label, onClick }) => (
    <div
      key={label}
      className="flex items-center space-x-2 p-2 hover:bg-gray-200 rounded cursor-pointer"
      onClick={onClick} // ✅ Home navigation logic
    >
      <Icon className="w-5 h-5" />
      {sidebarOpen && <span>{label}</span>}
    </div>
  ))}
</nav>

      </aside>

      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? "ml-64" : "ml-16"} md:ml-64`}>
        <header className="p-4 flex items-center justify-between bg-white shadow-md sticky top-0 z-10">
          <div className="flex flex-grow justify-center items-center space-x-4">
            <div className="flex items-center border border-gray-400 rounded-full w-full md:w-[50%]">
              <input
                type="text"
                placeholder="Search related videos"
                className="bg-transparent border-none outline-none px-4 py-2 w-full text-black"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-r-full">
                <Search className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            <button className="p-2 bg-gray-200 hover:bg-gray-300 rounded-full">
              <Mic className="w-5 h-5 text-gray-600" />
            </button>
          </div>
          <div className="flex items-center space-x-4">
            <Bell className="w-6 h-6 text-gray-600 cursor-pointer" />
            <ProfileMenu />
          </div>
        </header>

        <div className="flex flex-1 p-6">
          <div className="flex-1 pr-6">
            <iframe
              className="w-full h-[200px] md:h-[400px]"
              src={`https://www.youtube.com/embed/${video.videoId}`}
              title={video.title}
              allowFullScreen
            ></iframe>


            {/* Video Title and Details */}
            <h2 className="text-2xl font-bold mt-4">{video.title}</h2>
            <p className="text-gray-600">{video.description}</p>
            <p className="text-sm text-gray-600">Channel: {video.uploader}</p>

            {/* Action Buttons - Like, Dislike, Subscribe, Share, Clip */}
            <div className="flex items-center justify-between mt-4">
              {/* Like and Dislike Buttons */}
              <div className="flex items-center space-x-4 mt-4">
  {/* Like Button with Animation */}
  <motion.button
    className="flex items-center space-x-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-full"
    onClick={handleLike}
    whileTap={{ scale: 1.2 }} // Animates on click
    transition={{ type: "spring", stiffness: 300 }}
  >
    <ThumbsUp size={20} /> <span>{formatNumber(likes)}</span>
  </motion.button>

  {/* Dislike Button with Animation */}
  <motion.button
    className="flex items-center space-x-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-full"
    onClick={handleDislike}
    whileTap={{ scale: 1.2 }} // Animates on click
    transition={{ type: "spring", stiffness: 300 }}
  >
    <ThumbsDown size={20} /> <span>{formatNumber(dislikes)}</span>
  </motion.button>
</div>

              {/* Subscribe Button with Ring Icon */}
              <button
                className={`flex items-center space-x-2 px-6 py-2 font-bold rounded-full transition ${subscribed ? "bg-gray-300 text-black" : "bg-red-600 text-white hover:bg-red-700"
                  }`}
                onClick={() => setSubscribed(!subscribed)}
              >
                {subscribed ? (
                  <>
                    <Bell size={20} /> Subscribed
                  </>
                ) : (
                  "Subscribe"
                )}
              </button>

              {/* Share & Clip Buttons */}
              <div className="flex items-center space-x-4">
                <button className="flex items-center space-x-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-full">
                  <Share2 size={20} /> <span>Share</span>
                </button>
                <button className="flex items-center space-x-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-full">
                  <Scissors size={20} /> <span>Clip</span>
                </button>
              </div>
            </div>

            {/* Comment Section */}


            <CommentSection videoId={videoId} username={storedUser} />

          </div>



          <div className="w-full md:w-96 overflow-y-auto max-h-[600px] md:max-h-[900px]">
  <h3 className="text-lg font-semibold mb-4">Related Videos</h3>
  {filteredVideos.slice(0, 8).map((vid) => (
    <div
      key={vid.videoId}
      className="flex mb-4 cursor-pointer"
      onClick={() => navigate(`/video/${vid.videoId}`)}
    >
      <div className="relative">
        {/* Thumbnail Image */}
        <img
          src={vid.thumbnailUrl}
          alt={vid.title}
          className="w-40 h-24 object-cover rounded"
        />
        {/* Duration Overlay */}
        {vid.duration && (
          <span className="absolute bottom-1 right-1 bg-black text-white text-xs font-semibold px-1.5 py-0.5 rounded">
            {formatDuration(vid.duration)}
          </span>
        )}
      </div>

      <div className="ml-2">
        <h4 className="text-sm font-semibold line-clamp-2">{vid.title}</h4>
        <p className="text-xs text-gray-600">{vid.uploader}</p>
        <p className="text-xs text-gray-600">{vid.views} views</p>
      </div>
    </div>
  ))}
</div>

        </div>
      </div>
    </div>
  );
}