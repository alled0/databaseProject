import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../style/Login.css";
import API_URL from "../config";

const Login = ({ onLogin }) => {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!form.email || !form.password) {
      setError("Please enter both email and password.");
      return;
    }

    if (!emailRegex.test(form.email)) {
      setError("Please enter a valid email address.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/api/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Something went wrong");
      }

      // Navigate based on role
      onLogin(data.role, data.passengerID, data.email);
      if (data.role === "Passenger") {
        navigate("/searchtrain");
      } else if (data.role === "Admin") {
        navigate("/manage-reservations");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="login-logo">🚆</div>
      <h3 className="heading">Saudi Railways</h3>
      <p className="login-subtitle">Sign in to your account</p>
      {error && <div className="alert alert-error">{error}</div>}
      <div className="form-group">
        <label className="label">Email:</label>
        <input
          type="text"
          name="email"
          value={form.email}
          onChange={handleChange}
          className="input"
        />
      </div>
      <div className="form-group">
        <label className="label">Password:</label>
        <input
          type="password"
          name="password"
          value={form.password}
          onChange={handleChange}
          className="input"
        />
      </div>
      <button onClick={handleLogin} className="button" disabled={loading}>
        {loading ? "Logging in..." : "Login"}
      </button>

      <div style={demoBoxStyle}>
        <p style={demoTitleStyle}>Demo Credentials</p>
        <div style={demoRowStyle}>
          <span style={demoBadge("passenger")}>Passenger</span>
          <span style={demoText}>passenger1@example.com / pass123</span>
        </div>
        <div style={demoRowStyle}>
          <span style={demoBadge("admin")}>Admin</span>
          <span style={demoText}>staff1@example.com / staff123</span>
        </div>
      </div>
    </div>
  );
};

const demoBoxStyle = {
  marginTop: "24px",
  padding: "14px 16px",
  background: "#f0f4ff",
  border: "1.5px solid #d0d9f0",
  borderRadius: "10px",
  fontSize: "13px",
};

const demoTitleStyle = {
  fontWeight: "700",
  color: "#2E3B4E",
  marginBottom: "10px",
  fontSize: "12px",
  textTransform: "uppercase",
  letterSpacing: "0.5px",
};

const demoRowStyle = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  marginBottom: "6px",
};

const demoBadge = (role) => ({
  padding: "2px 8px",
  borderRadius: "4px",
  fontSize: "11px",
  fontWeight: "700",
  background: role === "admin" ? "#2E3B4E" : "#4CAF50",
  color: "#fff",
  whiteSpace: "nowrap",
});

const demoText = {
  color: "#444",
  fontFamily: "monospace",
  fontSize: "12px",
};

export default Login;
