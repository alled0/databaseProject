import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../style/Login.css";
import API_URL from "../config";

const Login = ({ onLogin }) => {
  const [form, setForm] = useState({ email: "", password: "" });
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message || "Something went wrong");

      onLogin(data.role, data.passengerID, data.email);

      if (data.role === "Passenger") navigate("/searchtrain");
      else if (data.role === "Admin") navigate("/manage-reservations");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleLogin();
  };

  return (
    <div className="auth-bg">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">🚆</div>
          <h1 className="auth-brand">Saudi Railways</h1>
          <p className="auth-subtitle">Sign in to your account</p>
        </div>

        <div className="auth-body">
          {error && <div className="alert alert-error">{error}</div>}

          <div className="form-group">
            <label className="label">Email</label>
            <input
              type="text"
              name="email"
              value={form.email}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              className="input"
              placeholder="you@example.com"
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label className="label">Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              className="input"
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>

          <button onClick={handleLogin} className="button" disabled={loading}>
            {loading ? "Signing in…" : "Sign In"}
          </button>

          <p className="auth-footer">
            New here?{" "}
            <Link to="/register" className="auth-link">Create an account</Link>
          </p>

          <div className="demo-box">
            <p className="demo-title">Demo Credentials</p>
            <div className="demo-row">
              <span className="demo-badge demo-badge-passenger">Passenger</span>
              <span className="demo-creds">passenger1@example.com / pass123</span>
            </div>
            <div className="demo-row">
              <span className="demo-badge demo-badge-admin">Admin</span>
              <span className="demo-creds">staff1@example.com / staff123</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
