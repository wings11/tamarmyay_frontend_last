// src/components/FoodItems.js
import React from "react";

function FoodItems({
  foodItems,
  selectedCategory,
  isFormValid,
  orderItems,
  setOrderItems,
}) {
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

  return (
    <div className={`mb-5 ${isFormValid ? "opacity-100" : "opacity-50"}`}>
      <h3 className="text-lg font-semibold mb-2">
        Menu ({selectedCategory || "All"})
      </h3>
      {foodItems.length === 0 && isFormValid ? (
        <p>No items available</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {foodItems.map((item) => (
            <div
              key={item.id}
              className={`border border-gray-300 p-4 rounded-md cursor-pointer transition-colors ${
                orderItems.some(
                  (orderItem) => orderItem.foodItem.id === item.id
                )
                  ? "bg-green-500 text-white"
                  : "bg-white hover:bg-gray-100"
              }`}
              onClick={() => isFormValid && handleAddItem(item)}
            >
              <h4 className="text-md font-medium">{item.name}</h4>
              <p>Price: ${item.price}</p>
              <p>{item.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default FoodItems;
