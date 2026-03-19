import React, { useState } from "react";
import "../style/Admin.css";
import API_URL from "../config";

const PromotePassenger = () => {
  const [passengerID, setPassengerID] = useState("");
  const [successData, setSuccessData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handlePromote = async () => {
    if (!passengerID.trim()) {
      setError("Passenger ID is required.");
      return;
    }
    setError("");
    setSuccessData(null);
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/promotePassenger`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passengerID }),
      });
      const data = await response.json();
      if (response.ok) {
        setSuccessData(data.trainDetails);
        setPassengerID("");
      } else {
        setError(data.error || "Failed to promote passenger.");
      }
    } catch (err) {
      setError("A server error occurred. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h2 className="page-title">Promote Waitlisted Passenger</h2>

      {error && <div className="alert alert-error">{error}</div>}

      {successData && (
        <div className="alert alert-success">
          <strong>Passenger promoted successfully!</strong>
          <table className="detail-table">
            <tbody>
              <tr><td>Train</td><td>{successData.English_name}</td></tr>
              <tr><td>Departure</td><td>{successData.Date}</td></tr>
              <tr><td>From</td><td>{successData.FromStation}</td></tr>
              <tr><td>To</td><td>{successData.ToStation}</td></tr>
            </tbody>
          </table>
        </div>
      )}

      <div className="form-group">
        <label className="label">Passenger ID</label>
        <input
          type="text"
          value={passengerID}
          onChange={(e) => setPassengerID(e.target.value)}
          className="input"
          placeholder="Enter Passenger ID"
        />
      </div>

      <button onClick={handlePromote} className="button" disabled={loading}>
        {loading ? "Promoting..." : "Promote Passenger"}
      </button>
    </div>
  );
};

export default PromotePassenger;
