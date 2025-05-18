import React, { useState, useEffect } from "react";
import axios from "axios";
import CategoryNavbar from "./CategoryNavbar";
import FoodItems from "./FoodItems";
import OrderItems from "./OrderItems";
import CreateOrderButton from "./CreateOrderButton";

function CreateOrder({ token }) {
  const [foodItems, setFoodItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [orderItems, setOrderItems] = useState([]);
  const [orderType, setOrderType] = useState("");
  const [tableNumber, setTableNumber] = useState("");
  const [buildingName, setBuildingName] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [tables, setTables] = useState([]);
  const [locations, setLocations] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isFormValid, setIsFormValid] = useState(false);

  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

  // Fetch tables, locations, and categories on mount
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Fetch tables
        const tablesRes = await axios.get(`${API_URL}/api/tables`);
        setTables(tablesRes.data);

        // Fetch locations
        const locationsRes = await axios.get(`${API_URL}/api/locations`);
        setLocations(locationsRes.data);

        // Fetch categories
        const categoriesRes = await axios.get(
          `${API_URL}/api/items/categories`
        );
        setCategories(categoriesRes.data);
        setSelectedCategory(categoriesRes.data[0] || "");
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
  }, []);

  // Validate form
  useEffect(() => {
    const isValid =
      orderType && (orderType === "dine-in" ? tableNumber : buildingName);
    setIsFormValid(isValid);
  }, [orderType, tableNumber, buildingName, customerName]);

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
    if (selectedCategory && isFormValid) {
      fetchFoodItems();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory, isFormValid]);

  const handleAddItem = (foodItem) => {
    setOrderItems((prev) => {
      const existing = prev.find((item) => item.foodItem.id === foodItem.id);
      if (existing) {
        return prev.map((item) =>
          item.foodItem.id === foodItem.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { foodItem, quantity: 1 }];
    });
  };

  const handleRemoveItem = (foodItemId) => {
    setOrderItems((prev) =>
      prev.filter((item) => item.foodItem.id !== foodItemId)
    );
  };

  const handleQuantityChange = (foodItemId, quantity) => {
    setOrderItems((prev) =>
      prev.map((item) =>
        item.foodItem.id === foodItemId
          ? { ...item, quantity: parseInt(quantity) }
          : item
      )
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!isFormValid) {
      setError("Please fill all required fields");
      return;
    }
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
      setSuccess("Order created successfully!");
      setOrderItems([]);
      setOrderType("");
      setTableNumber("");
      setBuildingName("");
      setCustomerName("");
      setSelectedCategory(categories[0] || "");
      setFoodItems([]);
      setIsFormValid(false);
    } catch (err) {
      console.error("Error creating order:", err.response?.data || err.message);
      setError(err.response?.data?.error || "Failed to create order");
    }
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
      {success && <p className="success">{success}</p>}

      <form onSubmit={handleSubmit}>
        {/* Order Type Buttons (both always visible) */}
        <div className="mb-4 flex gap-4">
          <span className="px-4 py-2 text-black text-center text-xl not-italic font-bold ">
            {" "}
            Select Order Type:
          </span>
          <button
            type="button"
            onClick={() => setOrderType("dine-in")}
            className={`px-4 py-2 rounded-[20px] border border-gray-500 text-black text-center text-xl not-italic font-bold transition-all duration-200 ${
              orderType === "dine-in"
                ? "bg-[#FFF9E3] text-green border-gray-700 shadow-md"
                : "bg-[#FFF9E3] text-black border-gray-500 hover:bg-gray-300/90"
            }`}
          >
            Dine-In
          </button>
          <button
            type="button"
            onClick={() => setOrderType("delivery")}
            className={`px-4 py-2 rounded-[20px] border border-gray-500 text-black text-center text-xl not-italic font-bold transition-all duration-200 ${
              orderType === "delivery"
                ? "bg-[#FFF9E3] text-white border-gray-700 shadow-md"
                : "bg-[#FFF9E3] text-black border-gray-500 hover:bg-gray-300/90"
            }`}
          >
            Delivery
          </button>
        </div>

        {/* Table Selection as Buttons (visible only for Dine-In) */}
        {orderType === "dine-in" && (
          <div className="mb-4 flex flex-wrap gap-2">
            {tables.map((table) => (
              <button
                key={table.id}
                type="button"
                onClick={() => setTableNumber(table.tableNumber)}
                className={`px-4 py-2 rounded-[20px] border border-gray-500 ${
                  tableNumber === table.tableNumber
                    ? "bg-gray-300 text-white"
                    : "bg-gray-200/50 text-black"
                } font-nunito text-lg`}
              >
                Table {table.tableNumber}
              </button>
            ))}
          </div>
        )}

        {/* Delivery Fields (visible only for Delivery) */}
        {orderType === "delivery" && (
          <div>
            <label>Building Name:</label>
            <input
              type="text"
              list="buildingNames"
              value={buildingName}
              onChange={(e) => setBuildingName(e.target.value)}
              required
            />
            <datalist id="buildingNames">
              {locations.map((location) => (
                <option key={location.id} value={location.buildingName} />
              ))}
            </datalist>
            <div>
              <label>Customer Name:</label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                required
              />
            </div>
          </div>
        )}

        <CategoryNavbar
          categories={categories}
          selectedCategory={selectedCategory}
          isFormValid={isFormValid}
          setSelectedCategory={setSelectedCategory}
        />
        <FoodItems
          foodItems={foodItems}
          selectedCategory={selectedCategory}
          isFormValid={isFormValid}
          handleAddItem={handleAddItem}
        />
        <OrderItems
          orderItems={orderItems}
          handleRemoveItem={handleRemoveItem}
          handleQuantityChange={handleQuantityChange}
        />
        <CreateOrderButton isFormValid={isFormValid} orderItems={orderItems} />
      </form>
    </div>
  );
}

export default CreateOrder;
