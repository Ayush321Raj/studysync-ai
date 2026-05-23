import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import rateLimit from "express-rate-limit";

import errorHandler from "./middlewares/error.middleware.js";

const app = express();

// ─── Security Middlewares ──────────────────────────────
app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

// ─── Rate Limiting ─────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window per IP
  message: "Too many requests, please try again later.",
});
app.use("/api", limiter);

// ─── Body Parsers ──────────────────────────────────────
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser());

// ─── Performance ───────────────────────────────────────
app.use(compression());

// ─── Logging ───────────────────────────────────────────
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// ─── Routes ────────────────────────────────────────────
app.get("/api/v1/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "🚀 StudySync AI Server is healthy",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// TODO: Mount feature routes here (auth, users, rooms, etc.)
// app.use("/api/v1/auth", authRouter);

// ─── Global Error Handler (MUST be last) ───────────────
app.use(errorHandler);

export default app;