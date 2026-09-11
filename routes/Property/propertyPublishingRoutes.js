import express from "express";

import {
  getPropertyPublishingSummary,
  getReadyForFinalReviewProperties,
  getLivePublishingProperties,
  getFinalReviewPropertyById,
  makePropertyLiveAfterFinalReview,
} from "../../controllers/Property/propertyPublishingController.js";

import {
  protect,
} from "../../middleware/authMiddleware.js";

const router = express.Router();

router.get(
  "/summary",
  getPropertyPublishingSummary
);

router.get(
  "/ready",
  getReadyForFinalReviewProperties
);

router.get(
  "/live",
  getLivePublishingProperties
);

router.get(
  "/:id/final-review",
  getFinalReviewPropertyById
);

router.patch(
  "/:id/make-live",
  protect,
  makePropertyLiveAfterFinalReview
);

export default router;
