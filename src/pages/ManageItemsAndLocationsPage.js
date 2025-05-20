import React, { useState, useEffect } from "react";
import AddFoodItem from "../components/ManageItems";
import ManageLocations from "../components/ManageLocations";

function ManageItemsAndLocationsPage({ token }) {
  const [itemsDropdownOpen, setItemsDropdownOpen] = useState(false);
  const [locationsDropdownOpen, setLocationsDropdownOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null); // Tracks 'items-add', 'items-edit', 'items-delete', 'locations-add', 'locations-edit', 'locations-delete'

  useEffect(() => {
    console.log(
      "ManageItemsAndLocationsPage rendered, selectedOption:",
      selectedOption
    );
  }, [selectedOption]);

  const toggleItemsDropdown = () => {
    setItemsDropdownOpen(!itemsDropdownOpen);
    setLocationsDropdownOpen(false); // Close other dropdown
  };

  const toggleLocationsDropdown = () => {
    setLocationsDropdownOpen(!locationsDropdownOpen);
    setItemsDropdownOpen(false); // Close other dropdown
  };

  const handleOptionSelect = (option) => {
    setSelectedOption(option);
    setItemsDropdownOpen(false);
    setLocationsDropdownOpen(false);
    console.log("Selected option:", option);
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-[#FFFCF1] bg-cover bg-center">
      <img
        src="https://res.cloudinary.com/dnoitugnb/image/upload/v1746340828/tmylogo.png"
        alt="Logo"
        className="w-full md:max-w-[500px] absolute top-8 sm:top-[100px]"
        onError={() => console.error("Failed to load logo image")}
      />
      <div className="w-full bg-[#FFFCF1] flex gap-20 items-center justify-center mt-72 ">
        <h2 className="text-black text-center text-lg not-italic font-bold whitespace-nowrap">
          Select Management Setting:
        </h2>
        <div className="flex flex-row gap-20">
          {/* Manage Items Button with Dropdown */}
          <div className="relative">
            <button
              onClick={toggleItemsDropdown}
              className="flex items-center justify-center w-[288px] h-16 rounded-[25px] border border-gray-600 bg-[#DCC99B] text-black font-nunito text-xl hover:bg-[#DCC99B]/80 active:bg-gray-300 active:text-white hover:text-white/80 active:border-none"
            >
              Manage Items
            </button>
            {itemsDropdownOpen && (
              <div className="absolute top-16 left-0 w-[288px] bg-[#FFFCF1] border border-gray-600 rounded shadow-lg z-10">
                <button
                  onClick={() => handleOptionSelect("items-add")}
                  className="block w-full text-left px-4 py-2 text-black font-nunito text-lg hover:bg-[#DCC99B]/50"
                >
                  Add
                </button>
                <button
                  onClick={() => handleOptionSelect("items-edit")}
                  className="block w-full text-left px-4 py-2 text-black font-nunito text-lg hover:bg-[#DCC99B]/50"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleOptionSelect("items-delete")}
                  className="block w-full text-left px-4 py-2 text-black font-nunito text-lg hover:bg-[#DCC99B]/50"
                >
                  Delete
                </button>
              </div>
            )}
          </div>

          {/* Manage Locations Button with Dropdown */}
          <div className="relative">
            <button
              onClick={toggleLocationsDropdown}
              className="flex items-center justify-center w-[288px] h-16 rounded-[25px] border border-gray-600 bg-[#DCC99B] text-black font-nunito text-xl hover:bg-[#DCC99B]/80 active:bg-gray-300 active:text-white hover:text-white/80 active:border-none"
            >
              Manage Locations
            </button>
            {locationsDropdownOpen && (
              <div className="absolute top-16 left-0 w-[288px] bg-[#FFFCF1] border border-gray-600 rounded shadow-lg z-10">
                <button
                  onClick={() => handleOptionSelect("locations-add")}
                  className="block w-full text-left px-4 py-2 text-black font-nunito text-lg hover:bg-[#DCC99B]/50"
                >
                  Add
                </button>
                <button
                  onClick={() => handleOptionSelect("locations-edit")}
                  className="block w-full text-left px-4 py-2 text-black font-nunito text-lg hover:bg-[#DCC99B]/50"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleOptionSelect("locations-delete")}
                  className="block w-full text-left px-4 py-2 text-black font-nunito text-lg hover:bg-[#DCC99B]/50"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Conditionally Render Components */}
      <div className="w-full max-w-4xl mt-8">
        {selectedOption === "items-add" && (
          <AddFoodItem token={token} mode="add" />
        )}
        {selectedOption === "items-edit" && (
          <AddFoodItem token={token} mode="edit" />
        )}
        {selectedOption === "items-delete" && (
          <AddFoodItem token={token} mode="delete" />
        )}
        {selectedOption === "locations-add" && (
          <ManageLocations token={token} mode="add" />
        )}
        {selectedOption === "locations-edit" && (
          <ManageLocations token={token} mode="edit" />
        )}
        {selectedOption === "locations-delete" && (
          <ManageLocations token={token} mode="delete" />
        )}
      </div>
    </div>
  );
}

export default ManageItemsAndLocationsPage;
