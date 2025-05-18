import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function CreateOrder({ token }) {
  const [orderType, setOrderType] = useState("");
  const [tableNumber, setTableNumber] = useState("");
  const [buildingName, setBuildingName] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [tables, setTables] = useState([]);
  const [locations, setLocations] = useState([]);
  const [error, setError] = useState("");
  const [isFormValid, setIsFormValid] = useState(false);

  const navigate = useNavigate();
  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

  // Fetch tables and locations on mount
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const tablesRes = await axios.get(`${API_URL}/api/tables`);
        setTables(tablesRes.data);

        const locationsRes = await axios.get(`${API_URL}/api/locations`);
        setLocations(locationsRes.data);
      } catch (err) {
        console.error(
          "Error fetching initial data:",
          err.response?.data || err.message
        );
        setError("Failed to load data");
      }
    };
    fetchInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // API_URL is constant, so we can safely ignore it

  // Validate form
  useEffect(() => {
    const isValid =
      orderType && (orderType === "dine-in" ? tableNumber : buildingName);
    setIsFormValid(isValid);
  }, [orderType, tableNumber, buildingName]);

  // Handle Confirm button click
  const handleConfirm = (e) => {
    e.preventDefault();
    setError("");
    if (!isFormValid) {
      setError("Please fill all required fields");
      return;
    }
    // Navigate to OrderPage with order details
    navigate("/orderpage", {
      state: { orderType, tableNumber, buildingName, customerName },
    });
  };

  return (
    <div className="bg-[#FFFCF1] w-full min-h-screen flex flex-col items-center">
      <img
        src="https://res.cloudinary.com/dnoitugnb/image/upload/v1747419279/Component_4_vdovyj.svg"
        alt="backarrow"
        className="absolute top-5 right-8 cursor-pointer"
        onClick={() => window.history.back()}
      />
      <img
        src="https://res.cloudinary.com/dnoitugnb/image/upload/v1746340828/tmylogo.png"
        alt="Logo"
        className="w-full md:max-w-[500px] mt-20"
      />
      {error && <p className="error">{error}</p>}

      <form onSubmit={handleConfirm} className="w-full md:max-w-[500px] mt-5">
        {/* Order Type Buttons - Fixed Position */}
        <div className="w-full bg-[#FFFCF1] py-4  flex gap-20 items-center justify-center">
          <span className="px-4 py-2 text-black text-center text-lg  not-italic font-bold whitespace-nowrap">
            Select Order Type:
          </span>
          <button
            type="button"
            onClick={() => setOrderType("dine-in")}
            className={`px-8 py-4 whitespace-nowrap  rounded-[20px] border border-gray-500 text-lg   font-bold transition-all duration-200 ${
              orderType === "dine-in"
                ? "bg-custom-beige text-black border-gray-700 shadow-md"
                : "bg-custom-light-beige text-black border-gray-500 hover:bg-gray-300/90"
            }`}
          >
            Dine-In
          </button>
          <button
            type="button"
            onClick={() => setOrderType("delivery")}
            className={`px-8 py-4  rounded-[20px] border border-gray-500 text-lg   font-bold transition-all duration-200 ${
              orderType === "delivery"
                ? "bg-custom-beige text-black border-gray-700 shadow-md"
                : "bg-custom-light-beige text-black border-gray-500 hover:bg-gray-300/90"
            }`}
          >
            Delivery
          </button>
        </div>

        {/* Table Selection for Dine-In */}
        {orderType === "dine-in" && (
          <div className="mt-4">
            <p className="px-4 py-2 text-black text-sm font-medium ml-10">
              Table Selection:
            </p>
            <div className="grid grid-cols-5 gap-2 mt-2">
              {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setTableNumber(num)}
                  className={`px-4 py-2 rounded-full border border-gray-500 font-nunito text-sm ${
                    tableNumber === num
                      ? "bg-custom-beige text-black"
                      : "bg-custom-light-beige text-black"
                  }`}
                >
                  Table {num}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Delivery Fields */}
        {orderType === "delivery" && (
          <div className="mt-4 grid grid-cols-2 gap-4">
            <label className="block text-lg font-medium mb-1 whitespace-nowrap">
              Building Name:
            </label>
            <input
              type="text"
              list="buildingNames"
              value={buildingName}
              onChange={(e) => setBuildingName(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md mb-4"
            />
            <datalist id="buildingNames">
              {locations.map((location) => (
                <option key={location.id} value={location.buildingName} />
              ))}
            </datalist>
            <label className="block text-lg font-medium mb-1 whitespace-nowrap ">
              Customer Name:
            </label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
        )}

        {/* Confirm Button */}
        <button
          type="submit"
          disabled={!isFormValid}
          className={`mt-6 px-6 py-3 rounded-full text-black font-bold ${
            isFormValid
              ? "bg-gray-300 hover:bg-gray-400"
              : "bg-gray-200 cursor-not-allowed"
          }`}
          style={{ opacity: isFormValid ? 1 : 0.6 }}
        >
          Confirm
        </button>
      </form>
    </div>
  );
}

export default CreateOrder;
