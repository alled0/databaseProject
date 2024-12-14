import React, { useState } from "react";
import "../style/Admin.css";

const PromotePassenger = () => {
  const [passengerID, setPassengerID] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [error, setError] = useState("");

  const handlePromote = async () => {
    if (!passengerID) {
      alert("Passenger ID is required.");
      return;
    }

    setError("");
    setSuccessMessage("");

    try {
      const response = await fetch("http://localhost:4000/api/promotePassenger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passengerID }),
      });

      const data = await response.json();
      if (response.status === 200) {
        const {
          TrainID,
          English_name,
          Arabic_name,
          Date,
          FromStation,
          ToStation,
        } = data.trainDetails;
        setSuccessMessage(
          `Passenger promoted successfully! Train Details: Train ID: ${TrainID}, 
           English Name: ${English_name}, Arabic Name: ${Arabic_name}, 
           Date: ${Date}, From Station: ${FromStation}, To Station: ${ToStation}`
        );
        setPassengerID("");
      } else {
        setError(data.error || "Failed to promote passenger.");
      }
    } catch (err) {
      console.error("Error promoting passenger:", err);
      setError("A server error occurred. Please try again later.");
    }
  };

  return (
    <div className="container">
      <h2>Promote Waitlisted Passenger</h2>
      {error && <p className="error">{error}</p>}
      {successMessage && <p className="success">{successMessage}</p>}

      <div className="form-group">
        <label>Passenger ID:</label>
        <input
          type="text"
          value={passengerID}
          onChange={(e) => setPassengerID(e.target.value)}
          className="input"
          placeholder="Enter Passenger ID"
        />
      </div>

      <button onClick={handlePromote} className="button">
        Promote Passenger
      </button>
    </div>
  );
};

export default PromotePassenger;
