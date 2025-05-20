// src/pages/OrderPage.js
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import CategoryNavbar from "../components/CategoryNavbar";
import FoodItems from "../components/FoodItems";

function OrderPage({ token, orderItems, setOrderItems }) {
  const location = useLocation();
  const navigate = useNavigate();

  // Extract state with fallback
  const {
    orderType = "",
    tableNumber = "",
    buildingName = "",
    customerName = "",
  } = location.state || {};

  const [foodItems, setFoodItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [error, setError] = useState("");
  const [isFormValid] = useState(true);

  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

  // Redirect to CreateOrder if state is missing
  useEffect(() => {
    if (!orderType) {
      setError("Please select an order type first");
      navigate("/createorder");
    }
  }, [orderType, navigate]);

  // Fetch categories on mount
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const categoriesRes = await axios.get(
          `${API_URL}/api/items/categories`
        );
        setCategories(categoriesRes.data);
        setSelectedCategory(categoriesRes.data[0] || "");
      } catch (err) {
        console.error(
          "Error fetching categories:",
          err.response?.data || err.message
        );
        setError("Failed to load categories");
      }
    };
    fetchInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // API_URL is constant, so we can safely ignore it

  // Fetch food items when selectedCategory changes
  useEffect(() => {
    const fetchFoodItems = async () => {
      try {
        const url = selectedCategory
          ? `${API_URL}/api/items/category/${encodeURIComponent(
              selectedCategory
            )}`
          : `${API_URL}/api/items`;
        const res = await axios.get(url);
        setFoodItems(res.data);
      } catch (err) {
        console.error(
          "Error fetching food items:",
          err.response?.data || err.message
        );
        setError("Failed to load food items");
      }
    };
    if (selectedCategory) {
      fetchFoodItems();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory]); // API_URL is constant, so we can safely ignore it

  const handleCheckOrder = () => {
    navigate("/orderpage/checkorder", {
      state: { orderItems, orderType, tableNumber, buildingName, customerName },
    });
  };

  const handleForward = () => {
    navigate("/orderpage/checkorder", {
      state: { orderItems, orderType, tableNumber, buildingName, customerName },
    });
  };

  return (
    <div className="flex flex-row ">
      <CategoryNavbar
        categories={categories}
        selectedCategory={selectedCategory}
        isFormValid={isFormValid}
        setSelectedCategory={setSelectedCategory}
      />
      <div className="bg-[#FFFCF1] w-full min-h-screen  flex flex-col items-center">
        <img
          src="https://res.cloudinary.com/dnoitugnb/image/upload/v1747419279/Component_4_vdovyj.svg"
          alt="backarrow"
          className="cursor-pointer absolute top-10 right-10"
          onClick={() => navigate("/createorder")}
        />
        <img
          src="https://res.cloudinary.com/dnoitugnb/image/upload/v1747419279/Component_4_vdovyj.svg"
          alt="forwardarrow"
          className="cursor-pointer transform fixed bottom-5 right-10 rotate-180"
          onClick={handleForward}
        />
        <h3 className="p-20  text-black text-center text-3xl not-italic font-bold uppercase underline">
          {selectedCategory || "All"}
        </h3>
        {error && <p className="error">{error}</p>}
        <>
          <FoodItems
            foodItems={foodItems}
            selectedCategory={selectedCategory}
            isFormValid={isFormValid}
            orderItems={orderItems}
            setOrderItems={setOrderItems}
          />
          <button
            onClick={handleCheckOrder}
            disabled={orderItems.length === 0}
            className={`mt-4 px-6 py-2 rounded-[20px] text-black font-bold ${
              orderItems.length > 0
                ? "bg-[#E0C9A6] hover:bg-gray-600 hover:text-white"
                : "bg-gray-400  cursor-not-allowed"
            }`}
          >
            Check Order
          </button>
        </>
      </div>
    </div>
  );
}

export default OrderPage;
