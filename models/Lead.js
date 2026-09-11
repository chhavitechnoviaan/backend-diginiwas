// import mongoose from "mongoose";

// const actorSchema = new mongoose.Schema(
//   {
//     userId: {
//       type: mongoose.Schema.Types.ObjectId,
//       default: null,
//     },
//     name: {
//       type: String,
//       default: "",
//       trim: true,
//     },
//     role: {
//       type: String,
//       default: "Admin",
//       trim: true,
//     },
//   },
//   { _id: false }
// );

// const buyerSnapshotSchema = new mongoose.Schema(
//   {
//     buyerMongoId: {
//       type: mongoose.Schema.Types.ObjectId,
//       default: null,
//       index: true,
//     },
//     buyerCode: {
//       type: String,
//       default: "",
//       trim: true,
//     },
//     name: {
//       type: String,
//       required: true,
//       trim: true,
//     },
//     phone: {
//       type: String,
//       default: "",
//       trim: true,
//     },
//     email: {
//       type: String,
//       default: "",
//       lowercase: true,
//       trim: true,
//     },
//     city: {
//       type: String,
//       default: "",
//       trim: true,
//     },
//     consentVerified: {
//       type: Boolean,
//       default: false,
//     },
//   },
//   { _id: false }
// );

// const propertySnapshotSchema = new mongoose.Schema(
//   {
//     propertyMongoId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "NewProperty",
//       required: true,
//       index: true,
//     },
//     propertyCode: {
//       type: String,
//       default: "",
//       trim: true,
//     },
//     title: {
//       type: String,
//       default: "",
//       trim: true,
//     },
//     city: {
//       type: String,
//       default: "",
//       trim: true,
//     },
//     locality: {
//       type: String,
//       default: "",
//       trim: true,
//     },
//     address: {
//       type: String,
//       default: "",
//       trim: true,
//     },
//     price: {
//       type: Number,
//       default: 0,
//     },
//     image: {
//       type: String,
//       default: "",
//     },

//     // Who originally added the property
//     addedByRole: {
//       type: String,
//       default: "",
//       trim: true,
//     },
//     addedByUserId: {
//       type: mongoose.Schema.Types.ObjectId,
//       default: null,
//     },
//     addedByName: {
//       type: String,
//       default: "",
//       trim: true,
//     },

//     sellerMongoId: {
//       type: mongoose.Schema.Types.ObjectId,
//       default: null,
//     },
//     sellerCode: {
//       type: String,
//       default: "",
//       trim: true,
//     },
//     sellerName: {
//       type: String,
//       default: "",
//       trim: true,
//     },
//   },
//   { _id: false }
// );

// const assignedPartnerSchema = new mongoose.Schema(
//   {
//     partnerMongoId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Partner",
//       default: null,
//       index: true,
//     },
//     partnerCode: {
//       type: String,
//       default: "",
//       trim: true,
//     },
//     name: {
//       type: String,
//       default: "",
//       trim: true,
//     },
//     phone: {
//       type: String,
//       default: "",
//       trim: true,
//     },
//     email: {
//       type: String,
//       default: "",
//       lowercase: true,
//       trim: true,
//     },
//     partnerType: {
//       type: String,
//       default: "",
//       trim: true,
//     },
//     assignedAt: {
//       type: Date,
//       default: null,
//     },
//     assignedBy: {
//       type: actorSchema,
//       default: () => ({}),
//     },
//     assignmentSource: {
//       type: String,
//       enum: ["Property", "Lead", "Manual", ""],
//       default: "",
//     },
//   },
//   { _id: false }
// );

// const lifecycleSchema = new mongoose.Schema(
//   {
//     status: {
//       type: String,
//       required: true,
//     },
//     event: {
//       type: String,
//       default: "",
//     },
//     remarks: {
//       type: String,
//       default: "",
//       trim: true,
//     },
//     actor: {
//       type: actorSchema,
//       default: () => ({}),
//     },
//     createdAt: {
//       type: Date,
//       default: Date.now,
//     },
//   },
//   { _id: true }
// );

// const contactHistorySchema = new mongoose.Schema(
//   {
//     type: {
//       type: String,
//       enum: [
//         "Call",
//         "WhatsApp",
//         "SMS",
//         "Email",
//         "Note",
//         "Visit",
//         "Other",
//       ],
//       required: true,
//     },
//     status: {
//       type: String,
//       enum: [
//         "Attempted",
//         "Connected",
//         "No_Response",
//         "Sent",
//         "Received",
//         "Scheduled",
//         "Completed",
//         "Cancelled",
//         "Other",
//       ],
//       default: "Other",
//     },
//     notes: {
//       type: String,
//       default: "",
//       trim: true,
//     },
//     contactedAt: {
//       type: Date,
//       default: Date.now,
//     },
//     doneBy: {
//       type: actorSchema,
//       default: () => ({}),
//     },
//   },
//   { _id: true }
// );

// export const LEAD_STATUSES = [
//   "Lead_Created",
//   "Lead_Assigned",
//   "Lead_Viewed",
//   "Lead_Reviewing",
//   "Lead_Rejected",
//   "Lead_Closed",
//   "Successfully_Converted",
// ];

// const leadSchema = new mongoose.Schema(
//   {
//     leadId: {
//       type: String,
//       unique: true,
//       sparse: true,
//       index: true,
//     },

//     source: {
//       type: String,
//       enum: [
//         "Property_Enquiry",
//         "Web_Form",
//         "Admin_Created",
//         "App",
//         "Campaign",
//         "Referral",
//         "Direct",
//         "Other",
//       ],
//       default: "Property_Enquiry",
//       index: true,
//     },

//     buyer: {
//       type: buyerSnapshotSchema,
//       required: true,
//     },

//     property: {
//       type: propertySnapshotSchema,
//       required: true,
//     },

//     enquiryMessage: {
//       type: String,
//       default: "",
//       trim: true,
//     },

//     status: {
//       type: String,
//       enum: LEAD_STATUSES,
//       default: "Lead_Created",
//       index: true,
//     },

//     priority: {
//       type: String,
//       enum: ["Low", "Medium", "High", "Urgent"],
//       default: "Medium",
//       index: true,
//     },

//     estimatedValue: {
//       type: Number,
//       default: 0,
//     },

//     assignedPartner: {
//       type: assignedPartnerSchema,
//       default: () => ({}),
//     },

//     // "Lead unlocked by assigned partner" is an event,
//     // not a terminal status.
//     isUnlockedByPartner: {
//       type: Boolean,
//       default: false,
//     },
//     unlockedAt: {
//       type: Date,
//       default: null,
//     },
//     unlockedBy: {
//       type: actorSchema,
//       default: () => ({}),
//     },
    
// unlockCredit: {
//   creditsCharged: {
//     type: Number,
//     default: 0,
//   },
//   transactionId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "CreditTransaction",
//     default: null,
//   },
//   productCode: {
//     type: String,
//     enum: ["LEAD_UNLOCK", ""],
//     default: "",
//   },
//   refundedCredits: {
//     type: Number,
//     default: 0,
//   },
//   refundTransactionId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "CreditTransaction",
//     default: null,
//   },
// },

//     lifecycle: {
//       type: [lifecycleSchema],
//       default: [],
//     },

//     contactHistory: {
//       type: [contactHistorySchema],
//       default: [],
//     },

//     review: {
//       notes: {
//         type: String,
//         default: "",
//       },
//       reviewedAt: {
//         type: Date,
//         default: null,
//       },
//       reviewedBy: {
//         type: actorSchema,
//         default: () => ({}),
//       },
//     },

//     rejection: {
//       reason: {
//         type: String,
//         default: "",
//       },
//       rejectedAt: {
//         type: Date,
//         default: null,
//       },
//       rejectedBy: {
//         type: actorSchema,
//         default: () => ({}),
//       },
//     },

//     closure: {
//       reason: {
//         type: String,
//         default: "",
//       },
//       closedAt: {
//         type: Date,
//         default: null,
//       },
//       closedBy: {
//         type: actorSchema,
//         default: () => ({}),
//       },
//     },

//     conversion: {
//       amount: {
//         type: Number,
//         default: 0,
//       },
//       notes: {
//         type: String,
//         default: "",
//       },
//       convertedAt: {
//         type: Date,
//         default: null,
//       },
//       convertedBy: {
//         type: actorSchema,
//         default: () => ({}),
//       },
//     },

//     lastContactAt: {
//       type: Date,
//       default: null,
//       index: true,
//     },

//     createdBy: {
//       type: actorSchema,
//       default: () => ({}),
//     },
//   },
//   {
//     timestamps: true,
//   }
// );

// leadSchema.index({
//   "buyer.buyerMongoId": 1,
//   "property.propertyMongoId": 1,
//   status: 1,
// });

// leadSchema.index({
//   "assignedPartner.partnerMongoId": 1,
//   status: 1,
// });

// leadSchema.index({
//   createdAt: -1,
// });

// export default mongoose.model("Lead", leadSchema);

import mongoose from "mongoose";

const actorSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    name: {
      type: String,
      default: "",
      trim: true,
    },
    role: {
      type: String,
      default: "Admin",
      trim: true,
    },
  },
  { _id: false }
);

const buyerSnapshotSchema = new mongoose.Schema(
  {
    buyerMongoId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
      index: true,
    },
    buyerCode: {
      type: String,
      default: "",
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      default: "",
      trim: true,
    },
    email: {
      type: String,
      default: "",
      lowercase: true,
      trim: true,
    },
    city: {
      type: String,
      default: "",
      trim: true,
    },
    consentVerified: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false }
);

const propertySnapshotSchema = new mongoose.Schema(
  {
    propertyMongoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "NewProperty",
      required: true,
      index: true,
    },
    propertyCode: {
      type: String,
      default: "",
      trim: true,
    },
    title: {
      type: String,
      default: "",
      trim: true,
    },
    city: {
      type: String,
      default: "",
      trim: true,
    },
    locality: {
      type: String,
      default: "",
      trim: true,
    },
    address: {
      type: String,
      default: "",
      trim: true,
    },
    price: {
      type: Number,
      default: 0,
    },
    image: {
      type: String,
      default: "",
    },

    // Who originally added the property
    addedByRole: {
      type: String,
      default: "",
      trim: true,
    },
    addedByUserId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    addedByName: {
      type: String,
      default: "",
      trim: true,
    },

    sellerMongoId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    sellerCode: {
      type: String,
      default: "",
      trim: true,
    },
    sellerName: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { _id: false }
);

const assignedPartnerSchema = new mongoose.Schema(
  {
    partnerMongoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Partner",
      default: null,
      index: true,
    },
    partnerCode: {
      type: String,
      default: "",
      trim: true,
    },
    name: {
      type: String,
      default: "",
      trim: true,
    },
    phone: {
      type: String,
      default: "",
      trim: true,
    },
    email: {
      type: String,
      default: "",
      lowercase: true,
      trim: true,
    },
    partnerType: {
      type: String,
      default: "",
      trim: true,
    },
    assignedAt: {
      type: Date,
      default: null,
    },
    assignedBy: {
      type: actorSchema,
      default: () => ({}),
    },
    assignmentSource: {
      type: String,
      enum: ["Property", "Lead", "Manual", ""],
      default: "",
    },
  },
  { _id: false }
);

const assignedSubPartnerSchema = new mongoose.Schema(
  {
    subPartnerMongoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Partner",
      default: null,
      index: true,
    },
    partnerCode: { type: String, default: "", trim: true },
    name: { type: String, default: "", trim: true },
    email: { type: String, default: "", lowercase: true, trim: true },
    phone: { type: String, default: "", trim: true },
    teamRole: { type: String, default: "", trim: true },
    allocatedAt: { type: Date, default: null },
    allocatedBy: { type: actorSchema, default: () => ({}) },
  },
  { _id: false }
);

const lifecycleSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      required: true,
    },
    event: {
      type: String,
      default: "",
    },
    remarks: {
      type: String,
      default: "",
      trim: true,
    },
    actor: {
      type: actorSchema,
      default: () => ({}),
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

const contactHistorySchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: [
        "Call",
        "WhatsApp",
        "SMS",
        "Email",
        "Note",
        "Visit",
        "Other",
      ],
      required: true,
    },
    status: {
      type: String,
      enum: [
        "Attempted",
        "Connected",
        "No_Response",
        "Sent",
        "Received",
        "Scheduled",
        "Completed",
        "Cancelled",
        "Other",
      ],
      default: "Other",
    },
    notes: {
      type: String,
      default: "",
      trim: true,
    },
    contactedAt: {
      type: Date,
      default: Date.now,
    },
    doneBy: {
      type: actorSchema,
      default: () => ({}),
    },
  },
  { _id: true }
);

export const LEAD_STATUSES = [
  "Lead_Created",
  "Lead_Verified",
  "Lead_Assigned",
  "Lead_Viewed",
  "Lead_Reviewing",
  "Lead_Rejected",
  "Lead_Closed",
  "Successfully_Converted",
];

const leadSchema = new mongoose.Schema(
  {
    leadId: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },

    source: {
      type: String,
      enum: [
        "Property_Enquiry",
        "Web_Form",
        "Admin_Created",
        "App",
        "Campaign",
        "Referral",
        "Direct",
        "Other",
      ],
      default: "Property_Enquiry",
      index: true,
    },

    buyer: {
      type: buyerSnapshotSchema,
      required: true,
    },

    property: {
      type: propertySnapshotSchema,
      required: true,
    },

    enquiryMessage: {
      type: String,
      default: "",
      trim: true,
    },

    status: {
      type: String,
      enum: LEAD_STATUSES,
      default: "Lead_Created",
      index: true,
    },

    priority: {
      type: String,
      enum: ["Low", "Medium", "High", "Urgent"],
      default: "Medium",
      index: true,
    },

    estimatedValue: {
      type: Number,
      default: 0,
    },

    assignedPartner: {
      type: assignedPartnerSchema,
      default: () => ({}),
    },

    leadVerificationStatus: {
      type: String,
      enum: ["Pending", "Verified", "Rejected"],
      default: "Pending",
      index: true,
    },

    verification: {
      notes: { type: String, default: "", trim: true },
      verifiedAt: { type: Date, default: null },
      verifiedBy: {
        type: actorSchema,
        default: () => ({}),
      },
    },

    // For team-owned leads, Team Owner can allocate handling to one verified Sub-Agent.
    assignedSubPartner: {
      type: assignedSubPartnerSchema,
      default: () => ({}),
    },

    // "Lead unlocked by assigned partner/team member" is an event,
    // not a terminal status.
    isUnlockedByPartner: {
      type: Boolean,
      default: false,
    },
    unlockedAt: {
      type: Date,
      default: null,
    },
    unlockedBy: {
      type: actorSchema,
      default: () => ({}),
    },
    
    unlockCredit: {
      creditsCharged: { type: Number, default: 0 },
      transactionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "CreditTransaction",
        default: null,
      },
      productCode: {
        type: String,
        enum: ["LEAD_UNLOCK", ""],
        default: "",
      },
      creditSource: {
        type: String,
        enum: [
          "SINGLE_WALLET",
          "TEAM_WALLET",
          "SUBAGENT_ALLOCATION",
          "",
        ],
        default: "",
      },
      chargedPartnerMongoId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Partner",
        default: null,
      },
      chargedPartnerCode: { type: String, default: "" },
      chargedAccountType: { type: String, default: "" },
      refundedCredits: { type: Number, default: 0 },
      refundTransactionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "CreditTransaction",
        default: null,
      },
    },

    lifecycle: {
      type: [lifecycleSchema],
      default: [],
    },

    contactHistory: {
      type: [contactHistorySchema],
      default: [],
    },

    review: {
      notes: {
        type: String,
        default: "",
      },
      reviewedAt: {
        type: Date,
        default: null,
      },
      reviewedBy: {
        type: actorSchema,
        default: () => ({}),
      },
    },

    rejection: {
      reason: {
        type: String,
        default: "",
      },
      rejectedAt: {
        type: Date,
        default: null,
      },
      rejectedBy: {
        type: actorSchema,
        default: () => ({}),
      },
    },

    closure: {
      reason: {
        type: String,
        default: "",
      },
      closedAt: {
        type: Date,
        default: null,
      },
      closedBy: {
        type: actorSchema,
        default: () => ({}),
      },
    },

    conversion: {
      amount: {
        type: Number,
        default: 0,
      },
      notes: {
        type: String,
        default: "",
      },
      convertedAt: {
        type: Date,
        default: null,
      },
      convertedBy: {
        type: actorSchema,
        default: () => ({}),
      },
    },

    lastContactAt: {
      type: Date,
      default: null,
      index: true,
    },

    createdBy: {
      type: actorSchema,
      default: () => ({}),
    },
  },
  {
    timestamps: true,
  }
);

leadSchema.index({
  "buyer.buyerMongoId": 1,
  "property.propertyMongoId": 1,
  status: 1,
});

leadSchema.index({
  "assignedPartner.partnerMongoId": 1,
  status: 1,
});

leadSchema.index({
  "assignedSubPartner.subPartnerMongoId": 1,
  status: 1,
});

leadSchema.index({
  createdAt: -1,
});

export default mongoose.model("Lead", leadSchema);
