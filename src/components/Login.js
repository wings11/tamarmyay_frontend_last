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
        "api/auth/login",
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
        className="w-full   md:max-w-[500px] absolute top-8 sm:top-[50px]"
      />
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 mt-16 sm:mt-20 max-w-[90%] sm:max-w-[400px] md:max-w-[532px] w-full p-5 rounded-lg z-[100] bg-white/20 backdrop-blur-sm">
        {error && <p className="text-red-500 text-center mb-2.5">{error}</p>}
        <label
          htmlFor="username"
          className="block text-left font-nunito text-xl sm:text-2xl font-semibold capitalize mb-2"
        >
          Log In
        </label>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <input
              type="username"
              id="username"
              value={username}
              placeholder="Enter username"
              onChange={(e) => setUsername(e.target.value)}
              className="w-full h-10 sm:h-12 md:h-[55px] rounded-[20px] border border-black/30 bg-gray-200/50 p-3 font-nunito text-base sm:text-lg focus:outline-black focus:ring-black-500"
              required
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="password"
              className="block text-left font-nunito text-xl sm:text-2xl font-semibold capitalize mb-2"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              placeholder="write at least 8 characters"
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-10 sm:h-12 md:h-[55px] rounded-[20px] border border-black/30 bg-gray-200/50 p-3 font-nunito text-base sm:text-lg focus:outline-black focus:ring-black-500"
              required
            />
          </div>
          <button
            type="submit"
            className="w-[120px] sm:w-[132px] h-10 sm:h-[50px] mx-auto flex items-center justify-center rounded-[20px] border border-gray-500 bg-gray-200/50 text-black font-nunito text-lg sm:text-xl font-semibold capitalize shadow-md hover:bg-gray-300 active:bg-gray-300 active:text-white active:border-none"
          >
            Confirm
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
