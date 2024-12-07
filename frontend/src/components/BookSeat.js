// frontend/src/components/BookSeat.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const BookSeat = () => {
  const [form, setForm] = useState({
    TrainID: '',
    Date: '',
    FromStation: '',
    ToStation: '',
    CoachType: 'Economy',
    SeatNumber: '',
    PassengerName: '',
    ContactInfo: '',
    IDDocument: '',
    LuggageDetails: ''
  });
  const [stations, setStations] = useState([]);
  const [trains, setTrains] = useState([]);
  const [message, setMessage] = useState('');
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

    // Fetch trains
    axios.get('http://localhost:5000/trains')
      .then(response => {
        setTrains(response.data);
      })
      .catch(error => {
        console.error("There was an error fetching trains!", error);
        setError('Failed to load trains.');
      });
  }, []);

  const handleChange = (e) => {
    setForm({...form, [e.target.name]: e.target.value});
  };

  const submitBooking = () => {
    // Basic form validation
    const requiredFields = ['TrainID', 'Date', 'FromStation', 'ToStation', 'CoachType', 'SeatNumber', 'PassengerName', 'IDDocument'];
    for (let field of requiredFields) {
      if (!form[field]) {
        setError(`Please fill out the ${field} field.`);
        return;
      }
    }
    if (form.FromStation === form.ToStation) {
      setError('From and To stations cannot be the same.');
      return;
    }
    setError('');
    setMessage('');

    axios.post('http://localhost:5000/bookSeat', form)
      .then(response => {
        setMessage(`Reservation Successful! Your Reservation ID is ${response.data.ReservationID}`);
        // Reset form
        setForm({
          TrainID: '',
          Date: '',
          FromStation: '',
          ToStation: '',
          CoachType: 'Economy',
          SeatNumber: '',
          PassengerName: '',
          ContactInfo: '',
          IDDocument: '',
          LuggageDetails: ''
        });
      })
      .catch(error => {
        console.error("There was an error booking the seat!", error);
        setError('Reservation Failed.');
      });
  };

  return (
    <div style={styles.container}>
      <h3>Book a Seat</h3>
      {error && <p style={styles.error}>{error}</p>}
      {message && <p style={styles.success}>{message}</p>}
      <div style={styles.formGroup}>
        <label>Train:</label>
        <select name="TrainID" value={form.TrainID} onChange={handleChange}>
          <option value="">Select Train</option>
          {trains.map(train => (
            <option key={train.TrainID} value={train.TrainID}>
              {train.English_name} / {train.Arabic_name}
            </option>
          ))}
        </select>
      </div>
      <div style={styles.formGroup}>
        <label>Date:</label>
        <input type="date" name="Date" value={form.Date} onChange={handleChange} />
      </div>
      <div style={styles.formGroup}>
        <label>From Station:</label>
        <select name="FromStation" value={form.FromStation} onChange={handleChange}>
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
        <select name="ToStation" value={form.ToStation} onChange={handleChange}>
          <option value="">Select Station</option>
          {stations.map(station => (
            <option key={station.StationID} value={station.StationID}>
              {station.name}
            </option>
          ))}
        </select>
      </div>
      <div style={styles.formGroup}>
        <label>Coach Type:</label>
        <select name="CoachType" value={form.CoachType} onChange={handleChange}>
          <option value="Economy">Economy</option>
          <option value="Business">Business</option>
        </select>
      </div>
      <div style={styles.formGroup}>
        <label>Seat Number:</label>
        <input type="text" name="SeatNumber" value={form.SeatNumber} onChange={handleChange} placeholder="e.g., 12A" />
      </div>
      <div style={styles.formGroup}>
        <label>Passenger Name:</label>
        <input type="text" name="PassengerName" value={form.PassengerName} onChange={handleChange} />
      </div>
      <div style={styles.formGroup}>
        <label>Contact Info:</label>
        <input type="text" name="ContactInfo" value={form.ContactInfo} onChange={handleChange} placeholder="Email or Phone" />
      </div>
      <div style={styles.formGroup}>
        <label>ID Document:</label>
        <input type="text" name="IDDocument" value={form.IDDocument} onChange={handleChange} placeholder="ID Number" />
      </div>
      <div style={styles.formGroup}>
        <label>Luggage Details:</label>
        <input type="text" name="LuggageDetails" value={form.LuggageDetails} onChange={handleChange} placeholder="e.g., 2 bags" />
      </div>
      <button onClick={submitBooking} style={styles.button}>Book</button>
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
  },
  success: {
    color: 'green'
  }
};

export default BookSeat;
