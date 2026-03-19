import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import API_URL from "../config";

const SearchTrains = () => {
  const [stations, setStations] = useState([]);
  const [fromStation, setFromStation] = useState("");
  const [toStation, setToStation] = useState("");
  const [trains, setTrains] = useState([]);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get(`${API_URL}/api/trains/stations`)
      .then((r) => setStations(r.data))
      .catch(() => setError("Failed to load stations."));
  }, []);

  const searchTrains = () => {
    if (!fromStation || !toStation) {
      setError("Please select both From and To stations.");
      return;
    }
    if (fromStation === toStation) {
      setError("From and To stations cannot be the same.");
      return;
    }
    setError("");
    axios
      .get(`${API_URL}/api/trains/searchTrains`, {
        params: { fromStation, toStation },
      })
      .then((r) => {
        setTrains(r.data);
        setSearched(true);
      })
      .catch(() => setError("Failed to search for trains."));
  };

  const handleBook = (trainID) => {
    navigate("/book", {
      state: { TrainID: trainID, FromStation: fromStation, ToStation: toStation },
    });
  };

  return (
    <div className="container">
      <h2 className="page-title">Search Trains</h2>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="form-group">
        <label className="label">From Station</label>
        <select
          value={fromStation}
          onChange={(e) => setFromStation(e.target.value)}
          className="input"
        >
          <option value="">Select Station</option>
          {stations.map((s) => (
            <option key={s.StationID} value={s.StationID}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label className="label">To Station</label>
        <select
          value={toStation}
          onChange={(e) => setToStation(e.target.value)}
          className="input"
        >
          <option value="">Select Station</option>
          {stations.map((s) => (
            <option key={s.StationID} value={s.StationID}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      <button onClick={searchTrains} className="button">
        Search
      </button>

      {searched && (
        <div style={{ marginTop: "28px" }}>
          <h3 style={{ fontSize: "15px", fontWeight: "600", color: "#2E3B4E", marginBottom: "12px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            Available Trains
          </h3>
          {trains.length === 0 ? (
            <div className="alert alert-error">No trains found for the selected route.</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {trains.map((train) => (
                <div key={train.TrainID} style={trainCardStyle}>
                  <div>
                    <div style={{ fontWeight: "600", fontSize: "15px", color: "#1a1a2e" }}>
                      {train.English_name}
                    </div>
                    <div style={{ color: "#888", fontSize: "13px", marginTop: "2px" }}>
                      {train.Arabic_name}
                    </div>
                  </div>
                  <button
                    onClick={() => handleBook(train.TrainID)}
                    className="button"
                    style={{ width: "auto", marginTop: 0, padding: "9px 20px" }}
                  >
                    Book Seat
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const trainCardStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "14px 16px",
  background: "#f9fafb",
  border: "1.5px solid #e5e7eb",
  borderRadius: "10px",
};

export default SearchTrains;
