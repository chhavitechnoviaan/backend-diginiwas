// import express from "express";
// import { getTeamPartners, addTeamMember, allocateTeamCredits, getTeamMemberCreditHistory } from "../../controllers/Agent/teamPartnerController.js";
// import { protect } from "../../middleware/authMiddleware.js";
// const router = express.Router();
// router.get("/", protect, getTeamPartners);
// router.post("/:ownerId/members", protect, addTeamMember);
// router.patch("/:ownerId/members/:memberId/allocate-credits", protect, allocateTeamCredits);
// router.get("/:ownerId/members/:memberId/credit-history", protect, getTeamMemberCreditHistory);
// export default router;


import express from "express";
import {
  getTeamPartners,
  addTeamMember,
  allocateTeamCredits,
  getTeamMemberCreditHistory,
  getVerifiedTeamMembers,
  getTeamAssignedProperties,
  delegatePropertyToSubAgent,
  removeSubAgentPropertyDelegation,
} from "../../controllers/Agent/teamPartnerController.js";
import { protect } from "../../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getTeamPartners);
router.post("/:ownerId/members", protect, addTeamMember);
router.patch(
  "/:ownerId/members/:memberId/allocate-credits",
  protect,
  allocateTeamCredits
);
router.get(
  "/:ownerId/members/:memberId/credit-history",
  protect,
  getTeamMemberCreditHistory
);

router.get("/:ownerId/verified-members", protect, getVerifiedTeamMembers);
router.get("/:ownerId/properties", protect, getTeamAssignedProperties);
router.patch("/:ownerId/properties/:propertyId/delegate", protect, delegatePropertyToSubAgent);
router.patch("/:ownerId/properties/:propertyId/remove-delegation", protect, removeSubAgentPropertyDelegation);

export default router;
