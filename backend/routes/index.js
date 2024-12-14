// backend/routes/index.js
const express = require("express");
const router = express.Router();

const trainRoutes = require("./train");
const reservationRoutes = require("./reservation");
const reportController = require("../controllers/reportController");
const authController = require("../controllers/authController");
const staffController = require("../controllers/staffController");
const promotionController = require("../controllers/promotionController");

// Trains and Reservations
router.use("/trains", trainRoutes);
router.use("/reservations", reservationRoutes);

// Auth
router.post("/login", authController.login);

// Staff
router.post("/assignStaff", staffController.assignStaff);

// Promotion
router.post("/promotePassenger", promotionController.promotePassenger);

// Reports
router.get("/reports/active-trains", reportController.getActiveTrains);
router.get("/reports/stations-for-trains", reportController.getStationsForTrains);
router.get("/reports/reservations/:passengerID", reportController.getReservationsByPassenger);
router.get("/reports/waitlisted-loyalty/:trainNumber", reportController.getWaitlistedLoyalty);
router.get("/reports/load-factor/:date", reportController.getLoadFactorByDate);
router.get("/reports/dependents/:date", reportController.getDependentsByDate);

module.exports = router;
