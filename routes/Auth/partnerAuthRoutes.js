import express from "express";
import { partnerLogin, changePartnerPassword } from "../../controllers/Auth/partnerAuthController.js";
import { protect } from "../../middleware/authMiddleware.js";
const router = express.Router();
router.post("/login", partnerLogin);
router.patch("/change-password", protect, changePartnerPassword);
export default router;
