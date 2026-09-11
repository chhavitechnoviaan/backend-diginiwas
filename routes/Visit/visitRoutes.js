import express from "express";
import {
  createVisitRequest,
  getAdminVisits,
  getVisitSummary,
  getVisitById,
  reviewVisitRequest,
  updateVisitStatus,
  getVisitsByPartner,
  reviewSubAgentVisitByTeamOwner,
  getTeamPendingVisitRequests,
} from "../../controllers/Visit/visitController.js";

const router = express.Router();

// IMPORTANT: Static routes before /:id
router.get("/summary", getVisitSummary);
router.get("/admin", getAdminVisits);
router.get("/partner/:partnerId", getVisitsByPartner);
router.get("/team/:ownerId/pending", getTeamPendingVisitRequests);
router.post("/request", createVisitRequest);
router.patch("/:id/team-review", reviewSubAgentVisitByTeamOwner);
router.patch("/:id/review", reviewVisitRequest);
router.patch("/:id/status", updateVisitStatus);
router.get("/:id", getVisitById);

export default router;
