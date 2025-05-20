import React from "react";

function FoodItems({
  foodItems,
  selectedCategory,
  isFormValid,
  orderItems,
  setOrderItems,
}) {
  const handleItemClick = (foodItem) => {
    setOrderItems((prev) => {
      const existing = prev.find((item) => item.foodItem.id === foodItem.id);
      if (existing) {
        // Remove the item if already selected
        return prev.filter((item) => item.foodItem.id !== foodItem.id);
      }
      // Add the item with quantity 1 if not selected
      return [...prev, { foodItem, quantity: 1 }];
    });
  };

  return (
    <div className={`mb-5 ${isFormValid ? "opacity-100" : "opacity-50"}`}>
      {foodItems.length === 0 && isFormValid ? (
        <p>No items available</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-10">
          {foodItems.map((item) => (
            <div
              key={item.id}
              className={`border rounded-[30px] border-gray-500 w-[140px] h-[90px] rounded-md cursor-pointer transition-colors grid place-items-center shadow-md ${
                orderItems.some(
                  (orderItem) => orderItem.foodItem.id === item.id
                )
                  ? "bg-[#e4d4af] text-black border-gray-700"
                  : "bg-transparent hover:bg-gray-100"
              }`}
              onClick={() => isFormValid && handleItemClick(item)}
            >
              <h4 className="text-md font-medium">{item.name}</h4>
              <p>Price: {item.price} ฿</p>
              <p>{item.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default FoodItems;
