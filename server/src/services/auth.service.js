import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { generateAccessAndRefreshTokens } from "../utils/generateTokens.js";

class AuthService {
  /**
   * Register a new user
   */
  async register(userData) {
    const { fullName, email, username, password } = userData;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      if (existingUser.email === email) {
        throw new ApiError(409, "Email already registered");
      }
      if (existingUser.username === username) {
        throw new ApiError(409, "Username already taken");
      }
    }

    // Create user
    const user = await User.create({
      fullName,
      email,
      username,
      password, // Will be hashed by pre-save hook
    });

    // Generate tokens
    const { accessToken, refreshToken } =
      await generateAccessAndRefreshTokens(user._id);

    // Return user without sensitive data
    const createdUser = await User.findById(user._id).select(
      "-password -refreshToken"
    );

    return { user: createdUser, accessToken, refreshToken };
  }

  /**
   * Login user
   */
  async login({identifier, password}) {
    // Find user by email or username
    const user = await User.findOne({
      $or: [{ email: identifier }, { username: identifier }],
    }).select("+password +isActive");

    if (!user) {
      throw new ApiError(401, "Invalid credentials");
    }

    // Check if account is active
    if (!user.isActive) {
      throw new ApiError(403, "Account has been deactivated");
    }

    // Verify password
    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) {
      throw new ApiError(401, "Invalid credentials");
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    // Generate tokens
    const { accessToken, refreshToken } =
      await generateAccessAndRefreshTokens(user._id);

    // Return user without sensitive data
    const loggedInUser = await User.findById(user._id).select(
      "-password -refreshToken"
    );

    return { user: loggedInUser, accessToken, refreshToken };
  }

  /**
   * Logout user
   */
  async logout(userId) {
    await User.findByIdAndUpdate(
      userId,
      {
        $unset: { refreshToken: 1 }, // Remove refresh token
      },
      { new: true }
    );

    return true;
  }

  /**
   * Refresh access token
   */
  async refreshAccessToken(incomingRefreshToken) {
    if (!incomingRefreshToken) {
      throw new ApiError(401, "Unauthorized - Refresh token required");
    }

    try {
      // Verify refresh token
      const decoded = jwt.verify(
        incomingRefreshToken,
        process.env.REFRESH_TOKEN_SECRET
      );

      // Find user
      const user = await User.findById(decoded._id).select("+refreshToken");

      if (!user) {
        throw new ApiError(401, "Invalid refresh token");
      }

      // Check if refresh token matches
      if (user.refreshToken !== incomingRefreshToken) {
        throw new ApiError(401, "Refresh token is expired or used");
      }

      // Generate new tokens
      const { accessToken, refreshToken } =
        await generateAccessAndRefreshTokens(user._id);

      return { accessToken, refreshToken };
    } catch (error) {
      throw new ApiError(401, "Invalid or expired refresh token");
    }
  }

  async verifyRefreshToken(incomingRefreshToken) {
    if (!incomingRefreshToken) {
      throw new ApiError(401, "Refresh token required");
    }

    try {
      const decoded = jwt.verify(
        incomingRefreshToken,
        process.env.REFRESH_TOKEN_SECRET
      );

      const user = await User.findById(decoded._id).select("+refreshToken");

      if (!user) {
        throw new ApiError(401, "Invalid refresh token");
      }

      if (user.refreshToken !== incomingRefreshToken) {
        throw new ApiError(401, "Refresh token expired or already used");
      }

      return user;
    } catch (error) {
      throw new ApiError(401, "Invalid or expired refresh token");
    }
  }
}

export default new AuthService();