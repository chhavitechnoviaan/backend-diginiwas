import express from "express";
import { protect, requireAdmin } from "../../middleware/authMiddleware.js";
import { getUnifiedUsers } from "../../controllers/Admin/usersController.js";

const router = express.Router();

router.use(protect, requireAdmin);
router.get("/", getUnifiedUsers);

export default router;
