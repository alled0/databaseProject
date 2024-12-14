// backend/services/reminderService.js
const { db } = require("../config/database");
const transporter = require("../config/emailTransporter");
const moment = require("moment-timezone");

// In-memory sets to track sent reminders
const sentReminders = new Set();

// Function to send unpaid reminders
exports.sendUnpaidReminders = async () => {
  console.log("sendUnpaidReminders: Function started.");

  try {
    console.log("sendUnpaidReminders: Querying unpaid reservations from the database.");

    const [rows] = await db.query(`
      SELECT Passenger.Email, Passenger.Name, Reservation.ReservationID
      FROM Reservation
      JOIN Passenger ON Reservation.PassengerID = Passenger.PassengerID
      WHERE Reservation.Paid = 0
    `);

    console.log(`sendUnpaidReminders: Retrieved ${rows.length} unpaid reservations.`);

    if (rows.length === 0) {
      console.log("sendUnpaidReminders: No unpaid reservations found. Exiting function.");
      return;
    }

    for (const row of rows) {
      console.log(`sendUnpaidReminders: Preparing to send email to ${row.Email} for Reservation ID: ${row.ReservationID}`);

      const mailOptions = {
        from: "railwaysaudi@yahoo.com",
        to: row.Email,
        subject: "Payment Reminder",
        text: `Dear ${row.Name}, please complete the payment for your reservation (ID: ${row.ReservationID}).`,
      };

      try {
        await transporter.sendMail(mailOptions);
        console.log(`sendUnpaidReminders: Email successfully sent to ${row.Email} for Reservation ID: ${row.ReservationID}`);
      } catch (emailError) {
        console.error(`sendUnpaidReminders: Failed to send email to ${row.Email} for Reservation ID: ${row.ReservationID}. Error:`, emailError);
      }
    }

    console.log("sendUnpaidReminders: All unpaid reservation emails processed.");
  } catch (err) {
    console.error("sendUnpaidReminders: Error while sending unpaid reminders:", err);
  }

  console.log("sendUnpaidReminders: Function completed.");
};

// Function to send departure reminders
exports.sendDepartureReminders = async () => {
  console.log("sendDepartureReminders: Function started.");

  try {
    console.log("sendDepartureReminders: Querying reservations departing in 3 hours.");

    const [rows] = await db.query(`
      SELECT r.ReservationID, p.Email, p.Name, t.English_name, t.Arabic_name, s.Departure_Time
      FROM Reservation r
      JOIN Passenger p ON r.PassengerID = p.PassengerID
      JOIN Schedule s ON r.TrainID = s.TrainID
      JOIN Train t ON r.TrainID = t.TrainID
      WHERE TIMESTAMPDIFF(HOUR, NOW(), s.Departure_Time) = 3
    `);

    console.log(`sendDepartureReminders: Retrieved ${rows.length} reservations departing in 3 hours.`);

    if (rows.length === 0) {
      console.log("sendDepartureReminders: No reservations found for departure reminders.");
      return;
    }

    for (const row of rows) {
      if (!sentReminders.has(row.ReservationID)) {
        console.log(`sendDepartureReminders: Preparing to send departure reminder to ${row.Email} for Reservation ID: ${row.ReservationID}`);

        const mailOptions = {
          from: "railwaysaudi@yahoo.com",
          to: row.Email,
          subject: "Train Departure Reminder",
          text: `Dear ${row.Name}, your train (${row.English_name}/${row.Arabic_name}) is departing at ${row.Departure_Time}. Please be on time.`,
        };

        try {
          await transporter.sendMail(mailOptions);
          console.log(`sendDepartureReminders: Departure reminder sent to ${row.Email} for Reservation ID: ${row.ReservationID}`);
          sentReminders.add(row.ReservationID);
        } catch (error) {
          console.error(`sendDepartureReminders: Failed to send departure reminder to ${row.Email} for Reservation ID: ${row.ReservationID}. Error:`, error);
        }
      } else {
        console.log(`sendDepartureReminders: Reminder already sent for Reservation ID: ${row.ReservationID}. Skipping.`);
      }
    }

    console.log("sendDepartureReminders: All departure reminders processed.");
  } catch (err) {
    console.error("sendDepartureReminders: Error while sending departure reminders:", err);
  }

  console.log("sendDepartureReminders: Function completed.");
};

// Function to send reminder emails based on specific time window
exports.sendReminderEmails = async () => {
  console.log("sendReminderEmails: Function started.");

  const tz = "Asia/Riyadh";
  const now = moment().tz(tz);
  const oneDayLater = now.clone().add(1, "day");
  const windowStart = oneDayLater.clone().startOf("minute");
  const windowEnd = windowStart.clone().add(1, "minute");

  const formattedStartTime = windowStart.format("YYYY-MM-DD HH:mm:ss");
  const formattedEndTime = windowEnd.format("YYYY-MM-DD HH:mm:ss");

  console.log(`sendReminderEmails: Querying reservations between ${formattedStartTime} and ${formattedEndTime}.`);

  try {
    const [rows] = await db.query(
      `
      SELECT 
        r.reservationID, 
        r.passengerID, 
        p.email, 
        CONCAT(r.Date, ' ', s.Departure_Time) AS trainDepartureTime
      FROM 
        reservation r
      JOIN 
        passenger p ON r.passengerID = p.passengerID
      JOIN 
        schedule s ON r.TrainID = s.TrainID AND r.FromStation = s.StationID
      WHERE 
        CONCAT(r.Date, ' ', s.Departure_Time) BETWEEN ? AND ?
        AND r.Paid = 0
      `,
      [formattedStartTime, formattedEndTime]
    );

    console.log(`sendReminderEmails: Retrieved ${rows.length} reservations for reminders.`);

    if (rows.length === 0) {
      console.log("sendReminderEmails: No reservations found for the specified time window.");
      return;
    }

    for (const reservation of rows) {
      console.log(`sendReminderEmails: Preparing to send reminder to ${reservation.email} for Reservation ID: ${reservation.reservationID}`);

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: reservation.email,
        subject: "Payment Reminder for Your Train Reservation",
        text: `Dear Passenger,

This is a friendly reminder that your reservation (ID: ${reservation.reservationID}) for the train departing at ${new Date(reservation.trainDepartureTime).toLocaleString()} has not been paid yet.

Please complete your payment to confirm your reservation.

Thank you for choosing our service!

Best regards,
Your Train Company`,
      };

      try {
        await transporter.sendMail(mailOptions);
        console.log(`sendReminderEmails: Reminder email sent to ${reservation.email} for Reservation ID: ${reservation.reservationID}`);
      } catch (emailError) {
        console.error(`sendReminderEmails: Failed to send email to ${reservation.email} for Reservation ID: ${reservation.reservationID}. Error:`, emailError);
      }
    }

    console.log("sendReminderEmails: All reminder emails processed.");
  } catch (err) {
    console.error(`sendReminderEmails: Error fetching reservations:`, err);
  }

  console.log("sendReminderEmails: Function completed.");
};

