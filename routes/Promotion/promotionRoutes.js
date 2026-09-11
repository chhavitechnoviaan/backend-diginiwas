// // import express from "express";
// // import {
// //   createPromotionRequest,
// //   getPromotionRequests,
// //   approvePromotionRequest,
// //   rejectPromotionRequest,
// //   expirePromotions,
// // } from "../../controllers/Promotion/promotionController.js";

// // const router = express.Router();

// // router.post("/", createPromotionRequest);
// // router.get("/", getPromotionRequests);

// // // Admin-only routes: attach your protect/admin middleware.
// // router.patch("/:id/approve", approvePromotionRequest);
// // router.patch("/:id/reject", rejectPromotionRequest);

// // // Prefer calling this from a secured cron/internal job.
// // router.post("/maintenance/expire", expirePromotions);

// // export default router;

// import express from "express";
// import {
//   createPromotionRequest,
//   getPromotionRequests,
//   approvePromotionRequest,
//   rejectPromotionRequest,
//   expirePromotions,
// } from "../../controllers/Promotion/promotionController.js";

// const router = express.Router();
// router.post("/", createPromotionRequest);
// router.get("/", getPromotionRequests);
// router.post("/maintenance/expire", expirePromotions); // keep above /:id routes
// router.patch("/:id/approve", approvePromotionRequest);
// router.patch("/:id/reject", rejectPromotionRequest);
// export default router;



import express from "express";
import {
  createPromotionRequest,
  getPromotionRequests,
  getMyPromotionRequests,
  approvePromotionRequest,
  rejectPromotionRequest,
  expirePromotions,
} from "../../controllers/Promotion/promotionV2Controller.js";
import { protect, requireAdmin } from "../../middleware/authMiddleware.js";

const router = express.Router();
// Generic create: targetType decides PARTNER or PROPERTY.
router.post("/", protect, createPromotionRequest);
router.post("/partner/request", protect, (req, _res, next) => { req.body.targetType = "PARTNER"; next(); }, createPromotionRequest);
router.post("/property/request", protect, (req, _res, next) => { req.body.targetType = "PROPERTY"; next(); }, createPromotionRequest);

// Partner sees only their own partner + property requests.
router.get("/my", protect, getMyPromotionRequests);

// Admin sees/filter all requests.
router.get("/", protect, requireAdmin, getPromotionRequests);

// Static route must stay above /:id routes.
router.post("/maintenance/expire", protect, requireAdmin, expirePromotions);
router.patch("/:id/approve", protect, requireAdmin, approvePromotionRequest);
router.patch("/:id/reject", protect, requireAdmin, rejectPromotionRequest);
export default router;
