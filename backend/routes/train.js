// backend/routes/train.js
const express = require("express");
const router = express.Router();
const trainController = require("../controllers/trainController");

router.get("/", trainController.getAllTrains);
router.get("/stations", trainController.getAllStations);
router.get("/searchTrains", trainController.searchTrains);

module.exports = router;
