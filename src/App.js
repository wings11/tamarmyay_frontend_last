import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { PrinterProvider } from "./contexts/PrinterContext";
import Login from "./components/Login";
import HomePage from "./pages/HomePage";
import CreateOrder from "./components/CreateOrder";
import OrderPage from "./pages/OrderPage";
import CheckOrder from "./pages/CheckOrder";
import Checkout from "./components/Checkout";
import Invoice from "./components/Invoice";
import OrderHistory from "./components/OrderHistory";
import SalesReport from "./components/SalesReport";
import ManageItems from "./components/ManageItems";
import ManageLocations from "./components/ManageLocations";
import ManageItemsAndLocationsPage from "./pages/ManageItemsAndLocationsPage";
import "./styles.css";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [orderItems, setOrderItems] = useState([]); // Global orderItems state

  const handleLogin = (newToken) => {
    setToken(newToken);
    localStorage.setItem("token", newToken);
  };

  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem("token");
  };

  const resetOrderItems = () => {
    setOrderItems([]); // Clear orderItems after submission
  };

  return (
    <PrinterProvider>
      <Router>
        <Routes>
          <Route
            path="/login"
            element={
              token ? <Navigate to="/" /> : <Login onLogin={handleLogin} />
            }
          />
          <Route
            path="/"
            element={
              token ? (
                <HomePage onLogout={handleLogout} />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/createorder"
            element={
              token ? <CreateOrder token={token} /> : <Navigate to="/login" />
            }
          />
          <Route
            path="/orderpage"
            element={
              token ? (
                <OrderPage
                  token={token}
                  orderItems={orderItems}
                  setOrderItems={setOrderItems}
                />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/orderpage/checkorder"
            element={
              token ? (
                <CheckOrder
                  token={token}
                  orderItems={orderItems}
                  setOrderItems={setOrderItems}
                  resetOrderItems={resetOrderItems}
                />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/checkout"
            element={
              token ? <Checkout token={token} /> : <Navigate to="/login" />
            }
          />
          <Route
            path="/invoice"
            element={token ? <Invoice token={token} /> : <Navigate to="/login" />}
          />
          <Route
            path="/history"
            element={
              token ? <OrderHistory token={token} /> : <Navigate to="/login" />
            }
          />
          <Route
            path="/sales"
            element={
              token ? <SalesReport token={token} /> : <Navigate to="/login" />
            }
          />
          <Route
            path="/management"
            element={
              token ? <ManageItemsAndLocationsPage /> : <Navigate to="/login" />
            }
          />
          <Route
            path="/management/items"
            element={
              token ? <ManageItems token={token} /> : <Navigate to="/login" />
            }
          />
          <Route
            path="/management/locations"
            element={
              token ? <ManageLocations token={token} /> : <Navigate to="/login" />
            }
          />
        </Routes>
      </Router>
    </PrinterProvider>
  );
}

export default App;
