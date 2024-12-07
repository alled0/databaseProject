// frontend/src/components/SearchTrains.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const SearchTrains = () => {
  const [trains, setTrains] = useState([]);
  const [stations, setStations] = useState([]);
  const [fromStation, setFromStation] = useState('');
  const [toStation, setToStation] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    // Fetch stations
    axios.get('http://localhost:5000/stations')
      .then(response => {
        setStations(response.data);
      })
      .catch(error => {
        console.error("There was an error fetching stations!", error);
        setError('Failed to load stations.');
      });
  }, []);

  const searchTrains = () => {
    if (!fromStation || !toStation) {
      setError('Please select both From and To stations.');
      return;
    }
    if (fromStation === toStation) {
      setError('From and To stations cannot be the same.');
      return;
    }
    setError('');
    axios.get('http://localhost:5000/searchTrains', {
      params: {
        fromStation: fromStation,
        toStation: toStation
      }
    })
    .then(response => {
      setTrains(response.data);
    })
    .catch(error => {
      console.error("There was an error searching for trains!", error);
      setError('Failed to search for trains.');
    });
  };

  return (
    <div style={styles.container}>
      <h3>Search Trains</h3>
      {error && <p style={styles.error}>{error}</p>}
      <div style={styles.formGroup}>
        <label>From Station:</label>
        <select value={fromStation} onChange={(e) => setFromStation(e.target.value)}>
          <option value="">Select Station</option>
          {stations.map(station => (
            <option key={station.StationID} value={station.StationID}>
              {station.name}
            </option>
          ))}
        </select>
      </div>
      <div style={styles.formGroup}>
        <label>To Station:</label>
        <select value={toStation} onChange={(e) => setToStation(e.target.value)}>
          <option value="">Select Station</option>
          {stations.map(station => (
            <option key={station.StationID} value={station.StationID}>
              {station.name}
            </option>
          ))}
        </select>
      </div>
      <button onClick={searchTrains} style={styles.button}>Search</button>

      <h4>Available Trains:</h4>
      {trains.length > 0 ? (
        <ul>
          {trains.map(train => (
            <li key={train.TrainID}>{train.English_name} / {train.Arabic_name}</li>
          ))}
        </ul>
      ) : (
        <p>No trains found for the selected route.</p>
      )}
    </div>
  );
};

const styles = {
  container: {
    padding: '20px'
  },
  formGroup: {
    marginBottom: '10px'
  },
  button: {
    padding: '10px 20px',
    cursor: 'pointer'
  },
  error: {
    color: 'red'
  }
};

export default SearchTrains;
