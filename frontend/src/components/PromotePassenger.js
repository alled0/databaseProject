import React, { useState } from "react";
import "../style/Admin.css"; // Import shared CSS file

const PromotePassenger = () => {
  const [form, setForm] = useState({
    passengerID: "",
    reservationID: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePromote = () => {
    if (!form.passengerID || !form.reservationID) {
      alert("Please provide both Passenger ID and Reservation ID.");
      return;
    }
    console.log("Promoting waitlisted passenger:", form);
    alert("Passenger promoted successfully!");
    setForm({ passengerID: "", reservationID: "" });
  };

  return (
    <div className="container">
      <h2>Promote Waitlisted Passenger</h2>
      <div className="form-group">
        <label>Passenger ID:</label>
        <input
          type="text"
          name="passengerID"
          value={form.passengerID}
          onChange={handleChange}
          className="input"
        />
      </div>
      <div className="form-group">
        <label>Reservation ID:</label>
        <input
          type="text"
          name="reservationID"
          value={form.reservationID}
          onChange={handleChange}
          className="input"
        />
      </div>
      <button onClick={handlePromote} className="button">
        Promote Passenger
      </button>
    </div>
  );
};

export default PromotePassenger;
