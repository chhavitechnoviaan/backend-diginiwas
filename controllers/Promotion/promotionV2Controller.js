import mongoose from "mongoose";
import Partner from "../../models/Partner.js";
import Property from "../../models/NewProperty.js";
import PromotionRequest from "../../models/PromotionRequest.js";
import CreditTransaction from "../../models/CreditTransaction.js";
import { getCreditProduct } from "../../services/creditPricingService.js";
import { creditPartnerWallet, debitPartnerWallet, makeActor } from "../../services/creditWalletService.js";
import { notifyAdmins } from "../../services/adminNotificationService.js";

const PARTNER_TYPE_MAP = {
  BOOST: "PARTNER_BOOST",
  PROPERTY_BOOST: "PARTNER_BOOST",
  PARTNER_BOOST: "PARTNER_BOOST",
  FEATURED_7_DAYS: "PARTNER_FEATURED",
  PARTNER_FEATURED: "PARTNER_FEATURED",
  LOCALITY_TOP_30_DAYS: "PARTNER_LOCALITY_TOP",
  PARTNER_LOCALITY_TOP: "PARTNER_LOCALITY_TOP",
};

const PROPERTY_TYPES = new Set(["PROPERTY_BOOST", "FEATURED_7_DAYS", "LOCALITY_TOP_30_DAYS"]);
const generateRequestId = () => `PRQ-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
const decrement = (value) => Math.max(0, Number(value || 0) - 1);
const targetTypeOf = (request) => request.targetType || (request.propertyMongoId ? "PROPERTY" : "PARTNER");

const adminActor = (req) => makeActor({
  userId: req.user?.id || null,
  name: "DigiNiwas Admin",
  role: "admin",
});

const isOwnerOfProperty = (partner, property) => {
  const assignedId = property?.assignedPartner?.partnerId;
  const addedId = property?.addedBy?.userId;
  return Boolean(
    (assignedId && String(assignedId) === String(partner._id)) ||
    (property?.assignedPartner?.partnerCode && property.assignedPartner.partnerCode === partner.partnerId) ||
    (property?.addedBy?.role === "Partner" && addedId && String(addedId) === String(partner._id)) ||
    (property?.addedBy?.role === "Partner" && property?.addedBy?.partnerId === partner.partnerId)
  );
};

const normalizePromotion = (targetType, rawType) => {
  const type = String(rawType || "").trim().toUpperCase();
  if (targetType === "PARTNER") return PARTNER_TYPE_MAP[type] || null;
  return PROPERTY_TYPES.has(type) ? type : null;
};

const partnerEligibilityError = (partner) => {
  if (!partner?.isApproved || !partner?.isVerified || partner?.applicationStatus !== "Verified") return "Only approved and verified partners can request promotions";
  if (partner?.isBlocked || partner?.isRejected) return "Blocked or rejected partner cannot request promotions";
  if (partner.accountType === "subagent" || partner.isSubPartner) return "Sub-Agent cannot create a promotion request directly; use the Agency Owner account";
  return null;
};

const setPromotionActive = (target, request, expiresAt) => {
  const value = {
    isActive: true,
    activatedAt: new Date(),
    approvedAt: new Date(),
    expiresAt,
    requestId: request._id,
    transactionId: request.debitTransactionId,
    partnerId: request.partnerMongoId,
  };
  if (["PARTNER_BOOST", "PROPERTY_BOOST"].includes(request.promotionType)) target.promotions.boost = value;
  if (["PARTNER_FEATURED", "FEATURED_7_DAYS"].includes(request.promotionType)) target.promotions.featured = value;
  if (["PARTNER_LOCALITY_TOP", "LOCALITY_TOP_30_DAYS"].includes(request.promotionType)) {
    target.promotions.localityTop = { ...value, locality: request.locality || target.location?.city || "" };
  }
};

const deactivatePromotion = (target, request) => {
  const key = ["PARTNER_BOOST", "PROPERTY_BOOST"].includes(request.promotionType)
    ? "boost"
    : ["PARTNER_FEATURED", "FEATURED_7_DAYS"].includes(request.promotionType)
      ? "featured"
      : "localityTop";
  if (String(target.promotions?.[key]?.requestId || "") === String(request._id)) {
    target.promotions[key].isActive = false;
  }
};

export const createPromotionRequest = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    const partnerId = req.body.partnerId || req.user?.id;
    const targetType = String(req.body.targetType || (req.body.propertyId ? "PROPERTY" : "PARTNER")).toUpperCase();
    const promotionType = normalizePromotion(targetType, req.body.promotionType);
    const remarks = String(req.body.remarks || "").trim();

    if (!["PARTNER", "PROPERTY"].includes(targetType)) return res.status(400).json({ success: false, message: "targetType must be PARTNER or PROPERTY" });
    if (!mongoose.Types.ObjectId.isValid(partnerId)) return res.status(400).json({ success: false, message: "Valid partnerId is required" });
    if (!promotionType) return res.status(400).json({ success: false, message: `Invalid promotionType for ${targetType} promotion` });
    if (String(req.user?.role || "").toLowerCase() !== "admin" && String(req.user?.id || "") !== String(partnerId)) {
      return res.status(403).json({ success: false, message: "You can create promotions only for your own partner account" });
    }

    const partner = await Partner.findById(partnerId);
    if (!partner) return res.status(404).json({ success: false, message: "Partner not found" });
    const partnerError = partnerEligibilityError(partner);
    if (partnerError) return res.status(400).json({ success: false, message: partnerError });

    let property = null;
    if (targetType === "PROPERTY") {
      if (!mongoose.Types.ObjectId.isValid(req.body.propertyId)) return res.status(400).json({ success: false, message: "Valid propertyId is required for PROPERTY promotion" });
      property = await Property.findById(req.body.propertyId);
      if (!property) return res.status(404).json({ success: false, message: "Property not found" });
      if (property.status !== "Live" || property.propertyVerificationStatus !== "Verified") return res.status(400).json({ success: false, message: "Only Live and Verified properties can be promoted" });
      if (!isOwnerOfProperty(partner, property)) return res.status(403).json({ success: false, message: "Partner can promote only a property created by or assigned to them" });
    }

    const plan = await getCreditProduct(promotionType);
    if (!plan) return res.status(400).json({ success: false, message: "Promotion pricing is inactive or missing" });

    const duplicateQuery = {
      targetType,
      partnerMongoId: partner._id,
      propertyMongoId: targetType === "PROPERTY" ? property._id : null,
      promotionType,
      status: { $in: ["Pending", "Approved"] },
      $or: [{ expiresAt: null }, { expiresAt: { $gt: new Date() } }],
    };
    const duplicate = await PromotionRequest.findOne(duplicateQuery);
    if (duplicate) return res.status(409).json({ success: false, message: "A pending or active promotion of this type already exists", data: duplicate });

    const actor = makeActor({ userId: partner._id, name: partner.name, role: partner.role || "Partner" });
    let request;
    let debitResult;
    await session.withTransaction(async () => {
      debitResult = await debitPartnerWallet({
        partnerId: partner._id,
        credits: plan.credits,
        type: "PROMOTION_DEBIT",
        productCode: promotionType,
        referenceType: "PromotionRequest",
        description: `${plan.label} request - credits reserved pending admin approval`,
        metadata: { targetType, propertyMongoId: property?._id || null, propertyCode: property?.propertyId || "" },
        actor,
        idempotencyKey: String(req.body.idempotencyKey || "").trim(),
        session,
      });
      if (debitResult.duplicate) {
        throw Object.assign(new Error("This promotion request was already processed"), { http: 409 });
      }

      [request] = await PromotionRequest.create([{
        requestId: generateRequestId(),
        targetType,
        partnerMongoId: partner._id,
        partnerCode: partner.partnerId || "",
        partnerName: partner.name || "",
        propertyMongoId: property?._id || null,
        propertyCode: property?.propertyId || "",
        propertyTitle: property?.title || "",
        locality: targetType === "PROPERTY" ? property?.locality || "" : req.body.locality || partner.location?.city || "",
        city: targetType === "PROPERTY" ? property?.city || "" : partner.location?.city || "",
        promotionType,
        creditsCharged: plan.credits,
        debitTransactionId: debitResult.transaction._id,
        requestedBy: actor,
        history: [{ status: "Pending", remarks: remarks || `${plan.label} requested`, actor }],
      }], { session });

      debitResult.transaction.referenceId = request._id;
      await debitResult.transaction.save({ session });

      const snapshot = {
        requestId: request._id, requestCode: request.requestId, targetType,
        propertyMongoId: property?._id || null, propertyCode: property?.propertyId || "", propertyTitle: property?.title || "",
        promotionType, creditsCharged: plan.credits, status: "Pending", requestedAt: request.requestedAt,
      };
      await Partner.updateOne({ _id: partner._id }, {
        $inc: { "promotionStats.totalRequests": 1, "promotionStats.pendingRequests": 1 },
        $push: { promotionRequests: snapshot },
      }, { session });

      if (property) {
        await Property.updateOne({ _id: property._id }, { $push: { promotionRequests: {
          requestId: request._id, requestCode: request.requestId, partnerMongoId: partner._id,
          partnerCode: partner.partnerId || "", partnerName: partner.name || "", promotionType,
          creditsCharged: plan.credits, status: "Pending", requestedAt: request.requestedAt,
        } } }, { session });
      }
    });

    const promotionTab = promotionType.includes("LOCALITY_TOP")
      ? "locality"
      : promotionType.includes("FEATURED")
        ? "featured"
        : "boost";
    const promotionLabel = promotionType.replaceAll("_", " ").toLowerCase();
    await notifyAdmins({
      title: "New promotion approval request",
      message: `${partner.name || partner.partnerId} requested ${promotionLabel} for ${targetType.toLowerCase()} promotion.`,
      type: "PROMOTION_REQUEST",
      actionUrl: `/credits?tab=${promotionTab}&requestId=${request._id}`,
      entityType: "PromotionRequest",
      entityId: request._id,
      data: { requestId: request.requestId, promotionType, targetType, partnerMongoId: partner._id },
    });

    return res.status(201).json({
      success: true,
      message: `${targetType} promotion request submitted; ${plan.credits} credits reserved`,
      data: { request, wallet: debitResult.wallet, debitTransaction: debitResult.transaction },
    });
  } catch (error) {
    const status = error.http || (error.code === "INSUFFICIENT_CREDITS" ? 400 : 500);
    return res.status(status).json({ success: false, message: "Unable to create promotion request", error: error.message });
  } finally { await session.endSession(); }
};

const listRequests = async (req, res, forcePartner = false) => {
  try {
    const page = Math.max(Number(req.query.page || 1), 1);
    const limit = Math.min(Math.max(Number(req.query.limit || 20), 1), 100);
    const query = {};
    if (req.query.status && req.query.status !== "All") query.status = req.query.status;
    if (req.query.targetType && req.query.targetType !== "All") query.targetType = String(req.query.targetType).toUpperCase();
    if (req.query.promotionType && req.query.promotionType !== "All") query.promotionType = req.query.promotionType;
    const partnerId = forcePartner ? req.user?.id : req.query.partnerId;
    if (partnerId && mongoose.Types.ObjectId.isValid(partnerId)) query.partnerMongoId = partnerId;
    if (req.query.propertyId && mongoose.Types.ObjectId.isValid(req.query.propertyId)) query.propertyMongoId = req.query.propertyId;
    if (req.query.search) {
      const regex = new RegExp(String(req.query.search).trim(), "i");
      query.$or = [{ requestId: regex }, { partnerCode: regex }, { partnerName: regex }, { propertyCode: regex }, { propertyTitle: regex }, { city: regex }, { locality: regex }];
    }
    const [data, total] = await Promise.all([
      PromotionRequest.find(query)
        .populate("partnerMongoId", "partnerId name email phone accountType isVerified promotions creditWallet")
        .populate("propertyMongoId", "propertyId title status propertyVerificationStatus city locality price images promotions")
        .sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
      PromotionRequest.countDocuments(query),
    ]);
    return res.json({ success: true, count: data.length, data, pagination: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) } });
  } catch (error) { return res.status(500).json({ success: false, message: "Unable to fetch promotion requests", error: error.message }); }
};

export const getPromotionRequests = (req, res) => listRequests(req, res, false);
export const getMyPromotionRequests = (req, res) => listRequests(req, res, true);

export const approvePromotionRequest = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    let request;
    let target;
    await session.withTransaction(async () => {
      request = await PromotionRequest.findById(req.params.id).session(session);
      if (!request) throw Object.assign(new Error("Promotion request not found"), { http: 404 });
      if (request.status !== "Pending") throw Object.assign(new Error("Only Pending requests can be approved"), { http: 400 });
      const partner = await Partner.findById(request.partnerMongoId).session(session);
      if (!partner) throw Object.assign(new Error("Partner not found"), { http: 404 });
      const eligibilityError = partnerEligibilityError(partner);
      if (eligibilityError) throw Object.assign(new Error(eligibilityError), { http: 400 });
      request.targetType = targetTypeOf(request);
      target = request.targetType === "PROPERTY" ? await Property.findById(request.propertyMongoId).session(session) : partner;
      if (!target) throw Object.assign(new Error(`${request.targetType} target not found`), { http: 404 });
      if (request.targetType === "PROPERTY" && (target.status !== "Live" || target.propertyVerificationStatus !== "Verified")) throw Object.assign(new Error("Property is no longer Live and Verified"), { http: 400 });
      const plan = await getCreditProduct(request.promotionType);
      if (!plan) throw Object.assign(new Error("Promotion pricing is inactive or missing"), { http: 400 });
      const now = new Date();
      const expiresAt = plan.durationDays ? new Date(now.getTime() + Number(plan.durationDays) * 86400000) : null;
      setPromotionActive(target, request, expiresAt);

      request.status = "Approved"; request.approvedAt = now; request.expiresAt = expiresAt;
      request.reviewedBy = adminActor(req); request.adminRemarks = String(req.body.remarks || "");
      request.history.push({ status: "Approved", remarks: request.adminRemarks || "Approved by admin", actor: adminActor(req) });
      await request.save({ session });

      const partnerSnapshot = partner.promotionRequests.find((x) => String(x.requestId) === String(request._id));
      if (partnerSnapshot) { partnerSnapshot.status = "Approved"; partnerSnapshot.approvedAt = now; partnerSnapshot.expiresAt = expiresAt; partnerSnapshot.adminRemarks = request.adminRemarks; }
      partner.promotionStats.pendingRequests = decrement(partner.promotionStats.pendingRequests);
      partner.promotionStats.approvedRequests = Number(partner.promotionStats.approvedRequests || 0) + 1;
      partner.promotionStats.totalPromotionCreditsSpent = Number(partner.promotionStats.totalPromotionCreditsSpent || 0) + Number(request.creditsCharged || 0);
      partner.promotionHistory.push({ requestId: request._id, targetType: request.targetType, promotionType: request.promotionType, action: "Approved", credits: request.creditsCharged, actor: adminActor(req), remarks: request.adminRemarks });
      await partner.save({ session });

      if (request.targetType === "PROPERTY") {
        const snap = target.promotionRequests.find((x) => String(x.requestId) === String(request._id));
        if (snap) { snap.status = "Approved"; snap.approvedAt = now; snap.expiresAt = expiresAt; snap.adminRemarks = request.adminRemarks; }
        target.promotionHistory.push({ requestId: request._id, promotionType: request.promotionType, action: "Approved", credits: request.creditsCharged, actor: adminActor(req), remarks: request.adminRemarks });
        await target.save({ session });
      }
    });
    return res.json({ success: true, message: `${request.targetType} promotion approved and activated`, data: { request, target } });
  } catch (error) { return res.status(error.http || 500).json({ success: false, message: "Unable to approve promotion", error: error.message }); }
  finally { await session.endSession(); }
};

export const rejectPromotionRequest = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    let request;
    const refundResults = [];
    await session.withTransaction(async () => {
      request = await PromotionRequest.findById(req.params.id).session(session);
      if (!request) throw Object.assign(new Error("Promotion request not found"), { http: 404 });
      if (request.status !== "Pending") throw Object.assign(new Error("Only Pending requests can be rejected"), { http: 400 });
      request.targetType = targetTypeOf(request);
      const debit = await CreditTransaction.findById(request.debitTransactionId).session(session);
      if (!debit) throw new Error("Original promotion debit transaction not found");
      const paidCredits = Number(debit.paidCredits || 0);
      const promotionalCredits = Number(debit.promotionalCredits || 0);
      const refundParts = (paidCredits || promotionalCredits)
        ? [{ credits: paidCredits, bucket: "PAID" }, { credits: promotionalCredits, bucket: "PROMOTIONAL" }]
        : [{ credits: request.creditsCharged, bucket: debit.creditBucket === "PROMOTIONAL" ? "PROMOTIONAL" : "PAID" }];
      for (const part of refundParts.filter((item) => item.credits > 0)) {
        const result = await creditPartnerWallet({
          partnerId: request.partnerMongoId, credits: part.credits, type: "REFUND", bucket: part.bucket,
          productCode: request.promotionType, referenceType: "PromotionRequest", referenceId: request._id,
          relatedTransactionId: debit._id, description: `Refund for rejected ${request.promotionType}`,
          metadata: { targetType: request.targetType, propertyMongoId: request.propertyMongoId, refundedBucket: part.bucket },
          actor: adminActor(req), session,
        });
        refundResults.push(result);
      }
      debit.status = "REFUNDED"; await debit.save({ session });
      const now = new Date();
      request.status = "Rejected"; request.rejectedAt = now;
      request.refundTransactionId = refundResults[0]?.transaction?._id || null;
      request.refundTransactionIds = refundResults.map((item) => item.transaction._id);
      request.reviewedBy = adminActor(req); request.adminRemarks = String(req.body.remarks || "");
      request.history.push({ status: "Rejected", remarks: request.adminRemarks || "Rejected by admin; credits refunded", actor: adminActor(req) });
      await request.save({ session });
      const partner = await Partner.findById(request.partnerMongoId).session(session);
      if (partner) {
        const snap = partner.promotionRequests.find((x) => String(x.requestId) === String(request._id));
        if (snap) { snap.status = "Rejected"; snap.rejectedAt = now; snap.adminRemarks = request.adminRemarks; }
        partner.promotionStats.pendingRequests = decrement(partner.promotionStats.pendingRequests);
        partner.promotionStats.rejectedRequests = Number(partner.promotionStats.rejectedRequests || 0) + 1;
        partner.promotionStats.totalPromotionCreditsRefunded = Number(partner.promotionStats.totalPromotionCreditsRefunded || 0) + Number(request.creditsCharged || 0);
        partner.promotionHistory.push({ requestId: request._id, targetType: request.targetType, promotionType: request.promotionType, action: "Rejected", credits: request.creditsCharged, actor: adminActor(req), remarks: request.adminRemarks });
        await partner.save({ session });
      }
      if (request.targetType === "PROPERTY") {
        const property = await Property.findById(request.propertyMongoId).session(session);
        if (property) {
          const snap = property.promotionRequests.find((x) => String(x.requestId) === String(request._id));
          if (snap) { snap.status = "Rejected"; snap.rejectedAt = now; snap.adminRemarks = request.adminRemarks; }
          property.promotionHistory.push({ requestId: request._id, promotionType: request.promotionType, action: "Rejected", credits: request.creditsCharged, actor: adminActor(req), remarks: request.adminRemarks });
          await property.save({ session });
        }
      }
    });
    return res.json({ success: true, message: "Promotion rejected and credits refunded", data: {
      request,
      wallet: refundResults.at(-1)?.wallet,
      refundTransactions: refundResults.map((item) => item.transaction),
    } });
  } catch (error) { return res.status(error.http || 500).json({ success: false, message: "Unable to reject promotion", error: error.message }); }
  finally { await session.endSession(); }
};

export const expirePromotions = async (_req, res) => {
  try {
    const now = new Date();
    const requests = await PromotionRequest.find({ status: "Approved", expiresAt: { $ne: null, $lte: now } });
    let expired = 0;
    for (const request of requests) {
      request.targetType = targetTypeOf(request);
      const partner = await Partner.findById(request.partnerMongoId);
      const target = request.targetType === "PROPERTY" ? await Property.findById(request.propertyMongoId) : partner;
      if (target) deactivatePromotion(target, request);
      if (partner) {
        const snap = partner.promotionRequests.find((x) => String(x.requestId) === String(request._id));
        if (snap) snap.status = "Expired";
        partner.promotionStats.expiredRequests = Number(partner.promotionStats.expiredRequests || 0) + 1;
        partner.promotionHistory.push({ requestId: request._id, targetType: request.targetType, promotionType: request.promotionType, action: "Expired", credits: request.creditsCharged, actor: { name: "System", role: "System" }, remarks: "Promotion expired automatically" });
        await partner.save();
      }
      if (request.targetType === "PROPERTY" && target) {
        const snap = target.promotionRequests.find((x) => String(x.requestId) === String(request._id));
        if (snap) snap.status = "Expired";
        target.promotionHistory.push({ requestId: request._id, promotionType: request.promotionType, action: "Expired", credits: request.creditsCharged, actor: { name: "System", role: "System" }, remarks: "Promotion expired automatically" });
        await target.save();
      }
      request.status = "Expired";
      request.history.push({ status: "Expired", remarks: "Promotion expired automatically", actor: { name: "System", role: "System" } });
      await request.save(); expired += 1;
    }
    return res.json({ success: true, message: `${expired} partner/property promotions expired`, expired });
  } catch (error) { return res.status(500).json({ success: false, message: "Unable to expire promotions", error: error.message }); }
};
