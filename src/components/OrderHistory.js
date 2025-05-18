import React, { useState, useEffect } from "react";
import axios from "axios";

function OrderHistory({ token }) {
  const [orders, setOrders] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [expandedOrderId, setExpandedOrderId] = useState(null);

  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

  const fetchOrders = async () => {
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
  };

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Line 32

  const handleFilter = (e) => {
    e.preventDefault();
    fetchOrders();
  };

  const toggleDetails = (orderId) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
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
    <div className="container mx-auto p-5 font-nunito">
      <h2 className="text-2xl font-semibold mb-5">Order History</h2>
      {error && <p className="text-red-500 text-center mb-2.5">{error}</p>}
      <form onSubmit={handleFilter} className="flex flex-wrap gap-3 mb-5">
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
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="h-10 rounded-[20px] border border-black/30 bg-gray-200/50 p-2 text-lg"
        >
          <option value="">All Statuses</option>
          <option value="In Process">In Process</option>
          <option value="Completed">Completed</option>
        </select>
        <button
          type="submit"
          className="w-[120px] h-10 rounded-[20px] border border-gray-500 bg-gray-200/50 text-black font-semibold text-lg hover:bg-gray-300 active:bg-gray-300 active:text-white active:border-none"
        >
          Filter
        </button>
      </form>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-200/50">
              <th className="border border-black/30 p-2 text-left">ID</th>
              <th className="border border-black/30 p-2 text-left">Type</th>
              <th className="border border-black/30 p-2 text-left">
                Table/Building
              </th>
              <th className="border border-black/30 p-2 text-left">Status</th>
              <th className="border border-black/30 p-2 text-left">Date</th>
              <th className="border border-black/30 p-2 text-left">Items</th>
              <th className="border border-black/30 p-2 text-left">Details</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <React.Fragment key={order.id}>
                <tr className="hover:bg-gray-100">
                  <td className="border border-black/30 p-2">{order.id}</td>
                  <td className="border border-black/30 p-2">
                    {order.orderType}
                  </td>
                  <td className="border border-black/30 p-2">
                    {order.tableNumber || order.buildingName || "N/A"}
                  </td>
                  <td className="border border-black/30 p-2">{order.status}</td>
                  <td className="border border-black/30 p-2">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td className="border border-black/30 p-2">
                    {order.FoodItems?.map((item) => (
                      <div key={item.id}>
                        {item.name} x {item.OrderItem?.quantity || "N/A"}
                      </div>
                    ))}
                  </td>
                  <td className="border border-black/30 p-2">
                    <button
                      type="button"
                      onClick={() => toggleDetails(order.id)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      {expandedOrderId === order.id ? "▲" : "▼"}
                    </button>
                  </td>
                </tr>
                {expandedOrderId === order.id && (
                  <tr>
                    <td
                      colSpan="7"
                      className="border border-black/30 p-4 bg-gray-50"
                    >
                      <div>
                        <h4 className="text-lg font-semibold mb-2">
                          Order Details
                        </h4>
                        <p>
                          <strong>Order ID:</strong> {order.id}
                        </p>
                        <p>
                          <strong>Order Type:</strong> {order.orderType}
                        </p>
                        <p>
                          <strong>
                            {order.orderType === "dine-in"
                              ? "Table Number"
                              : "Building Name"}
                            :
                          </strong>{" "}
                          {order.tableNumber || order.buildingName || "N/A"}
                        </p>
                        <p>
                          <strong>Customer Name:</strong>{" "}
                          {order.customerName || "N/A"}
                        </p>
                        <p>
                          <strong>Payment Method:</strong>{" "}
                          {order.paymentMethod || "N/A"}
                        </p>
                        <p>
                          <strong>Total Price:</strong> $
                          {calculateTotalPrice(order.FoodItems)}
                        </p>
                        <p>
                          <strong>Date and Time:</strong>{" "}
                          {new Date(order.createdAt).toLocaleString()}
                        </p>
                        <p>
                          <strong>Ordered Items:</strong>
                        </p>
                        <ul className="list-disc pl-5">
                          {(order.FoodItems || []).map((item) => (
                            <li key={item.id}>
                              {item.name} - $
                              {(parseFloat(item.price) || 0).toFixed(2)} x{" "}
                              {item.OrderItem?.quantity || "N/A"}
                            </li>
                          ))}
                        </ul>
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
  );
}

export default OrderHistory;
