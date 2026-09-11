// import mongoose from "mongoose";

// import Lead, { LEAD_STATUSES } from "../../models/Lead.js";

// import Property from "../../models/NewProperty.js";
// import Partner from "../../models/Partner.js";
// // import { CREDIT_PRODUCTS } from "../../config/creditPlans.js";
// import { getCreditProduct } from "../../services/creditPricingService.js";
// import { debitPartnerWallet } from "../../services/creditWalletService.js";
// const ACTIVE_DUPLICATE_STATUSES = [
//   "Lead_Created",
//   "Lead_Assigned",
//   "Lead_Viewed",
//   "Lead_Reviewing",
// ];

// const makeActor = (value = {}) => ({
//   userId:
//     value?.userId && mongoose.Types.ObjectId.isValid(value.userId)
//       ? value.userId
//       : null,
//   name: value?.name || "System",
//   role: value?.role || "Admin",
// });

// const generateLeadId = async () => {
//   for (let attempt = 0; attempt < 10; attempt += 1) {
//     const value = `LD-${Math.floor(100000 + Math.random() * 900000)}`;

//     const exists = await Lead.exists({
//       leadId: value,
//     });

//     if (!exists) {
//       return value;
//     }
//   }

//   return `LD-${Date.now().toString().slice(-8)}`;
// };

// const findProperty = async (propertyId) => {
//   if (!propertyId) {
//     return null;
//   }

//   if (mongoose.Types.ObjectId.isValid(propertyId)) {
//     const byMongoId = await Property.findById(propertyId).lean();

//     if (byMongoId) {
//       return byMongoId;
//     }
//   }

//   return Property.findOne({
//     propertyId,
//   }).lean();
// };

// const buildPropertySnapshot = (property) => {
//   const sellerMongoId =
//     property?.addedBy?.role === "Seller" &&
//     mongoose.Types.ObjectId.isValid(property?.addedBy?.userId)
//       ? property.addedBy.userId
//       : null;

//   return {
//     propertyMongoId: property._id,

//     propertyCode: property.propertyId || "",

//     title: property.title || property.projectName || "",

//     city: property.city || "",

//     locality: property.locality || "",

//     address: property.address || "",

//     price: Number(property.price || 0),

//     image: property?.images?.[0]?.url || "",

//     addedByRole: property?.addedBy?.role || "",

//     addedByUserId: mongoose.Types.ObjectId.isValid(property?.addedBy?.userId)
//       ? property.addedBy.userId
//       : null,

//     addedByName: property?.addedBy?.name || "",

//     sellerMongoId,

//     sellerCode: property?.addedBy?.sellerId || "",

//     sellerName:
//       property?.addedBy?.role === "Seller" ? property?.addedBy?.name || "" : "",
//   };
// };

// const buildAssignedPartnerFromProperty = async (property) => {
//   const propertyPartner = property?.assignedPartner;

//   const partnerMongoId =
//     propertyPartner?.partnerId?._id || propertyPartner?.partnerId || null;

//   if (!partnerMongoId || !mongoose.Types.ObjectId.isValid(partnerMongoId)) {
//     return null;
//   }

//   const partner = await Partner.findById(partnerMongoId).lean();

//   return {
//     partnerMongoId,
//     partnerCode: partner?.partnerId || propertyPartner?.partnerCode || "",
//     name: partner?.name || propertyPartner?.name || "",
//     phone: partner?.phone || propertyPartner?.phone || "",
//     email: partner?.email || propertyPartner?.email || "",
//     partnerType: partner?.partnerType || propertyPartner?.partnerType || "",
//     assignedAt: propertyPartner?.assignedAt || new Date(),
//     assignedBy: {
//       userId: null,
//       name: "Property Assignment",
//       role: "System",
//     },
//     assignmentSource: "Property",
//   };
// };

// const ensurePropertyPartnerOnLead = async (lead) => {
//   if (lead?.assignedPartner?.partnerMongoId) {
//     return lead;
//   }

//   const propertyMongoId = lead?.property?.propertyMongoId;

//   if (!propertyMongoId || !mongoose.Types.ObjectId.isValid(propertyMongoId)) {
//     return lead;
//   }

//   const property = await Property.findById(propertyMongoId).lean();

//   if (!property) {
//     return lead;
//   }

//   const propertyAssignedPartner =
//     await buildAssignedPartnerFromProperty(property);

//   if (!propertyAssignedPartner) {
//     return lead;
//   }

//   lead.assignedPartner = propertyAssignedPartner;

//   if (lead.status === "Lead_Created") {
//     lead.status = "Lead_Assigned";

//     pushLifecycle(
//       lead,
//       "Lead_Assigned",
//       "Lead Assigned",
//       `Lead automatically assigned to ${
//         propertyAssignedPartner.name || propertyAssignedPartner.partnerCode
//       } because this partner is assigned to property ${
//         lead?.property?.propertyCode || ""
//       }.`,
//       {
//         name: "Property Assignment",
//         role: "System",
//       },
//     );
//   }

//   await lead.save();

//   return lead;
// };

// const buildBuyerSnapshot = (body = {}) => {
//   const buyer = body.buyer || body;

//   return {
//     buyerMongoId: buyer?.buyerMongoId || buyer?.buyerId || null,

//     buyerCode: buyer?.buyerCode || "",

//     name: buyer?.name || buyer?.buyerName || "Buyer",

//     phone: buyer?.phone || "",

//     email: buyer?.email || "",

//     city: buyer?.city || "",

//     consentVerified: Boolean(buyer?.consentVerified),
//   };
// };

// const pushLifecycle = (lead, status, event, remarks, actor) => {
//   lead.lifecycle.push({
//     status,
//     event,
//     remarks: remarks || "",
//     actor: makeActor(actor),
//     createdAt: new Date(),
//   });
// };

// const respondError = (res, error, fallback) => {
//   console.error(fallback, error);

//   return res.status(500).json({
//     success: false,
//     message: fallback,
//     error: error.message,
//   });
// };

// // ======================================================
// // BUYER PROPERTY BUTTON -> GENERATE LEAD
// // POST /api/leads/from-property
// // ======================================================

// export const createLeadFromProperty = async (req, res) => {
//   try {
//     const {
//       propertyId,
//       message = "",
//       source = "Property_Enquiry",
//       priority = "Medium",
//     } = req.body;

//     const property = await findProperty(propertyId);

//     if (!property) {
//       return res.status(404).json({
//         success: false,
//         message: "Property not found",
//       });
//     }

//     if (
//       property.status !== "Live" ||
//       property.propertyVerificationStatus !== "Verified"
//     ) {
//       return res.status(400).json({
//         success: false,
//         message: "Lead can be generated only for a live and verified property",
//       });
//     }

//     const buyer = buildBuyerSnapshot(req.body);

//     if (!buyer.name || (!buyer.phone && !buyer.email && !buyer.buyerMongoId)) {
//       return res.status(400).json({
//         success: false,
//         message:
//           "Buyer name and at least one buyer identifier/contact are required",
//       });
//     }

//     // Avoid accidental multiple active leads
//     // for same buyer + same property.
//     const duplicateQuery = {
//       "property.propertyMongoId": property._id,

//       status: {
//         $in: ACTIVE_DUPLICATE_STATUSES,
//       },

//       $or: [],
//     };

//     if (
//       buyer.buyerMongoId &&
//       mongoose.Types.ObjectId.isValid(buyer.buyerMongoId)
//     ) {
//       duplicateQuery.$or.push({
//         "buyer.buyerMongoId": buyer.buyerMongoId,
//       });
//     }

//     if (buyer.email) {
//       duplicateQuery.$or.push({
//         "buyer.email": buyer.email.toLowerCase(),
//       });
//     }

//     if (buyer.phone) {
//       duplicateQuery.$or.push({
//         "buyer.phone": buyer.phone,
//       });
//     }

//     if (duplicateQuery.$or.length) {
//       const existing = await Lead.findOne(duplicateQuery).lean();

//       if (existing) {
//         return res.status(200).json({
//           success: true,
//           duplicate: true,
//           message: "An active lead already exists for this buyer and property",
//           data: existing,
//         });
//       }
//     }

//     const propertyAssignedPartner =
//       await buildAssignedPartnerFromProperty(property);

//     const actor = makeActor(
//       req.body?.createdBy || {
//         userId: buyer.buyerMongoId,
//         name: buyer.name,
//         role: "Buyer",
//       },
//     );

//     const lead = new Lead({
//       leadId: await generateLeadId(),

//       source,

//       buyer,

//       property: buildPropertySnapshot(property),

//       enquiryMessage: message,

//       status: propertyAssignedPartner ? "Lead_Assigned" : "Lead_Created",

//       assignedPartner: propertyAssignedPartner || {},

//       priority,

//       estimatedValue: Number(property.price || 0),

//       createdBy: actor,
//     });

//     pushLifecycle(
//       lead,
//       "Lead_Created",
//       "Lead Created",
//       "Buyer generated lead from property enquiry",
//       actor,
//     );

//     if (propertyAssignedPartner) {
//       pushLifecycle(
//         lead,
//         "Lead_Assigned",
//         "Lead Assigned",
//         `Lead automatically assigned to ${
//           propertyAssignedPartner.name || propertyAssignedPartner.partnerCode
//         } because this partner is already assigned to property ${
//           property.propertyId || ""
//         }.`,
//         {
//           name: "Property Assignment",
//           role: "System",
//         },
//       );
//     }

//     await lead.save();

//     return res.status(201).json({
//       success: true,
//       message: "Lead generated successfully",
//       data: lead,
//     });
//   } catch (error) {
//     return respondError(res, error, "Unable to generate lead");
//   }
// };

// // ======================================================
// // ADMIN MANUAL CREATE
// // POST /api/leads
// // ======================================================

// export const createLead = async (req, res) => {
//   try {
//     const {
//       propertyId,
//       source = "Admin_Created",
//       message = "",
//       priority = "Medium",
//       estimatedValue,
//       createdBy,
//     } = req.body;

//     const property = await findProperty(propertyId);

//     if (!property) {
//       return res.status(404).json({
//         success: false,
//         message: "Property not found",
//       });
//     }

//     const buyer = buildBuyerSnapshot(req.body);

//     if (!buyer.name) {
//       return res.status(400).json({
//         success: false,
//         message: "Buyer name is required",
//       });
//     }

//     const propertyAssignedPartner =
//       await buildAssignedPartnerFromProperty(property);

//     const actor = makeActor(
//       createdBy || {
//         name: "Admin",
//         role: "Admin",
//       },
//     );

//     const lead = new Lead({
//       leadId: await generateLeadId(),
//       source,
//       buyer,
//       property: buildPropertySnapshot(property),
//       enquiryMessage: message,

//       status: propertyAssignedPartner ? "Lead_Assigned" : "Lead_Created",

//       assignedPartner: propertyAssignedPartner || {},

//       priority,

//       estimatedValue: Number(estimatedValue ?? property.price ?? 0),
//       createdBy: actor,
//     });

//     pushLifecycle(
//       lead,
//       "Lead_Created",
//       "Lead Created",
//       "Lead manually created by admin",
//       actor,
//     );

//     if (propertyAssignedPartner) {
//       pushLifecycle(
//         lead,
//         "Lead_Assigned",
//         "Lead Assigned",
//         `Lead automatically assigned to ${
//           propertyAssignedPartner.name || propertyAssignedPartner.partnerCode
//         } from the property's assigned partner.`,
//         {
//           name: "Property Assignment",
//           role: "System",
//         },
//       );
//     }

//     await lead.save();

//     return res.status(201).json({
//       success: true,
//       message: "Lead created successfully",
//       data: lead,
//     });
//   } catch (error) {
//     return respondError(res, error, "Unable to create lead");
//   }
// };

// // ======================================================
// // LIST
// // GET /api/leads
// // ======================================================

// export const getLeads = async (req, res) => {
//   try {
//     const page = Math.max(Number(req.query.page || 1), 1);

//     const limit = Math.min(Math.max(Number(req.query.limit || 10), 1), 100);

//     const {
//       search = "",
//       status = "",
//       source = "",
//       priority = "",
//       partnerId = "",
//     } = req.query;

//     const query = {};

//     if (status && LEAD_STATUSES.includes(status)) {
//       query.status = status;
//     }

//     if (source) {
//       query.source = source;
//     }

//     if (priority) {
//       query.priority = priority;
//     }

//     if (partnerId && mongoose.Types.ObjectId.isValid(partnerId)) {
//       query["assignedPartner.partnerMongoId"] = partnerId;
//     }

//     if (search.trim()) {
//       const regex = new RegExp(search.trim(), "i");

//       query.$or = [
//         {
//           leadId: regex,
//         },
//         {
//           "buyer.name": regex,
//         },
//         {
//           "buyer.phone": regex,
//         },
//         {
//           "buyer.email": regex,
//         },
//         {
//           "property.propertyCode": regex,
//         },
//         {
//           "property.title": regex,
//         },
//         {
//           "property.city": regex,
//         },
//         {
//           "assignedPartner.name": regex,
//         },
//       ];
//     }

//     const [leads, total] = await Promise.all([
//       Lead.find(query)
//         .sort({
//           createdAt: -1,
//         })
//         .skip((page - 1) * limit)
//         .limit(limit),

//       Lead.countDocuments(query),
//     ]);

//     const syncedLeadDocs = await Promise.all(
//       leads.map((lead) => ensurePropertyPartnerOnLead(lead)),
//     );

//     const syncedLeads = syncedLeadDocs.map((lead) => lead.toObject());

//     return res.json({
//       success: true,
//       data: syncedLeads,
//       leads: syncedLeads,
//       pagination: {
//         page,
//         limit,
//         total,
//         totalPages: Math.max(1, Math.ceil(total / limit)),
//       },
//       total,
//       totalPages: Math.max(1, Math.ceil(total / limit)),
//     });
//   } catch (error) {
//     return respondError(res, error, "Unable to fetch leads");
//   }
// };

// // ======================================================
// // DETAIL
// // GET /api/leads/:id
// // Supports Mongo _id or LD-XXXXXX
// // ======================================================

// export const getLeadById = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const query = mongoose.Types.ObjectId.isValid(id)
//       ? {
//           _id: id,
//         }
//       : {
//           leadId: id,
//         };

//     let lead = await Lead.findOne(query);

//     if (!lead) {
//       return res.status(404).json({
//         success: false,
//         message: "Lead not found",
//       });
//     }

//     lead = await ensurePropertyPartnerOnLead(lead);

//     return res.json({
//       success: true,
//       data: lead.toObject(),
//     });
//   } catch (error) {
//     return respondError(res, error, "Unable to fetch lead details");
//   }
// };

// // ======================================================
// // STATUS
// // PATCH /api/leads/:id/status
// // ======================================================

// export const updateLeadStatus = async (req, res) => {
//   try {
//     const { status, remarks = "", actor } = req.body;

//     if (!LEAD_STATUSES.includes(status)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid lead status",
//         allowedStatuses: LEAD_STATUSES,
//       });
//     }

//     const lead = await Lead.findById(req.params.id);

//     if (!lead) {
//       return res.status(404).json({
//         success: false,
//         message: "Lead not found",
//       });
//     }

//     lead.status = status;

//     pushLifecycle(lead, status, status.replaceAll("_", " "), remarks, actor);

//     await lead.save();

//     return res.json({
//       success: true,
//       message: "Lead status updated",
//       data: lead,
//     });
//   } catch (error) {
//     return respondError(res, error, "Unable to update lead status");
//   }
// };

// // ======================================================
// // ASSIGN PARTNER
// // PATCH /api/leads/:id/assign-partner
// // ======================================================

// export const assignLeadPartner = async (req, res) => {
//   try {
//     const { partnerId, remarks = "", actor } = req.body;

//     if (!mongoose.Types.ObjectId.isValid(partnerId)) {
//       return res.status(400).json({
//         success: false,
//         message: "Valid partner Mongo ID is required",
//       });
//     }

//     const [lead, partner] = await Promise.all([
//       Lead.findById(req.params.id),
//       Partner.findById(partnerId).lean(),
//     ]);

//     if (!lead) {
//       return res.status(404).json({
//         success: false,
//         message: "Lead not found",
//       });
//     }

//     if (!partner) {
//       return res.status(404).json({
//         success: false,
//         message: "Partner not found",
//       });
//     }

//     lead.assignedPartner = {
//       partnerMongoId: partner._id,
//       partnerCode: partner.partnerId || "",
//       name: partner.name || "",
//       phone: partner.phone || "",
//       email: partner.email || "",
//       assignedAt: new Date(),
//       assignedBy: makeActor(actor),
//       assignmentSource: "Lead",
//     };

//     lead.status = "Lead_Assigned";

//     pushLifecycle(
//       lead,
//       "Lead_Assigned",
//       "Lead Assigned",
//       remarks || `Lead assigned to ${partner.name}`,
//       actor,
//     );

//     await lead.save();

//     return res.json({
//       success: true,
//       message: "Lead assigned successfully",
//       data: lead,
//     });
//   } catch (error) {
//     return respondError(res, error, "Unable to assign lead");
//   }
// };

// // ======================================================
// // UNLOCK BY ASSIGNED PARTNER
// // PATCH /api/leads/:id/unlock
// // ======================================================

// export const unlockLeadByPartner = async (req, res) => {
//   const session = await mongoose.startSession();

//   try {
//     const { partnerId, remarks = "" } = req.body;

//     if (!mongoose.Types.ObjectId.isValid(partnerId)) {
//       return res.status(400).json({
//         success: false,
//         message: "Valid partnerId is required",
//       });
//     }

//     let lead;
//     let debitResult;

//     await session.withTransaction(async () => {
//       lead = await Lead.findById(req.params.id).session(session);

//       if (!lead) {
//         throw Object.assign(new Error("Lead not found"), { http: 404 });
//       }

//       if (!lead?.assignedPartner?.partnerMongoId) {
//         throw Object.assign(new Error("No partner is assigned to this lead"), {
//           http: 400,
//         });
//       }

//       if (String(lead.assignedPartner.partnerMongoId) !== String(partnerId)) {
//         throw Object.assign(
//           new Error("Only the assigned partner can unlock this lead"),
//           { http: 403 },
//         );
//       }

//       if (lead.isUnlockedByPartner) {
//         throw Object.assign(
//           new Error(
//             "Lead is already unlocked; credits will not be charged again",
//           ),
//           { http: 409 },
//         );
//       }

//       const partner = await Partner.findById(partnerId).session(session);

//       if (!partner) {
//         throw Object.assign(new Error("Partner not found"), { http: 404 });
//       }

//       if (!partner.isVerified || partner.isBlocked || partner.isRejected) {
//         throw Object.assign(
//           new Error("Only an active verified partner can unlock leads"),
//           { http: 403 },
//         );
//       }

//       // const cost = CREDIT_PRODUCTS.LEAD_UNLOCK.credits;
//       const leadUnlockPlan = await getCreditProduct("LEAD_UNLOCK");

//       if (!leadUnlockPlan) {
//         throw Object.assign(
//           new Error("Lead unlock service is currently unavailable"),
//           { http: 400 },
//         );
//       }

//       const cost = Number(leadUnlockPlan.credits);

//       const actor = {
//         userId: partner._id,
//         name: partner.name || lead.assignedPartner.name || "Partner",
//         role: "Partner",
//       };

//       debitResult = await debitPartnerWallet({
//         partnerId: partner._id,
//         credits: cost,
//         type: "LEAD_UNLOCK_DEBIT",
//         productCode: "LEAD_UNLOCK",
//         referenceType: "Lead",
//         referenceId: lead._id,
//         description: `Unlocked lead ${lead.leadId || lead._id}`,
//         metadata: {
//           leadId: lead.leadId || "",
//           propertyCode: lead?.property?.propertyCode || "",
//           buyerCode: lead?.buyer?.buyerCode || "",
//         },
//         actor,
//         session,
//       });

//       lead.isUnlockedByPartner = true;
//       lead.unlockedAt = new Date();
//       lead.unlockedBy = makeActor(actor);
//       lead.unlockCredit = {
//         creditsCharged: cost,
//         transactionId: debitResult.transaction._id,
//         productCode: "LEAD_UNLOCK",
//         refundedCredits: 0,
//         refundTransactionId: null,
//       };

//       lead.lifecycle.push({
//         status: lead.status,
//         event: "Lead Unlocked With Credits",
//         remarks:
//           remarks || `Lead unlocked by assigned partner for ${cost} credits`,
//         actor: makeActor(actor),
//         createdAt: new Date(),
//       });

//       await lead.save({ session });
//     });

//     // return res.json({
//     //   success: true,
//     //   message: `Lead unlocked successfully for ${CREDIT_PRODUCTS.LEAD_UNLOCK.credits} credits`,
//     //   data: {
//     //     lead,
//     //     wallet: debitResult.partner.creditWallet,
//     //     creditTransaction: debitResult.transaction,
//     //   },
//     // });

//     return res.json({
//       success: true,

//       message: `Lead unlocked successfully for ${cost} credits`,

//       data: {
//         lead,

//         wallet: debitResult.partner.creditWallet,

//         creditTransaction: debitResult.transaction,

//         pricing: {
//           code: leadUnlockPlan.code,

//           label: leadUnlockPlan.label,

//           credits: cost,
//         },
//       },
//     });
//   } catch (error) {
//     const status =
//       error.http || (error.code === "INSUFFICIENT_CREDITS" ? 400 : 500);

//     return res.status(status).json({
//       success: false,
//       message: "Unable to unlock lead",
//       error: error.message,
//     });
//   } finally {
//     await session.endSession();
//   }
// };

// // ======================================================
// // ADD CONTACT HISTORY
// // POST /api/leads/:id/contact-history
// // ======================================================

// export const addLeadContactHistory = async (req, res) => {
//   try {
//     const {
//       type,
//       status = "Other",
//       notes = "",
//       contactedAt,
//       doneBy,
//     } = req.body;

//     const lead = await Lead.findById(req.params.id);

//     if (!lead) {
//       return res.status(404).json({
//         success: false,
//         message: "Lead not found",
//       });
//     }

//     lead.contactHistory.push({
//       type,
//       status,
//       notes,
//       contactedAt: contactedAt || new Date(),
//       doneBy: makeActor(doneBy),
//     });

//     lead.lastContactAt = contactedAt || new Date();

//     await lead.save();

//     return res.json({
//       success: true,
//       message: "Contact history added",
//       data: lead,
//     });
//   } catch (error) {
//     return respondError(res, error, "Unable to add contact history");
//   }
// };

// // ======================================================
// // REVIEW
// // PATCH /api/leads/:id/review
// // ======================================================

// export const reviewLead = async (req, res) => {
//   try {
//     const { notes = "", actor } = req.body;

//     const lead = await Lead.findById(req.params.id);

//     if (!lead) {
//       return res.status(404).json({
//         success: false,
//         message: "Lead not found",
//       });
//     }

//     lead.status = "Lead_Reviewing";

//     lead.review = {
//       notes,
//       reviewedAt: new Date(),
//       reviewedBy: makeActor(actor),
//     };

//     pushLifecycle(lead, "Lead_Reviewing", "Lead Review", notes, actor);

//     await lead.save();

//     return res.json({
//       success: true,
//       message: "Lead moved to review",
//       data: lead,
//     });
//   } catch (error) {
//     return respondError(res, error, "Unable to review lead");
//   }
// };

// // ======================================================
// // REJECT
// // PATCH /api/leads/:id/reject
// // ======================================================

// export const rejectLead = async (req, res) => {
//   try {
//     const { reason = "", actor } = req.body;

//     const lead = await Lead.findById(req.params.id);

//     if (!lead) {
//       return res.status(404).json({
//         success: false,
//         message: "Lead not found",
//       });
//     }

//     lead.status = "Lead_Rejected";

//     lead.rejection = {
//       reason,
//       rejectedAt: new Date(),
//       rejectedBy: makeActor(actor),
//     };

//     pushLifecycle(lead, "Lead_Rejected", "Lead Rejected", reason, actor);

//     await lead.save();

//     return res.json({
//       success: true,
//       message: "Lead rejected",
//       data: lead,
//     });
//   } catch (error) {
//     return respondError(res, error, "Unable to reject lead");
//   }
// };

// // ======================================================
// // CLOSE
// // PATCH /api/leads/:id/close
// // ======================================================

// export const closeLead = async (req, res) => {
//   try {
//     const { reason = "", actor } = req.body;

//     const lead = await Lead.findById(req.params.id);

//     if (!lead) {
//       return res.status(404).json({
//         success: false,
//         message: "Lead not found",
//       });
//     }

//     lead.status = "Lead_Closed";

//     lead.closure = {
//       reason,
//       closedAt: new Date(),
//       closedBy: makeActor(actor),
//     };

//     pushLifecycle(lead, "Lead_Closed", "Lead Closed", reason, actor);

//     await lead.save();

//     return res.json({
//       success: true,
//       message: "Lead closed",
//       data: lead,
//     });
//   } catch (error) {
//     return respondError(res, error, "Unable to close lead");
//   }
// };

// // ======================================================
// // CONVERT
// // PATCH /api/leads/:id/convert
// // ======================================================

// export const convertLead = async (req, res) => {
//   try {
//     const { amount = 0, notes = "", actor } = req.body;

//     const lead = await Lead.findById(req.params.id);

//     if (!lead) {
//       return res.status(404).json({
//         success: false,
//         message: "Lead not found",
//       });
//     }

//     lead.status = "Successfully_Converted";

//     lead.conversion = {
//       amount: Number(amount || 0),
//       notes,
//       convertedAt: new Date(),
//       convertedBy: makeActor(actor),
//     };

//     pushLifecycle(
//       lead,
//       "Successfully_Converted",
//       "Lead Successfully Converted",
//       notes,
//       actor,
//     );

//     await lead.save();

//     return res.json({
//       success: true,
//       message: "Lead successfully converted",
//       data: lead,
//     });
//   } catch (error) {
//     return respondError(res, error, "Unable to convert lead");
//   }
// };

// // ======================================================
// // DASHBOARD
// // GET /api/leads/dashboard
// // ======================================================

// export const getLeadDashboard = async (req, res) => {
//   try {
//     const [pipeline, total, converted, activeValue] = await Promise.all([
//       Lead.aggregate([
//         {
//           $group: {
//             _id: "$status",
//             count: {
//               $sum: 1,
//             },
//           },
//         },
//       ]),

//       Lead.countDocuments(),

//       Lead.countDocuments({
//         status: "Successfully_Converted",
//       }),

//       Lead.aggregate([
//         {
//           $match: {
//             status: {
//               $in: [
//                 "Lead_Created",
//                 "Lead_Assigned",
//                 "Lead_Viewed",
//                 "Lead_Reviewing",
//               ],
//             },
//           },
//         },
//         {
//           $group: {
//             _id: null,
//             total: {
//               $sum: "$estimatedValue",
//             },
//           },
//         },
//       ]),
//     ]);

//     const pipelineMap = Object.fromEntries(
//       pipeline.map((item) => [item._id, item.count]),
//     );

//     const pipelineResult = LEAD_STATUSES.map((status) => ({
//       status,
//       count: pipelineMap[status] || 0,
//     }));

//     const conversionRate = total
//       ? Number(((converted / total) * 100).toFixed(1))
//       : 0;

//     return res.json({
//       success: true,

//       dashboard: {
//         totalLeads: total,
//         convertedLeads: converted,
//         conversionRate,
//         totalLeadValue: activeValue?.[0]?.total || 0,

//         unlocked: await Lead.countDocuments({
//           isUnlockedByPartner: true,
//         }),

//         assigned: await Lead.countDocuments({
//           status: "Lead_Assigned",
//         }),

//         reviewing: await Lead.countDocuments({
//           status: "Lead_Reviewing",
//         }),

//         rejected: await Lead.countDocuments({
//           status: "Lead_Rejected",
//         }),

//         closed: await Lead.countDocuments({
//           status: "Lead_Closed",
//         }),
//       },

//       pipeline: pipelineResult,
//     });
//   } catch (error) {
//     return respondError(res, error, "Unable to fetch lead dashboard");
//   }
// };

import mongoose from "mongoose";

import Lead, {
  LEAD_STATUSES,
} from "../../models/Lead.js";

import Property from "../../models/NewProperty.js";
import Partner from "../../models/Partner.js";
// import { CREDIT_PRODUCTS } from "../../config/creditPlans.js";
import {
  getCreditProduct,
} from "../../services/creditPricingService.js";
import { debitPartnerWallet } from "../../services/creditWalletService.js";
import { notifyAdmins } from "../../services/adminNotificationService.js";
const ACTIVE_DUPLICATE_STATUSES = [
  "Lead_Created",
  "Lead_Verified",
  "Lead_Assigned",
  "Lead_Viewed",
  "Lead_Reviewing",
];

const makeActor = (value = {}) => ({
  userId:
    value?.userId &&
    mongoose.Types.ObjectId.isValid(value.userId)
      ? value.userId
      : null,
  name: value?.name || "System",
  role: value?.role || "Admin",
});

const generateLeadId = async () => {
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const value = `LD-${Math.floor(
      100000 + Math.random() * 900000
    )}`;

    const exists = await Lead.exists({
      leadId: value,
    });

    if (!exists) {
      return value;
    }
  }

  return `LD-${Date.now()
    .toString()
    .slice(-8)}`;
};

const findProperty = async (propertyId) => {
  if (!propertyId) {
    return null;
  }

  if (
    mongoose.Types.ObjectId.isValid(
      propertyId
    )
  ) {
    const byMongoId =
      await Property.findById(
        propertyId
      ).lean();

    if (byMongoId) {
      return byMongoId;
    }
  }

  return Property.findOne({
    propertyId,
  }).lean();
};

const buildPropertySnapshot = (
  property
) => {
  const sellerMongoId =
    property?.addedBy?.role ===
      "Seller" &&
    mongoose.Types.ObjectId.isValid(
      property?.addedBy?.userId
    )
      ? property.addedBy.userId
      : null;

  return {
    propertyMongoId:
      property._id,

    propertyCode:
      property.propertyId || "",

    title:
      property.title ||
      property.projectName ||
      "",

    city:
      property.city || "",

    locality:
      property.locality || "",

    address:
      property.address || "",

    price:
      Number(
        property.price || 0
      ),

    image:
      property?.images?.[0]
        ?.url || "",

    addedByRole:
      property?.addedBy?.role ||
      "",

    addedByUserId:
      mongoose.Types.ObjectId.isValid(
        property?.addedBy
          ?.userId
      )
        ? property.addedBy
            .userId
        : null,

    addedByName:
      property?.addedBy?.name ||
      "",

    sellerMongoId,

    sellerCode:
      property?.addedBy
        ?.sellerId || "",

    sellerName:
      property?.addedBy
        ?.role === "Seller"
        ? property?.addedBy
            ?.name || ""
        : "",
  };
};

const buildAssignedPartnerFromProperty = async (property) => {
  const propertyPartner = property?.assignedPartner;

  const partnerMongoId =
    propertyPartner?.partnerId?._id ||
    propertyPartner?.partnerId ||
    null;

  if (
    !partnerMongoId ||
    !mongoose.Types.ObjectId.isValid(partnerMongoId)
  ) {
    return null;
  }

  const partner = await Partner.findById(
    partnerMongoId
  ).lean();

  return {
    partnerMongoId,
    partnerCode:
      partner?.partnerId ||
      propertyPartner?.partnerCode ||
      "",
    name:
      partner?.name ||
      propertyPartner?.name ||
      "",
    phone:
      partner?.phone ||
      propertyPartner?.phone ||
      "",
    email:
      partner?.email ||
      propertyPartner?.email ||
      "",
    partnerType:
      partner?.accountType ||
      partner?.partnerType ||
      propertyPartner?.partnerType ||
      "",
    assignedAt:
      propertyPartner?.assignedAt ||
      new Date(),
    assignedBy: {
      userId: null,
      name: "Property Assignment",
      role: "System",
    },
    assignmentSource: "Property",
  };
};

const ensurePropertyPartnerOnLead = async (lead) => {
  // Do not auto-assign while listing/fetching. Admin must verify the lead and
  // then explicitly assign the property's current partner.
  return lead;
};

const buildBuyerSnapshot = (
  body = {}
) => {
  const buyer =
    body.buyer || body;

  return {
    buyerMongoId:
      buyer?.buyerMongoId ||
      buyer?.buyerId ||
      null,

    buyerCode:
      buyer?.buyerCode || "",

    name:
      buyer?.name ||
      buyer?.buyerName ||
      "Buyer",

    phone:
      buyer?.phone || "",

    email:
      buyer?.email || "",

    city:
      buyer?.city || "",

    consentVerified:
      Boolean(
        buyer?.consentVerified
      ),
  };
};

const pushLifecycle = (
  lead,
  status,
  event,
  remarks,
  actor
) => {
  lead.lifecycle.push({
    status,
    event,
    remarks:
      remarks || "",
    actor:
      makeActor(actor),
    createdAt:
      new Date(),
  });
};

const respondError = (
  res,
  error,
  fallback
) => {
  console.error(
    fallback,
    error
  );

  return res
    .status(500)
    .json({
      success: false,
      message:
        fallback,
      error:
        error.message,
    });
};

// ======================================================
// BUYER PROPERTY BUTTON -> GENERATE LEAD
// POST /api/leads/from-property
// ======================================================

export const createLeadFromProperty =
  async (req, res) => {
    try {
      const {
        propertyId,
        message = "",
        source =
          "Property_Enquiry",
        priority =
          "Medium",
      } = req.body;

      const property =
        await findProperty(
          propertyId
        );

      if (!property) {
        return res
          .status(404)
          .json({
            success:
              false,
            message:
              "Property not found",
          });
      }

      // Buyer leads can be generated only for properties that are
      // finally verified and currently live.
      if (
        property.status !== "Live" ||
        property.propertyVerificationStatus !== "Verified"
      ) {
        return res.status(400).json({
          success: false,
          message: "Lead can be generated only for a live and verified property",
        });
      }

      const buyer =
        buildBuyerSnapshot(
          req.body
        );

      if (
        !buyer.name ||
        (!buyer.phone &&
          !buyer.email &&
          !buyer.buyerMongoId)
      ) {
        return res
          .status(400)
          .json({
            success:
              false,
            message:
              "Buyer name and at least one buyer identifier/contact are required",
          });
      }

      // Avoid accidental multiple active leads
      // for same buyer + same property.
      const duplicateQuery = {
        "property.propertyMongoId":
          property._id,

        status: {
          $in:
            ACTIVE_DUPLICATE_STATUSES,
        },

        $or: [],
      };

      if (
        buyer.buyerMongoId &&
        mongoose.Types.ObjectId.isValid(
          buyer.buyerMongoId
        )
      ) {
        duplicateQuery.$or.push({
          "buyer.buyerMongoId":
            buyer.buyerMongoId,
        });
      }

      if (buyer.email) {
        duplicateQuery.$or.push({
          "buyer.email":
            buyer.email.toLowerCase(),
        });
      }

      if (buyer.phone) {
        duplicateQuery.$or.push({
          "buyer.phone":
            buyer.phone,
        });
      }

      if (
        duplicateQuery.$or
          .length
      ) {
        const existing =
          await Lead.findOne(
            duplicateQuery
          ).lean();

        if (existing) {
          return res
            .status(200)
            .json({
              success:
                true,
              duplicate:
                true,
              message:
                "An active lead already exists for this buyer and property",
              data:
                existing,
            });
        }
      }

      const actor =
        makeActor(
          req.body
            ?.createdBy || {
            userId:
              buyer.buyerMongoId,
            name:
              buyer.name,
            role: "Buyer",
          }
        );

      const lead =
        new Lead({
          leadId:
            await generateLeadId(),

          source,

          buyer,

          property:
            buildPropertySnapshot(
              property
            ),

          enquiryMessage:
            message,

          status: "Lead_Created",
          leadVerificationStatus: "Pending",
          assignedPartner: {},

          priority,

          estimatedValue:
            Number(
              property.price ||
                0
            ),

          createdBy:
            actor,
        });

      pushLifecycle(
        lead,
        "Lead_Created",
        "Lead Created",
        "Buyer generated lead from property enquiry",
        actor
      );

      await lead.save();

      await notifyAdmins({
        title: "New lead generated",
        message: `Lead ${lead.leadId} was generated for ${lead.property?.propertyTitle || lead.property?.propertyCode || "a property"}.`,
        type: "NEW_LEAD",
        actionUrl: `/leads-dashboard?tab=management&leadId=${lead._id}`,
        entityType: "Lead",
        entityId: lead._id,
        data: { leadId: lead.leadId, propertyCode: lead.property?.propertyCode },
      });

      return res
        .status(201)
        .json({
          success: true,
          message:
            "Lead generated successfully",
          data: lead,
        });
    } catch (error) {
      return respondError(
        res,
        error,
        "Unable to generate lead"
      );
    }
  };

// ======================================================
// ADMIN MANUAL CREATE
// POST /api/leads
// ======================================================

export const createLead =
  async (req, res) => {
    try {
      const {
        propertyId,
        source =
          "Admin_Created",
        message = "",
        priority =
          "Medium",
        estimatedValue,
        createdBy,
      } = req.body;

      const property =
        await findProperty(
          propertyId
        );

      if (!property) {
        return res
          .status(404)
          .json({
            success:
              false,
            message:
              "Property not found",
          });
      }

      const buyer =
        buildBuyerSnapshot(
          req.body
        );

      if (!buyer.name) {
        return res
          .status(400)
          .json({
            success:
              false,
            message:
              "Buyer name is required",
          });
      }

      const actor =
        makeActor(
          createdBy || {
            name: "Admin",
            role: "Admin",
          }
        );

      const lead =
        new Lead({
          leadId:
            await generateLeadId(),
          source,
          buyer,
          property:
            buildPropertySnapshot(
              property
            ),
          enquiryMessage:
            message,

          status: "Lead_Created",
          leadVerificationStatus: "Pending",
          assignedPartner: {},

          priority,

          estimatedValue:
            Number(
              estimatedValue ??
                property.price ??
                0
            ),
          createdBy:
            actor,
        });

      pushLifecycle(
        lead,
        "Lead_Created",
        "Lead Created",
        "Lead manually created by admin",
        actor
      );

      await lead.save();

      await notifyAdmins({
        title: "New lead generated",
        message: `Lead ${lead.leadId} was created for ${lead.property?.propertyTitle || lead.property?.propertyCode || "a property"}.`,
        type: "NEW_LEAD",
        actionUrl: `/leads-dashboard?tab=management&leadId=${lead._id}`,
        entityType: "Lead",
        entityId: lead._id,
        data: { leadId: lead.leadId, propertyCode: lead.property?.propertyCode },
      });

      return res
        .status(201)
        .json({
          success: true,
          message:
            "Lead created successfully",
          data: lead,
        });
    } catch (error) {
      return respondError(
        res,
        error,
        "Unable to create lead"
      );
    }
  };

// ======================================================
// PARTNER LEAD VISIBILITY / CONTACT PRIVACY HELPERS
// ======================================================

const isFullyVerifiedPartner = (partner) =>
  Boolean(
    partner &&
      partner.isApproved &&
      partner.isVerified &&
      !partner.isBlocked &&
      !partner.isRejected &&
      partner.applicationStatus === "Verified"
  );

const maskContact = (value = "", type = "phone") => {
  const text = String(value || "");
  if (!text) return "";

  if (type === "email") {
    const [local = "", domain = ""] = text.split("@");
    if (!domain) return "********";
    const visible = local.slice(0, Math.min(2, local.length));
    return `${visible}${"*".repeat(Math.max(4, local.length - visible.length))}@${domain}`;
  }

  if (text.length <= 4) return "****";
  return `${text.slice(0, 2)}${"*".repeat(Math.max(4, text.length - 4))}${text.slice(-2)}`;
};

const canPartnerSeeLead = (lead, partner) => {
  if (!lead || !partner || !lead?.assignedPartner?.partnerMongoId) return false;

  const ownerId = String(lead.assignedPartner.partnerMongoId);
  const selfId = String(partner._id);

  if (partner.accountType === "single") {
    return ownerId === selfId;
  }

  if (partner.accountType === "team" && !partner.isSubPartner) {
    return ownerId === selfId;
  }

  if (partner.accountType === "subagent" || partner.isSubPartner) {
    return Boolean(partner.parentPartnerId) && ownerId === String(partner.parentPartnerId);
  }

  return false;
};

const shapeLeadForPartner = (leadLike, partner) => {
  const raw = typeof leadLike?.toObject === "function" ? leadLike.toObject() : { ...leadLike };
  const consent = Boolean(raw?.buyer?.consentVerified);
  const unlocked = Boolean(raw?.isUnlockedByPartner);
  const contactVisible = consent && unlocked;

  raw.contactVisibility = {
    buyerConsent: consent,
    isUnlocked: unlocked,
    contactVisible,
    unlockAllowedByConsent: consent,
  };

  if (raw.buyer) {
    raw.buyer = { ...raw.buyer };

    if (!contactVisible) {
      raw.buyer.maskedPhone = maskContact(raw.buyer.phone, "phone");
      raw.buyer.maskedEmail = maskContact(raw.buyer.email, "email");
      raw.buyer.phone = "";
      raw.buyer.email = "";
    }
  }

  if (partner?.accountType === "subagent" || partner?.isSubPartner) {
    raw.partnerAccess = {
      viewerType: "subagent",
      teamOwnerId: partner.parentPartnerId || null,
      allocatedToMe:
        String(raw?.assignedSubPartner?.subPartnerMongoId || "") === String(partner._id),
      availableAllocatedCredits: Number(partner?.teamCreditAllocation?.availableLimit || 0),
    };
  } else {
    raw.partnerAccess = {
      viewerType: partner?.accountType || "partner",
      allocatedToMe: false,
    };
  }

  return raw;
};

// ======================================================
// LIST
// GET /api/leads
// ======================================================

export const getLeads =
  async (req, res) => {
    try {
      const page = Math.max(
        Number(
          req.query.page || 1
        ),
        1
      );

      const limit = Math.min(
        Math.max(
          Number(
            req.query.limit ||
              10
          ),
          1
        ),
        100
      );

      const {
        search = "",
        status = "",
        source = "",
        priority = "",
        partnerId = "",
      } = req.query;

      const query = {};

      if (
        status &&
        LEAD_STATUSES.includes(
          status
        )
      ) {
        query.status =
          status;
      }

      if (source) {
        query.source =
          source;
      }

      if (priority) {
        query.priority =
          priority;
      }

      if (
        partnerId &&
        mongoose.Types.ObjectId.isValid(
          partnerId
        )
      ) {
        query[
          "assignedPartner.partnerMongoId"
        ] = partnerId;
      }

      if (search.trim()) {
        const regex =
          new RegExp(
            search.trim(),
            "i"
          );

        query.$or = [
          {
            leadId:
              regex,
          },
          {
            "buyer.name":
              regex,
          },
          {
            "buyer.phone":
              regex,
          },
          {
            "buyer.email":
              regex,
          },
          {
            "property.propertyCode":
              regex,
          },
          {
            "property.title":
              regex,
          },
          {
            "property.city":
              regex,
          },
          {
            "assignedPartner.name":
              regex,
          },
        ];
      }

      const [
        leads,
        total,
      ] =
        await Promise.all([
          Lead.find(query)
            .sort({
              createdAt: -1,
            })
            .skip(
              (page - 1) *
                limit
            )
            .limit(limit),

          Lead.countDocuments(
            query
          ),
        ]);

      const syncedLeadDocs =
        await Promise.all(
          leads.map((lead) =>
            ensurePropertyPartnerOnLead(
              lead
            )
          )
        );

      const syncedLeads =
        syncedLeadDocs.map(
          (lead) => lead.toObject()
        );

      return res.json({
        success: true,
        data: syncedLeads,
        leads: syncedLeads,
        pagination: {
          page,
          limit,
          total,
          totalPages:
            Math.max(
              1,
              Math.ceil(
                total / limit
              )
            ),
        },
        total,
        totalPages:
          Math.max(
            1,
            Math.ceil(
              total / limit
            )
          ),
      });
    } catch (error) {
      return respondError(
        res,
        error,
        "Unable to fetch leads"
      );
    }
  };

// ======================================================
// DETAIL
// GET /api/leads/:id
// Supports Mongo _id or LD-XXXXXX
// ======================================================

export const getLeadById =
  async (req, res) => {
    try {
      const {
        id,
      } = req.params;

      const query =
        mongoose.Types.ObjectId.isValid(
          id
        )
          ? {
              _id: id,
            }
          : {
              leadId: id,
            };

      let lead =
        await Lead.findOne(
          query
        );

      if (!lead) {
        return res
          .status(404)
          .json({
            success:
              false,
            message:
              "Lead not found",
          });
      }

      lead =
        await ensurePropertyPartnerOnLead(
          lead
        );

      return res.json({
        success: true,
        data: lead.toObject(),
      });
    } catch (error) {
      return respondError(
        res,
        error,
        "Unable to fetch lead details"
      );
    }
  };

// ======================================================
// STATUS
// PATCH /api/leads/:id/status
// ======================================================

export const updateLeadStatus =
  async (req, res) => {
    try {
      const {
        status,
        remarks = "",
        actor,
      } = req.body;

      if (
        !LEAD_STATUSES.includes(
          status
        )
      ) {
        return res
          .status(400)
          .json({
            success:
              false,
            message:
              "Invalid lead status",
            allowedStatuses:
              LEAD_STATUSES,
          });
      }

      const lead =
        await Lead.findById(
          req.params.id
        );

      if (!lead) {
        return res
          .status(404)
          .json({
            success:
              false,
            message:
              "Lead not found",
          });
      }

      lead.status =
        status;

      pushLifecycle(
        lead,
        status,
        status.replaceAll(
          "_",
          " "
        ),
        remarks,
        actor
      );

      await lead.save();

      return res.json({
        success: true,
        message:
          "Lead status updated",
        data: lead,
      });
    } catch (error) {
      return respondError(
        res,
        error,
        "Unable to update lead status"
      );
    }
  };

// ======================================================
// VERIFY BY ADMIN
// PATCH /api/leads/:id/verify
// ======================================================

export const verifyLeadByAdmin = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({ success: false, message: "Lead not found" });
    }

    if (lead.leadVerificationStatus === "Rejected" || lead.status === "Lead_Rejected") {
      return res.status(409).json({
        success: false,
        message: "Rejected lead cannot be verified.",
      });
    }

    if (lead.leadVerificationStatus === "Verified") {
      return res.json({ success: true, message: "Lead is already verified", data: lead });
    }

    const actor = {
      userId: req.user?.id || req.body.actor?.userId,
      name: req.body.actor?.name || "DigiNiwas Admin",
      role: "Admin",
    };

    lead.leadVerificationStatus = "Verified";
    lead.status = "Lead_Verified";
    lead.verification = {
      notes: String(req.body.notes || "").trim(),
      verifiedAt: new Date(),
      verifiedBy: makeActor(actor),
    };

    pushLifecycle(
      lead,
      "Lead_Verified",
      "Lead Verified",
      String(req.body.notes || "Lead verified by admin").trim(),
      actor
    );

    await lead.save();

    return res.json({
      success: true,
      message: "Lead verified successfully",
      data: lead,
    });
  } catch (error) {
    return respondError(res, error, "Unable to verify lead");
  }
};

// ======================================================
// ASSIGN PARTNER
// PATCH /api/leads/:id/assign-partner
// ======================================================

export const assignLeadPartner =
  async (req, res) => {
    try {
      const {
        partnerId,
        remarks = "",
        actor,
      } = req.body;

      const lead = await Lead.findById(req.params.id);

      if (!lead) {
        return res
          .status(404)
          .json({
            success:
              false,
            message:
              "Lead not found",
          });
      }

      if (lead.leadVerificationStatus !== "Verified") {
        return res.status(409).json({
          success: false,
          message: "Admin must verify this lead before assigning a partner.",
          code: "LEAD_VERIFICATION_REQUIRED",
        });
      }

      const property = await Property.findById(
        lead?.property?.propertyMongoId
      ).lean();

      if (!property) {
        return res.status(404).json({
          success: false,
          message: "Lead property not found",
        });
      }

      const propertyAssignedPartner =
        await buildAssignedPartnerFromProperty(property);

      if (!propertyAssignedPartner?.partnerMongoId) {
        return res.status(409).json({
          success: false,
          message: "Assign a partner to this property before assigning the lead.",
          code: "PROPERTY_PARTNER_REQUIRED",
        });
      }

      if (
        partnerId &&
        String(partnerId) !== String(propertyAssignedPartner.partnerMongoId)
      ) {
        return res.status(409).json({
          success: false,
          message: "Lead can only be assigned to the partner assigned to its property.",
        });
      }

      const partner = await Partner.findById(
        propertyAssignedPartner.partnerMongoId
      ).lean();

      if (!partner) {
        return res
          .status(404)
          .json({
            success:
              false,
            message:
              "Partner not found",
          });
      }

      if (!isFullyVerifiedPartner(partner)) {
        return res.status(403).json({
          success: false,
          message: "Lead can be assigned only to an approved and verified active partner",
        });
      }

      if (partner.accountType === "subagent" || partner.isSubPartner) {
        return res.status(403).json({
          success: false,
          message: "Admin cannot assign a lead directly to a Sub-Agent. Assign the lead to the Team / Agency Owner.",
        });
      }

      if (!["single", "team"].includes(partner.accountType)) {
        return res.status(400).json({
          success: false,
          message: "Lead can be assigned only to a Single Partner or Team / Agency Owner",
        });
      }

      const adminActor = {
        userId: req.user?.id || actor?.userId,
        name: actor?.name || "DigiNiwas Admin",
        role: "Admin",
      };

      lead.assignedPartner = {
        ...propertyAssignedPartner,
        assignedAt: new Date(),
        assignedBy: makeActor(adminActor),
        assignmentSource: "Lead",
      };

      lead.status =
        "Lead_Assigned";

      pushLifecycle(
        lead,
        "Lead_Assigned",
        "Lead Assigned",
        remarks ||
          `Lead assigned by admin to property partner ${partner.name}`,
        adminActor
      );

      await lead.save();

      return res.json({
        success: true,
        message:
          "Lead assigned successfully",
        data: lead,
      });
    } catch (error) {
      return respondError(
        res,
        error,
        "Unable to assign lead"
      );
    }
  };

// ======================================================
// UNLOCK BY ASSIGNED PARTNER
// PATCH /api/leads/:id/unlock
// ======================================================

export const unlockLeadByPartner = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    const { partnerId, remarks = "" } = req.body;

    if (!mongoose.Types.ObjectId.isValid(partnerId)) {
      return res.status(400).json({
        success: false,
        message: "Valid partnerId is required",
      });
    }

    if (String(req.user?.id || "") !== String(partnerId)) {
      return res.status(403).json({
        success: false,
        message: "Authenticated partner can only unlock a lead for their own account.",
        code: "PARTNER_ID_TOKEN_MISMATCH",
      });
    }

    let lead;
    let debitResult;
    let leadUnlockPlan;
    let cost = 0;
    let requester;

    await session.withTransaction(async () => {
      lead = await Lead.findById(req.params.id).session(session);

      if (!lead) {
        throw Object.assign(new Error("Lead not found"), { http: 404 });
      }

      if (lead.leadVerificationStatus !== "Verified") {
        throw Object.assign(
          new Error("Admin must verify this lead before it can be unlocked"),
          { http: 403, code: "LEAD_VERIFICATION_REQUIRED" }
        );
      }

      if (!lead?.assignedPartner?.partnerMongoId) {
        throw Object.assign(
          new Error("Admin must assign the property partner before this lead can be unlocked"),
          { http: 403, code: "LEAD_ASSIGNMENT_REQUIRED" }
        );
      }

      if (lead.assignedPartner.assignmentSource !== "Lead") {
        throw Object.assign(
          new Error("Admin must explicitly assign this verified lead before it can be unlocked"),
          { http: 403, code: "ADMIN_LEAD_ASSIGNMENT_REQUIRED" }
        );
      }

      // Consent is mandatory BEFORE charging any credits.
      if (!lead?.buyer?.consentVerified) {
        throw Object.assign(
          new Error("Buyer has not consented to share contact details"),
          { http: 403, code: "BUYER_CONSENT_REQUIRED" }
        );
      }

      if (lead.isUnlockedByPartner) {
        throw Object.assign(
          new Error("Lead is already unlocked; credits will not be charged again"),
          { http: 409, code: "LEAD_ALREADY_UNLOCKED" }
        );
      }

      requester = await Partner.findById(partnerId).session(session);

      if (!requester) {
        throw Object.assign(new Error("Partner not found"), { http: 404 });
      }

      if (!isFullyVerifiedPartner(requester) || !requester.permissions?.canUnlockLead) {
        throw Object.assign(
          new Error("Only an approved, finally verified and active partner can unlock leads"),
          { http: 403, code: "PARTNER_NOT_ALLOWED_TO_UNLOCK" }
        );
      }

      const assignedOwnerId = String(lead.assignedPartner.partnerMongoId);
      const requesterId = String(requester._id);

      const property = await Property.findById(
        lead?.property?.propertyMongoId
      ).session(session).lean();
      const currentPropertyPartner = property
        ? await buildAssignedPartnerFromProperty(property)
        : null;

      if (
        !currentPropertyPartner?.partnerMongoId ||
        String(currentPropertyPartner.partnerMongoId) !== assignedOwnerId
      ) {
        throw Object.assign(
          new Error("Property partner has changed or is no longer assigned. Admin must reassign this lead."),
          { http: 409, code: "PROPERTY_PARTNER_MISMATCH" }
        );
      }

      const assignedOwner = await Partner.findById(assignedOwnerId).session(session);

      if (!assignedOwner || !isFullyVerifiedPartner(assignedOwner)) {
        throw Object.assign(
          new Error("Assigned partner / Team Owner is not active and verified"),
          { http: 403, code: "ASSIGNED_OWNER_NOT_ACTIVE" }
        );
      }

      // Only the exact partner assigned to the property and then assigned to
      // this verified lead by Admin can unlock it.
      if (requesterId !== assignedOwnerId) {
        throw Object.assign(
          new Error("Only the partner assigned to this property can unlock this lead"),
          { http: 403, code: "ONLY_PROPERTY_PARTNER_CAN_UNLOCK" }
        );
      }

      leadUnlockPlan = await getCreditProduct("LEAD_UNLOCK");
      if (!leadUnlockPlan) {
        throw Object.assign(new Error("Lead unlock service is currently unavailable"), { http: 400 });
      }

      cost = Number(leadUnlockPlan.credits);
      if (!Number.isFinite(cost) || cost <= 0) {
        throw Object.assign(new Error("Invalid LEAD_UNLOCK credit pricing"), { http: 500 });
      }

      // For Sub-Agent this function debits ONLY from the credits allocated
      // by the Team Owner. Sub-Agent cannot purchase credits directly.
      const actor = {
        userId: requester._id,
        name: requester.name || "Partner",
        role:
          requester.accountType === "subagent"
            ? "Sub-Agent"
            : requester.accountType === "team"
              ? "Team Partner"
              : "Single Partner",
      };

      debitResult = await debitPartnerWallet({
        partnerId: requester._id,
        credits: cost,
        type: "LEAD_UNLOCK_DEBIT",
        productCode: "LEAD_UNLOCK",
        referenceType: "Lead",
        referenceId: lead._id,
        description: `Unlocked lead ${lead.leadId || lead._id}`,
        metadata: {
          leadId: lead.leadId || "",
          propertyCode: lead?.property?.propertyCode || "",
          buyerCode: lead?.buyer?.buyerCode || "",
          teamOwnerPartnerId:
            assignedOwner.accountType === "team" ? assignedOwner._id : null,
          unlockerAccountType: requester.accountType,
        },
        actor,
        session,
      });

      lead.isUnlockedByPartner = true;
      lead.unlockedAt = new Date();
      lead.unlockedBy = makeActor(actor);
      lead.unlockCredit = {
        creditsCharged: cost,
        transactionId: debitResult.transaction?._id || null,
        productCode: "LEAD_UNLOCK",
        creditSource:
          requester.accountType === "subagent"
            ? "SUBAGENT_ALLOCATION"
            : requester.accountType === "team"
              ? "TEAM_WALLET"
              : "SINGLE_WALLET",
        chargedPartnerMongoId: requester._id,
        chargedPartnerCode: requester.partnerId || "",
        chargedAccountType: requester.accountType || "",
        refundedCredits: 0,
        refundTransactionId: null,
      };

      if (["Lead_Created", "Lead_Assigned"].includes(lead.status)) {
        lead.status = "Lead_Viewed";
      }

      pushLifecycle(
        lead,
        lead.status,
        "Lead Unlocked With Credits",
        remarks || `Lead unlocked by ${requester.name} for ${cost} LEAD_UNLOCK credits`,
        actor
      );

      await lead.save({ session });
    });

    return res.json({
      success: true,
      message: `Lead unlocked successfully for ${cost} credits`,
      data: {
        lead: shapeLeadForPartner(lead, requester),
        wallet: debitResult?.wallet || debitResult?.partner?.creditWallet || null,
        creditTransaction: debitResult?.transaction || null,
        pricing: {
          code: leadUnlockPlan.code,
          label: leadUnlockPlan.label,
          credits: cost,
        },
      },
    });
  } catch (error) {
    const status =
      error.http ||
      ([
        "INSUFFICIENT_CREDITS",
        "SPENDING_APPROVAL_REQUIRED",
        "PARTNER_NOT_ALLOWED_TO_SPEND",
      ].includes(error.code)
        ? 400
        : 500);

    return res.status(status).json({
      success: false,
      message: "Unable to unlock lead",
      code: error.code || "LEAD_UNLOCK_FAILED",
      error: error.message,
    });
  } finally {
    await session.endSession();
  }
};

// ======================================================
// PARTNER / TEAM LEAD LIST
// GET /api/leads/partner/:partnerId
// Single -> own assigned leads
// Team Owner -> team-owned leads
// Sub-Agent -> all leads assigned to its Team Owner
// Buyer contact is returned only when consent=true AND lead unlocked.
// ======================================================

export const getPartnerVisibleLeads = async (req, res) => {
  try {
    const { partnerId } = req.params;
    const { status = "", search = "", page = 1, limit = 20 } = req.query;

    if (!mongoose.Types.ObjectId.isValid(partnerId)) {
      return res.status(400).json({ success: false, message: "Valid partnerId is required" });
    }

    const partner = await Partner.findById(partnerId).lean();
    if (!partner) {
      return res.status(404).json({ success: false, message: "Partner not found" });
    }

    if (!isFullyVerifiedPartner(partner)) {
      return res.status(403).json({
        success: false,
        message: "Only approved and finally verified active partners can view leads",
      });
    }

    let ownerId = partner._id;
    if (partner.accountType === "subagent" || partner.isSubPartner) {
      if (!partner.parentPartnerId) {
        return res.status(400).json({ success: false, message: "Sub-Agent is not linked to a Team Owner" });
      }
      ownerId = partner.parentPartnerId;
    }

    const query = {
      "assignedPartner.partnerMongoId": ownerId,
    };

    if (status && LEAD_STATUSES.includes(status)) query.status = status;

    if (search.trim()) {
      const regex = new RegExp(search.trim(), "i");
      query.$or = [
        { leadId: regex },
        { "buyer.name": regex },
        { "property.propertyCode": regex },
        { "property.title": regex },
        { "property.city": regex },
      ];
    }

    const pageNo = Math.max(Number(page) || 1, 1);
    const limitNo = Math.min(Math.max(Number(limit) || 20, 1), 100);

    const [leads, total] = await Promise.all([
      Lead.find(query)
        .sort({ createdAt: -1 })
        .skip((pageNo - 1) * limitNo)
        .limit(limitNo)
        .lean(),
      Lead.countDocuments(query),
    ]);

    return res.json({
      success: true,
      data: leads.map((lead) => shapeLeadForPartner(lead, partner)),
      pagination: {
        page: pageNo,
        limit: limitNo,
        total,
        totalPages: Math.max(1, Math.ceil(total / limitNo)),
      },
      viewer: {
        partnerId: partner._id,
        partnerCode: partner.partnerId || "",
        accountType: partner.accountType,
        teamOwnerId: ownerId,
        allocatedCredits:
          partner.accountType === "subagent"
            ? Number(partner?.teamCreditAllocation?.availableLimit || 0)
            : null,
      },
    });
  } catch (error) {
    return respondError(res, error, "Unable to fetch partner leads");
  }
};

// ======================================================
// PARTNER / TEAM LEAD DETAIL
// GET /api/leads/partner/:partnerId/:id
// ======================================================

export const getPartnerVisibleLeadById = async (req, res) => {
  try {
    const { partnerId, id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(partnerId)) {
      return res.status(400).json({ success: false, message: "Valid partnerId is required" });
    }

    const partner = await Partner.findById(partnerId).lean();
    if (!partner || !isFullyVerifiedPartner(partner)) {
      return res.status(403).json({ success: false, message: "Partner is not allowed to view leads" });
    }

    const query = mongoose.Types.ObjectId.isValid(id) ? { _id: id } : { leadId: id };
    const lead = await Lead.findOne(query).lean();

    if (!lead) {
      return res.status(404).json({ success: false, message: "Lead not found" });
    }

    if (!canPartnerSeeLead(lead, partner)) {
      return res.status(403).json({ success: false, message: "You are not allowed to view this lead" });
    }

    return res.json({ success: true, data: shapeLeadForPartner(lead, partner) });
  } catch (error) {
    return respondError(res, error, "Unable to fetch partner lead details");
  }
};

// ======================================================
// TEAM OWNER -> ALLOCATE LEAD TO VERIFIED SUB-AGENT
// PATCH /api/leads/:id/allocate-subpartner
// ======================================================

export const allocateLeadToSubPartner = async (req, res) => {
  try {
    const { teamPartnerId, subPartnerId, remarks = "", actor = {} } = req.body;

    if (!mongoose.Types.ObjectId.isValid(teamPartnerId) || !mongoose.Types.ObjectId.isValid(subPartnerId)) {
      return res.status(400).json({
        success: false,
        message: "Valid teamPartnerId and subPartnerId are required",
      });
    }

    const [lead, owner, subPartner] = await Promise.all([
      Lead.findById(req.params.id),
      Partner.findById(teamPartnerId).lean(),
      Partner.findById(subPartnerId).lean(),
    ]);

    if (!lead) return res.status(404).json({ success: false, message: "Lead not found" });
    if (!owner) return res.status(404).json({ success: false, message: "Team Partner not found" });
    if (!subPartner) return res.status(404).json({ success: false, message: "Sub-Agent not found" });

    if (owner.accountType !== "team" || owner.isSubPartner || !isFullyVerifiedPartner(owner)) {
      return res.status(403).json({ success: false, message: "Only a verified Team / Agency Owner can allocate leads" });
    }

    if (String(lead?.assignedPartner?.partnerMongoId || "") !== String(owner._id)) {
      return res.status(403).json({ success: false, message: "This lead does not belong to this Team Owner" });
    }

    if (
      subPartner.accountType !== "subagent" ||
      !subPartner.isSubPartner ||
      String(subPartner.parentPartnerId || "") !== String(owner._id) ||
      !isFullyVerifiedPartner(subPartner)
    ) {
      return res.status(403).json({
        success: false,
        message: "Lead can be allocated only to a verified Sub-Agent of this Team",
      });
    }

    lead.assignedSubPartner = {
      subPartnerMongoId: subPartner._id,
      partnerCode: subPartner.partnerId || "",
      name: subPartner.name || "",
      email: subPartner.email || "",
      phone: subPartner.phone || "",
      teamRole: subPartner.teamRole || "",
      allocatedAt: new Date(),
      allocatedBy: makeActor({
        userId: owner._id,
        name: owner.name,
        role: "Team Partner",
        ...actor,
      }),
    };

    pushLifecycle(
      lead,
      lead.status,
      "Lead Allocated To Sub-Agent",
      remarks || `Lead allocated to ${subPartner.name}`,
      { userId: owner._id, name: owner.name, role: "Team Partner" }
    );

    await lead.save();

    return res.json({
      success: true,
      message: "Lead allocated to Sub-Agent successfully",
      data: lead,
    });
  } catch (error) {
    return respondError(res, error, "Unable to allocate lead to Sub-Agent");
  }
};

// ======================================================
// TEAM OWNER -> REMOVE SUB-AGENT ALLOCATION
// PATCH /api/leads/:id/remove-subpartner-allocation
// ======================================================

export const removeLeadSubPartnerAllocation = async (req, res) => {
  try {
    const { teamPartnerId, remarks = "" } = req.body;

    if (!mongoose.Types.ObjectId.isValid(teamPartnerId)) {
      return res.status(400).json({ success: false, message: "Valid teamPartnerId is required" });
    }

    const [lead, owner] = await Promise.all([
      Lead.findById(req.params.id),
      Partner.findById(teamPartnerId).lean(),
    ]);

    if (!lead) return res.status(404).json({ success: false, message: "Lead not found" });
    if (!owner || owner.accountType !== "team" || !isFullyVerifiedPartner(owner)) {
      return res.status(403).json({ success: false, message: "Verified Team Owner is required" });
    }

    if (String(lead?.assignedPartner?.partnerMongoId || "") !== String(owner._id)) {
      return res.status(403).json({ success: false, message: "This lead does not belong to this Team Owner" });
    }

    lead.assignedSubPartner = {};
    pushLifecycle(
      lead,
      lead.status,
      "Sub-Agent Lead Allocation Removed",
      remarks || "Sub-Agent allocation removed by Team Owner",
      { userId: owner._id, name: owner.name, role: "Team Partner" }
    );
    await lead.save();

    return res.json({ success: true, message: "Sub-Agent allocation removed", data: lead });
  } catch (error) {
    return respondError(res, error, "Unable to remove Sub-Agent allocation");
  }
};

// ======================================================
// ADD CONTACT HISTORY
// POST /api/leads/:id/contact-history
// ======================================================

export const addLeadContactHistory =
  async (req, res) => {
    try {
      const {
        type,
        status =
          "Other",
        notes = "",
        contactedAt,
        doneBy,
      } = req.body;

      const lead =
        await Lead.findById(
          req.params.id
        );

      if (!lead) {
        return res
          .status(404)
          .json({
            success:
              false,
            message:
              "Lead not found",
          });
      }

      lead.contactHistory.push({
        type,
        status,
        notes,
        contactedAt:
          contactedAt ||
          new Date(),
        doneBy:
          makeActor(doneBy),
      });

      lead.lastContactAt =
        contactedAt ||
        new Date();

      await lead.save();

      return res.json({
        success: true,
        message:
          "Contact history added",
        data: lead,
      });
    } catch (error) {
      return respondError(
        res,
        error,
        "Unable to add contact history"
      );
    }
  };

// ======================================================
// REVIEW
// PATCH /api/leads/:id/review
// ======================================================

export const reviewLead =
  async (req, res) => {
    try {
      const {
        notes = "",
        actor,
      } = req.body;

      const lead =
        await Lead.findById(
          req.params.id
        );

      if (!lead) {
        return res
          .status(404)
          .json({
            success:
              false,
            message:
              "Lead not found",
          });
      }

      lead.status =
        "Lead_Reviewing";

      lead.review = {
        notes,
        reviewedAt:
          new Date(),
        reviewedBy:
          makeActor(actor),
      };

      pushLifecycle(
        lead,
        "Lead_Reviewing",
        "Lead Review",
        notes,
        actor
      );

      await lead.save();

      return res.json({
        success: true,
        message:
          "Lead moved to review",
        data: lead,
      });
    } catch (error) {
      return respondError(
        res,
        error,
        "Unable to review lead"
      );
    }
  };

// ======================================================
// REJECT
// PATCH /api/leads/:id/reject
// ======================================================

export const rejectLead =
  async (req, res) => {
    try {
      const {
        reason = "",
        actor,
      } = req.body;

      const lead =
        await Lead.findById(
          req.params.id
        );

      if (!lead) {
        return res
          .status(404)
          .json({
            success:
              false,
            message:
              "Lead not found",
          });
      }

      lead.status =
        "Lead_Rejected";
      lead.leadVerificationStatus =
        "Rejected";

      lead.rejection = {
        reason,
        rejectedAt:
          new Date(),
        rejectedBy:
          makeActor(actor),
      };

      pushLifecycle(
        lead,
        "Lead_Rejected",
        "Lead Rejected",
        reason,
        actor
      );

      await lead.save();

      return res.json({
        success: true,
        message:
          "Lead rejected",
        data: lead,
      });
    } catch (error) {
      return respondError(
        res,
        error,
        "Unable to reject lead"
      );
    }
  };

// ======================================================
// CLOSE
// PATCH /api/leads/:id/close
// ======================================================

export const closeLead =
  async (req, res) => {
    try {
      const {
        reason = "",
        actor,
      } = req.body;

      const lead =
        await Lead.findById(
          req.params.id
        );

      if (!lead) {
        return res
          .status(404)
          .json({
            success:
              false,
            message:
              "Lead not found",
          });
      }

      lead.status =
        "Lead_Closed";

      lead.closure = {
        reason,
        closedAt:
          new Date(),
        closedBy:
          makeActor(actor),
      };

      pushLifecycle(
        lead,
        "Lead_Closed",
        "Lead Closed",
        reason,
        actor
      );

      await lead.save();

      return res.json({
        success: true,
        message:
          "Lead closed",
        data: lead,
      });
    } catch (error) {
      return respondError(
        res,
        error,
        "Unable to close lead"
      );
    }
  };

// ======================================================
// CONVERT
// PATCH /api/leads/:id/convert
// ======================================================

export const convertLead =
  async (req, res) => {
    try {
      const {
        amount = 0,
        notes = "",
        actor,
      } = req.body;

      const lead =
        await Lead.findById(
          req.params.id
        );

      if (!lead) {
        return res
          .status(404)
          .json({
            success:
              false,
            message:
              "Lead not found",
          });
      }

      lead.status =
        "Successfully_Converted";

      lead.conversion = {
        amount:
          Number(amount || 0),
        notes,
        convertedAt:
          new Date(),
        convertedBy:
          makeActor(actor),
      };

      pushLifecycle(
        lead,
        "Successfully_Converted",
        "Lead Successfully Converted",
        notes,
        actor
      );

      await lead.save();

      return res.json({
        success: true,
        message:
          "Lead successfully converted",
        data: lead,
      });
    } catch (error) {
      return respondError(
        res,
        error,
        "Unable to convert lead"
      );
    }
  };

// ======================================================
// DASHBOARD
// GET /api/leads/dashboard
// ======================================================

export const getLeadDashboard =
  async (req, res) => {
    try {
      const [
        pipeline,
        total,
        converted,
        activeValue,
      ] =
        await Promise.all([
          Lead.aggregate([
            {
              $group: {
                _id: "$status",
                count: {
                  $sum: 1,
                },
              },
            },
          ]),

          Lead.countDocuments(),

          Lead.countDocuments({
            status:
              "Successfully_Converted",
          }),

          Lead.aggregate([
            {
              $match: {
                status: {
                  $in: [
                    "Lead_Created",
                    "Lead_Verified",
                    "Lead_Assigned",
                    "Lead_Viewed",
                    "Lead_Reviewing",
                  ],
                },
              },
            },
            {
              $group: {
                _id: null,
                total: {
                  $sum:
                    "$estimatedValue",
                },
              },
            },
          ]),
        ]);

      const pipelineMap =
        Object.fromEntries(
          pipeline.map(
            (item) => [
              item._id,
              item.count,
            ]
          )
        );

      const pipelineResult =
        LEAD_STATUSES.map(
          (status) => ({
            status,
            count:
              pipelineMap[
                status
              ] || 0,
          })
        );

      const conversionRate =
        total
          ? Number(
              (
                (converted /
                  total) *
                100
              ).toFixed(1)
            )
          : 0;

      return res.json({
        success: true,

        dashboard: {
          totalLeads:
            total,
          convertedLeads:
            converted,
          conversionRate,
          totalLeadValue:
            activeValue?.[0]
              ?.total || 0,

          unlocked:
            await Lead.countDocuments(
              {
                isUnlockedByPartner:
                  true,
              }
            ),

          assigned:
            await Lead.countDocuments(
              {
                status:
                  "Lead_Assigned",
              }
            ),

          verified:
            await Lead.countDocuments(
              {
                leadVerificationStatus:
                  "Verified",
              }
            ),

          reviewing:
            await Lead.countDocuments(
              {
                status:
                  "Lead_Reviewing",
              }
            ),

          rejected:
            await Lead.countDocuments(
              {
                status:
                  "Lead_Rejected",
              }
            ),

          closed:
            await Lead.countDocuments(
              {
                status:
                  "Lead_Closed",
              }
            ),
        },

        pipeline:
          pipelineResult,
      });
    } catch (error) {
      return respondError(
        res,
        error,
        "Unable to fetch lead dashboard"
      );
    }
  };
