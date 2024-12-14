// backend/services/emailService.js
const transporter = require("../config/emailTransporter");

exports.sendEmail = (options) => {
  return transporter.sendMail(options);
};
