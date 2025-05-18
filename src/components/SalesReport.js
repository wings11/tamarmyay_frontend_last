import React, { useState, useEffect, Component } from "react";
import axios from "axios";

// Error Boundary Component
class ErrorBoundary extends Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="container mx-auto p-5 font-nunito text-center">
          <h2 className="text-2xl font-semibold mb-5">Something went wrong</h2>
          <p className="text-red-500">Error: {this.state.error.message}</p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="mt-4 w-[120px] h-10 rounded-[20px] border border-gray-500 bg-gray-200/50 text-black font-semibold text-lg hover:bg-gray-300 active:bg-gray-300 active:text-white active:border-none"
          >
            Try Again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function SalesReport({ token }) {
  const [report, setReport] = useState(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [error, setError] = useState("");

  const fetchReport = async () => {
    try {
      const params = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      const res = await axios.get(
        "https://tamarmyaybackend-last.onrender.com/api/reports/sales",
        {
          params,
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log("Fetched report:", res.data); // Debug log
      setReport(res.data);
      setError("");
    } catch (err) {
      console.error(
        "Error fetching sales report:",
        err.response?.data || err.message
      );
      setError(err.response?.data?.error || "Failed to load sales report");
    }
  };

  useEffect(() => {
    fetchReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Line 26

  const handleFilter = (e) => {
    e.preventDefault();
    fetchReport();
  };

  // Safely handle totalRevenue
  const safeTotalRevenue = report?.totalRevenue
    ? typeof report.totalRevenue === "number"
      ? report.totalRevenue.toFixed(2)
      : parseFloat(report.totalRevenue)?.toFixed(2) || "0.00"
    : "0.00";

  return (
    <ErrorBoundary>
      <div className="container mx-auto p-5 font-nunito">
        <h2 className="text-2xl font-semibold mb-5">Sales Report</h2>
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
          <button
            type="submit"
            className="w-[120px] h-10 rounded-[20px] border border-gray-500 bg-gray-200/50 text-black font-semibold text-lg hover:bg-gray-300 active:bg-gray-300 active:text-white active:border-none"
          >
            Filter
          </button>
        </form>
        {report && (
          <div>
            <p className="text-lg mb-2">
              <strong>Total Revenue:</strong> ${safeTotalRevenue}
            </p>
            <p className="text-lg mb-2">
              <strong>Order Count:</strong> {report.orderCount || 0}
            </p>
            <h3 className="text-xl font-semibold mb-2">Payment Methods</h3>
            <ul className="list-disc pl-5 mb-5">
              <li>Cash: ${(report.paymentMethods?.Cash || 0).toFixed(2)}</li>
              <li>Card: ${(report.paymentMethods?.Card || 0).toFixed(2)}</li>
              <li>
                Mobile: ${(report.paymentMethods?.Mobile || 0).toFixed(2)}
              </li>
            </ul>
            <h3 className="text-xl font-semibold mb-2">Orders</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-200/50">
                    <th className="border border-black/30 p-2 text-left">ID</th>
                    <th className="border border-black/30 p-2 text-left">
                      Type
                    </th>
                    <th className="border border-black/30 p-2 text-left">
                      Table/Building
                    </th>
                    <th className="border border-black/30 p-2 text-left">
                      Payment
                    </th>
                    <th className="border border-black/30 p-2 text-left">
                      Items
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {report.orders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-100">
                      <td className="border border-black/30 p-2">{order.id}</td>
                      <td className="border border-black/30 p-2">
                        {order.orderType}
                      </td>
                      <td className="border border-black/30 p-2">
                        {order.tableNumber || order.buildingName || "N/A"}
                      </td>
                      <td className="border border-black/30 p-2">
                        {order.paymentMethod || "N/A"}
                      </td>
                      <td className="border border-black/30 p-2">
                        {order.FoodItems?.map((item) => (
                          <div key={item.id}>
                            {item.name} x {item.OrderItem?.quantity || "N/A"}
                          </div>
                        ))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
}

export default SalesReport;
