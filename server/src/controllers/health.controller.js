import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const checkHealth = asyncHandler(async (req, res) => {
  const healthData = {
    status: "OK",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    service: "StudySync AI Backend",
    version: "1.0.0",
  };

  return res
    .status(200)
    .json(new ApiResponse(200, healthData, "Server is healthy 💚"));
});

export { checkHealth };