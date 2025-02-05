// // backend/database.js
// const path = require('path'); // Import path first
// require("dotenv").config({ path: path.resolve(__dirname, ".env") }); // Then use it// Load environment variables
// const mysql = require("mysql2");
// const fs = require("fs");



// // Create a connection pool with multipleStatements enabled
// const pool = mysql.createPool({
//   host: process.env.DB_HOST || "localhost",
//   user: process.env.DB_USER || "root",
//   password: process.env.DB_PASSWORD || "omar0202",
//   database: process.env.DB_NAME || "SaudiRailwaysDB",
//   waitForConnections: true,
//   connectionLimit: 10,
//   queueLimit: 0,
//   multipleStatements: true, // Enable multiple statements
// });

// // Create a promise-based pool
// // const promisePool = pool.promise();

// // // Initialize Database Schema and Insert Data

// // const checkDBInitialized = async () => {
// //   try {
// //     const [rows] = await promisePool.query("SHOW TABLES;");
// //     return rows.length > 0; // If tables exist, assume the DB is initialized
// //   } catch (err) {
// //     console.error("Error checking database:", err);
// //     return false;
// //   }
// // };
// // const initDB = async () => {
// //   if (await checkDBInitialized()) {
// //     console.log("Database is already initialized.");
// //     return;
// //   }
// //   try {
// //     // Read SQL schema and data files
// //     const schemaPath = path.join(__dirname, "schema.sql");
// //     const dataPath = path.join(__dirname, "insert_data.sql");

// //     if (!fs.existsSync(schemaPath)) {
// //       throw new Error(`Schema file not found at ${schemaPath}`);
// //     }

// //     if (!fs.existsSync(dataPath)) {
// //       throw new Error(`Data file not found at ${dataPath}`);
// //     }

// //     const schema = fs.readFileSync(schemaPath, "utf-8");
// //     const data = fs.readFileSync(dataPath, "utf-8");

// //     // Execute schema
// //     await promisePool.query(schema);
// //     console.log("Database schema initialized.");

// //     // Execute data insertion
// //     await promisePool.query(data);
// //     console.log("Sample data inserted.");
// //   } catch (err) {
// //     console.error("Error initializing database:", err);
// //     process.exit(1); // Exit the application if initialization fails
// //   }
// // };

// // // Call the initDB function to initialize the schema and insert data
// // initDB();

// module.exports = pool; 







// // Create a connection pool with multipleStatements enabled
// const pool = mysql.createPool({
//   host: process.env.DB_HOST || "localhost",
//   user: process.env.DB_USER || "root",
//   password: process.env.DB_PASSWORD || "omar0202",
//   database: process.env.DB_NAME || "SaudiRailwaysDB",
//   waitForConnections: true,
//   connectionLimit: 10,
//   queueLimit: 0,
//   multipleStatements: true, // Enable multiple statements
// });




// backend/config/database.js
const mysql = require("mysql2/promise");

const db = mysql.createPool({
   host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "omar0202",
  database: process.env.DB_NAME || "SaudiRailwaysDB",
});

// Test connection
db.getConnection()
  .then(connection => {
    console.log("Database connected successfully.");
    connection.release();
  })
  .catch(err => {
    console.error("Database connection failed:", err);
  });


module.exports = { db };
