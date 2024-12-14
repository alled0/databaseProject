// backend/utils/email.js
const nodemailer = require("nodemailer");
require("dotenv").config();

// Configure Nodemailer Transporter
const transporter = nodemailer.createTransport({
  service: "Gmail", // e.g., Gmail, Yahoo, etc.
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Verify the transporter configuration
transporter.verify((error, success) => {
  if (error) {
    console.error("Error with email transporter:", error);
  } else {
    console.log("Email transporter is ready");
  }
});

/**
 * Sends an email using the configured transporter.
 * @param {Object} mailOptions - Options for the email (from, to, subject, text).
 * @returns {Promise} - Resolves when the email is sent.
 */
const sendEmail = async (mailOptions) => {
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${mailOptions.to}:`, info.response);
    return info;
  } catch (error) {
    console.error(`Failed to send email to ${mailOptions.to}:`, error);
    throw error;
  }
};

module.exports = { sendEmail };
