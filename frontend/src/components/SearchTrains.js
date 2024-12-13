// frontend/src/components/SearchTrains.js
import React, { useState, useEffect } from "react";
import axios from "axios";

const SearchTrains = () => {
  const [trains, setTrains] = useState([]);
  const [stations, setStations] = useState([]);
  const [fromStation, setFromStation] = useState("");
  const [toStation, setToStation] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    // Fetch stations
    axios
      .get("http://localhost:4000/stations")
      .then((response) => {
        setStations(response.data);
      })
      .catch((error) => {
        console.error("There was an error fetching stations!", error);
        setError("Failed to load stations.");
      });
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
      .get("http://localhost:4000/searchTrains", {
        params: {
          fromStation: fromStation,
          toStation: toStation,
        },
      })
      .then((response) => {
        setTrains(response.data);
      })
      .catch((error) => {
        console.error("There was an error searching for trains!", error);
        setError("Failed to search for trains.");
      });
  };

  return (
    <div style={styles.container}>
      <h3 style={styles.heading}>Search Trains</h3>
      {error && <p style={styles.error}>{error}</p>}
      <div style={styles.formGroup}>
        <label style={styles.label}>From Station:</label>
        <select
          value={fromStation}
          onChange={(e) => setFromStation(e.target.value)}
          style={styles.select}
        >
          <option value="">Select Station</option>
          {stations.map((station) => (
            <option key={station.StationID} value={station.StationID}>
              {station.name}
            </option>
          ))}
        </select>
      </div>
      <div style={styles.formGroup}>
        <label style={styles.label}>To Station:</label>
        <select
          value={toStation}
          onChange={(e) => setToStation(e.target.value)}
          style={styles.select}
        >
          <option value="">Select Station</option>
          {stations.map((station) => (
            <option key={station.StationID} value={station.StationID}>
              {station.name}
            </option>
          ))}
        </select>
      </div>
      <button onClick={searchTrains} style={styles.button}>
        Search
      </button>

      <h4 style={styles.availableTrainsHeading}>Available Trains:</h4>
      {trains.length > 0 ? (
        <ul style={styles.trainList}>
          {trains.map((train) => (
            <li key={train.TrainID} style={styles.trainItem}>
              {train.English_name} / {train.Arabic_name}
            </li>
          ))}
        </ul>
      ) : (
        <p style={styles.noTrainsMessage}>
          No trains found for the selected route.
        </p>
      )}
    </div>
  );
};

const styles = {
  container: {
    padding: "20px",
    maxWidth: "600px",
    margin: "0 auto",
    backgroundColor: "#f9f9f9",
    borderRadius: "8px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
  },
  heading: {
    textAlign: "center",
    fontSize: "24px",
    marginBottom: "20px",
    color: "#333",
  },
  formGroup: {
    marginBottom: "15px",
  },
  label: {
    fontWeight: "bold",
    marginBottom: "5px",
    color: "#333",
  },
  select: {
    width: "100%",
    padding: "10px",
    borderRadius: "5px",
    border: "1px solid #ddd",
    fontSize: "16px",
  },
  button: {
    padding: "12px 20px",
    backgroundColor: "#4CAF50",
    color: "white",
    border: "none",
    borderRadius: "5px",
    fontSize: "16px",
    cursor: "pointer",
    transition: "background-color 0.3s",
    width: "100%",
  },
  buttonHover: {
    backgroundColor: "#45a049",
  },
  error: {
    color: "red",
    fontSize: "14px",
    marginBottom: "15px",
  },
  availableTrainsHeading: {
    fontSize: "18px",
    marginTop: "20px",
    color: "#333",
  },
  trainList: {
    listStyleType: "none",
    padding: 0,
  },
  trainItem: {
    backgroundColor: "#f1f1f1",
    marginBottom: "10px",
    padding: "10px",
    borderRadius: "5px",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
  },
  noTrainsMessage: {
    textAlign: "center",
    color: "#888",
    fontSize: "16px",
  },
};

export default SearchTrains;
