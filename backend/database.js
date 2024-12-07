// backend/database.js
const mysql = require('mysql2');
const fs = require('fs');
const path = require('path');

// Create a connection pool with multipleStatements enabled
const pool = mysql.createPool({
  host: 'localhost',
  user: 'railuser',           // Ensure this matches your MySQL username
  password: 'ww123456789',   // Ensure this matches your MySQL password
  database: 'SaudiRailwaysDB',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  multipleStatements: true    // Enable multiple statements
});

// Promisify for Node.js async/await.
const promisePool = pool.promise();

// Initialize Database Schema
const initDB = async () => {
  try {
    // Read SQL schema file
    const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf-8');
    // Execute schema
    await promisePool.query(schema);
    console.log('Database schema initialized.');
  } catch (err) {
    console.error('Error initializing database schema:', err);
  }
};

// Call the initDB function to initialize the schema
initDB();

module.exports = promisePool;
