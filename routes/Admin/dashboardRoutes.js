import express from "express";
import { protect, requireAdmin } from "../../middleware/authMiddleware.js";
import { getAdminDashboardSummary, getLeadAnalytics } from "../../controllers/Admin/dashboardController.js";

const router = express.Router();

router.get("/summary", protect, requireAdmin, getAdminDashboardSummary);
router.get("/lead-analytics", protect, requireAdmin, getLeadAnalytics);

export default router;
