import mongoose from "mongoose";
import Lead from "../../models/Lead.js";
import Partner from "../../models/Partner.js";
import LeadRefundRequest from "../../models/LeadRefundRequest.js";
import { notifyAdmins } from "../../services/adminNotificationService.js";

export const createLeadRefundRequest = async (req, res) => {
  const partnerId = req.user?.id;
  if (!mongoose.Types.ObjectId.isValid(req.params.id) || !mongoose.Types.ObjectId.isValid(partnerId)) return res.status(400).json({ success: false, message: "Valid lead and partner are required" });
  const [lead, partner] = await Promise.all([Lead.findById(req.params.id), Partner.findById(partnerId)]);
  if (!lead || !partner) return res.status(404).json({ success: false, message: "Lead or partner not found" });
  const isAssigned = String(lead.assignedPartner?.partnerMongoId || "") === String(partner._id);
  if (!isAssigned) return res.status(403).json({ success: false, message: "Only the assigned partner can report this lead" });
  if (!req.body.reason) return res.status(400).json({ success: false, message: "Reason is required" });
  const existing = await LeadRefundRequest.findOne({ leadMongoId: lead._id, partnerMongoId: partner._id, status: "Pending" });
  if (existing) return res.status(409).json({ success: false, message: "A pending request already exists", data: existing });

  const request = await LeadRefundRequest.create({ leadMongoId: lead._id, leadId: lead.leadId, partnerMongoId: partner._id, partnerCode: partner.partnerId, reason: req.body.reason, details: req.body.details || "" });
  await notifyAdmins({
    title: "False lead / refund request",
    message: `${partner.name || partner.partnerId} reported lead ${lead.leadId || lead._id} and requested a refund.`,
    type: "LEAD_REFUND_REQUEST",
    actionUrl: `/leads-dashboard?tab=management&leadId=${lead._id}&refundRequestId=${request._id}`,
    entityType: "LeadRefundRequest",
    entityId: request._id,
    data: { leadMongoId: lead._id, leadId: lead.leadId, partnerMongoId: partner._id },
  });
  return res.status(201).json({ success: true, message: "False lead/refund request submitted", data: request });
};

export const getLeadRefundRequests = async (req, res) => {
  const query = req.query.status && req.query.status !== "All" ? { status: req.query.status } : {};
  const data = await LeadRefundRequest.find(query).sort({ createdAt: -1 }).lean();
  return res.json({ success: true, count: data.length, data });
};

export const reviewLeadRefundRequest = async (req, res) => {
  const status = String(req.body.status || "");
  if (!['Approved', 'Rejected'].includes(status)) return res.status(400).json({ success: false, message: "status must be Approved or Rejected" });
  const request = await LeadRefundRequest.findByIdAndUpdate(req.params.requestId, { status, reviewedBy: req.user.id, reviewedAt: new Date(), adminRemarks: req.body.remarks || "" }, { new: true });
  if (!request) return res.status(404).json({ success: false, message: "Refund request not found" });
  return res.json({ success: true, message: `Refund request ${status.toLowerCase()}`, data: request });
};
