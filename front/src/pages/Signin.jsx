import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search, Menu, Home, Flame, ListVideo, Video, Clock, ThumbsUp, Bell, Mic,
  Music, Clapperboard, Play, Newspaper
} from "lucide-react";

export default function YouTubeSignin() {
  const navigate = useNavigate();
  const [username, setUsername] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const categories = [
    "All", "Artificial Intelligence", "Comedy", "Gaming", "Vlog", "Beauty", "Travel", "Food", "Fashion"
  ];

  useEffect(() => {
    const token = sessionStorage.getItem("token"); // Use sessionStorage instead of localStorage
    if (token) {
      fetch("http://localhost:5000/api/me", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => {
          if (!res.ok) {
            throw new Error(`HTTP error! Status: ${res.status}`);
          }
          return res.json();
        })
        .then((data) => {
          setUsername(data.username);
        })
        .catch(() => {
          sessionStorage.removeItem("token"); // Remove token if error occurs
        });
    }
  }, []);

  // Get the first letter of the username
  const firstLetter = username ? username.charAt(0).toUpperCase() : "";

  return (
    <div className="flex h-screen bg-white text-black">
      {/* Sidebar */}
      <aside className={`p-4 space-y-6 bg-white transition-all duration-300 ${sidebarOpen ? "w-64" : "w-20"}`}>
        {/* Sidebar Header */}
        <div className="flex items-center space-x-2 relative">
          <button onClick={() => setSidebarOpen(!sidebarOpen)}>
            <Menu className="w-6 h-6" />
          </button>
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/b/b8/YouTube_Logo_2017.svg"
            alt="YouTube Logo"
            className="h-6 absolute left-12 top-0"
            style={{ position: "fixed", top: "16px", left: sidebarOpen ? "88px" : "48px", transition: "left 0.3s ease" }}
          />
        </div>

        {/* Sidebar Navigation */}
        <nav className="space-y-4 mt-10">
          {[
            { icon: Home, label: "Home" },
            { icon: Flame, label: "Trending" },
            { icon: ListVideo, label: "Subscriptions" },
            { icon: Video, label: "Library" },
            { icon: Clock, label: "Watch later" },
            { icon: ThumbsUp, label: "Liked videos" },
            { icon: Music, label: "Music" },
            { icon: Clapperboard, label: "Movies" },
            { icon: Play, label: "Songs" },
            { icon: Newspaper, label: "News" }
          ].map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex items-center space-x-2 p-2 hover:bg-gray-200 rounded cursor-pointer"
            >
              <Icon className="w-5 h-5" />
              {sidebarOpen && <span>{label}</span>}
            </div>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Header */}
        <header className="p-4 flex items-center justify-between">
          {/* Search Bar */}
          <div className="flex-1 flex justify-center">
            <div className="flex items-center border border-gray-400 rounded-full w-[40%]">
              <input
                type="text"
                placeholder="Search"
                className="bg-transparent border-none outline-none px-4 py-2 w-full text-black"
              />
              <button className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-r-full">
                <Search className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            <button className="ml-4 p-2 bg-gray-200 hover:bg-gray-300 rounded-full">
              <Mic className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Right Section: Notifications & Auth */}
          <div className="flex items-center space-x-4">
            <Bell className="w-6 h-6 text-gray-600 cursor-pointer" />

            {firstLetter ? (
              <div className="w-10 h-10 flex items-center justify-center bg-blue-500 text-white rounded-full text-lg font-bold cursor-pointer">
                {firstLetter}
              </div>
            ) : (
              <button
                onClick={() => navigate("/auth")}
                className="px-6 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-full shadow-md transform transition duration-300 hover:scale-105 hover:shadow-lg"
              >
                Sign in
              </button>
            )}
          </div>
        </header>

        {/* Categories */}
        <div className="p-4 flex space-x-4 overflow-x-auto scrollbar-hide">
          {categories.map((category) => (
            <button
              key={category}
              className={`px-4 py-1 rounded-lg text-sm whitespace-nowrap transition-all duration-200 ${selectedCategory === category
                ? "bg-black text-white"
                : "bg-gray-200 text-black"
                }`}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Selected Category Display */}
        <div className="p-6 text-lg font-semibold">
          Showing results for: <span className="text-blue-500">{selectedCategory}</span>
        </div>
      </main>
    </div>
  );
}
