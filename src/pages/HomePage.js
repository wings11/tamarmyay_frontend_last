import React from 'react';
import { Outlet, Link } from 'react-router-dom';

function HomePage({ onLogout }) {
  return (
    <div className="container">
      <h1>Tamarmyay POS</h1>
      <nav>
        <Link to="/">Create Order</Link>
        <Link to="/checkout">Checkout</Link>
        <Link to="/history">Order History</Link>
        <Link to="/sales">Sales Report</Link>
        <Link to="/items">Manage Items</Link>
        <Link to="/locations">Manage Locations</Link>
        <button onClick={onLogout}>Logout</button>
      </nav>
      <Outlet />
    </div>
  );
}

export default HomePage;