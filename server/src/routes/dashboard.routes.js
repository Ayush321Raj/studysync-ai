import { Router } from "express";
import {
  getDashboardOverview,
  getStudyTrends,
  getActivityHeatmap,
  getProductivityStats,
} from "../controllers/dashboard.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// All dashboard routes require authentication
router.use(verifyJWT);

router.route("/overview").get(getDashboardOverview);
router.route("/study-trends").get(getStudyTrends);
router.route("/activity-heatmap").get(getActivityHeatmap);
router.route("/productivity").get(getProductivityStats);

export default router;