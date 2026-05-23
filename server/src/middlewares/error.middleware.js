import { ApiError } from "../utils/ApiError.js";

const errorMiddleware = (err, req, res, next) => {
  let error = err;

  // If it's not already an ApiError, normalize it
  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || 500;
    const message = error.message || "Internal Server Error";
    error = new ApiError(statusCode, message, error?.errors || [], err.stack);
  }

  const response = {
    success: false,
    statusCode: error.statusCode,
    message: error.message,
    errors: error.errors,
    // Only show stack trace in development
    ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
  };

  // Log to console (later we'll integrate Winston/Pino)
  console.error(`❌ [${error.statusCode}] ${error.message}`);

  return res.status(error.statusCode).json(response);
};

export { errorMiddleware };