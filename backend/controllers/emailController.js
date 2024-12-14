// backend/controllers/emailController.js
const pool = require("../database");
const { sendEmail } = require("../utils/email");
const moment = require("moment-timezone");

// In-memory log to track sent departure reminders
const sentReminders = new Set();

/**
 * Sends email reminders for unpaid reservations.
 */
const sendUnpaidReminders = async () => {
  try {
    const [rows] = await pool.query(`
      SELECT Passenger.Email, Passenger.Name, Reservation.ReservationID
      FROM Reservation
      JOIN Passenger ON Reservation.PassengerID = Passenger.PassengerID
      WHERE Reservation.Paid = 0
    `);

    for (const row of rows) {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: row.Email,
        subject: "Payment Reminder",
        text: `Dear ${row.Name}, please complete the payment for your reservation (ID: ${row.ReservationID}).`,
      };

      try {
        await sendEmail(mailOptions);
      } catch (error) {
        console.error(`Failed to send email to ${row.Email}:`, error);
      }
    }
  } catch (err) {
    console.error("Error sending unpaid reminders:", err);
  }
};

/**
 * Sends departure reminders 3 hours before train departure.
 */
const sendDepartureReminders = async () => {
  try {
    const [rows] = await pool.query(`
      SELECT r.ReservationID, p.Email, p.Name, t.English_name, t.Arabic_name, s.Departure_Time
      FROM Reservation r
      JOIN Passenger p ON r.PassengerID = p.PassengerID
      JOIN Schedule s ON r.TrainID = s.TrainID
      JOIN Train t ON r.TrainID = t.TrainID
      WHERE TIMESTAMPDIFF(HOUR, NOW(), CONCAT(r.Date, ' ', s.Departure_Time)) = 3
    `);

    for (const row of rows) {
      if (!sentReminders.has(row.ReservationID)) {
        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: row.Email,
          subject: "Train Departure Reminder",
          text: `Dear ${row.Name}, your train (${row.English_name}/${row.Arabic_name}) is departing at ${row.Departure_Time}. Please be at the station on time.`,
        };

        try {
          await sendEmail(mailOptions);
          sentReminders.add(row.ReservationID);
        } catch (error) {
          console.error(`Failed to send departure reminder to ${row.Email}:`, error);
        }
      }
    }
  } catch (err) {
    console.error("Error sending departure reminders:", err);
  }
};

module.exports = { sendUnpaidReminders, sendDepartureReminders };
