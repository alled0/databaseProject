// backend/services/reminderService.js
const { db } = require("../config/database");
const transporter = require("../config/emailTransporter");
const moment = require("moment-timezone");

// In-memory sets to track sent reminders (Consider persistent storage for production)
const sentReminders = new Set();

// Function to send unpaid reminders
exports.sendUnpaidReminders = async () => {
  console.log("sendUnpaidReminders: Function started.");

  try {
    console.log("sendUnpaidReminders: Querying unpaid reservations from the database.");

    const [rows] = await db.query(`
      SELECT 
        Passenger.Email, 
        Passenger.Name, 
        Reservation.ReservationID,
        Reservation.TrainID,
        Train.English_name,
        Train.Arabic_name,
        Reservation.Date,
        Reservation.CoachType,
        Reservation.SeatNumber
      FROM Reservation
      JOIN Passenger ON Reservation.PassengerID = Passenger.PassengerID
      JOIN Train ON Reservation.TrainID = Train.TrainID
      WHERE Reservation.Paid = 0
    `);

    console.log(`sendUnpaidReminders: Retrieved ${rows.length} unpaid reservations.`);

    if (rows.length === 0) {
      console.log("sendUnpaidReminders: No unpaid reservations found. Exiting function.");
      return;
    }

    // Group reservations by passenger email
    const reservationsByPassenger = rows.reduce((acc, reservation) => {
      const { Email, Name, ReservationID, TrainID, English_name, Arabic_name, Date, CoachType, SeatNumber } = reservation;
      if (!acc[Email]) {
        acc[Email] = {
          Name,
          reservations: [],
        };
      }
      acc[Email].reservations.push({
        ReservationID,
        TrainID,
        English_name,
        Arabic_name,
        Date: moment(Date).format("YYYY-MM-DD"),
        CoachType,
        SeatNumber,
      });
      return acc;
    }, {});

    console.log(`sendUnpaidReminders: Grouped reservations by passenger. Preparing to send emails.`);

    // Iterate over each passenger and send a single email containing all their reservations
    for (const [email, passengerData] of Object.entries(reservationsByPassenger)) {
      const { Name, reservations } = passengerData;

      // Skip sending email if already sent for all reservations
      const unsentReservations = reservations.filter(resv => !sentReminders.has(resv.ReservationID));
      if (unsentReservations.length === 0) {
        console.log(`sendUnpaidReminders: All reminders already sent to ${email}. Skipping.`);
        continue;
      }

      // Compose the email content
      let reservationDetails = "";
      unsentReservations.forEach(resv => {
        reservationDetails += `
          <li>
            <strong>Reservation ID:</strong> ${resv.ReservationID}<br/>
            <strong>Train:</strong> ${resv.English_name} (${resv.Arabic_name})<br/>
            <strong>Date:</strong> ${resv.Date}<br/>
            <strong>Coach Type:</strong> ${resv.CoachType}<br/>
            <strong>Seat Number:</strong> ${resv.SeatNumber}<br/>
          </li>
        `;
      });

      const mailOptions = {
        from: "railwaysaudi@yahoo.com",
        to: email,
        subject: "Payment Reminder for Your Train Reservations",
        html: `
          <p>Dear ${Name},</p>
          <p>This is a friendly reminder to complete the payment for your pending train reservations:</p>
          <ul>
            ${reservationDetails}
          </ul>
          <p>Please complete your payment at your earliest convenience to confirm your reservations.</p>
          <p>Thank you for choosing our services!</p>
          <p>Best regards,<br/>Your Train Company</p>
        `,
      };

      try {
        await transporter.sendMail(mailOptions);
        console.log(`sendUnpaidReminders: Email successfully sent to ${email}.`);

        // Mark all reservations in this email as sent
        unsentReservations.forEach(resv => sentReminders.add(resv.ReservationID));
      } catch (emailError) {
        console.error(`sendUnpaidReminders: Failed to send email to ${email}. Error:`, emailError);
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
      SELECT 
        r.ReservationID, 
        p.Email, 
        p.Name, 
        t.English_name, 
        t.Arabic_name, 
        s.Departure_Time
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

    // Group departures by passenger email
    const departuresByPassenger = rows.reduce((acc, reservation) => {
      const { Email, Name, ReservationID, English_name, Arabic_name, Departure_Time } = reservation;
      if (!acc[Email]) {
        acc[Email] = {
          Name,
          departures: [],
        };
      }
      acc[Email].departures.push({
        ReservationID,
        English_name,
        Arabic_name,
        Departure_Time: moment(Departure_Time).format("YYYY-MM-DD HH:mm:ss"),
      });
      return acc;
    }, {});

    console.log(`sendDepartureReminders: Grouped departures by passenger. Preparing to send emails.`);

    // Iterate over each passenger and send a single email containing all their departures
    for (const [email, passengerData] of Object.entries(departuresByPassenger)) {
      const { Name, departures } = passengerData;

      // Skip sending email if already sent for all departures
      const unsentDepartures = departures.filter(dep => !sentReminders.has(dep.ReservationID));
      if (unsentDepartures.length === 0) {
        console.log(`sendDepartureReminders: All departure reminders already sent to ${email}. Skipping.`);
        continue;
      }

      // Compose the email content
      let departureDetails = "";
      unsentDepartures.forEach(dep => {
        departureDetails += `
          <li>
            <strong>Reservation ID:</strong> ${dep.ReservationID}<br/>
            <strong>Train:</strong> ${dep.English_name} (${dep.Arabic_name})<br/>
            <strong>Departure Time:</strong> ${dep.Departure_Time}<br/>
          </li>
        `;
      });

      const mailOptions = {
        from: "railwaysaudi@yahoo.com",
        to: email,
        subject: "Train Departure Reminder",
        html: `
          <p>Dear ${Name},</p>
          <p>This is a reminder that your train(s) are departing soon:</p>
          <ul>
            ${departureDetails}
          </ul>
          <p>Please ensure you are on time for your departure.</p>
          <p>Thank you for choosing our services!</p>
          <p>Best regards,<br/>Your Train Company</p>
        `,
      };

      try {
        await transporter.sendMail(mailOptions);
        console.log(`sendDepartureReminders: Departure reminder email successfully sent to ${email}.`);

        // Mark all departures in this email as sent
        unsentDepartures.forEach(dep => sentReminders.add(dep.ReservationID));
      } catch (emailError) {
        console.error(`sendDepartureReminders: Failed to send email to ${email}. Error:`, emailError);
      }
    }

    console.log("sendDepartureReminders: All departure reminder emails processed.");
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
