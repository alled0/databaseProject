// backend/jobs/emailReminders.js
const cron = require("node-cron");
const { sendUnpaidReminders, sendReminderEmails } = require("../services/reminderService");

// Send unpaid reminders at 22:00 daily
cron.schedule("0 22 * * *", () => {
  console.log("Cron Job: Triggering sendUnpaidReminders at 22:00.");
  sendUnpaidReminders();
});

// // Run sendReminderEmails every minute
// cron.schedule("* * * * *", () => {
//   console.log("Cron Job: Triggering sendReminderEmails every minute.");
//   sendReminderEmails();
// });
