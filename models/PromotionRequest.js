// import mongoose from "mongoose";

// const actorSchema = new mongoose.Schema(
//   {
//     userId: { type: mongoose.Schema.Types.ObjectId, default: null },
//     name: { type: String, default: "", trim: true },
//     role: { type: String, default: "System", trim: true },
//   },
//   { _id: false }
// );

// const historySchema = new mongoose.Schema(
//   {
//     status: {
//       type: String,
//       enum: ["Pending", "Approved", "Rejected", "Cancelled", "Expired"],
//       required: true,
//     },
//     remarks: { type: String, default: "", trim: true },
//     actor: { type: actorSchema, default: () => ({}) },
//     createdAt: { type: Date, default: Date.now },
//   },
//   { _id: true }
// );

// const promotionRequestSchema = new mongoose.Schema(
//   {
//     requestId: {
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
//     partnerCode: { type: String, default: "", index: true },
//     partnerName: { type: String, default: "" },

//     propertyMongoId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "NewProperty",
//       required: true,
//       index: true,
//     },
//     propertyCode: { type: String, default: "", index: true },
//     propertyTitle: { type: String, default: "" },
//     locality: { type: String, default: "" },
//     city: { type: String, default: "" },

//     promotionType: {
//       type: String,
//       enum: ["PROPERTY_BOOST", "FEATURED_7_DAYS", "LOCALITY_TOP_30_DAYS"],
//       required: true,
//       index: true,
//     },

//     creditsCharged: {
//       type: Number,
//       required: true,
//       min: 0,
//     },

//     debitTransactionId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "CreditTransaction",
//       required: true,
//     },

//     refundTransactionId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "CreditTransaction",
//       default: null,
//     },

//     status: {
//       type: String,
//       enum: ["Pending", "Approved", "Rejected", "Cancelled", "Expired"],
//       default: "Pending",
//       index: true,
//     },

//     requestedAt: { type: Date, default: Date.now },
//     approvedAt: { type: Date, default: null },
//     rejectedAt: { type: Date, default: null },
//     expiresAt: { type: Date, default: null },

//     requestedBy: { type: actorSchema, default: () => ({}) },
//     reviewedBy: { type: actorSchema, default: () => ({}) },

//     adminRemarks: { type: String, default: "" },

//     history: {
//       type: [historySchema],
//       default: [],
//     },
//   },
//   { timestamps: true }
// );

// promotionRequestSchema.index({
//   partnerMongoId: 1,
//   propertyMongoId: 1,
//   promotionType: 1,
//   status: 1,
// });

// export default mongoose.model("PromotionRequest", promotionRequestSchema);


import mongoose from "mongoose";

const actorSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, default: null },
    name: { type: String, default: "", trim: true },
    role: { type: String, default: "System", trim: true },
  },
  { _id: false }
);

const historySchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected", "Cancelled", "Expired"],
      required: true,
    },
    remarks: { type: String, default: "", trim: true },
    actor: { type: actorSchema, default: () => ({}) },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const promotionRequestSchema = new mongoose.Schema(
  {
    requestId: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },

    partnerMongoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Partner",
      required: true,
      index: true,
    },
    partnerCode: { type: String, default: "", index: true },
    partnerName: { type: String, default: "" },

    targetType: {
      type: String,
      enum: ["PARTNER", "PROPERTY"],
      required: true,
      index: true,
    },

    propertyMongoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "NewProperty",
      default: null,
      index: true,
    },
    propertyCode: { type: String, default: "", index: true },
    propertyTitle: { type: String, default: "" },
    locality: { type: String, default: "" },
    city: { type: String, default: "" },

    promotionType: {
      type: String,
      enum: [
        "PARTNER_BOOST",
        "PARTNER_FEATURED",
        "PARTNER_LOCALITY_TOP",
        "PROPERTY_BOOST",
        "FEATURED_7_DAYS",
        "LOCALITY_TOP_30_DAYS"
      ],
      required: true,
      index: true,
    },

    creditsCharged: {
      type: Number,
      required: true,
      min: 0,
    },

    debitTransactionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CreditTransaction",
      required: true,
    },

    refundTransactionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CreditTransaction",
      default: null,
    },
    refundTransactionIds: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "CreditTransaction",
    }],

    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected", "Cancelled", "Expired"],
      default: "Pending",
      index: true,
    },

    requestedAt: { type: Date, default: Date.now },
    approvedAt: { type: Date, default: null },
    rejectedAt: { type: Date, default: null },
    expiresAt: { type: Date, default: null },

    requestedBy: { type: actorSchema, default: () => ({}) },
    reviewedBy: { type: actorSchema, default: () => ({}) },

    adminRemarks: { type: String, default: "" },

    history: {
      type: [historySchema],
      default: [],
    },
  },
  { timestamps: true }
);

promotionRequestSchema.index({
  targetType: 1,
  partnerMongoId: 1,
  propertyMongoId: 1,
  promotionType: 1,
  status: 1,
});

export default mongoose.model("PromotionRequest", promotionRequestSchema);
