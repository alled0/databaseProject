// backend/server.js
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const routes = require("./routes");
const reminderService = require("./services/reminderService"); // Import the service
const emailService = require("./services/emailService"); // Import the email service (for testing)
require("./jobs/emailReminders");

const app = express();
const PORT = 4000;

app.use(cors());
app.use(bodyParser.json());

// Use our routes under /api
app.use("/api", routes);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);

  // Manually trigger the sendUnpaidReminders function for testing
  console.log("Manually triggering sendUnpaidReminders...");
  reminderService.sendUnpaidReminders();
    // console.log("Manually triggering sendReminderEmails...");
  reminderService.sendReminderEmails();
});
