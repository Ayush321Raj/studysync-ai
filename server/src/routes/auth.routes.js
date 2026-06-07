import { Router } from "express";
import {
  register,
  login,
  logout,
  refreshAccessToken,
  getCurrentUser,
} from "../controllers/auth.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  registerSchema,
  loginSchema,
} from "../validators/auth.validator.js";
import { trackActivity } from "../middlewares/activityTracker.middleware.js";

const router = Router();

// Public routes
router.route("/register").post(validate(registerSchema), register);
// router.post("/login", validate(loginSchema), login);
router.route("/login").post(
  validate(loginSchema),
  login,
  trackActivity("login") // <--- Add this
);
router.route("/refresh-token").post(refreshAccessToken);

// Protected routes
router.route("/logout").post(verifyJWT, logout, trackActivity("logout")); 
router.route("/me").get(verifyJWT, getCurrentUser);

export default router;