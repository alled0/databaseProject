// backend/controllers/reservationController.js
const reservationService = require("../services/reservationService");

exports.bookSeat = reservationService.bookSeat;
exports.addPayment = reservationService.addPayment;
exports.completePayment = reservationService.completePayment;
exports.manageReservations = reservationService.manageReservations;
