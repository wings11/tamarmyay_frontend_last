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
  const [showAlert, setShowAlert] = useState(false);

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
      const payload = {
        orderType,
        tableNumber: orderType === "dine-in" ? tableNumber : null,
        buildingName: orderType === "delivery" ? buildingName : null,
        customerName: orderType === "delivery" ? customerName : null,
        items: orderItems.map(({ foodItem, quantity }) => ({
          foodItem: { id: foodItem.id },
          quantity,
        })),
      };
      await axios.post(`${API_URL}/api/orders`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      resetOrderItems();
      setSuccess("Order created successfully!");
      setShowAlert(true);
    } catch (err) {
      console.error("Error creating order:", err.response?.data || err.message);
      setError(err.response?.data?.error || "Failed to create order");
    }
  };

  const handleAlertClose = () => {
    setShowAlert(false);
    navigate("/", {
      state: {
        tableNumber,
        orderType,
        buildingName,
        customerName,
      },
    });
  };

  return (
    <div className="flex flex-row items-center">
      <nav
        className="w-[160px] h-screen bg-[#FFFCF1] border-r-2 border-black"
        style={{ opacity: 1 }}
      >
        <img
          src="https://res.cloudinary.com/dnoitugnb/image/upload/v1746340828/tmylogo.png"
          alt="Logo"
          className="w-full md:max-w-[300px] mt-16 mb-16"
          onClick={() => navigate("/")}
        />
      </nav>
      <div className="bg-[#FFFCF1] border border-grey-500 w-full min-h-screen flex flex-col items-center">
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
        <h3 className="p-20 text-black text-center text-3xl not-italic font-bold uppercase underline -translate-x-20">
          အော်ဒါစစ်ရန်
        </h3>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        {success && (
          <p className="text-green-500 text-center mb-4">{success}</p>
        )}
        <div className="w-[453px] max-w-2xl p-4 bg-transparent rounded-lg shadow-lg -translate-x-20 mt-6">
          <div className="grid grid-cols-2 gap-4">
            <h3 className="text-black text-center text-lg not-italic font-bold">
              Items
            </h3>
            <h3 className="text-lg font-semibold">အရေအတွက်</h3>
          </div>
          {orderItems.map((item) => (
            <div key={item.foodItem.id} className="grid grid-cols-2 gap-4 py-2">
              <span className="text-md">{item.foodItem.name}</span>
              <div className="flex items-center space-x-2">
                <button
                  className="px-2 bg-transparent rounded-[180px] border border-black hover:bg-gray-300"
                  onClick={() =>
                    handleQuantityChange(item.foodItem.id, item.quantity + 1)
                  }
                >
                  +
                </button>
                <span className="text-md">{item.quantity}</span>
                <button
                  className="px-2 bg-transparent rounded-[180px] border border-black hover:bg-gray-300"
                  onClick={() =>
                    handleQuantityChange(
                      item.foodItem.id,
                      Math.max(1, item.quantity - 1)
                    )
                  }
                >
                  -
                </button>
                <button
                  className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                  onClick={() => handleRemoveItem(item.foodItem.id)}
                >
                  ဖျက်ပါ
                </button>
              </div>
            </div>
          ))}
        </div>
        <button
          onClick={handleSubmit}
          disabled={orderItems.length === 0}
          className={`mt-6 w-[160px] h-[55px] rounded-[25px] text-black font-semibold border border-gray-600 -translate-x-20 ${
            orderItems.length > 0
              ? "bg-[#DCC99B] hover:bg-[#DCC99B]/80"
              : "bg-gray-400 cursor-not-allowed"
          }`}
        >
          အော်ဒါတင်မယ်
        </button>
        {/* Custom Alert Modal */}
        {showAlert && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center z-50">
            <div className="bg-[#fff9e3] p-6 rounded-lg shadow-lg max-w-sm w-[487px] h-32 flex flex-col justify-center">
              <h3 className="text-black text-center text-xl not-italic font-semibold">
                အော်ဒါကိုအောင်မြင်စွာဖန်တီးပြီးပါပြီ!
              </h3>
            </div>
            <button
              onClick={handleAlertClose}
              className="w-[160px] h-[55px] mt-10 bg-[#DCC99B] text-black rounded-[25px] font-semibold hover:bg-[#DCC99B]/80"
            >
              Back to Home
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default CheckOrder;
