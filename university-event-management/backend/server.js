const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

const conferenceRoutes = require("./routes/conference.js");
const { errorHandler } = require("./middleware/errorHandler");

// ===== Route Imports =====
const authRoutes = require("./routes/auth");
const eventRoutes = require("./routes/events");
const applicationRoutes = require("./routes/applications");
const createEventRoutes = require("./routes/createEvents");
const adminRoutes = require("./routes/admin");
const registrationRoutes = require("./routes/registrations");
const courtRoutes = require("./routes/courts");
const gymRoutes = require("./routes/gym");

const app = express();

// ===== Security & Performance Middleware =====
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
});

app.use(helmet()); // Add secure headers
app.use(limiter); // Rate limiter
app.use(morgan("combined")); // Log requests
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    exposedHeaders: ['Authorization']
}));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ===== Database Connection =====
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connected successfully"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });

// Routes
app.use("/api/conferences", conferenceRoutes);

// Health check endpoint
// ===== API Routes =====
app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/events/create", createEventRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/registrations", registrationRoutes);
app.use("/api/courts", courtRoutes);
app.use("/api/gym", gymRoutes);

// ===== Health Check =====
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "University Event Management API is running",
    timestamp: new Date().toISOString(),
  });
});

// ===== 404 Fallback =====
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "API endpoint not found",
  });
});

// ===== Error Handler =====
app.use(errorHandler);

// ===== Server Startup =====
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT} - RESTARTED WITH FIXES`);
  console.log(`📊 Environment: ${process.env.NODE_ENV}`);
  console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL}`);
});
