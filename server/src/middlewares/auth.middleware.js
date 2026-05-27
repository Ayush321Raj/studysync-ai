import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

/**
 * Verify JWT and attach user to request
 * Usage: router.get('/protected', authMiddleware, controller)
 */
export const verifyJWT = asyncHandler(async (req, res, next) => {
  try {
    // Extract token from Authorization header or cookies
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      throw new ApiError(401, "Unauthorized - No token provided");
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    // Find user and attach to request
    const user = await User.findById(decoded._id).select(
      "-password -refreshToken +isActive"
    );

    if (!user) {
      throw new ApiError(401, "Unauthorized - Invalid token");
    }

    if (!user.isActive) {
      throw new ApiError(403, "Account has been deactivated");
    }

    // Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      throw new ApiError(401, "Unauthorized - Invalid token");
    }
    if (error.name === "TokenExpiredError") {
      throw new ApiError(401, "Unauthorized - Token expired");
    }
    throw error;
  }
});

/**
 * Role-based authorization middleware
 * Usage: router.delete('/admin', authMiddleware, authorize('admin'), controller)
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      throw new ApiError(401, "Unauthorized - Please login first");
    }

    if (!roles.includes(req.user.role)) {
      throw new ApiError(
        403,
        `Forbidden - ${req.user.role} role is not authorized to access this resource`
      );
    }

    next();
  };
};