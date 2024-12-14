// backend/controllers/reportController.js
const { db } = require("../config/database");

exports.getActiveTrains = async (req, res) => {
  try {
    const { date } = req.query;
    let sql;
    let params = [];

    if (date) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(date)) {
        return res.status(400).json({ error: "Invalid date format. Use YYYY-MM-DD." });
      }

      sql = `
        SELECT DISTINCT t.TrainID, t.English_name
        FROM Train t
        JOIN Reservation r ON t.TrainID = r.TrainID
        WHERE r.Date = ?
      `;
      params = [date];
    } else {
      sql = `
        SELECT DISTINCT t.TrainID, t.English_name
        FROM Train t
        JOIN Reservation r ON t.TrainID = r.TrainID
        WHERE r.Date = CURDATE()
      `;
    }

    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getStationsForTrains = async (req, res) => {
  try {
    const sql = `
      SELECT t.TrainID, t.English_name, GROUP_CONCAT(s.name ORDER BY sc.Stop_Sequence ASC) AS Stations
      FROM Train t
      JOIN Schedule sc ON t.TrainID = sc.TrainID
      JOIN Station s ON sc.StationID = s.StationID
      GROUP BY t.TrainID
    `;
    const [rows] = await db.query(sql);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getReservationsByPassenger = async (req, res) => {
  const { passengerID } = req.params;
  const { date } = req.query;

  try {
    let sql = `
      SELECT r.ReservationID, r.Date, tr.English_name, sFrom.name AS FromName, sTo.name AS ToName
      FROM Reservation r
      JOIN Train tr ON r.TrainID = tr.TrainID
      JOIN Station sFrom ON r.FromStation = sFrom.StationID
      JOIN Station sTo ON r.ToStation = sTo.StationID
      WHERE r.PassengerID = ?
    `;
    const params = [passengerID];

    if (date) {
      sql += " AND r.Date = ?";
      params.push(date);
    }

    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getWaitlistedLoyalty = async (req, res) => {
  const { trainNumber } = req.params;
  try {
    const sql = `
      SELECT p.Name, p.LoyaltyStat, r.CoachType
      FROM WaitingList w
      JOIN Reservation r ON w.ReservationID = r.ReservationID
      JOIN Passenger p ON r.PassengerID = p.PassengerID
      WHERE r.TrainID = ?
      AND p.LoyaltyStat IN ('Silver','Gold')
    `;
    const [rows] = await db.query(sql, [trainNumber]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getLoadFactorByDate = async (req, res) => {
  const { date } = req.params;
  try {
    const sql = `
      SELECT r.TrainID, 
             COUNT(*) AS BookedSeats, 
             150 AS TotalSeats, 
             (COUNT(*) / 150)*100 AS AverageLoadFactor
      FROM Reservation r
      WHERE r.Date = ?
      GROUP BY r.TrainID
    `;
    const [rows] = await db.query(sql, [date]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getDependentsByDate = async (req, res) => {
  const { date } = req.params;
  try {
    const sql = `
      SELECT d.Name AS DependentName, p.Name AS PassengerName, r.Date, t.English_name
      FROM Dependent d
      JOIN Passenger p ON d.Passenger_ID = p.PassengerID
      JOIN Reservation r ON p.PassengerID = r.PassengerID
      JOIN Train t ON r.TrainID = t.TrainID
      WHERE r.Date = ?
    `;
    const [rows] = await db.query(sql, [date]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
