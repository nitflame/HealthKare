import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";

import authRoutes from "./routes/auth.js";
import recordRoutes from "./routes/records.js";
import aiRoutes from "./routes/ai.js";

dotenv.config();

const app = express();

// ── CORS ──────────────────────────────────────────────────────────────────────
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",")
  : ["http://localhost:5173", "http://localhost:4173"];

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
      cb(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

// ── Rate limiting ─────────────────────────────────────────────────────────────
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 20,
  message: { msg: "Too many requests, please try again later." },
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { msg: "Too many requests, please try again later." },
});

// ── Middleware ─────────────────────────────────────────────────────────────────
app.use(express.json({ limit: "10kb" }));

// ── Routes ─────────────────────────────────────────────────────────────────────
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/records", apiLimiter, recordRoutes);
app.use("/api/ai", apiLimiter, aiRoutes);

// ── Health check ───────────────────────────────────────────────────────────────
app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

// ── Global error handler ───────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error("Unhandled error:", err.message);
  res.status(500).json({ msg: "Internal server error" });
});

// ── Connect & start ────────────────────────────────────────────────────────────
let mongoUri = process.env.MONGO_URI;

async function startServer() {
  if (!mongoUri || mongoUri.trim() === "") {
    console.log("No MONGO_URI provided. Starting MongoDB Memory Server for local demo...");
    try {
      const { MongoMemoryServer } = await import("mongodb-memory-server");
      const mongoServer = await MongoMemoryServer.create();
      mongoUri = mongoServer.getUri();
      console.log("MongoDB Memory Server started successfully at:", mongoUri);
    } catch (err) {
      console.error("Failed to start MongoDB Memory Server:", err.message);
      console.error("Please configure a valid MONGO_URI in .env");
      process.exit(1);
    }
  }

  mongoose
    .connect(mongoUri)
    .then(() => {
      console.log("MongoDB connected");
      const PORT = process.env.PORT || 5000;
      app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    })
    .catch((err) => {
      console.error("MongoDB connection failed:", err.message);
      process.exit(1);
    });
}

startServer();
