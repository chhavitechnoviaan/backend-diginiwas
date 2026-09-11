// // import express from "express";
// // import {
// //   completeCreditPurchase,
// //   getPartnerWallet,
// //   getCreditHistory,
// //   refundCredits,
// //   adjustPartnerCredits,
// //   getCreditDashboard,
// // } from "../../controllers/Credit/creditController.js";

// // const router = express.Router();

// // // Add your admin/auth middleware on admin-only routes.
// // router.post("/purchase/complete", completeCreditPurchase);
// // router.get("/dashboard", getCreditDashboard);
// // router.get("/history", getCreditHistory);
// // router.get("/partner/:partnerId", getPartnerWallet);
// // router.post("/refund", refundCredits);
// // router.patch("/adjust", adjustPartnerCredits);

// // export default router;
// import express from "express";

// import {
//   completeCreditPurchase,
//   getPartnerWallet,
//   getCreditHistory,
//   refundCredits,
//   adjustPartnerCredits,
//   getCreditDashboard,

//   getPartnerCreditOverview,
//   getPartnerCreditDetails,

//   getPropertyCreditOverview,
//   getPropertyCreditDetails,

// } from "../../controllers/Credit/creditController.js";

// const router =
//   express.Router();

// // ==========================================
// // DASHBOARD
// // ==========================================

// router.get(
//   "/dashboard",
//   getCreditDashboard
// );

// // ==========================================
// // PARTNERS
// // ==========================================

// router.get(
//   "/partners",
//   getPartnerCreditOverview
// );

// router.get(
//   "/partners/:partnerId",
//   getPartnerCreditDetails
// );

// router.get(
//   "/partner/:partnerId",
//   getPartnerWallet
// );

// // ==========================================
// // PROPERTIES
// // ==========================================

// router.get(
//   "/properties",
//   getPropertyCreditOverview
// );

// router.get(
//   "/properties/:propertyId",
//   getPropertyCreditDetails
// );

// // ==========================================
// // HISTORY
// // ==========================================

// router.get(
//   "/history",
//   getCreditHistory
// );

// // ==========================================
// // PURCHASE
// // ==========================================

// router.post(
//   "/purchase/complete",
//   completeCreditPurchase
// );

// // ==========================================
// // REFUND
// // ==========================================

// router.post(
//   "/refund",
//   refundCredits
// );

// // ==========================================
// // ADJUST
// // ==========================================

// router.patch(
//   "/adjust",
//   adjustPartnerCredits
// );

// export default router;

import express from "express";
import {
  completeCreditPurchase,
  getPartnerWallet,
  getCreditHistory,
  refundCredits,
  adjustPartnerCredits,
  getCreditDashboard,
  getPartnerCreditOverview,
  getPartnerCreditDetails,
  getPropertyCreditOverview,
  getPropertyCreditDetails,
} from "../../controllers/Credit/creditController.js";
import {
  addCreditsByAdmin,
  bulkAddCreditsByAdmin,
  withdrawCreditsByAdmin,
  syncTeamWalletsByAdmin,
  getAdminAdjustments,
} from "../../controllers/Credit/adminCreditController.js";
import { protect, requireAdmin } from "../../middleware/authMiddleware.js";

const router = express.Router();
router.get("/dashboard", getCreditDashboard);
router.get("/partners", getPartnerCreditOverview);
router.get("/partners/:partnerId", getPartnerCreditDetails);
router.get("/partner/:partnerId", getPartnerWallet);
router.get("/properties", getPropertyCreditOverview);
router.get("/properties/:propertyId", getPropertyCreditDetails);
router.get("/history", getCreditHistory);
router.post("/purchase/complete", completeCreditPurchase);
router.post("/refund", protect, requireAdmin, refundCredits);
router.patch("/adjust", protect, requireAdmin, adjustPartnerCredits);
router.post("/admin/withdraw", protect, requireAdmin, withdrawCreditsByAdmin);
router.post("/admin/add", protect, requireAdmin, addCreditsByAdmin);
router.post("/admin/bulk-add", protect, requireAdmin, bulkAddCreditsByAdmin);
router.post("/admin/sync-wallets", protect, requireAdmin, syncTeamWalletsByAdmin);
router.get("/admin/adjustments", protect, requireAdmin, getAdminAdjustments);
export default router;
