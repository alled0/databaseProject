
import React, { useState } from "react";
import axios from "axios";
import "../style/Admin.css"; // Import shared CSS file

const AssignStaff = () => {
  const [form, setForm] = useState({
    trainID: "",
    staffID: "",
    role: "Driver",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setMessage(""); // Clear success message on change
    setError(""); // Clear error message on change
  };

  const handleAssign = async () => {
    if (!form.trainID || !form.staffID) {
      setError("Train ID and Staff ID are required.");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:4000/api/assignStaff",
        form
      );

      if (response.status === 200) {
        setMessage(response.data.message);
        setForm({ trainID: "", staffID: "", role: "Driver" });
      } else {
        setError("Failed to assign staff. Please try again.");
      }
    } catch (error) {
      console.error("Error assigning staff:", error);
      setError(error.response?.data?.error || "A server error occurred.");
    }
  };

  return (
    <div className="container">
      <h2>Assign Staff to Train</h2>
      {message && <p className="success">{message}</p>}
      {error && <p className="error">{error}</p>}

      <div className="form-group">
        <label>Train ID:</label>
        <input
          type="text"
          name="trainID"
          value={form.trainID}
          onChange={handleChange}
          className="input"
          placeholder="Enter Train ID"
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
          placeholder="Enter Staff ID"
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
