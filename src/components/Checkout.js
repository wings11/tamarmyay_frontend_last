import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Checkout({ token }) {
  const [tables, setTables] = useState([]);
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");
  const [orderType, setOrderType] = useState("dine-in"); // State for order type
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTables = async () => {
      try {
        const res = await axios.get(
          "https://tamarmyaybackend-last.onrender.com/api/tables"
        );
        setTables(res.data);
      } catch (err) {
        console.error(
          "Error fetching tables:",
          err.response?.data || err.message
        );
        setError(
          "Failed to load tables. Please check if the backend is running."
        );
      }
    };
    fetchTables();
  }, []);

  const fetchOrders = async (tableNumber, type) => {
    try {
      const res = await axios.get(
        `https://tamarmyaybackend-last.onrender.com/api/orders?status=In Process&tableNumber=${tableNumber}&orderType=${type}`
      );
      setOrders(res.data);
      setError("");
    } catch (err) {
      console.error(
        "Error fetching orders:",
        err.response?.data || err.message
      );
      setError(err.response?.data?.error || "Failed to load orders");
    }
  };

  const handleTableClick = (tableNumber) => {
    navigate("/invoice", { state: { tableNumber, orderType } });
  };

  const handleOrderTypeChange = (type) => {
    setOrderType(type);
    setOrders([]); // Clear orders when order type changes
  };

  return (
    <div className="flex flex-row items-center">
      <div
        className="w-[145.5px] h-screen fixed top-0 bg-[#FFFCF1] border-r-2 border-black"
        style={{ opacity: 1, zIndex: 1000 }}
      >
        <img
          src="https://res.cloudinary.com/dnoitugnb/image/upload/v1746340828/tmylogo.png"
          alt="Logo"
          className="w-full md:max-w-[300px] mt-16 mb-16 cursor-pointer"
          onClick={() => (window.location.href = "/")}
        />
        <ul className="flex flex-col items-center gap-5 p-0">
          <li>
            <button
              type="button"
              className={`w-[144px] h-[35px] text-md font-medium transition-all duration-200 ${
                orderType === "dine-in"
                  ? "bg-[#e4d4af] text-black"
                  : "bg-[#FFFCF1] text-black hover:bg-[#ede7d3]"
              } cursor-pointer`}
              onClick={() => handleOrderTypeChange("dine-in")}
            >
              Dine-in
            </button>
          </li>
          <li>
            <button
              type="button"
              className={`w-[144px] h-[35px] text-md font-medium transition-all duration-200 ${
                orderType === "delivery"
                  ? "bg-[#e4d4af] text-black"
                  : "bg-[#FFFCF1] text-black hover:bg-[#ede7d3]"
              } cursor-pointer`}
              onClick={() => handleOrderTypeChange("delivery")}
            >
              Delivery
            </button>
          </li>
        </ul>
      </div>
      <div className="bg-[#FFFCF1] w-full min-h-screen flex flex-col items-center relative">
        <img
          src="https://res.cloudinary.com/dnoitugnb/image/upload/v1747419279/Component_4_vdovyj.svg"
          alt="backarrow"
          className="cursor-pointer absolute top-10 right-10"
          onClick={() => (window.location.href = "/")}
        />
        <h2 className="text-3xl font-bold text-center uppercase underline mb-16 mt-16">
          Checkout
        </h2>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        {orderType === "dine-in" && (
          <>
            <span className="px-4 py-2 text-black text-center text-lg not-italic font-bold whitespace-nowrap -translate-x-96">
              Table Selection:
            </span>
            <div className="flex flex-wrap justify-center mb-6 mt-6 grid grid-cols-5 gap-10">
              {tables.map((table) => {
                const hasOrder = orders.some(
                  (order) => order.tableNumber === table.tableNumber
                );
                return (
                  <button
                    key={table.id}
                    className="relative flex items-center justify-center m-2 w-[120px] h-[120px]"
                    onClick={() => handleTableClick(table.tableNumber)}
                  >
                    <img
                      src="https://res.cloudinary.com/dnoitugnb/image/upload/v1747667986/table_wmvtda.svg"
                      alt={`Table ${table.tableNumber}`}
                      className="absolute w-full h-full object-contain w-[120px] h-[120px]"
                    />
                    <span
                      className={`relative z-10 font-bold ${
                        hasOrder ? "text-red-600" : "text-black"
                      }`}
                    >
                      Table {table.tableNumber}
                    </span>
                  </button>
                );
              })}
            </div>
          </>
        )}
        {orderType === "delivery" && (
          <div className="text-center mb-6 mt-10">
            <button
              className="px-4 py-2 bg-[#DCC99B] text-black rounded-[25px] font-semibold hover:bg-[#DCC99B]/80"
              onClick={() => fetchOrders("", "delivery")}
            >
              Load Delivery Orders
            </button>
          </div>
        )}
        {orderType === "delivery" && orders.length > 0 && (
          <div className="max-w-2xl mt-10">
            <h3 className="text-xl font-semibold mb-4">Delivery Orders</h3>
            {orders.map((order) => (
              <div key={order.id} className="border p-4 mb-4 rounded-lg shadow">
                <p>
                  <strong>Order ID:</strong> {order.id}
                </p>
                <p>
                  <strong>Customer:</strong> {order.customerName || "N/A"}
                </p>
                <p>
                  <strong>Building:</strong> {order.buildingName || "N/A"}
                </p>
                <ul className="list-disc pl-5">
                  {order.FoodItems?.map((item) => (
                    <li key={item.id}>
                      {item.name} x {item.OrderItem?.quantity || "N/A"}
                    </li>
                  ))}
                </ul>
                <button
                  className="mt-2 px-4 py-2 bg-[#DCC99B] text-black rounded-[25px] font-semibold hover:bg-[#DCC99B]/80"
                  onClick={() =>
                    navigate("/invoice", {
                      state: {
                        tableNumber: "",
                        orderType: "delivery",
                        orderId: order.id,
                      },
                    })
                  }
                >
                  View Invoice
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Checkout;
