// frontend/src/App.js
import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import SearchTrains from "./components/SearchTrains";
import BookSeat from "./components/BookSeat";
import Login from "./components/Login";

function App() {
  return (
    <Router>
      <Navbar />
      <div className="container" style={styles.container}>
        <Routes>
          <Route path="/searchtrain" element={<SearchTrains />} />
          <Route path="/book" element={<BookSeat />} />
          <Route path="/" element={<Login />} />
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
