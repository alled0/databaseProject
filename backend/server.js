// backend/server.js
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const db = require("./database");
require("dotenv").config();

const app = express();
const PORT = 4000;

app.use(cors());
app.use(bodyParser.json());

// Test Route
app.get("/", (req, res) => {
  res.send("Saudi Railways Backend");
});

// Get all trains
app.get("/trains", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM Train");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all stations
app.get("/stations", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM Station");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Search for trains based on origin and destination
app.get("/searchTrains", async (req, res) => {
  const { fromStation, toStation } = req.query;
  if (!fromStation || !toStation) {
    return res
      .status(400)
      .json({ error: "fromStation and toStation are required" });
  }
  try {
    const sql = `
      SELECT DISTINCT Train.TrainID, Train.English_name, Train.Arabic_name
      FROM Train
      JOIN Schedule AS s1 ON Train.TrainID = s1.TrainID
      JOIN Schedule AS s2 ON Train.TrainID = s2.TrainID
      WHERE s1.StationID = ? AND s2.StationID = ? AND s1.Stop_Sequence < s2.Stop_Sequence
    `;
    const [rows] = await db.query(sql, [fromStation, toStation]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Book a seat (Create Reservation)
app.post("/bookSeat", async (req, res) => {
  const {
    TrainID,
    Date,
    FromStation,
    ToStation,
    CoachType,
    SeatNumber,
    PassengerName,
    ContactInfo,
    IDDocument,
    LuggageDetails, // Assuming LuggageDetails is stored elsewhere or handled differently
  } = req.body;

  if (
    !TrainID ||
    !Date ||
    !FromStation ||
    !ToStation ||
    !CoachType ||
    !SeatNumber ||
    !PassengerName ||
    !IDDocument
  ) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // Insert Passenger
    const insertPassenger = `INSERT INTO Passenger (Name, ContactInfo, IDDocument) VALUES (?, ?, ?)`;
    const [passengerResult] = await connection.query(insertPassenger, [
      PassengerName,
      ContactInfo,
      IDDocument,
    ]);
    const PassengerID = passengerResult.insertId;

    // Insert Reservation
    const insertReservation = `
      INSERT INTO Reservation (TrainID, Date, FromStation, ToStation, CoachType, SeatNumber, PassengerID)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const [reservationResult] = await connection.query(insertReservation, [
      TrainID,
      Date,
      FromStation,
      ToStation,
      CoachType,
      SeatNumber,
      PassengerID,
    ]);
    const ReservationID = reservationResult.insertId;

    // For simplicity, setting Payment_Status as 'Pending'
    const insertPayment = `
      INSERT INTO Payment (ResID, Date, VAT, Amount, Payment_Status)
      VALUES (?, NOW(), 15.00, 100.00, 'Pending')
    `;
    const [paymentResult] = await connection.query(insertPayment, [
      ReservationID,
    ]);
    const PaymentID = paymentResult.insertId;

    // Update Reservation with PaymentID
    const updateReservation = `UPDATE Reservation SET PaymentID = ? WHERE ReservationID = ?`;
    await connection.query(updateReservation, [PaymentID, ReservationID]);

    await connection.commit();

    res.json({
      message: "Reservation successful",
      ReservationID: ReservationID,
      PaymentID: PaymentID,
    });
  } catch (err) {
    await connection.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    connection.release();
  }
});

// Add Payment (for simulating payment processing)
app.post("/addPayment", async (req, res) => {
  const { ResID, VAT, Amount, Payment_Status } = req.body;
  if (!ResID || !VAT || !Amount || !Payment_Status) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  try {
    const sql = `INSERT INTO Payment (ResID, Date, VAT, Amount, Payment_Status) VALUES (?, NOW(), ?, ?, ?)`;
    const [result] = await db.query(sql, [ResID, VAT, Amount, Payment_Status]);
    res.json({ message: "Payment recorded", PaymentID: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login
app.post("/api/login", async (req, res) => {


  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Email and password are required." });
  }

  try {
    // Check Passenger table
    const passengerQuery =
      "SELECT * FROM Passenger WHERE email = ? AND password = ?";
    const [passengerRows] = await db.query(passengerQuery, [email, password]);

    if (passengerRows.length > 0) {
      return res.json({ role: "Passenger" });
    }

    // Check Staff table
    const staffQuery = "SELECT * FROM Staff WHERE email = ? AND password = ?";
    const [staffRows] = await db.query(staffQuery, [email, password]);

    if (staffRows.length > 0) {
      return res.json({ role: "Admin" });
    }

    // If no match found
    return res.status(401).json({ message: "Invalid email or password." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error." });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
