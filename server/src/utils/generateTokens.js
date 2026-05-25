import { User } from "../models/user.model.js";
import { ApiError } from "./ApiError.js";

/**
 * Generates access + refresh tokens for a user.
 * Saves the refresh token to the DB for rotation tracking.
 */
export const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) throw new ApiError(404, "User not found");

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    // Save refresh token for rotation/revocation
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
  console.log(error);

  throw new ApiError(
    500,
    error.message || "Failed to generate tokens"
  );
}

console.log("ACCESS SECRET:", process.env.ACCESS_TOKEN_SECRET);
console.log("REFRESH SECRET:", process.env.REFRESH_TOKEN_SECRET);
console.log("User found:", user);
};