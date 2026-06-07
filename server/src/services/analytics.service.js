import { Activity } from "../models/activity.model.js";
import { StudySession } from "../models/studySession.model.js";
import { ApiError } from "../utils/ApiError.js";
import mongoose from "mongoose";

class AnalyticsService {
  /**
   * Get dashboard overview stats
   */
  async getDashboardOverview(userId, timeRange = "week") {
    const now = new Date();
    let startDate;

    switch (timeRange) {
      case "today":
        startDate = new Date(now.setHours(0, 0, 0, 0));
        break;
      case "week":
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case "month":
        startDate = new Date(now.setDate(now.getDate() - 30));
        break;
      default:
        startDate = new Date(now.setDate(now.getDate() - 7));
    }

    // Get total study time
    const studyTimeResult = await StudySession.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(userId),
          startTime: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: null,
          totalMinutes: { $sum: "$duration" },
          sessionCount: { $sum: 1 },
        },
      },
    ]);

    const studyTime = studyTimeResult[0] || {
      totalMinutes: 0,
      sessionCount: 0,
    };

    // Get tasks completed
    const tasksCompleted = await Activity.countDocuments({
      user: userId,
      type: "task_completed",
      date: { $gte: startDate },
    });

    // Get current streak
    const streak = await this.calculateStreak(userId);

    // Get activity breakdown
    const activityBreakdown = await Activity.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(userId),
          date: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: "$type",
          count: { $sum: 1 },
        },
      },
    ]);

    return {
      totalStudyTime: Math.round(studyTime.totalMinutes / 60), // hours
      totalStudyMinutes: studyTime.totalMinutes,
      studySessions: studyTime.sessionCount,
      tasksCompleted,
      currentStreak: streak,
      activityBreakdown,
      timeRange,
    };
  }

  /**
   * Calculate study streak (consecutive days with study sessions)
   */
  async calculateStreak(userId) {
    const sessions = await StudySession.find({
      user: userId,
    })
      .select("startTime")
      .sort({ startTime: -1 })
      .lean();

    if (sessions.length === 0) return 0;

    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    const studyDates = new Set();
    sessions.forEach((session) => {
      const date = new Date(session.startTime);
      date.setHours(0, 0, 0, 0);
      studyDates.add(date.getTime());
    });

    // Check if today or yesterday has activity
    const today = currentDate.getTime();
    const yesterday = new Date(currentDate);
    yesterday.setDate(yesterday.getDate() - 1);

    if (!studyDates.has(today) && !studyDates.has(yesterday.getTime())) {
      return 0;
    }

    // Count consecutive days
    let checkDate = studyDates.has(today) ? currentDate : yesterday;
    while (studyDates.has(checkDate.getTime())) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    }

    return streak;
  }

  /**
   * Get study trends (time-series data for charts)
   */
  async getStudyTrends(userId, days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const trends = await StudySession.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(userId),
          startTime: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$startTime" },
          },
          totalMinutes: { $sum: "$duration" },
          sessionCount: { $sum: 1 },
          avgFocusLevel: { $avg: "$focusLevel" },
        },
      },
      {
        $sort: { _id: 1 },
      },
      {
        $project: {
          date: "$_id",
          totalMinutes: 1,
          sessionCount: 1,
          avgFocusLevel: { $round: ["$avgFocusLevel", 1] },
          _id: 0,
        },
      },
    ]);

    return trends;
  }

  /**
   * Get activity heatmap (GitHub-style contribution graph)
   */
  async getActivityHeatmap(userId, year = new Date().getFullYear()) {
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31);

    const heatmapData = await Activity.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(userId),
          date: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$date" },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
      {
        $project: {
          date: "$_id",
          count: 1,
          _id: 0,
        },
      },
    ]);

    return heatmapData;
  }

  /**
   * Get productivity stats (by day of week, by hour, top subjects)
   */
  async getProductivityStats(userId) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Productivity by day of week
    const byDayOfWeek = await StudySession.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(userId),
          startTime: { $gte: thirtyDaysAgo },
        },
      },
      {
        $group: {
          _id: { $dayOfWeek: "$startTime" },
          totalMinutes: { $sum: "$duration" },
          sessionCount: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
      {
        $project: {
          dayOfWeek: {
            $switch: {
              branches: [
                { case: { $eq: ["$_id", 1] }, then: "Sunday" },
                { case: { $eq: ["$_id", 2] }, then: "Monday" },
                { case: { $eq: ["$_id", 3] }, then: "Tuesday" },
                { case: { $eq: ["$_id", 4] }, then: "Wednesday" },
                { case: { $eq: ["$_id", 5] }, then: "Thursday" },
                { case: { $eq: ["$_id", 6] }, then: "Friday" },
                { case: { $eq: ["$_id", 7] }, then: "Saturday" },
              ],
              default: "Unknown",
            },
          },
          totalMinutes: 1,
          sessionCount: 1,
          _id: 0,
        },
      },
    ]);

    // Productivity by hour
    const byHour = await StudySession.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(userId),
          startTime: { $gte: thirtyDaysAgo },
        },
      },
      {
        $group: {
          _id: { $hour: "$startTime" },
          totalMinutes: { $sum: "$duration" },
          sessionCount: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
      {
        $project: {
          hour: "$_id",
          totalMinutes: 1,
          sessionCount: 1,
          _id: 0,
        },
      },
    ]);

    // Top subjects
    const topSubjects = await StudySession.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(userId),
          startTime: { $gte: thirtyDaysAgo },
        },
      },
      {
        $group: {
          _id: "$subject",
          totalMinutes: { $sum: "$duration" },
          sessionCount: { $sum: 1 },
        },
      },
      {
        $sort: { totalMinutes: -1 },
      },
      {
        $limit: 5,
      },
      {
        $project: {
          subject: "$_id",
          totalMinutes: 1,
          sessionCount: 1,
          _id: 0,
        },
      },
    ]);

    return {
      byDayOfWeek,
      byHour,
      topSubjects,
    };
  }
}

export default new AnalyticsService();