import express from "express";
import { protect, requireAdmin } from "../../middleware/authMiddleware.js";
import { getAdminNotifications, markAdminNotificationRead, markAllAdminNotificationsRead } from "../../controllers/Admin/notificationController.js";

const router = express.Router();
router.use(protect, requireAdmin);
router.get("/", getAdminNotifications);
router.patch("/read-all", markAllAdminNotificationsRead);
router.patch("/:id/read", markAdminNotificationRead);
export default router;
