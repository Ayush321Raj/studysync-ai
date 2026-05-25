import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { HTTP_STATUS } from "../constants/index.js";
import { generateAccessAndRefreshTokens } from "../utils/generateTokens.js";

class AuthService {
  /**
   * Register a new user
   */
  async register({ fullName, email, username, password }) {
  // Check if user already exists
  const existingUser = await User.findOne({
    $or: [{ email }, { username }],
  });

  if (existingUser) {
    if (existingUser.email === email) {
      throw new ApiError(409, "Email already registered");
    }

    throw new ApiError(409, "Username already taken");
  }

  // Create user
  const user = await User.create({
    fullName,
    email,
    username,
    password,
  });

  // Generate tokens
  const { accessToken, refreshToken } =
    await generateAccessAndRefreshTokens(user._id);

  // Fetch clean user
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  return {
    user: createdUser,
    accessToken,
    refreshToken,
  };
}

  /**
   * Login user
   */
  async login({ identifier, password }) {
  const user = await User.findOne({
    $or: [{ email: identifier }, { username: identifier }],
  }).select("+password +refreshToken");

  if (!user) {
    throw new ApiError(HTTP_STATUS.UNAUTHORIZED, "Invalid credentials");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(HTTP_STATUS.UNAUTHORIZED, "Invalid credentials");
  }

  // Generate new tokens
  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  // Save refresh token
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });
  

  // Remove sensitive fields
  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  return {
    user: loggedInUser,
    accessToken,
    refreshToken,
  };
}

  /**
   * Verify refresh token and return user
   */
  async verifyRefreshToken(incomingRefreshToken) {
    if (!incomingRefreshToken) {
      throw new ApiError(HTTP_STATUS.UNAUTHORIZED, "Refresh token required");
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(
        incomingRefreshToken,
        process.env.REFRESH_TOKEN_SECRET
      );
    } catch (error) {
      throw new ApiError(HTTP_STATUS.UNAUTHORIZED, "Invalid or expired refresh token");
    }

    // Find user and check if token matches
    const user = await User.findById(decoded._id).select("+refreshToken");

    if (!user) {
      throw new ApiError(HTTP_STATUS.UNAUTHORIZED, "Invalid refresh token");
    }

    // Check if refresh token matches (rotation security)
    if (user.refreshToken !== incomingRefreshToken) {
      throw new ApiError(
        HTTP_STATUS.UNAUTHORIZED,
        "Refresh token has been used or revoked"
      );
    }

    return user;
  }

  /**
   * Logout user (clear refresh token)
   */
  async logout(userId) {
    await User.findByIdAndUpdate(
      userId,
      { $unset: { refreshToken: 1 } }, // Remove field
      { new: true }
    );
  }
}

export default new AuthService();