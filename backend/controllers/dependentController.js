// backend/controllers/dependentController.js
const { db } = require("../config/database");

exports.getDependents = async (req, res) => {
  const { passengerID } = req.params;
  try {
    const [rows] = await db.query(
      "SELECT DependentID, Name, RelationToPassenger FROM Dependent WHERE Passenger_ID = ?",
      [passengerID]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error." });
  }
};

exports.addDependent = async (req, res) => {
  const { passengerID, name, relation } = req.body;

  if (!passengerID || !name || !relation) {
    return res.status(400).json({ message: "Passenger ID, name, and relation are required." });
  }

  try {
    const [result] = await db.query(
      "INSERT INTO Dependent (Name, RelationToPassenger, Passenger_ID) VALUES (?, ?, ?)",
      [name, relation, passengerID]
    );
    res.status(201).json({
      message: "Dependent added successfully.",
      dependent: { DependentID: result.insertId, Name: name, RelationToPassenger: relation },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error." });
  }
};

exports.deleteDependent = async (req, res) => {
  const { dependentID } = req.params;
  try {
    const [result] = await db.query(
      "DELETE FROM Dependent WHERE DependentID = ?",
      [dependentID]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Dependent not found." });
    }
    res.json({ message: "Dependent removed." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error." });
  }
};
