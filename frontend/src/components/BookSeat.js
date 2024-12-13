import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const BookSeat = () => {
  const [form, setForm] = useState({
    TrainID: "",
    Date: "",
    FromStation: "",
    ToStation: "",
    CoachType: "Economy",
    SeatNumber: "",
    PassengerName: "",
    IDDocument: "",
    LuggageDetails: "",
    email: "", // Email serves as contact info
  });
  const [stations, setStations] = useState([]);
  const [trains, setTrains] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [reservationID, setReservationID] = useState(null); // Store ReservationID
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get("http://localhost:4000/stations")
      .then((response) => {
        setStations(response.data);
      })
      .catch((error) => {
        console.error("There was an error fetching stations!", error);
        setError("Failed to load stations.");
      });

    axios
      .get("http://localhost:4000/trains")
      .then((response) => {
        setTrains(response.data);
      })
      .catch((error) => {
        console.error("There was an error fetching trains!", error);
        setError("Failed to load trains.");
      });
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const submitBooking = () => {
    const requiredFields = [
      "TrainID",
      "Date",
      "FromStation",
      "ToStation",
      "CoachType",
      "SeatNumber",
      "PassengerName",
      "IDDocument",
      "email", // Ensure email is validated
    ];
    for (let field of requiredFields) {
      if (!form[field]) {
        setError(`The "${field}" field is required. Please fill it out.`);
        return;
      }
    }

    if (form.FromStation === form.ToStation) {
      setError(
        'The "From Station" and "To Station" cannot be the same. Please select different stations.'
      );
      return;
    }

    setError("");
    setMessage("");

    axios
      .post("http://localhost:4000/bookSeat", form)
      .then((response) => {
        if (response.status === 200) {
          setReservationID(response.data.ReservationID); // Store ReservationID
          setMessage(
            `Reservation Successful! Your Reservation ID is ${response.data.ReservationID}. Please proceed to payment.`
          );
        } else {
          setError("Reservation failed. Please try again later.");
        }
      })
      .catch((error) => {
        console.error("There was an error booking the seat!", error);
        setError("A server error occurred. Please try again later.");
      });
  };

  const goToPayment = () => {
    console.log(
      "Navigating to payment page with Reservation ID:",
      reservationID
    );

    if (reservationID) {
      navigate(`/payment/${reservationID}`); // Navigate to the payment page
    }
  };

  return (
    <div style={styles.container}>
      <h3 style={styles.heading}>Book a Seat</h3>
      {error && <p style={styles.error}>{error}</p>}
      {message && (
        <div>
          <p style={styles.success}>{message}</p>
          {reservationID && (
            <button onClick={goToPayment} style={styles.paymentButton}>
              Proceed to Payment
            </button>
          )}
        </div>
      )}
      <div style={styles.form}>
        <div style={styles.formGroup}>
          <label style={styles.label}>Train:</label>
          <select
            name="TrainID"
            value={form.TrainID}
            onChange={handleChange}
            style={styles.select}
          >
            <option value="">Select Train</option>
            {trains.map((train) => (
              <option key={train.TrainID} value={train.TrainID}>
                {train.English_name} / {train.Arabic_name}
              </option>
            ))}
          </select>
        </div>
        <div style={styles.formGroup}>
          <label style={styles.label}>Date:</label>
          <input
            type="date"
            name="Date"
            value={form.Date}
            onChange={handleChange}
            style={styles.input}
          />
        </div>
        <div style={styles.formGroup}>
          <label style={styles.label}>From Station:</label>
          <select
            name="FromStation"
            value={form.FromStation}
            onChange={handleChange}
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
            name="ToStation"
            value={form.ToStation}
            onChange={handleChange}
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
          <label style={styles.label}>Coach Type:</label>
          <select
            name="CoachType"
            value={form.CoachType}
            onChange={handleChange}
            style={styles.select}
          >
            <option value="Economy">Economy</option>
            <option value="Business">Business</option>
          </select>
        </div>
        <div style={styles.formGroup}>
          <label style={styles.label}>Seat Number:</label>
          <input
            type="text"
            name="SeatNumber"
            value={form.SeatNumber}
            onChange={handleChange}
            placeholder="e.g., 12A"
            style={styles.input}
          />
        </div>
        <div style={styles.formGroup}>
          <label style={styles.label}>Passenger Name:</label>
          <input
            type="text"
            name="PassengerName"
            value={form.PassengerName}
            onChange={handleChange}
            style={styles.input}
          />
        </div>
        <div style={styles.formGroup}>
          <label style={styles.label}>Email:</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Enter your email"
            style={styles.input}
          />
        </div>
        <div style={styles.formGroup}>
          <label style={styles.label}>ID Document:</label>
          <input
            type="text"
            name="IDDocument"
            value={form.IDDocument}
            onChange={handleChange}
            placeholder="ID Number"
            style={styles.input}
          />
        </div>
        <div style={styles.formGroup}>
          <label style={styles.label}>Luggage Details:</label>
          <input
            type="text"
            name="LuggageDetails"
            value={form.LuggageDetails}
            onChange={handleChange}
            placeholder="e.g., 2 bags"
            style={styles.input}
          />
        </div>
        <button onClick={submitBooking} style={styles.button}>
          Book
        </button>
      </div>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: "600px",
    margin: "0 auto",
    padding: "20px",
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
  form: {
    display: "flex",
    flexDirection: "column",
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
    padding: "10px",
    borderRadius: "5px",
    border: "1px solid #ddd",
    fontSize: "16px",
    width: "100%",
  },
  input: {
    padding: "10px",
    borderRadius: "5px",
    border: "1px solid #ddd",
    fontSize: "16px",
    width: "100%",
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
  },
  paymentButton: {
    padding: "10px 15px",
    backgroundColor: "#FF9800",
    color: "white",
    border: "none",
    borderRadius: "5px",
    fontSize: "16px",
    cursor: "pointer",
    marginTop: "10px",
  },
  error: {
    color: "red",
    fontSize: "14px",
    marginBottom: "15px",
  },
  success: {
    color: "green",
    fontSize: "14px",
    marginBottom: "15px",
  },
};

export default BookSeat;
