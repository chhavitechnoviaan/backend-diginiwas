// import express from "express";

// import {
//   createLeadFromProperty,
//   createLead,
//   getLeads,
//   getLeadById,
//   updateLeadStatus,
//   assignLeadPartner,
//   unlockLeadByPartner,
//   addLeadContactHistory,
//   reviewLead,
//   rejectLead,
//   closeLead,
//   convertLead,
//   getLeadDashboard,
// } from "../../controllers/Lead/leadController.js";

// const router = express.Router();

// // IMPORTANT:
// // Specific routes must stay above /:id.
// router.get(
//   "/dashboard",
//   getLeadDashboard
// );

// router.post(
//   "/from-property",
//   createLeadFromProperty
// );

// router.post(
//   "/",
//   createLead
// );

// router.get(
//   "/",
//   getLeads
// );

// router.patch(
//   "/:id/status",
//   updateLeadStatus
// );

// router.patch(
//   "/:id/assign-partner",
//   assignLeadPartner
// );

// router.patch(
//   "/:id/unlock",
//   unlockLeadByPartner
// );

// router.post(
//   "/:id/contact-history",
//   addLeadContactHistory
// );

// router.patch(
//   "/:id/review",
//   reviewLead
// );

// router.patch(
//   "/:id/reject",
//   rejectLead
// );

// router.patch(
//   "/:id/close",
//   closeLead
// );

// router.patch(
//   "/:id/convert",
//   convertLead
// );

// router.get(
//   "/:id",
//   getLeadById
// );

// export default router;


import express from "express";

import {
  createLeadFromProperty,
  createLead,
  getLeads,
  getLeadById,
  updateLeadStatus,
  verifyLeadByAdmin,
  assignLeadPartner,
  unlockLeadByPartner,
  addLeadContactHistory,
  reviewLead,
  rejectLead,
  closeLead,
  convertLead,
  getLeadDashboard,
  getPartnerVisibleLeads,
  getPartnerVisibleLeadById,
  allocateLeadToSubPartner,
  removeLeadSubPartnerAllocation,
} from "../../controllers/Lead/leadcontroller.js";
import { protect, requireAdmin } from "../../middleware/authMiddleware.js";
import { createLeadRefundRequest, getLeadRefundRequests, reviewLeadRefundRequest } from "../../controllers/Lead/leadRefundRequestController.js";

const router = express.Router();

// IMPORTANT:
// Specific routes must stay above /:id.
router.get(
  "/dashboard",
  getLeadDashboard
);

// Partner-side lead visibility. Keep above /:id routes.
router.get(
  "/partner/:partnerId",
  getPartnerVisibleLeads
);

router.get(
  "/partner/:partnerId/:id",
  getPartnerVisibleLeadById
);

router.post(
  "/from-property",
  createLeadFromProperty
);

router.post(
  "/",
  createLead
);

router.get("/refund-requests", protect, requireAdmin, getLeadRefundRequests);
router.patch("/refund-requests/:requestId/review", protect, requireAdmin, reviewLeadRefundRequest);

router.get(
  "/",
  getLeads
);

router.patch(
  "/:id/status",
  updateLeadStatus
);

router.patch(
  "/:id/verify",
  protect,
  requireAdmin,
  verifyLeadByAdmin
);

router.patch(
  "/:id/assign-partner",
  protect,
  requireAdmin,
  assignLeadPartner
);

router.patch(
  "/:id/unlock",
  protect,
  unlockLeadByPartner
);

router.post("/:id/refund-request", protect, createLeadRefundRequest);

router.patch(
  "/:id/allocate-subpartner",
  allocateLeadToSubPartner
);

router.patch(
  "/:id/remove-subpartner-allocation",
  removeLeadSubPartnerAllocation
);

router.post(
  "/:id/contact-history",
  addLeadContactHistory
);

router.patch(
  "/:id/review",
  reviewLead
);

router.patch(
  "/:id/reject",
  rejectLead
);

router.patch(
  "/:id/close",
  closeLead
);

router.patch(
  "/:id/convert",
  convertLead
);

router.get(
  "/:id",
  getLeadById
);

export default router;
