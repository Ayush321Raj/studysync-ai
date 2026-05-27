import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import {
  uploadToCloudinary,
  deleteFromCloudinary,
} from "../utils/cloudinary.js";

class UserService {
  /**
   * Get user profile by ID
   */
  async getUserProfile(userId) {
    const user = await User.findById(userId).select("-password -refreshToken");

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    if (!user.isActive) {
      throw new ApiError(403, "Account has been deactivated");
    }

    return user;
  }

  /**
   * Get public profile by username
   */
  async getPublicProfile(username) {
    const user = await User.findOne({ username, isActive: true }).select(
      "fullName username avatar bio socialLinks createdAt"
    );

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    return user;
  }

  /**
   * Update user profile
   */
  async updateProfile(userId, updateData) {
    const allowedUpdates = ["fullName", "bio", "socialLinks", "preferences"];
    const updates = {};

    // Filter only allowed fields
    Object.keys(updateData).forEach((key) => {
      if (allowedUpdates.includes(key)) {
        updates[key] = updateData[key];
      }
    });

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true, runValidators: true }
    ).select("-password -refreshToken");

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    return user;
  }

  /**
   * Upload/update avatar
   */
  async updateAvatar(userId, fileBuffer) {
    const user = await User.findById(userId);

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    // Delete old avatar from Cloudinary if exists
    if (user.avatar) {
      await deleteFromCloudinary(user.avatar);
    }

    // Upload new avatar
    const avatarUrl = await uploadToCloudinary(fileBuffer, "studysync/avatars");

    user.avatar = avatarUrl;
    await user.save({ validateBeforeSave: false });

    return user.avatar;
  }

  /**
   * Remove avatar
   */
  async removeAvatar(userId) {
    const user = await User.findById(userId);

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    if (user.avatar) {
      await deleteFromCloudinary(user.avatar);
      user.avatar = "";
      await user.save({ validateBeforeSave: false });
    }

    return true;
  }

  /**
   * Change password
   */
  async changePassword(userId, oldPassword, newPassword) {
    const user = await User.findById(userId).select("+password");

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    // Verify old password
    const isPasswordValid = await user.isPasswordCorrect(oldPassword);
    if (!isPasswordValid) {
      throw new ApiError(401, "Current password is incorrect");
    }

    // Check if new password is same as old
    if (oldPassword === newPassword) {
      throw new ApiError(400, "New password must be different from current password");
    }

    user.password = newPassword;
    await user.save();

    return true;
  }

  /**
   * Update email
   */
  async updateEmail(userId, newEmail, password) {
    const user = await User.findById(userId).select("+password");

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    // Verify password
    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) {
      throw new ApiError(401, "Password is incorrect");
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email: newEmail });
    if (existingUser) {
      throw new ApiError(409, "Email already in use");
    }

    user.email = newEmail;
    user.isEmailVerified = false; // Require re-verification
    await user.save();

    return user;
  }

  /**
   * Soft delete account
   */
  async deleteAccount(userId, password) {
    const user = await User.findById(userId).select("+password");

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    // Verify password
    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) {
      throw new ApiError(401, "Password is incorrect");
    }

    // Soft delete
    user.isActive = false;
    user.refreshToken = null; // Invalidate refresh token
    await user.save({ validateBeforeSave: false });

    // Delete avatar from Cloudinary
    if (user.avatar) {
      await deleteFromCloudinary(user.avatar);
    }

    return true;
  }
}

export default new UserService();