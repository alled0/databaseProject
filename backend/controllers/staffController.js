// backend/controllers/staffController.js
const { db } = require("../config/database");

exports.assignStaff = async (req, res) => {
  const { trainID, staffID, role } = req.body;

  if (!trainID || !staffID || !role) {
    return res.status(400).json({ error: "Train ID, Staff ID, and Role are required." });
  }

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const [train] = await connection.query("SELECT TrainID FROM Train WHERE TrainID = ?", [trainID]);
    if (train.length === 0) {
      await connection.rollback();
      return res.status(400).json({ error: "Invalid Train ID." });
    }

    const [staff] = await connection.query("SELECT StaffID FROM Staff WHERE StaffID = ?", [staffID]);
    if (staff.length === 0) {
      await connection.rollback();
      return res.status(400).json({ error: "Invalid Staff ID." });
    }

    const sql = `
      INSERT INTO StaffAssignment (StaffID, TrainID, Role)
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE Role = VALUES(Role)
    `;
    await connection.query(sql, [staffID, trainID, role]);

    await connection.commit();
    res.status(200).json({ message: "Staff assigned successfully." });
  } catch (err) {
    console.error("Error assigning staff:", err);
    await connection.rollback();
    res.status(500).json({ error: "A server error occurred. Please try again later." });
  } finally {
    connection.release();
  }
};

exports.getAllStaff = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT StaffID, Name, Role FROM Staff ORDER BY Name");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
