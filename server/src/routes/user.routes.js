import { Router } from "express";
import {
  getCurrentUserProfile,
  getPublicProfile,
  updateProfile,
  updateAvatar,
  removeAvatar,
  changePassword,
  updateEmail,
  deleteAccount,
} from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/upload.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  updateProfileSchema,
  changePasswordSchema,
  updateEmailSchema,
  deleteAccountSchema,
} from "../validators/user.validator.js";

const router = Router();

/* ---------------------------------------
   PUBLIC ROUTES
--------------------------------------- */
router.route("/:username").get(getPublicProfile);

/* ---------------------------------------
   PROTECTED ROUTES (Require Auth)
--------------------------------------- */
router.use(verifyJWT); // All routes below require authentication

// Profile management
router
  .route("/profile")
  .get(getCurrentUserProfile)
  .patch(validate(updateProfileSchema), updateProfile);

// Avatar management
router
  .route("/avatar")
  .post(upload.single("avatar"), updateAvatar)
  .delete(removeAvatar);

// Account security
router
  .route("/password")
  .patch(validate(changePasswordSchema), changePassword);

router
  .route("/email")
  .patch(validate(updateEmailSchema), updateEmail);

router
  .route("/account")
  .delete(validate(deleteAccountSchema), deleteAccount);

export default router;