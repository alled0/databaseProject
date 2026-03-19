import React, { useState, useEffect } from "react";
import axios from "axios";
import "../style/Admin.css";
import API_URL from "../config";

const AssignStaff = () => {
  const [form, setForm] = useState({ trainID: "", staffID: "", role: "Driver" });
  const [trains, setTrains] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    axios.get(`${API_URL}/api/trains/`).then((r) => setTrains(r.data)).catch(() => {});
    axios.get(`${API_URL}/api/staff`).then((r) => setStaffList(r.data)).catch(() => {});
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setMessage("");
    setError("");
  };

  const handleAssign = async () => {
    if (!form.trainID || !form.staffID) {
      setError("Please select a train and a staff member.");
      return;
    }
    try {
      const response = await axios.post(`${API_URL}/api/assignStaff`, form);
      setMessage(response.data.message);
      setForm({ trainID: "", staffID: "", role: "Driver" });
    } catch (err) {
      setError(err.response?.data?.error || "A server error occurred.");
    }
  };

  return (
    <div className="container">
      <h2 className="page-title">Assign Staff to Train</h2>
      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      <div className="form-group">
        <label className="label">Train</label>
        <select name="trainID" value={form.trainID} onChange={handleChange} className="input">
          <option value="">Select Train</option>
          {trains.map((t) => (
            <option key={t.TrainID} value={t.TrainID}>{t.English_name}</option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label className="label">Staff Member</label>
        <select name="staffID" value={form.staffID} onChange={handleChange} className="input">
          <option value="">Select Staff</option>
          {staffList.map((s) => (
            <option key={s.StaffID} value={s.StaffID}>{s.Name} — {s.Role}</option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label className="label">Assignment Role</label>
        <select name="role" value={form.role} onChange={handleChange} className="input">
          <option value="Driver">Driver</option>
          <option value="Engineer">Engineer</option>
          <option value="Conductor">Conductor</option>
          <option value="Ticket Agent">Ticket Agent</option>
        </select>
      </div>

      <button onClick={handleAssign} className="button">Assign Staff</button>
    </div>
  );
};

export default AssignStaff;
