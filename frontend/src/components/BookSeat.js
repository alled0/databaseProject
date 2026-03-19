import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import API_URL from "../config";

const BookSeat = ({ email: propEmail }) => {
  const location = useLocation();
  const stateData = location.state || {};
  const navigate = useNavigate();

  const [form, setForm] = useState({
    TrainID: stateData.TrainID || "",
    Date: "",
    FromStation: stateData.FromStation || "",
    ToStation: stateData.ToStation || "",
    CoachType: "Economy",
    SeatNumber: "",
    email: propEmail || "",
  });
  const [stations, setStations] = useState([]);
  const [trains, setTrains] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [reservationID, setReservationID] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    axios
      .get(`${API_URL}/api/trains/stations`)
      .then((r) => setStations(r.data))
      .catch(() => setError("Failed to load stations."));

    axios
      .get(`${API_URL}/api/trains/`)
      .then((r) => setTrains(r.data))
      .catch(() => setError("Failed to load trains."));
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const submitBooking = () => {
    const required = ["TrainID", "Date", "FromStation", "ToStation", "CoachType", "SeatNumber", "email"];
    for (let f of required) {
      if (!form[f]) {
        setError(`"${f}" is required.`);
        return;
      }
    }
    if (form.FromStation === form.ToStation) {
      setError("From Station and To Station cannot be the same.");
      return;
    }
    setError("");
    setLoading(true);
    axios
      .post(`${API_URL}/api/reservations/bookSeat`, form)
      .then((response) => {
        setReservationID(response.data.ReservationID);
        setMessage(`Booking successful! Your Reservation ID is #${response.data.ReservationID}.`);
      })
      .catch((err) => {
        setError(err.response?.data?.error || "A server error occurred. Please try again later.");
      })
      .finally(() => setLoading(false));
  };

  const resetForm = () => {
    setMessage("");
    setReservationID(null);
    setError("");
    setForm({
      TrainID: "",
      Date: "",
      FromStation: "",
      ToStation: "",
      CoachType: "Economy",
      SeatNumber: "",
      email: propEmail || "",
    });
  };

  return (
    <div className="container">
      <h2 className="page-title">Book a Seat</h2>

      {error && <div className="alert alert-error">{error}</div>}

      {message ? (
        <div>
          <div className="alert alert-success">{message}</div>
          <button
            onClick={() => navigate(`/payment/${reservationID}`)}
            className="button"
          >
            Proceed to Payment
          </button>
          <button
            onClick={resetForm}
            className="button secondary"
            style={{ marginTop: "8px" }}
          >
            Book Another Seat
          </button>
        </div>
      ) : (
        <>
          <div className="form-group">
            <label className="label">Train</label>
            <select name="TrainID" value={form.TrainID} onChange={handleChange} className="input">
              <option value="">Select Train</option>
              {trains.map((t) => (
                <option key={t.TrainID} value={t.TrainID}>
                  {t.English_name} / {t.Arabic_name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="label">Date</label>
            <input
              type="date"
              name="Date"
              value={form.Date}
              onChange={handleChange}
              className="input"
            />
          </div>

          <div className="form-group">
            <label className="label">From Station</label>
            <select name="FromStation" value={form.FromStation} onChange={handleChange} className="input">
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
            <select name="ToStation" value={form.ToStation} onChange={handleChange} className="input">
              <option value="">Select Station</option>
              {stations.map((s) => (
                <option key={s.StationID} value={s.StationID}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="label">Coach Type</label>
            <select name="CoachType" value={form.CoachType} onChange={handleChange} className="input">
              <option value="Economy">Economy</option>
              <option value="Business">Business</option>
            </select>
          </div>

          <div className="form-group">
            <label className="label">Seat Number</label>
            <input
              type="text"
              name="SeatNumber"
              value={form.SeatNumber}
              onChange={handleChange}
              placeholder="e.g., 12A"
              className="input"
            />
          </div>

          <div className="form-group">
            <label className="label">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              readOnly
              className="input"
            />
          </div>

          <button onClick={submitBooking} className="button" disabled={loading}>
            {loading ? "Booking..." : "Book Seat"}
          </button>
        </>
      )}
    </div>
  );
};

export default BookSeat;
