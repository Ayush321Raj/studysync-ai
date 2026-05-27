import { User } from "../models/user.model.js";
import { ApiError } from "./ApiError.js";

/**
 * Generates access + refresh tokens for a user.
 * Saves refresh token in DB for rotation tracking.
 */
export const generateAccessAndRefreshTokens = async (userId) => {
  try {
    console.log("Generating tokens for user:", userId);

    const user = await User.findById(userId);

    console.log("User found:", user);

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    console.log("ACCESS SECRET:", process.env.ACCESS_TOKEN_SECRET);
    console.log("REFRESH SECRET:", process.env.REFRESH_TOKEN_SECRET);

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    // Save refresh token
    user.refreshToken = refreshToken;

    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    console.log("TOKEN ERROR:", error);

    throw new ApiError(
      error.statusCode || 500,
      error.message || "Failed to generate tokens"
    );
  }
};