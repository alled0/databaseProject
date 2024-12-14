// backend/routes/reservation.js
const express = require("express");
const router = express.Router();
const reservationController = require("../controllers/reservationController");

router.post("/bookSeat", reservationController.bookSeat);
router.post("/addPayment", reservationController.addPayment);
router.post("/completePayment", reservationController.completePayment);
router.post("/manageReservations", reservationController.manageReservations);

module.exports = router;
