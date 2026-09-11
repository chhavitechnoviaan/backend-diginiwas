import express from "express";

import {
  getAllSellers,
  getSellerById,
  getSellerProperties,
  getSellerPropertyById,
  getSellerSummary,
} from "../../controllers/Seller/sellerController.js";
import {
  createSellerApplication,
  verifySellerEmailOtp,
  verifySellerPhoneOtp,
  resendSellerEmailOtp,
  resendSellerPhoneOtp,
} from "../../controllers/Seller/sellerApplicationController.js";
import {
  sellerLogin,
  changeSellerPassword,
  sendSellerLoginOtp,
  sellerLoginWithOtp,
} from "../../controllers/Seller/sellerAuthController.js";

import {
  protect,
} from "../../middleware/authMiddleware.js";



const router = express.Router();

// ======================================================
// PUBLIC SELLER APPLICATION
// ======================================================
router.post(
  "/applications/register",
  createSellerApplication
);
router.post(
  "/applications/verify-email",
  verifySellerEmailOtp
);

router.post(
  "/applications/verify-phone",
  verifySellerPhoneOtp
);

router.post(
  "/applications/resend-email-otp",
  resendSellerEmailOtp
);

router.post(
  "/applications/resend-phone-otp",
  resendSellerPhoneOtp
);

// ======================================================
// PUBLIC SELLER AUTH
// ======================================================
router.post(
  "/auth/login",
  sellerLogin
);

router.post(
  "/auth/send-login-otp",
  sendSellerLoginOtp
);

router.post(
  "/auth/login-with-otp",
  sellerLoginWithOtp
);

// Authenticated seller can change own password.
// Your protect middleware should populate req.user.
router.patch(
  "/auth/change-password",
  protect,
  changeSellerPassword
);

// ======================================================
// SELLER MANAGEMENT
// ======================================================
router.get(
  "/",
  protect,
  getAllSellers
);

router.get(
  "/:id/summary",
  protect,
  getSellerSummary
);

router.get(
  "/:id/properties",
  protect,
  getSellerProperties
);

router.get(
  "/:sellerId/properties/:propertyId",
  protect,
  getSellerPropertyById
);

router.get(
  "/:id",
  protect,
  getSellerById
);

export default router;
