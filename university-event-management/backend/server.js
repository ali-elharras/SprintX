const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

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
const conferenceRoutes = require("./routes/conference.js");
const bazaarRoutes = require("./routes/bazaar");
const workshopRoutes = require("./routes/workshop");
const notificationRoutes = require("./routes/notifications");
const reportRoutes = require("./routes/report");
const paymentRoutes = require("./routes/payments");
const LoyaltyRoutes = require("./routes/LoyaltyRoutes");
//const eventReviewRoutes = require("./routes/eventReviews");
const favoritesRoutes = require("./routes/favorites");


const app = express();

// ===== Security & Performance Middleware =====
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // Increased from 100 to 300 requests per windowMs for frequent page switching
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
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
    // Connection pool settings for better stability
    maxPoolSize: 50, // Maximum number of connections in the connection pool
    minPoolSize: 5,  // Minimum number of connections in the connection pool
    maxIdleTimeMS: 30000, // Close connections after 30 seconds of inactivity
    serverSelectionTimeoutMS: 10000, // How long to try to connect before timing out
    socketTimeoutMS: 45000, // How long a send or receive on a socket can take before timing out
  })
  .then(() => console.log("✅ MongoDB connected successfully"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });

// Connection event handlers for better monitoring
mongoose.connection.on('connected', async () => {
  console.log('📦 Mongoose connected to MongoDB');
  
  // Fix Workshop model indexes on connection
  try {
    const Workshop = require('./models/Workshop');
    await Workshop.syncIndexes();
    console.log('✅ Workshop indexes synced successfully');
  } catch (indexError) {
    console.warn('⚠️ Warning syncing Workshop indexes:', indexError.message);
  }
});

mongoose.connection.on('error', (err) => {
  console.error('❌ Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('📦 Mongoose disconnected from MongoDB');
});

// Graceful shutdown handling
process.on('SIGINT', async () => {
  try {
    await mongoose.connection.close();
    console.log('📦 Mongoose connection closed due to app termination');
    process.exit(0);
  } catch (err) {
    console.error('Error during graceful shutdown:', err);
    process.exit(1);
  }
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
app.use("/api/conferences", conferenceRoutes);
app.use("/api/bazaars", bazaarRoutes);
app.use("/api/loyalty", LoyaltyRoutes);
app.use('/api/ratings', require('./routes/ratings'));
app.use("/api/favorites", favoritesRoutes);
app.use("/api/booth-polls", require('./routes/boothPolls'));

// Workshop routes (professors create -> saved as pending, Events Office can publish)
app.use("/api/workshops", workshopRoutes);

// Notification routes (for professors to receive workshop updates)
app.use("/api/notifications", notificationRoutes);
// Report routes (for admin and events office to view reports)
app.use("/api/reports", reportRoutes);
// Payment routes (for vendor payments)
app.use("/api/payments", paymentRoutes);
//app.use("/api/event-reviews", eventReviewRoutes);

// Workshop routes removed as feature deprecated

// ===== Health Check =====
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "University Event Management API is running",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    connections: mongoose.connection.readyState, // 1 = connected, 0 = disconnected
  });
});

// ===== Feature Flags =====
app.get("/api/feature-flags", (req, res) => {
  res.json({
    gpt5Enabled: process.env.FEATURE_GPT5_ENABLED === 'true',
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
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT} - RESTARTED WITH FIXES`);
  console.log(`📊 Environment: ${process.env.NODE_ENV}`);
  console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL}`);
});
