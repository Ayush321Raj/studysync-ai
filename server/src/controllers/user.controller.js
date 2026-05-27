import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import UserService from "../services/user.service.js";

/**
 * @route   GET /api/v1/users/profile
 * @desc    Get current user profile
 * @access  Private
 */
const getCurrentUserProfile = asyncHandler(async (req, res) => {
  const user = await UserService.getUserProfile(req.user._id);

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Profile fetched successfully"));
});

/**
 * @route   GET /api/v1/users/:username
 * @desc    Get public profile by username
 * @access  Public
 */
const getPublicProfile = asyncHandler(async (req, res) => {
  const { username } = req.params;

  const user = await UserService.getPublicProfile(username);

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Profile fetched successfully"));
});

/**
 * @route   PATCH /api/v1/users/profile
 * @desc    Update user profile
 * @access  Private
 */
const updateProfile = asyncHandler(async (req, res) => {
  const user = await UserService.updateProfile(req.user._id, req.body);

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Profile updated successfully"));
});

/**
 * @route   POST /api/v1/users/avatar
 * @desc    Upload/update avatar
 * @access  Private
 */
const updateAvatar = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, "Avatar file is required");
  }

  const avatarUrl = await UserService.updateAvatar(
    req.user._id,
    req.file.buffer
  );

  return res
    .status(200)
    .json(new ApiResponse(200, { avatar: avatarUrl }, "Avatar updated successfully"));
});

/**
 * @route   DELETE /api/v1/users/avatar
 * @desc    Remove avatar
 * @access  Private
 */
const removeAvatar = asyncHandler(async (req, res) => {
  await UserService.removeAvatar(req.user._id);

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Avatar removed successfully"));
});

/**
 * @route   PATCH /api/v1/users/password
 * @desc    Change password
 * @access  Private
 */
const changePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    throw new ApiError(400, "Old password and new password are required");
  }

  await UserService.changePassword(req.user._id, oldPassword, newPassword);

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Password changed successfully"));
});

/**
 * @route   PATCH /api/v1/users/email
 * @desc    Update email
 * @access  Private
 */
const updateEmail = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, "Email and password are required");
  }

  const user = await UserService.updateEmail(req.user._id, email, password);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { email: user.email },
        "Email updated successfully. Please verify your new email."
      )
    );
});

/**
 * @route   DELETE /api/v1/users/account
 * @desc    Soft delete account
 * @access  Private
 */
const deleteAccount = asyncHandler(async (req, res) => {
  const { password } = req.body;

  if (!password) {
    throw new ApiError(400, "Password is required to delete account");
  }

  await UserService.deleteAccount(req.user._id, password);

  // Clear cookies
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Account deleted successfully"));
});

export {
  getCurrentUserProfile,
  getPublicProfile,
  updateProfile,
  updateAvatar,
  removeAvatar,
  changePassword,
  updateEmail,
  deleteAccount,
};