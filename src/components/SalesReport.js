import React, { useState, useEffect } from 'react';
import axios from 'axios';

function SalesReport({ token }) {
  const [report, setReport] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [error, setError] = useState('');

  const fetchReport = async () => {
    try {
      const params = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      const res = await axios.get('https://tamarmyaybackend-last.onrender.com/api/reports/sales', { params });
      setReport(res.data);
      setError('');
    } catch (err) {
      console.error('Error fetching sales report:', err.response?.data || err.message);
      setError(err.response?.data?.error || 'Failed to load sales report');
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  const handleFilter = (e) => {
    e.preventDefault();
    fetchReport();
  };

  return (
    <div>
      <h2>Sales Report</h2>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleFilter}>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
        <button type="submit">Filter</button>
      </form>
      {report && (
        <div>
          <p>Total Revenue: ${report.totalRevenue}</p>
          <p>Order Count: {report.orderCount}</p>
          <h3>Payment Methods</h3>
          <ul>
            <li>Cash: ${report.paymentMethods.Cash.toFixed(2)}</li>
            <li>Card: ${report.paymentMethods.Card.toFixed(2)}</li>
            <li>Mobile: ${report.paymentMethods.Mobile.toFixed(2)}</li>
          </ul>
          <h3>Orders</h3>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Type</th>
                <th>Table/Building</th>
                <th>Payment</th>
                <th>Items</th>
              </tr>
            </thead>
            <tbody>
              {report.orders.map(order => (
                <tr key={order.id}>
                  <td>{order.id}</td>
                  <td>{order.orderType}</td>
                  <td>{order.tableNumber || order.buildingName}</td>
                  <td>{order.paymentMethod}</td>
                  <td>
                    {order.FoodItems?.map(item => (
                      <div key={item.id}>{item.name} x {item.OrderItem?.quantity || 'N/A'}</div>
                    ))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default SalesReport;