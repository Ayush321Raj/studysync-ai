import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import rateLimit from "express-rate-limit";

import { errorMiddleware } from "./middlewares/error.middleware.js";

const app = express();

/* ---------------------------------------
   GLOBAL MIDDLEWARES
--------------------------------------- */

// Security headers
app.use(helmet());

// CORS — only allow our frontend origin
app.use(
  cors({
    origin: process.env.CORS_ORIGIN?.split(",") || "http://localhost:5173",
    credentials: true, // Allow cookies (needed for refresh tokens)
  })
);

// Body parsers
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser());

// Compression (gzip responses → faster)
app.use(compression());

// Logging (only in dev)
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Rate limiting (protect against brute force / DDoS)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per IP per window
  message: "Too many requests from this IP, please try again later.",
});
app.use("/api", limiter);

/* ---------------------------------------
   ROUTES
--------------------------------------- */

import healthRouter from "./routes/health.routes.js";
app.use("/api/v1/health", healthRouter);

/* ---------------------------------------
   404 + ERROR HANDLER
--------------------------------------- */

// 404 handler (must come after all routes)
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    statusCode: 404,
    message: `Route ${req.originalUrl} not found`,
  });
});

// Global error handler (must be LAST)
app.use(errorMiddleware);

export { app };