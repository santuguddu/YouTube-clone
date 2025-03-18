import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function CreateChannelModal({ onClose = () => { } }) {
  const [channelName, setChannelName] = useState("");
  const [handle, setHandle] = useState("");
  const [profileImage, setProfileImage] = useState(null);
  const [bannerImage, setBannerImage] = useState(null);
  const [previewProfile, setPreviewProfile] = useState(null);
  const [previewBanner, setPreviewBanner] = useState(null);
  const navigate = useNavigate();

  // ✅ Handle Image Preview and State Updates
  const handleImageUpload = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === "profile") {
          setProfileImage(file);
          setPreviewProfile(reader.result);
        } else if (type === "banner") {
          setBannerImage(file);
          setPreviewBanner(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // ✅ Upload Image and Return URL
  const handleUpload = async (file, type) => {
    if (!file) {
      console.error(`❌ No file provided for ${type}`);
      return null;
    }

    const formData = new FormData();
    formData.append(type, file);




    const endpoint = type === "profileImage" ? "profile" : "banner";
    const url = `http://localhost:5000/api/uploads/${endpoint}`;

    console.log(`📤 Uploading ${type} to ${url}...`);

    try {
      const response = await fetch(url, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      console.log("✅ Upload Response:", data);

      if (response.ok) {
        return data.imageUrl || data.bannerUrl || null;
      } else {
        console.error(`❌ Upload failed: ${data.message}`);
        alert(`Failed to upload ${type}: ${data.message}`);
        return null;
      }
    } catch (error) {
      console.error(`🔥 Error uploading ${type}:`, error);
      return null;
    }
  };


  // ✅ Handle Channel Creation
  const handleCreateChannel = async () => {
    if (!channelName || !handle) {
      alert("Please fill in all fields.");
      return;
    }

    const username = localStorage.getItem("username"); // Get username from localStorage
    if (!username) {
      alert("User not authenticated!");
      return;
    }

    let profileUrl = null;
    let bannerUrl = null;

    if (profileImage) profileUrl = await handleUpload(profileImage, "profileImage");
    if (bannerImage) bannerUrl = await handleUpload(bannerImage, "channelBanner");

    const channelData = {
      channelId: handle,
      channelName,
      owner: username, // ✅ Use localStorage username
      description: "Welcome to my channel",
    };

    if (profileUrl) channelData.profileImage = profileUrl;
    if (bannerUrl) channelData.channelBanner = bannerUrl;

    try {
      const response = await fetch("http://localhost:5000/api/channels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(channelData),
      });

      const data = await response.json();

      if (response.ok) {
        alert(`✅ Channel Created: ${channelName} (@${handle})`);
        onClose();
        navigate(`/channel/${data.channel.channelId}`);
      } else {
        alert(`Failed to create channel: ${data.error || "Unknown error"}`);
      }
    } catch (error) {
      alert("An error occurred while creating the channel.");
    }
  };


  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-xl font-bold mb-4 text-center">How you'll appear</h2>

        {/* Profile Picture Upload */}
        <div className="flex flex-col items-center">
          <label className="cursor-pointer relative">
            {previewProfile ? (
              <img
                src={previewProfile}
                alt="Profile"
                className="w-20 h-20 rounded-full object-cover border-2 border-gray-300"
              />
            ) : (
              <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
                <span className="text-gray-600 text-sm">Upload</span>
              </div>
            )}
            <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, "profile")} />
          </label>
          <p className="text-blue-500 text-sm mt-2 cursor-pointer">Upload profile picture</p>
        </div>

        {/* Banner Image Upload */}
        <div className="mt-4 flex flex-col items-center">
          <label className="cursor-pointer relative w-full">
            {previewBanner ? (
              <img
                src={previewBanner}
                alt="Banner"
                className="w-full h-20 object-cover rounded border-2 border-gray-300"
              />
            ) : (
              <div className="w-full h-20 bg-gray-200 flex items-center justify-center rounded">
                <span className="text-gray-600 text-sm">Upload Banner</span>
              </div>
            )}
            <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, "banner")} />
          </label>
          <p className="text-blue-500 text-sm mt-2 cursor-pointer">Upload banner image</p>
        </div>

        {/* Input Fields */}
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700">Name</label>
          <input
            type="text"
            className="w-full border p-2 rounded mt-1"
            placeholder="Channel Name"
            value={channelName}
            onChange={(e) => setChannelName(e.target.value)}
          />
        </div>

        <div className="mt-3">
          <label className="block text-sm font-medium text-gray-700">Handle</label>
          <div className="relative">
            <span className="absolute left-2 top-2.5 text-gray-500">@</span>
            <input
              type="text"
              className="w-full border p-2 pl-6 rounded mt-1"
              placeholder="yourhandle"
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
            />
          </div>
        </div>

        {/* Terms of Service */}
        <p className="text-xs text-gray-500 mt-3 text-center">
          By clicking Create Channel you agree to{" "}
          <span className="text-blue-500 cursor-pointer">YouTube's Terms of Service</span>.
        </p>

        {/* Buttons */}
        <div className="mt-4 flex justify-end space-x-2">
          <button className="px-4 py-2 text-gray-700" onClick={() => onClose()}>
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={handleCreateChannel}
          >
            Create Channel
          </button>
        </div>
      </div>
    </div>
  );
}
