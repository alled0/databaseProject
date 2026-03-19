import { useState, useEffect } from "react";
import "../style/Admin.css";
import axios from "axios";
import API_URL from "../config";

const ManageReservations = () => {
  const [form, setForm] = useState({
    passengerEmail: "",
    reservationID: "",
    action: "Add",
    TrainID: "",
    Date: "",
    FromStation: "",
    ToStation: "",
    CoachType: "Economy",
    SeatNumber: "",
  });

  const [stations, setStations] = useState([]);
  const [trains, setTrains] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    axios.get(`${API_URL}/api/trains/stations`).then((r) => setStations(r.data)).catch(() => {});
    axios.get(`${API_URL}/api/trains/`).then((r) => setTrains(r.data)).catch(() => {});
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setMessage("");
    setError("");
  };

  const setAction = (action) => {
    setForm({ ...form, action });
    setMessage("");
    setError("");
  };

  const handleAction = async () => {
    setMessage("");
    setError("");

    if (form.action === "Add" && !form.passengerEmail) {
      setError("Passenger Email is required for Add action.");
      return;
    }
    if (form.action !== "Add" && !form.reservationID) {
      setError("Reservation ID is required for Edit or Cancel.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        action: form.action,
        passengerEmail: form.passengerEmail || null,
        reservationID: form.reservationID || null,
        details: {
          TrainID: form.TrainID || null,
          Date: form.Date || null,
          FromStation: form.FromStation || null,
          ToStation: form.ToStation || null,
          CoachType: form.CoachType || null,
          SeatNumber: form.SeatNumber || null,
        },
      };

      const response = await axios.post(
        `${API_URL}/api/reservations/manageReservations`,
        payload
      );

      setMessage(response.data.message);
      setForm({
        passengerEmail: "",
        reservationID: "",
        action: form.action,
        TrainID: "",
        Date: "",
        FromStation: "",
        ToStation: "",
        CoachType: "Economy",
        SeatNumber: "",
      });
    } catch (err) {
      setError(err.response?.data?.error || "A server error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const actionLabel =
    form.action === "Add"
      ? "Add Reservation"
      : form.action === "Edit"
      ? "Update Reservation"
      : "Cancel Reservation";

  return (
    <div className="container">
      <h2 className="page-title">Manage Reservations</h2>

      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      <div className="action-selector">
        {["Add", "Edit", "Cancel"].map((a) => (
          <button
            key={a}
            className={`action-btn${form.action === a ? " active" : ""}`}
            onClick={() => setAction(a)}
          >
            {a}
          </button>
        ))}
      </div>

      {form.action === "Add" ? (
        <div className="form-group">
          <label className="label">Passenger Email</label>
          <input
            type="email"
            name="passengerEmail"
            value={form.passengerEmail}
            onChange={handleChange}
            className="input"
            placeholder="Enter passenger email"
          />
        </div>
      ) : (
        <div className="form-group">
          <label className="label">Reservation ID</label>
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

      {(form.action === "Add" || form.action === "Edit") && (
        <>
          {form.action === "Add" && (
            <div className="form-group">
              <label className="label">Train</label>
              <select name="TrainID" value={form.TrainID} onChange={handleChange} className="input">
                <option value="">Select Train</option>
                {trains.map((t) => (
                  <option key={t.TrainID} value={t.TrainID}>{t.English_name}</option>
                ))}
              </select>
            </div>
          )}

          <div className="form-row">
            <div className="form-group">
              <label className="label">From Station</label>
              <select name="FromStation" value={form.FromStation} onChange={handleChange} className="input">
                <option value="">Select Station</option>
                {stations.map((s) => (
                  <option key={s.StationID} value={s.StationID}>{s.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="label">To Station</label>
              <select name="ToStation" value={form.ToStation} onChange={handleChange} className="input">
                <option value="">Select Station</option>
                {stations.map((s) => (
                  <option key={s.StationID} value={s.StationID}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
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
              <label className="label">Coach Type</label>
              <select name="CoachType" value={form.CoachType} onChange={handleChange} className="input">
                <option value="Economy">Economy</option>
                <option value="Business">Business</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="label">Seat Number</label>
            <input
              type="text"
              name="SeatNumber"
              value={form.SeatNumber}
              onChange={handleChange}
              className="input"
              placeholder="e.g., 12A"
            />
          </div>
        </>
      )}

      <button
        onClick={handleAction}
        className={`button${form.action === "Cancel" ? " danger" : ""}`}
        disabled={loading}
      >
        {loading ? "Processing…" : actionLabel}
      </button>
    </div>
  );
};

export default ManageReservations;
