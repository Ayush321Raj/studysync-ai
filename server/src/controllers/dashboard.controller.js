import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import AnalyticsService from "../services/analytics.service.js";

/**
 * @route   GET /api/v1/dashboard/overview
 * @desc    Get dashboard overview stats
 * @access  Private
 */
export const getDashboardOverview = asyncHandler(async (req, res) => {
  const { timeRange } = req.query; // today, week, month

  const stats = await AnalyticsService.getDashboardOverview(
    req.user._id,
    timeRange
  );

  return res
    .status(200)
    .json(new ApiResponse(200, stats, "Dashboard stats fetched successfully"));
});

/**
 * @route   GET /api/v1/dashboard/study-trends
 * @desc    Get study time trends (for line charts)
 * @access  Private
 */
export const getStudyTrends = asyncHandler(async (req, res) => {
  const { days } = req.query; // Default 30 days

  const trends = await AnalyticsService.getStudyTrends(
    req.user._id,
    parseInt(days) || 30
  );

  return res
    .status(200)
    .json(new ApiResponse(200, trends, "Study trends fetched successfully"));
});

/**
 * @route   GET /api/v1/dashboard/activity-heatmap
 * @desc    Get activity heatmap (GitHub-style)
 * @access  Private
 */
export const getActivityHeatmap = asyncHandler(async (req, res) => {
  const { year } = req.query;

  const heatmap = await AnalyticsService.getActivityHeatmap(
    req.user._id,
    parseInt(year) || new Date().getFullYear()
  );

  return res
    .status(200)
    .json(
      new ApiResponse(200, heatmap, "Activity heatmap fetched successfully")
    );
});

/**
 * @route   GET /api/v1/dashboard/productivity
 * @desc    Get productivity stats (by day, hour, subject)
 * @access  Private
 */
export const getProductivityStats = asyncHandler(async (req, res) => {
  const stats = await AnalyticsService.getProductivityStats(req.user._id);

  return res
    .status(200)
    .json(
      new ApiResponse(200, stats, "Productivity stats fetched successfully")
    );
});