import { Activity } from "../models/activity.model.js";

/**
 * Track user activity
 * @param {string} type - Activity type
 * @param {object} metadata - Additional data
 */
export const trackActivity = (type, metadata = {}) => {
  return async (req, res, next) => {
    try {
      if (req.user) {
        await Activity.create({
          user: req.user._id,
          type,
          metadata,
          date: new Date(),
        });
      }
    } catch (error) {
      // Don't block the request if tracking fails
      console.error("Activity tracking error:", error);
    }
    next();
  };
};

/**
 * Manual activity logging helper
 */
export const logActivity = async (userId, type, metadata = {}, duration = 0) => {
  try {
    await Activity.create({
      user: userId,
      type,
      metadata,
      duration,
      date: new Date(),
    });
  } catch (error) {
    console.error("Activity logging error:", error);
  }
};