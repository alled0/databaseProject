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

    // Validate TrainID
    const [train] = await connection.query(
      "SELECT TrainID FROM Train WHERE TrainID = ?",
      [trainID]
    );
    if (train.length === 0) {
      return res.status(400).json({ error: "Invalid Train ID." });
    }

    // Validate StaffID
    const [staff] = await connection.query(
      "SELECT StaffID FROM Staff WHERE StaffID = ?",
      [staffID]
    );
    if (staff.length === 0) {
      return res.status(400).json({ error: "Invalid Staff ID." });
    }

    // Map role to Stop_Sequence (dummy logic, may need changing)
    const roleMap = { Driver: 1, Engineer: 2 };
    const stopSequence = roleMap[role];
    if (!stopSequence) {
      return res.status(400).json({ error: "Invalid role. Allowed roles are Driver, Engineer." });
    }

    // Insert or update staff assignment (example logic - adjust as needed)
    const sql = `
      INSERT INTO Schedule (TrainID, StationID, Stop_Sequence)
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE Stop_Sequence = ?;
    `;
    await connection.query(sql, [trainID, staffID, stopSequence, stopSequence]);

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
