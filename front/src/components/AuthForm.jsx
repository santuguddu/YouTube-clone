import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function AuthForm() {
  const [formData, setFormData] = useState({ username: "", email: "", password: "" });
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      axios
        .get("http://localhost:5000/api/auth/me", { // ✅ Correct endpoint
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => {
          setUsername(response.data.username);
          console.log("Full username:", response.data.username);
          console.log("First letter:", response.data.username.charAt(0).toUpperCase());
        })
        .catch((error) => {
          console.error("Failed to fetch user data:", error);
          setIsAuthenticated(false);
        });
    }
  }, []);
  

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";
      const { data } = await axios.post(`http://localhost:5000${endpoint}`, formData);

      localStorage.setItem("token", data.token);

      // Fetch user data immediately after login
      const userResponse = await axios.get("http://localhost:5000/api/auth/me", {
        headers: { Authorization: `Bearer ${data.token}` },
      });

      localStorage.setItem("username", userResponse.data.username);
      setUsername(userResponse.data.username);
      setIsAuthenticated(true);

      console.log("User authenticated:", userResponse.data.username);

      navigate("/sign");
    } catch (error) {
      console.error("Error during registration/login:", error);
      alert(error.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-purple-500 to-blue-500 p-4">
      <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md">
        <h2 className="text-3xl font-bold text-center text-gray-700 mb-6">
          {isLogin ? "Welcome Back!" : "Create Your Account"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-gray-600 font-medium">Username</label>
              <input
                type="text"
                placeholder="Enter your username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                required
                className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          )}

          <div>
            <label className="block text-gray-600 font-medium">Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-gray-600 font-medium">Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold py-3 rounded-md shadow-md transition duration-300 hover:opacity-90"
          >
            {isLogin ? "Login" : "Register"}
          </button>
        </form>

        <p className="mt-4 text-center text-gray-600">
          {isLogin ? "New here? " : "Already have an account? "}
          <span
            className="text-blue-600 font-semibold cursor-pointer hover:underline"
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin ? "Create an account" : "Login"}
          </span>
        </p>
      </div>

      {/* Display the first letter of username as an avatar */}
      {isAuthenticated && username && (
        <div className="absolute top-5 right-5 flex items-center justify-center w-10 h-10 bg-blue-600 text-white rounded-full text-lg font-bold">
          {username.charAt(0).toUpperCase()}
        </div>
      )}
    </div>
  );
}
