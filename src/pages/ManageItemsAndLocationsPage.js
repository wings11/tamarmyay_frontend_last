import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AddFoodItem from "../components/ManageItems";
import ManageLocations from "../components/ManageLocations";

function ManageItemsAndLocationsPage({ token }) {
  const [itemsDropdownOpen, setItemsDropdownOpen] = useState(false);
  const [locationsDropdownOpen, setLocationsDropdownOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showAlert, setShowAlert] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    console.log(
      "ManageItemsAndLocationsPage rendered, selectedOption:",
      selectedOption
    );
  }, [selectedOption]);

  const toggleItemsDropdown = () => {
    setItemsDropdownOpen(!itemsDropdownOpen);
    setLocationsDropdownOpen(false);
  };

  const toggleLocationsDropdown = () => {
    setLocationsDropdownOpen(!locationsDropdownOpen);
    setItemsDropdownOpen(false);
  };

  const handleOptionSelect = (option) => {
    setSelectedOption(option);
    setShowAlert(true);
    setItemsDropdownOpen(false);
    setLocationsDropdownOpen(false);
    console.log("Selected option:", option);
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleModalClose = () => {
    setShowAlert(false);
    setSelectedOption(null);
  };

  const getModalContent = () => {
    switch (selectedOption) {
      case "items-add":
        return (
          <AddFoodItem token={token} mode="add" onComplete={handleModalClose} />
        );
      case "items-edit":
        return (
          <AddFoodItem
            token={token}
            mode="edit"
            onComplete={handleModalClose}
          />
        );
      case "items-delete":
        return (
          <AddFoodItem
            token={token}
            mode="delete"
            onComplete={handleModalClose}
          />
        );
      case "locations-add":
        return (
          <ManageLocations
            token={token}
            mode="add"
            onComplete={handleModalClose}
          />
        );
      case "locations-edit":
        return (
          <ManageLocations
            token={token}
            mode="edit"
            onComplete={handleModalClose}
          />
        );
      case "locations-delete":
        return (
          <ManageLocations
            token={token}
            mode="delete"
            onComplete={handleModalClose}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="relative flex flex-col items-center min-h-screen bg-[#FFFCF1] bg-cover bg-center px-4 sm:px-6 lg:px-8">
      <img
        src="https://res.cloudinary.com/dnoitugnb/image/upload/v1746340828/tmylogo.png"
        alt="Logo"
        className="w-full max-w-[300px] sm:max-w-[400px] md:max-w-[300px] lg:max-w-[500px] mt-16 sm:mt-24 md:mt-32 lg:mt-32"
        onError={() => console.error("Failed to load logo image")}
      />
      <img
        src="https://res.cloudinary.com/dnoitugnb/image/upload/v1747419279/Component_4_vdovyj.svg"
        alt="backarrow"
        className="cursor-pointer w-8 h-8 sm:w-10 sm:h-10 absolute top-4 right-4 sm:top-6 sm:right-6"
        onClick={handleBack}
        onError={() => console.error("Failed to load back arrow image")}
      />
      <div className="w-full flex flex-col items-center justify-center mt-16 sm:mt-24 md:mt-32 lg:mt-48">
        <div className="flex flex-col min-[820px]:flex-row gap-4 sm:gap-6 md:gap-8 lg:gap-10 w-full max-w-3xl">
          <h2 className="text-black text-center text-base flex items-center justify-center sm:text-lg md:text-xl font-bold font-nunito whitespace-nowrap">
            Select Management Setting:
          </h2>
          <div className="relative w-full sm:w-auto">
            <button
              onClick={toggleItemsDropdown}
              className="flex items-center justify-center w-[288px] mx-auto h-12 sm:h-14 md:h-16 rounded-[25px] border border-gray-600 bg-[#DCC99B] text-black font-nunito text-base sm:text-lg md:text-xl hover:bg-[#DCC99B]/80 active:bg-gray-300 active:text-white hover:text-white/80 active:border-none"
            >
              Manage Items
            </button>
            {itemsDropdownOpen && (
              <div className="absolute top-full mt-1 left-0 right-0 mx-auto w-full max-w-[288px] bg-[#FFFCF1] border border-gray-600 rounded shadow-lg z-10">
                <button
                  onClick={() => handleOptionSelect("items-add")}
                  className="block w-full text-left px-4 py-2 text-black font-nunito text-base sm:text-lg hover:bg-[#DCC99B]/50"
                >
                  Add
                </button>
                <button
                  onClick={() => handleOptionSelect("items-edit")}
                  className="block w-full text-left px-4 py-2 text-black font-nunito text-base sm:text-lg hover:bg-[#DCC99B]/50"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleOptionSelect("items-delete")}
                  className="block w-full text-left px-4 py-2 text-black font-nunito text-base sm:text-lg hover:bg-[#DCC99B]/50"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
          <div className="relative w-full sm:w-auto">
            <button
              onClick={toggleLocationsDropdown}
              className="flex items-center justify-center w-[288px] mx-auto h-12 sm:h-14 md:h-16 rounded-[25px] border border-gray-600 bg-[#DCC99B] text-black font-nunito text-base sm:text-lg md:text-xl hover:bg-[#DCC99B]/80 active:bg-gray-300 active:text-white hover:text-white/80 active:border-none"
            >
              Manage Locations
            </button>
            {locationsDropdownOpen && (
              <div className="absolute top-full mt-1 left-0 right-0 mx-auto w-full max-w-[288px] sm:max-w-[418px] bg-[#FFFCF1] border border-gray-600 rounded shadow-lg z-10">
                <button
                  onClick={() => handleOptionSelect("locations-add")}
                  className="block w-full text-left px-4 py-2 text-black font-nunito text-base sm:text-lg hover:bg-[#DCC99B]/50"
                >
                  Add
                </button>
                <button
                  onClick={() => handleOptionSelect("locations-edit")}
                  className="block w-full text-left px-4 py-2 text-black font-nunito text-base sm:text-lg hover:bg-[#DCC99B]/50"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleOptionSelect("locations-delete")}
                  className="block w-full text-left px-4 py-2 text-black font-nunito text-base sm:text-lg hover:bg-[#DCC99B]/50"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      {showAlert && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#FFFCF1] rounded-lg shadow-lg p-4 sm:p-6 w-full max-w-[90%] sm:max-w-lg md:max-w-2xl max-h-[80vh] overflow-y-auto">
            {getModalContent()}
          </div>
        </div>
      )}
    </div>
  );
}

export default ManageItemsAndLocationsPage;
