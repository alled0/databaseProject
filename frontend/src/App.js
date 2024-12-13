import React, { useState } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import SearchTrains from "./components/SearchTrains";
import BookSeat from "./components/BookSeat";
import Login from "./components/Login";
import ManageReservations from "./components/ManageReservations";
import AssignStaff from "./components/AssignStaff";
import PromotePassenger from "./components/PromotePassenger";
import Payment from "./components/Payment";

function App() {
  // Simulate user role (change between "Passenger" and "Admin" to test)
  const [role, setRole] = useState("");

  const handleLogin = (userRole) => {
    setRole(userRole); // Set role based on login
  };

  const handleLogout = () => {
    setRole(""); // Reset role on logout
  };

  return (
    <Router>
      {role && <Navbar role={role} onLogout={handleLogout} />}
      <div className="container" style={styles.container}>
        <Routes>
          <Route path="/" element={<Login onLogin={handleLogin} />} />
          {role === "Passenger" && (
            <>
              <Route path="/searchtrain" element={<SearchTrains />} />
              <Route path="/book" element={<BookSeat />} />
              <Route path="/payment/:reservationID" element={<Payment />} />
            </>
          )}
          {role === "Admin" && (
            <>
              <Route
                path="/manage-reservations"
                element={<ManageReservations />}
              />
              <Route path="/assign-staff" element={<AssignStaff />} />
              <Route path="/promote-passenger" element={<PromotePassenger />} />
            </>
          )}
        </Routes>
      </div>
    </Router>
  );
}

const styles = {
  container: {
    padding: "20px",
  },
};

export default App;
