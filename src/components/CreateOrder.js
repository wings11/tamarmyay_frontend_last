import React, { useState, useEffect } from "react";
import axios from "axios";

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
    <div>
      <h2>Create Order</h2>
      {error && <p className="error">{error}</p>}
      {success && <p className="success">{success}</p>}

      <form onSubmit={handleSubmit}>
        {/* Order Type */}
        <div>
          <label>Order Type:</label>
          <select
            value={orderType}
            onChange={(e) => setOrderType(e.target.value)}
            required
          >
            <option value="">Select Order Type</option>
            <option value="dine-in">Dine-In</option>
            <option value="delivery">Delivery</option>
          </select>
        </div>

        {/* Table Number or Building Name */}
        {orderType === "dine-in" && (
          <div>
            <label>Table Number:</label>
            <select
              value={tableNumber}
              onChange={(e) => setTableNumber(e.target.value)}
              required
            >
              <option value="">Select Table</option>
              {tables.map((table) => (
                <option key={table.id} value={table.tableNumber}>
                  {table.tableNumber}
                </option>
              ))}
            </select>
          </div>
        )}
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

            {/* Customer Name */}
            <div>
              <br></br>
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

        {/* Category Navbar */}
        <nav style={{ marginBottom: "20px", opacity: isFormValid ? 1 : 0.5 }}>
          <ul
            style={{
              listStyle: "none",
              display: "flex",
              gap: "10px",
              padding: 0,
              flexWrap: "wrap",
            }}
          >
            {categories.map((cat) => (
              <li key={cat}>
                <button
                  type="button"
                  style={{
                    padding: "10px",
                    background:
                      selectedCategory === cat ? "#007bff" : "#f8f9fa",
                    color: selectedCategory === cat ? "#fff" : "#000",
                    border: "none",
                    cursor: isFormValid ? "pointer" : "not-allowed",
                    borderRadius: "5px",
                  }}
                  onClick={() => isFormValid && setSelectedCategory(cat)}
                  disabled={!isFormValid}
                >
                  {cat}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Food Items */}
        <div style={{ marginBottom: "20px", opacity: isFormValid ? 1 : 0.5 }}>
          <h3>Menu ({selectedCategory || "All"})</h3>
          {foodItems.length === 0 && isFormValid ? (
            <p>No items available</p>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                gap: "10px",
              }}
            >
              {foodItems.map((item) => (
                <div
                  key={item.id}
                  style={{
                    border: "1px solid #ddd",
                    padding: "10px",
                    borderRadius: "5px",
                  }}
                >
                  <h4>{item.name}</h4>
                  <p>Price: ${item.price}</p>
                  <p>{item.description}</p>
                  <button
                    className="btnbtn"
                    type="button"
                    onClick={() => handleAddItem(item)}
                    disabled={!isFormValid}
                  >
                    Add to Order
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Order Items */}
        <div>
          <h3>Order Items</h3>
          {orderItems.length === 0 ? (
            <p>No items added</p>
          ) : (
            <ul>
              {orderItems.map((item) => (
                <li key={item.foodItem.id}>
                  {item.foodItem.name} - ${item.foodItem.price} x
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) =>
                      handleQuantityChange(item.foodItem.id, e.target.value)
                    }
                    style={{ width: "50px", margin: "0 10px" }}
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(item.foodItem.id)}
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <button
          type="submit"
          disabled={orderItems.length === 0 || !isFormValid}
        >
          Create Order
        </button>
      </form>
    </div>
  );
}

export default CreateOrder;
