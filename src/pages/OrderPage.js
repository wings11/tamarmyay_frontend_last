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
  const [isMenuOpen, setIsMenuOpen] = useState(false); // State for toggling menu

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
          `${API_URL}/api/items/categories`,
          { headers: { Authorization: `Bearer ${token}` } }
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
  }, [token, API_URL]);

  // Fetch food items when selectedCategory changes
  useEffect(() => {
    const fetchFoodItems = async () => {
      try {
        const url = selectedCategory
          ? `${API_URL}/api/items/category/${encodeURIComponent(
              selectedCategory
            )}`
          : `${API_URL}/api/items`;
        const res = await axios.get(url, {
          headers: { Authorization: `Bearer ${token}` },
        });
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
  }, [selectedCategory, token, API_URL]);

  const handleCheckOrder = () => {
    if (orderItems.length === 0) {
      setError("Please select at least one item before checking the order");
      return;
    }
    navigate("/orderpage/checkorder", {
      state: { orderItems, orderType, tableNumber, buildingName, customerName },
    });
  };

  const handleForward = () => {
    if (orderItems.length === 0) {
      setError("Please select at least one item before checking the order");
      return;
    }
    navigate("/orderpage/checkorder", {
      state: { orderItems, orderType, tableNumber, buildingName, customerName },
    });
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#FFFCF1] md:flex-row">
      {/* Hamburger Menu Icon for Mobile */}
      <div className="md:hidden flex items-center justify-between p-4  z-20">
        <i
          className="bi bi-list text-3xl cursor-pointer"
          onClick={toggleMenu}
        ></i>
        <img
          src="https://res.cloudinary.com/dnoitugnb/image/upload/v1747419279/Component_4_vdovyj.svg"
          alt="backarrow"
          className="cursor-pointer w-8 h-8"
          onClick={() => navigate("/createorder")}
        />
      </div>

      {/* Overlay for Mobile */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-10 md:hidden"
          onClick={toggleMenu}
        ></div>
      )}

      {/* Category Navbar - Slides in/out on mobile */}
      <div
        className={`fixed top-0 left-0 w-64 md:w-[145.5px] h-screen bg-[#FFFCF1] border-r-2 border-black z-20 md:z-[1000] transform transition-transform duration-300 ease-in-out  ${
          isMenuOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
      >
        <div className="flex justify-end p-4 md:hidden">
          <i
            className="bi bi-x text-3xl cursor-pointer z-20"
            onClick={toggleMenu}
          ></i>
        </div>
        <CategoryNavbar
          categories={categories}
          selectedCategory={selectedCategory}
          isFormValid={isFormValid}
          setSelectedCategory={setSelectedCategory}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center p-4 md:ml-[25%] lg:ml-[20%] md:p-6">
        <img
          src="https://res.cloudinary.com/dnoitugnb/image/upload/v1747419279/Component_4_vdovyj.svg"
          alt="backarrow"
          className="cursor-pointer hidden md:block absolute top-4 right-4 md:top-6 md:right-6 w-8 h-8"
          onClick={() => navigate("/createorder")}
        />
        <img
          src="https://res.cloudinary.com/dnoitugnb/image/upload/v1747419279/Component_4_vdovyj.svg"
          alt="forwardarrow"
          className="cursor-pointer fixed bottom-4 right-4 md:bottom-6 md:right-6 w-8 h-8 transform rotate-180"
          onClick={handleForward}
        />
        <h3 className="text-black text-center text-xl md:text-3xl font-bold uppercase underline my-6 md:my-10">
          {selectedCategory || "All"}
        </h3>
        {error && (
          <p className="text-red-500 text-center mb-4 text-sm md:text-base">
            {error}
          </p>
        )}
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
          className={`mt-4 px-4 py-2 md:px-6 md:py-3 rounded-full text-black font-bold text-sm md:text-base ${
            orderItems.length > 0
              ? "bg-[#E0C9A6] hover:bg-gray-600 hover:text-white"
              : "bg-gray-400 cursor-not-allowed"
          }`}
        >
          Check Order
        </button>
      </div>
    </div>
  );
}

export default OrderPage;
