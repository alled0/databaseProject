//App.js
import React, { useState } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import SearchTrains from "./components/SearchTrains";
import BookSeat from "./components/BookSeat";
import Login from "./components/Login";
import Register from "./components/Register";
import ManageReservations from "./components/ManageReservations";
import AssignStaff from "./components/AssignStaff";
import PromotePassenger from "./components/PromotePassenger";
import Payment from "./components/Payment";
import Reports from './components/Reports';

function App() {
  const [role, setRole] = useState(() => localStorage.getItem("role") || "");
  const [passengerID, setPassengerID] = useState(() => localStorage.getItem("passengerID") || "");
  const [userEmail, setUserEmail] = useState(() => localStorage.getItem("userEmail") || "");

  const handleLogin = (userRole, pid, email) => {
    setRole(userRole);
    setPassengerID(pid || "");
    setUserEmail(email || "");
    localStorage.setItem("role", userRole);
    localStorage.setItem("passengerID", pid || "");
    localStorage.setItem("userEmail", email || "");
  };

  const handleLogout = () => {
    setRole("");
    setPassengerID("");
    setUserEmail("");
    localStorage.removeItem("role");
    localStorage.removeItem("passengerID");
    localStorage.removeItem("userEmail");
  };

  const requireRole = (allowedRole, element) => {
    if (!role) return <Navigate to="/" replace />;
    if (role !== allowedRole) return <Navigate to="/" replace />;
    return element;
  };

  return (
    <Router>
      {role && <Navbar role={role} onLogout={handleLogout} />}
      <div>
        <Routes>
          <Route path="/" element={<Login onLogin={handleLogin} />} />
          <Route path="/register" element={<Register onLogin={handleLogin} />} />
          <Route path="/searchtrain" element={requireRole("Passenger", <SearchTrains />)} />
          <Route path="/book" element={requireRole("Passenger", <BookSeat email={userEmail} />)} />
          <Route path="/payment/:reservationID" element={requireRole("Passenger", <Payment />)} />
          <Route path="/reports" element={role ? <Reports role={role} passengerID={passengerID} /> : <Navigate to="/" replace />} />
          <Route path="/manage-reservations" element={requireRole("Admin", <ManageReservations />)} />
          <Route path="/assign-staff" element={requireRole("Admin", <AssignStaff />)} />
          <Route path="/promote-passenger" element={requireRole("Admin", <PromotePassenger />)} />
        </Routes>
      </div>
    </Router>
  );
}


export default App;
