import React from "react";

function CreateOrderButton({ isFormValid, orderItems }) {
  return (
    <button type="submit" disabled={orderItems.length === 0 || !isFormValid}>
      Create Order
    </button>
  );
}

export default CreateOrderButton;
