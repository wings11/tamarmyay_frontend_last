import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import HomePage from './pages/HomePage';
import CreateOrder from './components/CreateOrder';
import Checkout from './components/Checkout';
import OrderHistory from './components/OrderHistory';
import SalesReport from './components/SalesReport';
import ManageItems from './components/ManageItems';
import ManageLocations from './components/ManageLocations';
import './styles.css';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));

  const handleLogin = (newToken) => {
    setToken(newToken);
    localStorage.setItem('token', newToken);
  };

  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem('token');
  };

  return (
    <Router>
      <Routes>
        <Route path="/login" element={token ? <Navigate to="/" /> : <Login onLogin={handleLogin} />} />
        <Route path="/" element={token ? <HomePage onLogout={handleLogout} /> : <Navigate to="/login" />}>
          <Route index element={<CreateOrder token={token} />} />
          <Route path="checkout" element={<Checkout token={token} />} />
          <Route path="history" element={<OrderHistory token={token} />} />
          <Route path="sales" element={<SalesReport token={token} />} />
          <Route path="items" element={<ManageItems token={token} />} />
          <Route path="locations" element={<ManageLocations token={token} />} />
        </Route>
      </Routes>
    </Router>



  );
}

export default App;