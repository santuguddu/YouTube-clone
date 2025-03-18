import { Routes, Route } from "react-router-dom";
import Homepage from "./pages/Homepage";
import AuthForm from "./components/AuthForm";
import Signin from "./pages/Signin";
import VideoPlayer from "./pages/VideoPlayer";
import CreateChannel from "./pages/CreateChannel";
import ChannelPage from "./pages/ChannelPage"; // Import Channel Page


function App() {
  return (
    <Routes>
      <Route path="/" element={<Signin />} />
    
      <Route path="/auth" element={<AuthForm />} />
      <Route path="/sign" element={<Homepage />} />
      <Route path="/video/:videoId" element={<VideoPlayer />} />
      <Route path="/create-channel" element={<CreateChannel />} />
      <Route path="/channel/:channelId" element={<ChannelPage />} /> {/* ✅ Added Route */}
    </Routes>
  );
}

export default App;
