import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function CreateOrder({ token }) {
  const [orderType, setOrderType] = useState("");
  const [tableNumber, setTableNumber] = useState("");
  const [buildingName, setBuildingName] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [locations, setLocations] = useState([]);
  const [recentBuildings, setRecentBuildings] = useState([]);
  const [recentCustomers, setRecentCustomers] = useState([]);
  const [error, setError] = useState("");
  const [isFormValid, setIsFormValid] = useState(false);
  const [occupiedTables, setOccupiedTables] = useState([]);

  const navigate = useNavigate();
  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

  // Fetch locations and occupied tables on mount
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const locationsRes = await axios.get(`${API_URL}/api/locations`);
        setLocations(locationsRes.data);
        setError("");
        // Fetch current orders to determine occupied tables
        const ordersRes = await axios.get(
          `${API_URL}/api/orders?status=In Process`
        );
        const occupied = ordersRes.data
          .filter((order) => order.orderType === "dine-in")
          .map((order) => order.tableNumber);
        setOccupiedTables(occupied);
      } catch (err) {
        console.error(
          "Error fetching locations or orders:",
          err.response?.data || err.message
        );
        setError("Failed to load locations or table status");
      }
    };
    fetchInitialData();
  }, [API_URL]);

  // Validate form
  useEffect(() => {
    const isValid =
      orderType && (orderType === "dine-in" ? tableNumber : buildingName);
    setIsFormValid(isValid);
  }, [orderType, tableNumber, buildingName]);

  // Handle Confirm button click and store recent building/customer names
  const handleConfirm = (e) => {
    e.preventDefault();
    setError("");
    if (!isFormValid) {
      setError("Please fill all required fields");
      return;
    }

    // Store recent building name if provided
    if (buildingName) {
      setRecentBuildings((prev) => {
        const updated = [
          buildingName,
          ...prev.filter((name) => name !== buildingName),
        ];
        return updated.slice(0, 5); // Keep only the 5 most recent
      });
    }

    // Store recent customer name if provided
    if (customerName) {
      setRecentCustomers((prev) => {
        const updated = [
          customerName,
          ...prev.filter((name) => name !== customerName),
        ];
        return updated.slice(0, 5); // Keep only the 5 most recent
      });
    }

    navigate("/orderpage", {
      state: { orderType, tableNumber, buildingName, customerName },
    });
  };

  // Combine recent buildings and locations for suggestions
  const buildingSuggestions = [
    ...recentBuildings,
    ...locations
      .map((location) => location.buildingName)
      .filter((name) => !recentBuildings.includes(name)),
  ].filter((name) => name.toLowerCase().includes(buildingName.toLowerCase()));

  // Combine recent customers and locations (using buildingName as proxy) for suggestions
  const customerSuggestions = [
    ...recentCustomers,
    ...locations
      .map((location) => location.buildingName) // Proxy for customer names
      .filter((name) => !recentCustomers.includes(name)),
  ].filter((name) => name.toLowerCase().includes(customerName.toLowerCase()));

  return (
    <div className="flex flex-row items-start min-h-screen bg-[#F5E8C7]">
      <nav className="w-[145.5px] h-screen fixed top-0 bg-[#FFFCF1] border-r-2 border-black hidden md:block">
        <img
          src="https://res.cloudinary.com/dnoitugnb/image/upload/v1746340828/tmylogo.png"
          alt="Logo"
          className="w-full max-w-[300px] mt-16 mb-16 cursor-pointer"
          onClick={() => navigate("/")}
        />
      </nav>
      <div className="bg-[#FFFCF1] border border-gray-500 w-full min-h-screen flex flex-col items-center p-4 md:pl-[145.5px]">
        <img
          src="https://res.cloudinary.com/dnoitugnb/image/upload/v1747419279/Component_4_vdovyj.svg"
          alt="backarrow"
          className="cursor-pointer absolute top-10 right-10 w-8 h-8 md:w-24 md:h-24"
          onClick={() => navigate("/")}
        />
        <div className="flex justify-center items-center w-full mb-6">
          <img
            src="https://res.cloudinary.com/dnoitugnb/image/upload/v1746340828/tmylogo.png"
            alt="Logo"
            className="w-full max-w-[300px] mt-12 md:mt-16"
          />
        </div>
        {error && (
          <p className="text-red-500 text-center mb-4 text-base md:text-lg">
            {error}
          </p>
        )}
        <form onSubmit={handleConfirm} className="w-full max-w-lg px-4">
          {/* Order Type Buttons */}
          <div className="w-full flex flex-col items-center gap-4 mb-6">
            <div className="flex flex-wrap justify-center gap-3 md:gap-4">
              <span className="text-black text-center flex items-center md:text-lg font-bold text-center">
                Select Order Type:
              </span>
              <button
                type="button"
                onClick={() => setOrderType("dine-in")}
                className={`px-6 py-3 rounded-[20px] border border-gray-500 text-base md:text-lg font-bold transition-all duration-200 min-w-[120px] ${
                  orderType === "dine-in"
                    ? "bg-[#e4d4af] text-black border-gray-700 shadow-md"
                    : "bg-[#FFFCF1] text-black border-gray-500 hover:bg-[#ede7d3]"
                }`}
              >
                Dine-In
              </button>
              <button
                type="button"
                onClick={() => setOrderType("delivery")}
                className={`px-6 py-3 rounded-[20px] border border-gray-500 text-base md:text-lg font-bold transition-all duration-200 min-w-[120px] ${
                  orderType === "delivery"
                    ? "bg-[#e4d4af] text-black border-gray-700 shadow-md"
                    : "bg-[#FFFCF1] text-black border-gray-500 hover:bg-[#ede7d3]"
                }`}
              >
                Delivery
              </button>
            </div>
          </div>

          {/* Table Selection for Dine-In */}
          {orderType === "dine-in" && (
            <div className="mb-6">
              <p className="text-black text-sm md:text-base font-medium mb-2 text-center">
                Table Selection:
              </p>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => {
                  const isOccupied = occupiedTables.includes(num);
                  return (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setTableNumber(num)}
                      className={`px-3 py-2 rounded-full border border-gray-500 text-sm md:text-base font-nunito transition-all duration-200 ${
                        tableNumber === num
                          ? "bg-[#e4d4af] text-black border-gray-700"
                          : isOccupied
                          ? "bg-red-300 text-gray-700 border-gray-700 hover:bg-red-400"
                          : "bg-[#FFFCF1] text-black border-gray-500 hover:bg-[#ede7d3]"
                      }`}
                    >
                      Table {num}
                      {isOccupied && (
                        <span className="ml-1 text-xs font-bold text-red-700"></span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Delivery Fields */}
          {orderType === "delivery" && (
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                {buildingSuggestions.map((name, index) => (
                  <option key={index} value={name} />
                ))}
              </datalist>
              <label className="block text-lg font-medium mb-1 whitespace-nowrap">
                Customer Name:
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
              <datalist id="customerNames">
                {customerSuggestions.map((name, index) => (
                  <option key={index} value={name} />
                ))}
              </datalist>
            </div>
          )}

          {/* Confirm Button */}
          <div className="flex justify-center mt-6">
            <button
              type="submit"
              disabled={!isFormValid}
              className={`px-6 py-3 rounded-[20px] text-black font-bold text-base md:text-lg transition-all duration-200 w-full max-w-[200px] ${
                isFormValid
                  ? "bg-[#e4d4af] hover:bg-[#ede7d3]"
                  : "bg-gray-200 cursor-not-allowed"
              }`}
              style={{ opacity: isFormValid ? 1 : 0.6 }}
            >
              Confirm
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateOrder;
