import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Checkout({ token }) {
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState('');
  const [orders, setOrders] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTables = async () => {
      try {
        const res = await axios.get('https://tamarmyaybackend-last.onrender.com/api/tables');
        setTables(res.data);
      } catch (err) {
        console.error('Error fetching tables:', err.response?.data || err.message);
        setError('Failed to load tables. Please check if the backend is running.');
      }
    };
    fetchTables();
  }, []);

  const fetchOrders = async (tableNumber) => {
    try {
      const res = await axios.get(`https://tamarmyaybackend-last.onrender.com/api/orders?status=In Process&tableNumber=${tableNumber}`);
      setOrders(res.data);
      setError('');
    } catch (err) {
      console.error('Error fetching orders:', err.response?.data || err.message);
      setError(err.response?.data?.error || 'Failed to load orders');
    }
  };

  const handleTableClick = (tableNumber) => {
    setSelectedTable(tableNumber);
    fetchOrders(tableNumber);
  };

  const handleCheckout = async (orderId) => {
    if (!paymentMethod) {
      setError('Please select a payment method');
      return;
    }
    try {
      await axios.put(
        `https://tamarmyaybackend-last.onrender.com/api/orders/${orderId}`,
        { status: 'Completed', paymentMethod },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Order completed!');
      fetchOrders(selectedTable);
      window.print();
    } catch (err) {
      console.error('Error completing order:', err.response?.data || err.message);
      setError(err.response?.data?.error || 'Failed to complete order');
    }
  };

  return (
    <div>
      <h2>Checkout</h2>
      {error && <p className="error">{error}</p>}
      <div>
        {tables.map(table => (
          <button
            key={table.id}
            style={{ backgroundColor: table.isOccupied ? 'red' : 'green', margin: '5px' }}
            onClick={() => handleTableClick(table.tableNumber)}
          >
            Table {table.tableNumber}
          </button>
        ))}
      </div>
      {selectedTable && (
        <div>
          <h3>Orders for Table {selectedTable}</h3>
          {orders.map(order => (
            <div key={order.id}>
              <p>Order ID: {order.id}</p>
              <ul>
                {order.FoodItems?.map(item => (
                  <li key={item.id}>{item.name} x {item.OrderItem?.quantity || 'N/A'}</li>
                ))}
              </ul>
              <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                <option value="">Select Payment Method</option>
                <option value="Cash">Cash</option>
                <option value="Card">Card</option>
                <option value="Mobile">Mobile</option>
              </select>
              <button onClick={() => handleCheckout(order.id)}>Complete Order</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Checkout;