// frontend/src/components/Reports.js
import React, { useState, useEffect } from "react";
import "../style/Admin.css"; // Ensure the correct path

const Reports = ({ role, passengerID }) => {
  const [activeTrains, setActiveTrains] = useState([]);
  const [trainStations, setTrainStations] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [waitlist, setWaitlist] = useState([]);
  const [loadFactor, setLoadFactor] = useState([]);
  const [dependents, setDependents] = useState([]);

  const [selectedDate, setSelectedDate] = useState(""); // For active trains
  const [reportDate, setReportDate] = useState(""); // For other admin reports
  const [trainNumber, setTrainNumber] = useState("");

  // 1. Fetch Active Trains based on selected date (default today)
  useEffect(() => {
    const fetchActiveTrains = async () => {
      try {
        let url = "http://localhost:4000/reports/active-trains";
        if (selectedDate) {
          url += `?date=${encodeURIComponent(selectedDate)}`;
        }
        console.log(`Fetching active trains with URL: ${url}`);
        const response = await fetch(url);
        if (!response.ok) {
          const errorData = await response.json();
          console.error("Error fetching active trains:", errorData);
          setActiveTrains([]);
          return;
        }
        const data = await response.json();
        console.log("Active trains data:", data);
        setActiveTrains(data);
      } catch (err) {
        console.error("Error fetching active trains:", err);
        setActiveTrains([]);
      }
    };

    fetchActiveTrains();
  }, [selectedDate]);

  // 2. Fetch Stations for Each Train (Admin only)
  useEffect(() => {
    if (role === "Admin") {
      const fetchTrainStations = async () => {
        try {
          const response = await fetch("http://localhost:4000/reports/stations-for-trains");
          if (!response.ok) {
            const errorData = await response.json();
            console.error("Error fetching train stations:", errorData);
            setTrainStations([]);
            return;
          }
          const data = await response.json();
          console.log("Train stations data:", data);
          setTrainStations(data);
        } catch (err) {
          console.error("Error fetching train stations:", err);
          setTrainStations([]);
        }
      };

      fetchTrainStations();
    }
  }, [role]);

  // 3. Fetch Reservation Details for Passenger (Passenger only)
  useEffect(() => {
    if (role === "Passenger" && passengerID) {
      const fetchReservations = async () => {
        try {
          const response = await fetch(`http://localhost:4000/reports/reservations/${passengerID}`);
          if (!response.ok) {
            const errorData = await response.json();
            console.error("Error fetching reservations:", errorData);
            setReservations([]);
            return;
          }
          const data = await response.json();
          console.log("Reservations data:", data);
          setReservations(data);
        } catch (err) {
          console.error("Error fetching reservations:", err);
          setReservations([]);
        }
      };

      fetchReservations();
    }
  }, [role, passengerID]);

  // 4. Fetch Waitlisted Loyalty Passengers (Admin only)
  const handleGetWaitlisted = async () => {
    if (!trainNumber) {
      alert("Please enter a Train Number.");
      return;
    }
    try {
      const url = `http://localhost:4000/reports/waitlisted-loyalty/${encodeURIComponent(trainNumber)}`;
      console.log(`Fetching waitlisted passengers with URL: ${url}`);
      const response = await fetch(url);
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error fetching waitlisted passengers:", errorData);
        setWaitlist([]);
        return;
      }
      const data = await response.json();
      console.log("Waitlist data:", data);
      setWaitlist(data);
    } catch (err) {
      console.error("Error fetching waitlisted passengers:", err);
      setWaitlist([]);
    }
  };

  // 5. Fetch Average Load Factor (Admin only)
  const handleGetLoadFactor = async () => {
    if (!reportDate) {
      alert("Please select a date.");
      return;
    }
    try {
      const url = `http://localhost:4000/reports/load-factor/${encodeURIComponent(reportDate)}`;
      console.log(`Fetching load factor with URL: ${url}`);
      const response = await fetch(url);
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error fetching load factor:", errorData);
        setLoadFactor([]);
        return;
      }
      const data = await response.json();
      console.log("Load factor data:", data);
      setLoadFactor(data);
    } catch (err) {
      console.error("Error fetching load factor:", err);
      setLoadFactor([]);
    }
  };

  // 6. Fetch Dependents Traveling (Admin only)
  const handleGetDependents = async () => {
    if (!reportDate) {
      alert("Please select a date.");
      return;
    }
    try {
      const url = `http://localhost:4000/reports/dependents/${encodeURIComponent(reportDate)}`;
      console.log(`Fetching dependents with URL: ${url}`);
      const response = await fetch(url);
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error fetching dependents:", errorData);
        setDependents([]);
        return;
      }
      const data = await response.json();
      console.log("Dependents data:", data);
      setDependents(data);
    } catch (err) {
      console.error("Error fetching dependents:", err);
      setDependents([]);
    }
  };

  return (
    <div className="container">
      <h1 className="heading">Reports</h1>

      {/* Report #1: Active Trains Today or Selected Date (All Users) */}
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
        <ul>
          {activeTrains.map((train) => (
            <li key={train.TrainID}>
              {train.English_name} (Train ID: {train.TrainID})
            </li>
          ))}
        </ul>
      )}

      {/* Passenger Report */}
      {role === "Passenger" && (
        <>
          <hr />
          {/* Report #3: Passenger Reservation Details */}
          <h2>Your Reservation Details</h2>
          {reservations.length === 0 ? (
            <p>No reservation details found.</p>
          ) : (
            <ul>
              {reservations.map((resv) => (
                <li key={resv.ReservationID}>
                  <strong>Reservation ID:</strong> {resv.ReservationID}, <strong>Train:</strong> {resv.English_name}, 
                  <strong>Date:</strong> {resv.Date}, <strong>From:</strong> {resv.FromName}, <strong>To:</strong> {resv.ToName}
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      {/* Admin Reports */}
      {role === "Admin" && (
        <>
          <hr />
          {/* Report #2: Stations for Each Train */}
          <h2>Stations for Each Train</h2>
          {trainStations.length === 0 ? (
            <p>No stations found.</p>
          ) : (
            <ul>
              {trainStations.map((item) => (
                <li key={item.TrainID}>
                  <strong>{item.English_name}</strong>: {item.Stations}
                </li>
              ))}
            </ul>
          )}

          <hr />
          {/* Report #4: Waitlisted Loyalty Passengers */}
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
          <button className="button" onClick={handleGetWaitlisted}>Get Waitlisted</button>
          {waitlist.length > 0 ? (
            <ul>
              {waitlist.map((p, index) => (
                <li key={index}>
                  <strong>Name:</strong> {p.Name} - <strong>Loyalty Status:</strong> {p.LoyaltyStat}, <strong>Class:</strong> {p.CoachType}
                </li>
              ))}
            </ul>
          ) : (
            <p>No waitlisted loyalty passengers found.</p>
          )}

          <hr />
          {/* Report #5: Average Load Factor */}
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
          <button className="button" onClick={handleGetLoadFactor}>Get Load Factor</button>
          {loadFactor.length > 0 ? (
            <ul>
              {loadFactor.map((lf) => (
                <li key={lf.TrainID}>
                  <strong>Train:</strong> {lf.English_name} (ID: {lf.TrainID}): <strong>Load Factor:</strong> {lf.AverageLoadFactor}%
                </li>
              ))}
            </ul>
          ) : (
            <p>No load factor data found.</p>
          )}

          <hr />
          {/* Report #6: Dependents Traveling */}
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
          <button className="button" onClick={handleGetDependents}>Get Dependents</button>
          {dependents.length > 0 ? (
            <ul>
              {dependents.map((d, index) => (
                <li key={index}>
                  <strong>Dependent:</strong> {d.DependentName}, <strong>Passenger:</strong> {d.PassengerName}, 
                  <strong>Date:</strong> {d.Date}, <strong>Train:</strong> {d.English_name}
                </li>
              ))}
            </ul>
          ) : (
            <p>No dependents traveling on the selected date.</p>
          )}
        </>
      )}
    </div>
  );
};

export default Reports;
