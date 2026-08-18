const express = require("express");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(morgan("dev"));

// Example API
app.post("/api/data", (req, res) => {
  const { name, age } = req.body;
  res.json({ message: "Data received successfully", data: { name, age } });
});

// Admin build
app.use("/admin", express.static(path.join(__dirname, "./admin-build")));

// ✅ Express 5-safe catch-all for /admin routes
app.get(/^\/admin\/(.*)/, (req, res) => {
  res.sendFile(path.join(__dirname, "./admin-build", "index.html"));
});

// Main frontend build
app.use("/", express.static(path.join(__dirname, "./build")));

// ✅ Express 5-safe catch-all for frontend
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, "./build", "index.html"));
});

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
