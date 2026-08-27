  import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

import authRoutes from "./src/routes/authRoutes.js";
import dashboardRoutes from "./src/routes/dashboardRoutes.js";
import cropRoutes from "./src/routes/cropRoutes.js";
import aiRoutes from "./src/routes/aiRoutes.js";
import farmRoutes from "./src/routes/farmRoutes.js";
import taskRoutes from "./src/routes/taskRoutes.js";
import soilRoutes from "./src/routes/soilRoutes.js";
import weatherRoutes from "./src/routes/weatherRoutes.js";
import irrigationRoutes from "./src/routes/irrigationRoutes.js"; 
import marketRoutes from "./src/routes/marketRoutes.js"; 
const app = express();

// ===============================
// Security
// ===============================

app.use(helmet());

app.use(
  cors({
    origin: "*", // Development only
    credentials: true,
  })
);

// ===============================
// Body Parser
// ===============================

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// ===============================
// Rate Limiting
// ===============================

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests. Please try again later.",
  },
});

app.use("/api", limiter);

// ===============================
// Health Check
// ===============================

app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Farmio API is running",
  });
});

// ===============================
// API Routes
// ===============================

app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/crops", cropRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/farms", farmRoutes);
app.use("/api/soil", soilRoutes);
app.use("/api/weather", weatherRoutes);
app.use("/api/irrigation", irrigationRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/market", marketRoutes);
// ===============================
// 404 Handler
// ===============================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// ===============================
// Global Error Handler
// ===============================

app.use((err, req, res, next) => {
  console.error("❌ Server Error:", err);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

export default app;