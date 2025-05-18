import React from "react";
import Login from "../components/Login";

function LoginPage({ onLogin }) {
  return (
    <div>
      <Login onLogin={onLogin} />
    </div>
  );
}

export default LoginPage;
