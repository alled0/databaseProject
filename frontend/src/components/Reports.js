// frontend/src/components/Reports.js
import React, { useState, useEffect } from "react";
import "../style/Report.css";
import API_URL from "../config";

const Reports = ({ role, passengerID: propPassengerID }) => {
  const [activeTrains, setActiveTrains] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");

  const [inputPassengerID, setInputPassengerID] = useState(propPassengerID || "");
  const [submittedPassengerID, setSubmittedPassengerID] = useState(propPassengerID || "");
  const [isLoadingReservations, setIsLoadingReservations] = useState(false);
  const [errorReservations, setErrorReservations] = useState("");

  const [trainStations, setTrainStations] = useState([]);
  const [waitlist, setWaitlist] = useState([]);
  const [loadFactor, setLoadFactor] = useState([]);
  const [dependents, setDependents] = useState([]);
  const [reportDate, setReportDate] = useState("");
  const [trainNumber, setTrainNumber] = useState("");
  const [waitlistError, setWaitlistError] = useState("");
  const [loadFactorError, setLoadFactorError] = useState("");
  const [dependentsError, setDependentsError] = useState("");

  useEffect(() => {
    const fetchActiveTrains = async () => {
      try {
        let url = `${API_URL}/api/reports/active-trains`;
        if (selectedDate) url += `?date=${encodeURIComponent(selectedDate)}`;
        const response = await fetch(url);
        if (!response.ok) throw new Error("Failed to fetch active trains.");
        setActiveTrains(await response.json());
      } catch {
        setActiveTrains([]);
      }
    };
    fetchActiveTrains();
  }, [selectedDate]);

  useEffect(() => {
    const fetchReservations = async () => {
      if (!submittedPassengerID) return;
      setIsLoadingReservations(true);
      setErrorReservations("");
      try {
        let url = `${API_URL}/api/reports/reservations/${encodeURIComponent(submittedPassengerID)}`;
        if (selectedDate) url += `?date=${encodeURIComponent(selectedDate)}`;
        const response = await fetch(url);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to fetch reservations.");
        }
        setReservations(await response.json());
      } catch (error) {
        setReservations([]);
        setErrorReservations(error.message);
      } finally {
        setIsLoadingReservations(false);
      }
    };
    fetchReservations();
  }, [submittedPassengerID, selectedDate]);

  useEffect(() => {
    if (role === "Admin") {
      const fetchTrainStations = async () => {
        try {
          const response = await fetch(`${API_URL}/api/reports/stations-for-trains`);
          if (!response.ok) throw new Error("Failed to fetch train stations.");
          setTrainStations(await response.json());
        } catch {
          setTrainStations([]);
        }
      };
      fetchTrainStations();
    }
  }, [role]);

  const handleGetWaitlisted = async () => {
    setWaitlistError("");
    if (!trainNumber) { setWaitlistError("Please enter a Train Number."); return; }
    try {
      const response = await fetch(`${API_URL}/api/reports/waitlisted-loyalty/${encodeURIComponent(trainNumber)}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch waitlisted passengers.");
      }
      setWaitlist(await response.json());
    } catch (error) {
      setWaitlist([]);
      setWaitlistError(error.message);
    }
  };

  const handleGetLoadFactor = async () => {
    setLoadFactorError("");
    if (!reportDate) { setLoadFactorError("Please select a date."); return; }
    try {
      const response = await fetch(`${API_URL}/api/reports/load-factor/${encodeURIComponent(reportDate)}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch load factor.");
      }
      setLoadFactor(await response.json());
    } catch (error) {
      setLoadFactor([]);
      setLoadFactorError(error.message);
    }
  };

  const handleGetDependents = async () => {
    setDependentsError("");
    if (!reportDate) { setDependentsError("Please select a date."); return; }
    try {
      const response = await fetch(`${API_URL}/api/reports/dependents/${encodeURIComponent(reportDate)}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch dependents.");
      }
      setDependents(await response.json());
    } catch (error) {
      setDependents([]);
      setDependentsError(error.message);
    }
  };

  const handlePassengerIDSubmit = (e) => {
    e.preventDefault();
    if (!inputPassengerID.trim()) {
      setErrorReservations("Please enter your Passenger ID.");
      return;
    }
    setSubmittedPassengerID(inputPassengerID.trim());
  };

  return (
    <div className="container-wide">
      <h1 className="page-title">Reports</h1>

      {/* ── Active Trains ── */}
      <div className="report-section">
        <h2 className="section-title">Active Trains</h2>
        <div className="form-group" style={{ maxWidth: "260px" }}>
          <label className="label">Filter by Date</label>
          <input
            className="input"
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>

        {activeTrains.length === 0 ? (
          <p className="text-muted">No active trains for the selected date.</p>
        ) : (
          <div className="report-table-wrap">
            <table className="report-table">
              <thead>
                <tr>
                  <th>Train Name</th>
                  <th>Train ID</th>
                </tr>
              </thead>
              <tbody>
                {activeTrains.map((train) => (
                  <tr key={train.TrainID}>
                    <td data-label="Train Name">{train.English_name}</td>
                    <td data-label="Train ID">{train.TrainID}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Passenger Reservations ── */}
      {role === "Passenger" && (
        <>
          <hr />
          <div className="report-section">
            <h2 className="section-title">Your Reservations</h2>

            <form onSubmit={handlePassengerIDSubmit} className="passenger-id-form">
              <div className="form-group">
                <label className="label">Passenger ID</label>
                <input
                  className="input"
                  type="text"
                  placeholder="Enter your Passenger ID"
                  value={inputPassengerID}
                  onChange={(e) => setInputPassengerID(e.target.value)}
                />
              </div>
              <button type="submit" className="button auto report-button">
                Get Reservations
              </button>
            </form>

            {isLoadingReservations && <p className="text-muted">Loading reservations…</p>}
            {errorReservations && <p className="error-message">{errorReservations}</p>}

            {!isLoadingReservations && !errorReservations && submittedPassengerID && (
              reservations.length === 0 ? (
                <p className="no-reservations">No reservations found for this Passenger ID.</p>
              ) : (
                <div className="report-table-wrap">
                  <table className="report-table">
                    <thead>
                      <tr>
                        <th>Reservation ID</th>
                        <th>Train</th>
                        <th>Date</th>
                        <th>From</th>
                        <th>To</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reservations.map((resv) => (
                        <tr key={resv.ReservationID}>
                          <td data-label="Reservation ID">{resv.ReservationID}</td>
                          <td data-label="Train">{resv.English_name}</td>
                          <td data-label="Date">{resv.Date}</td>
                          <td data-label="From">{resv.FromName}</td>
                          <td data-label="To">{resv.ToName}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            )}
          </div>
        </>
      )}

      {/* ── Admin Reports ── */}
      {role === "Admin" && (
        <>
          <hr />
          {/* Stations for Each Train */}
          <div className="report-section">
            <h2 className="section-title">Stations for Each Train</h2>
            {trainStations.length === 0 ? (
              <p className="text-muted">No stations found.</p>
            ) : (
              <div className="report-table-wrap">
                <table className="report-table">
                  <thead>
                    <tr>
                      <th>Train Name</th>
                      <th>Train ID</th>
                      <th>Stations</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trainStations.map((item) => (
                      <tr key={item.TrainID}>
                        <td data-label="Train Name">{item.English_name}</td>
                        <td data-label="Train ID">{item.TrainID}</td>
                        <td data-label="Stations">{item.Stations}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <hr />

          {/* Waitlisted Loyalty Passengers */}
          <div className="report-section">
            <h2 className="section-title">Waitlisted Loyalty Passengers</h2>
            <div style={{ display: "flex", gap: "12px", alignItems: "flex-end", flexWrap: "wrap", marginBottom: "16px" }}>
              <div className="form-group" style={{ flex: 1, minWidth: "200px", marginBottom: 0 }}>
                <label className="label">Train Number</label>
                <input
                  className="input"
                  type="text"
                  placeholder="Enter Train Number"
                  value={trainNumber}
                  onChange={(e) => setTrainNumber(e.target.value)}
                />
              </div>
              <button className="button auto report-button" onClick={handleGetWaitlisted}>
                Get Waitlisted
              </button>
            </div>
            {waitlistError && <p className="error-message">{waitlistError}</p>}
            {waitlist.length > 0 && (
              <div className="report-table-wrap">
                <table className="report-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Loyalty Status</th>
                      <th>Class</th>
                    </tr>
                  </thead>
                  <tbody>
                    {waitlist.map((p, i) => (
                      <tr key={i}>
                        <td data-label="Name">{p.Name}</td>
                        <td data-label="Loyalty Status">{p.LoyaltyStat}</td>
                        <td data-label="Class">{p.CoachType}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {!waitlistError && waitlist.length === 0 && trainNumber && (
              <p className="text-muted">No waitlisted loyalty passengers found.</p>
            )}
          </div>

          <hr />

          {/* Average Load Factor & Dependents share the same date picker */}
          <div style={{ display: "flex", gap: "12px", alignItems: "flex-end", flexWrap: "wrap", marginBottom: "24px" }}>
            <div className="form-group" style={{ flex: 1, minWidth: "200px", marginBottom: 0 }}>
              <label className="label">Select Date</label>
              <input
                className="input"
                type="date"
                value={reportDate}
                onChange={(e) => setReportDate(e.target.value)}
              />
            </div>
            <button className="button auto report-button" onClick={handleGetLoadFactor}>
              Load Factor
            </button>
            <button className="button auto report-button secondary" onClick={handleGetDependents}>
              Dependents
            </button>
          </div>

          {/* Average Load Factor */}
          <div className="report-section">
            <h2 className="section-title">Average Load Factor by Date</h2>
            {loadFactorError && <p className="error-message">{loadFactorError}</p>}
            {loadFactor.length > 0 ? (
              <div className="report-table-wrap">
                <table className="report-table">
                  <thead>
                    <tr>
                      <th>Train Name</th>
                      <th>Train ID</th>
                      <th>Load Factor (%)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadFactor.map((lf) => (
                      <tr key={lf.TrainID}>
                        <td data-label="Train Name">{lf.English_name}</td>
                        <td data-label="Train ID">{lf.TrainID}</td>
                        <td data-label="Load Factor">{lf.AverageLoadFactor}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              !loadFactorError && <p className="text-muted">Select a date and click "Load Factor".</p>
            )}
          </div>

          <hr />

          {/* Dependents Traveling */}
          <div className="report-section">
            <h2 className="section-title">Dependents Traveling by Date</h2>
            {dependentsError && <p className="error-message">{dependentsError}</p>}
            {dependents.length > 0 ? (
              <div className="report-table-wrap">
                <table className="report-table">
                  <thead>
                    <tr>
                      <th>Dependent Name</th>
                      <th>Passenger Name</th>
                      <th>Date</th>
                      <th>Train</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dependents.map((d, i) => (
                      <tr key={i}>
                        <td data-label="Dependent Name">{d.DependentName}</td>
                        <td data-label="Passenger Name">{d.PassengerName}</td>
                        <td data-label="Date">{d.Date}</td>
                        <td data-label="Train">{d.English_name}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              !dependentsError && <p className="text-muted">Select a date and click "Dependents".</p>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Reports;
