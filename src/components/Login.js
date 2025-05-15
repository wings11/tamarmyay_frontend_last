import React, { useState } from "react";
import axios from "axios";

function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        "https://tamarmyaybackend-last.onrender.com/api/auth/login",
        { username, password }
      );
      onLogin(res.data.token);
    } catch (err) {
      setError(err.response?.data?.error || "Login failed");
    }
  };


  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen bg-[#ddd6c5] bg-cover bg-center"
      style={{
        backgroundImage: `url(https://res.cloudinary.com/dnoitugnb/image/upload/v1746267407/Tmbackground.png)`,
      }}
    >
      <img
        src="https://res.cloudinary.com/dnoitugnb/image/upload/v1746340828/tmylogo.png"
        alt="Logo"
        className="w-full max-w-[600px] absolute top-[122px]"
      />
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 mt-20 max-w-[532px] w-full p-5 rounded-lg z-[100] sm:w-[90%]">
        <h2 className="text-left mb-5 text-2xl font-semibold">Log In</h2>
        {error && <p className="text-red-500 text-center mb-2.5">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-[525px] h-[55px] rounded-[20px] border border-black/30 bg-gray-200/50 p-2 font-nunito text-lg sm:w-full"
              required
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="password"
              className="block text-center font-nunito text-2xl font-semibold capitalize mb-2"
            >
              Password
            </label>
            <input
              type="password"
              value={password}
              placeholder="Enter Password"
              onChange={(e) => setPassword(e.target.value)}
              className="w-[525px] h-[55px] rounded-[20px] border border-black/30 bg-gray-200/50 p-2 font-nunito text-lg sm:w-full"
              required
            />
          </div>
          <button
            type="submit"
            className="w-[132px] h-[50px] mx-auto flex items-center justify-center rounded-[20px] border border-gray-500 bg-gray-200/50 text-black font-nunito text-xl font-semibold capitalize shadow-md hover:bg-gray-300 active:bg-gray-300 active:text-white active:border-none"
          >
            Confirm
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
