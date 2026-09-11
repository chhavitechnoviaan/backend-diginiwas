import express from "express";
import { protect, requireAdmin } from "../../middleware/authMiddleware.js";
import { getAdminProfile, updateAdminProfile, changeAdminPassword } from "../../controllers/Admin/profileController.js";

const router = express.Router();
router.use(protect, requireAdmin);
router.get("/", getAdminProfile);
router.patch("/", updateAdminProfile);
router.patch("/change-password", changeAdminPassword);
export default router;
