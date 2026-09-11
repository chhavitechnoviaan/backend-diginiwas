// import mongoose from "mongoose";

// const propertySchema = new mongoose.Schema(
//   {
//     propertyId: {
//       type: String,
//       unique: true,
//     },

//     title: {
//       type: String,
//       required: true,
//       trim: true,
//     },

//     transactionType: {
//       type: String,
//       enum: ["Sale", "Rent"],
//       required: true,
//     },

//     category: {
//       type: String,
//       enum: [
//         "Residential",
//         "Commercial",
//         "Rental",
//         "Sell",
//         "Plot/Land",
//       ],
//       required: true,
//     },

//     status: {
//       type: String,
//       enum: [
//         "Draft",
//         "Submitted",
//         "Assigned_To_Partner",
//         "Reviewing",
//         "Verified",
//         "Live",
//         "Rejected",
//         "Sold",
//         "Rented",
//       ],
//       default: "Draft",
//     },
//     propertyVerificationStatus: {
//       type: String,
//       enum: [
//         "Pending",
//         "In_Progress",
//         "Verified",
//         "Rejected",
//       ],
//       default: "Pending",
//     },

//     propertySize: {
//       type: Number,
//       required: true,
//     },

//     sizeUnit: {
//       type: String,
//       default: "sqft",
//     },

//     price: {
//       type: Number,
//       required: true,
//     },

//     pricePerSqft: {
//       type: Number,
//     },

//     projectName: {
//       type: String,
//       default: "",
//     },

//     developerName: {
//       type: String,
//       default: "",
//     },

//     description: {
//       type: String,
//       default: "",
//     },

//     city: {
//       type: String,
//       default: "",
//     },

//     locality: {
//       type: String,
//       default: "",
//     },

//     pinCode: {
//       type: String,
//       default: "",
//     },

//     address: {
//       type: String,
//       default: "",
//     },

//     latitude: Number,
//     longitude: Number,

//     maintenance: Number,
//     bookingAmount: Number,

//     negotiable: {
//       type: Boolean,
//       default: false,
//     },

//     superBuiltupArea: Number,
//     carpetArea: Number,

//     bedrooms: {
//       type: String,
//       default: "",
//     },

//     bathrooms: {
//       type: String,
//       default: "",
//     },

//     balconies: {
//       type: String,
//       default: "",
//     },

//     parking: {
//       type: String,
//       default: "",
//     },

//     floorNo: Number,
//     totalFloors: Number,

//     facing: {
//       type: String,
//       default: "",
//     },

//     furnishing: {
//       type: String,
//       default: "",
//     },

//     amenities: {
//       type: [String],
//       default: [],
//     },

//     images: [
//       {
//         url: String,
//         public_id: String,
//       },
//     ],

//     floorPlan: {
//       type: String,
//       default: "",
//     },

//     reraCertificate: {
//       type: String,
//       default: "",
//     },

//     videoLink: {
//       type: String,
//       default: "",
//     },

//     video: {
//       type: String,
//       default: "",
//     },

//     tags: {
//       type: [String],
//       default: [],
//     },

//     addedBy: {
//       userId: {
//         type: mongoose.Schema.Types.ObjectId,
//         required: true,
//       },

//       sellerId: {
//         type: String,
//         default: null,
//       },

//       partnerId: {
//         type: String,
//         default: null,
//       },

//       partnerType: {
//         type: String,
//         enum: ["team", "single", null],
//         default: null,
//       },

//       role: {
//         type: String,
//         enum: [
//           "Seller",
//           "Partner",
//           "Owner",
//           "Agent",
//           "Admin",
//         ],
//         required: true,
//       },

//       name: {
//         type: String,
//         required: true,
//       },

//       email: {
//         type: String,
//         default: "",
//       },

//       phone: {
//         type: String,
//         default: "",
//       },
//     },

//     assignedPartner: {
//       partnerId: {
//         type:
//           mongoose.Schema.Types
//             .ObjectId,

//         ref: "Partner",

//         default: null,
//       },

//       partnerCode: {
//         type: String,
//         default: null,
//       },

//       name: {
//         type: String,
//         default: "",
//       },

//       email: {
//         type: String,
//         default: "",
//       },

//       phone: {
//         type: String,
//         default: "",
//       },

//       partnerType: {
//         type: String,

//         enum: [
//           "team",
//           "single",
//           null,
//         ],

//         default: null,
//       },

//       assignedAt: {
//         type: Date,
//         default: null,
//       },

//       verificationStatus: {
//         type: String,

//         enum: [
//           "Pending",
//           "In_Progress",
//           "Verified",
//           "Rejected",
//         ],

//         default: "Pending",
//       },

//       visitDate: {
//         type: Date,
//         default: null,
//       },

//       partnerRemarks: {
//         type: String,
//         default: "",
//       },
//     },

//     // ======================================================
//     // VP / ADMIN PROPERTY REVIEW
//     // ======================================================

//     review: {
//       reviewedBy: {
//         userId: {
//           type: mongoose.Schema.Types.ObjectId,
//           default: null,
//         },

//         name: {
//           type: String,
//           default: "",
//         },

//         role: {
//           type: String,
//           default: "",
//         },
//       },

//       reviewedAt: {
//         type: Date,
//         default: null,
//       },

//       notes: {
//         type: String,
//         default: "",
//       },

//       rejectionReason: {
//         type: String,
//         default: "",
//       },
//     },
//     // ======================================================
//     // PROPERTY BOOST
//     // ======================================================

//     boost: {
//       isBoosted: {
//         type: Boolean,
//         default: false,
//       },

//       boostType: {
//         type: String,
//         enum: [
//           "Featured",
//           "Premium",
//           "Top",
//           null,
//         ],
//         default: null,
//       },

//       startDate: {
//         type: Date,
//         default: null,
//       },

//       endDate: {
//         type: Date,
//         default: null,
//       },

//       boostedBy: {
//         userId: {
//           type: mongoose.Schema.Types.ObjectId,
//           default: null,
//         },

//         name: {
//           type: String,
//           default: "",
//         },

//         role: {
//           type: String,
//           default: "",
//         },
//       },
//     },
//     statusHistory: [
//       {
//         status: {
//           type: String,
//           required: true,
//         },

//         updatedBy: {
//           userId: {
//             type: mongoose.Schema.Types.ObjectId,
//           },

//           name: String,
//           role: String,
//         },

//         updatedAt: {
//           type: Date,
//           default: Date.now,
//         },

//         remarks: String,
//       },
//     ],

//     promotions: {
//   boost: {
//     isActive: { type: Boolean, default: false, index: true },
//     approvedAt: { type: Date, default: null },
//     expiresAt: { type: Date, default: null },
//     requestId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "PromotionRequest",
//       default: null,
//     },
//     partnerId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Partner",
//       default: null,
//     },
//   },

//   featured: {
//     isActive: { type: Boolean, default: false, index: true },
//     approvedAt: { type: Date, default: null },
//     expiresAt: { type: Date, default: null, index: true },
//     requestId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "PromotionRequest",
//       default: null,
//     },
//     partnerId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Partner",
//       default: null,
//     },
//   },

//   localityTop: {
//     isActive: { type: Boolean, default: false, index: true },
//     approvedAt: { type: Date, default: null },
//     expiresAt: { type: Date, default: null, index: true },
//     requestId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "PromotionRequest",
//       default: null,
//     },
//     partnerId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Partner",
//       default: null,
//     },
//     locality: { type: String, default: "", index: true },
//   },
// },
// promotionHistory: [
//   {
//     requestId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "PromotionRequest",
//       default: null,
//     },
//     promotionType: {
//       type: String,
//       enum: ["PROPERTY_BOOST", "FEATURED_7_DAYS", "LOCALITY_TOP_30_DAYS"],
//     },
//     action: {
//       type: String,
//       enum: ["Approved", "Rejected", "Expired", "Disabled"],
//     },
//     credits: { type: Number, default: 0 },
//     actor: {
//       userId: { type: mongoose.Schema.Types.ObjectId, default: null },
//       name: { type: String, default: "" },
//       role: { type: String, default: "System" },
//     },
//     createdAt: { type: Date, default: Date.now },
//     remarks: { type: String, default: "" },
//   },
// ],
//   },
//   {
//     timestamps: true,
//   }
// );

// // propertySchema.pre(
// //   "save",
// //   async function () {
// //     if (
// //       this.price &&
// //       this.propertySize &&
// //       this.propertySize > 0
// //     ) {
// //       this.pricePerSqft = Math.round(
// //         this.price / this.propertySize
// //       );
// //     }
// //   }
// // );
// propertySchema.pre(
//   "save",
//   async function () {

//     // ======================================================
//     // PRICE PER SQFT
//     // ======================================================

//     if (
//       this.price &&
//       this.propertySize &&
//       this.propertySize > 0
//     ) {
//       this.pricePerSqft = Math.round(
//         this.price / this.propertySize
//       );
//     }

//     // ======================================================
//     // PROPERTY VERIFICATION STATUS AUTO SYNC
//     // ======================================================

//     // Property Reviewing me gayi
//     if (this.status === "Reviewing") {
//       this.propertyVerificationStatus =
//         "In_Progress";
//     }

//     // IMPORTANT:
//     // Property status Verified hua tabhi
//     // property verification Verified hogi
//     if (this.status === "Verified") {
//       this.propertyVerificationStatus =
//         "Verified";
//     }

//     // Property reject hui
//     if (this.status === "Rejected") {
//       this.propertyVerificationStatus =
//         "Rejected";
//     }

//     // Live / Sold / Rented par verification ko
//     // change nahi karenge.
//     // Verified once => remains Verified.
//   }
// );
// propertySchema.index({
//   status: 1,
//   propertyVerificationStatus: 1,
//   "promotions.featured.isActive": 1,
//   "promotions.featured.expiresAt": -1,
// });
// propertySchema.index({
//   locality: 1,
//   status: 1,
//   "promotions.localityTop.isActive": 1,
//   "promotions.localityTop.expiresAt": -1,
// });


// export default mongoose.model(
//   "NewProperty",
//   propertySchema
// );



import mongoose from "mongoose";

const propertySchema = new mongoose.Schema(
  {
    propertyId: {
      type: String,
      unique: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    transactionType: {
      type: String,
      enum: ["Sale", "Rent"],
      required: true,
    },

    category: {
      type: String,
      enum: [
        "Residential",
        "Commercial",
        "Rental",
        "Sell",
        "Plot/Land",
      ],
      required: true,
    },

    status: {
      type: String,
      enum: [
        "Draft",
        "Submitted",
        "Assigned_To_Partner",
        "Reviewing",
        "Verified",
        "Live",
        "Rejected",
        "Sold",
        "Rented",
      ],
      default: "Draft",
    },
    propertyVerificationStatus: {
      type: String,
      enum: [
        "Pending",
        "In_Progress",
        "Verified",
        "Rejected",
      ],
      default: "Pending",
    },

    propertySize: {
      type: Number,
      required: true,
    },

    sizeUnit: {
      type: String,
      default: "sqft",
    },

    price: {
      type: Number,
      required: true,
    },

    pricePerSqft: {
      type: Number,
    },

    projectName: {
      type: String,
      default: "",
    },

    developerName: {
      type: String,
      default: "",
    },

    description: {
      type: String,
      default: "",
    },

    city: {
      type: String,
      default: "",
    },

    locality: {
      type: String,
      default: "",
    },

    pinCode: {
      type: String,
      default: "",
    },

    address: {
      type: String,
      default: "",
    },

    latitude: Number,
    longitude: Number,

    maintenance: Number,
    bookingAmount: Number,

    negotiable: {
      type: Boolean,
      default: false,
    },

    superBuiltupArea: Number,
    carpetArea: Number,

    bedrooms: {
      type: String,
      default: "",
    },

    bathrooms: {
      type: String,
      default: "",
    },

    balconies: {
      type: String,
      default: "",
    },

    parking: {
      type: String,
      default: "",
    },

    floorNo: Number,
    totalFloors: Number,

    facing: {
      type: String,
      default: "",
    },

    furnishing: {
      type: String,
      default: "",
    },

    amenities: {
      type: [String],
      default: [],
    },

    images: [
      {
        url: String,
        public_id: String,
      },
    ],

    floorPlan: {
      type: String,
      default: "",
    },

    reraCertificate: {
      type: String,
      default: "",
    },

    videoLink: {
      type: String,
      default: "",
    },

    video: {
      type: String,
      default: "",
    },

    tags: {
      type: [String],
      default: [],
    },

    addedBy: {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
      },

      sellerId: {
        type: String,
        default: null,
      },

      partnerId: {
        type: String,
        default: null,
      },

      partnerType: {
        type: String,
        enum: ["team", "single", null],
        default: null,
      },

      role: {
        type: String,
        enum: [
          "Seller",
          "Partner",
          "Owner",
          "Agent",
          "Admin",
        ],
        required: true,
      },

      name: {
        type: String,
        required: true,
      },

      email: {
        type: String,
        default: "",
      },

      phone: {
        type: String,
        default: "",
      },
    },

    assignedPartner: {
      partnerId: {
        type:
          mongoose.Schema.Types
            .ObjectId,

        ref: "Partner",

        default: null,
      },

      partnerCode: {
        type: String,
        default: null,
      },

      name: {
        type: String,
        default: "",
      },

      email: {
        type: String,
        default: "",
      },

      phone: {
        type: String,
        default: "",
      },

      partnerType: {
        type: String,

        enum: [
          "team",
          "single",
          null,
        ],

        default: null,
      },

      assignedAt: {
        type: Date,
        default: null,
      },

      verificationStatus: {
        type: String,

        enum: [
          "Pending",
          "In_Progress",
          "Verified",
          "Rejected",
        ],

        default: "Pending",
      },

      visitDate: {
        type: Date,
        default: null,
      },

      partnerRemarks: {
        type: String,
        default: "",
      },
    },

    // ======================================================
    // TEAM OWNER -> SUB-AGENT DELEGATION
    // Admin assigns only to assignedPartner (single/team owner).
    // A verified Team Owner can then delegate to one verified Sub-Agent.
    // ======================================================
    delegatedSubPartner: {
      subPartnerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Partner",
        default: null,
      },
      partnerCode: { type: String, default: "" },
      name: { type: String, default: "" },
      email: { type: String, default: "" },
      phone: { type: String, default: "" },
      teamRole: { type: String, default: "" },
      delegatedBy: {
        partnerId: { type: mongoose.Schema.Types.ObjectId, ref: "Partner", default: null },
        partnerCode: { type: String, default: "" },
        name: { type: String, default: "" },
      },
      delegatedAt: { type: Date, default: null },
    },

    // ======================================================
    // VP / ADMIN PROPERTY REVIEW
    // ======================================================

    review: {
      reviewedBy: {
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

      reviewedAt: {
        type: Date,
        default: null,
      },

      notes: {
        type: String,
        default: "",
      },

      rejectionReason: {
        type: String,
        default: "",
      },
    },
    // ======================================================
    // PROPERTY BOOST
    // ======================================================

    boost: {
      isBoosted: {
        type: Boolean,
        default: false,
      },

      boostType: {
        type: String,
        enum: [
          "Featured",
          "Premium",
          "Top",
          null,
        ],
        default: null,
      },

      startDate: {
        type: Date,
        default: null,
      },

      endDate: {
        type: Date,
        default: null,
      },

      boostedBy: {
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
    },
    statusHistory: [
      {
        status: {
          type: String,
          required: true,
        },

        updatedBy: {
          userId: {
            type: mongoose.Schema.Types.ObjectId,
          },

          name: String,
          role: String,
        },

        updatedAt: {
          type: Date,
          default: Date.now,
        },

        remarks: String,
      },
    ],

    promotions: {
  boost: {
    isActive: { type: Boolean, default: false, index: true },
    approvedAt: { type: Date, default: null },
    expiresAt: { type: Date, default: null },
    requestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PromotionRequest",
      default: null,
    },
    partnerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Partner",
      default: null,
    },
  },

  featured: {
    isActive: { type: Boolean, default: false, index: true },
    approvedAt: { type: Date, default: null },
    expiresAt: { type: Date, default: null, index: true },
    requestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PromotionRequest",
      default: null,
    },
    partnerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Partner",
      default: null,
    },
  },

  localityTop: {
    isActive: { type: Boolean, default: false, index: true },
    approvedAt: { type: Date, default: null },
    expiresAt: { type: Date, default: null, index: true },
    requestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PromotionRequest",
      default: null,
    },
    partnerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Partner",
      default: null,
    },
    locality: { type: String, default: "", index: true },
  },
},


    // ======================================================
    // PROMOTION REQUEST SNAPSHOTS
    // Every partner request targeting this property is stored here too.
    // ======================================================
    promotionRequests: [
      {
        requestId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "PromotionRequest",
          required: true,
        },
        requestCode: { type: String, default: "" },
        partnerMongoId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Partner",
          required: true,
        },
        partnerCode: { type: String, default: "" },
        partnerName: { type: String, default: "" },
        promotionType: {
          type: String,
          enum: ["PROPERTY_BOOST", "FEATURED_7_DAYS", "LOCALITY_TOP_30_DAYS"],
          required: true,
        },
        creditsCharged: { type: Number, default: 0 },
        status: {
          type: String,
          enum: ["Pending", "Approved", "Rejected", "Cancelled", "Expired"],
          default: "Pending",
        },
        requestedAt: { type: Date, default: Date.now },
        approvedAt: { type: Date, default: null },
        rejectedAt: { type: Date, default: null },
        expiresAt: { type: Date, default: null },
        adminRemarks: { type: String, default: "" },
      },
    ],

    promotionHistory: [
  {
    requestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PromotionRequest",
      default: null,
    },
    promotionType: {
      type: String,
      enum: ["PROPERTY_BOOST", "FEATURED_7_DAYS", "LOCALITY_TOP_30_DAYS"],
    },
    action: {
      type: String,
      enum: ["Approved", "Rejected", "Expired", "Disabled"],
    },
    credits: { type: Number, default: 0 },
    actor: {
      userId: { type: mongoose.Schema.Types.ObjectId, default: null },
      name: { type: String, default: "" },
      role: { type: String, default: "System" },
    },
    createdAt: { type: Date, default: Date.now },
    remarks: { type: String, default: "" },
  },
],
  },
  {
    timestamps: true,
  }
);

// propertySchema.pre(
//   "save",
//   async function () {
//     if (
//       this.price &&
//       this.propertySize &&
//       this.propertySize > 0
//     ) {
//       this.pricePerSqft = Math.round(
//         this.price / this.propertySize
//       );
//     }
//   }
// );
propertySchema.pre(
  "save",
  async function () {

    // ======================================================
    // PRICE PER SQFT
    // ======================================================

    if (
      this.price &&
      this.propertySize &&
      this.propertySize > 0
    ) {
      this.pricePerSqft = Math.round(
        this.price / this.propertySize
      );
    }

    // ======================================================
    // PROPERTY VERIFICATION STATUS AUTO SYNC
    // ======================================================

    // Property Reviewing me gayi
    if (this.status === "Reviewing") {
      this.propertyVerificationStatus =
        "In_Progress";
    }

    // IMPORTANT:
    // Property status Verified hua tabhi
    // property verification Verified hogi
    if (this.status === "Verified") {
      this.propertyVerificationStatus =
        "Verified";
    }

    // Property reject hui
    if (this.status === "Rejected") {
      this.propertyVerificationStatus =
        "Rejected";
    }

    // Live / Sold / Rented par verification ko
    // change nahi karenge.
    // Verified once => remains Verified.
  }
);
propertySchema.index({
  status: 1,
  propertyVerificationStatus: 1,
  "promotions.featured.isActive": 1,
  "promotions.featured.expiresAt": -1,
});
propertySchema.index({
  locality: 1,
  status: 1,
  "promotions.localityTop.isActive": 1,
  "promotions.localityTop.expiresAt": -1,
});


propertySchema.index({ "promotionRequests.status": 1 });
propertySchema.index({ "promotionRequests.partnerMongoId": 1 });

export default mongoose.model(
  "NewProperty",
  propertySchema
);