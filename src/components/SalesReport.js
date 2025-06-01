import React, { useState, useEffect, Component, useCallback } from "react";
import axios from "axios";
import { Chart } from "react-chartjs-2";
import "chart.js/auto";

// Error Boundary Component
class ErrorBoundary extends Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full min-h-screen bg-[#FFFCF1] flex flex-col items-center p-5 font-sans text-center">
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

function SalesReport({ token = "your-auth-token" }) {
  const [report, setReport] = useState(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [error, setError] = useState("");

  const fetchReport = useCallback(async () => {
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
      console.log("Fetched report:", res.data);
      setReport(res.data);
      setError("");
    } catch (err) {
      console.error(
        "Error fetching sales report:",
        err.response?.data || err.message
      );
      setError(err.response?.data?.error || "Failed to load sales report");
    }
  }, [startDate, endDate, token]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport, startDate, endDate]);

  const handleFilter = (e) => {
    e.preventDefault();
    fetchReport();
  };

  const handleClear = () => {
    setStartDate("");
    setEndDate("");
    fetchReport(); // Refetch with default (no date filters)
  };

  // Safely handle totalRevenue
  const safeTotalRevenue = report?.totalRevenue
    ? typeof report.totalRevenue === "number"
      ? report.totalRevenue.toFixed(2)
      : parseFloat(report.totalRevenue)?.toFixed(2) || "0.00"
    : "0.00";

  // Prepare data for charts
  const prepareChartData = () => {
    if (!report || !report.orders)
      return { pieData: {}, barData: {}, lineData: {} };

    // Pie Chart: Payment Methods Distribution
    const paymentMethods = report.paymentMethods || {
      Cash: 0,
      Card: 0,
      Mobile: 0,
    };
    const pieData = {
      labels: Object.keys(paymentMethods),
      datasets: [
        {
          data: Object.values(paymentMethods),
          backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56"],
          hoverBackgroundColor: ["#FF6384", "#36A2EB", "#FFCE56"],
        },
      ],
    };

    // Bar Chart: Daily Revenue
    const dailyRevenue = {};
    report.orders.forEach((order) => {
      const date = new Date(order.createdAt).toLocaleDateString();
      let orderTotal = 0;
      order.FoodItems.forEach((item) => {
        orderTotal += item.price * (item.OrderItem?.quantity || 0);
      });
      dailyRevenue[date] = (dailyRevenue[date] || 0) + orderTotal;
    });
    const barData = {
      labels: Object.keys(dailyRevenue),
      datasets: [
        {
          label: "Daily Revenue (฿)",
          data: Object.values(dailyRevenue),
          backgroundColor: "#36A2EB",
        },
      ],
    };

    // Line Chart: Daily Order Count
    const dailyOrders = {};
    report.orders.forEach((order) => {
      const date = new Date(order.createdAt).toLocaleDateString();
      dailyOrders[date] = (dailyOrders[date] || 0) + 1;
    });
    const lineData = {
      labels: Object.keys(dailyOrders),
      datasets: [
        {
          label: "Daily Order Count",
          data: Object.values(dailyOrders),
          fill: false,
          borderColor: "#FF6384",
          tension: 0.1,
        },
      ],
    };

    return { pieData, barData, lineData };
  };

  const { pieData, barData, lineData } = prepareChartData();

  return (
    <ErrorBoundary>
      <div className="flex flex-row items-start min-h-screen bg-[#F5E8C7]">
        <nav className="w-[145.5px] h-screen fixed top-0 bg-[#FFFCF1] border-r-2 border-black hidden md:block">
          <img
            src="https://res.cloudinary.com/dnoitugnb/image/upload/v1746340828/tmylogo.png"
            alt="Logo"
            className="w-full max-w-[300px] mt-16 mb-16 cursor-pointer"
            onClick={() => (window.location.href = "/")}
          />
        </nav>
        <div className="bg-[#FFFCF1] border border-gray-500 w-full min-h-screen flex flex-col items-center p-4 md:pl-[145.5px]">
          <img
            src="https://res.cloudinary.com/dnoitugnb/image/upload/v1747419279/Component_4_vdovyj.svg"
            alt="backarrow"
            className="cursor-pointer absolute top-10 right-10 w-8 h-8 md:w-24 md:h-24"
            onClick={() => window.history.back()}
          />
          <div className="flex justify-center items-center w-full mb-5">
            <h2 className="text-2xl md:text-3xl font-bold text-center uppercase underline mb-8 mt-12">
              Sales Report
            </h2>
          </div>
          {error && <p className="text-red-500 text-center mb-4">{error}</p>}
          <form
            onSubmit={handleFilter}
            className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto mb-4"
          >
            <div className="flex flex-col w-full sm:w-auto">
              <label
                htmlFor="startDate"
                className="text-sm md:text-base font-medium mb-1 text-gray-700"
              >
                Start Date
              </label>
              <input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="h-10 rounded-[20px] border border-black/30 bg-gray-200/50 p-2 text-base md:text-lg flex-1 min-w-[150px]"
              />
            </div>
            <div className="flex flex-col w-full sm:w-auto">
              <label
                htmlFor="endDate"
                className="text-sm md:text-base font-medium mb-1 text-gray-700"
              >
                End Date
              </label>
              <input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="h-10 rounded-[20px] border border-black/30 bg-gray-200/50 p-2 text-base md:text-lg flex-1 min-w-[150px]"
              />
            </div>
            <button
              type="submit"
              className="w-[120px] h-10 rounded-[20px] border border-gray-500 bg-gray-200/50 text-black font-semibold text-base md:text-lg hover:bg-gray-300 active:bg-gray-300 active:text-white active:border-none mt-[28px] "
            >
              Filter
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="w-[120px] h-10 rounded-[20px] border border-gray-500 bg-gray-200/50 text-black font-semibold text-base md:text-lg hover:bg-gray-300 active:bg-gray-300 active:text-white active:border-none mt-[28px] "
            >
              Clear
            </button>
          </form>
          {report && (
            <div className="w-full max-w-4xl">
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <p className="text-base md:text-lg">
                  <strong>Total Revenue:</strong> ฿{safeTotalRevenue}
                </p>
                <p className="text-base md:text-lg">
                  <strong>Order Count:</strong> {report.orderCount || 0}
                </p>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-4 rounded-lg shadow-md">
                  <h3 className="text-lg md:text-xl font-semibold mb-2 text-center">
                    Payment Methods Distribution
                  </h3>
                  <div className="max-w-[300px] mx-auto">
                    <Chart type="pie" data={pieData} />
                  </div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-md">
                  <h3 className="text-lg md:text-xl font-semibold mb-2 text-center">
                    Daily Revenue
                  </h3>
                  <Chart
                    type="bar"
                    data={barData}
                    options={{
                      scales: {
                        y: {
                          beginAtZero: true,
                          title: { display: true, text: "Revenue (฿)" },
                        },
                        x: { title: { display: true, text: "Date" } },
                      },
                    }}
                  />
                </div>
                <div className="lg:col-span-2 bg-white p-4 rounded-lg shadow-md">
                  <h3 className="text-lg md:text-xl font-semibold mb-2 text-center">
                    Daily Order Count
                  </h3>
                  <Chart
                    type="line"
                    data={lineData}
                    options={{
                      scales: {
                        y: {
                          beginAtZero: true,
                          title: { display: true, text: "Order Count" },
                        },
                        x: { title: { display: true, text: "Date" } },
                      },
                    }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default SalesReport;
