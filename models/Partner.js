// // import mongoose from "mongoose";

// // const promotionRequestSnapshotSchema = new mongoose.Schema(
// //   {
// //     requestId: { type: mongoose.Schema.Types.ObjectId, ref: "PromotionRequest", required: true },
// //     requestCode: { type: String, default: "", trim: true },
// //     propertyMongoId: { type: mongoose.Schema.Types.ObjectId, ref: "NewProperty", required: true },
// //     propertyCode: { type: String, default: "", trim: true },
// //     propertyTitle: { type: String, default: "", trim: true },
// //     promotionType: {
// //       type: String,
// //       enum: ["PROPERTY_BOOST", "FEATURED_7_DAYS", "LOCALITY_TOP_30_DAYS"],
// //       required: true,
// //     },
// //     creditsCharged: { type: Number, default: 0, min: 0 },
// //     status: {
// //       type: String,
// //       enum: ["Pending", "Approved", "Rejected", "Cancelled", "Expired"],
// //       default: "Pending",
// //     },
// //     requestedAt: { type: Date, default: Date.now },
// //     approvedAt: { type: Date, default: null },
// //     rejectedAt: { type: Date, default: null },
// //     expiresAt: { type: Date, default: null },
// //     adminRemarks: { type: String, default: "", trim: true },
// //   },
// //   { _id: false }
// // );

// // const partnerSchema = new mongoose.Schema(
// //   {
// //     partnerId: { type: String, unique: true, sparse: true, index: true },
// //     name: { type: String, required: true, trim: true },
// //     email: { type: String, required: true, lowercase: true, trim: true },
// //     phone: { type: String, required: true },
// //     password: { type: String, required: true },
// //     role: { type: String, default: "partner" },
// //     partnerType: { type: String, enum: ["team", "single"], required: true, lowercase: true },

// //     location: {
// //       city: { type: String, default: "" },
// //       state: { type: String, default: "" },
// //       country: { type: String, default: "India" },
// //       address: { type: String, default: "" },
// //       coordinates: {
// //         type: { type: String, enum: ["Point"], default: "Point" },
// //         coordinates: { type: [Number], default: [0, 0] },
// //       },
// //     },

// //     isPhoneVerified: { type: Boolean, default: false },
// //     isVerified: { type: Boolean, default: false },
// //     isRejected: { type: Boolean, default: false },
// //     isBlocked: { type: Boolean, default: false },

// //     assignedProperties: [
// //       {
// //         propertyId: { type: mongoose.Schema.Types.ObjectId, ref: "NewProperty", required: true },
// //         propertyCode: { type: String, default: "" },
// //         assignedAt: { type: Date, default: Date.now },
// //         status: {
// //           type: String,
// //           enum: ["Assigned", "In_Progress", "Verified", "Rejected"],
// //           default: "Assigned",
// //         },
// //       },
// //     ],

// //     creditWallet: {
// //       balance: { type: Number, default: 0, min: 0, index: true },
// //       totalPurchased: { type: Number, default: 0, min: 0 },
// //       totalCredited: { type: Number, default: 0, min: 0 },
// //       totalDebited: { type: Number, default: 0, min: 0 },
// //       totalSpent: { type: Number, default: 0, min: 0 },
// //       totalRefunded: { type: Number, default: 0, min: 0 },
// //     },

// //     promotionStats: {
// //       totalRequests: { type: Number, default: 0 },
// //       pendingRequests: { type: Number, default: 0 },
// //       approvedRequests: { type: Number, default: 0 },
// //       rejectedRequests: { type: Number, default: 0 },
// //       expiredRequests: { type: Number, default: 0 },
// //       totalPromotionCreditsSpent: { type: Number, default: 0 },
// //       totalPromotionCreditsRefunded: { type: Number, default: 0 },
// //     },

// //     promotionRequests: { type: [promotionRequestSnapshotSchema], default: [] },

// //     otp: { type: String, default: null },
// //     otpExpiresAt: { type: Date, default: null },
// //   },
// //   { timestamps: true }
// // );

// // partnerSchema.index({ "creditWallet.balance": -1 });
// // partnerSchema.index({ isVerified: 1, isBlocked: 1 });
// // partnerSchema.index({ "location.coordinates": "2dsphere" });
// // partnerSchema.index({ "promotionRequests.status": 1 });
// // partnerSchema.index({ "promotionRequests.propertyMongoId": 1 });

// // export default mongoose.model("Partner", partnerSchema);

// import mongoose from "mongoose";

// const actorSchema = new mongoose.Schema(
//   {
//     userId: { type: mongoose.Schema.Types.ObjectId, default: null },
//     name: { type: String, default: "System" },
//     role: { type: String, default: "System" },
//   },
//   { _id: false },
// );

// const documentSchema = new mongoose.Schema(
//   {
//     documentType: {
//       type: String,
//       enum: [
//         "AADHAAR",
//         "PAN",
//         "VOTER_ID",
//         "DRIVING_LICENSE",
//         "PASSPORT",
//         "OTHER",
//       ],
//       required: true,
//     },
//     frontUrl: { type: String, required: true },
//     frontPublicId: { type: String, default: "" },
//     backUrl: { type: String, required: true },
//     backPublicId: { type: String, default: "" },
//     numberMasked: { type: String, default: "" },
//     status: {
//       type: String,
//       enum: ["Pending", "Verified", "Rejected", "Action_Required"],
//       default: "Pending",
//     },
//     remarks: { type: String, default: "" },
//   },
//   { _id: true },
// );

// const verificationHistorySchema = new mongoose.Schema(
//   {
//     status: { type: String, required: true },
//     remarks: { type: String, default: "" },
//     actor: { type: actorSchema, default: () => ({}) },
//     createdAt: { type: Date, default: Date.now },
//   },
//   { _id: true },
// );

// const allocationSchema = new mongoose.Schema(
//   {
//     allocatedLimit: { type: Number, default: 0, min: 0 },
//     availableLimit: { type: Number, default: 0, min: 0 },
//     totalSpent: { type: Number, default: 0, min: 0 },
//     totalRefunded: { type: Number, default: 0, min: 0 },
//     approvalThreshold: { type: Number, default: null },
//     requiresApprovalAboveThreshold: { type: Boolean, default: false },
//     lastAllocatedAt: { type: Date, default: null },
//   },
//   { _id: false },
// );

// const partnerSchema = new mongoose.Schema(
//   {
//     partnerId: { type: String, unique: true, sparse: true, index: true },
//     name: { type: String, required: true, trim: true },
//     email: {
//       type: String,
//       required: true,
//       lowercase: true,
//       trim: true,
//       unique: true,
//       index: true,
//     },
//     phone: {
//       type: String,
//       required: true,
//       unique: true,
//       trim: true,
//       index: true,
//     },
//     password: { type: String, default: "" },

//     accountType: {
//       type: String,

//       enum: ["single", "team", "subagent"],

//       required: true,

//       index: true,
//     },
//     role: {
//       type: String,
//       enum: ["partner", "agency_owner", "team_manager", "agent"],
//       default: "partner",
//     },
//     parentPartnerId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Partner",
//       default: null,
//       index: true,
//     },
//     isSubPartner: { type: Boolean, default: false, index: true },
//     teamRole: {
//       type: String,
//       enum: ["OWNER", "MANAGER", "AGENT", "NONE"],
//       default: "NONE",
//     },

//     emailVerification: {
//       isVerified: { type: Boolean, default: false },
//       otpHash: { type: String, default: "" },
//       expiresAt: { type: Date, default: null },
//       verifiedAt: { type: Date, default: null },
//     },
//     phoneVerification: {
//       isVerified: { type: Boolean, default: false },
//       otpHash: { type: String, default: "" },
//       expiresAt: { type: Date, default: null },
//       verifiedAt: { type: Date, default: null },
//     },

//     applicationStatus: {
//       type: String,
//       enum: [
//         "Draft",
//         "Pending_Email_Verification",
//         "Pending_Phone_Verification",
//         "Submitted",
//         "Under_Review",
//         "Action_Required",
//         "Approved_Not_Verified",
//         "Verified",
//         "Rejected",
//         "Suspended",
//         "Expired",
//         "Withdrawn",
//       ],
//       default: "Draft",
//       index: true,
//     },

//     isApproved: { type: Boolean, default: false, index: true },
//     approvedAt: { type: Date, default: null },
//     approvedBy: { type: actorSchema, default: () => ({}) },
//     isVerified: { type: Boolean, default: false, index: true },
//     verifiedAt: { type: Date, default: null },
//     verifiedBy: { type: actorSchema, default: () => ({}) },
//     isBlocked: { type: Boolean, default: false, index: true },
//     isRejected: { type: Boolean, default: false },

//     credentials: {
//       temporaryPasswordIssued: { type: Boolean, default: false },
//       temporaryPasswordIssuedAt: { type: Date, default: null },
//       temporaryPasswordExpiresAt: { type: Date, default: null },
//       mustChangePassword: { type: Boolean, default: true },
//       passwordChangedAt: { type: Date, default: null },
//       lastLoginAt: { type: Date, default: null },
//     },

//     identityDocuments: { type: [documentSchema], default: [] },
//     business: {
//       businessName: { type: String, default: "" },
//       businessType: { type: String, default: "" },
//       gstin: { type: String, default: "" },
//       registrationNumber: { type: String, default: "" },
//       officeAddress: { type: String, default: "" },
//     },
//     rera: {
//       applicable: { type: Boolean, default: false },
//       state: { type: String, default: "Haryana" },
//       registrationNumber: { type: String, default: "" },
//       certificateUrl: { type: String, default: "" },
//       expiryDate: { type: Date, default: null },
//       verificationStatus: {
//         type: String,
//         enum: ["Not_Applicable", "Pending", "Verified", "Rejected", "Expired"],
//         default: "Not_Applicable",
//       },
//     },
//     location: {
//       city: { type: String, default: "" },
//       state: { type: String, default: "" },
//       country: { type: String, default: "India" },
//       address: { type: String, default: "" },
//       serviceLocalities: { type: [String], default: [] },
//       coordinates: {
//         type: { type: String, enum: ["Point"], default: "Point" },
//         coordinates: { type: [Number], default: [0, 0] },
//       },
//     },

//     permissions: {
//       canReceiveAssignments: { type: Boolean, default: false },
//       canCreateVisitRequest: { type: Boolean, default: false },
//       canUnlockLead: { type: Boolean, default: false },
//       canSpendCredits: { type: Boolean, default: false },
//       canManageTeam: { type: Boolean, default: false },
//       canAllocateCredits: { type: Boolean, default: false },
//       canVerifyProperty: { type: Boolean, default: false },
//       canSubmitPropertyForAdminApproval: { type: Boolean, default: false },
//     },
//     agencyDetails: {
//       agencyOwnerId: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "Partner",
//         default: null,
//         index: true,
//       },

//       agencyPartnerCode: {
//         type: String,
//         default: "",
//       },

//       agencyName: {
//         type: String,
//         default: "",
//       },

//       agencyOwnerName: {
//         type: String,
//         default: "",
//       },

//       agencyEmail: {
//         type: String,
//         default: "",
//       },

//       agencyPhone: {
//         type: String,
//         default: "",
//       },

//       joinedAt: {
//         type: Date,
//         default: null,
//       },
//     },
//     creditWallet: {
//       paidBalance: { type: Number, default: 0, min: 0 },
//       promotionalBalance: { type: Number, default: 0, min: 0 },
//       balance: { type: Number, default: 0, min: 0, index: true },
//       totalPurchased: { type: Number, default: 0, min: 0 },
//       totalCredited: { type: Number, default: 0, min: 0 },
//       totalDebited: { type: Number, default: 0, min: 0 },
//       totalSpent: { type: Number, default: 0, min: 0 },
//       totalRefunded: { type: Number, default: 0, min: 0 },
//       lowBalanceThreshold: { type: Number, default: 100, min: 0 },
//     },
//     teamCreditAllocation: { type: allocationSchema, default: () => ({}) },

//     assignedProperties: [
//       {
//         propertyId: {
//           type: mongoose.Schema.Types.ObjectId,
//           ref: "NewProperty",
//           required: true,
//         },
//         propertyCode: { type: String, default: "" },
//         assignedAt: { type: Date, default: Date.now },
//         status: {
//           type: String,
//           enum: [
//             "Assigned",
//             "In_Progress",
//             "Verified",
//             "Rejected",
//             "Action_Required",
//             "Completed",
//           ],
//           default: "Assigned",
//         },
//       },
//     ],

//     promotions: {
//       boost: {
//         isActive: { type: Boolean, default: false, index: true },
//         activatedAt: { type: Date, default: null },
//         expiresAt: { type: Date, default: null },
//         transactionId: { type: mongoose.Schema.Types.ObjectId, ref: "CreditTransaction", default: null },
//       },
//       featured: {
//         isActive: { type: Boolean, default: false, index: true },
//         activatedAt: { type: Date, default: null },
//         expiresAt: { type: Date, default: null },
//         transactionId: { type: mongoose.Schema.Types.ObjectId, ref: "CreditTransaction", default: null },
//       },
//       localityTop: {
//         isActive: { type: Boolean, default: false, index: true },
//         activatedAt: { type: Date, default: null },
//         expiresAt: { type: Date, default: null },
//         locality: { type: String, default: "", index: true },
//         transactionId: { type: mongoose.Schema.Types.ObjectId, ref: "CreditTransaction", default: null },
//       },
//     },

//     verificationHistory: { type: [verificationHistorySchema], default: [] },
//     privacyConsent: {
//       accepted: { type: Boolean, default: false },
//       acceptedAt: { type: Date, default: null },
//       privacyNoticeVersion: { type: String, default: "" },
//     },
//     dataRetention: {
//       deletionRequestedAt: { type: Date, default: null },
//       scheduledDeletionAt: { type: Date, default: null },
//     },
//   },
//   { timestamps: true },
// );

// partnerSchema.index({ accountType: 1, isApproved: 1, isVerified: 1 });
// partnerSchema.index({ parentPartnerId: 1, isSubPartner: 1 });
// partnerSchema.index({ "location.coordinates": "2dsphere" });
// partnerSchema.index({
//   isVerified: 1,
//   isApproved: 1,
//   isBlocked: 1,
//   "promotions.localityTop.isActive": 1,
//   "promotions.featured.isActive": 1,
//   "promotions.boost.isActive": 1,
// });

// export default mongoose.models.Partner ||
//   mongoose.model("Partner", partnerSchema);


import mongoose from "mongoose";

const actorSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, default: null },
    name: { type: String, default: "System" },
    role: { type: String, default: "System" },
  },
  { _id: false },
);

const documentSchema = new mongoose.Schema(
  {
    documentType: {
      type: String,
      enum: [
        "AADHAAR",
        "PAN",
        "VOTER_ID",
        "DRIVING_LICENSE",
        "PASSPORT",
        "OTHER",
      ],
      required: true,
    },
    frontUrl: { type: String, required: true },
    frontPublicId: { type: String, default: "" },
    backUrl: { type: String, required: true },
    backPublicId: { type: String, default: "" },
    numberMasked: { type: String, default: "" },
    status: {
      type: String,
      enum: ["Pending", "Verified", "Rejected", "Action_Required"],
      default: "Pending",
    },
    remarks: { type: String, default: "" },
  },
  { _id: true },
);

const verificationHistorySchema = new mongoose.Schema(
  {
    status: { type: String, required: true },
    remarks: { type: String, default: "" },
    actor: { type: actorSchema, default: () => ({}) },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true },
);

const allocationSchema = new mongoose.Schema(
  {
    allocatedLimit: { type: Number, default: 0, min: 0 },
    availableLimit: { type: Number, default: 0, min: 0 },
    totalSpent: { type: Number, default: 0, min: 0 },
    totalRefunded: { type: Number, default: 0, min: 0 },
    approvalThreshold: { type: Number, default: null },
    requiresApprovalAboveThreshold: { type: Boolean, default: false },
    lastAllocatedAt: { type: Date, default: null },
  },
  { _id: false },
);

const promotionRequestSnapshotSchema = new mongoose.Schema(
  {
    requestId: { type: mongoose.Schema.Types.ObjectId, ref: "PromotionRequest", required: true },
    requestCode: { type: String, default: "" },
    targetType: { type: String, enum: ["PARTNER", "PROPERTY"], required: true },
    propertyMongoId: { type: mongoose.Schema.Types.ObjectId, ref: "NewProperty", default: null },
    propertyCode: { type: String, default: "" },
    propertyTitle: { type: String, default: "" },
    promotionType: {
      type: String,
      enum: ["PARTNER_BOOST", "PARTNER_FEATURED", "PARTNER_LOCALITY_TOP", "PROPERTY_BOOST", "FEATURED_7_DAYS", "LOCALITY_TOP_30_DAYS"],
      required: true,
    },
    creditsCharged: { type: Number, default: 0 },
    status: { type: String, enum: ["Pending", "Approved", "Rejected", "Cancelled", "Expired"], default: "Pending" },
    requestedAt: { type: Date, default: Date.now },
    approvedAt: { type: Date, default: null },
    rejectedAt: { type: Date, default: null },
    expiresAt: { type: Date, default: null },
    adminRemarks: { type: String, default: "" },
  },
  { _id: false },
);

const promotionHistorySchema = new mongoose.Schema(
  {
    requestId: { type: mongoose.Schema.Types.ObjectId, ref: "PromotionRequest", default: null },
    targetType: { type: String, enum: ["PARTNER", "PROPERTY"], required: true },
    promotionType: { type: String, required: true },
    action: { type: String, enum: ["Approved", "Rejected", "Expired", "Disabled"], required: true },
    credits: { type: Number, default: 0 },
    actor: { type: actorSchema, default: () => ({}) },
    remarks: { type: String, default: "" },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true },
);

const partnerSchema = new mongoose.Schema(
  {
    partnerId: { type: String, unique: true, sparse: true, index: true },
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      unique: true,
      index: true,
    },
    phone: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    password: { type: String, default: "" },

    accountType: {
      type: String,

      enum: ["single", "team", "subagent"],

      required: true,

      index: true,
    },
    role: {
      type: String,
      enum: ["partner", "agency_owner", "team_manager", "agent"],
      default: "partner",
    },
    parentPartnerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Partner",
      default: null,
      index: true,
    },
    isSubPartner: { type: Boolean, default: false, index: true },
    teamRole: {
      type: String,
      enum: ["OWNER", "MANAGER", "AGENT", "NONE"],
      default: "NONE",
    },

    emailVerification: {
      isVerified: { type: Boolean, default: false },
      otpHash: { type: String, default: "" },
      expiresAt: { type: Date, default: null },
      verifiedAt: { type: Date, default: null },
    },
    phoneVerification: {
      isVerified: { type: Boolean, default: false },
      otpHash: { type: String, default: "" },
      expiresAt: { type: Date, default: null },
      verifiedAt: { type: Date, default: null },
    },

    applicationStatus: {
      type: String,
      enum: [
        "Draft",
        "Pending_Email_Verification",
        "Pending_Phone_Verification",
        "Submitted",
        "Under_Review",
        "Action_Required",
        "Approved_Not_Verified",
        "Verified",
        "Rejected",
        "Suspended",
        "Expired",
        "Withdrawn",
      ],
      default: "Draft",
      index: true,
    },

    isApproved: { type: Boolean, default: false, index: true },
    approvedAt: { type: Date, default: null },
    approvedBy: { type: actorSchema, default: () => ({}) },
    isVerified: { type: Boolean, default: false, index: true },
    verifiedAt: { type: Date, default: null },
    verifiedBy: { type: actorSchema, default: () => ({}) },
    isBlocked: { type: Boolean, default: false, index: true },
    isRejected: { type: Boolean, default: false },

    credentials: {
      temporaryPasswordIssued: { type: Boolean, default: false },
      temporaryPasswordIssuedAt: { type: Date, default: null },
      temporaryPasswordExpiresAt: { type: Date, default: null },
      mustChangePassword: { type: Boolean, default: true },
      passwordChangedAt: { type: Date, default: null },
      lastLoginAt: { type: Date, default: null },
    },

    identityDocuments: { type: [documentSchema], default: [] },
    business: {
      businessName: { type: String, default: "" },
      businessType: { type: String, default: "" },
      gstin: { type: String, default: "" },
      registrationNumber: { type: String, default: "" },
      officeAddress: { type: String, default: "" },
    },
    rera: {
      applicable: { type: Boolean, default: false },
      state: { type: String, default: "Haryana" },
      registrationNumber: { type: String, default: "" },
      certificateUrl: { type: String, default: "" },
      expiryDate: { type: Date, default: null },
      verificationStatus: {
        type: String,
        enum: ["Not_Applicable", "Pending", "Verified", "Rejected", "Expired"],
        default: "Not_Applicable",
      },
    },
    location: {
      city: { type: String, default: "" },
      state: { type: String, default: "" },
      country: { type: String, default: "India" },
      address: { type: String, default: "" },
      serviceLocalities: { type: [String], default: [] },
      coordinates: {
        type: { type: String, enum: ["Point"], default: "Point" },
        coordinates: { type: [Number], default: [0, 0] },
      },
    },

    permissions: {
      canReceiveAssignments: { type: Boolean, default: false },
      canCreateVisitRequest: { type: Boolean, default: false },
      canUnlockLead: { type: Boolean, default: false },
      canSpendCredits: { type: Boolean, default: false },
      canManageTeam: { type: Boolean, default: false },
      canAllocateCredits: { type: Boolean, default: false },
      canVerifyProperty: { type: Boolean, default: false },
      canSubmitPropertyForAdminApproval: { type: Boolean, default: false },
    },
    agencyDetails: {
      agencyOwnerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Partner",
        default: null,
        index: true,
      },

      agencyPartnerCode: {
        type: String,
        default: "",
      },

      agencyName: {
        type: String,
        default: "",
      },

      agencyOwnerName: {
        type: String,
        default: "",
      },

      agencyEmail: {
        type: String,
        default: "",
      },

      agencyPhone: {
        type: String,
        default: "",
      },

      joinedAt: {
        type: Date,
        default: null,
      },
    },
    creditWallet: {
      paidBalance: { type: Number, default: 0, min: 0 },
      promotionalBalance: { type: Number, default: 0, min: 0 },
      balance: { type: Number, default: 0, min: 0, index: true },
      totalPurchased: { type: Number, default: 0, min: 0 },
      totalCredited: { type: Number, default: 0, min: 0 },
      totalDebited: { type: Number, default: 0, min: 0 },
      totalSpent: { type: Number, default: 0, min: 0 },
      totalRefunded: { type: Number, default: 0, min: 0 },
      lowBalanceThreshold: { type: Number, default: 100, min: 0 },
    },
    teamCreditAllocation: { type: allocationSchema, default: () => ({}) },

    assignedProperties: [
      {
        propertyId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "NewProperty",
          required: true,
        },
        propertyCode: { type: String, default: "" },
        assignedAt: { type: Date, default: Date.now },
        status: {
          type: String,
          enum: [
            "Assigned",
            "In_Progress",
            "Verified",
            "Rejected",
            "Action_Required",
            "Completed",
          ],
          default: "Assigned",
        },
      },
    ],

    promotions: {
      boost: {
        isActive: { type: Boolean, default: false, index: true },
        activatedAt: { type: Date, default: null },
        expiresAt: { type: Date, default: null },
        transactionId: { type: mongoose.Schema.Types.ObjectId, ref: "CreditTransaction", default: null },
        requestId: { type: mongoose.Schema.Types.ObjectId, ref: "PromotionRequest", default: null },
      },
      featured: {
        isActive: { type: Boolean, default: false, index: true },
        activatedAt: { type: Date, default: null },
        expiresAt: { type: Date, default: null },
        transactionId: { type: mongoose.Schema.Types.ObjectId, ref: "CreditTransaction", default: null },
        requestId: { type: mongoose.Schema.Types.ObjectId, ref: "PromotionRequest", default: null },
      },
      localityTop: {
        isActive: { type: Boolean, default: false, index: true },
        activatedAt: { type: Date, default: null },
        expiresAt: { type: Date, default: null },
        locality: { type: String, default: "", index: true },
        transactionId: { type: mongoose.Schema.Types.ObjectId, ref: "CreditTransaction", default: null },
        requestId: { type: mongoose.Schema.Types.ObjectId, ref: "PromotionRequest", default: null },
      },
    },

    promotionStats: {
      totalRequests: { type: Number, default: 0 },
      pendingRequests: { type: Number, default: 0 },
      approvedRequests: { type: Number, default: 0 },
      rejectedRequests: { type: Number, default: 0 },
      expiredRequests: { type: Number, default: 0 },
      totalPromotionCreditsSpent: { type: Number, default: 0 },
      totalPromotionCreditsRefunded: { type: Number, default: 0 },
    },
    promotionRequests: { type: [promotionRequestSnapshotSchema], default: [] },
    promotionHistory: { type: [promotionHistorySchema], default: [] },

    verificationHistory: { type: [verificationHistorySchema], default: [] },
    privacyConsent: {
      accepted: { type: Boolean, default: false },
      acceptedAt: { type: Date, default: null },
      privacyNoticeVersion: { type: String, default: "" },
    },
    dataRetention: {
      deletionRequestedAt: { type: Date, default: null },
      scheduledDeletionAt: { type: Date, default: null },
    },
  },
  { timestamps: true },
);

partnerSchema.index({ accountType: 1, isApproved: 1, isVerified: 1 });
partnerSchema.index({ parentPartnerId: 1, isSubPartner: 1 });
partnerSchema.index({ "location.coordinates": "2dsphere" });
partnerSchema.index({
  isVerified: 1,
  isApproved: 1,
  isBlocked: 1,
  "promotions.localityTop.isActive": 1,
  "promotions.featured.isActive": 1,
  "promotions.boost.isActive": 1,
});

export default mongoose.models.Partner ||
  mongoose.model("Partner", partnerSchema);
