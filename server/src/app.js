import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import rateLimit from "express-rate-limit";
import authRoutes from "./routes/auth.routes.js";
import healthRoutes from "./routes/health.routes.js";
import mongoSanitize from "express-mongo-sanitize";
import xss from "xss-clean";

import { ApiError } from "./utils/ApiError.js";
import { errorMiddleware } from "./middlewares/error.middleware.js";
import { HTTP_STATUS } from "./constants/index.js";

const app = express();

/* ---------------------------------------
   GLOBAL MIDDLEWARES
--------------------------------------- */

// Security headers
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
      },
    },
    crossOriginEmbedderPolicy: false,
  })
);

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

// General API rate limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict limiter for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Only 5 login attempts per 15 minutes
  message: "Too many login attempts, please try again later.",
  skipSuccessfulRequests: true, // Don't count successful logins
});

// Apply limiters
app.use("/api/v1", apiLimiter);
app.use("/api/v1/auth/login", authLimiter);
app.use("/api/v1/auth/register", authLimiter);

/* ---------------------------------------
   ROUTES
--------------------------------------- */

import healthRouter from "./routes/health.routes.js";
import authRouter from "./routes/auth.routes.js";

app.use("/api/v1/health", healthRouter);
app.use("/api/v1/auth", authRouter);

/* ---------------------------------------
   404 + ERROR HANDLER
--------------------------------------- */

// 404 handler (must come after all routes)
app.use((req, res, next) => {
  const error = new ApiError(
    HTTP_STATUS.NOT_FOUND,
    `Route ${req.originalUrl} not found`
  );
  next(error);
});

// Data sanitization against NoSQL injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Global error handler (must be LAST)
app.use(errorMiddleware);

export { app };