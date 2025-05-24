import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";

function OrderHistory({ token }) {
  const [orders, setOrders] = useState([]);
  const [status, setStatus] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [error, setError] = useState("");
  const [expandedRow, setExpandedRow] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

  const fetchOrders = useCallback(async () => {
    try {
      const params = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      if (status) params.status = status;
      const res = await axios.get(`${API_URL}/api/orders/history`, {
        params,
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Fetched orders:", res.data);
      setOrders(res.data);
      setError("");
    } catch (err) {
      console.error(
        "Error fetching orders:",
        err.response?.data || err.message
      );
      setError(err.response?.data?.error || "Failed to load orders");
    }
  }, [startDate, endDate, status, token, API_URL]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleFilter = (e) => {
    e.preventDefault();
    fetchOrders();
  };

  const toggleRow = (orderId) => {
    setExpandedRow(expandedRow === orderId ? null : orderId);
  };

  const handleDeleteOrder = async (orderId) => {
    try {
      await axios.delete(`${API_URL}/api/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(orders.filter((order) => order.id !== orderId));
      setShowDeleteConfirm(null);
      setExpandedRow(null);
    } catch (err) {
      console.error("Error deleting order:", err.response?.data || err.message);
      setError("Failed to delete order");
    }
  };

  const calculateTotalPrice = (foodItems) => {
    if (!foodItems || !Array.isArray(foodItems)) return "0.00";
    return foodItems
      .reduce((total, item) => {
        const price = parseFloat(item.price) || 0;
        const quantity = item.OrderItem?.quantity || 0;
        return total + price * quantity;
      }, 0)
      .toFixed(2);
  };

  return (
    <div className="flex flex-row items-center">
      <div className="w-[145.5px] h-screen fixed top-0 bg-[#FFFCF1] border-r-2 border-black">
        <img
          src="https://res.cloudinary.com/dnoitugnb/image/upload/v1746340828/tmylogo.png"
          alt="Logo"
          className="w-full md:max-w-[300px] mt-16 mb-16"
          onClick={() => (window.location.href = "/")}
        />
      </div>
      <div className="bg-[#FFFCF1] border border-gray-500 w-full min-h-screen flex flex-col items-center">
        <img
          src="https://res.cloudinary.com/dnoitugnb/image/upload/v1747419279/Component_4_vdovyj.svg"
          alt="backarrow"
          className="cursor-pointer absolute top-10 right-10"
          onClick={() => window.history.back()}
        />
        <div className="flex justify-center items-center w-full mb-5 px-5">
          <h3 className="text-3xl font-bold text-center uppercase underline mb-16 mt-16">
            Check Order
          </h3>
        </div>
        {error && <p className="text-red-500 text-center mb-2.5">{error}</p>}
        <div className="flex flex-row items-center w-full gap-4 mb-5 justify-end mr-96">
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              fetchOrders();
            }}
            className="h-10 rounded-[20px] border border-black/30 bg-gray-200/50 p-2 text-lg"
          >
            <option value="">All Statuses</option>
            <option value="In Process">In Process</option>
            <option value="Completed">Completed</option>
          </select>
          <form onSubmit={handleFilter} className="flex flex-wrap gap-3   ">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="h-10 rounded-[20px] border border-black/30 bg-gray-200/50 p-2 text-lg"
            />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="h-10 rounded-[20px] border border-black/30 bg-gray-200/50 p-2 text-lg"
            />
            <button
              type="submit"
              className="w-[120px] h-10 rounded-[20px] border border-gray-500 bg-gray-200/50 text-black font-semibold text-lg hover:bg-gray-300 active:bg-gray-300 active:text-white active:border-none"
            >
              Filter
            </button>
          </form>
        </div>
        <div className="overflow-x-auto w-full max-w-5xl">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-200/50">
                <th className="border border-black/30 p-2 text-center">ID</th>
                <th className="border border-black/30 p-2 text-center">Type</th>
                <th className="border border-black/30 p-2 text-center">
                  Table/Building
                </th>
                <th className="border border-black/30 p-2 text-center">Date</th>
                <th className="border border-black/30 p-2 text-center">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <React.Fragment key={order.id}>
                  <tr
                    className="bg-[#F5E8C7] hover:bg-[#F0E0B7] cursor-pointer"
                    onClick={() => toggleRow(order.id)}
                  >
                    <td className="border border-black/30 p-2 text-center">
                      {order.id}
                    </td>
                    <td className="border border-black/30 p-2 text-center">
                      {order.orderType}
                    </td>
                    <td className="border border-black/30 p-2 text-center">
                      {order.tableNumber || order.buildingName || "N/A"}
                    </td>
                    <td className="border border-black/30 p-2 text-center">
                      {new Date(order.createdAt).toLocaleString("en-US", {
                        day: "numeric",
                        month: "numeric",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="border border-black/30 p-2 text-center">
                      {order.status}
                      <span className="ml-2 text-black">▼</span>
                    </td>
                  </tr>
                  {expandedRow === order.id && (
                    <tr>
                      <td
                        colSpan="5"
                        className="border border-black/30 p-4 bg-[#FFF9E5]"
                      >
                        <div className="flex flex-col space-y-2">
                          <div>
                            <strong>Order ID:</strong> {order.id}
                          </div>
                          <div>
                            <strong>Order Type:</strong> {order.orderType}
                          </div>
                          <div>
                            <strong>Table Number:</strong>{" "}
                            {order.tableNumber || order.buildingName || "N/A"}
                          </div>
                          <div>
                            <strong>Payment Method:</strong>{" "}
                            {order.paymentMethod || "N/A"}
                          </div>
                          <div>
                            <strong>Payment Price:</strong> ฿
                            {calculateTotalPrice(order.FoodItems)}
                          </div>
                          <div>
                            <strong>Date & Time:</strong>{" "}
                            {new Date(order.createdAt).toLocaleString("en-US", {
                              day: "numeric",
                              month: "numeric",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                          <div>
                            <strong>Ordered Items:</strong>
                            <ul className="list-disc pl-5">
                              {(order.FoodItems || []).map((item) => (
                                <li key={item.id}>
                                  {item.name} - ฿
                                  {(parseFloat(item.price) || 0).toFixed(2)} x{" "}
                                  {item.OrderItem?.quantity || "N/A"}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <button
                            className="mt-2 px-4 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowDeleteConfirm(order.id);
                            }}
                          >
                            Delete
                          </button>
                          {showDeleteConfirm === order.id && (
                            <div className="mt-2 p-2 bg-gray-100 rounded">
                              <p>Are you sure you want to delete this order?</p>
                              <div className="flex gap-2 mt-2">
                                <button
                                  className="px-4 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteOrder(order.id);
                                  }}
                                >
                                  Yes
                                </button>
                                <button
                                  className="px-4 py-1 bg-gray-300 rounded hover:bg-gray-400"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setShowDeleteConfirm(null);
                                  }}
                                >
                                  No
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default OrderHistory;
