// import mongoose from "mongoose";
// import Partner from "../../models/Partner.js";
// import CreditTransaction from "../../models/CreditTransaction.js";
// import PromotionRequest from "../../models/PromotionRequest.js";
// import { CREDIT_RATE } from "../../config/creditPlans.js";
// import {
//   creditPartnerWallet,
//   debitPartnerWallet,
//   makeActor,
// } from "../../services/creditWalletService.js";

// // Call this ONLY after your payment gateway says payment is actually captured/verified.
// // Example: ₹5000 => 5000 credits because current rate is ₹1 = 1 credit.
// export const completeCreditPurchase = async (req, res) => {
//   const session = await mongoose.startSession();

//   try {
//     const {
//       partnerId,
//       amountInRupees,
//       payment = {},
//       actor = {},
//     } = req.body;

//     if (!mongoose.Types.ObjectId.isValid(partnerId)) {
//       return res.status(400).json({ success: false, message: "Invalid partnerId" });
//     }

//     const amount = Number(amountInRupees);
//     if (!Number.isFinite(amount) || amount <= 0) {
//       return res.status(400).json({
//         success: false,
//         message: "amountInRupees must be greater than 0",
//       });
//     }

//     // Do not trust a frontend-only success flag in production.
//     if (payment.provider && payment.signatureVerified !== true) {
//       return res.status(400).json({
//         success: false,
//         message: "Payment must be verified before issuing credits",
//       });
//     }

//     const credits = Math.floor(amount / CREDIT_RATE.rupeesPerCredit);
//     let result;

//     await session.withTransaction(async () => {
//       result = await creditPartnerWallet({
//         partnerId,
//         credits,
//         type: "PURCHASE",
//         amountInRupees: amount,
//         referenceType: "Purchase",
//         payment,
//         description: `Purchased ${credits} credits for ₹${amount}`,
//         actor,
//         session,
//       });
//     });

//     return res.status(201).json({
//       success: true,
//       message: `${credits} credits added successfully`,
//       data: {
//         creditsAdded: credits,
//         wallet: result.partner.creditWallet,
//         transaction: result.transaction,
//       },
//     });
//   } catch (error) {
//     return res.status(500).json({
//       success: false,
//       message: "Unable to complete credit purchase",
//       error: error.message,
//     });
//   } finally {
//     await session.endSession();
//   }
// };


// // ======================================================
// // 1. GET ALL PARTNERS CREDIT OVERVIEW
// // GET /api/credits/partners
// // ======================================================

// export const getPartnerCreditOverview = async (req, res) => {
//   try {
//     const {
//       search = "",
//       page = 1,
//       limit = 50,
//     } = req.query;

//     const pageNumber = Math.max(Number(page) || 1, 1);
//     const limitNumber = Math.min(
//       Math.max(Number(limit) || 50, 1),
//       100
//     );

//     // ======================================================
//     // PARTNER FILTER
//     // ======================================================

//     const partnerQuery = {};

//     if (search.trim()) {
//       const regex = new RegExp(search.trim(), "i");

//       partnerQuery.$or = [
//         { name: regex },
//         { partnerId: regex },
//         { email: regex },
//         { phone: regex },
//       ];
//     }

//     // ======================================================
//     // GET PARTNERS
//     // ======================================================

//     const [partners, totalPartners] = await Promise.all([
//       Partner.find(partnerQuery)
//         .select(
//           `
//             partnerId
//             name
//             email
//             phone
//             partnerType
//             isVerified
//             isBlocked
//             isRejected
//             creditWallet
//             createdAt
//           `
//         )
//         .sort({ createdAt: -1 })
//         .skip((pageNumber - 1) * limitNumber)
//         .limit(limitNumber)
//         .lean(),

//       Partner.countDocuments(partnerQuery),
//     ]);

//     if (!partners.length) {
//       return res.status(200).json({
//         success: true,
//         data: [],
//         pagination: {
//           page: pageNumber,
//           limit: limitNumber,
//           total: totalPartners,
//           totalPages: Math.max(
//             1,
//             Math.ceil(totalPartners / limitNumber)
//           ),
//         },
//       });
//     }

//     const partnerIds = partners.map((partner) => partner._id);

//     // ======================================================
//     // CREDIT TRANSACTION SUMMARY
//     // ======================================================

//     const transactionSummary = await CreditTransaction.aggregate([
//       {
//         $match: {
//           partnerMongoId: {
//             $in: partnerIds,
//           },
//         },
//       },

//       {
//         $group: {
//           _id: {
//             partnerMongoId: "$partnerMongoId",
//             type: "$type",
//             productCode: "$productCode",
//             direction: "$direction",
//             status: "$status",
//           },

//           credits: {
//             $sum: "$credits",
//           },

//           amountInRupees: {
//             $sum: "$amountInRupees",
//           },

//           count: {
//             $sum: 1,
//           },
//         },
//       },
//     ]);

//     // ======================================================
//     // PROMOTION SUMMARY
//     // ======================================================

//     const promotionSummary = await PromotionRequest.aggregate([
//       {
//         $match: {
//           partnerMongoId: {
//             $in: partnerIds,
//           },
//         },
//       },

//       {
//         $group: {
//           _id: {
//             partnerMongoId: "$partnerMongoId",
//             promotionType: "$promotionType",
//             status: "$status",
//           },

//           credits: {
//             $sum: "$creditsCharged",
//           },

//           count: {
//             $sum: 1,
//           },
//         },
//       },
//     ]);

//     // ======================================================
//     // CREATE RESPONSE
//     // ======================================================

//     const data = partners.map((partner) => {
//       const partnerIdString = String(partner._id);

//       const partnerTransactions = transactionSummary.filter(
//         (item) =>
//           String(item._id.partnerMongoId) === partnerIdString
//       );

//       const partnerPromotions = promotionSummary.filter(
//         (item) =>
//           String(item._id.partnerMongoId) === partnerIdString
//       );

//       // ------------------------------------------------------
//       // PURCHASE
//       // ------------------------------------------------------

//       const purchases = partnerTransactions.filter(
//         (item) =>
//           item._id.type === "PURCHASE" &&
//           item._id.status === "SUCCESS"
//       );

//       const purchasedCredits = purchases.reduce(
//         (sum, item) => sum + Number(item.credits || 0),
//         0
//       );

//       const purchaseAmount = purchases.reduce(
//         (sum, item) => sum + Number(item.amountInRupees || 0),
//         0
//       );

//       // ------------------------------------------------------
//       // REFUND
//       // ------------------------------------------------------

//       const refunds = partnerTransactions.filter(
//         (item) =>
//           item._id.type === "REFUND" &&
//           item._id.status === "SUCCESS"
//       );

//       const refundedCredits = refunds.reduce(
//         (sum, item) => sum + Number(item.credits || 0),
//         0
//       );

//       // ------------------------------------------------------
//       // LEAD UNLOCK
//       // ------------------------------------------------------

//       const leadUnlockTransactions = partnerTransactions.filter(
//         (item) =>
//           item._id.type === "LEAD_UNLOCK_DEBIT" &&
//           item._id.productCode === "LEAD_UNLOCK" &&
//           item._id.direction === "DEBIT" &&
//           item._id.status === "SUCCESS"
//       );

//       const leadUnlockCredits = leadUnlockTransactions.reduce(
//         (sum, item) => sum + Number(item.credits || 0),
//         0
//       );

//       const leadUnlockCount = leadUnlockTransactions.reduce(
//         (sum, item) => sum + Number(item.count || 0),
//         0
//       );

//       // ------------------------------------------------------
//       // APPROVED / EXPIRED PROMOTIONS ONLY
//       // ------------------------------------------------------

//       const usedPromotions = partnerPromotions.filter((item) =>
//         ["Approved", "Expired"].includes(item._id.status)
//       );

//       const getPromotion = (code) => {
//         const rows = usedPromotions.filter(
//           (item) => item._id.promotionType === code
//         );

//         return {
//           credits: rows.reduce(
//             (sum, item) => sum + Number(item.credits || 0),
//             0
//           ),

//           count: rows.reduce(
//             (sum, item) => sum + Number(item.count || 0),
//             0
//           ),
//         };
//       };

//       const propertyBoost = getPromotion("PROPERTY_BOOST");
//       const featured = getPromotion("FEATURED_7_DAYS");
//       const localityTop = getPromotion("LOCALITY_TOP_30_DAYS");

//       const wallet = partner.creditWallet || {};

//       return {
//         _id: partner._id,

//         partnerId: partner.partnerId,
//         name: partner.name,
//         email: partner.email,
//         phone: partner.phone,
//         partnerType: partner.partnerType,

//         isVerified: partner.isVerified,
//         isBlocked: partner.isBlocked,
//         isRejected: partner.isRejected,

//         wallet: {
//           currentBalance: Number(wallet.balance || 0),

//           totalCreditsPurchased: Number(
//             wallet.totalPurchased ?? purchasedCredits
//           ),

//           totalSpent: Number(wallet.totalSpent || 0),

//           totalRefunded: Number(
//             wallet.totalRefunded ?? refundedCredits
//           ),

//           purchaseAmount,
//         },

//         services: {
//           propertyBoost,
//           featured,
//           localityTop,

//           leadUnlock: {
//             credits: leadUnlockCredits,
//             count: leadUnlockCount,
//           },
//         },

//         createdAt: partner.createdAt,
//       };
//     });

//     return res.status(200).json({
//       success: true,

//       data,

//       pagination: {
//         page: pageNumber,
//         limit: limitNumber,
//         total: totalPartners,

//         totalPages: Math.max(
//           1,
//           Math.ceil(totalPartners / limitNumber)
//         ),
//       },
//     });
//   } catch (error) {
//     console.error("Partner Credit Overview Error:", error);

//     return res.status(500).json({
//       success: false,
//       message: "Unable to fetch partner credit overview",
//       error: error.message,
//     });
//   }
// };


// // ======================================================
// // 2. GET SINGLE PARTNER COMPLETE CREDIT DETAILS
// // GET /api/credits/partners/:partnerId
// // ======================================================

// export const getPartnerCreditDetails = async (req, res) => {
//   try {
//     const { partnerId } = req.params;

//     if (!mongoose.Types.ObjectId.isValid(partnerId)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid partner ID",
//       });
//     }

//     const partner = await Partner.findById(partnerId)
//       .select(
//         `
//           partnerId
//           name
//           email
//           phone
//           partnerType
//           role
//           location
//           isVerified
//           isBlocked
//           isRejected
//           creditWallet
//           createdAt
//           updatedAt
//         `
//       )
//       .lean();

//     if (!partner) {
//       return res.status(404).json({
//         success: false,
//         message: "Partner not found",
//       });
//     }

//     const [creditHistory, promotionHistory] = await Promise.all([
//       CreditTransaction.find({
//         partnerMongoId: partner._id,
//       })
//         .sort({ createdAt: -1 })
//         .lean(),

//       PromotionRequest.find({
//         partnerMongoId: partner._id,
//       })
//         .populate({
//           path: "propertyMongoId",
//           select:
//             "propertyId title city locality status propertyVerificationStatus price images",
//         })
//         .sort({ createdAt: -1 })
//         .lean(),
//     ]);

//     const serviceSummary = {
//       propertyBoost: {
//         credits: 0,
//         count: 0,
//       },

//       featured: {
//         credits: 0,
//         count: 0,
//       },

//       localityTop: {
//         credits: 0,
//         count: 0,
//       },

//       leadUnlock: {
//         credits: 0,
//         count: 0,
//       },
//     };

//     // ======================================================
//     // PROMOTION USAGE
//     // ======================================================

//     promotionHistory.forEach((promotion) => {
//       // Only actually approved/applied services count as usage.
//       if (
//         !["Approved", "Expired"].includes(promotion.status)
//       ) {
//         return;
//       }

//       const credits = Number(promotion.creditsCharged || 0);

//       if (promotion.promotionType === "PROPERTY_BOOST") {
//         serviceSummary.propertyBoost.credits += credits;
//         serviceSummary.propertyBoost.count += 1;
//       }

//       if (promotion.promotionType === "FEATURED_7_DAYS") {
//         serviceSummary.featured.credits += credits;
//         serviceSummary.featured.count += 1;
//       }

//       if (
//         promotion.promotionType === "LOCALITY_TOP_30_DAYS"
//       ) {
//         serviceSummary.localityTop.credits += credits;
//         serviceSummary.localityTop.count += 1;
//       }
//     });

//     // ======================================================
//     // LEAD UNLOCK
//     // ======================================================

//     creditHistory.forEach((transaction) => {
//       if (
//         transaction.type === "LEAD_UNLOCK_DEBIT" &&
//         transaction.productCode === "LEAD_UNLOCK" &&
//         transaction.direction === "DEBIT" &&
//         transaction.status === "SUCCESS"
//       ) {
//         serviceSummary.leadUnlock.credits += Number(
//           transaction.credits || 0
//         );

//         serviceSummary.leadUnlock.count += 1;
//       }
//     });

//     // ======================================================
//     // SALES SUMMARY
//     // ======================================================

//     const successfulPurchases = creditHistory.filter(
//       (transaction) =>
//         transaction.type === "PURCHASE" &&
//         transaction.status === "SUCCESS"
//     );

//     const successfulRefunds = creditHistory.filter(
//       (transaction) =>
//         transaction.type === "REFUND" &&
//         transaction.status === "SUCCESS"
//     );

//     const purchasedCredits = successfulPurchases.reduce(
//       (sum, transaction) =>
//         sum + Number(transaction.credits || 0),
//       0
//     );

//     const purchaseAmount = successfulPurchases.reduce(
//       (sum, transaction) =>
//         sum + Number(transaction.amountInRupees || 0),
//       0
//     );

//     const refundedCredits = successfulRefunds.reduce(
//       (sum, transaction) =>
//         sum + Number(transaction.credits || 0),
//       0
//     );

//     const wallet = partner.creditWallet || {};

//     // ======================================================
//     // PROPERTY/PROMOTION HISTORY
//     // ======================================================

//     const properties = promotionHistory.map((promotion) => ({
//       _id: promotion._id,

//       requestId: promotion.requestId,

//       propertyMongoId:
//         promotion.propertyMongoId?._id ||
//         promotion.propertyMongoId,

//       propertyCode:
//         promotion.propertyMongoId?.propertyId ||
//         promotion.propertyCode,

//       propertyTitle:
//         promotion.propertyMongoId?.title ||
//         promotion.propertyTitle,

//       property: promotion.propertyMongoId,

//       city: promotion.city,
//       locality: promotion.locality,

//       promotionType: promotion.promotionType,
//       creditsCharged: promotion.creditsCharged,

//       status: promotion.status,

//       requestedAt: promotion.requestedAt,
//       approvedAt: promotion.approvedAt,
//       rejectedAt: promotion.rejectedAt,
//       expiresAt: promotion.expiresAt,

//       adminRemarks: promotion.adminRemarks,
//       history: promotion.history,
//     }));

//     return res.status(200).json({
//       success: true,

//       data: {
//         partner,

//         wallet: {
//           balance: Number(wallet.balance || 0),

//           totalPurchased: Number(
//             wallet.totalPurchased ?? purchasedCredits
//           ),

//           totalSpent: Number(wallet.totalSpent || 0),

//           totalRefunded: Number(
//             wallet.totalRefunded ?? refundedCredits
//           ),
//         },

//         salesSummary: {
//           purchasedCredits,
//           purchaseAmount,

//           purchaseTransactions:
//             successfulPurchases.length,

//           refundedCredits,

//           refundTransactions:
//             successfulRefunds.length,
//         },

//         serviceSummary,

//         promotionSummary: {
//           total: promotionHistory.length,

//           pending: promotionHistory.filter(
//             (item) => item.status === "Pending"
//           ).length,

//           approved: promotionHistory.filter(
//             (item) =>
//               item.status === "Approved" ||
//               item.status === "Expired"
//           ).length,

//           rejected: promotionHistory.filter(
//             (item) => item.status === "Rejected"
//           ).length,
//         },

//         properties,

//         creditHistory,
//       },
//     });
//   } catch (error) {
//     console.error("Partner Credit Details Error:", error);

//     return res.status(500).json({
//       success: false,
//       message: "Unable to fetch partner credit details",
//       error: error.message,
//     });
//   }
// };


// // ======================================================
// // 3. GET PROPERTY CREDIT OVERVIEW
// // GET /api/credits/properties
// // ======================================================

// export const getPropertyCreditOverview = async (req, res) => {
//   try {
//     const {
//       search = "",
//       page = 1,
//       limit = 50,
//     } = req.query;

//     const pageNumber = Math.max(Number(page) || 1, 1);

//     const limitNumber = Math.min(
//       Math.max(Number(limit) || 50, 1),
//       100
//     );

//     // ======================================================
//     // GET PROMOTION DATA GROUPED BY PROPERTY
//     // ======================================================

//     const promotionRows = await PromotionRequest.aggregate([
//       {
//         $group: {
//           _id: "$propertyMongoId",

//           propertyCode: {
//             $first: "$propertyCode",
//           },

//           propertyTitle: {
//             $first: "$propertyTitle",
//           },

//           city: {
//             $first: "$city",
//           },

//           locality: {
//             $first: "$locality",
//           },

//           totalRequests: {
//             $sum: 1,
//           },

//           requests: {
//             $push: {
//               partnerMongoId: "$partnerMongoId",
//               partnerCode: "$partnerCode",
//               partnerName: "$partnerName",

//               promotionType: "$promotionType",
//               creditsCharged: "$creditsCharged",
//               status: "$status",

//               requestId: "$requestId",
//               requestedAt: "$requestedAt",
//               approvedAt: "$approvedAt",
//               rejectedAt: "$rejectedAt",
//               expiresAt: "$expiresAt",
//             },
//           },
//         },
//       },

//       {
//         $sort: {
//           propertyTitle: 1,
//         },
//       },
//     ]);

//     // ======================================================
//     // CREATE PROPERTY SUMMARY
//     // ======================================================

//     let data = promotionRows.map((row) => {
//       const services = {
//         propertyBoost: {
//           credits: 0,
//           count: 0,
//         },

//         featured: {
//           credits: 0,
//           count: 0,
//         },

//         localityTop: {
//           credits: 0,
//           count: 0,
//         },
//       };

//       let totalCreditsUsed = 0;
//       let totalCreditsReserved = 0;
//       let totalCreditsRefunded = 0;

//       const partnerMap = new Map();

//       row.requests.forEach((request) => {
//         const credits = Number(request.creditsCharged || 0);

//         // --------------------------------------------------
//         // APPROVED / EXPIRED = USED
//         // --------------------------------------------------

//         if (
//           ["Approved", "Expired"].includes(request.status)
//         ) {
//           totalCreditsUsed += credits;

//           if (request.promotionType === "PROPERTY_BOOST") {
//             services.propertyBoost.credits += credits;
//             services.propertyBoost.count += 1;
//           }

//           if (
//             request.promotionType === "FEATURED_7_DAYS"
//           ) {
//             services.featured.credits += credits;
//             services.featured.count += 1;
//           }

//           if (
//             request.promotionType ===
//             "LOCALITY_TOP_30_DAYS"
//           ) {
//             services.localityTop.credits += credits;
//             services.localityTop.count += 1;
//           }
//         }

//         // --------------------------------------------------
//         // PENDING = RESERVED
//         // --------------------------------------------------

//         if (request.status === "Pending") {
//           totalCreditsReserved += credits;
//         }

//         // --------------------------------------------------
//         // REJECTED = REFUNDED
//         // --------------------------------------------------

//         if (request.status === "Rejected") {
//           totalCreditsRefunded += credits;
//         }

//         // --------------------------------------------------
//         // UNIQUE PARTNERS
//         // --------------------------------------------------

//         if (request.partnerMongoId) {
//           const key = String(request.partnerMongoId);

//           if (!partnerMap.has(key)) {
//             partnerMap.set(key, {
//               partnerMongoId: request.partnerMongoId,
//               partnerCode: request.partnerCode,
//               partnerName: request.partnerName,
//             });
//           }
//         }
//       });

//       return {
//         propertyMongoId: row._id,

//         propertyCode: row.propertyCode,
//         propertyTitle: row.propertyTitle,

//         city: row.city,
//         locality: row.locality,

//         totalRequests: row.totalRequests,

//         totalCreditsUsed,
//         totalCreditsReserved,
//         totalCreditsRefunded,

//         services,

//         partners: Array.from(partnerMap.values()),
//       };
//     });

//     // ======================================================
//     // SEARCH
//     // ======================================================

//     if (search.trim()) {
//       const searchValue = search.trim().toLowerCase();

//       data = data.filter((item) => {
//         const propertyMatch =
//           item.propertyCode
//             ?.toLowerCase()
//             .includes(searchValue) ||
//           item.propertyTitle
//             ?.toLowerCase()
//             .includes(searchValue) ||
//           item.city
//             ?.toLowerCase()
//             .includes(searchValue) ||
//           item.locality
//             ?.toLowerCase()
//             .includes(searchValue);

//         const partnerMatch = item.partners.some(
//           (partner) =>
//             partner.partnerName
//               ?.toLowerCase()
//               .includes(searchValue) ||
//             partner.partnerCode
//               ?.toLowerCase()
//               .includes(searchValue)
//         );

//         return propertyMatch || partnerMatch;
//       });
//     }

//     const total = data.length;

//     const paginatedData = data.slice(
//       (pageNumber - 1) * limitNumber,
//       pageNumber * limitNumber
//     );

//     return res.status(200).json({
//       success: true,

//       data: paginatedData,

//       pagination: {
//         page: pageNumber,
//         limit: limitNumber,
//         total,

//         totalPages: Math.max(
//           1,
//           Math.ceil(total / limitNumber)
//         ),
//       },
//     });
//   } catch (error) {
//     console.error("Property Credit Overview Error:", error);

//     return res.status(500).json({
//       success: false,
//       message: "Unable to fetch property credit overview",
//       error: error.message,
//     });
//   }
// };


// // ======================================================
// // 4. GET SINGLE PROPERTY CREDIT DETAILS
// // GET /api/credits/properties/:propertyId
// // ======================================================

// export const getPropertyCreditDetails = async (req, res) => {
//   try {
//     const { propertyId } = req.params;

//     if (!mongoose.Types.ObjectId.isValid(propertyId)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid property ID",
//       });
//     }

//     // ======================================================
//     // PROPERTY
//     // ======================================================

//     const property = await NewProperty.findById(propertyId)
//       .select(
//         `
//           propertyId
//           title
//           transactionType
//           category
//           status
//           propertyVerificationStatus
//           price
//           propertySize
//           sizeUnit
//           city
//           locality
//           address
//           images
//           addedBy
//           assignedPartner
//           boost
//           createdAt
//           updatedAt
//         `
//       )
//       .lean();

//     if (!property) {
//       return res.status(404).json({
//         success: false,
//         message: "Property not found",
//       });
//     }

//     // ======================================================
//     // PROMOTION HISTORY
//     // ======================================================

//     const promotionHistory = await PromotionRequest.find({
//       propertyMongoId: property._id,
//     })
//       .populate({
//         path: "partnerMongoId",
//         select:
//           "partnerId name email phone partnerType isVerified creditWallet",
//       })
//       .sort({ createdAt: -1 })
//       .lean();

//     // ======================================================
//     // SUMMARY
//     // ======================================================

//     const summary = {
//       totalRequests: promotionHistory.length,

//       usedCredits: 0,
//       pendingCredits: 0,
//       refundedCredits: 0,

//       approvedRequests: 0,
//       pendingRequests: 0,
//       rejectedRequests: 0,
//       expiredRequests: 0,
//     };

//     const serviceSummary = {
//       propertyBoost: {
//         credits: 0,
//         count: 0,
//       },

//       featured: {
//         credits: 0,
//         count: 0,
//       },

//       localityTop: {
//         credits: 0,
//         count: 0,
//       },
//     };

//     promotionHistory.forEach((promotion) => {
//       const credits = Number(promotion.creditsCharged || 0);

//       // ------------------------------------------------------
//       // APPROVED
//       // ------------------------------------------------------

//       if (promotion.status === "Approved") {
//         summary.usedCredits += credits;
//         summary.approvedRequests += 1;
//       }

//       // ------------------------------------------------------
//       // EXPIRED
//       // Expired means service was previously applied.
//       // ------------------------------------------------------

//       if (promotion.status === "Expired") {
//         summary.usedCredits += credits;
//         summary.expiredRequests += 1;
//       }

//       // ------------------------------------------------------
//       // PENDING
//       // ------------------------------------------------------

//       if (promotion.status === "Pending") {
//         summary.pendingCredits += credits;
//         summary.pendingRequests += 1;
//       }

//       // ------------------------------------------------------
//       // REJECTED
//       // ------------------------------------------------------

//       if (promotion.status === "Rejected") {
//         summary.refundedCredits += credits;
//         summary.rejectedRequests += 1;
//       }

//       // ------------------------------------------------------
//       // SERVICE BREAKDOWN
//       // Only actually used promotions.
//       // ------------------------------------------------------

//       if (
//         !["Approved", "Expired"].includes(promotion.status)
//       ) {
//         return;
//       }

//       if (promotion.promotionType === "PROPERTY_BOOST") {
//         serviceSummary.propertyBoost.credits += credits;
//         serviceSummary.propertyBoost.count += 1;
//       }

//       if (promotion.promotionType === "FEATURED_7_DAYS") {
//         serviceSummary.featured.credits += credits;
//         serviceSummary.featured.count += 1;
//       }

//       if (
//         promotion.promotionType === "LOCALITY_TOP_30_DAYS"
//       ) {
//         serviceSummary.localityTop.credits += credits;
//         serviceSummary.localityTop.count += 1;
//       }
//     });

//     // ======================================================
//     // UNIQUE PARTNERS
//     // ======================================================

//     const partnerMap = new Map();

//     promotionHistory.forEach((promotion) => {
//       const partner = promotion.partnerMongoId;

//       if (!partner?._id) {
//         return;
//       }

//       const key = String(partner._id);

//       if (!partnerMap.has(key)) {
//         partnerMap.set(key, {
//           _id: partner._id,
//           partnerId: partner.partnerId,
//           name: partner.name,
//           email: partner.email,
//           phone: partner.phone,
//           partnerType: partner.partnerType,
//           isVerified: partner.isVerified,

//           creditWallet: partner.creditWallet,
//         });
//       }
//     });

//     // ======================================================
//     // CLEAN PROMOTION HISTORY
//     // ======================================================

//     const formattedHistory = promotionHistory.map(
//       (promotion) => ({
//         _id: promotion._id,

//         requestId: promotion.requestId,

//         partnerMongoId:
//           promotion.partnerMongoId?._id ||
//           promotion.partnerMongoId,

//         partnerCode:
//           promotion.partnerMongoId?.partnerId ||
//           promotion.partnerCode,

//         partnerName:
//           promotion.partnerMongoId?.name ||
//           promotion.partnerName,

//         partner:
//           promotion.partnerMongoId,

//         propertyMongoId:
//           promotion.propertyMongoId,

//         propertyCode:
//           promotion.propertyCode,

//         propertyTitle:
//           promotion.propertyTitle,

//         promotionType:
//           promotion.promotionType,

//         creditsCharged:
//           promotion.creditsCharged,

//         status:
//           promotion.status,

//         requestedAt:
//           promotion.requestedAt,

//         approvedAt:
//           promotion.approvedAt,

//         rejectedAt:
//           promotion.rejectedAt,

//         expiresAt:
//           promotion.expiresAt,

//         adminRemarks:
//           promotion.adminRemarks,

//         history:
//           promotion.history,
//       })
//     );

//     return res.status(200).json({
//       success: true,

//       data: {
//         property,

//         summary,

//         serviceSummary,

//         partners: Array.from(
//           partnerMap.values()
//         ),

//         promotionHistory:
//           formattedHistory,
//       },
//     });
//   } catch (error) {
//     console.error("Property Credit Details Error:", error);

//     return res.status(500).json({
//       success: false,
//       message: "Unable to fetch property credit details",
//       error: error.message,
//     });
//   }
// };

// export const getPartnerWallet = async (req, res) => {
//   try {
//     const partner = await Partner.findById(req.params.partnerId)
//       .select("partnerId name email phone isVerified isBlocked creditWallet")
//       .lean();

//     if (!partner) {
//       return res.status(404).json({ success: false, message: "Partner not found" });
//     }

//     const [
//       transactions,
//       pendingPromotions,
//       approvedPromotions,
//     ] = await Promise.all([
//       CreditTransaction.find({ partnerMongoId: partner._id })
//         .sort({ createdAt: -1 })
//         .limit(50)
//         .lean(),
//       PromotionRequest.countDocuments({
//         partnerMongoId: partner._id,
//         status: "Pending",
//       }),
//       PromotionRequest.countDocuments({
//         partnerMongoId: partner._id,
//         status: "Approved",
//       }),
//     ]);

//     return res.json({
//       success: true,
//       data: {
//         partner,
//         wallet: partner.creditWallet,
//         promotionSummary: {
//           pending: pendingPromotions,
//           approved: approvedPromotions,
//         },
//         recentTransactions: transactions,
//       },
//     });
//   } catch (error) {
//     return res.status(500).json({
//       success: false,
//       message: "Unable to fetch wallet",
//       error: error.message,
//     });
//   }
// };

// export const getCreditHistory = async (req, res) => {
//   try {
//     const page = Math.max(Number(req.query.page || 1), 1);
//     const limit = Math.min(Math.max(Number(req.query.limit || 20), 1), 100);
//     const { partnerId, type, productCode, direction, status } = req.query;

//     const query = {};
//     if (partnerId && mongoose.Types.ObjectId.isValid(partnerId)) {
//       query.partnerMongoId = partnerId;
//     }
//     if (type) query.type = type;
//     if (productCode) query.productCode = productCode;
//     if (direction) query.direction = direction;
//     if (status) query.status = status;

//     const [data, total] = await Promise.all([
//       CreditTransaction.find(query)
//         .sort({ createdAt: -1 })
//         .skip((page - 1) * limit)
//         .limit(limit)
//         .lean(),
//       CreditTransaction.countDocuments(query),
//     ]);

//     return res.json({
//       success: true,
//       data,
//       pagination: {
//         page,
//         limit,
//         total,
//         totalPages: Math.max(1, Math.ceil(total / limit)),
//       },
//     });
//   } catch (error) {
//     return res.status(500).json({
//       success: false,
//       message: "Unable to fetch credit history",
//       error: error.message,
//     });
//   }
// };

// // Admin manual refund/credit back.
// // This adds credits to wallet and always creates a REFUND ledger row.
// export const refundCredits = async (req, res) => {
//   const session = await mongoose.startSession();

//   try {
//     const {
//       partnerId,
//       credits,
//       relatedTransactionId = null,
//       reason = "",
//       actor = {},
//     } = req.body;

//     if (!mongoose.Types.ObjectId.isValid(partnerId)) {
//       return res.status(400).json({ success: false, message: "Invalid partnerId" });
//     }

//     let originalTransaction = null;

//     if (relatedTransactionId) {
//       if (!mongoose.Types.ObjectId.isValid(relatedTransactionId)) {
//         return res.status(400).json({
//           success: false,
//           message: "Invalid relatedTransactionId",
//         });
//       }

//       originalTransaction = await CreditTransaction.findById(relatedTransactionId);
//       if (!originalTransaction) {
//         return res.status(404).json({
//           success: false,
//           message: "Original credit transaction not found",
//         });
//       }

//       if (String(originalTransaction.partnerMongoId) !== String(partnerId)) {
//         return res.status(400).json({
//           success: false,
//           message: "Transaction does not belong to this partner",
//         });
//       }
//     }

//     const refundQty = Number(credits || originalTransaction?.credits || 0);

//     if (!Number.isFinite(refundQty) || refundQty <= 0) {
//       return res.status(400).json({
//         success: false,
//         message: "Valid refund credits are required",
//       });
//     }

//     let result;

//     await session.withTransaction(async () => {
//       result = await creditPartnerWallet({
//         partnerId,
//         credits: refundQty,
//         type: "REFUND",
//         productCode: originalTransaction?.productCode || "",
//         referenceType: originalTransaction?.referenceType || "Manual",
//         referenceId: originalTransaction?.referenceId || null,
//         relatedTransactionId: originalTransaction?._id || null,
//         description: reason || "Admin credit refund",
//         actor,
//         session,
//       });

//       if (originalTransaction) {
//         originalTransaction.status = "REFUNDED";
//         await originalTransaction.save({ session });
//       }
//     });

//     return res.json({
//       success: true,
//       message: `${refundQty} credits refunded`,
//       data: {
//         wallet: result.partner.creditWallet,
//         refundTransaction: result.transaction,
//       },
//     });
//   } catch (error) {
//     return res.status(500).json({
//       success: false,
//       message: "Unable to refund credits",
//       error: error.message,
//     });
//   } finally {
//     await session.endSession();
//   }
// };

// export const adjustPartnerCredits = async (req, res) => {
//   const session = await mongoose.startSession();

//   try {
//     const { partnerId, credits, direction, reason = "", actor = {} } = req.body;

//     if (!mongoose.Types.ObjectId.isValid(partnerId)) {
//       return res.status(400).json({ success: false, message: "Invalid partnerId" });
//     }

//     const qty = Number(credits);
//     if (!Number.isFinite(qty) || qty <= 0) {
//       return res.status(400).json({ success: false, message: "Invalid credits" });
//     }

//     let result;

//     await session.withTransaction(async () => {
//       if (direction === "CREDIT") {
//         result = await creditPartnerWallet({
//           partnerId,
//           credits: qty,
//           type: "ADMIN_ADJUSTMENT_CREDIT",
//           referenceType: "Manual",
//           description: reason,
//           actor,
//           session,
//         });
//       } else if (direction === "DEBIT") {
//         result = await debitPartnerWallet({
//           partnerId,
//           credits: qty,
//           type: "ADMIN_ADJUSTMENT_DEBIT",
//           referenceType: "Manual",
//           description: reason,
//           actor,
//           session,
//         });
//       } else {
//         throw new Error("direction must be CREDIT or DEBIT");
//       }
//     });

//     return res.json({
//       success: true,
//       message: "Partner credits adjusted successfully",
//       data: {
//         wallet: result.partner.creditWallet,
//         transaction: result.transaction,
//       },
//     });
//   } catch (error) {
//     const status = error.code === "INSUFFICIENT_CREDITS" ? 400 : 500;
//     return res.status(status).json({
//       success: false,
//       message: "Unable to adjust credits",
//       error: error.message,
//     });
//   } finally {
//     await session.endSession();
//   }
// };

// export const getCreditDashboard = async (req, res) => {
//   try {
//     const [
//       walletTotals,
//       transactionTotals,
//       serviceSpend,
//       partnerBalances,
//       pendingApprovals,
//     ] = await Promise.all([
//       Partner.aggregate([
//         {
//           $group: {
//             _id: null,
//             totalCreditsInPartnerWallets: {
//               $sum: { $ifNull: ["$creditWallet.balance", 0] },
//             },
//             totalPurchasedCredits: {
//               $sum: { $ifNull: ["$creditWallet.totalPurchased", 0] },
//             },
//             totalSpentCredits: {
//               $sum: { $ifNull: ["$creditWallet.totalSpent", 0] },
//             },
//             totalRefundedCredits: {
//               $sum: { $ifNull: ["$creditWallet.totalRefunded", 0] },
//             },
//             partnersWithCredits: {
//               $sum: {
//                 $cond: [{ $gt: [{ $ifNull: ["$creditWallet.balance", 0] }, 0] }, 1, 0],
//               },
//             },
//           },
//         },
//       ]),

//       CreditTransaction.aggregate([
//         {
//           $group: {
//             _id: "$type",
//             credits: { $sum: "$credits" },
//             rupees: { $sum: "$amountInRupees" },
//             count: { $sum: 1 },
//           },
//         },
//       ]),

//       CreditTransaction.aggregate([
//         {
//           $match: {
//             direction: "DEBIT",
//             productCode: { $ne: "" },
//             status: { $in: ["SUCCESS", "REFUNDED"] },
//           },
//         },
//         {
//           $group: {
//             _id: "$productCode",
//             totalCredits: { $sum: "$credits" },
//             transactions: { $sum: 1 },
//           },
//         },
//       ]),

//       Partner.find()
//         .select("partnerId name email phone isVerified creditWallet")
//         .sort({ "creditWallet.balance": -1 })
//         .lean(),

//       PromotionRequest.countDocuments({ status: "Pending" }),
//     ]);

//     const txMap = Object.fromEntries(
//       transactionTotals.map((row) => [row._id, row])
//     );

//     const wallet = walletTotals[0] || {
//       totalCreditsInPartnerWallets: 0,
//       totalPurchasedCredits: 0,
//       totalSpentCredits: 0,
//       totalRefundedCredits: 0,
//       partnersWithCredits: 0,
//     };

//     return res.json({
//       success: true,
//       data: {
//         overview: {
//           totalCreditsPurchased: wallet.totalPurchasedCredits,
//           totalCreditsCurrentlyWithPartners: wallet.totalCreditsInPartnerWallets,
//           totalCreditsSpent: wallet.totalSpentCredits,
//           totalCreditsRefunded: wallet.totalRefundedCredits,
//           totalPurchaseValueRupees: txMap.PURCHASE?.rupees || 0,
//           totalPurchaseTransactions: txMap.PURCHASE?.count || 0,
//           totalRefundTransactions: txMap.REFUND?.count || 0,
//           partnersWithCredits: wallet.partnersWithCredits,
//           pendingPromotionApprovals: pendingApprovals,
//         },
//         serviceSpend,
//         partnerBalances,
//         transactionBreakdown: transactionTotals,
//       },
//     });
//   } catch (error) {
//     return res.status(500).json({
//       success: false,
//       message: "Unable to fetch credit dashboard",
//       error: error.message,
//     });
//   }
// };


import mongoose from "mongoose";
import Partner from "../../models/Partner.js";
import CreditTransaction from "../../models/CreditTransaction.js";
import PromotionRequest from "../../models/PromotionRequest.js";
import NewProperty from "../../models/NewProperty.js";
import TeamWallet from "../../models/TeamWallet.js";
// import { CREDIT_RATE } from "../../config/creditPlans.js";
import {
  calculateCreditsFromAmount,
} from "../../services/creditPricingService.js";
import {
  creditPartnerWallet,
  debitPartnerWallet,
  makeActor,
} from "../../services/creditWalletService.js";

// Call this ONLY after your payment gateway says payment is actually captured/verified.
// Example: ₹5000 => 5000 credits because current rate is ₹1 = 1 credit.
export const completeCreditPurchase = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    const {
      partnerId,
      amountInRupees,
      payment = {},
      actor = {},
    } = req.body;

    if (!mongoose.Types.ObjectId.isValid(partnerId)) {
      return res.status(400).json({ success: false, message: "Invalid partnerId" });
    }

    const purchasingPartner = await Partner.findById(partnerId).select(
      "accountType isSubPartner isApproved isVerified isBlocked applicationStatus permissions"
    ).lean();

    if (!purchasingPartner) {
      return res.status(404).json({ success: false, message: "Partner not found" });
    }

    if (purchasingPartner.accountType === "subagent" || purchasingPartner.isSubPartner) {
      return res.status(403).json({
        success: false,
        code: "SUBAGENT_CANNOT_BUY_CREDITS",
        message: "Sub-Agents cannot buy credits. Credits must be allocated by the verified Team / Agency Owner.",
      });
    }

    if (
      !purchasingPartner.isApproved ||
      !purchasingPartner.isVerified ||
      purchasingPartner.isBlocked ||
      purchasingPartner.applicationStatus !== "Verified" ||
      !purchasingPartner.permissions?.canSpendCredits
    ) {
      return res.status(403).json({
        success: false,
        code: "PARTNER_NOT_VERIFIED",
        message: "Only approved and finally verified partners can buy credits.",
      });
    }

    const amount = Number(amountInRupees);
    if (!Number.isFinite(amount) || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "amountInRupees must be greater than 0",
      });
    }

    // Do not trust a frontend-only success flag in production.
    if (payment.provider && payment.signatureVerified !== true) {
      return res.status(400).json({
        success: false,
        message: "Payment must be verified before issuing credits",
      });
    }

    // const credits = Math.floor(amount / CREDIT_RATE.rupeesPerCredit);
    const pricing =
  await calculateCreditsFromAmount(
    amount
  );

const credits =
  pricing.credits;
    let result;

    await session.withTransaction(async () => {
      // result = await creditPartnerWallet({
      //   partnerId,
      //   credits,
      //   type: "PURCHASE",
      //   amountInRupees: amount,
      //   referenceType: "Purchase",
      //   payment,
      //   description: `Purchased ${credits} credits for ₹${amount}`,
      //   actor,
      //   session,
      // });
    
      result =
  await creditPartnerWallet({
    partnerId,

    credits,

    type: "PURCHASE",

    amountInRupees: amount,

    referenceType:
      "Purchase",

    payment,

    description:
      `Purchased ${credits} credits for ₹${amount}`,

    metadata: {
      creditsPerRupee:
        pricing.creditsPerRupee,

      pricingVersion:
        pricing.settingVersion,
    },

    actor,

    session,
  });
    });

    return res.status(201).json({
      success: true,
      message: `${credits} credits added successfully`,
      data: {
        creditsAdded: credits,
        wallet: result.partner.creditWallet,
        transaction: result.transaction,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to complete credit purchase",
      error: error.message,
    });
  } finally {
    await session.endSession();
  }
};


// ======================================================
// 1. GET ALL PARTNERS CREDIT OVERVIEW
// GET /api/credits/partners
// ======================================================

export const getPartnerCreditOverview = async (req, res) => {
  try {
    const {
      search = "",
      page = 1,
      limit = 50,
    } = req.query;

    const pageNumber = Math.max(Number(page) || 1, 1);
    const limitNumber = Math.min(
      Math.max(Number(limit) || 50, 1),
      100
    );

    // ======================================================
    // PARTNER FILTER
    // ======================================================

    const partnerQuery = {};

    if (search.trim()) {
      const regex = new RegExp(search.trim(), "i");

      partnerQuery.$or = [
        { name: regex },
        { partnerId: regex },
        { email: regex },
        { phone: regex },
      ];
    }

    // ======================================================
    // GET PARTNERS
    // ======================================================

    const [partners, totalPartners] = await Promise.all([
      Partner.find(partnerQuery)
        .select(
          `
            partnerId
            name
            email
            phone
            partnerType
            isVerified
            isBlocked
            isRejected
            creditWallet
            createdAt
          `
        )
        .sort({ createdAt: -1 })
        .skip((pageNumber - 1) * limitNumber)
        .limit(limitNumber)
        .lean(),

      Partner.countDocuments(partnerQuery),
    ]);

    if (!partners.length) {
      return res.status(200).json({
        success: true,
        data: [],
        pagination: {
          page: pageNumber,
          limit: limitNumber,
          total: totalPartners,
          totalPages: Math.max(
            1,
            Math.ceil(totalPartners / limitNumber)
          ),
        },
      });
    }

    const partnerIds = partners.map((partner) => partner._id);

    // Team/Agency credits live in TeamWallet. Prefer that live balance in the
    // admin list, including for wallets created before creditWallet mirroring.
    const teamWallets = await TeamWallet.find({
      ownerPartnerId: { $in: partnerIds },
    }).lean();
    const teamWalletMap = new Map(
      teamWallets.map((wallet) => [String(wallet.ownerPartnerId), wallet])
    );

    // ======================================================
    // CREDIT TRANSACTION SUMMARY
    // ======================================================

    const transactionSummary = await CreditTransaction.aggregate([
      {
        $match: {
          $or: [
            { walletOwnerPartnerId: { $in: partnerIds } },
            { attributedPartnerId: { $in: partnerIds } },
          ],
        },
      },

      {
        $group: {
          _id: {
            partnerMongoId: "$walletOwnerPartnerId",
            type: "$type",
            productCode: "$productCode",
            direction: "$direction",
            status: "$status",
          },

          credits: {
            $sum: "$credits",
          },

          amountInRupees: {
            $sum: "$amountInRupees",
          },

          count: {
            $sum: 1,
          },
        },
      },
    ]);

    // ======================================================
    // PROMOTION SUMMARY
    // ======================================================

    const promotionSummary = await PromotionRequest.aggregate([
      {
        $match: {
          partnerMongoId: {
            $in: partnerIds,
          },
        },
      },

      {
        $group: {
          _id: {
            partnerMongoId: "$partnerMongoId",
            promotionType: "$promotionType",
            status: "$status",
          },

          credits: {
            $sum: "$creditsCharged",
          },

          count: {
            $sum: 1,
          },
        },
      },
    ]);

    // ======================================================
    // CREATE RESPONSE
    // ======================================================

    const data = partners.map((partner) => {
      const partnerIdString = String(partner._id);

      const partnerTransactions = transactionSummary.filter(
        (item) =>
          String(item._id.partnerMongoId) === partnerIdString
      );

      const partnerPromotions = promotionSummary.filter(
        (item) =>
          String(item._id.partnerMongoId) === partnerIdString
      );

      // ------------------------------------------------------
      // PURCHASE
      // ------------------------------------------------------

      const purchases = partnerTransactions.filter(
        (item) =>
          item._id.type === "PURCHASE" &&
          item._id.status === "SUCCESS"
      );

      const purchasedCredits = purchases.reduce(
        (sum, item) => sum + Number(item.credits || 0),
        0
      );

      const purchaseAmount = purchases.reduce(
        (sum, item) => sum + Number(item.amountInRupees || 0),
        0
      );

      // ------------------------------------------------------
      // REFUND
      // ------------------------------------------------------

      const refunds = partnerTransactions.filter(
        (item) =>
          item._id.type === "REFUND" &&
          item._id.status === "SUCCESS"
      );

      const refundedCredits = refunds.reduce(
        (sum, item) => sum + Number(item.credits || 0),
        0
      );

      // ------------------------------------------------------
      // LEAD UNLOCK
      // ------------------------------------------------------

      const leadUnlockTransactions = partnerTransactions.filter(
        (item) =>
          item._id.type === "LEAD_UNLOCK_DEBIT" &&
          item._id.productCode === "LEAD_UNLOCK" &&
          item._id.direction === "DEBIT" &&
          item._id.status === "SUCCESS"
      );

      const leadUnlockCredits = leadUnlockTransactions.reduce(
        (sum, item) => sum + Number(item.credits || 0),
        0
      );

      const leadUnlockCount = leadUnlockTransactions.reduce(
        (sum, item) => sum + Number(item.count || 0),
        0
      );

      // ------------------------------------------------------
      // APPROVED / EXPIRED PROMOTIONS ONLY
      // ------------------------------------------------------

      const usedPromotions = partnerPromotions.filter((item) =>
        ["Approved", "Expired"].includes(item._id.status)
      );

      const getPromotion = (code) => {
        const rows = usedPromotions.filter(
          (item) => item._id.promotionType === code
        );

        return {
          credits: rows.reduce(
            (sum, item) => sum + Number(item.credits || 0),
            0
          ),

          count: rows.reduce(
            (sum, item) => sum + Number(item.count || 0),
            0
          ),
        };
      };

      const propertyBoost = getPromotion("PROPERTY_BOOST");
      const featured = getPromotion("FEATURED_7_DAYS");
      const localityTop = getPromotion("LOCALITY_TOP_30_DAYS");

      const wallet =
        teamWalletMap.get(partnerIdString) || partner.creditWallet || {};

      return {
        _id: partner._id,

        partnerId: partner.partnerId,
        name: partner.name,
        email: partner.email,
        phone: partner.phone,
        partnerType: partner.partnerType,

        isVerified: partner.isVerified,
        isBlocked: partner.isBlocked,
        isRejected: partner.isRejected,

        wallet: {
          currentBalance: Number(wallet.balance || 0),

          totalCreditsPurchased: Number(
            wallet.totalPurchased ?? purchasedCredits
          ),

          totalSpent: Number(wallet.totalSpent || 0),

          totalRefunded: Number(
            wallet.totalRefunded ?? refundedCredits
          ),

          purchaseAmount,
        },

        services: {
          propertyBoost,
          featured,
          localityTop,

          leadUnlock: {
            credits: leadUnlockCredits,
            count: leadUnlockCount,
          },
        },

        createdAt: partner.createdAt,
      };
    });

    return res.status(200).json({
      success: true,

      data,

      pagination: {
        page: pageNumber,
        limit: limitNumber,
        total: totalPartners,

        totalPages: Math.max(
          1,
          Math.ceil(totalPartners / limitNumber)
        ),
      },
    });
  } catch (error) {
    console.error("Partner Credit Overview Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch partner credit overview",
      error: error.message,
    });
  }
};


// ======================================================
// 2. GET SINGLE PARTNER COMPLETE CREDIT DETAILS
// GET /api/credits/partners/:partnerId
// ======================================================

export const getPartnerCreditDetails = async (req, res) => {
  try {
    const { partnerId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(partnerId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid partner ID",
      });
    }

    const partner = await Partner.findById(partnerId)
      .select(
        `
          partnerId
          name
          email
          phone
          partnerType
          role
          location
          isVerified
          isBlocked
          isRejected
          creditWallet
          createdAt
          updatedAt
        `
      )
      .lean();

    if (!partner) {
      return res.status(404).json({
        success: false,
        message: "Partner not found",
      });
    }

    const [creditHistory, promotionHistory] = await Promise.all([
      CreditTransaction.find({
        partnerMongoId: partner._id,
      })
        .sort({ createdAt: -1 })
        .lean(),

      PromotionRequest.find({
        partnerMongoId: partner._id,
      })
        .populate({
          path: "propertyMongoId",
          select:
            "propertyId title city locality status propertyVerificationStatus price images",
        })
        .sort({ createdAt: -1 })
        .lean(),
    ]);

    const serviceSummary = {
      propertyBoost: {
        credits: 0,
        count: 0,
      },

      featured: {
        credits: 0,
        count: 0,
      },

      localityTop: {
        credits: 0,
        count: 0,
      },

      leadUnlock: {
        credits: 0,
        count: 0,
      },
    };

    // ======================================================
    // PROMOTION USAGE
    // ======================================================

    promotionHistory.forEach((promotion) => {
      // Only actually approved/applied services count as usage.
      if (
        !["Approved", "Expired"].includes(promotion.status)
      ) {
        return;
      }

      const credits = Number(promotion.creditsCharged || 0);

      if (promotion.promotionType === "PROPERTY_BOOST") {
        serviceSummary.propertyBoost.credits += credits;
        serviceSummary.propertyBoost.count += 1;
      }

      if (promotion.promotionType === "FEATURED_7_DAYS") {
        serviceSummary.featured.credits += credits;
        serviceSummary.featured.count += 1;
      }

      if (
        promotion.promotionType === "LOCALITY_TOP_30_DAYS"
      ) {
        serviceSummary.localityTop.credits += credits;
        serviceSummary.localityTop.count += 1;
      }
    });

    // ======================================================
    // LEAD UNLOCK
    // ======================================================

    creditHistory.forEach((transaction) => {
      if (
        transaction.type === "LEAD_UNLOCK_DEBIT" &&
        transaction.productCode === "LEAD_UNLOCK" &&
        transaction.direction === "DEBIT" &&
        transaction.status === "SUCCESS"
      ) {
        serviceSummary.leadUnlock.credits += Number(
          transaction.credits || 0
        );

        serviceSummary.leadUnlock.count += 1;
      }
    });

    // ======================================================
    // SALES SUMMARY
    // ======================================================

    const successfulPurchases = creditHistory.filter(
      (transaction) =>
        transaction.type === "PURCHASE" &&
        transaction.status === "SUCCESS"
    );

    const successfulRefunds = creditHistory.filter(
      (transaction) =>
        transaction.type === "REFUND" &&
        transaction.status === "SUCCESS"
    );

    const purchasedCredits = successfulPurchases.reduce(
      (sum, transaction) =>
        sum + Number(transaction.credits || 0),
      0
    );

    const purchaseAmount = successfulPurchases.reduce(
      (sum, transaction) =>
        sum + Number(transaction.amountInRupees || 0),
      0
    );

    const refundedCredits = successfulRefunds.reduce(
      (sum, transaction) =>
        sum + Number(transaction.credits || 0),
      0
    );

    const wallet = partner.creditWallet || {};

    // ======================================================
    // PROPERTY/PROMOTION HISTORY
    // ======================================================

    const properties = promotionHistory.map((promotion) => ({
      _id: promotion._id,

      requestId: promotion.requestId,

      propertyMongoId:
        promotion.propertyMongoId?._id ||
        promotion.propertyMongoId,

      propertyCode:
        promotion.propertyMongoId?.propertyId ||
        promotion.propertyCode,

      propertyTitle:
        promotion.propertyMongoId?.title ||
        promotion.propertyTitle,

      property: promotion.propertyMongoId,

      city: promotion.city,
      locality: promotion.locality,

      promotionType: promotion.promotionType,
      creditsCharged: promotion.creditsCharged,

      status: promotion.status,

      requestedAt: promotion.requestedAt,
      approvedAt: promotion.approvedAt,
      rejectedAt: promotion.rejectedAt,
      expiresAt: promotion.expiresAt,

      adminRemarks: promotion.adminRemarks,
      history: promotion.history,
    }));

    return res.status(200).json({
      success: true,

      data: {
        partner,

        wallet: {
          balance: Number(wallet.balance || 0),

          totalPurchased: Number(
            wallet.totalPurchased ?? purchasedCredits
          ),

          totalSpent: Number(wallet.totalSpent || 0),

          totalRefunded: Number(
            wallet.totalRefunded ?? refundedCredits
          ),
        },

        salesSummary: {
          purchasedCredits,
          purchaseAmount,

          purchaseTransactions:
            successfulPurchases.length,

          refundedCredits,

          refundTransactions:
            successfulRefunds.length,
        },

        serviceSummary,

        promotionSummary: {
          total: promotionHistory.length,

          pending: promotionHistory.filter(
            (item) => item.status === "Pending"
          ).length,

          approved: promotionHistory.filter(
            (item) =>
              item.status === "Approved" ||
              item.status === "Expired"
          ).length,

          rejected: promotionHistory.filter(
            (item) => item.status === "Rejected"
          ).length,
        },

        properties,

        creditHistory,
      },
    });
  } catch (error) {
    console.error("Partner Credit Details Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch partner credit details",
      error: error.message,
    });
  }
};


// ======================================================
// 3. GET PROPERTY CREDIT OVERVIEW
// GET /api/credits/properties
// ======================================================

export const getPropertyCreditOverview = async (req, res) => {
  try {
    const {
      search = "",
      page = 1,
      limit = 50,
    } = req.query;

    const pageNumber = Math.max(Number(page) || 1, 1);

    const limitNumber = Math.min(
      Math.max(Number(limit) || 50, 1),
      100
    );

    // ======================================================
    // GET PROMOTION DATA GROUPED BY PROPERTY
    // ======================================================

    const promotionRows = await PromotionRequest.aggregate([
      {
        $group: {
          _id: "$propertyMongoId",

          propertyCode: {
            $first: "$propertyCode",
          },

          propertyTitle: {
            $first: "$propertyTitle",
          },

          city: {
            $first: "$city",
          },

          locality: {
            $first: "$locality",
          },

          totalRequests: {
            $sum: 1,
          },

          requests: {
            $push: {
              partnerMongoId: "$partnerMongoId",
              partnerCode: "$partnerCode",
              partnerName: "$partnerName",

              promotionType: "$promotionType",
              creditsCharged: "$creditsCharged",
              status: "$status",

              requestId: "$requestId",
              requestedAt: "$requestedAt",
              approvedAt: "$approvedAt",
              rejectedAt: "$rejectedAt",
              expiresAt: "$expiresAt",
            },
          },
        },
      },

      {
        $sort: {
          propertyTitle: 1,
        },
      },
    ]);

    // ======================================================
    // CREATE PROPERTY SUMMARY
    // ======================================================

    let data = promotionRows.map((row) => {
      const services = {
        propertyBoost: {
          credits: 0,
          count: 0,
        },

        featured: {
          credits: 0,
          count: 0,
        },

        localityTop: {
          credits: 0,
          count: 0,
        },
      };

      let totalCreditsUsed = 0;
      let totalCreditsReserved = 0;
      let totalCreditsRefunded = 0;

      const partnerMap = new Map();

      row.requests.forEach((request) => {
        const credits = Number(request.creditsCharged || 0);

        // --------------------------------------------------
        // APPROVED / EXPIRED = USED
        // --------------------------------------------------

        if (
          ["Approved", "Expired"].includes(request.status)
        ) {
          totalCreditsUsed += credits;

          if (request.promotionType === "PROPERTY_BOOST") {
            services.propertyBoost.credits += credits;
            services.propertyBoost.count += 1;
          }

          if (
            request.promotionType === "FEATURED_7_DAYS"
          ) {
            services.featured.credits += credits;
            services.featured.count += 1;
          }

          if (
            request.promotionType ===
            "LOCALITY_TOP_30_DAYS"
          ) {
            services.localityTop.credits += credits;
            services.localityTop.count += 1;
          }
        }

        // --------------------------------------------------
        // PENDING = RESERVED
        // --------------------------------------------------

        if (request.status === "Pending") {
          totalCreditsReserved += credits;
        }

        // --------------------------------------------------
        // REJECTED = REFUNDED
        // --------------------------------------------------

        if (request.status === "Rejected") {
          totalCreditsRefunded += credits;
        }

        // --------------------------------------------------
        // UNIQUE PARTNERS
        // --------------------------------------------------

        if (request.partnerMongoId) {
          const key = String(request.partnerMongoId);

          if (!partnerMap.has(key)) {
            partnerMap.set(key, {
              partnerMongoId: request.partnerMongoId,
              partnerCode: request.partnerCode,
              partnerName: request.partnerName,
            });
          }
        }
      });

      return {
        propertyMongoId: row._id,

        propertyCode: row.propertyCode,
        propertyTitle: row.propertyTitle,

        city: row.city,
        locality: row.locality,

        totalRequests: row.totalRequests,

        totalCreditsUsed,
        totalCreditsReserved,
        totalCreditsRefunded,

        services,

        partners: Array.from(partnerMap.values()),
      };
    });

    // ======================================================
    // SEARCH
    // ======================================================

    if (search.trim()) {
      const searchValue = search.trim().toLowerCase();

      data = data.filter((item) => {
        const propertyMatch =
          item.propertyCode
            ?.toLowerCase()
            .includes(searchValue) ||
          item.propertyTitle
            ?.toLowerCase()
            .includes(searchValue) ||
          item.city
            ?.toLowerCase()
            .includes(searchValue) ||
          item.locality
            ?.toLowerCase()
            .includes(searchValue);

        const partnerMatch = item.partners.some(
          (partner) =>
            partner.partnerName
              ?.toLowerCase()
              .includes(searchValue) ||
            partner.partnerCode
              ?.toLowerCase()
              .includes(searchValue)
        );

        return propertyMatch || partnerMatch;
      });
    }

    const total = data.length;

    const paginatedData = data.slice(
      (pageNumber - 1) * limitNumber,
      pageNumber * limitNumber
    );

    return res.status(200).json({
      success: true,

      data: paginatedData,

      pagination: {
        page: pageNumber,
        limit: limitNumber,
        total,

        totalPages: Math.max(
          1,
          Math.ceil(total / limitNumber)
        ),
      },
    });
  } catch (error) {
    console.error("Property Credit Overview Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch property credit overview",
      error: error.message,
    });
  }
};


// ======================================================
// 4. GET SINGLE PROPERTY CREDIT DETAILS
// GET /api/credits/properties/:propertyId
// ======================================================

export const getPropertyCreditDetails = async (req, res) => {
  try {
    const { propertyId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(propertyId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid property ID",
      });
    }

    // ======================================================
    // PROPERTY
    // ======================================================

    const property = await NewProperty.findById(propertyId)
      .select(
        `
          propertyId
          title
          transactionType
          category
          status
          propertyVerificationStatus
          price
          propertySize
          sizeUnit
          city
          locality
          address
          images
          addedBy
          assignedPartner
          boost
          createdAt
          updatedAt
        `
      )
      .lean();

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }

    // ======================================================
    // PROMOTION HISTORY
    // ======================================================

    const promotionHistory = await PromotionRequest.find({
      propertyMongoId: property._id,
    })
      .populate({
        path: "partnerMongoId",
        select:
          "partnerId name email phone partnerType isVerified creditWallet",
      })
      .sort({ createdAt: -1 })
      .lean();

    // ======================================================
    // SUMMARY
    // ======================================================

    const summary = {
      totalRequests: promotionHistory.length,

      usedCredits: 0,
      pendingCredits: 0,
      refundedCredits: 0,

      approvedRequests: 0,
      pendingRequests: 0,
      rejectedRequests: 0,
      expiredRequests: 0,
    };

    const serviceSummary = {
      propertyBoost: {
        credits: 0,
        count: 0,
      },

      featured: {
        credits: 0,
        count: 0,
      },

      localityTop: {
        credits: 0,
        count: 0,
      },
    };

    promotionHistory.forEach((promotion) => {
      const credits = Number(promotion.creditsCharged || 0);

      // ------------------------------------------------------
      // APPROVED
      // ------------------------------------------------------

      if (promotion.status === "Approved") {
        summary.usedCredits += credits;
        summary.approvedRequests += 1;
      }

      // ------------------------------------------------------
      // EXPIRED
      // Expired means service was previously applied.
      // ------------------------------------------------------

      if (promotion.status === "Expired") {
        summary.usedCredits += credits;
        summary.expiredRequests += 1;
      }

      // ------------------------------------------------------
      // PENDING
      // ------------------------------------------------------

      if (promotion.status === "Pending") {
        summary.pendingCredits += credits;
        summary.pendingRequests += 1;
      }

      // ------------------------------------------------------
      // REJECTED
      // ------------------------------------------------------

      if (promotion.status === "Rejected") {
        summary.refundedCredits += credits;
        summary.rejectedRequests += 1;
      }

      // ------------------------------------------------------
      // SERVICE BREAKDOWN
      // Only actually used promotions.
      // ------------------------------------------------------

      if (
        !["Approved", "Expired"].includes(promotion.status)
      ) {
        return;
      }

      if (promotion.promotionType === "PROPERTY_BOOST") {
        serviceSummary.propertyBoost.credits += credits;
        serviceSummary.propertyBoost.count += 1;
      }

      if (promotion.promotionType === "FEATURED_7_DAYS") {
        serviceSummary.featured.credits += credits;
        serviceSummary.featured.count += 1;
      }

      if (
        promotion.promotionType === "LOCALITY_TOP_30_DAYS"
      ) {
        serviceSummary.localityTop.credits += credits;
        serviceSummary.localityTop.count += 1;
      }
    });

    // ======================================================
    // UNIQUE PARTNERS
    // ======================================================

    const partnerMap = new Map();

    promotionHistory.forEach((promotion) => {
      const partner = promotion.partnerMongoId;

      if (!partner?._id) {
        return;
      }

      const key = String(partner._id);

      if (!partnerMap.has(key)) {
        partnerMap.set(key, {
          _id: partner._id,
          partnerId: partner.partnerId,
          name: partner.name,
          email: partner.email,
          phone: partner.phone,
          partnerType: partner.partnerType,
          isVerified: partner.isVerified,

          creditWallet: partner.creditWallet,
        });
      }
    });

    // ======================================================
    // CLEAN PROMOTION HISTORY
    // ======================================================

    const formattedHistory = promotionHistory.map(
      (promotion) => ({
        _id: promotion._id,

        requestId: promotion.requestId,

        partnerMongoId:
          promotion.partnerMongoId?._id ||
          promotion.partnerMongoId,

        partnerCode:
          promotion.partnerMongoId?.partnerId ||
          promotion.partnerCode,

        partnerName:
          promotion.partnerMongoId?.name ||
          promotion.partnerName,

        partner:
          promotion.partnerMongoId,

        propertyMongoId:
          promotion.propertyMongoId,

        propertyCode:
          promotion.propertyCode,

        propertyTitle:
          promotion.propertyTitle,

        promotionType:
          promotion.promotionType,

        creditsCharged:
          promotion.creditsCharged,

        status:
          promotion.status,

        requestedAt:
          promotion.requestedAt,

        approvedAt:
          promotion.approvedAt,

        rejectedAt:
          promotion.rejectedAt,

        expiresAt:
          promotion.expiresAt,

        adminRemarks:
          promotion.adminRemarks,

        history:
          promotion.history,
      })
    );

    return res.status(200).json({
      success: true,

      data: {
        property,

        summary,

        serviceSummary,

        partners: Array.from(
          partnerMap.values()
        ),

        promotionHistory:
          formattedHistory,
      },
    });
  } catch (error) {
    console.error("Property Credit Details Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch property credit details",
      error: error.message,
    });
  }
};

export const getPartnerWallet = async (req, res) => {
  try {
    const partner = await Partner.findById(req.params.partnerId)
      .select("partnerId name email phone isVerified isBlocked creditWallet")
      .lean();

    if (!partner) {
      return res.status(404).json({ success: false, message: "Partner not found" });
    }

    const [
      transactions,
      pendingPromotions,
      approvedPromotions,
    ] = await Promise.all([
      CreditTransaction.find({ partnerMongoId: partner._id })
        .sort({ createdAt: -1 })
        .limit(50)
        .lean(),
      PromotionRequest.countDocuments({
        partnerMongoId: partner._id,
        status: "Pending",
      }),
      PromotionRequest.countDocuments({
        partnerMongoId: partner._id,
        status: "Approved",
      }),
    ]);

    return res.json({
      success: true,
      data: {
        partner,
        wallet: partner.creditWallet,
        promotionSummary: {
          pending: pendingPromotions,
          approved: approvedPromotions,
        },
        recentTransactions: transactions,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to fetch wallet",
      error: error.message,
    });
  }
};

export const getCreditHistory = async (req, res) => {
  try {
    const page = Math.max(Number(req.query.page || 1), 1);
    const limit = Math.min(Math.max(Number(req.query.limit || 20), 1), 100);
    const { partnerId, type, productCode, direction, status } = req.query;

    const query = {};
    if (partnerId && mongoose.Types.ObjectId.isValid(partnerId)) {
      query.partnerMongoId = partnerId;
    }
    if (type) query.type = type;
    if (productCode) query.productCode = productCode;
    if (direction) query.direction = direction;
    if (status) query.status = status;

    const [data, total] = await Promise.all([
      CreditTransaction.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      CreditTransaction.countDocuments(query),
    ]);

    return res.json({
      success: true,
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to fetch credit history",
      error: error.message,
    });
  }
};

// Admin manual refund/credit back.
// This adds credits to wallet and always creates a REFUND ledger row.
export const refundCredits = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    const {
      partnerId,
      credits,
      relatedTransactionId = null,
      reason = "",
      actor = {},
    } = req.body;

    if (!mongoose.Types.ObjectId.isValid(partnerId)) {
      return res.status(400).json({ success: false, message: "Invalid partnerId" });
    }

    let originalTransaction = null;

    if (relatedTransactionId) {
      if (!mongoose.Types.ObjectId.isValid(relatedTransactionId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid relatedTransactionId",
        });
      }

      originalTransaction = await CreditTransaction.findById(relatedTransactionId);
      if (!originalTransaction) {
        return res.status(404).json({
          success: false,
          message: "Original credit transaction not found",
        });
      }

      if (String(originalTransaction.partnerMongoId) !== String(partnerId)) {
        return res.status(400).json({
          success: false,
          message: "Transaction does not belong to this partner",
        });
      }
    }

    const refundQty = Number(credits || originalTransaction?.credits || 0);

    if (!Number.isFinite(refundQty) || refundQty <= 0) {
      return res.status(400).json({
        success: false,
        message: "Valid refund credits are required",
      });
    }

    let result;

    await session.withTransaction(async () => {
      result = await creditPartnerWallet({
        partnerId,
        credits: refundQty,
        type: "REFUND",
        productCode: originalTransaction?.productCode || "",
        referenceType: originalTransaction?.referenceType || "Manual",
        referenceId: originalTransaction?.referenceId || null,
        relatedTransactionId: originalTransaction?._id || null,
        description: reason || "Admin credit refund",
        actor,
        session,
      });

      if (originalTransaction) {
        originalTransaction.status = "REFUNDED";
        await originalTransaction.save({ session });
      }
    });

    return res.json({
      success: true,
      message: `${refundQty} credits refunded`,
      data: {
        wallet: result.partner.creditWallet,
        refundTransaction: result.transaction,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to refund credits",
      error: error.message,
    });
  } finally {
    await session.endSession();
  }
};

export const adjustPartnerCredits = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    const { partnerId, credits, direction, reason = "", actor = {} } = req.body;

    if (!mongoose.Types.ObjectId.isValid(partnerId)) {
      return res.status(400).json({ success: false, message: "Invalid partnerId" });
    }

    const qty = Number(credits);
    if (!Number.isFinite(qty) || qty <= 0) {
      return res.status(400).json({ success: false, message: "Invalid credits" });
    }

    let result;

    await session.withTransaction(async () => {
      if (direction === "CREDIT") {
        result = await creditPartnerWallet({
          partnerId,
          credits: qty,
          type: "ADMIN_ADJUSTMENT_CREDIT",
          referenceType: "Manual",
          description: reason,
          actor,
          session,
        });
      } else if (direction === "DEBIT") {
        result = await debitPartnerWallet({
          partnerId,
          credits: qty,
          type: "ADMIN_ADJUSTMENT_DEBIT",
          referenceType: "Manual",
          description: reason,
          actor,
          session,
        });
      } else {
        throw new Error("direction must be CREDIT or DEBIT");
      }
    });

    return res.json({
      success: true,
      message: "Partner credits adjusted successfully",
      data: {
        wallet: result.partner.creditWallet,
        transaction: result.transaction,
      },
    });
  } catch (error) {
    const status = error.code === "INSUFFICIENT_CREDITS" ? 400 : 500;
    return res.status(status).json({
      success: false,
      message: "Unable to adjust credits",
      error: error.message,
    });
  } finally {
    await session.endSession();
  }
};

export const getCreditDashboard = async (req, res) => {
  try {
    const [
      purchaseSummary,
      refundSummary,
      walletSummary,
      totalPartners,
      pendingApprovals,
      approvedApprovals,
      rejectedApprovals,
      promotionUsage,
      leadUnlockUsage,
    ] = await Promise.all([
      CreditTransaction.aggregate([
        { $match: { type: "PURCHASE", direction: "CREDIT", status: "SUCCESS" } },
        { $group: { _id: null, totalCreditsSold: { $sum: "$credits" }, totalSalesAmount: { $sum: "$amountInRupees" }, totalPurchaseTransactions: { $sum: 1 } } },
      ]),
      CreditTransaction.aggregate([
        { $match: { type: "REFUND", direction: "CREDIT", status: "SUCCESS" } },
        { $group: { _id: null, totalRefundCredits: { $sum: "$credits" }, totalRefundTransactions: { $sum: 1 } } },
      ]),
      Partner.aggregate([
        { $group: {
          _id: null,
          creditsCurrentlyWithPartners: { $sum: { $ifNull: ["$creditWallet.balance", 0] } },
          totalCreditsSpent: { $sum: { $ifNull: ["$creditWallet.totalSpent", 0] } },
          partnersWithCredits: { $sum: { $cond: [{ $gt: [{ $ifNull: ["$creditWallet.balance", 0] }, 0] }, 1, 0] } },
        } },
      ]),
      Partner.countDocuments(),
      PromotionRequest.countDocuments({ status: "Pending" }),
      PromotionRequest.countDocuments({ status: { $in: ["Approved", "Expired"] } }),
      PromotionRequest.countDocuments({ status: "Rejected" }),
      PromotionRequest.aggregate([
        { $match: { status: { $in: ["Approved", "Expired"] } } },
        { $group: {
          _id: "$promotionType",
          totalCredits: { $sum: "$creditsCharged" },
          totalRequests: { $sum: 1 },
          uniqueProperties: { $addToSet: "$propertyMongoId" },
          uniquePartners: { $addToSet: "$partnerMongoId" },
        } },
        { $project: { totalCredits: 1, totalRequests: 1, propertiesCount: { $size: "$uniqueProperties" }, partnersCount: { $size: "$uniquePartners" } } },
      ]),
      CreditTransaction.aggregate([
        { $match: { type: "LEAD_UNLOCK_DEBIT", productCode: "LEAD_UNLOCK", direction: "DEBIT", status: "SUCCESS" } },
        { $group: { _id: null, totalCredits: { $sum: "$credits" }, totalRequests: { $sum: 1 }, uniquePartners: { $addToSet: "$partnerMongoId" } } },
        { $project: { totalCredits: 1, totalRequests: 1, partnersCount: { $size: "$uniquePartners" } } },
      ]),
    ]);

    const purchase = purchaseSummary[0] || {};
    const refund = refundSummary[0] || {};
    const wallet = walletSummary[0] || {};

    const serviceMap = {
      PROPERTY_BOOST: { code: "PROPERTY_BOOST", name: "Property Boost", creditPerService: 99, totalCredits: 0, totalRequests: 0, propertiesCount: 0, partnersCount: 0 },
      FEATURED_7_DAYS: { code: "FEATURED_7_DAYS", name: "Featured Property", creditPerService: 199, totalCredits: 0, totalRequests: 0, propertiesCount: 0, partnersCount: 0 },
      LOCALITY_TOP_30_DAYS: { code: "LOCALITY_TOP_30_DAYS", name: "Locality Top", creditPerService: 399, totalCredits: 0, totalRequests: 0, propertiesCount: 0, partnersCount: 0 },
      LEAD_UNLOCK: { code: "LEAD_UNLOCK", name: "Lead Unlock", creditPerService: 149, totalCredits: 0, totalRequests: 0, propertiesCount: 0, partnersCount: 0 },
    };

    promotionUsage.forEach((row) => {
      if (serviceMap[row._id]) serviceMap[row._id] = { ...serviceMap[row._id], totalCredits: row.totalCredits || 0, totalRequests: row.totalRequests || 0, propertiesCount: row.propertiesCount || 0, partnersCount: row.partnersCount || 0 };
    });
    if (leadUnlockUsage[0]) serviceMap.LEAD_UNLOCK = { ...serviceMap.LEAD_UNLOCK, totalCredits: leadUnlockUsage[0].totalCredits || 0, totalRequests: leadUnlockUsage[0].totalRequests || 0, partnersCount: leadUnlockUsage[0].partnersCount || 0 };

    return res.status(200).json({
      success: true,
      data: {
        overview: {
          totalCreditsSold: purchase.totalCreditsSold || 0,
          totalCreditSalesAmount: purchase.totalSalesAmount || 0,
          totalPurchaseTransactions: purchase.totalPurchaseTransactions || 0,
          creditsCurrentlyWithPartners: wallet.creditsCurrentlyWithPartners || 0,
          totalCreditsSpent: wallet.totalCreditsSpent || 0,
          totalRefundCredits: refund.totalRefundCredits || 0,
          totalRefundTransactions: refund.totalRefundTransactions || 0,
          totalPartners,
          partnersWithCredits: wallet.partnersWithCredits || 0,
          pendingPromotionApprovals: pendingApprovals,
          approvedPromotionApprovals: approvedApprovals,
          rejectedPromotionApprovals: rejectedApprovals,
        },
        serviceUsage: Object.values(serviceMap),
      },
    });
  } catch (error) {
    console.error("Credit Dashboard Error:", error);
    return res.status(500).json({ success: false, message: "Unable to fetch credit dashboard", error: error.message });
  }
};

