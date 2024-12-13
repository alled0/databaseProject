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

app.post("/bookSeat", async (req, res) => {
  const {
    TrainID,
    Date,
    FromStation,
    ToStation,
    CoachType,
    SeatNumber,
    LuggageDetails,
    email, // Email of the logged-in user
  } = req.body;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (
    !TrainID ||
    !Date ||
    !FromStation ||
    !ToStation ||
    !CoachType ||
    !SeatNumber ||
    !email ||
    !emailRegex.test(email)
  ) {
    return res.status(400).json({
      error: "Missing required fields or invalid email format",
    });
  }

  const connection = await db.getConnection();
  try {
    // Validate TrainID
    const [train] = await connection.query(
      "SELECT TrainID FROM Train WHERE TrainID = ?",
      [TrainID]
    );
    if (train.length === 0) {
      return res.status(400).json({
        error: "Invalid TrainID. Please select a valid train.",
      });
    }

    // Validate FromStation and ToStation
    const [fromStation] = await connection.query(
      "SELECT StationID FROM Station WHERE StationID = ?",
      [FromStation]
    );
    if (fromStation.length === 0) {
      return res.status(400).json({
        error: "Invalid FromStation. Please select a valid station.",
      });
    }

    const [toStation] = await connection.query(
      "SELECT StationID FROM Station WHERE StationID = ?",
      [ToStation]
    );
    if (toStation.length === 0) {
      return res.status(400).json({
        error: "Invalid ToStation. Please select a valid station.",
      });
    }

    // Fetch PassengerID using email
    const [passenger] = await connection.query(
      "SELECT PassengerID FROM Passenger WHERE email = ?",
      [email]
    );
    if (passenger.length === 0) {
      return res.status(400).json({
        error: "Invalid email. Please log in with a registered account.",
      });
    }
    const PassengerID = passenger[0].PassengerID;

    await connection.beginTransaction();

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

    // Insert Payment
    const insertPayment = `
      INSERT INTO Payment (ResID, Date, VAT, Amount, Payment_Status)
      VALUES (?, NOW(), 15.00, 100.00, 'Pending')
    `;
    const [paymentResult] = await connection.query(insertPayment, [
      ReservationID,
    ]);
    const PaymentID = paymentResult.insertId;

    // Update Reservation with PaymentID
    const updateReservation = `
      UPDATE Reservation SET PaymentID = ? WHERE ReservationID = ?
    `;
    await connection.query(updateReservation, [PaymentID, ReservationID]);

    await connection.commit();
    res.json({
      message: "Reservation successful",
      ReservationID,
    });
  } catch (err) {
    console.error("Error during booking process:", err);

    await connection.rollback();

    res.status(500).json({
      error: "A server error occurred. Please try again later.",
    });
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

app.post("/completePayment", async (req, res) => {
  const { reservationID } = req.body;

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const updatePayment = `
      UPDATE Payment SET Payment_Status = 'Completed' WHERE ResID = ?
    `;
    const [result] = await connection.query(updatePayment, [reservationID]);

    if (result.affectedRows === 0) {
      throw new Error("No payment found for the given reservation ID.");
    }

    await connection.commit();
    res.status(200).json({ message: "Payment successful" });
  } catch (err) {
    console.error("Payment error:", err);
    await connection.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    connection.release();
  }
});

// Manage Reservations
app.post("/manageReservations", async (req, res) => {
  const { action, reservationID, passengerEmail, details } = req.body;

  if (!action) {
    return res.status(400).json({ error: "Action is required." });
  }

  const connection = await db.getConnection();

  try {
    if (action === "Add") {
      // Logic to Add a Reservation
      const { Date, FromStation, ToStation, CoachType, SeatNumber } = details;

      if (
        !Date ||
        !FromStation ||
        !ToStation ||
        !CoachType ||
        !SeatNumber ||
        !passengerEmail
      ) {
        return res.status(400).json({
          error:
            "Date, FromStation, ToStation, CoachType, SeatNumber, and Passenger Email are required.",
        });
      }

      // Lookup PassengerID by Email
      const [passenger] = await connection.query(
        "SELECT PassengerID FROM Passenger WHERE email = ?",
        [passengerEmail]
      );
      if (passenger.length === 0) {
        return res.status(400).json({ error: "Invalid passenger email." });
      }
      const PassengerID = passenger[0].PassengerID;

      const sql = `
        INSERT INTO Reservation (Date, FromStation, ToStation, CoachType, SeatNumber, PassengerID)
        VALUES (?, ?, ?, ?, ?, ?)
      `;
      const [result] = await connection.query(sql, [
        Date,
        FromStation,
        ToStation,
        CoachType,
        SeatNumber,
        PassengerID,
      ]);
      return res.json({
        message: "Reservation added successfully.",
        reservationID: result.insertId,
      });
    } else if (action === "Edit") {
      // Logic to Edit a Reservation
      const { Date, FromStation, ToStation, CoachType, SeatNumber } = details;

      if (!reservationID) {
        return res.status(400).json({
          error: "Reservation ID is required for editing.",
        });
      }

      const sql = `
        UPDATE Reservation
        SET
          Date = COALESCE(?, Date),
          FromStation = COALESCE(?, FromStation),
          ToStation = COALESCE(?, ToStation),
          CoachType = COALESCE(?, CoachType),
          SeatNumber = COALESCE(?, SeatNumber)
        WHERE ReservationID = ?
      `;
      const [result] = await connection.query(sql, [
        Date,
        FromStation,
        ToStation,
        CoachType,
        SeatNumber,
        reservationID,
      ]);
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Reservation not found." });
      }
      return res.json({ message: "Reservation updated successfully." });
    } else if (action === "Cancel") {
      // Logic to Cancel a Reservation
      if (!reservationID) {
        return res
          .status(400)
          .json({ error: "Reservation ID is required for cancellation." });
      }

      // Ensure related data (e.g., Payment) is handled
      const deletePayment = `
        DELETE FROM Payment WHERE ResID = ?
      `;
      await connection.query(deletePayment, [reservationID]);

      const deleteReservation = `
        DELETE FROM Reservation WHERE ReservationID = ?
      `;
      const [result] = await connection.query(deleteReservation, [
        reservationID,
      ]);
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Reservation not found." });
      }
      return res.json({ message: "Reservation cancelled successfully." });
    } else {
      return res.status(400).json({
        error: "Invalid action. Allowed actions are Add, Edit, Cancel.",
      });
    }
  } catch (err) {
    console.error("Error managing reservation:", err);
    res
      .status(500)
      .json({ error: "A server error occurred. Please try again later." });
  } finally {
    connection.release();
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
