import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search, Menu, Home, Flame, ListVideo, Video, Clock, ThumbsUp, Bell, Mic,
  Music, Clapperboard, Play, Newspaper
} from "lucide-react";
import ProfileMenu from "./ProfileMenu";


export default function YouTubeHome() {
  const navigate = useNavigate();
  const [username, setUsername] = useState(localStorage.getItem("username") || "");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [videos, setVideos] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [userChannel, setUserChannel] = useState(null);

  const categories = [
    "All", "Artificial Intelligence", "Comedy", "Gaming", "Vlog", "Beauty", "Travel", "Food", "Fashion"
  ];

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/videos");
        if (!response.ok) throw new Error("Failed to fetch videos");
        const data = await response.json();
        setVideos(data);
      } catch (error) {
        console.error("❌ Error fetching videos:", error);
      }
    };

    const fetchUserChannel = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/channels");
        if (!response.ok) throw new Error("Failed to fetch channels");
        const channels = await response.json();

        // Check if the logged-in user has a channel
        const foundChannel = channels.find((channel) => channel.owner === username);

        if (foundChannel) {
          setUserChannel(foundChannel);
        }
      } catch (error) {
        console.error("❌ Error fetching channels:", error);
      }
    };

    fetchVideos();
    fetchUserChannel();
  }, [username]); // Runs when username changes


  useEffect(() => {
    setUsername(localStorage.getItem("username"));
  }, []);


  // Fetch the user's channel
  useEffect(() => {
    const fetchUserChannel = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/channels");
        const channels = await response.json();

        // Check if the logged-in user has a channel
        const foundChannel = channels.find((channel) => channel.owner === username);

        if (foundChannel) {
          setUserChannel(foundChannel);
        }
      } catch (error) {
        console.error("Error fetching channels:", error);
      }
    };

    fetchUserChannel();
  }, [username]);


  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("username");

    if (storedUser) {
      setUsername(storedUser);
    } else if (token) {
      fetch("http://localhost:5000/api/me", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.username) {
            setUsername(data.username);
            localStorage.setItem("username", data.username);
          }
        })
        .catch(() => localStorage.removeItem("token"));
    }
  }, []);

  useEffect(() => {
    fetch("http://localhost:5000/api/videos")
      .then((res) => res.json())
      .then((data) => setVideos(data))
      .catch((error) => console.error("Error fetching videos:", error));
  }, []);

  const firstLetter = username ? username.trim().charAt(0).toUpperCase() : "U";
  const formatDuration = (isoDuration) => {
    const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return "0:00";
  
    const hours = match[1] ? parseInt(match[1], 10) : 0;
    const minutes = match[2] ? parseInt(match[2], 10) : 0;
    const seconds = match[3] ? parseInt(match[3], 10) : 0;
  
    return hours > 0
      ? `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
      : `${minutes}:${String(seconds).padStart(2, "0")}`;
  };
  


  return (
    <div className="flex h-screen bg-white text-black">
      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 h-full p-4 space-y-6 bg-white transition-all duration-300 z-20 
  ${sidebarOpen ? "w-64" : "w-20"} md:block hidden`}>

        <div className="relative flex items-center">
          <button onClick={() => setSidebarOpen(!sidebarOpen)}>
            <Menu className="w-6 h-6" />
          </button>
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/b/b8/YouTube_Logo_2017.svg"
            alt="YouTube Logo"
            className="h-6 absolute left-12 top-0"
            style={{ position: "fixed", top: "16px", left: "88px", transition: "left 0.3s ease" }}
          />
        </div>
        <nav className="space-y-4 mt-10">
          {[{ icon: Home, label: "Home" }
            , { icon: Flame, label: "Trending" }, { icon: ListVideo, label: "Subscriptions" },
          { icon: Video, label: "Library" }, { icon: Clock, label: "Watch later" }, { icon: ThumbsUp, label: "Liked videos" },
          { icon: Music, label: "Music" }, { icon: Clapperboard, label: "Movies" }, { icon: Play, label: "Songs" },
          { icon: Newspaper, label: "News" }].map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center space-x-2 p-2 hover:bg-gray-200 rounded cursor-pointer">
              <Icon className="w-5 h-5" />
              {sidebarOpen && <span>{label}</span>}
            </div>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? "ml-64" : "ml-20"}`}>
        {/* Header */}
        <header className="p-4 flex items-center justify-between bg-white sticky top-0 z-10 ">
          <div className="flex-1 flex justify-center">
            <div className="flex items-center border border-gray-400 rounded-full w-[40%]">
              <input
                type="text"
                placeholder="Search"
                className="bg-transparent border-none outline-none px-4 py-2 w-full text-black"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-r-full">
                <Search className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            <button className="ml-4 p-2 bg-gray-200 hover:bg-gray-300 rounded-full">
              <Mic className="w-5 h-5 text-gray-600" />
            </button>
          </div>
          <div className="flex items-center space-x-4">
            {!userChannel && (
              <button
                className="px-4 py-2 bg-purple-500 text-white font-semibold rounded-full shadow-md hover:bg-purple-600 transition-all duration-300"
                onClick={() => navigate("/create-channel")}
              >
                + Create Channel
              </button>
            )}

            <Bell className="w-6 h-6 text-gray-600 cursor-pointer" />
            <div className="flex items-center space-x-4">
              <ProfileMenu />
            </div>
          </div>
        </header>

        {/* Categories */}
        <div className="p-4 flex space-x-4 overflow-x-auto scrollbar-hide whitespace-nowrap bg-white sticky top-[64px] z-10  w-[990px]">
          {categories.map((category) => (
            <button
              key={category}
              className={`px-4 py-2 rounded-lg text-sm transition-all duration-200 flex-shrink-0 ${selectedCategory === category ? "bg-black text-white" : "bg-gray-200 text-black"}`}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Video Grid */}
        <div className="flex-1 overflow-y-auto p-4">
  <div className="p-6 text-lg font-semibold"></div>
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4">
    {videos
      .filter(video =>
        (selectedCategory === "All" || video.category?.trim() === selectedCategory.trim()) &&
        video.title?.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .map((video) => (
        <div
          key={video.videoId}
          className="border rounded p-2 shadow-lg cursor-pointer relative"
          onClick={() => navigate(`/video/${video.videoId}`)}
        >
          <div className="relative">
            <img src={video.thumbnailUrl} alt={video.title || "Video Thumbnail"} className="w-full h-40 object-cover" />
            {/* Duration Overlay */}
            {video.duration && (
              <span className="absolute bottom-2 right-2 bg-black text-white text-xs font-semibold px-1.5 py-0.5 rounded">
                {formatDuration(video.duration)}
              </span>
            )}
          </div>
          <h3 className="text-base font-semibold truncate mt-2">{video.title || "No Title Available"}</h3>
          <p className="text-sm text-gray-700 font-medium mt-1">{video.uploader || "Unknown Uploader"}</p>
          <p className="text-sm text-gray-600">{video.views ? `${video.views} views` : "Views not available"}</p>
        </div>
      ))}
  </div>
</div>

      </main>
    </div>
  );
}
