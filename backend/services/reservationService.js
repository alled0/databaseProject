// backend/services/reservationService.js
const { db } = require("../config/database");

exports.bookSeat = async (req, res) => {
  const {
    TrainID,
    Date,
    FromStation,
    ToStation,
    CoachType,
    SeatNumber,
    email,
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
    const [train] = await connection.query("SELECT TrainID FROM Train WHERE TrainID = ?", [TrainID]);
    if (train.length === 0) {
      return res.status(400).json({ error: "Invalid TrainID. Please select a valid train." });
    }

    // Validate FromStation and ToStation
    const [fStation] = await connection.query("SELECT StationID FROM Station WHERE StationID = ?", [FromStation]);
    if (fStation.length === 0) {
      return res.status(400).json({ error: "Invalid FromStation." });
    }

    const [tStation] = await connection.query("SELECT StationID FROM Station WHERE StationID = ?", [ToStation]);
    if (tStation.length === 0) {
      return res.status(400).json({ error: "Invalid ToStation." });
    }

    // Fetch PassengerID using email
    const [passenger] = await connection.query("SELECT PassengerID FROM Passenger WHERE email = ?", [email]);
    if (passenger.length === 0) {
      return res.status(400).json({ error: "Invalid email. Please log in with a registered account." });
    }
    const PassengerID = passenger[0].PassengerID;

    await connection.beginTransaction();

    // Insert Reservation
    const insertReservation = `
      INSERT INTO Reservation (TrainID, Date, FromStation, ToStation, CoachType, SeatNumber, PassengerID)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const [reservationResult] = await connection.query(insertReservation, [
      TrainID, Date, FromStation, ToStation, CoachType, SeatNumber, PassengerID,
    ]);
    const ReservationID = reservationResult.insertId;

    // Insert Payment
    const insertPayment = `
      INSERT INTO Payment (ResID, Date, VAT, Amount, Payment_Status)
      VALUES (?, NOW(), 15.00, 100.00, 'Pending')
    `;
    const [paymentResult] = await connection.query(insertPayment, [ReservationID]);
    const PaymentID = paymentResult.insertId;

    // Update Reservation with PaymentID
    const updateReservation = `UPDATE Reservation SET PaymentID = ? WHERE ReservationID = ?`;
    await connection.query(updateReservation, [PaymentID, ReservationID]);

    await connection.commit();
    res.json({ message: "Reservation successful", ReservationID });
  } catch (err) {
    console.error("Error during booking process:", err);
    await connection.rollback();
    res.status(500).json({ error: "A server error occurred. Please try again later." });
  } finally {
    connection.release();
  }
};

exports.addPayment = async (req, res) => {
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
};

exports.completePayment = async (req, res) => {
  const { reservationID } = req.body;

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    const updatePayment = `UPDATE Reservation SET Paid = 1 WHERE ReservationID = ?`;
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
};

exports.manageReservations = async (req, res) => {
  const { action, reservationID, passengerEmail, details } = req.body;
  if (!action) {
    return res.status(400).json({ error: "Action is required." });
  }

  const connection = await db.getConnection();
  try {
    if (action === "Add") {
      const { Date, FromStation, ToStation, CoachType, SeatNumber } = details;
      if (!Date || !FromStation || !ToStation || !CoachType || !SeatNumber || !passengerEmail) {
        return res.status(400).json({ error: "Missing required fields." });
      }

      const [passenger] = await connection.query("SELECT PassengerID FROM Passenger WHERE email = ?", [passengerEmail]);
      if (passenger.length === 0) {
        return res.status(400).json({ error: "Invalid passenger email." });
      }
      const PassengerID = passenger[0].PassengerID;

      const sql = `
        INSERT INTO Reservation (Date, FromStation, ToStation, CoachType, SeatNumber, PassengerID)
        VALUES (?, ?, ?, ?, ?, ?)
      `;
      const [result] = await connection.query(sql, [Date, FromStation, ToStation, CoachType, SeatNumber, PassengerID]);
      return res.json({ message: "Reservation added successfully.", reservationID: result.insertId });
    } else if (action === "Edit") {
      const { Date, FromStation, ToStation, CoachType, SeatNumber } = details;
      if (!reservationID) {
        return res.status(400).json({ error: "Reservation ID is required for editing." });
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
      const [result] = await connection.query(sql, [Date, FromStation, ToStation, CoachType, SeatNumber, reservationID]);
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Reservation not found." });
      }
      return res.json({ message: "Reservation updated successfully." });
    } else if (action === "Cancel") {
      if (!reservationID) {
        return res.status(400).json({ error: "Reservation ID is required for cancellation." });
      }

      // Delete Payment first
      await connection.query("DELETE FROM Payment WHERE ResID = ?", [reservationID]);
      const [deleteResult] = await connection.query("DELETE FROM Reservation WHERE ReservationID = ?", [reservationID]);
      if (deleteResult.affectedRows === 0) {
        return res.status(404).json({ error: "Reservation not found." });
      }
      return res.json({ message: "Reservation cancelled successfully." });
    } else {
      return res.status(400).json({ error: "Invalid action. Allowed actions are Add, Edit, Cancel." });
    }
  } catch (err) {
    console.error("Error managing reservation:", err);
    res.status(500).json({ error: "A server error occurred. Please try again later." });
  } finally {
    connection.release();
  }
};
