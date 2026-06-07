import { StudySession } from "../models/studySession.model.js";
import { ApiError } from "../utils/ApiError.js";
import { logActivity } from "../middlewares/activityTracker.middleware.js";

class StudySessionService {
  /**
   * Start a new study session
   */
  async startSession(userId, { subject, notes, tags }) {
    // Check if there's already an active session
    const activeSession = await StudySession.findOne({
      user: userId,
      isActive: true,
    });

    if (activeSession) {
      throw new ApiError(400, "You already have an active study session");
    }

    const session = await StudySession.create({
      user: userId,
      subject,
      startTime: new Date(),
      notes,
      tags,
      isActive: true,
    });

    // Log activity
    await logActivity(userId, "study_session_start", { subject });

    return session;
  }

  /**
   * End an active study session
   */
  async endSession(userId, { sessionId, focusLevel, notes }) {
    const session = await StudySession.findOne({
      _id: sessionId,
      user: userId,
      isActive: true,
    });

    if (!session) {
      throw new ApiError(404, "Active session not found");
    }

    session.endTime = new Date();
    session.isActive = false;
    if (focusLevel) session.focusLevel = focusLevel;
    if (notes) session.notes = notes;

    await session.save();

    // Log activity
    await logActivity(userId, "study_session_end", {
      subject: session.subject,
      duration: session.duration,
    }, session.duration);

    return session;
  }

  /**
   * Get active session
   */
  async getActiveSession(userId) {
    const session = await StudySession.findOne({
      user: userId,
      isActive: true,
    });

    return session;
  }

  /**
   * Get session history
   */
  async getSessionHistory(userId, { page = 1, limit = 20 }) {
    const skip = (page - 1) * limit;

    const sessions = await StudySession.find({
      user: userId,
      isActive: false,
    })
      .sort({ startTime: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await StudySession.countDocuments({
      user: userId,
      isActive: false,
    });

    return {
      sessions,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalSessions: total,
      },
    };
  }
}

export default new StudySessionService();