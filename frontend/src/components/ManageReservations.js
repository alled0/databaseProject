import React, { useState, useEffect } from "react";
import "../style/Admin.css"; // Import shared CSS file
import axios from "axios";

const ManageReservations = () => {
  const [form, setForm] = useState({
    passengerEmail: "",
    reservationID: "",
    action: "Add",
    Date: "",
    FromStation: "",
    ToStation: "",
    CoachType: "Economy",
    SeatNumber: "",
  });

  const [stations, setStations] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:4000/api/trains/stations")
      .then((response) => {
        setStations(response.data);
      })
      .catch((error) => {
        console.error("There was an error fetching stations!", error);
        alert("Failed to load stations.");
      });
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAction = async () => {
    if (!form.action) {
      alert("Action is required.");
      return;
    }

    if (form.action === "Add" && !form.passengerEmail) {
      alert("Passenger Email is required for Add action.");
      return;
    }

    if (form.action !== "Add" && !form.reservationID) {
      alert("Reservation ID is required for Edit or Cancel.");
      return;
    }

    try {
      const payload = {
        action: form.action,
        passengerEmail: form.passengerEmail || null, // Required for Add
        reservationID: form.reservationID || null, // Required for Edit/Cancel
        details: {
          Date: form.Date || null,
          FromStation: form.FromStation || null,
          ToStation: form.ToStation || null,
          CoachType: form.CoachType || null,
          SeatNumber: form.SeatNumber || null,
        },
      };

      const response = await axios.post(
        "http://localhost:4000/api/reservations/manageReservations",
        payload
      );

      alert(response.data.message);
      setForm({
        passengerEmail: "",
        reservationID: "",
        action: "Add",
        Date: "",
        FromStation: "",
        ToStation: "",
        CoachType: "Economy",
        SeatNumber: "",
      });
    } catch (error) {
      console.error("Error managing reservation:", error);
      alert(error.response?.data?.error || "A server error occurred.");
    }
  };

  return (
    <div className="container">
      <h2>Manage Reservations</h2>

      {form.action === "Add" ? (
        <div className="form-group">
          <label>Passenger Email:</label>
          <input
            type="email"
            name="passengerEmail"
            value={form.passengerEmail}
            onChange={handleChange}
            className="input"
            placeholder="Enter Passenger Email"
          />
        </div>
      ) : (
        <div className="form-group">
          <label>Reservation ID:</label>
          <input
            type="text"
            name="reservationID"
            value={form.reservationID}
            onChange={handleChange}
            className="input"
            placeholder="Enter Reservation ID"
          />
        </div>
      )}

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

      {form.action === "Add" || form.action === "Edit" ? (
        <>
          <div className="form-group">
            <label>Date:</label>
            <input
              type="date"
              name="Date"
              value={form.Date}
              onChange={handleChange}
              className="input"
            />
          </div>

          <div className="form-group">
            <label>From Station:</label>
            <select
              name="FromStation"
              value={form.FromStation}
              onChange={handleChange}
              className="input"
            >
              <option value="">Select Station</option>
              {stations.map((station) => (
                <option key={station.StationID} value={station.StationID}>
                  {station.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>To Station:</label>
            <select
              name="ToStation"
              value={form.ToStation}
              onChange={handleChange}
              className="input"
            >
              <option value="">Select Station</option>
              {stations.map((station) => (
                <option key={station.StationID} value={station.StationID}>
                  {station.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Coach Type:</label>
            <select
              name="CoachType"
              value={form.CoachType}
              onChange={handleChange}
              className="input"
            >
              <option value="Economy">Economy</option>
              <option value="Business">Business</option>
            </select>
          </div>

          <div className="form-group">
            <label>Seat Number:</label>
            <input
              type="text"
              name="SeatNumber"
              value={form.SeatNumber}
              onChange={handleChange}
              className="input"
            />
          </div>
        </>
      ) : null}

      <button onClick={handleAction} className="button">
        Perform Action
      </button>
    </div>
  );
};

export default ManageReservations;
