// frontend/src/components/Reports.js
import React, { useState, useEffect } from "react";
import "../style/Report.css";
import API_URL from "../config";

const Reports = ({ role, passengerID: propPassengerID }) => {
  // State variables for Passenger Reports
  const [activeTrains, setActiveTrains] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");

  // Passenger ID input — pre-filled from login session
  const [inputPassengerID, setInputPassengerID] = useState(propPassengerID || "");
  const [submittedPassengerID, setSubmittedPassengerID] = useState(propPassengerID || "");
  const [isLoadingReservations, setIsLoadingReservations] = useState(false);
  const [errorReservations, setErrorReservations] = useState("");

  // State variables for Admin Reports
  const [trainStations, setTrainStations] = useState([]);
  const [waitlist, setWaitlist] = useState([]);
  const [loadFactor, setLoadFactor] = useState([]);
  const [dependents, setDependents] = useState([]);
  const [reportDate, setReportDate] = useState("");
  const [trainNumber, setTrainNumber] = useState("");
  const [waitlistError, setWaitlistError] = useState("");
  const [loadFactorError, setLoadFactorError] = useState("");
  const [dependentsError, setDependentsError] = useState("");

  // Fetch Active Trains based on selected date (Passenger and Admin)
  useEffect(() => {
    const fetchActiveTrains = async () => {
      try {
        let url = `${API_URL}/api/reports/active-trains`;
        if (selectedDate) {
          url += `?date=${encodeURIComponent(selectedDate)}`;
        }
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error("Failed to fetch active trains.");
        }
        const data = await response.json();
        setActiveTrains(data);
      } catch (error) {
        console.error(error);
        setActiveTrains([]);
      }
    };

    fetchActiveTrains();
  }, [selectedDate]);

  // Fetch Reservations for Passenger based on submitted Passenger ID and selected date
  useEffect(() => {
    const fetchReservations = async () => {
      if (!submittedPassengerID) return;

      setIsLoadingReservations(true);
      setErrorReservations("");
      try {
        let url = `${API_URL}/api/reports/reservations/${encodeURIComponent(submittedPassengerID)}`;
        if (selectedDate) {
          url += `?date=${encodeURIComponent(selectedDate)}`;
        }
        const response = await fetch(url);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to fetch reservations.");
        }
        const data = await response.json();
        setReservations(data);
      } catch (error) {
        console.error(error);
        setReservations([]);
        setErrorReservations(error.message);
      } finally {
        setIsLoadingReservations(false);
      }
    };

    fetchReservations();
  }, [submittedPassengerID, selectedDate]);

  // Fetch Stations for Each Train (Admin only)
  useEffect(() => {
    if (role === "Admin") {
      const fetchTrainStations = async () => {
        try {
          const response = await fetch(`${API_URL}/api/reports/stations-for-trains`);
          if (!response.ok) {
            throw new Error("Failed to fetch train stations.");
          }
          const data = await response.json();
          setTrainStations(data);
        } catch (error) {
          console.error(error);
          setTrainStations([]);
        }
      };

      fetchTrainStations();
    }
  }, [role]);

  // Handler Functions for Admin Reports
  const handleGetWaitlisted = async () => {
    setWaitlistError("");
    if (!trainNumber) {
      setWaitlistError("Please enter a Train Number.");
      return;
    }
    try {
      const url = `${API_URL}/api/reports/waitlisted-loyalty/${encodeURIComponent(trainNumber)}`;
      const response = await fetch(url);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch waitlisted passengers.");
      }
      const data = await response.json();
      setWaitlist(data);
    } catch (error) {
      console.error(error);
      setWaitlist([]);
      setWaitlistError(error.message);
    }
  };

  const handleGetLoadFactor = async () => {
    setLoadFactorError("");
    if (!reportDate) {
      setLoadFactorError("Please select a date.");
      return;
    }
    try {
      const url = `${API_URL}/api/reports/load-factor/${encodeURIComponent(reportDate)}`;
      const response = await fetch(url);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch load factor.");
      }
      const data = await response.json();
      setLoadFactor(data);
    } catch (error) {
      console.error(error);
      setLoadFactor([]);
      setLoadFactorError(error.message);
    }
  };

  const handleGetDependents = async () => {
    setDependentsError("");
    if (!reportDate) {
      setDependentsError("Please select a date.");
      return;
    }
    try {
      const url = `${API_URL}/api/reports/dependents/${encodeURIComponent(reportDate)}`;
      const response = await fetch(url);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch dependents.");
      }
      const data = await response.json();
      setDependents(data);
    } catch (error) {
      console.error(error);
      setDependents([]);
      setDependentsError(error.message);
    }
  };

  // Handler for Passenger ID submission
  const handlePassengerIDSubmit = (e) => {
    e.preventDefault();
    if (!inputPassengerID.trim()) {
      setErrorReservations("Please enter your Passenger ID.");
      return;
    }
    setSubmittedPassengerID(inputPassengerID.trim());
  };

  return (
    <div className="container">
      <h1 className="heading">Reports</h1>

      {/* Active Trains Section (Accessible to All Users) */}
      <div className="report-section">
        <h2>Active Trains</h2>
        <div className="form-group">
          <label className="label">Select a Date (default is today)</label>
          <input
            className="input"
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>

        {activeTrains.length === 0 ? (
          <p>No active trains for the selected date.</p>
        ) : (
          <div className="table-responsive">
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

      {/* Passenger Reservations Section */}
      {role === "Passenger" && (
        <>
          <hr />
          <div className="report-section">
            <h2>Your Reservation Details</h2>
            {/* Passenger ID Input Form */}
            <form onSubmit={handlePassengerIDSubmit} className="passenger-id-form">
              <div className="form-group">
                <label className="label">Enter Your Passenger ID</label>
                <input
                  className="input"
                  type="text"
                  placeholder="Passenger ID"
                  value={inputPassengerID}
                  onChange={(e) => setInputPassengerID(e.target.value)}
                />
              </div>
              <button type="submit" className="button report-button">
                Get Reservations
              </button>
            </form>

            {/* Loading Indicator */}
            {isLoadingReservations && <p>Loading reservations...</p>}

            {/* Error Message */}
            {errorReservations && <p className="error-message">{errorReservations}</p>}

            {/* Reservations Table */}
            {!isLoadingReservations && !errorReservations && submittedPassengerID && (
              <>
                {reservations.length === 0 ? (
                  <p className="no-reservations">No reservation details found for the entered Passenger ID.</p>
                ) : (
                  <div className="table-responsive">
                    <table className="report-table">
                      <thead>
                        <tr>
                          <th>Reservation ID</th>
                          <th>Train Name</th>
                          <th>Date</th>
                          <th>From Station</th>
                          <th>To Station</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reservations.map((resv) => (
                          <tr key={resv.ReservationID}>
                            <td data-label="Reservation ID">{resv.ReservationID}</td>
                            <td data-label="Train Name">{resv.English_name}</td>
                            <td data-label="Date">{resv.Date}</td>
                            <td data-label="From Station">{resv.FromName}</td>
                            <td data-label="To Station">{resv.ToName}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}
          </div>
        </>
      )}

      {/* Admin Reports Sections */}
      {role === "Admin" && (
        <>
          <hr />
          {/* Report #2: Stations for Each Train */}
          <div className="report-section">
            <h2>Stations for Each Train</h2>
            {trainStations.length === 0 ? (
              <p>No stations found.</p>
            ) : (
              <div className="table-responsive">
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

          {/* Report #4: Waitlisted Loyalty Passengers */}
          <div className="report-section">
            <h2>Waitlisted Loyalty Passengers by Train Number</h2>
            <div className="form-group">
              <label className="label">Train Number</label>
              <input
                className="input"
                type="text"
                placeholder="Enter Train Number"
                value={trainNumber}
                onChange={(e) => setTrainNumber(e.target.value)}
              />
            </div>
            <button className="button report-button" onClick={handleGetWaitlisted}>
              Get Waitlisted
            </button>
            {waitlistError && <p className="error-message">{waitlistError}</p>}
            {waitlist.length > 0 ? (
              <div className="table-responsive">
                <table className="report-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Loyalty Status</th>
                      <th>Class</th>
                    </tr>
                  </thead>
                  <tbody>
                    {waitlist.map((p, index) => (
                      <tr key={index}>
                        <td data-label="Name">{p.Name}</td>
                        <td data-label="Loyalty Status">{p.LoyaltyStat}</td>
                        <td data-label="Class">{p.CoachType}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p>No waitlisted loyalty passengers found.</p>
            )}
          </div>

          <hr />

          {/* Report #5: Average Load Factor */}
          <div className="report-section">
            <h2>Average Load Factor by Date</h2>
            <div className="form-group">
              <label className="label">Select a Date</label>
              <input
                className="input"
                type="date"
                value={reportDate}
                onChange={(e) => setReportDate(e.target.value)}
              />
            </div>
            <button className="button report-button" onClick={handleGetLoadFactor}>
              Get Load Factor
            </button>
            {loadFactorError && <p className="error-message">{loadFactorError}</p>}
            {loadFactor.length > 0 ? (
              <div className="table-responsive">
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
              <p>No load factor data found.</p>
            )}
          </div>

          <hr />

          {/* Report #6: Dependents Traveling */}
          <div className="report-section">
            <h2>Dependents Traveling by Date</h2>
            <div className="form-group">
              <label className="label">Select a Date</label>
              <input
                className="input"
                type="date"
                value={reportDate}
                onChange={(e) => setReportDate(e.target.value)}
              />
            </div>
            <button className="button report-button" onClick={handleGetDependents}>
              Get Dependents
            </button>
            {dependentsError && <p className="error-message">{dependentsError}</p>}
            {dependents.length > 0 ? (
              <div className="table-responsive">
                <table className="report-table">
                  <thead>
                    <tr>
                      <th>Dependent Name</th>
                      <th>Passenger Name</th>
                      <th>Date</th>
                      <th>Train Name</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dependents.map((d, index) => (
                      <tr key={index}>
                        <td data-label="Dependent Name">{d.DependentName}</td>
                        <td data-label="Passenger Name">{d.PassengerName}</td>
                        <td data-label="Date">{d.Date}</td>
                        <td data-label="Train Name">{d.English_name}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p>No dependents traveling on the selected date.</p>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Reports;
