import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import StudySessionService from "../services/studySession.service.js";

/**
 * @route   POST /api/v1/study-sessions/start
 * @desc    Start a new study session
 * @access  Private
 */
export const startStudySession = asyncHandler(async (req, res) => {
  const session = await StudySessionService.startSession(req.user._id, req.body);

  return res
    .status(201)
    .json(new ApiResponse(201, session, "Study session started successfully"));
});

/**
 * @route   POST /api/v1/study-sessions/end
 * @desc    End an active study session
 * @access  Private
 */
export const endStudySession = asyncHandler(async (req, res) => {
  const session = await StudySessionService.endSession(req.user._id, req.body);

  return res
    .status(200)
    .json(new ApiResponse(200, session, "Study session ended successfully"));
});

/**
 * @route   GET /api/v1/study-sessions/active
 * @desc    Get current active session
 * @access  Private
 */
export const getActiveSession = asyncHandler(async (req, res) => {
  const session = await StudySessionService.getActiveSession(req.user._id);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        session,
        session ? "Active session found" : "No active session"
      )
    );
});

/**
 * @route   GET /api/v1/study-sessions/history
 * @desc    Get session history
 * @access  Private
 */
export const getSessionHistory = asyncHandler(async (req, res) => {
  const { page, limit } = req.query;
  const data = await StudySessionService.getSessionHistory(req.user._id, {
    page: parseInt(page) || 1,
    limit: parseInt(limit) || 20,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, data, "Session history fetched successfully"));
});