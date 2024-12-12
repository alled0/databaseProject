import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../style/Login.css";

const Login = ({ onLogin }) => {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = () => {
    if (!form.email || !form.password) {
      setError("Please enter both email and password.");
      return;
    }

    // Mock users
    const mockUsers = [
      {
        email: "passenger@example.com",
        password: "pass123",
        role: "Passenger",
      },
      { email: "admin@example.com", password: "admin123", role: "Admin" },
    ];

    // Validate user
    const user = mockUsers.find(
      (u) => u.email === form.email && u.password === form.password
    );

    if (!user) {
      setError("Invalid email or password.");
      return;
    }

    setError("");
    onLogin(user.role); // Set role in parent App component
    if (user.role === "Passenger") {
      navigate("/searchtrain");
    } else if (user.role === "Admin") {
      navigate("/manage-reservations");
    }
  };

  return (
    <div className="container">
      <h3 className="heading">Login</h3>
      {error && <p className="error">{error}</p>}
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
      <button onClick={handleLogin} className="button">
        Login
      </button>
    </div>
  );
};

export default Login;
