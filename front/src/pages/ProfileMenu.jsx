import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const ProfileMenu = () => {
  const [userChannel, setUserChannel] = useState(null);
  const username = localStorage.getItem("username") || "User";
  const firstLetter = username.charAt(0).toUpperCase();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  // Fetch user's channel
  useEffect(() => {
    const fetchUserChannel = async () => {
      try {
        console.log(`📡 Fetching channel for: ${username}`);
        const response = await fetch("http://localhost:5000/api/channels");
        const channels = await response.json();

        // Find the channel that belongs to the logged-in user
        const foundChannel = channels.find((channel) => channel.owner === username);

        if (foundChannel) {
          setUserChannel(foundChannel); // ✅ Store user's channel
          console.log("✅ Channel found:", foundChannel);
        } else {
          console.warn("⚠️ No channel found for user:", username);
        }
      } catch (error) {
        console.error("❌ Error fetching channels:", error);
      }
    };

    fetchUserChannel();
  }, [username]); // Runs when username changes

  return (
    <div className="relative">
      {/* Profile Button */}
      <button
        className="px-6 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-full shadow-md"
        onClick={() => setIsOpen(!isOpen)}
      >
        {firstLetter}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute mt-2 right-0 w-64 bg-gray-900 text-white rounded-lg shadow-lg z-[60]">
          {/* User Info */}
          <div className="p-4 border-b border-gray-700">
            <p className="text-lg font-semibold">{username}</p>
            <p className="text-sm text-gray-400">@{username.toLowerCase()}</p>

            {/* View Channel Button (Only if the user has a channel) */}
            {userChannel && (
              <button
                className="text-blue-400 hover:underline mt-1"
                onClick={() => navigate(`/channel/${userChannel.channelId}`)}
              >
                View Channel
              </button>
            )}
          </div>

          {/* Menu Items */}
          <ul className="py-2">
            <li className="px-4 py-2 hover:bg-gray-800 cursor-pointer">Google Account</li>
            <li className="px-4 py-2 hover:bg-gray-800 cursor-pointer">Switch Account</li>
            <li className="px-4 py-2 hover:bg-gray-800 cursor-pointer" onClick={() => navigate("/")}>
              Sign Out
            </li>
            <li className="px-4 py-2 hover:bg-gray-800 cursor-pointer">YouTube Studio</li>
            <li className="px-4 py-2 hover:bg-gray-800 cursor-pointer">Purchases and Memberships</li>
            <li className="px-4 py-2 hover:bg-gray-800 cursor-pointer">Your Data in YouTube</li>
            <li className="px-4 py-2 hover:bg-gray-800 cursor-pointer">Settings</li>
            <li className="px-4 py-2 hover:bg-gray-800 cursor-pointer">Help</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default ProfileMenu;
