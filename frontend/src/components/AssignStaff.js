import React, { useState } from "react";
import "../style/Admin.css"; // Import shared CSS file

const AssignStaff = () => {
  const [form, setForm] = useState({
    trainID: "",
    date: "",
    staffID: "",
    role: "Driver",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAssign = () => {
    if (!form.trainID || !form.date || !form.staffID) {
      alert("Please fill all fields.");
      return;
    }
    console.log("Assigning staff to train:", form);
    alert("Staff assigned successfully!");
    setForm({ trainID: "", date: "", staffID: "", role: "Driver" });
  };

  return (
    <div className="container">
      <h2>Assign Staff to Train</h2>
      <div className="form-group">
        <label>Train ID:</label>
        <input
          type="text"
          name="trainID"
          value={form.trainID}
          onChange={handleChange}
          className="input"
        />
      </div>
      <div className="form-group">
        <label>Date:</label>
        <input
          type="date"
          name="date"
          value={form.date}
          onChange={handleChange}
          className="input"
        />
      </div>
      <div className="form-group">
        <label>Staff ID:</label>
        <input
          type="text"
          name="staffID"
          value={form.staffID}
          onChange={handleChange}
          className="input"
        />
      </div>
      <div className="form-group">
        <label>Role:</label>
        <select
          name="role"
          value={form.role}
          onChange={handleChange}
          className="input"
        >
          <option value="Driver">Driver</option>
          <option value="Engineer">Engineer</option>
        </select>
      </div>
      <button onClick={handleAssign} className="button">
        Assign Staff
      </button>
    </div>
  );
};

export default AssignStaff;
