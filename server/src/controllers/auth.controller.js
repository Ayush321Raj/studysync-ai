import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { HTTP_STATUS } from "../constants/index.js";
import authService from "../services/auth.service.js";
import { generateAccessAndRefreshTokens } from "../utils/generateTokens.js";
import { cookieOptions } from "../constants/cookies.js";

/**
 * @route   POST /api/v1/auth/register
 * @desc    Register new user
 * @access  Public
 */
export const register = asyncHandler(async (req, res) => {
  const { fullName, email, username, password } = req.body;

  // Create user via service
  const user = await authService.register({
    fullName,
    email,
    username,
    password,
  });

  // Generate tokens
  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id
  );

  // Send response
  return res
    .status(HTTP_STATUS.CREATED)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .json(
      new ApiResponse(
        HTTP_STATUS.CREATED,
        { user, accessToken },
        "User registered successfully"
      )
    );
});

/**
 * @route   POST /api/v1/auth/login
 * @desc    Login user
 * @access  Public
 */
export const login = asyncHandler(async (req, res) => {
  const { identifier, password } = req.body;

  // Authenticate user
  const user = await authService.login({ identifier, password });

  // Generate tokens
  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id
  );

  // Send response
  return res
    .status(HTTP_STATUS.OK)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .json(
      new ApiResponse(
        HTTP_STATUS.OK,
        { user, accessToken },
        "Login successful"
      )
    );
});

/**
 * @route   POST /api/v1/auth/logout
 * @desc    Logout user
 * @access  Private
 */
export const logout = asyncHandler(async (req, res) => {
  await authService.logout(req.user._id);

  return res
    .status(HTTP_STATUS.OK)
    .clearCookie("refreshToken", cookieOptions)
    .json(new ApiResponse(HTTP_STATUS.OK, null, "Logout successful"));
});

/**
 * @route   POST /api/v1/auth/refresh-token
 * @desc    Refresh access token
 * @access  Public (but requires refresh token)
 */
export const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  // Verify and get user
  const user = await authService.verifyRefreshToken(incomingRefreshToken);

  // Generate new tokens (rotation)
  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id
  );

  return res
    .status(HTTP_STATUS.OK)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .json(
      new ApiResponse(
        HTTP_STATUS.OK,
        { accessToken },
        "Access token refreshed"
      )
    );
});

/**
 * @route   GET /api/v1/auth/me
 * @desc    Get current user
 * @access  Private
 */
export const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(HTTP_STATUS.OK)
    .json(
      new ApiResponse(HTTP_STATUS.OK, req.user, "User fetched successfully")
    );
});