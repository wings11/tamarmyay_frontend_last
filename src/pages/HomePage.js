// import React, { useState } from "react";
// import { Link } from "react-router-dom";

// function HomePage({ onLogout }) {
//   const [showLogoutModal, setShowLogoutModal] = useState(false);

//   const handleLogoutClick = () => {
//     setShowLogoutModal(true);
//   };

//   const confirmLogout = () => {
//     setShowLogoutModal(false);
//     onLogout();
//   };

//   const cancelLogout = () => {
//     setShowLogoutModal(false);
//   };

//   return (
//     <div
//       className="flex flex-col items-center justify-center min-h-screen bg-[#ddd6c5] bg-cover bg-center"
//       style={{
//         backgroundImage: `url(https://res.cloudinary.com/dnoitugnb/image/upload/v1746267407/Tmbackground.png)`,
//       }}
//     >
//       <img
//         src="https://res.cloudinary.com/dnoitugnb/image/upload/v1746340828/tmylogo.png"
//         alt="Logo"
//         className="w-full md:max-w-[500px] mt-5"
//       />
//       <nav className="flex flex-col gap-3 justify-center">
//         <Link
//           to="/createorder"
//           className="flex items-center justify-center w-[288px] h-16 rounded-[25px] border border-gray-600 bg-[#DCC99B] text-black font-nunito text-xl hover:bg-[#DCC99B]/80 active:bg-gray-300 active:text-white hover:text-white/80 active:border-none text-size"
//         >
//           Create Order
//         </Link>
//         <Link
//           to="/checkout"
//           className="flex items-center justify-center w-[288px] h-16 rounded-[25px] border border-gray-600 bg-[#DCC99B] text-black font-nunito text-xl hover:bg-[#DCC99B]/80 active:bg-gray-300 active:text-white hover:text-white/80 active:border-none"
//         >
//           Checkout
//         </Link>
//         <Link
//           to="/history"
//           className="flex items-center justify-center w-[288px] h-16 rounded-[25px] border border-gray-600 bg-[#DCC99B] text-black font-nunito text-xl hover:bg-[#DCC99B]/80 active:bg-gray-300 active:text-white hover:text-white/80 active:border-none"
//         >
//           Order History
//         </Link>
//         <Link
//           to="/sales"
//           className="flex items-center justify-center w-[288px] h-16 rounded-[25px] border border-gray-600 bg-[#DCC99B] text-black font-nunito text-xl hover:bg-[#DCC99B]/80 active:bg-gray-300 active:text-white hover:text-white/80 active:border-none"
//         >
//           Sales Report
//         </Link>
//         <Link
//           to="/management"
//           className="flex items-center justify-center w-[288px] h-16 rounded-[25px] border border-gray-600 bg-[#DCC99B] text-black font-nunito text-xl hover:bg-[#DCC99B]/80 active:bg-gray-300 active:text-white hover:text-white/80 active:border-none"
//           onClick={() =>
//             console.log("Management button clicked, navigating to /management")
//           }
//         >
//           Manage Items & Locations
//         </Link>
//         <button
//           onClick={handleLogoutClick}
//           className="flex items-center justify-center w-[288px] h-16 rounded-[25px] border border-gray-600 bg-[#DCC99B] text-black font-nunito text-xl hover:bg-[#DCC99B]/80 active:bg-gray-300 active:text-white hover:text-white/80 active:border-none"
//         >
//           Logout
//         </button>
//       </nav>

//       {showLogoutModal && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
//           <div className="bg-[#FFFCF1] rounded-lg shadow-lg p-6 w-full max-w-sm sm:max-w-md">
//             <p className="text-center text-lg sm:text-xl font-nunito text-black mb-6">
//               Are you sure you want to log out?
//             </p>
//             <div className="flex justify-around">
//               <button
//                 onClick={confirmLogout}
//                 className="px-6 py-2 rounded-[20px] border border-gray-600 bg-[#DCC99B] text-black font-nunito text-base sm:text-lg hover:bg-[#DCC99B]/80 active:bg-gray-300 active:text-white hover:text-white/80 active:border-none"
//               >
//                 Yes
//               </button>
//               <button
//                 onClick={cancelLogout}
//                 className="px-6 py-2 rounded-[20px] border border-gray-600 bg-[#DCC99B] text-black font-nunito text-base sm:text-lg hover:bg-[#DCC99B]/80 active:bg-gray-300 active:text-white hover:text-white/80 active:border-none"
//               >
//                 No
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// export default HomePage;
import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import axios from "axios";



function HomePage({ onLogout, token, API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000" }) {
  const [userRole, setUserRole] = useState(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const fetchUserRole = useCallback(async () => {
    try {
      const res = await axios.get(`${API_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUserRole(res.data.role);
    } catch (err) {
      console.error("Error fetching user role:", err);
      if (err.response?.status === 401) {
        onLogout();
        alert("Session expired. Please log in again.");
      } else {
        alert("Failed to fetch user role. Please try again.");
      }
    }
  }, [token, API_URL, onLogout]);

  useEffect(() => {
    if (!token || !API_URL) {
      console.error("Token or API_URL is missing");
      return;
    }
    fetchUserRole();
  }, [fetchUserRole, token, API_URL]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setShowLogoutModal(false);
      }
    };
    if (showLogoutModal) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showLogoutModal]);

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    setShowLogoutModal(false);
    onLogout();
  };

  const cancelLogout = () => {
    setShowLogoutModal(false);
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
        className="w-full md:max-w-[500px] mt-5"
      />
      <nav className="flex flex-col gap-3 justify-center">
        <Link
          to="/createorder"
          className="flex items-center justify-center w-[288px] h-16 rounded-[25px] border border-gray-600 bg-[#DCC99B] text-black font-nunito text-xl hover:bg-[#DCC99B]/80 active:bg-gray-300 active:text-white hover:text-white/80 active:border-none text-size"
        >
          Create Order
        </Link>
        <Link
          to="/checkout"
          className="flex items-center justify-center w-[288px] h-16 rounded-[25px] border border-gray-600 bg-[#DCC99B] text-black font-nunito text-xl hover:bg-[#DCC99B]/80 active:bg-gray-300 active:text-white hover:text-white/80 active:border-none"
        >
          Checkout
        </Link>
        <Link
          to="/history"
          className="flex items-center justify-center w-[288px] h-16 rounded-[25px] border border-gray-600 bg-[#DCC99B] text-black font-nunito text-xl hover:bg-[#DCC99B]/80 active:bg-gray-300 active:text-white hover:text-white/80 active:border-none"
        >
          Order History
        </Link>
        {userRole === "admin" && (
          <>
            <Link
              to="/sales"
              className="flex items-center justify-center w-[288px] h-16 rounded-[25px] border border-gray-600 bg-[#DCC99B] text-black font-nunito text-xl hover:bg-[#DCC99B]/80 active:bg-gray-300 active:text-white hover:text-white/80 active:border-none"
            >
              Sales Report
            </Link>
            <Link
              to="/management"
              className="flex items-center justify-center w-[288px] h-16 rounded-[25px] border border-gray-600 bg-[#DCC99B] text-black font-nunito text-xl hover:bg-[#DCC99B]/80 active:bg-gray-300 active:text-white hover:text-white/80 active:border-none"
              onClick={() =>
                console.log(
                  "Management button clicked, navigating to /management"
                )
              }
            >
              Manage Items & Locations
            </Link>
          </>
        )}
        <button
          onClick={handleLogoutClick}
          className="flex items-center justify-center w-[288px] h-16 rounded-[25px] border border-gray-600 bg-[#DCC99B] text-black font-nunito text-xl hover:bg-[#DCC99B]/80 active:bg-gray-300 active:text-white hover:text-white/80 active:border-none"
        >
          Logout
        </button>
      </nav>

      {showLogoutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#FFFCF1] rounded-lg shadow-lg p-6 w-full max-w-sm sm:max-w-md">
            <p className="text-center text-lg sm:text-xl font-nunito text-black mb-6">
              Are you sure you want to log out?
            </p>
            <div className="flex justify-around">
              <button
                onClick={confirmLogout}
                className="px-6 py-2 rounded-[20px] border border-gray-600 bg-[#DCC99B] text-black font-nunito text-base sm:text-lg hover:bg-[#DCC99B]/80 active:bg-gray-300 active:text-white hover:text-white/80 active:border-none"
              >
                Yes
              </button>
              <button
                onClick={cancelLogout}
                className="px-6 py-2 rounded-[20px] border border-gray-600 bg-[#DCC99B] text-black font-nunito text-base sm:text-lg hover:bg-[#DCC99B]/80 active:bg-gray-300 active:text-white hover:text-white/80 active:border-none"
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default HomePage;
