import React, { useState } from "react";
import "../style/Admin.css"; // Import shared CSS file

const ManageReservations = () => {
  const [reservations, setReservations] = useState([]);
  const [form, setForm] = useState({
    reservationID: "",
    action: "Add",
    details: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAction = () => {
    if (!form.reservationID && form.action !== "Add") {
      alert("Please provide a reservation ID for Edit or Cancel.");
      return;
    }
    console.log(`${form.action} reservation`, form);
    alert(`${form.action} reservation successfully!`);
    setForm({ reservationID: "", action: "Add", details: "" });
  };

  return (
    <div className="container">
      <h2>Manage Reservations</h2>
      <div className="form-group">
        <label>Reservation ID:</label>
        <input
          type="text"
          name="reservationID"
          value={form.reservationID}
          onChange={handleChange}
          className="input"
          placeholder="Optional for Add"
        />
      </div>
      <div className="form-group">
        <label>Action:</label>
        <select
          name="action"
          value={form.action}
          onChange={handleChange}
          className="input"
        >
          <option value="Add">Add</option>
          <option value="Edit">Edit</option>
          <option value="Cancel">Cancel</option>
        </select>
      </div>
      <div className="form-group">
        <label>Details:</label>
        <textarea
          name="details"
          value={form.details}
          onChange={handleChange}
          className="input"
          placeholder="Details for reservation"
        ></textarea>
      </div>
      <button onClick={handleAction} className="button">
        Perform Action
      </button>
    </div>
  );
};

export default ManageReservations;
