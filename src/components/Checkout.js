import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Checkout({ token }) {
  const [tables, setTables] = useState([]);
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");
  const [orderType, setOrderType] = useState("dine-in");
  const [isMenuOpen, setIsMenuOpen] = useState(false); // State for toggling sidebar
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
        `https://tamarmyaybackend-last.onrender.com/api/orders?status=In Process&tableNumber=${tableNumber}&orderType=${type}`,
        { headers: { Authorization: `Bearer ${token}` } }
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
    navigate("/Invoice", { state: { tableNumber, orderType } });
  };

  const handleOrderTypeChange = (type) => {
    setOrderType(type);
    setOrders([]);
    setIsMenuOpen(false); // Close menu on mobile when changing order type
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#FFFCF1] md:flex-row">
      {/* Hamburger Menu Icon for Mobile */}
      <div className="md:hidden flex items-center justify-between p-4 z-20">
        <i
          className="bi bi-list text-3xl cursor-pointer"
          onClick={toggleMenu}
        ></i>
        <img
          src="https://res.cloudinary.com/dnoitugnb/image/upload/v1747419279/Component_4_vdovyj.svg"
          alt="backarrow"
          className="cursor-pointer w-8 h-8"
          onClick={() => (window.location.href = "/")}
        />
      </div>

      {/* Overlay for Mobile */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-10 md:hidden"
          onClick={toggleMenu}
        ></div>
      )}

      {/* Sidebar - Slides in/out on mobile */}
      <div
        className={`fixed top-0 left-0 w-64 md:w-[145.5px] h-screen bg-[#FFFCF1] border-r-2 border-black z-20 md:z-[1000] transform transition-transform duration-300 ease-in-out ${
          isMenuOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
      >
        <div className="flex justify-end p-4 md:hidden">
          <i
            className="bi bi-x text-3xl cursor-pointer"
            onClick={toggleMenu}
          ></i>
        </div>
        <img
          src="https://res.cloudinary.com/dnoitugnb/image/upload/v1746340828/tmylogo.png"
          alt="Logo"
          className="w-full max-w-[200px] md:max-w-[300px] mt-8 md:mt-16 mb-8 md:mb-16 mx-auto cursor-pointer"
          onClick={() => {
            window.location.href = "/";
            setIsMenuOpen(false);
          }}
        />
        <ul className="flex flex-col items-center gap-4 md:gap-5 p-0">
          <li>
            <button
              type="button"
              className={`w-[120px] md:w-[144px] h-[35px] text-sm md:text-md font-medium transition-all duration-200 ${
                orderType === "dine-in"
                  ? "bg-[#e4d4af] text-black"
                  : "bg-[#FFFCF1] text-black hover:bg-[#ede7d3]"
              } `}
              onClick={() => handleOrderTypeChange("dine-in")}
            >
              Dine-in
            </button>
          </li>
          <li>
            <button
              type="button"
              className={`w-[120px] md:w-[144px] h-[35px] text-sm md:text-md font-medium transition-all duration-200 ${
                orderType === "delivery"
                  ? "bg-[#e4d4af] text-black"
                  : "bg-[#FFFCF1] text-black hover:bg-[#ede7d3]"
              } `}
              onClick={() => handleOrderTypeChange("delivery")}
            >
              Delivery
            </button>
          </li>
        </ul>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center relative p-4 md:ml-[145.5px] md:p-6">
        <img
          src="https://res.cloudinary.com/dnoitugnb/image/upload/v1747419279/Component_4_vdovyj.svg"
          alt="backarrow"
          className="cursor-pointer hidden md:block absolute top-10 right-10 w-8 h-8 md:w-24 md:h-24"
          onClick={() => (window.location.href = "/")}
        />
        <h2 className="text-xl md:text-3xl font-bold text-center uppercase underline mb-8 md:mb-16 mt-8 md:mt-16">
          Checkout
        </h2>
        {error && (
          <p className="text-red-500 text-center mb-4 text-sm md:text-base">
            {error}
          </p>
        )}
        {orderType === "dine-in" && (
          <>
            <span className="px-4 py-2 text-black text-center text-base md:text-lg font-bold whitespace-nowrap">
              Table Selection:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-10 mt-6 mb-6">
              {tables.map((table) => {
                const hasOrder = orders.some(
                  (order) => order.tableNumber === table.tableNumber
                );
                return (
                  <button
                    key={table.id}
                    className="relative flex items-center justify-center m-2 w-[100px] h-[100px] md:w-[120px] md:h-[120px]"
                    onClick={() => handleTableClick(table.tableNumber)}
                  >
                    <img
                      src="https://res.cloudinary.com/dnoitugnb/image/upload/v1747667986/table_wmvtda.svg"
                      alt={`Table ${table.tableNumber}`}
                      className="absolute w-full h-full object-contain"
                    />
                    <span
                      className={`relative z-10 font-bold text-sm md:text-base ${
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
          <div className="text-center mb-6 mt-6 md:mt-10">
            <button
              className="px-4 py-2 md:px-6 md:py-3 bg-[#DCC99B] text-black rounded-full font-semibold hover:bg-[#DCC99B]/80 text-sm md:text-base"
              onClick={() => fetchOrders("", "delivery")}
            >
              Load Delivery Orders
            </button>
          </div>
        )}
        {orderType === "delivery" && orders.length > 0 && (
          <div className="w-full max-w-lg md:max-w-2xl mt-6 md:mt-10 px-4">
            <h3 className="text-lg md:text-xl font-semibold mb-4">
              Delivery Orders
            </h3>
            {orders
              .sort((a, b) => a.id - b.id)
              .map((order) => (
                <div
                  key={order.id}
                  className="border p-4 mb-4 rounded-lg shadow"
                >
                  <p className="text-sm md:text-base">
                    <strong>Order ID:</strong> {order.id}
                  </p>
                  <p className="text-sm md:text-base">
                    <strong>Customer:</strong> {order.customerName || "N/A"}
                  </p>
                  <p className="text-sm md:text-base">
                    <strong>Building:</strong> {order.buildingName || "N/A"}
                  </p>
                  <ul className="list-disc pl-5 text-sm md:text-base">
                    {order.FoodItems?.map((item) => (
                      <li key={item.id}>
                        {item.name} x {item.OrderItem?.quantity || "N/A"}
                      </li>
                    ))}
                  </ul>
                  <button
                    className="mt-2 px-4 py-2 md:px-6 md:py-3 bg-[#DCC99B] text-black rounded-full font-semibold hover:bg-[#DCC99B]/80 text-sm md:text-base"
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
