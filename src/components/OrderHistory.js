import React, { useState, useEffect } from 'react';
import axios from 'axios';

function OrderHistory({ token }) {
  const [orders, setOrders] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [expandedOrderId, setExpandedOrderId] = useState(null);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  const fetchOrders = async () => {
    try {
      const params = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      if (status) params.status = status;
      const res = await axios.get(`${API_URL}/api/orders/history`, { params });
      console.log('Fetched orders:', res.data); // Debug log
      setOrders(res.data);
      setError('');
    } catch (err) {
      console.error('Error fetching orders:', err.response?.data || err.message);
      setError(err.response?.data?.error || 'Failed to load orders');
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleFilter = (e) => {
    e.preventDefault();
    fetchOrders();
  };

  const toggleDetails = (orderId) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  const calculateTotalPrice = (foodItems) => {
    if (!foodItems || !Array.isArray(foodItems)) return '0.00';
    return foodItems
      .reduce((total, item) => {
        const price = parseFloat(item.price) || 0;
        const quantity = item.OrderItem?.quantity || 0;
        return total + price * quantity;
      }, 0)
      .toFixed(2);
  };

  return (
    <div>
      <h2>Order History</h2>
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
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All Statuses</option>
          <option value="In Process">In Process</option>
          <option value="Completed">Completed</option>
        </select>
        <button type="submit">Filter</button>
      </form>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
        <thead>
          <tr>
            <th style={{ border: '1px solid #ddd', padding: '8px' }}>ID</th>
            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Type</th>
            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Table/Building</th>
            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Status</th>
            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Date</th>
            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Items</th>
            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Details</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <React.Fragment key={order.id}>
              <tr>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{order.id}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{order.orderType}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                  {order.tableNumber || order.buildingName || 'N/A'}
                </td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{order.status}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                  {new Date(order.createdAt).toLocaleDateString()}
                </td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                  {order.FoodItems?.map((item) => (
                    <div key={item.id}>
                      {item.name} x {item.OrderItem?.quantity || 'N/A'}
                    </div>
                  ))}
                </td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                  <button
                  className='togglerbtn'
                    type="button"
                    onClick={() => toggleDetails(order.id)}
                    style={{ cursor: 'pointer', background: 'none', border: 'none' }}
                  >
                    {expandedOrderId === order.id ? '▲' : '▼'}
                  </button>
                </td>
              </tr>
              {expandedOrderId === order.id && (
                <tr>
                  <td colSpan="7" style={{ border: '1px solid #ddd', padding: '8px', background: '#f9f9f9' }}>
                    <div style={{ margin: '10px 0' }}>
                      <h4>Order Details</h4>
                      <p><strong>Order ID:</strong> {order.id}</p>
                      <p><strong>Order Type:</strong> {order.orderType}</p>
                      <p>
                        <strong>{order.orderType === 'dine-in' ? 'Table Number' : 'Building Name'}:</strong>
                        {' '}
                        {order.tableNumber || order.buildingName || 'N/A'}
                      </p>
                      <p><strong>Customer Name:</strong> {order.customerName || 'N/A'}</p>
                      <p><strong>Payment Method:</strong> {order.paymentMethod || 'N/A'}</p>
                      <p>
                        <strong>Total Price:</strong> ${calculateTotalPrice(order.FoodItems)}
                      </p>
                      <p>
                        <strong>Date and Time:</strong>{' '}
                        {new Date(order.createdAt).toLocaleString()}
                      </p>
                      <p><strong>Ordered Items:</strong></p>
                      <ul>
                        {(order.FoodItems || []).map((item) => (
                          <li key={item.id}>
                            {item.name} - ${(parseFloat(item.price) || 0).toFixed(2)} x {item.OrderItem?.quantity || 'N/A'}
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
  );
}

export default OrderHistory;