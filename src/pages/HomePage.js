import React from "react";
import { Link } from "react-router-dom";

function HomePage({ onLogout }) {
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
      <nav className="flex flex-col gap-3 justify-center  ">
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
        <Link
          to="/sales"
          className="flex items-center justify-center w-[288px] h-16 rounded-[25px] border border-gray-600 bg-[#DCC99B] text-black font-nunito text-xl hover:bg-[#DCC99B]/80 active:bg-gray-300 active:text-white hover:text-white/80 active:border-none"
        >
          Sales Report
        </Link>
        <Link
          to="/items"
          className="flex items-center justify-center w-[288px] h-16 rounded-[25px] border border-gray-600 bg-[#DCC99B] text-black font-nunito text-xl hover:bg-[#DCC99B]/80 active:bg-gray-300 active:text-white hover:text-white/80 active:border-none"
        >
          Manage Items
        </Link>
        <Link
          to="/locations"
          className="flex items-center justify-center w-[288px] h-16 rounded-[25px] border border-gray-600 bg-[#DCC99B] text-black font-nunito text-xl hover:bg-[#DCC99B]/80 active:bg-gray-300 active:text-white hover:text-white/80 active:border-none"
        >
          Manage Locations
        </Link>
        <Link
          to="/login"
          onClick={onLogout}
          className="flex items-center justify-center w-[288px] h-16 rounded-[25px] border border-gray-600 bg-[#DCC99B] text-black font-nunito text-xl hover:bg-[#DCC99B]/80 active:bg-gray-300 active:text-white hover:text-white/80 active:border-none"
        >
          Logout
        </Link>
      </nav>
    </div>
  );
}

export default HomePage;
