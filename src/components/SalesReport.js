import React, { useState, useEffect, Component } from "react";
import axios from "axios";
import { Chart } from 'react-chartjs-2';
import 'chart.js/auto';

// Error Boundary Component
// Error Boundary Component
    class ErrorBoundary extends Component {
      state = { hasError: false, error: null };

      static getDerivedStateFromError(error) {
        return { hasError: true, error };
      }

      render() {
        if (this.state.hasError) {
          return (
            <div className="container mx-auto p-5 font-sans text-center">
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
          console.log("Fetched report:", res.data);
          setReport(res.data);
          setError("");
        } catch (err) {
          console.error("Error fetching sales report:", err.response?.data || err.message);
          setError(err.response?.data?.error || "Failed to load sales report");
        }
      };

      useEffect(() => {
        fetchReport();
      }, []);

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

      // Prepare data for charts
      const prepareChartData = () => {
        if (!report || !report.orders) return { pieData: {}, barData: {}, lineData: {} };

        // Pie Chart: Payment Methods Distribution
        const paymentMethods = report.paymentMethods || { Cash: 0, Card: 0, Mobile: 0 };
        const pieData = {
          labels: Object.keys(paymentMethods),
          datasets: [{
            data: Object.values(paymentMethods),
            backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
            hoverBackgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
          }],
        };

        // Bar Chart: Daily Revenue
        const dailyRevenue = {};
        report.orders.forEach(order => {
          const date = new Date(order.createdAt).toLocaleDateString();
          let orderTotal = 0;
          order.FoodItems.forEach(item => {
            orderTotal += item.price * (item.OrderItem?.quantity || 0);
          });
          dailyRevenue[date] = (dailyRevenue[date] || 0) + orderTotal;
        });
        const barData = {
          labels: Object.keys(dailyRevenue),
          datasets: [{
            label: 'Daily Revenue ($)',
            data: Object.values(dailyRevenue),
            backgroundColor: '#36A2EB',
          }],
        };

        // Line Chart: Daily Order Count
        const dailyOrders = {};
        report.orders.forEach(order => {
          const date = new Date(order.createdAt).toLocaleDateString();
          dailyOrders[date] = (dailyOrders[date] || 0) + 1;
        });
        const lineData = {
          labels: Object.keys(dailyOrders),
          datasets: [{
            label: 'Daily Order Count',
            data: Object.values(dailyOrders),
            fill: false,
            borderColor: '#FF6384',
            tension: 0.1,
          }],
        };

        return { pieData, barData, lineData };
      };

      const { pieData, barData, lineData } = prepareChartData();

      return (
        <ErrorBoundary>
          <div className="container mx-auto p-5 font-sans">
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
                <p className="text-lg mb-5">
                  <strong>Order Count:</strong> {report.orderCount || 0}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Payment Methods Distribution</h3>
                    <div className="max-w-[300px] mx-auto">
                      <Chart type="pie" data={pieData} />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Daily Revenue</h3>
                    <Chart type="bar" data={barData} options={{
                      scales: {
                        y: { beginAtZero: true, title: { display: true, text: 'Revenue ($)' } },
                        x: { title: { display: true, text: 'Date' } },
                      },
                    }} />
                  </div>
                  <div className="md:col-span-2">
                    <h3 className="text-xl font-semibold mb-2">Daily Order Count</h3>
                    <Chart type="line" data={lineData} options={{
                      scales: {
                        y: { beginAtZero: true, title: { display: true, text: 'Order Count' } },
                        x: { title: { display: true, text: 'Date' } },
                      },
                    }} />
                  </div>
                </div>
              </div>
            )}
          </div>
        </ErrorBoundary>
      );
    }

export default SalesReport;
