
// import express from "express";
// import {
//   getAllPartners,
//   getPartnerById,
//   verifyPartner,
//   blockPartner,
//   deletePartner,
//   getUnassignedProperties,
//   getAvailablePartners,
//   assignPartnerToProperty,
//   getAssignmentProperties,
//   getAssignmentSummary,
//   unassignPartnerFromProperty,
// } from "../../controllers/Agent/partnerController.js";

// const router = express.Router();

// // IMPORTANT: static routes must stay before /:id.
// router.get("/properties/unassigned", getUnassignedProperties);
// router.get("/partners/available", getAvailablePartners);
// router.get("/summary", getAssignmentSummary);
// router.get("/properties", getAssignmentProperties);

// // Keep both aliases because the current frontend uses both forms.
// router.patch("/properties/:propertyId/assign", assignPartnerToProperty);
// router.patch("/properties/:propertyId/assign-partner", assignPartnerToProperty);
// router.patch("/properties/:propertyId/unassign", unassignPartnerFromProperty);

// router.get("/", getAllPartners);
// router.patch("/:id/verify", verifyPartner);
// router.patch("/:id/block", blockPartner);
// router.delete("/delete/:id", deletePartner);
// router.get("/:id", getPartnerById);

// export default router;


import express from "express";
import { getAllPartners, getPartnerById, getApprovedNotVerifiedPartners, blockPartner, deletePartner, getUnassignedProperties, getAvailablePartners, assignPartnerToProperty, getAssignmentProperties, getAssignmentSummary, unassignPartnerFromProperty } from "../../controllers/Agent/partnerController.js";
const router = express.Router();
router.get("/properties/unassigned", getUnassignedProperties);
router.get("/partners/available", getAvailablePartners);
router.get("/approved-not-verified", getApprovedNotVerifiedPartners);
router.get("/summary", getAssignmentSummary);
router.get("/properties", getAssignmentProperties);
router.patch("/properties/:propertyId/assign", assignPartnerToProperty);
router.patch("/properties/:propertyId/assign-partner", assignPartnerToProperty);
router.patch("/properties/:propertyId/unassign", unassignPartnerFromProperty);
router.get("/", getAllPartners);
router.patch("/:id/block", blockPartner);
router.delete("/delete/:id", deletePartner);
router.get("/:id", getPartnerById);
export default router;
