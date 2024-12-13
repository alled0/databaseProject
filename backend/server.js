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
app.post("/assignStaff", async (req, res) => {
  const { trainID, staffID, role } = req.body;

  if (!trainID || !staffID || !role) {
    return res
      .status(400)
      .json({ error: "Train ID, Staff ID, and Role are required." });
  }

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // Validate TrainID
    const [train] = await connection.query(
      "SELECT TrainID FROM Train WHERE TrainID = ?",
      [trainID]
    );
    if (train.length === 0) {
      return res.status(400).json({ error: "Invalid Train ID." });
    }

    // Validate StaffID
    const [staff] = await connection.query(
      "SELECT StaffID FROM Staff WHERE StaffID = ?",
      [staffID]
    );
    if (staff.length === 0) {
      return res.status(400).json({ error: "Invalid Staff ID." });
    }

    // Map role to Stop_Sequence
    const roleMap = {
      Driver: 1,
      Engineer: 2,
    };
    const stopSequence = roleMap[role];
    if (!stopSequence) {
      return res
        .status(400)
        .json({ error: "Invalid role. Allowed roles are Driver, Engineer." });
    }

    // Insert or update staff assignment
    const sql = `
      INSERT INTO Schedule (TrainID, StationID, Stop_Sequence)
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE Stop_Sequence = ?;
    `;
    const [result] = await connection.query(sql, [
      trainID,
      staffID, // Map staffID to StationID
      stopSequence,
      stopSequence,
    ]);

    await connection.commit();
    res.status(200).json({ message: "Staff assigned successfully." });
  } catch (err) {
    console.error("Error assigning staff:", err);
    await connection.rollback();
    res
      .status(500)
      .json({ error: "A server error occurred. Please try again later." });
  } finally {
    connection.release();
  }
});

// promote passengeres
app.post("/promotePassenger", async (req, res) => {
  const { passengerID } = req.body;

  if (!passengerID) {
    return res.status(400).json({ error: "Passenger ID is required." });
  }

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    console.log("PassengerID received:", passengerID);

    // Check if PassengerID exists in the WaitingList
    const [waitlist] = await connection.query(
      `
      SELECT wl.ReservationID
      FROM WaitingList wl
      JOIN Reservation r ON wl.ReservationID = r.ReservationID
      WHERE r.PassengerID = ?
      `,
      [passengerID]
    );

    if (waitlist.length === 0) {
      console.log(
        "Passenger not found in waitlist for PassengerID:",
        passengerID
      );
      return res
        .status(404)
        .json({ error: "Passenger not found in the waitlist." });
    }

    const reservationID = waitlist[0].ReservationID;

    // Remove Passenger from WaitingList
    await connection.query("DELETE FROM WaitingList WHERE ReservationID = ?", [
      reservationID,
    ]);
    console.log("Removed from WaitingList, ReservationID:", reservationID);

    // Fetch Train Details
    const [trainDetails] = await connection.query(
      `
      SELECT Train.TrainID, Train.English_name, Train.Arabic_name, Schedule.Departure_Time AS Date, 
             Station.name AS FromStation, Station2.name AS ToStation
      FROM Reservation
      JOIN Train ON Reservation.TrainID = Train.TrainID
      JOIN Schedule ON Reservation.TrainID = Schedule.TrainID
      JOIN Station AS Station ON Reservation.FromStation = Station.StationID
      JOIN Station AS Station2 ON Reservation.ToStation = Station2.StationID
      WHERE Reservation.ReservationID = ?
      `,
      [reservationID]
    );

    if (trainDetails.length === 0) {
      console.log(
        "Failed to fetch train details for ReservationID:",
        reservationID
      );
      throw new Error("Failed to fetch train details.");
    }

    await connection.commit();
    res.status(200).json({
      message: "Passenger promoted successfully!",
      trainDetails: trainDetails[0],
    });
  } catch (err) {
    console.error("Error promoting passenger:", err);
    await connection.rollback();
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



// Example endpoints (add these to server.js):

// 1. Current active trains today (all users)
// 1. Current active trains today or selected date (all users)
app.get("/reports/active-trains", async (req, res) => {
  try {
    const { date } = req.query; // Get date from query parameters
    let sql;
    let params = [];

    if (date) {
      // Validate the date format (basic validation)
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(date)) {
        return res.status(400).json({ error: "Invalid date format. Use YYYY-MM-DD." });
      }

      sql = `
        SELECT DISTINCT t.TrainID, t.English_name
        FROM Train t
        JOIN Reservation r ON t.TrainID = r.TrainID
        WHERE r.Date = ?
      `;
      params = [date];
      console.log(`Fetching active trains for date: ${date}`);
    } else {
      sql = `
        SELECT DISTINCT t.TrainID, t.English_name
        FROM Train t
        JOIN Reservation r ON t.TrainID = r.TrainID
        WHERE r.Date = CURDATE()
      `;
      console.log(`Fetching active trains for today: ${new Date().toISOString().split('T')[0]}`);
    }

    const [rows] = await db.query(sql, params);
    console.log(`Active trains fetched: ${JSON.stringify(rows)}`);
    res.json(rows);
  } catch (err) {
    console.error("Error fetching active trains:", err);
    res.status(500).json({ error: err.message });
  }
});

// 2. List stations for each train (admin)
app.get("/reports/stations-for-trains", async (req, res) => {
  try {
    const sql = `
      SELECT t.TrainID, t.English_name, GROUP_CONCAT(s.name ORDER BY sc.Stop_Sequence ASC) AS Stations
      FROM Train t
      JOIN Schedule sc ON t.TrainID = sc.TrainID
      JOIN Station s ON sc.StationID = s.StationID
      GROUP BY t.TrainID
    `;
    const [rows] = await db.query(sql);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Reservation details given passenger ID (passenger)
app.get("/reports/reservations/:passengerID", async (req, res) => {
  const { passengerID } = req.params;
  try {
    const sql = `
      SELECT r.ReservationID, r.Date, tr.English_name, sFrom.name AS FromName, sTo.name AS ToName
      FROM Reservation r
      JOIN Train tr ON r.TrainID = tr.TrainID
      JOIN Station sFrom ON r.FromStation = sFrom.StationID
      JOIN Station sTo ON r.ToStation = sTo.StationID
      WHERE r.PassengerID = ?
    `;
    const [rows] = await db.query(sql, [passengerID]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Waitlisted loyalty passengers in each class given a train number (admin)
app.get("/reports/waitlisted-loyalty/:trainNumber", async (req, res) => {
  const { trainNumber } = req.params;
  try {
    const sql = `
      SELECT p.Name, p.LoyaltyStat, r.CoachType
      FROM WaitingList w
      JOIN Reservation r ON w.ReservationID = r.ReservationID
      JOIN Passenger p ON r.PassengerID = p.PassengerID
      WHERE r.TrainID = ?
      AND p.LoyaltyStat IN ('Silver','Gold')
    `;
    const [rows] = await db.query(sql, [trainNumber]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Average load factor for each train on a given date (admin)
app.get("/reports/load-factor/:date", async (req, res) => {
  const { date } = req.params;
  try {
    // Example logic: Suppose total seats is fixed (e.g., Economy=100 seats, Business=50)
    // and count how many reservations exist for each train on that date
    // This is a mock calculation; adjust based on your data.
    const sql = `
      SELECT r.TrainID, 
             COUNT(*) AS BookedSeats, 
             (SELECT 150) AS TotalSeats, 
             (COUNT(*) / 150)*100 AS AverageLoadFactor
      FROM Reservation r
      WHERE r.Date = ?
      GROUP BY r.TrainID
    `;
    const [rows] = await db.query(sql, [date]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 6. List of dependents travelling on a given date (admin)
app.get("/reports/dependents/:date", async (req, res) => {
  const { date } = req.params;
  try {
    const sql = `
      SELECT d.Name AS DependentName, p.Name AS PassengerName, r.Date, t.English_name
      FROM Dependent d
      JOIN Passenger p ON d.Passenger_ID = p.PassengerID
      JOIN Reservation r ON p.PassengerID = r.PassengerID
      JOIN Train t ON r.TrainID = t.TrainID
      WHERE r.Date = ?
    `;
    const [rows] = await db.query(sql, [date]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 1. Current active trains today or selected date (all users)
app.get("/reports/active-trains", async (req, res) => {
  try {
    const { date } = req.query; // Get date from query parameters
    let sql;
    let params = [];

    if (date) {
      // Validate the date format (basic validation)
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(date)) {
        return res.status(400).json({ error: "Invalid date format. Use YYYY-MM-DD." });
      }

      sql = `
        SELECT DISTINCT t.TrainID, t.English_name
        FROM Train t
        JOIN Reservation r ON t.TrainID = r.TrainID
        WHERE r.Date = ?
      `;
      params = [date];
      console.log(`Fetching active trains for date: ${date}`);
    } else {
      sql = `
        SELECT DISTINCT t.TrainID, t.English_name
        FROM Train t
        JOIN Reservation r ON t.TrainID = r.TrainID
        WHERE r.Date = CURDATE()
      `;
      console.log(`Fetching active trains for today: ${new Date().toISOString().split('T')[0]}`);
    }

    const [rows] = await db.query(sql, params);
    console.log(`Active trains fetched: ${JSON.stringify(rows)}`);
    res.json(rows);
  } catch (err) {
    console.error("Error fetching active trains:", err);
    res.status(500).json({ error: err.message });
  }
});

// 3. Reservation details given passenger ID and optional date (passenger)
app.get("/reports/reservations/:passengerID", async (req, res) => {
  const { passengerID } = req.params;
  const { date } = req.query;

  try {
    let sql = `
      SELECT r.ReservationID, r.Date, tr.English_name, sFrom.name AS FromName, sTo.name AS ToName
      FROM Reservation r
      JOIN Train tr ON r.TrainID = tr.TrainID
      JOIN Station sFrom ON r.FromStation = sFrom.StationID
      JOIN Station sTo ON r.ToStation = sTo.StationID
      WHERE r.PassengerID = ?
    `;
    let params = [passengerID];
    if (date) {
      sql += " AND r.Date = ?";
      params.push(date);
    }

    const [rows] = await db.query(sql, params);
    console.log(`Reservations for PassengerID ${passengerID} on ${date || 'all dates'}: ${JSON.stringify(rows)}`);
    res.json(rows);
  } catch (err) {
    console.error("Error fetching reservations:", err);
    res.status(500).json({ error: err.message });
  }
});



// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
