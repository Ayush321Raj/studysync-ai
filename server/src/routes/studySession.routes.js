import { Router } from "express";
import {
  startStudySession,
  endStudySession,
  getActiveSession,
  getSessionHistory,
} from "../controllers/studySession.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  startSessionSchema,
  endSessionSchema,
} from "../validators/studySession.validator.js";

const router = Router();

// All routes require authentication
router.use(verifyJWT);

router.route("/start").post(validate(startSessionSchema), startStudySession);
router.route("/end").post(validate(endSessionSchema), endStudySession);
router.route("/active").get(getActiveSession);
router.route("/history").get(getSessionHistory);

export default router;