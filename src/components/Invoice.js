import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import axios from "axios";

function Invoice({ token }) {
  const [orders, setOrders] = useState([]);
  const [foodItems, setFoodItems] = useState({});
  const [paymentMethod, setPaymentMethod] = useState("");
  const [customerNote, setCustomerNote] = useState("");
  const [error, setError] = useState("");
  const { state } = useLocation();
  const { tableno } = useParams();
  const navigate = useNavigate();
  const tableNumber = tableno || state?.tableNumber || "";
  const orderType = state?.orderType || (tableno ? "dine-in" : "delivery");
  const orderId = state?.orderId;

  // Format current date and time
  const currentDateTime = new Date().toLocaleString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch food items to map prices
        const itemsRes = await axios.get(
          "https://tamarmyaybackend-last.onrender.com/api/items",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const itemsMap = itemsRes.data.reduce((acc, item) => {
          acc[item.id] = {
            ...item,
            price: parseFloat(item.price) || 0,
          };
          return acc;
        }, {});
        setFoodItems(itemsMap);
        console.log("Food Items Map:", itemsMap);

        // Fetch orders
        const ordersRes = await axios.get(
          `https://tamarmyaybackend-last.onrender.com/api/orders?status=In Process&tableNumber=${tableNumber}&orderType=${orderType}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        let fetchedOrders = ordersRes.data;
        console.log("Fetched Orders:", fetchedOrders);

        if (orderId) {
          fetchedOrders = fetchedOrders.filter((order) => order.id === orderId);
        }

        // Ensure prices are set
        fetchedOrders = fetchedOrders.map((order) => ({
          ...order,
          FoodItems:
            order.FoodItems?.map((item) => ({
              ...item,
              OrderItem: {
                ...item.OrderItem,
                price:
                  parseFloat(item.OrderItem?.price) ||
                  parseFloat(foodItems[item.id]?.price) ||
                  0,
              },
            })) || [],
        }));

        setOrders(fetchedOrders);
        setError("");
      } catch (err) {
        console.error(
          "Error fetching data:",
          err.response?.data || err.message
        );
        setError(err.response?.data?.error || "Failed to load orders");
      }
    };
    if (tableNumber !== undefined || orderId) {
      fetchData();
    }
  }, [tableNumber, orderType, orderId, token]);

  const handleCheckout = async (orderId) => {
    if (!paymentMethod) {
      setError("Please select a payment method");
      return;
    }
    try {
      await axios.put(
        `https://tamarmyaybackend-last.onrender.com/api/orders/${orderId}`,
        { status: "Completed", paymentMethod, customerNote },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Order completed!");
      navigate("/checkout");
    } catch (err) {
      console.error(
        "Error completing order:",
        err.response?.data || err.message
      );
      setError(err.response?.data?.error || "Failed to complete order");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-row items-start min-h-screen">
      <div
        className="w-full sm:w-[100px] md:w-[145.5px] h-screen fixed top-0 bg-[#FFFCF1] border-r-2 border-black z-[1000] print:hidden"
        style={{ opacity: 1 }}
      >
        <img
          src="https://res.cloudinary.com/dnoitugnb/image/upload/v1746340828/tmylogo.png"
          alt="Logo"
          className="w-full md:max-w-[300px] mt-16 mb-16 cursor-pointer"
          onClick={() => (window.location.href = "/")}
        />
      </div>
      <div className="bg-[#FFFCF1] w-full min-h-screen flex flex-col items-center pl-0 sm:pl-[145.5px] md:pl-40 print:pl-0">
        <img
          src="https://res.cloudinary.com/dnoitugnb/image/upload/v1747419279/Component_4_vdovyj.svg"
          alt="Back arrow"
          className="cursor-pointer absolute top-10 right-10 print:hidden"
          onClick={() => navigate("/checkout")}
          aria-label="Go back to checkout"
        />
        <h2 className="text-2xl sm:text-3xl font-bold text-center uppercase underline my-8 sm:my-16 print:hidden">
          Check Out
        </h2>
        {error && (
          <p className="text-red-500 text-center mb-4 text-sm sm:text-base print:hidden">
            {error}
          </p>
        )}
        {orders.length === 0 && !error && (
          <p className="text-center mb-4 text-sm sm:text-base print:hidden">
            No orders found.
          </p>
        )}
        {orders.map((order) => {
          // Calculate total price with validation
          const totalPrice = (
            order.FoodItems?.reduce((sum, item) => {
              const price =
                parseFloat(item.OrderItem?.price) ||
                parseFloat(foodItems[item.id]?.price) ||
                0;
              const quantity = parseInt(item.OrderItem?.quantity) || 1;
              return sum + price * quantity;
            }, 0) || 0
          ).toFixed(2);

          return (
            <div key={order.id}>
              <div className="w-full max-w-[600px] sm:max-w-[800px] mb-8 flex flex-col items-center px-4 sm:px-0">
                <h3 className="text-lg sm:text-xl font-semibold mb-4 text-left w-full underline print:hidden">
                  {orderType === "dine-in"
                    ? `Invoice for Table ${tableNumber}`
                    : `Invoice for Delivery Order ${order.id}`}
                </h3>
                <div className="border p-4 rounded-lg shadow bg-white w-[295px] min-h-[432px] invoice-container">
                  <div className="flex flex-col justify-between items-start mb-4">
                    <div className="flex flex-col items-center w-full">
                      <img
                        src="https://res.cloudinary.com/dnoitugnb/image/upload/v1746340828/tmylogo.png"
                        alt="Restaurant Logo"
                        className="w-24 sm:w-32 mb-6 mt-6 invoice-logo"
                      />
                      <p className="text-[8px] text-black text-center not-italic font-light">
                        52/345-2 Ek Prachim Road, Lak Hok,
                      </p>
                      <p className="text-[8px] text-black text-center not-italic font-light mb-4">
                        Pathum Thani, 12000
                      </p>
                    </div>
                    <div className="text-xs sm:text-sm text-left">
                      <p className="grid grid-cols-2 gap-2 text-xs">
                        <strong>Order Type:</strong>{" "}
                        {orderType.charAt(0).toUpperCase() + orderType.slice(1)}
                      </p>
                      {orderType === "dine-in" && (
                        <p className="grid grid-cols-2 gap-2 text-xs">
                          <strong>Table No:</strong> {tableNumber}
                        </p>
                      )}
                      <p className="grid grid-cols-2 gap-2 text-xs">
                        <strong>Date & Time:</strong> {currentDateTime}
                      </p>
                      <p className="grid grid-cols-2 gap-2 text-xs">
                        <strong>Order ID:</strong> {order.id}
                      </p>
                    </div>
                  </div>
                  {orderType === "delivery" && (
                    <div className="text-xs sm:text-sm mb-4">
                      <p className="grid grid-cols-2 gap-2 text-xs">
                        <strong>Customer:</strong> {order.customerName || "N/A"}
                      </p>
                      <p className="grid grid-cols-2 gap-2 text-xs">
                        <strong>Building:</strong> {order.buildingName || "N/A"}
                      </p>
                    </div>
                  )}
                  <hr className="my-4 border-gray-300" />
                  <div className="mb-4">
                    <div className="grid grid-cols-3 gap-2 text-xs sm:text-sm font-semibold pb-2 item-grid">
                      <span>Item</span>
                      <span className="text-center">Qty</span>
                      <span className="text-right">Price</span>
                    </div>
                    {order.FoodItems?.map((item) => (
                      <div
                        key={item.id}
                        className="grid grid-cols-3 gap-2 text-xs sm:text-sm py-1 item-grid"
                      >
                        <span>{item.name}</span>
                        <span className="text-center">
                          {item.OrderItem?.quantity || "N/A"}
                        </span>
                        <span className="text-right">
                          {(
                            parseFloat(item.OrderItem?.price) ||
                            parseFloat(foodItems[item.id]?.price) ||
                            0
                          ).toFixed(2)}{" "}
                          B
                        </span>
                      </div>
                    ))}
                  </div>
                  <hr className="my-4 border-gray-300" />
                  <div className="text-right text-sm sm:text-base font-semibold grid grid-cols-2 total-section">
                    <p className="text-left">Total: </p>
                    {totalPrice} B
                  </div>
                  <p className="text-[8px] text-black text-center not-italic font-light mt-6 footer-text">
                    Thank You & See You Again
                  </p>
                </div>
                <div className="w-full mt-8 sm:mt-16 grid grid-cols-1 sm:grid-cols-3 gap-10 sm:gap-8 print:hidden">
                  <div className="flex flex-col">
                    <label className="font-semibold text-sm sm:text-base underline mb-2 whitespace-nowrap">
                      Select Payment Method
                    </label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="p-2 border rounded text-sm sm:text-base"
                      aria-label="Select payment method"
                    >
                      <option value="">Select Payment Method</option>
                      <option value="Cash">Cash</option>
                      <option value="Card">Card</option>
                      <option value="Mobile">Mobile</option>
                    </select>
                  </div>
                  <div className="flex flex-col">
                    <label className="font-semibold text-sm sm:text-base underline mb-2">
                      Customer Note
                    </label>
                    <textarea
                      value={customerNote}
                      onChange={(e) => setCustomerNote(e.target.value)}
                      placeholder="Enter customer note"
                      className="w-[230px] h-[43px] p-2 border rounded text-sm sm:text-base resize-none"
                      aria-label="Customer note"
                    />
                  </div>
                  <div className="flex flex-col gap-4">
                    <button
                      onClick={() => handleCheckout(order.id)}
                      className="w-[125px] h-[50px] bg-[#DCC99B]/70 text-black rounded-[20px] font-semibold hover:bg-[#DCC99B]/80 text-sm sm:text-base"
                    >
                      Complete Order
                    </button>
                    <button
                      onClick={handlePrint}
                      className="w-[125px] h-[50px] bg-[#DCC99B]/70 text-black rounded-[20px] font-semibold hover:bg-[#DCC99B]/80 text-sm sm:text-base"
                    >
                      Print
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Invoice;
