import mongoose from "mongoose";

const schema = new mongoose.Schema({
  leadMongoId: { type: mongoose.Schema.Types.ObjectId, ref: "Lead", required: true, index: true },
  leadId: { type: String, default: "", index: true },
  partnerMongoId: { type: mongoose.Schema.Types.ObjectId, ref: "Partner", required: true, index: true },
  partnerCode: { type: String, default: "" },
  reason: { type: String, required: true, trim: true },
  details: { type: String, default: "", trim: true },
  status: { type: String, enum: ["Pending", "Approved", "Rejected"], default: "Pending", index: true },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  reviewedAt: { type: Date, default: null },
  adminRemarks: { type: String, default: "" },
}, { timestamps: true });

schema.index({ leadMongoId: 1, partnerMongoId: 1, status: 1 });
export default mongoose.models.LeadRefundRequest || mongoose.model("LeadRefundRequest", schema);
