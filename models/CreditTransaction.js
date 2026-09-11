// import mongoose from "mongoose";

// const actorSchema = new mongoose.Schema(
//   {
//     userId: { type: mongoose.Schema.Types.ObjectId, default: null },
//     name: { type: String, default: "", trim: true },
//     role: { type: String, default: "System", trim: true },
//   },
//   { _id: false }
// );

// const creditTransactionSchema = new mongoose.Schema(
//   {
//     transactionId: {
//       type: String,
//       unique: true,
//       sparse: true,
//       index: true,
//     },

//     partnerMongoId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Partner",
//       required: true,
//       index: true,
//     },
//     partnerCode: { type: String, default: "", index: true, trim: true },
//     partnerName: { type: String, default: "", trim: true },

//     type: {
//       type: String,
//       enum: [
//         "PURCHASE",
//         "PROMOTION_DEBIT",
//         "LEAD_UNLOCK_DEBIT",
//         "REFUND",
//         "ADMIN_ADJUSTMENT_CREDIT",
//         "ADMIN_ADJUSTMENT_DEBIT",
//       ],
//       required: true,
//       index: true,
//     },

//     direction: {
//       type: String,
//       enum: ["CREDIT", "DEBIT"],
//       required: true,
//       index: true,
//     },

//     credits: {
//       type: Number,
//       required: true,
//       min: 0,
//     },

//     amountInRupees: {
//       type: Number,
//       default: 0,
//       min: 0,
//     },

//     balanceBefore: {
//       type: Number,
//       required: true,
//       min: 0,
//     },

//     balanceAfter: {
//       type: Number,
//       required: true,
//       min: 0,
//     },

//     productCode: {
//       type: String,
//       enum: [
//         "PROPERTY_BOOST",
//         "FEATURED_7_DAYS",
//         "LOCALITY_TOP_30_DAYS",
//         "LEAD_UNLOCK",
//         "",
//       ],
//       default: "",
//       index: true,
//     },

//     status: {
//       type: String,
//       enum: ["SUCCESS", "PENDING", "FAILED", "REFUNDED", "REVERSED"],
//       default: "SUCCESS",
//       index: true,
//     },

//     referenceType: {
//       type: String,
//       enum: ["Purchase", "PromotionRequest", "Lead", "Manual", ""],
//       default: "",
//     },

//     referenceId: {
//       type: mongoose.Schema.Types.ObjectId,
//       default: null,
//       index: true,
//     },

//     relatedTransactionId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "CreditTransaction",
//       default: null,
//       index: true,
//     },

//     payment: {
//       provider: { type: String, default: "" },
//       paymentId: { type: String, default: "", index: true },
//       orderId: { type: String, default: "" },
//       signatureVerified: { type: Boolean, default: false },
//     },

//     description: { type: String, default: "", trim: true },
//     metadata: { type: mongoose.Schema.Types.Mixed, default: {} },

//     performedBy: {
//       type: actorSchema,
//       default: () => ({}),
//     },
//   },
//   { timestamps: true }
// );

// creditTransactionSchema.index({ partnerMongoId: 1, createdAt: -1 });
// creditTransactionSchema.index({ type: 1, createdAt: -1 });
// creditTransactionSchema.index({ productCode: 1, createdAt: -1 });

// export default mongoose.model("CreditTransaction", creditTransactionSchema);


import mongoose from "mongoose";

const actorSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, default: null },
  name: { type: String, default: "" },
  role: { type: String, default: "System" },
}, { _id: false });

const creditTransactionSchema = new mongoose.Schema({
  transactionId: { type: String, unique: true, index: true },
  walletType: { type: String, enum: ["SINGLE", "TEAM_SHARED"], required: true, index: true },
  walletOwnerPartnerId: { type: mongoose.Schema.Types.ObjectId, ref: "Partner", required: true, index: true },
  attributedPartnerId: { type: mongoose.Schema.Types.ObjectId, ref: "Partner", required: true, index: true },
  partnerCode: { type: String, default: "", index: true },
  partnerName: { type: String, default: "" },
  type: {
    type: String,
    enum: ["PURCHASE", "PROMOTION_DEBIT", "LEAD_UNLOCK_DEBIT", "REFUND", "ADMIN_ADJUSTMENT_CREDIT", "ADMIN_ADJUSTMENT_DEBIT", "TEAM_ALLOCATION", "TEAM_ALLOCATION_RELEASE", "PAYMENT_REVERSAL"],
    required: true,
    index: true,
  },
  direction: { type: String, enum: ["CREDIT", "DEBIT", "NEUTRAL"], required: true, index: true },
  creditBucket: { type: String, enum: ["PAID", "PROMOTIONAL", "MIXED", "NONE"], default: "NONE", index: true },
  credits: { type: Number, required: true, min: 0 },
  paidCredits: { type: Number, default: 0, min: 0 },
  promotionalCredits: { type: Number, default: 0, min: 0 },
  amountInRupees: { type: Number, default: 0, min: 0 },
  balanceBefore: { type: Number, required: true, min: 0 },
  balanceAfter: { type: Number, required: true, min: 0 },
  productCode: { type: String, default: "", index: true },
  status: { type: String, enum: ["PENDING", "SUCCESS", "FAILED", "REFUNDED", "REVERSED", "DISPUTED", "REFUND_PENDING", "REFUND_REJECTED"], default: "SUCCESS", index: true },
  idempotencyKey: { type: String, default: "", index: true },
  referenceType: { type: String, enum: ["Purchase", "PromotionRequest", "Lead", "Manual", "TeamAllocation", "Payment", ""], default: "" },
  referenceId: { type: mongoose.Schema.Types.ObjectId, default: null, index: true },
  relatedTransactionId: { type: mongoose.Schema.Types.ObjectId, ref: "CreditTransaction", default: null, index: true },
  payment: {
    provider: { type: String, default: "" },
    paymentId: { type: String, default: "", index: true },
    orderId: { type: String, default: "", index: true },
    invoiceId: { type: String, default: "" },
    signatureVerified: { type: Boolean, default: false },
    reconciliationStatus: { type: String, enum: ["NOT_REQUIRED", "PENDING", "MATCHED", "DUPLICATE", "FAILED"], default: "NOT_REQUIRED" },
  },
  description: { type: String, default: "" },
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  performedBy: { type: actorSchema, default: () => ({}) },
}, { timestamps: true });

creditTransactionSchema.index({ walletOwnerPartnerId: 1, createdAt: -1 });
creditTransactionSchema.index({ attributedPartnerId: 1, createdAt: -1 });
creditTransactionSchema.index({ idempotencyKey: 1 }, { unique: true, partialFilterExpression: { idempotencyKey: { $type: "string", $gt: "" } } });
creditTransactionSchema.index({ "payment.provider": 1, "payment.paymentId": 1 }, { unique: true, partialFilterExpression: { "payment.paymentId": { $type: "string", $gt: "" } } });

export default mongoose.models.CreditTransaction || mongoose.model("CreditTransaction", creditTransactionSchema);
