// backend/server.js
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const db = require("./database");
require("dotenv").config();
const nodemailer = require("nodemailer");
const cron = require("node-cron");

const app = express();
const PORT = 4000;

app.use(cors());
app.use(bodyParser.json());

// Set up Nodemailer transporter
// const transporter = nodemailer.createTransport({
//   service: "gmail",
//   auth: {
//     user: "saudirailwaysdb@gmail.com",
//     pass: "SaudiRailwaysDB123",
//   },
// });

const transporter = nodemailer.createTransport({
  host: "smtp.mail.yahoo.com",
  port: 465,
  secure: false,
  auth: {
    user: "railwaysaudi@yahoo.com", // Replace with your Yahoo email
    pass: "SaudiRailwaysDB123@", // Use your Yahoo account password or app password
  },
  connectionTimeout: 10000000, // 10 seconds
});

// const transporter = nodemailer.createTransport(
//   sgTransport({
//     auth: {
//       api_key: "your-sendgrid-api-key", // Replace with your SendGrid API key
//     },
//   })
// );

// const transporter = nodemailer.createTransport({. 2KL568PFXS5DYUTCU2P82295
//   host: "smtp.office365.com",
//   port: 587,
//   secure: false, // TLS
//   auth: {
//     user: "your-email@outlook.com", // Replace with your Outlook/Hotmail email
//     pass: "your-password", // Use your Outlook account password or app password
//   },
// });

// In-memory log to track sent reminders
const sentReminders = new Set(); // For departure reminders

// Function to send email reminders for unpaid reservations
const sendUnpaidReminders = async () => {
  try {
    const [rows] = await db.query(`
      SELECT Passenger.Email, Passenger.Name, Reservation.ReservationID
      FROM Reservation
      JOIN Passenger ON Reservation.PassengerID = Passenger.PassengerID
      WHERE Reservation.Paid = 0
    `);

    rows.forEach((row) => {
      const mailOptions = {
        from: "railwaysaudi@yahoo.com",
        to: row.Email,
        subject: "Payment Reminder",
        text: `Dear ${row.Name}, please complete the payment for your reservation (ID: ${row.ReservationID}).`,
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error(`Failed to send email to ${row.Email}:`, error);
        } else {
          console.log(`Email sent to ${row.Email}:`, info.response);
        }
      });
    });
  } catch (err) {
    console.error("Error sending reminders:", err);
  }
};

// Function to send departure reminders 3 hours before train departure
const sendDepartureReminders = async () => {
  try {
    const [rows] = await db.query(`
      SELECT r.ReservationID, p.Email, p.Name, t.English_name, t.Arabic_name, s.Departure_Time
      FROM Reservation r
      JOIN Passenger p ON r.PassengerID = p.PassengerID
      JOIN Schedule s ON r.TrainID = s.TrainID
      JOIN Train t ON r.TrainID = t.TrainID
      WHERE TIMESTAMPDIFF(HOUR, NOW(), s.Departure_Time) = 3
    `);

    rows.forEach((row) => {
      if (!sentReminders.has(row.ReservationID)) {
        // Send email
        const mailOptions = {
          from: "railwaysaudi@yahoo.com",
          to: row.Email,
          subject: "Train Departure Reminder",
          text: `Dear ${row.Name}, your train (${row.English_name}/${row.Arabic_name}) is departing at ${row.Departure_Time}. Please be at the station on time.`,
        };

        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.error(`Failed to send reminder to ${row.Email}:`, error);
          } else {
            console.log(`Reminder sent to ${row.Email}:`, info.response);
            sentReminders.add(row.ReservationID); // Log the ReservationID
          }
        });
      }
    });
  } catch (err) {
    console.error("Error sending departure reminders:", err);
  }
};

// Schedule the functions
cron.schedule("0 22 * * *", () => {
  console.log("Sending unpaid email reminders...");
  sendUnpaidReminders();
});

(async () => {
  console.log("Sending unpaid reminders manually...");
  await sendUnpaidReminders();
})();

// // Test Route
// app.get("/", (req, res) => {
//   res.send("Saudi Railways Backend");
// });

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
      UPDATE Reservation SET Paid = 1 WHERE ReservationID = ?
    `;
    const [result] = await connection.query(updatePayment, [reservationID]);

    if (result.affectedRows === 0) {
      throw new Error("No reservation found with the given ID.");
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

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
