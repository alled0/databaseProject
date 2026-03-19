// backend/controllers/authController.js
const { db } = require("../config/database");

exports.register = async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: "Name, email, and password are required." });
  }

  try {
    const [existing] = await db.query("SELECT PassengerID FROM Passenger WHERE email = ?", [email]);
    if (existing.length > 0) {
      return res.status(409).json({ message: "An account with this email already exists." });
    }

    const [result] = await db.query(
      "INSERT INTO Passenger (Name, email, password) VALUES (?, ?, ?)",
      [name, email, password]
    );

    return res.status(201).json({
      role: "Passenger",
      passengerID: result.insertId,
      email,
      name,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error." });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required." });
  }

  try {
    // Check Passenger table
    const passengerQuery = "SELECT * FROM Passenger WHERE email = ? AND password = ?";
    const [passengerRows] = await db.query(passengerQuery, [email, password]);

    if (passengerRows.length > 0) {
      const p = passengerRows[0];
      return res.json({ role: "Passenger", passengerID: p.PassengerID, email: p.email, name: p.Name });
    }

    // Check Staff table
    const staffQuery = "SELECT * FROM Staff WHERE email = ? AND password = ?";
    const [staffRows] = await db.query(staffQuery, [email, password]);

    if (staffRows.length > 0) {
      const s = staffRows[0];
      return res.json({ role: "Admin", staffID: s.StaffID, name: s.Name });
    }

    return res.status(401).json({ message: "Invalid email or password." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error." });
  }
};
