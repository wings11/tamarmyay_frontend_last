import React from "react";

function OrderItems({ orderItems, handleRemoveItem, handleQuantityChange }) {
  return (
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
  );
}

export default OrderItems;
