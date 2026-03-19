import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../style/Login.css";
import API_URL from "../config";

const Register = ({ onLogin }) => {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!form.name || !form.email || !form.password) {
      setError("Please fill in all fields.");
      return;
    }
    if (!emailRegex.test(form.email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (form.password.length < 4) {
      setError("Password must be at least 4 characters.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/api/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed.");
      }

      onLogin(data.role, data.passengerID, data.email);
      navigate("/searchtrain");
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
      <p className="login-subtitle">Create your account</p>
      {error && <div className="alert alert-error">{error}</div>}
      <div className="form-group">
        <label className="label">Name:</label>
        <input
          type="text"
          name="name"
          value={form.name}
          onChange={handleChange}
          className="input"
          placeholder="Your full name"
        />
      </div>
      <div className="form-group">
        <label className="label">Email:</label>
        <input
          type="text"
          name="email"
          value={form.email}
          onChange={handleChange}
          className="input"
          placeholder="you@example.com"
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
      <button onClick={handleRegister} className="button" disabled={loading}>
        {loading ? "Creating account..." : "Register"}
      </button>
      <p style={{ textAlign: "center", marginTop: "16px", fontSize: "13px", color: "#555" }}>
        Already have an account?{" "}
        <Link to="/" style={{ color: "#2E3B4E", fontWeight: "600" }}>
          Sign in
        </Link>
      </p>
    </div>
  );
};

export default Register;
