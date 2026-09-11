// import mongoose from "mongoose";
// import Visit from "../../models/Visit.js";
// import Property from "../../models/NewProperty.js";
// import Partner from "../../models/Partner.js";

// const VALID_STATUSES = [
//   "Requested",
//   "Upcoming",
//   "Completed",
//   "Cancelled",
//   "No Show",
//   "Rescheduled",
//   "Follow-up",
// ];

// const generateVisitId = async () => {
//   const last = await Visit.findOne({ visitId: /^VIS-/ })
//     .sort({ createdAt: -1 })
//     .select("visitId")
//     .lean();

//   const lastNumber = Number(String(last?.visitId || "VIS-1000").replace("VIS-", "")) || 1000;
//   return `VIS-${lastNumber + 1}`;
// };

// const getDayBounds = (date = new Date()) => {
//   const start = new Date(date);
//   start.setHours(0, 0, 0, 0);
//   const end = new Date(date);
//   end.setHours(23, 59, 59, 999);
//   return { start, end };
// };

// const addHistory = (visit, { action, fromStatus = "", toStatus = "", remarks = "", actor = {} }) => {
//   visit.history.push({
//     action,
//     fromStatus,
//     toStatus,
//     remarks,
//     updatedBy: {
//       userId: actor?.userId || null,
//       name: actor?.name || "Admin",
//       role: actor?.role || "Admin",
//     },
//   });
// };

// export const createVisitRequest = async (req, res) => {
//   try {
//     const {
//       propertyId,
//       partnerId,
//       requestedVisitAt,
//       requestNotes = "",
//       requestedBy = {},
//     } = req.body;

//     if (!mongoose.Types.ObjectId.isValid(propertyId)) {
//       return res.status(400).json({ success: false, message: "Invalid property ID." });
//     }
//     if (!mongoose.Types.ObjectId.isValid(partnerId)) {
//       return res.status(400).json({ success: false, message: "Invalid partner ID." });
//     }
//     if (!requestedVisitAt || Number.isNaN(new Date(requestedVisitAt).getTime())) {
//       return res.status(400).json({ success: false, message: "Valid visit date/time is required." });
//     }

//     const [property, partner] = await Promise.all([
//       Property.findById(propertyId),
//       Partner.findById(partnerId).select("partnerId name phone email partnerType isBlocked isRejected"),
//     ]);

//     if (!property) {
//       return res.status(404).json({ success: false, message: "Property not found." });
//     }
//     if (!partner) {
//       return res.status(404).json({ success: false, message: "Partner not found." });
//     }
//     if (partner.isBlocked || partner.isRejected) {
//       return res.status(400).json({ success: false, message: "This partner cannot request a visit." });
//     }

//     if (String(property?.assignedPartner?.partnerId || "") !== String(partner._id)) {
//       return res.status(403).json({
//         success: false,
//         message: "Visit can only be requested by the partner assigned to this property.",
//       });
//     }

//     const visitTime = new Date(requestedVisitAt);

//     const duplicate = await Visit.findOne({
//       propertyId: property._id,
//       partnerId: partner._id,
//       approvalStatus: { $ne: "Rejected" },
//       status: { $in: ["Requested", "Upcoming", "Rescheduled", "Follow-up"] },
//       requestedVisitAt: {
//         $gte: new Date(visitTime.getTime() - 60 * 60 * 1000),
//         $lte: new Date(visitTime.getTime() + 60 * 60 * 1000),
//       },
//     });

//     if (duplicate) {
//       return res.status(409).json({
//         success: false,
//         message: "A visit request already exists near this time for the same property and partner.",
//       });
//     }

//     const visitId = await generateVisitId();
//     const image = property?.images?.[0]?.url || "";

//     const visit = await Visit.create({
//       visitId,
//       propertyId: property._id,
//       partnerId: partner._id,
//       requestedVisitAt: visitTime,
//       approvalStatus: "Pending",
//       status: "Requested",
//       outcome: "Pending",
//       requestNotes,
//       requestedBy: {
//         userId: requestedBy?.userId || partner._id,
//         name: requestedBy?.name || partner.name,
//         role: requestedBy?.role || "Partner",
//       },
//       propertySnapshot: {
//         propertyCode: property.propertyId || "",
//         title: property.title || "",
//         projectName: property.projectName || "",
//         category: property.category || "",
//         city: property.city || "",
//         locality: property.locality || "",
//         address: property.address || "",
//         image,
//         latitude: property.latitude ?? null,
//         longitude: property.longitude ?? null,
//       },
//       partnerSnapshot: {
//         partnerCode: partner.partnerId || "",
//         name: partner.name || "",
//         phone: partner.phone || "",
//         email: partner.email || "",
//         partnerType: partner.partnerType || "",
//       },
//       history: [
//         {
//           action: "Visit Requested",
//           fromStatus: "",
//           toStatus: "Requested",
//           remarks: requestNotes || "Visit request submitted by partner",
//           updatedBy: {
//             userId: requestedBy?.userId || partner._id,
//             name: requestedBy?.name || partner.name,
//             role: requestedBy?.role || "Partner",
//           },
//         },
//       ],
//     });

//     return res.status(201).json({
//       success: true,
//       message: "Visit request submitted for admin approval.",
//       data: visit,
//     });
//   } catch (error) {
//     console.error("Create Visit Request Error:", error);
//     return res.status(500).json({ success: false, message: "Failed to create visit request.", error: error.message });
//   }
// };

// // ======================================================
// // ADMIN: LIST VISITS WITH FILTERS
// // tab = Today | Upcoming | Completed | Cancelled | No Show | Rescheduled | Follow-up | All
// // ======================================================
// export const getAdminVisits = async (req, res) => {
//   try {
//     const {
//       tab = "Today",
//       status = "All",
//       approvalStatus = "All",
//       location = "All",
//       search = "",
//       page = 1,
//       limit = 10,
//     } = req.query;

//     const query = {};
//     const { start, end } = getDayBounds();

//     if (tab === "Today") {
//       query.requestedVisitAt = { $gte: start, $lte: end };
//     } else if (tab === "Upcoming") {
//       query.status = { $in: ["Upcoming", "Requested"] };
//       query.requestedVisitAt = { $gt: end };
//     } else if (["Completed", "Cancelled", "No Show", "Rescheduled", "Follow-up"].includes(tab)) {
//       query.status = tab;
//     }

//     if (status !== "All" && VALID_STATUSES.includes(status)) {
//       query.status = status;
//     }

//     if (["Pending", "Approved", "Rejected"].includes(approvalStatus)) {
//       query.approvalStatus = approvalStatus;
//     }

//     if (location && location !== "All") {
//       query["propertySnapshot.city"] = new RegExp(`^${location}$`, "i");
//     }

//     if (search.trim()) {
//       const regex = new RegExp(search.trim(), "i");
//       query.$or = [
//         { visitId: regex },
//         { "propertySnapshot.propertyCode": regex },
//         { "propertySnapshot.title": regex },
//         { "propertySnapshot.projectName": regex },
//         { "propertySnapshot.city": regex },
//         { "propertySnapshot.locality": regex },
//         { "partnerSnapshot.partnerCode": regex },
//         { "partnerSnapshot.name": regex },
//         { "partnerSnapshot.phone": regex },
//       ];
//     }

//     const pageNumber = Math.max(1, Number(page) || 1);
//     const pageSize = Math.min(100, Math.max(1, Number(limit) || 10));

//     const [visits, total] = await Promise.all([
//       Visit.find(query)
//         .populate("propertyId", "propertyId title projectName category city locality address images price propertySize sizeUnit bedrooms bathrooms latitude longitude assignedPartner")
//         .populate("partnerId", "partnerId name email phone partnerType location isVerified isBlocked")
//         .sort({ requestedVisitAt: 1, createdAt: -1 })
//         .skip((pageNumber - 1) * pageSize)
//         .limit(pageSize)
//         .lean(),
//       Visit.countDocuments(query),
//     ]);

//     return res.status(200).json({
//       success: true,
//       message: "Visits fetched successfully.",
//       count: visits.length,
//       total,
//       page: pageNumber,
//       totalPages: Math.max(1, Math.ceil(total / pageSize)),
//       data: visits,
//     });
//   } catch (error) {
//     console.error("Get Admin Visits Error:", error);
//     return res.status(500).json({ success: false, message: "Failed to fetch visits.", error: error.message });
//   }
// };

// // ======================================================
// // ADMIN: SUMMARY COUNTS + LOCATIONS
// // ======================================================
// export const getVisitSummary = async (req, res) => {
//   try {
//     const { start, end } = getDayBounds();
//     const now = new Date();

//     const [today, upcoming, completed, cancelled, noShow, rescheduled, followUp, pendingApproval, locations] = await Promise.all([
//       Visit.countDocuments({ requestedVisitAt: { $gte: start, $lte: end } }),
//       Visit.countDocuments({ status: { $in: ["Upcoming", "Requested"] }, requestedVisitAt: { $gt: end } }),
//       Visit.countDocuments({ status: "Completed" }),
//       Visit.countDocuments({ status: "Cancelled" }),
//       Visit.countDocuments({ status: "No Show" }),
//       Visit.countDocuments({ status: "Rescheduled" }),
//       Visit.countDocuments({ status: "Follow-up" }),
//       Visit.countDocuments({ approvalStatus: "Pending" }),
//       Visit.distinct("propertySnapshot.city", { "propertySnapshot.city": { $ne: "" } }),
//     ]);

//     return res.status(200).json({
//       success: true,
//       data: {
//         today,
//         upcoming,
//         completed,
//         cancelled,
//         noShow,
//         rescheduled,
//         followUp,
//         pendingApproval,
//         generatedAt: now,
//         locations: locations.sort(),
//       },
//     });
//   } catch (error) {
//     console.error("Visit Summary Error:", error);
//     return res.status(500).json({ success: false, message: "Failed to fetch visit summary.", error: error.message });
//   }
// };

// // ======================================================
// // ADMIN: VISIT DETAIL + PROPERTY/PARTNER + HISTORY
// // ======================================================
// export const getVisitById = async (req, res) => {
//   try {
//     const { id } = req.params;
//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       return res.status(400).json({ success: false, message: "Invalid visit ID." });
//     }

//     const visit = await Visit.findById(id)
//       .populate("propertyId", "propertyId title projectName developerName category transactionType status city locality address images price propertySize sizeUnit bedrooms bathrooms balconies parking furnishing amenities latitude longitude assignedPartner")
//       .populate("partnerId", "partnerId name email phone partnerType location isVerified isBlocked assignedProperties")
//       .lean();

//     if (!visit) {
//       return res.status(404).json({ success: false, message: "Visit not found." });
//     }

//     const visitHistory = await Visit.find({ propertyId: visit.propertyId?._id || visit.propertyId })
//       .select("visitId partnerSnapshot requestedVisitAt approvedVisitAt completedAt approvalStatus status outcome requestNotes adminRemarks partnerRemarks followUpAt history createdAt")
//       .sort({ requestedVisitAt: -1 })
//       .lean();

//     return res.status(200).json({
//       success: true,
//       data: {
//         visit,
//         property: visit.propertyId || null,
//         partner: visit.partnerId || null,
//         visitHistory,
//       },
//     });
//   } catch (error) {
//     console.error("Get Visit Detail Error:", error);
//     return res.status(500).json({ success: false, message: "Failed to fetch visit details.", error: error.message });
//   }
// };

// // ======================================================
// // ADMIN: APPROVE / REJECT REQUEST
// // body: { action: "approve"|"reject", actor, remarks, approvedVisitAt? }
// // ======================================================
// export const reviewVisitRequest = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { action, actor = {}, remarks = "", approvedVisitAt } = req.body;

//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       return res.status(400).json({ success: false, message: "Invalid visit ID." });
//     }
//     if (!['approve', 'reject'].includes(String(action).toLowerCase())) {
//       return res.status(400).json({ success: false, message: "Action must be approve or reject." });
//     }

//     const visit = await Visit.findById(id);
//     if (!visit) {
//       return res.status(404).json({ success: false, message: "Visit not found." });
//     }
//     if (visit.approvalStatus !== "Pending") {
//       return res.status(409).json({ success: false, message: `Visit request is already ${visit.approvalStatus.toLowerCase()}.` });
//     }

//     const oldStatus = visit.status;
//     const normalized = String(action).toLowerCase();

//     if (normalized === "approve") {
//       const finalDate = approvedVisitAt ? new Date(approvedVisitAt) : visit.requestedVisitAt;
//       if (Number.isNaN(finalDate.getTime())) {
//         return res.status(400).json({ success: false, message: "Invalid approved visit date/time." });
//       }
//       visit.approvalStatus = "Approved";
//       visit.status = "Upcoming";
//       visit.approvedVisitAt = finalDate;
//       visit.requestedVisitAt = finalDate;
//       visit.approvedBy = {
//         userId: actor?.userId || null,
//         name: actor?.name || "Admin",
//         role: actor?.role || "Admin",
//         approvedAt: new Date(),
//       };
//       visit.adminRemarks = remarks || visit.adminRemarks;
//       addHistory(visit, {
//         action: "Visit Approved",
//         fromStatus: oldStatus,
//         toStatus: "Upcoming",
//         remarks: remarks || "Visit request approved by admin",
//         actor,
//       });
//     } else {
//       visit.approvalStatus = "Rejected";
//       visit.status = "Cancelled";
//       visit.outcome = "Cancelled";
//       visit.adminRemarks = remarks || "Visit request rejected by admin";
//       addHistory(visit, {
//         action: "Visit Rejected",
//         fromStatus: oldStatus,
//         toStatus: "Cancelled",
//         remarks: visit.adminRemarks,
//         actor,
//       });
//     }

//     await visit.save();
//     return res.status(200).json({
//       success: true,
//       message: normalized === "approve" ? "Visit approved successfully." : "Visit request rejected.",
//       data: visit,
//     });
//   } catch (error) {
//     console.error("Review Visit Request Error:", error);
//     return res.status(500).json({ success: false, message: "Failed to review visit request.", error: error.message });
//   }
// };

// // ======================================================
// // ADMIN/PARTNER: UPDATE VISIT STATUS
// // body: { status, outcome?, remarks?, nextVisitAt?, followUpAt?, actor }
// // ======================================================
// export const updateVisitStatus = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const {
//       status,
//       outcome,
//       remarks = "",
//       nextVisitAt,
//       followUpAt,
//       actor = {},
//     } = req.body;

//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       return res.status(400).json({ success: false, message: "Invalid visit ID." });
//     }
//     if (!VALID_STATUSES.includes(status) || status === "Requested") {
//       return res.status(400).json({ success: false, message: "Invalid visit status." });
//     }

//     const visit = await Visit.findById(id);
//     if (!visit) {
//       return res.status(404).json({ success: false, message: "Visit not found." });
//     }

//     const oldStatus = visit.status;

//     if (status === "Rescheduled") {
//       const nextDate = new Date(nextVisitAt);
//       if (!nextVisitAt || Number.isNaN(nextDate.getTime())) {
//         return res.status(400).json({ success: false, message: "New visit date/time is required for reschedule." });
//       }
//       visit.requestedVisitAt = nextDate;
//       visit.approvedVisitAt = nextDate;
//       visit.rescheduleReason = remarks;
//     }

//     if (status === "Follow-up") {
//       const nextFollowUp = followUpAt ? new Date(followUpAt) : null;
//       if (followUpAt && Number.isNaN(nextFollowUp.getTime())) {
//         return res.status(400).json({ success: false, message: "Invalid follow-up date/time." });
//       }
//       visit.followUpAt = nextFollowUp;
//     }

//     if (status === "Completed") {
//       visit.completedAt = new Date();
//       visit.outcome = outcome || "Completed";
//     }

//     if (status === "Cancelled") {
//       visit.cancellationReason = remarks;
//       visit.outcome = outcome || "Cancelled";
//     }

//     if (status === "No Show") {
//       visit.outcome = outcome || "No Show";
//     }

//     visit.status = status;
//     if (outcome) visit.outcome = outcome;
//     if (actor?.role?.toLowerCase() === "partner") {
//       visit.partnerRemarks = remarks || visit.partnerRemarks;
//     } else {
//       visit.adminRemarks = remarks || visit.adminRemarks;
//     }

//     addHistory(visit, {
//       action: `Visit ${status}`,
//       fromStatus: oldStatus,
//       toStatus: status,
//       remarks,
//       actor,
//     });

//     await visit.save();
//     return res.status(200).json({
//       success: true,
//       message: `Visit marked as ${status}.`,
//       data: visit,
//     });
//   } catch (error) {
//     console.error("Update Visit Status Error:", error);
//     return res.status(500).json({ success: false, message: "Failed to update visit status.", error: error.message });
//   }
// };

// // ======================================================
// // PARTNER: OWN VISITS
// // ======================================================
// export const getVisitsByPartner = async (req, res) => {
//   try {
//     const { partnerId } = req.params;
//     if (!mongoose.Types.ObjectId.isValid(partnerId)) {
//       return res.status(400).json({ success: false, message: "Invalid partner ID." });
//     }

//     const visits = await Visit.find({ partnerId })
//       .populate("propertyId", "propertyId title projectName city locality address images status")
//       .sort({ requestedVisitAt: -1 })
//       .lean();

//     return res.status(200).json({ success: true, count: visits.length, data: visits });
//   } catch (error) {
//     return res.status(500).json({ success: false, message: "Failed to fetch partner visits.", error: error.message });
//   }
// };

import mongoose from "mongoose";
import Visit from "../../models/Visit.js";
import Property from "../../models/NewProperty.js";
import Partner from "../../models/Partner.js";
import Buyer from "../../models/Buyer.js";
import Lead from "../../models/Lead.js";

const makeVisitId = async () => {
  for (let i = 0; i < 10; i += 1) {
    const id = `VIS-${Math.floor(100000 + Math.random() * 900000)}`;
    const exists = await Visit.exists({ visitId: id });
    if (!exists) return id;
  }

  return `VIS-${Date.now().toString().slice(-8)}`;
};

const validObjectId = (value) =>
  value && mongoose.Types.ObjectId.isValid(value);

const makePropertySnapshot = (property) => ({
  propertyCode: property?.propertyId || "",
  title: property?.title || property?.projectName || "",
  projectName: property?.projectName || "",
  category: property?.category || "",
  city: property?.city || "",
  locality: property?.locality || "",
  address: property?.address || "",
  image: property?.images?.[0]?.url || "",
  latitude:
    property?.latitude !== undefined && property?.latitude !== null
      ? Number(property.latitude)
      : null,
  longitude:
    property?.longitude !== undefined && property?.longitude !== null
      ? Number(property.longitude)
      : null,
});

const makePartnerSnapshot = (partner) => ({
  partnerCode: partner?.partnerId || "",
  name: partner?.name || "",
  phone: partner?.phone || "",
  email: partner?.email || "",
  partnerType: partner?.partnerType || "",
});

const makeBuyerSnapshot = (buyer) => ({
  buyerCode: buyer?.buyerId || "",
  name: buyer?.name || "",
  phone: buyer?.phone || "",
  email: buyer?.email || "",
  city: buyer?.location?.city || "",
});

export const getVisitSummary = async (req, res) => {
  try {
    const now = new Date();
    const istNow = new Date(now.getTime() + 330 * 60 * 1000);
    istNow.setUTCHours(0, 0, 0, 0);
    const todayStart = new Date(istNow.getTime() - 330 * 60 * 1000);
    const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);
    const effectiveDate = {
      $cond: [
        { $and: [{ $eq: ["$status", "Follow-up"] }, { $ne: ["$followUpAt", null] }] },
        "$followUpAt",
        { $cond: [{ $eq: ["$status", "Rescheduled"] }, "$requestedVisitAt", { $ifNull: ["$approvedVisitAt", "$requestedVisitAt"] }] },
      ],
    };
    const visible = {
      $or: [
        { requestSource: { $ne: "subagent" } },
        { requestSource: "subagent", teamApprovalStatus: "Forwarded" },
      ],
    };
    const [
      total,
      requested,
      upcoming,
      completed,
      cancelled,
      noShow,
      rescheduled,
      followUp,
      today,
      missed,
      pendingApproval,
      locations,
    ] = await Promise.all([
      Visit.countDocuments(visible),
      Visit.countDocuments({ ...visible, status: "Requested" }),
      Visit.countDocuments({ ...visible, status: { $in: ["Requested", "Upcoming"] }, $expr: { $gte: [effectiveDate, todayEnd] } }),
      Visit.countDocuments({ ...visible, status: "Completed" }),
      Visit.countDocuments({ ...visible, status: "Cancelled" }),
      Visit.countDocuments({ ...visible, status: "No Show" }),
      Visit.countDocuments({ ...visible, status: "Rescheduled" }),
      Visit.countDocuments({ ...visible, status: "Follow-up" }),
      Visit.countDocuments({ ...visible, $expr: { $and: [{ $gte: [effectiveDate, todayStart] }, { $lt: [effectiveDate, todayEnd] }] } }),
      Visit.countDocuments({ ...visible, status: { $in: ["Requested", "Upcoming"] }, $expr: { $lt: [effectiveDate, now] } }),
      Visit.countDocuments({ ...visible, approvalStatus: "Pending" }),
      Visit.distinct("propertySnapshot.city", visible),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        total,
        requested,
        upcoming,
        completed,
        cancelled,
        noShow,
        rescheduled,
        followUp,
        today,
        missed,
        pendingApproval,
        locations: locations.filter(Boolean).sort(),
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to fetch visit summary.",
      error: error.message,
    });
  }
};

export const getAdminVisits = async (req, res) => {
  try {
    const {
      status = "",
      tab = "Today",
      approvalStatus = "",
      partnerId = "",
      buyerId = "",
      propertyId = "",
      search = "",
      location = "",
      page = 1,
      limit = 10,
    } = req.query;

    const now = new Date();
    const istNow = new Date(now.getTime() + 330 * 60 * 1000);
    istNow.setUTCHours(0, 0, 0, 0);
    const todayStart = new Date(istNow.getTime() - 330 * 60 * 1000);
    const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);
    const effectiveDate = {
      $cond: [
        { $and: [{ $eq: ["$status", "Follow-up"] }, { $ne: ["$followUpAt", null] }] },
        "$followUpAt",
        { $cond: [{ $eq: ["$status", "Rescheduled"] }, "$requestedVisitAt", { $ifNull: ["$approvedVisitAt", "$requestedVisitAt"] }] },
      ],
    };
    const clauses = [{
      $or: [
        { requestSource: { $ne: "subagent" } },
        { requestSource: "subagent", teamApprovalStatus: "Forwarded" },
      ],
    }];

    const exactStatusTabs = ["Completed", "Cancelled", "No Show", "Rescheduled", "Follow-up"];
    if (tab === "Today") {
      clauses.push({ $expr: { $and: [{ $gte: [effectiveDate, todayStart] }, { $lt: [effectiveDate, todayEnd] }] } });
    } else if (tab === "Upcoming") {
      clauses.push({ status: { $in: ["Requested", "Upcoming"] } });
      clauses.push({ $expr: { $gte: [effectiveDate, todayEnd] } });
    } else if (tab === "Missed") {
      clauses.push({ status: { $in: ["Requested", "Upcoming"] } });
      clauses.push({ $expr: { $lt: [effectiveDate, now] } });
    } else if (exactStatusTabs.includes(tab)) {
      clauses.push({ status: tab });
    }

    if (status && status !== "All" && !exactStatusTabs.includes(tab) && !["Upcoming", "Missed"].includes(tab)) {
      clauses.push({ status });
    }

    if (approvalStatus && approvalStatus !== "All") {
      clauses.push({ approvalStatus });
    }

    if (validObjectId(partnerId)) {
      clauses.push({ partnerId });
    }

    if (validObjectId(buyerId)) {
      clauses.push({ buyerId });
    }

    if (validObjectId(propertyId)) {
      clauses.push({ propertyId });
    }

    if (location && location !== "All") {
      clauses.push({ $or: [{ "propertySnapshot.city": location }, { "propertySnapshot.locality": location }] });
    }

    if (search.trim()) {
      const regex = new RegExp(search.trim(), "i");

      clauses.push({ $or: [
        { visitId: regex },
        { "buyerSnapshot.name": regex },
        { "buyerSnapshot.phone": regex },
        { "buyerSnapshot.buyerCode": regex },
        { "partnerSnapshot.name": regex },
        { "partnerSnapshot.partnerCode": regex },
        { "propertySnapshot.title": regex },
        { "propertySnapshot.propertyCode": regex },
        { "propertySnapshot.city": regex },
        { "propertySnapshot.locality": regex },
      ] });
    }

    const query = { $and: clauses };
    const safePage = Math.max(Number(page) || 1, 1);
    const safeLimit = Math.min(Math.max(Number(limit) || 10, 1), 100);
    const [visits, total] = await Promise.all([
      Visit.find(query)
        .sort({ requestedVisitAt: tab === "Upcoming" ? 1 : -1 })
        .skip((safePage - 1) * safeLimit)
        .limit(safeLimit)
        .lean(),
      Visit.countDocuments(query),
    ]);

    return res.status(200).json({
      success: true,
      count: visits.length,
      data: visits,
      total,
      page: safePage,
      totalPages: Math.max(Math.ceil(total / safeLimit), 1),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to fetch admin visits.",
      error: error.message,
    });
  }
};

export const getVisitById = async (req, res) => {
  try {
    const { id } = req.params;

    const query = mongoose.Types.ObjectId.isValid(id)
      ? { _id: id }
      : { visitId: id };

    const visit = await Visit.findOne(query).lean();

    if (!visit) {
      return res.status(404).json({
        success: false,
        message: "Visit not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: visit,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to fetch visit.",
      error: error.message,
    });
  }
};

export const createVisitRequest = async (req, res) => {
  try {
    const {
      propertyId,
      partnerId,
      buyerId,
      leadId = null,
      requestedVisitAt,
      requestNotes = "",
      requestedBy = {},
    } = req.body;

    if (!propertyId || !partnerId || !buyerId || !requestedVisitAt) {
      return res.status(400).json({
        success: false,
        message:
          "propertyId, partnerId, buyerId and requestedVisitAt are required.",
      });
    }

    if (
      !validObjectId(propertyId) ||
      !validObjectId(partnerId) ||
      !validObjectId(buyerId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid property, partner or buyer ID.",
      });
    }

    const [property, partner, buyer, lead] = await Promise.all([
      Property.findById(propertyId).lean(),
      Partner.findById(partnerId).lean(),
      Buyer.findById(buyerId)
        .select("-password -otp -otpExpiresAt")
        .lean(),
      validObjectId(leadId) ? Lead.findById(leadId).lean() : Promise.resolve(null),
    ]);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found.",
      });
    }

    if (!partner) {
      return res.status(404).json({
        success: false,
        message: "Partner not found.",
      });
    }

    if (!partner.isApproved || !partner.isVerified || partner.isBlocked || partner.applicationStatus !== "Verified" || !partner.permissions?.canCreateVisitRequest) {
      return res.status(403).json({ success: false, message: "Only approved and finally verified partners can create visit requests." });
    }

    let teamOwner = null;
    if (partner.accountType === "subagent" || partner.isSubPartner) {
      teamOwner = await Partner.findById(partner.parentPartnerId).lean();
      if (!teamOwner || teamOwner.accountType !== "team" || teamOwner.isSubPartner || !teamOwner.isApproved || !teamOwner.isVerified || teamOwner.isBlocked || teamOwner.applicationStatus !== "Verified") {
        return res.status(403).json({ success: false, message: "Sub-Agent Team / Agency Owner is not active and verified." });
      }
      if (String(property.delegatedSubPartner?.subPartnerId || "") !== String(partner._id)) {
        return res.status(403).json({ success: false, message: "Sub-Agent can request a visit only for a property delegated to them by the Team Owner." });
      }
    }

    if (!buyer) {
      return res.status(404).json({
        success: false,
        message: "Buyer not found.",
      });
    }

    const parsedVisitAt = new Date(requestedVisitAt);

    if (Number.isNaN(parsedVisitAt.getTime())) {
      return res.status(400).json({
        success: false,
        message: "requestedVisitAt is invalid.",
      });
    }

    const duplicate = await Visit.findOne({
      propertyId: property._id,
      buyerId: buyer._id,
      partnerId: partner._id,
      status: { $in: ["Requested", "Upcoming", "Rescheduled"] },
      requestedVisitAt: {
        $gte: new Date(parsedVisitAt.getTime() - 60 * 60 * 1000),
        $lte: new Date(parsedVisitAt.getTime() + 60 * 60 * 1000),
      },
    }).lean();

    if (duplicate) {
      return res.status(200).json({
        success: true,
        duplicate: true,
        message: "A similar active visit is already scheduled.",
        data: duplicate,
      });
    }

    const actor = {
      userId: validObjectId(requestedBy?.userId)
        ? requestedBy.userId
        : partner._id,
      name: requestedBy?.name || partner.name || "",
      role: requestedBy?.role || "Partner",
    };

    const visit = await Visit.create({
      visitId: await makeVisitId(),
      propertyId: property._id,
      buyerId: buyer._id,
      partnerId: partner._id,
      leadId: lead?._id || null,
      requestSource: partner.accountType === "subagent" || partner.isSubPartner ? "subagent" : partner.accountType === "team" ? "team" : "single",
      teamOwnerId: teamOwner?._id || (partner.accountType === "team" ? partner._id : null),
      teamApprovalStatus: partner.accountType === "subagent" || partner.isSubPartner ? "Pending" : "Not_Required",
      forwardedToAdminAt: partner.accountType === "subagent" || partner.isSubPartner ? null : new Date(),
      buyerSnapshot: makeBuyerSnapshot(buyer),
      propertySnapshot: makePropertySnapshot(property),
      partnerSnapshot: makePartnerSnapshot(partner),
      requestedVisitAt: parsedVisitAt,
      requestNotes,
      requestedBy: actor,
      history: [
        {
          action: "Visit Requested",
          fromStatus: "",
          toStatus: "Requested",
          remarks: requestNotes,
          updatedBy: actor,
        },
      ],
    });

    return res.status(201).json({
      success: true,
      message: partner.accountType === "subagent" || partner.isSubPartner
        ? "Visit request sent to Team Owner for approval. It will reach Admin after Team Owner forwards it."
        : "Visit request created and sent to Admin successfully.",
      data: visit,
    });
  } catch (error) {
    console.error("Create Visit Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to create visit request.",
      error: error.message,
    });
  }
};
export const getVisitsByPartner = async (req, res) => {
  try {
    const { partnerId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(partnerId)) {
      return res.status(400).json({ success: false, message: "Invalid partner ID." });
    }

    const visits = await Visit.find({ partnerId })
      .populate("propertyId", "propertyId title projectName city locality address images status")
      .sort({ requestedVisitAt: -1 })
      .lean();

    return res.status(200).json({ success: true, count: visits.length, data: visits });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to fetch partner visits.", error: error.message });
  }
};
export const reviewVisitRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      approvalStatus,
      approvedVisitAt = null,
      remarks = "",
      actor = {},
    } = req.body;

    if (!["Approved", "Rejected"].includes(approvalStatus)) {
      return res.status(400).json({
        success: false,
        message: "approvalStatus must be Approved or Rejected.",
      });
    }

    const visit = await Visit.findById(id);

    if (!visit) {
      return res.status(404).json({
        success: false,
        message: "Visit not found.",
      });
    }

    if (visit.requestSource === "subagent" && visit.teamApprovalStatus !== "Forwarded") {
      return res.status(403).json({ success: false, message: "Sub-Agent visit request must be forwarded by the Team Owner before Admin review." });
    }

    const oldStatus = visit.status;

    visit.approvalStatus = approvalStatus;
    visit.adminRemarks = remarks;

    if (approvalStatus === "Approved") {
      visit.status = "Upcoming";
      visit.approvedVisitAt = approvedVisitAt
        ? new Date(approvedVisitAt)
        : visit.requestedVisitAt;

      visit.approvedBy = {
        userId: validObjectId(actor?.userId) ? actor.userId : null,
        name: actor?.name || "Admin",
        role: actor?.role || "Admin",
        approvedAt: new Date(),
      };
    } else {
      visit.status = "Cancelled";
    }

    visit.history.push({
      action:
        approvalStatus === "Approved" ? "Visit Approved" : "Visit Rejected",
      fromStatus: oldStatus,
      toStatus: visit.status,
      remarks,
      updatedBy: {
        userId: validObjectId(actor?.userId) ? actor.userId : null,
        name: actor?.name || "Admin",
        role: actor?.role || "Admin",
      },
    });

    await visit.save();

    return res.status(200).json({
      success: true,
      message: `Visit ${approvalStatus.toLowerCase()} successfully.`,
      data: visit,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to review visit.",
      error: error.message,
    });
  }
};

export const updateVisitStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      status,
      outcome,
      remarks = "",
      followUpAt = null,
      rescheduleReason = "",
      cancellationReason = "",
      requestedVisitAt = null,
      actor = {},
    } = req.body;

    const allowedStatuses = [
      "Requested",
      "Upcoming",
      "Completed",
      "Cancelled",
      "No Show",
      "Rescheduled",
      "Follow-up",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid visit status.",
      });
    }

    const visit = await Visit.findById(id);

    if (!visit) {
      return res.status(404).json({
        success: false,
        message: "Visit not found.",
      });
    }

    const oldStatus = visit.status;
    visit.status = status;

    if (outcome) {
      visit.outcome = outcome;
    }

    if (status === "Completed") {
      visit.completedAt = new Date();
      if (!outcome) visit.outcome = "Completed";
    }

    if (status === "Follow-up" && followUpAt) {
      visit.followUpAt = new Date(followUpAt);
    }

    if (status === "Rescheduled") {
      visit.rescheduleReason = rescheduleReason;
      if (requestedVisitAt) {
        visit.requestedVisitAt = new Date(requestedVisitAt);
        visit.approvedVisitAt = new Date(requestedVisitAt);
      }
    }

    if (status === "Cancelled") {
      visit.cancellationReason = cancellationReason || remarks;
      if (!outcome) visit.outcome = "Cancelled";
    }

    if (status === "No Show" && !outcome) {
      visit.outcome = "No Show";
    }

    visit.history.push({
      action: "Visit Status Updated",
      fromStatus: oldStatus,
      toStatus: status,
      remarks,
      updatedBy: {
        userId: validObjectId(actor?.userId) ? actor.userId : null,
        name: actor?.name || "Admin",
        role: actor?.role || "Admin",
      },
    });

    await visit.save();

    return res.status(200).json({
      success: true,
      message: "Visit status updated successfully.",
      data: visit,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to update visit status.",
      error: error.message,
    });
  }
};

export const getPartnerVisits = async (req, res) => {
  try {
    const { partnerId } = req.params;

    if (!validObjectId(partnerId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid partner ID.",
      });
    }

    const visits = await Visit.find({
      partnerId,
    })
      .sort({ requestedVisitAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      count: visits.length,
      data: visits,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to fetch partner visits.",
      error: error.message,
    });
  }
};

export const getBuyerVisits = async (req, res) => {
  try {
    const { buyerId } = req.params;

    if (!validObjectId(buyerId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid buyer ID.",
      });
    }

    const visits = await Visit.find({
      buyerId,
    })
      .sort({ requestedVisitAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      count: visits.length,
      data: visits,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to fetch buyer visits.",
      error: error.message,
    });
  }
};


export const reviewSubAgentVisitByTeamOwner = async (req, res) => {
  try {
    const { id } = req.params;
    const { teamOwnerId, action, remarks = "" } = req.body;
    if (!validObjectId(teamOwnerId) || !["Forward", "Reject"].includes(action)) return res.status(400).json({ success: false, message: "Valid teamOwnerId and action(Forward/Reject) are required." });
    const [visit, owner] = await Promise.all([Visit.findById(id), Partner.findById(teamOwnerId).lean()]);
    if (!visit) return res.status(404).json({ success: false, message: "Visit not found." });
    if (!owner || owner.accountType !== "team" || owner.isSubPartner || !owner.isApproved || !owner.isVerified || owner.isBlocked || owner.applicationStatus !== "Verified") return res.status(403).json({ success: false, message: "Only an active verified Team Owner can review this request." });
    if (visit.requestSource !== "subagent" || String(visit.teamOwnerId || "") !== String(owner._id)) return res.status(403).json({ success: false, message: "This Sub-Agent visit request does not belong to this Team Owner." });
    if (visit.teamApprovalStatus !== "Pending") return res.status(400).json({ success: false, message: `Visit is already ${visit.teamApprovalStatus}.` });
    if (action === "Reject") {
      visit.teamApprovalStatus = "Rejected"; visit.teamRemarks = remarks; visit.status = "Cancelled"; visit.approvalStatus = "Rejected";
      visit.history.push({ action: "Rejected by Team Owner", fromStatus: "Requested", toStatus: "Cancelled", remarks, updatedBy: { userId: owner._id, name: owner.name, role: "agency_owner" } });
    } else {
      visit.teamApprovalStatus = "Forwarded"; visit.teamRemarks = remarks; visit.forwardedToAdminAt = new Date();
      visit.history.push({ action: "Forwarded to Admin by Team Owner", fromStatus: "Requested", toStatus: "Requested", remarks, updatedBy: { userId: owner._id, name: owner.name, role: "agency_owner" } });
    }
    await visit.save();
    return res.json({ success: true, message: action === "Forward" ? "Visit request forwarded to Admin successfully." : "Visit request rejected by Team Owner.", data: visit });
  } catch (error) { return res.status(500).json({ success: false, message: "Unable to review Sub-Agent visit request.", error: error.message }); }
};

export const getTeamPendingVisitRequests = async (req, res) => {
  try {
    const { ownerId } = req.params;
    if (!validObjectId(ownerId)) return res.status(400).json({ success: false, message: "Invalid Team Owner ID." });
    const data = await Visit.find({ teamOwnerId: ownerId, requestSource: "subagent", teamApprovalStatus: "Pending" }).sort({ createdAt: -1 }).lean();
    return res.json({ success: true, count: data.length, data });
  } catch (error) { return res.status(500).json({ success: false, message: "Unable to fetch pending Team visit requests.", error: error.message }); }
};
