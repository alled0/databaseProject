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

      <div className="form-row">
        <div className="form-group">
          <label className="label">From Station</label>
          <select
            value={fromStation}
            onChange={(e) => setFromStation(e.target.value)}
            className="input"
          >
            <option value="">Select station</option>
            {stations.map((s) => (
              <option key={s.StationID} value={s.StationID}>{s.name}</option>
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
            <option value="">Select station</option>
            {stations.map((s) => (
              <option key={s.StationID} value={s.StationID}>{s.name}</option>
            ))}
          </select>
        </div>
      </div>

      <button onClick={searchTrains} className="button">
        Search Trains
      </button>

      {searched && (
        <div style={{ marginTop: "32px" }}>
          <h3 className="section-title">
            {trains.length === 0
              ? "No trains found"
              : `${trains.length} Train${trains.length !== 1 ? "s" : ""} Available`}
          </h3>

          {trains.length === 0 ? (
            <p className="text-muted text-center">
              No trains found for this route. Try a different combination.
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {trains.map((train) => (
                <div key={train.TrainID} className="train-card">
                  <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                    <div style={trainIconStyle}>🚆</div>
                    <div>
                      <div style={{ fontWeight: "600", fontSize: "15px", color: "#0F2137" }}>
                        {train.English_name}
                      </div>
                      <div style={{ color: "#94A3B8", fontSize: "13px", marginTop: "2px" }}>
                        {train.Arabic_name}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleBook(train.TrainID)}
                    className="button auto train-card-btn"
                    style={{ padding: "9px 20px" }}
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

const trainIconStyle = {
  width: "42px",
  height: "42px",
  background: "linear-gradient(135deg, #006B3C, #004D2B)",
  borderRadius: "10px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "18px",
  flexShrink: 0,
};

export default SearchTrains;
