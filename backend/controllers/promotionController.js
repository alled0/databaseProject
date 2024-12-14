// backend/controllers/promotionController.js
const { db } = require("../config/database");

exports.promotePassenger = async (req, res) => {
  const { passengerID } = req.body;

  if (!passengerID) {
    return res.status(400).json({ error: "Passenger ID is required." });
  }

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

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
      console.log("Passenger not found in waitlist:", passengerID);
      return res.status(404).json({ error: "Passenger not found in the waitlist." });
    }

    const reservationID = waitlist[0].ReservationID;

    // Remove Passenger from WaitingList
    await connection.query("DELETE FROM WaitingList WHERE ReservationID = ?", [reservationID]);

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
    res.status(500).json({ error: "A server error occurred. Please try again later." });
  } finally {
    connection.release();
  }
};
