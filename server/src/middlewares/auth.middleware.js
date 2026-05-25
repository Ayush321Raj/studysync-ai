import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { HTTP_STATUS } from "../constants/index.js";

/**
 * Verify JWT and attach user to request
 * Usage: router.get('/protected', verifyJWT, controller)
 */
export const verifyJWT = asyncHandler(async (req, res, next) => {
  // Extract token from header or cookies
  const token =
    req.cookies?.accessToken ||
    req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    throw new ApiError(
      HTTP_STATUS.UNAUTHORIZED,
      "Access token required. Please login."
    );
  }

  // Verify token
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      throw new ApiError(
        HTTP_STATUS.UNAUTHORIZED,
        "Access token expired. Please refresh."
      );
    }
    throw new ApiError(HTTP_STATUS.UNAUTHORIZED, "Invalid access token");
  }

  // Fetch user (exclude sensitive fields)
  const user = await User.findById(decoded._id).select(
    "-password -refreshToken"
  );

  if (!user) {
    throw new ApiError(
      HTTP_STATUS.UNAUTHORIZED,
      "Invalid token. User not found."
    );
  }

  // Attach user to request
  req.user = user;
  next();
});

/**
 * Role-based authorization middleware
 * Usage: router.delete('/admin', verifyJWT, authorize('admin'), controller)
 */
export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      throw new ApiError(
        HTTP_STATUS.UNAUTHORIZED,
        "Authentication required"
      );
    }

    if (!allowedRoles.includes(req.user.role)) {
      throw new ApiError(
        HTTP_STATUS.FORBIDDEN,
        `Access denied. Required role: ${allowedRoles.join(" or ")}`
      );
    }

    next();
  };
};