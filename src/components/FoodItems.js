import React from "react";

function FoodItems({
  foodItems,
  selectedCategory,
  isFormValid,
  handleAddItem,
}) {
  return (
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
  );
}

export default FoodItems;
