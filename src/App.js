import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./components/Login";
import HomePage from "./pages/HomePage";
import CreateOrder from "./components/CreateOrder";
import Checkout from "./components/Checkout";
import OrderHistory from "./components/OrderHistory";
import SalesReport from "./components/SalesReport";
import ManageItems from "./components/ManageItems";
import ManageLocations from "./components/ManageLocations";
import "./styles.css";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));

  const handleLogin = (newToken) => {
    setToken(newToken);
    localStorage.setItem("token", newToken);
  };

  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem("token");
  };

  return (
    <Router
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
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
          path="/checkout"
          element={
            token ? <Checkout token={token} /> : <Navigate to="/login" />
          }
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
          path="/items"
          element={
            token ? <ManageItems token={token} /> : <Navigate to="/login" />
          }
        />
        <Route
          path="/locations"
          element={
            token ? <ManageLocations token={token} /> : <Navigate to="/login" />
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
