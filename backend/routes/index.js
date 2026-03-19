// backend/routes/index.js
const express = require("express");
const router = express.Router();

const trainRoutes = require("./train");
const reservationRoutes = require("./reservation");
const reportController = require("../controllers/reportController");
const authController = require("../controllers/authController");
const staffController = require("../controllers/staffController");
const promotionController = require("../controllers/promotionController");
const dependentController = require("../controllers/dependentController");

// Trains and Reservations
router.use("/trains", trainRoutes);
router.use("/reservations", reservationRoutes);

// Auth
router.post("/register", authController.register);
router.post("/login", authController.login);

// Staff
router.post("/assignStaff", staffController.assignStaff);
router.get("/staff", staffController.getAllStaff);

// Promotion
router.post("/promotePassenger", promotionController.promotePassenger);

// Dependents
router.get("/dependents/:passengerID", dependentController.getDependents);
router.post("/dependents", dependentController.addDependent);
router.delete("/dependents/:dependentID", dependentController.deleteDependent);

// Reports
router.get("/reports/active-trains", reportController.getActiveTrains);
router.get("/reports/stations-for-trains", reportController.getStationsForTrains);
router.get("/reports/reservations/:passengerID", reportController.getReservationsByPassenger);
router.get("/reports/waitlisted-loyalty/:trainNumber", reportController.getWaitlistedLoyalty);
router.get("/reports/load-factor/:date", reportController.getLoadFactorByDate);
router.get("/reports/dependents/:date", reportController.getDependentsByDate);

module.exports = router;
