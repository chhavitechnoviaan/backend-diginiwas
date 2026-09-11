// import mongoose from "mongoose";
// import Partner from "../../models/Partner.js";
// import Property from "../../models/NewProperty.js";
// import PromotionRequest from "../../models/PromotionRequest.js";
// import CreditTransaction from "../../models/CreditTransaction.js";
// import { getCreditProduct } from "../../config/creditPlans.js";
// import {
//   creditPartnerWallet,
//   debitPartnerWallet,
//   makeActor,
// } from "../../services/creditWalletService.js";

// const generateRequestId = () =>
//   `PRQ-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

// const isPartnerAllowedOnProperty = (partner, property) => {
//   const assigned =
//     property?.assignedPartner?.partnerId &&
//     String(property.assignedPartner.partnerId) === String(partner._id);

//   const createdByMongo =
//     property?.addedBy?.role === "Partner" &&
//     property?.addedBy?.userId &&
//     String(property.addedBy.userId) === String(partner._id);

//   const createdByCode =
//     property?.addedBy?.role === "Partner" &&
//     partner.partnerId &&
//     property?.addedBy?.partnerId === partner.partnerId;

//   return Boolean(assigned || createdByMongo || createdByCode);
// };

// const validatePromotionEligibility = ({ partner, property }) => {
//   if (!partner.isVerified) {
//     return "Only verified partners can request property promotions";
//   }

//   if (partner.isBlocked || partner.isRejected) {
//     return "Blocked/rejected partner cannot request promotions";
//   }

//   if (
//     property.status !== "Live" ||
//     property.propertyVerificationStatus !== "Verified"
//   ) {
//     return "Only verified and Live properties can be promoted";
//   }

//   if (!isPartnerAllowedOnProperty(partner, property)) {
//     return "Partner can promote only a property created by or assigned to that partner";
//   }

//   return null;
// };

// export const createPromotionRequest = async (req, res) => {
//   const session = await mongoose.startSession();

//   try {
//     const {
//       partnerId,
//       propertyId,
//       promotionType,
//       remarks = "",
//     } = req.body;

//     if (
//       !mongoose.Types.ObjectId.isValid(partnerId) ||
//       !mongoose.Types.ObjectId.isValid(propertyId)
//     ) {
//       return res.status(400).json({
//         success: false,
//         message: "Valid partnerId and propertyId are required",
//       });
//     }

//     const plan = getCreditProduct(promotionType);

//     if (!plan || promotionType === "LEAD_UNLOCK") {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid promotionType",
//       });
//     }

//     const [partner, property] = await Promise.all([
//       Partner.findById(partnerId),
//       Property.findById(propertyId),
//     ]);

//     console.log("======================================");
// console.log("PROMOTION DEBUG");
// console.log("Partner ID:", partnerId);
// console.log("Property ID:", propertyId);
// console.log("Property found:", !!property);
// console.log("Property Code:", property?.propertyId);
// console.log("Property Status:", property?.status);
// console.log(
//   "Property Verification:",
//   property?.propertyVerificationStatus
// );
// console.log("Partner Verified:", partner?.isVerified);
// console.log("Assigned Partner:", property?.assignedPartner?.partnerId);
// console.log("======================================");

//     if (!partner) {
//       return res.status(404).json({ success: false, message: "Partner not found" });
//     }
//     if (!property) {
//       return res.status(404).json({ success: false, message: "Property not found" });
//     }

//     const eligibilityError = validatePromotionEligibility({ partner, property });
//     if (eligibilityError) {
//       return res.status(400).json({ success: false, message: eligibilityError });
//     }

//     const duplicate = await PromotionRequest.findOne({
//       partnerMongoId: partner._id,
//       propertyMongoId: property._id,
//       promotionType,
//       status: { $in: ["Pending", "Approved"] },
//       $or: [{ expiresAt: null }, { expiresAt: { $gt: new Date() } }],
//     });

//     if (duplicate) {
//       return res.status(409).json({
//         success: false,
//         message: "A pending/active request of this type already exists",
//         data: duplicate,
//       });
//     }

//     const actor = {
//       userId: partner._id,
//       name: partner.name,
//       role: "Partner",
//     };

//     let promotionRequest;
//     let debitResult;

//     await session.withTransaction(async () => {
//       // Reserve/debit credits first. Promotion is still NOT visible on buyer side.
//       debitResult = await debitPartnerWallet({
//         partnerId: partner._id,
//         credits: plan.credits,
//         type: "PROMOTION_DEBIT",
//         productCode: promotionType,
//         referenceType: "PromotionRequest",
//         description: `${plan.label} request - credits reserved pending admin approval`,
//         metadata: {
//           propertyMongoId: property._id,
//           propertyCode: property.propertyId,
//         },
//         actor,
//         session,
//       });

//       [promotionRequest] = await PromotionRequest.create(
//         [
//           {
//             requestId: generateRequestId(),
//             partnerMongoId: partner._id,
//             partnerCode: partner.partnerId || "",
//             partnerName: partner.name || "",
//             propertyMongoId: property._id,
//             propertyCode: property.propertyId || "",
//             propertyTitle: property.title || "",
//             locality: property.locality || "",
//             city: property.city || "",
//             promotionType,
//             creditsCharged: plan.credits,
//             debitTransactionId: debitResult.transaction._id,
//             status: "Pending",
//             requestedAt: new Date(),
//             requestedBy: makeActor(actor),
//             history: [
//               {
//                 status: "Pending",
//                 remarks: remarks || `${plan.label} requested`,
//                 actor: makeActor(actor),
//               },
//             ],
//           },
//         ],
//         { session }
//       );

//       debitResult.transaction.referenceId = promotionRequest._id;
//       await debitResult.transaction.save({ session });

//       partner.promotionStats.totalRequests =
//         Number(partner.promotionStats?.totalRequests || 0) + 1;
//       partner.promotionStats.pendingRequests =
//         Number(partner.promotionStats?.pendingRequests || 0) + 1;
//       await partner.save({ session });
//     });

//     return res.status(201).json({
//       success: true,
//       message:
//         "Promotion request submitted. Credits reserved; promotion will go live only after admin approval.",
//       data: {
//         request: promotionRequest,
//         wallet: debitResult.partner.creditWallet,
//         debitTransaction: debitResult.transaction,
//       },
//     });
//   } catch (error) {
//     const status = error.code === "INSUFFICIENT_CREDITS" ? 400 : 500;
//     return res.status(status).json({
//       success: false,
//       message: "Unable to create promotion request",
//       error: error.message,
//     });
//   } finally {
//     await session.endSession();
//   }
// };

// export const getPromotionRequests = async (req, res) => {
//   try {
//     const {
//       status,
//       promotionType,
//       partnerId,
//       propertyId,
//     } = req.query;

//     const query = {};
//     if (status) query.status = status;
//     if (promotionType) query.promotionType = promotionType;
//     if (partnerId && mongoose.Types.ObjectId.isValid(partnerId)) {
//       query.partnerMongoId = partnerId;
//     }
//     if (propertyId && mongoose.Types.ObjectId.isValid(propertyId)) {
//       query.propertyMongoId = propertyId;
//     }

//     const data = await PromotionRequest.find(query)
//       .sort({ createdAt: -1 })
//       .lean();

//     return res.json({ success: true, count: data.length, data });
//   } catch (error) {
//     return res.status(500).json({
//       success: false,
//       message: "Unable to fetch promotion requests",
//       error: error.message,
//     });
//   }
// };

// export const approvePromotionRequest = async (req, res) => {
//   const session = await mongoose.startSession();

//   try {
//     const { actor = {}, remarks = "" } = req.body;

//     let request;
//     let property;
//     let partner;

//     await session.withTransaction(async () => {
//       request = await PromotionRequest.findById(req.params.id).session(session);

//       if (!request) throw Object.assign(new Error("Promotion request not found"), { http: 404 });
//       if (request.status !== "Pending") {
//         throw Object.assign(new Error("Only Pending requests can be approved"), { http: 400 });
//       }

//       [partner, property] = await Promise.all([
//         Partner.findById(request.partnerMongoId).session(session),
//         Property.findById(request.propertyMongoId).session(session),
//       ]);

//       if (!partner || !property) {
//         throw Object.assign(new Error("Partner or property no longer exists"), { http: 404 });
//       }

//       // Re-check on approval day too.
//       const eligibilityError = validatePromotionEligibility({ partner, property });
//       if (eligibilityError) {
//         throw Object.assign(new Error(eligibilityError), { http: 400 });
//       }

//       const plan = getCreditProduct(request.promotionType);
//       const now = new Date();
//       const expiresAt = plan.durationDays
//         ? new Date(now.getTime() + plan.durationDays * 24 * 60 * 60 * 1000)
//         : null;

//       if (request.promotionType === "PROPERTY_BOOST") {
//         property.promotions.boost = {
//           isActive: true,
//           approvedAt: now,
//           expiresAt,
//           requestId: request._id,
//           partnerId: partner._id,
//         };
//       }

//       if (request.promotionType === "FEATURED_7_DAYS") {
//         property.promotions.featured = {
//           isActive: true,
//           approvedAt: now,
//           expiresAt,
//           requestId: request._id,
//           partnerId: partner._id,
//         };
//       }

//       if (request.promotionType === "LOCALITY_TOP_30_DAYS") {
//         property.promotions.localityTop = {
//           isActive: true,
//           approvedAt: now,
//           expiresAt,
//           requestId: request._id,
//           partnerId: partner._id,
//           locality: property.locality || "",
//         };
//       }

//       property.promotionHistory.push({
//         requestId: request._id,
//         promotionType: request.promotionType,
//         action: "Approved",
//         credits: request.creditsCharged,
//         actor: makeActor(actor),
//         createdAt: now,
//         remarks,
//       });

//       await property.save({ session });

//       request.status = "Approved";
//       request.approvedAt = now;
//       request.expiresAt = expiresAt;
//       request.reviewedBy = makeActor(actor);
//       request.adminRemarks = remarks;
//       request.history.push({
//         status: "Approved",
//         remarks,
//         actor: makeActor(actor),
//       });
//       await request.save({ session });

//       partner.promotionStats.pendingRequests = Math.max(
//         0,
//         Number(partner.promotionStats?.pendingRequests || 0) - 1
//       );
//       partner.promotionStats.approvedRequests =
//         Number(partner.promotionStats?.approvedRequests || 0) + 1;
//       partner.promotionStats.totalPromotionCreditsSpent =
//         Number(partner.promotionStats?.totalPromotionCreditsSpent || 0) +
//         Number(request.creditsCharged || 0);
//       await partner.save({ session });
//     });

//     return res.json({
//       success: true,
//       message: "Promotion approved and is now applicable on buyer side",
//       data: { request, property, wallet: partner.creditWallet },
//     });
//   } catch (error) {
//     return res.status(error.http || 500).json({
//       success: false,
//       message: "Unable to approve promotion",
//       error: error.message,
//     });
//   } finally {
//     await session.endSession();
//   }
// };

// export const rejectPromotionRequest = async (req, res) => {
//   const session = await mongoose.startSession();

//   try {
//     const { actor = {}, remarks = "" } = req.body;
//     let request;
//     let refundResult;

//     await session.withTransaction(async () => {
//       request = await PromotionRequest.findById(req.params.id).session(session);

//       if (!request) throw Object.assign(new Error("Promotion request not found"), { http: 404 });
//       if (request.status !== "Pending") {
//         throw Object.assign(new Error("Only Pending requests can be rejected"), { http: 400 });
//       }

//       const debitTxn = await CreditTransaction.findById(
//         request.debitTransactionId
//       ).session(session);

//       if (!debitTxn) {
//         throw new Error("Original promotion debit transaction not found");
//       }

//       refundResult = await creditPartnerWallet({
//         partnerId: request.partnerMongoId,
//         credits: request.creditsCharged,
//         type: "REFUND",
//         productCode: request.promotionType,
//         referenceType: "PromotionRequest",
//         referenceId: request._id,
//         relatedTransactionId: debitTxn._id,
//         description: `Refund for rejected ${request.promotionType} request`,
//         metadata: {
//           requestId: request.requestId,
//           propertyMongoId: request.propertyMongoId,
//         },
//         actor,
//         session,
//       });

//       debitTxn.status = "REFUNDED";
//       await debitTxn.save({ session });

//       request.status = "Rejected";
//       request.rejectedAt = new Date();
//       request.reviewedBy = makeActor(actor);
//       request.adminRemarks = remarks;
//       request.refundTransactionId = refundResult.transaction._id;
//       request.history.push({
//         status: "Rejected",
//         remarks: remarks || "Rejected by admin; credits refunded",
//         actor: makeActor(actor),
//       });
//       await request.save({ session });

//       const partner = await Partner.findById(request.partnerMongoId).session(session);
//       partner.promotionStats.pendingRequests = Math.max(
//         0,
//         Number(partner.promotionStats?.pendingRequests || 0) - 1
//       );
//       partner.promotionStats.rejectedRequests =
//         Number(partner.promotionStats?.rejectedRequests || 0) + 1;
//       partner.promotionStats.totalPromotionCreditsRefunded =
//         Number(partner.promotionStats?.totalPromotionCreditsRefunded || 0) +
//         Number(request.creditsCharged || 0);
//       await partner.save({ session });
//     });

//     return res.json({
//       success: true,
//       message: "Promotion rejected and reserved credits refunded",
//       data: {
//         request,
//         refundTransaction: refundResult.transaction,
//         wallet: refundResult.partner.creditWallet,
//       },
//     });
//   } catch (error) {
//     return res.status(error.http || 500).json({
//       success: false,
//       message: "Unable to reject promotion",
//       error: error.message,
//     });
//   } finally {
//     await session.endSession();
//   }
// };

// // Use this in a cron job (e.g. hourly/daily) to switch expired flags off.
// export const expirePromotions = async (req, res) => {
//   try {
//     const now = new Date();

//     const expiredRequests = await PromotionRequest.find({
//       status: "Approved",
//       expiresAt: { $ne: null, $lte: now },
//     });

//     let expired = 0;

//     for (const request of expiredRequests) {
//       const property = await Property.findById(request.propertyMongoId);

//       if (property) {
//         if (
//           request.promotionType === "FEATURED_7_DAYS" &&
//           String(property.promotions?.featured?.requestId || "") === String(request._id)
//         ) {
//           property.promotions.featured.isActive = false;
//         }

//         if (
//           request.promotionType === "LOCALITY_TOP_30_DAYS" &&
//           String(property.promotions?.localityTop?.requestId || "") === String(request._id)
//         ) {
//           property.promotions.localityTop.isActive = false;
//         }

//         if (
//           request.promotionType === "PROPERTY_BOOST" &&
//           request.expiresAt &&
//           String(property.promotions?.boost?.requestId || "") === String(request._id)
//         ) {
//           property.promotions.boost.isActive = false;
//         }

//         await property.save();
//       }

//       request.status = "Expired";
//       request.history.push({
//         status: "Expired",
//         remarks: "Promotion expired automatically",
//         actor: { name: "System", role: "System" },
//       });
//       await request.save();
//       expired += 1;
//     }

//     return res.json({
//       success: true,
//       message: `${expired} promotions expired`,
//       expired,
//     });
//   } catch (error) {
//     return res.status(500).json({
//       success: false,
//       message: "Unable to expire promotions",
//       error: error.message,
//     });
//   }
// };

import mongoose from "mongoose";
import Partner from "../../models/Partner.js";
import Property from "../../models/NewProperty.js";
import PromotionRequest from "../../models/PromotionRequest.js";
import CreditTransaction from "../../models/CreditTransaction.js";
// import { getCreditProduct } from "../../config/creditPlans.js";
import {
  getCreditProduct,
} from "../../services/creditPricingService.js";
import {
  creditPartnerWallet,
  debitPartnerWallet,
  makeActor,
} from "../../services/creditWalletService.js";

const generateRequestId = () =>
  `PRQ-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

const validatePromotionEligibility = ({ partner, property }) => {
  if (!partner?.isVerified) return "Only verified partners can request promotions";
  if (partner?.isBlocked || partner?.isRejected) return "Blocked/rejected partner cannot request promotions";
  if (property?.status !== "Live" || property?.propertyVerificationStatus !== "Verified") {
    return "Only Live and Verified properties can be promoted";
  }
  return null;
};

const decrementSafely = (value) => Math.max(0, Number(value || 0) - 1);

export const createPromotionRequest = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    const { partnerId, propertyId, promotionType, remarks = "" } = req.body;

    if (!mongoose.Types.ObjectId.isValid(partnerId) || !mongoose.Types.ObjectId.isValid(propertyId)) {
      return res.status(400).json({ success: false, message: "Valid partnerId and propertyId are required" });
    }

    const plan = getCreditProduct(promotionType);
    if (!plan || promotionType === "LEAD_UNLOCK") {
      return res.status(400).json({ success: false, message: "Invalid promotionType" });
    }

    const [partner, property] = await Promise.all([
      Partner.findById(partnerId),
      Property.findById(propertyId),
    ]);

    if (!partner) return res.status(404).json({ success: false, message: "Partner not found" });
    if (!property) return res.status(404).json({ success: false, message: "Property not found" });

    const eligibilityError = validatePromotionEligibility({ partner, property });
    if (eligibilityError) return res.status(400).json({ success: false, message: eligibilityError });

    const duplicate = await PromotionRequest.findOne({
      partnerMongoId: partner._id,
      propertyMongoId: property._id,
      promotionType,
      status: { $in: ["Pending", "Approved"] },
      $or: [{ expiresAt: null }, { expiresAt: { $gt: new Date() } }],
    });

    if (duplicate) {
      return res.status(409).json({
        success: false,
        message: "A pending/active request of this type already exists for this partner and property",
        data: duplicate,
      });
    }

    const actor = { userId: partner._id, name: partner.name || "Partner", role: "Partner" };
    let promotionRequest;
    let debitResult;

    await session.withTransaction(async () => {
      debitResult = await debitPartnerWallet({
        partnerId: partner._id,
        credits: plan.credits,
        type: "PROMOTION_DEBIT",
        productCode: promotionType,
        referenceType: "PromotionRequest",
        description: `${plan.label} request - credits reserved pending admin approval`,
        metadata: { propertyMongoId: property._id, propertyCode: property.propertyId },
        actor,
        session,
      });

      [promotionRequest] = await PromotionRequest.create([
        {
          requestId: generateRequestId(),
          partnerMongoId: partner._id,
          partnerCode: partner.partnerId || "",
          partnerName: partner.name || "",
          propertyMongoId: property._id,
          propertyCode: property.propertyId || "",
          propertyTitle: property.title || "",
          locality: property.locality || "",
          city: property.city || "",
          promotionType,
          creditsCharged: plan.credits,
          debitTransactionId: debitResult.transaction._id,
          status: "Pending",
          requestedAt: new Date(),
          requestedBy: makeActor(actor),
          history: [{ status: "Pending", remarks: remarks || `${plan.label} requested`, actor: makeActor(actor) }],
        },
      ], { session });

      debitResult.transaction.referenceId = promotionRequest._id;
      await debitResult.transaction.save({ session });

      await Partner.updateOne(
        { _id: partner._id },
        {
          $inc: { "promotionStats.totalRequests": 1, "promotionStats.pendingRequests": 1 },
          $push: {
            promotionRequests: {
              requestId: promotionRequest._id,
              requestCode: promotionRequest.requestId,
              propertyMongoId: property._id,
              propertyCode: property.propertyId || "",
              propertyTitle: property.title || "",
              promotionType,
              creditsCharged: plan.credits,
              status: "Pending",
              requestedAt: promotionRequest.requestedAt,
            },
          },
        },
        { session }
      );

      await Property.updateOne(
        { _id: property._id },
        {
          $push: {
            promotionRequests: {
              requestId: promotionRequest._id,
              requestCode: promotionRequest.requestId,
              partnerMongoId: partner._id,
              partnerCode: partner.partnerId || "",
              partnerName: partner.name || "",
              promotionType,
              creditsCharged: plan.credits,
              status: "Pending",
              requestedAt: promotionRequest.requestedAt,
            },
          },
        },
        { session }
      );
    });

    const [updatedPartner, updatedProperty] = await Promise.all([
      Partner.findById(partner._id).select("partnerId name creditWallet promotionStats promotionRequests").lean(),
      Property.findById(property._id).select("propertyId title promotionRequests promotions").lean(),
    ]);

    return res.status(201).json({
      success: true,
      message: "Promotion request submitted. Credits reserved; promotion becomes live only after admin approval.",
      data: { request: promotionRequest, partner: updatedPartner, property: updatedProperty, wallet: updatedPartner?.creditWallet, debitTransaction: debitResult.transaction },
    });
  } catch (error) {
    const status = error.code === "INSUFFICIENT_CREDITS" ? 400 : 500;
    return res.status(status).json({ success: false, message: "Unable to create promotion request", error: error.message });
  } finally {
    await session.endSession();
  }
};

export const getPromotionRequests = async (req, res) => {
  try {
    const { status, promotionType, partnerId, propertyId, search = "" } = req.query;
    const query = {};
    if (status && status !== "All") query.status = status;
    if (promotionType && promotionType !== "All") query.promotionType = promotionType;
    if (partnerId && mongoose.Types.ObjectId.isValid(partnerId)) query.partnerMongoId = partnerId;
    if (propertyId && mongoose.Types.ObjectId.isValid(propertyId)) query.propertyMongoId = propertyId;
    if (search.trim()) {
      const regex = new RegExp(search.trim(), "i");
      query.$or = [
        { requestId: regex }, { propertyCode: regex }, { propertyTitle: regex },
        { partnerCode: regex }, { partnerName: regex }, { city: regex }, { locality: regex },
      ];
    }

    const data = await PromotionRequest.find(query)
      .populate("partnerMongoId", "partnerId name email phone partnerType isVerified isBlocked creditWallet promotionStats")
      .populate("propertyMongoId", "propertyId title status propertyVerificationStatus city locality price images promotions promotionRequests")
      .sort({ createdAt: -1 })
      .lean();

    return res.json({ success: true, count: data.length, data });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Unable to fetch promotion requests", error: error.message });
  }
};

export const approvePromotionRequest = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    const { actor = {}, remarks = "" } = req.body;
    let request, property, partner;

    await session.withTransaction(async () => {
      request = await PromotionRequest.findById(req.params.id).session(session);
      if (!request) throw Object.assign(new Error("Promotion request not found"), { http: 404 });
      if (request.status !== "Pending") throw Object.assign(new Error("Only Pending requests can be approved"), { http: 400 });

      [partner, property] = await Promise.all([
        Partner.findById(request.partnerMongoId).session(session),
        Property.findById(request.propertyMongoId).session(session),
      ]);
      if (!partner || !property) throw Object.assign(new Error("Partner or property no longer exists"), { http: 404 });

      const eligibilityError = validatePromotionEligibility({ partner, property });
      if (eligibilityError) throw Object.assign(new Error(eligibilityError), { http: 400 });

      const plan = getCreditProduct(request.promotionType);
      const now = new Date();
      const expiresAt = plan.durationDays ? new Date(now.getTime() + plan.durationDays * 86400000) : null;

      if (request.promotionType === "PROPERTY_BOOST") {
        property.promotions.boost = { isActive: true, approvedAt: now, expiresAt, requestId: request._id, partnerId: partner._id };
      } else if (request.promotionType === "FEATURED_7_DAYS") {
        property.promotions.featured = { isActive: true, approvedAt: now, expiresAt, requestId: request._id, partnerId: partner._id };
      } else if (request.promotionType === "LOCALITY_TOP_30_DAYS") {
        property.promotions.localityTop = { isActive: true, approvedAt: now, expiresAt, requestId: request._id, partnerId: partner._id, locality: property.locality || "" };
      }

      property.promotionHistory.push({
        requestId: request._id,
        promotionType: request.promotionType,
        action: "Approved",
        credits: request.creditsCharged,
        actor: makeActor(actor),
        createdAt: now,
        remarks,
      });

      const propertySnapshot = property.promotionRequests?.find((x) => String(x.requestId) === String(request._id));
      if (propertySnapshot) {
        propertySnapshot.status = "Approved";
        propertySnapshot.approvedAt = now;
        propertySnapshot.expiresAt = expiresAt;
        propertySnapshot.adminRemarks = remarks;
      }
      await property.save({ session });

      request.status = "Approved";
      request.approvedAt = now;
      request.expiresAt = expiresAt;
      request.reviewedBy = makeActor(actor);
      request.adminRemarks = remarks;
      request.history.push({ status: "Approved", remarks: remarks || "Approved by admin", actor: makeActor(actor) });
      await request.save({ session });

      const partnerSnapshot = partner.promotionRequests?.find((x) => String(x.requestId) === String(request._id));
      if (partnerSnapshot) {
        partnerSnapshot.status = "Approved";
        partnerSnapshot.approvedAt = now;
        partnerSnapshot.expiresAt = expiresAt;
        partnerSnapshot.adminRemarks = remarks;
      }
      partner.promotionStats.pendingRequests = decrementSafely(partner.promotionStats?.pendingRequests);
      partner.promotionStats.approvedRequests = Number(partner.promotionStats?.approvedRequests || 0) + 1;
      partner.promotionStats.totalPromotionCreditsSpent = Number(partner.promotionStats?.totalPromotionCreditsSpent || 0) + Number(request.creditsCharged || 0);
      await partner.save({ session });
    });

    return res.json({ success: true, message: "Promotion approved and is now live on buyer side", data: { request, property, partner, wallet: partner.creditWallet } });
  } catch (error) {
    return res.status(error.http || 500).json({ success: false, message: "Unable to approve promotion", error: error.message });
  } finally {
    await session.endSession();
  }
};

export const rejectPromotionRequest = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    const { actor = {}, remarks = "" } = req.body;
    let request, refundResult;

    await session.withTransaction(async () => {
      request = await PromotionRequest.findById(req.params.id).session(session);
      if (!request) throw Object.assign(new Error("Promotion request not found"), { http: 404 });
      if (request.status !== "Pending") throw Object.assign(new Error("Only Pending requests can be rejected"), { http: 400 });

      const debitTxn = await CreditTransaction.findById(request.debitTransactionId).session(session);
      if (!debitTxn) throw new Error("Original promotion debit transaction not found");

      refundResult = await creditPartnerWallet({
        partnerId: request.partnerMongoId,
        credits: request.creditsCharged,
        type: "REFUND",
        productCode: request.promotionType,
        referenceType: "PromotionRequest",
        referenceId: request._id,
        relatedTransactionId: debitTxn._id,
        description: `Refund for rejected ${request.promotionType} request`,
        metadata: { requestId: request.requestId, propertyMongoId: request.propertyMongoId },
        actor,
        session,
      });

      debitTxn.status = "REFUNDED";
      await debitTxn.save({ session });

      const now = new Date();
      request.status = "Rejected";
      request.rejectedAt = now;
      request.reviewedBy = makeActor(actor);
      request.adminRemarks = remarks;
      request.refundTransactionId = refundResult.transaction._id;
      request.history.push({ status: "Rejected", remarks: remarks || "Rejected by admin; credits refunded", actor: makeActor(actor) });
      await request.save({ session });

      const partner = await Partner.findById(request.partnerMongoId).session(session);
      if (partner) {
        const snap = partner.promotionRequests?.find((x) => String(x.requestId) === String(request._id));
        if (snap) { snap.status = "Rejected"; snap.rejectedAt = now; snap.adminRemarks = remarks; }
        partner.promotionStats.pendingRequests = decrementSafely(partner.promotionStats?.pendingRequests);
        partner.promotionStats.rejectedRequests = Number(partner.promotionStats?.rejectedRequests || 0) + 1;
        partner.promotionStats.totalPromotionCreditsRefunded = Number(partner.promotionStats?.totalPromotionCreditsRefunded || 0) + Number(request.creditsCharged || 0);
        await partner.save({ session });
      }

      const property = await Property.findById(request.propertyMongoId).session(session);
      if (property) {
        const snap = property.promotionRequests?.find((x) => String(x.requestId) === String(request._id));
        if (snap) { snap.status = "Rejected"; snap.rejectedAt = now; snap.adminRemarks = remarks; }
        property.promotionHistory.push({ requestId: request._id, promotionType: request.promotionType, action: "Rejected", credits: request.creditsCharged, actor: makeActor(actor), createdAt: now, remarks });
        await property.save({ session });
      }
    });

    return res.json({ success: true, message: "Promotion rejected and reserved credits refunded", data: { request, refundTransaction: refundResult.transaction, wallet: refundResult.partner.creditWallet } });
  } catch (error) {
    return res.status(error.http || 500).json({ success: false, message: "Unable to reject promotion", error: error.message });
  } finally {
    await session.endSession();
  }
};

export const expirePromotions = async (req, res) => {
  try {
    const now = new Date();
    const expiredRequests = await PromotionRequest.find({ status: "Approved", expiresAt: { $ne: null, $lte: now } });
    let expired = 0;

    for (const request of expiredRequests) {
      const [property, partner] = await Promise.all([
        Property.findById(request.propertyMongoId),
        Partner.findById(request.partnerMongoId),
      ]);

      if (property) {
        if (request.promotionType === "FEATURED_7_DAYS" && String(property.promotions?.featured?.requestId || "") === String(request._id)) property.promotions.featured.isActive = false;
        if (request.promotionType === "LOCALITY_TOP_30_DAYS" && String(property.promotions?.localityTop?.requestId || "") === String(request._id)) property.promotions.localityTop.isActive = false;
        if (request.promotionType === "PROPERTY_BOOST" && request.expiresAt && String(property.promotions?.boost?.requestId || "") === String(request._id)) property.promotions.boost.isActive = false;
        const snap = property.promotionRequests?.find((x) => String(x.requestId) === String(request._id));
        if (snap) snap.status = "Expired";
        property.promotionHistory.push({ requestId: request._id, promotionType: request.promotionType, action: "Expired", credits: request.creditsCharged, actor: { name: "System", role: "System" }, createdAt: now, remarks: "Promotion expired automatically" });
        await property.save();
      }

      if (partner) {
        const snap = partner.promotionRequests?.find((x) => String(x.requestId) === String(request._id));
        if (snap) snap.status = "Expired";
        partner.promotionStats.expiredRequests = Number(partner.promotionStats?.expiredRequests || 0) + 1;
        await partner.save();
      }

      request.status = "Expired";
      request.history.push({ status: "Expired", remarks: "Promotion expired automatically", actor: { name: "System", role: "System" } });
      await request.save();
      expired += 1;
    }

    return res.json({ success: true, message: `${expired} promotions expired`, expired });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Unable to expire promotions", error: error.message });
  }
};
