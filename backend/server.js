// backend/server.js
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const routes = require("./routes");
require("./jobs/emailReminders");

const app = express();
const PORT = 4000;

app.use(cors({
  origin: ["http://localhost:3000", "http://localhost:3001"],
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true, // If you need to send cookies or authentication headers
}));
app.use(bodyParser.json());

// Use our routes under /api
app.use("/api", routes);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

