// src/pages/CheckOrder.js
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

function CheckOrder({ token, orderItems, setOrderItems, resetOrderItems }) {
  const location = useLocation();
  const navigate = useNavigate();

  // Extract state with fallback
  const {
    orderType = "",
    tableNumber = "",
    buildingName = "",
    customerName = "",
  } = location.state || {};

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showAlert, setShowAlert] = useState(false); // State for alert visibility

  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

  // Redirect to OrderPage if state is missing
  useEffect(() => {
    if (!orderType) {
      setError("Please select an order type first");
      navigate("/orderpage");
    }
  }, [orderType, navigate]);

  const handleRemoveItem = (foodItemId) => {
    setOrderItems((prev) =>
      prev.filter((item) => item.foodItem.id !== foodItemId)
    );
  };

  const handleQuantityChange = (foodItemId, quantity) => {
    setOrderItems((prev) =>
      prev.map((item) =>
        item.foodItem.id === foodItemId
          ? { ...item, quantity: parseInt(quantity) || 1 }
          : item
      )
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (orderItems.length === 0) {
      setError("Please add at least one item to the order");
      return;
    }
    try {
      await axios.post(
        `${API_URL}/api/orders`,
        {
          orderType,
          tableNumber: orderType === "dine-in" ? parseInt(tableNumber) : null,
          buildingName: orderType === "delivery" ? buildingName : null,
          customerName,
          items: orderItems,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      resetOrderItems(); // Clear orderItems after submission
      setShowAlert(true); // Show the custom alert
    } catch (err) {
      console.error("Error creating order:", err.response?.data || err.message);
      setError(err.response?.data?.error || "Failed to create order");
    }
  };

  const handleAlertClose = () => {
    setShowAlert(false);
    navigate("/"); // Navigate to HomePage
  };

  return (
    <div className="bg-[#FFFCF1] w-full min-h-screen flex flex-col items-center">
      <img
        src="https://res.cloudinary.com/dnoitugnb/image/upload/v1747419279/Component_4_vdovyj.svg"
        alt="backarrow"
        className="cursor-pointer absolute top-10 right-10"
        onClick={() =>
          navigate("/orderpage", {
            state: {
              orderItems,
              orderType,
              tableNumber,
              buildingName,
              customerName,
            },
          })
        }
      />
      <img
        src="https://res.cloudinary.com/dnoitugnb/image/upload/v1746340828/tmylogo.png"
        alt="Logo"
        className="w-full md:max-w-[500px] mt-20"
      />
      {error && <p className="error">{error}</p>}
      {success && <p className="success">{success}</p>}

      <div className="w-full max-w-2xl p-4 bg-white rounded-lg shadow-md mt-6">
        <div className="grid grid-cols-2 gap-4">
          <h3 className="text-lg font-semibold">Items</h3>
          <h3 className="text-lg font-semibold">Quantity</h3>
        </div>
        {orderItems.map((item) => (
          <div key={item.foodItem.id} className="grid grid-cols-2 gap-4 py-2">
            <span className="text-md">{item.foodItem.name}</span>
            <div className="flex items-center space-x-2">
              <button
                className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                onClick={() =>
                  handleQuantityChange(
                    item.foodItem.id,
                    Math.max(1, item.quantity - 1)
                  )
                }
              >
                -
              </button>
              <span className="text-md">{item.quantity}</span>
              <button
                className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                onClick={() =>
                  handleQuantityChange(item.foodItem.id, item.quantity + 1)
                }
              >
                +
              </button>
              <button
                className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                onClick={() => handleRemoveItem(item.foodItem.id)}
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
      <button
        onClick={handleSubmit}
        disabled={orderItems.length === 0}
        className={`mt-6 px-6 py-3 rounded-[25px] text-white font-semibold ${
          orderItems.length > 0
            ? "bg-[#DCC99B] hover:bg-[#DCC99B]/80"
            : "bg-gray-400 cursor-not-allowed"
        }`}
      >
        Send Order
      </button>

      {/* Custom Alert Modal */}
      {showAlert && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
            <h3 className="text-lg font-semibold text-center mb-4">
              Order created successfully!
            </h3>
          </div>
          <button
            onClick={handleAlertClose}
            className="w-50 px-4 py-2 bg-[#DCC99B] text-white rounded-[25px] font-semibold hover:bg-[#DCC99B]/80"
          >
            Back to Home Page
          </button>
        </div>
      )}
    </div>
  );
}

export default CheckOrder;
