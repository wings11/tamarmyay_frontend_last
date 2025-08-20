import React, { useState, useEffect } from "react";
import axios from "axios";

function AddFoodItem({ token, mode, onComplete }) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [categories, setCategories] = useState([]);
  const [foodItems, setFoodItems] = useState([]);
  const [selectedItemId, setSelectedItemId] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const categoriesRes = await axios.get(
          "https://tamarmyaybackend-last.onrender.com/api/items/categories"
        );
        setCategories(categoriesRes.data);
        setCategory(categoriesRes.data[0] || "");

        const itemsRes = await axios.get(
          "https://tamarmyaybackend-last.onrender.com/api/items",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setFoodItems(itemsRes.data);
      } catch (err) {
        console.error(
          "Error fetching data:",
          err.response?.data || err.message
        );
        setError("Failed to load categories or items");
      }
    };
    fetchData();
  }, [token]);

  const handleSelectItem = (itemId) => {
    const item = foodItems.find((i) => i.id === parseInt(itemId));
    if (item) {
      setSelectedItemId(item.id);
      setName(item.name);
      setCategory(item.category);
      setPrice(item.price.toString());
      setDescription(item.description || "");
    } else {
      setSelectedItemId("");
      setName("");
      setCategory(categories[0] || "");
      setPrice("");
      setDescription("");
    }
  };

  const resetForm = () => {
    setSelectedItemId("");
    setName("");
    setCategory(categories[0] || "");
    setPrice("");
    setDescription("");
    setError("");
    setSuccess("");
  };

  const handleCancel = () => {
    resetForm();
    onComplete(); // Close modal
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (mode === "delete") {
      if (!selectedItemId) {
        setError("Please select an item to delete");
        return;
      }
      try {
        await axios.delete(
          `https://tamarmyaybackend-last.onrender.com/api/items/${selectedItemId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSuccess("မီနူးဖျက်ခြင်းအောင်မြင်ပါသည်");
        setFoodItems((prev) =>
          prev.filter((item) => item.id !== selectedItemId)
        );
        resetForm();
        onComplete(); // Close modal
      } catch (err) {
        console.error(
          "Error deleting food item:",
          err.response?.data || err.message
        );
        setError(err.response?.data?.error || "Failed to delete food item");
      }
      return;
    }

    const payload = {
      name,
      category,
      price: parseFloat(price) || 0,
      description,
    };

    try {
      if (mode === "edit" && selectedItemId) {
        await axios.put(
          `https://tamarmyaybackend-last.onrender.com/api/items/${selectedItemId}`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSuccess("မီနူးပြင်ခြင်းအောင်မြင်ပါသည်");
        setFoodItems((prev) =>
          prev.map((item) =>
            item.id === selectedItemId ? { ...item, ...payload } : item
          )
        );
      } else if (mode === "add") {
        const res = await axios.post(
          "https://tamarmyaybackend-last.onrender.com/api/items",
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSuccess("မီနူးထည့်ခြင်းအောင်မြင်ပါသည်");
        setFoodItems((prev) => [...prev, res.data]);
      } else {
        setError("Invalid mode or no item selected for edit");
        return;
      }

      resetForm();
      onComplete(); // Close modal
    } catch (err) {
      console.error(
        "Error saving food item:",
        err.response?.data || err.message
      );
      setError(err.response?.data?.error || "Failed to save food item");
    }
  };

  return (
    <div className="p-4">
      {/* <h2 className="text-2xl font-bold mb-4">
        {mode === "add" && "Add Food Item"}
        {mode === "edit" && "Edit Food Item"}
        {mode === "delete" && "Delete Food Item"}
      </h2> */}
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {success && <p className="text-green-500 mb-4">{success}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        {(mode === "edit" || mode === "delete") && (
          <div className="flex flex-row justify-between">
            <label className="block font-medium flex items-center h-[51px] whitespace-nowrap">
              ပြင်မည့်/ဖျက်မည့်မီနူးကိုရွေးပါ
            </label>
            <select
              value={selectedItemId}
              onChange={(e) => handleSelectItem(e.target.value)}
              className=" p-2 border rounded w-[418px] h-[51px]"
              required={mode === "delete" || mode === "edit"}
            >
              <option value="">Select Item</option>
              {foodItems.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name} ({item.category})
                </option>
              ))}
            </select>
          </div>
        )}
        {(mode === "add" || (mode === "edit" && selectedItemId)) && (
          <>
            <div className="flex flex-row justify-between ">
              <label className="block font-medium flex items-center h-[51px]">
                နာမည်
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className=" p-2 border rounded w-[418px] h-[51px]"
              />
            </div>
            <div className="flex flex-row justify-between">
              <label className="block font-medium flex items-center h-[51px]">
                အမျိုးအစား
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
                className="p-2 border rounded w-[418px] h-[51px]"
              >
                <option value="">ရွေးပါ</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-row justify-between">
              <label className="block font-medium flex items-center h-[51px] whitespace-nowrap">
                စျေးနှုန်း (Baht):
              </label>
              <input
                type="number"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
                className=" p-2 border rounded w-[418px] h-[51px]"
              />
            </div>
            <div className="flex flex-row justify-between">
              <label className="block font-medium flex items-center h-[51px]">
                Description:
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className=" p-2 border rounded w-[418px] h-[51px]"
              />
            </div>
          </>
        )}
        <div className="flex flex-col items-center gap-4">
          <button
            type="submit"
            className="px-4 py-2 bg-[#DCC99B]/50 text-black rounded hover:bg-[#DCC99B]/80"
          >
            {mode === "add" && "ထည့်မယ်"}
            {mode === "edit" && "ပြင်မယ်"}
            {mode === "delete" && "ဖျက်မယ်"}
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="px-4 py-2 bg-[#DCC99B]/50 text-black rounded hover:bg-[#DCC99B]/80"
          >
            မလုပ်တော့ပါ
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddFoodItem;
