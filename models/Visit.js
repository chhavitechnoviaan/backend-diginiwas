// import mongoose from "mongoose";

// const visitHistorySchema = new mongoose.Schema(
//   {
//     action: {
//       type: String,
//       required: true,
//       trim: true,
//     },
//     fromStatus: {
//       type: String,
//       default: "",
//     },
//     toStatus: {
//       type: String,
//       default: "",
//     },
//     remarks: {
//       type: String,
//       default: "",
//     },
//     updatedBy: {
//       userId: {
//         type: mongoose.Schema.Types.ObjectId,
//         default: null,
//       },
//       name: {
//         type: String,
//         default: "",
//       },
//       role: {
//         type: String,
//         default: "",
//       },
//     },
//     updatedAt: {
//       type: Date,
//       default: Date.now,
//     },
//   },
//   { _id: true }
// );

// const visitSchema = new mongoose.Schema(
//   {
//     visitId: {
//       type: String,
//       unique: true,
//       sparse: true,
//       index: true,
//     },

//     propertyId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "NewProperty",
//       required: true,
//       index: true,
//     },

//     partnerId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Partner",
//       required: true,
//       index: true,
//     },

//     // Snapshot values keep admin history readable even if master data changes later.
//     propertySnapshot: {
//       propertyCode: { type: String, default: "" },
//       title: { type: String, default: "" },
//       projectName: { type: String, default: "" },
//       category: { type: String, default: "" },
//       city: { type: String, default: "" },
//       locality: { type: String, default: "" },
//       address: { type: String, default: "" },
//       image: { type: String, default: "" },
//       latitude: { type: Number, default: null },
//       longitude: { type: Number, default: null },
//     },

//     partnerSnapshot: {
//       partnerCode: { type: String, default: "" },
//       name: { type: String, default: "" },
//       phone: { type: String, default: "" },
//       email: { type: String, default: "" },
//       partnerType: { type: String, default: "" },
//     },

//     requestedVisitAt: {
//       type: Date,
//       required: true,
//       index: true,
//     },

//     approvedVisitAt: {
//       type: Date,
//       default: null,
//     },

//     completedAt: {
//       type: Date,
//       default: null,
//     },

//     approvalStatus: {
//       type: String,
//       enum: ["Pending", "Approved", "Rejected"],
//       default: "Pending",
//       index: true,
//     },

//     status: {
//       type: String,
//       enum: [
//         "Requested",
//         "Upcoming",
//         "Completed",
//         "Cancelled",
//         "No Show",
//         "Rescheduled",
//         "Follow-up",
//       ],
//       default: "Requested",
//       index: true,
//     },

//     outcome: {
//       type: String,
//       enum: [
//         "Pending",
//         "Positive",
//         "Strong Interest",
//         "Not Interested",
//         "Need Follow-up",
//         "Completed",
//         "Cancelled",
//         "No Show",
//       ],
//       default: "Pending",
//     },

//     requestNotes: {
//       type: String,
//       default: "",
//       trim: true,
//     },

//     adminRemarks: {
//       type: String,
//       default: "",
//       trim: true,
//     },

//     partnerRemarks: {
//       type: String,
//       default: "",
//       trim: true,
//     },

//     followUpAt: {
//       type: Date,
//       default: null,
//     },

//     rescheduleReason: {
//       type: String,
//       default: "",
//     },

//     cancellationReason: {
//       type: String,
//       default: "",
//     },

//     requestedBy: {
//       userId: {
//         type: mongoose.Schema.Types.ObjectId,
//         default: null,
//       },
//       name: { type: String, default: "" },
//       role: { type: String, default: "Partner" },
//     },

//     approvedBy: {
//       userId: {
//         type: mongoose.Schema.Types.ObjectId,
//         default: null,
//       },
//       name: { type: String, default: "" },
//       role: { type: String, default: "Admin" },
//       approvedAt: { type: Date, default: null },
//     },

//     history: {
//       type: [visitHistorySchema],
//       default: [],
//     },
//   },
//   { timestamps: true }
// );

// visitSchema.index({ propertyId: 1, partnerId: 1, requestedVisitAt: -1 });
// visitSchema.index({ status: 1, requestedVisitAt: 1 });
// visitSchema.index({ "propertySnapshot.city": 1 });

// export default mongoose.model("Visit", visitSchema);


import mongoose from "mongoose";

const visitHistorySchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
      trim: true,
    },
    fromStatus: {
      type: String,
      default: "",
    },
    toStatus: {
      type: String,
      default: "",
    },
    remarks: {
      type: String,
      default: "",
    },
    updatedBy: {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        default: null,
      },
      name: {
        type: String,
        default: "",
      },
      role: {
        type: String,
        default: "",
      },
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

const visitSchema = new mongoose.Schema(
  {
    visitId: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },

    propertyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "NewProperty",
      required: true,
      index: true,
    },

    buyerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Buyer",
      default: null,
      index: true,
    },

    partnerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Partner",
      required: true,
      index: true,
    },

    leadId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lead",
      default: null,
      index: true,
    },

    buyerSnapshot: {
      buyerCode: { type: String, default: "" },
      name: { type: String, default: "" },
      phone: { type: String, default: "" },
      email: { type: String, default: "" },
      city: { type: String, default: "" },
    },

    propertySnapshot: {
      propertyCode: { type: String, default: "" },
      title: { type: String, default: "" },
      projectName: { type: String, default: "" },
      category: { type: String, default: "" },
      city: { type: String, default: "" },
      locality: { type: String, default: "" },
      address: { type: String, default: "" },
      image: { type: String, default: "" },
      latitude: { type: Number, default: null },
      longitude: { type: Number, default: null },
    },

    partnerSnapshot: {
      partnerCode: { type: String, default: "" },
      name: { type: String, default: "" },
      phone: { type: String, default: "" },
      email: { type: String, default: "" },
      partnerType: { type: String, default: "" },
    },

    requestedVisitAt: {
      type: Date,
      required: true,
      index: true,
    },

    approvedVisitAt: {
      type: Date,
      default: null,
    },

    completedAt: {
      type: Date,
      default: null,
    },

    // Team hierarchy for visit approval.
    // Single/Team Owner requests go directly to Admin.
    // Sub-Agent requests must be forwarded by its Team Owner first.
    requestSource: {
      type: String,
      enum: ["single", "team", "subagent"],
      default: "single",
      index: true,
    },
    teamOwnerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Partner",
      default: null,
      index: true,
    },
    teamApprovalStatus: {
      type: String,
      enum: ["Not_Required", "Pending", "Forwarded", "Rejected"],
      default: "Not_Required",
      index: true,
    },
    teamRemarks: { type: String, default: "", trim: true },
    forwardedToAdminAt: { type: Date, default: null },

    approvalStatus: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
      index: true,
    },

    status: {
      type: String,
      enum: [
        "Requested",
        "Upcoming",
        "Completed",
        "Cancelled",
        "No Show",
        "Rescheduled",
        "Follow-up",
      ],
      default: "Requested",
      index: true,
    },

    outcome: {
      type: String,
      enum: [
        "Pending",
        "Positive",
        "Strong Interest",
        "Not Interested",
        "Need Follow-up",
        "Completed",
        "Cancelled",
        "No Show",
      ],
      default: "Pending",
    },

    requestNotes: {
      type: String,
      default: "",
      trim: true,
    },

    adminRemarks: {
      type: String,
      default: "",
      trim: true,
    },

    partnerRemarks: {
      type: String,
      default: "",
      trim: true,
    },

    followUpAt: {
      type: Date,
      default: null,
    },

    rescheduleReason: {
      type: String,
      default: "",
    },

    cancellationReason: {
      type: String,
      default: "",
    },

    requestedBy: {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        default: null,
      },
      name: { type: String, default: "" },
      role: { type: String, default: "Partner" },
    },

    approvedBy: {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        default: null,
      },
      name: { type: String, default: "" },
      role: { type: String, default: "Admin" },
      approvedAt: { type: Date, default: null },
    },

    history: {
      type: [visitHistorySchema],
      default: [],
    },
  },
  { timestamps: true }
);

visitSchema.index({
  propertyId: 1,
  partnerId: 1,
  requestedVisitAt: -1,
});

visitSchema.index({
  buyerId: 1,
  requestedVisitAt: -1,
});

visitSchema.index({
  status: 1,
  requestedVisitAt: 1,
});

visitSchema.index({
  "propertySnapshot.city": 1,
});

export default mongoose.model("Visit", visitSchema);
