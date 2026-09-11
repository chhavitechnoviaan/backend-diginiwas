// import mongoose from "mongoose";

// const verificationHistorySchema = new mongoose.Schema(
//   {
//     action: {
//       type: String,
//       enum: ["Verified", "Unverified"],
//       required: true,
//     },
//     remarks: {
//       type: String,
//       default: "",
//       trim: true,
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
//         default: "Admin",
//       },
//     },
//     updatedAt: {
//       type: Date,
//       default: Date.now,
//     },
//   },
//   { _id: true }
// );

// const sellerSchema = new mongoose.Schema(
//   {
//     sellerId: {
//       type: String,
//       unique: true,
//       sparse: true,
//       index: true,
//     },

//     name: {
//       type: String,
//       required: true,
//       trim: true,
//     },

//     email: {
//       type: String,
//       required: true,
//       unique: true,
//       lowercase: true,
//       trim: true,
//     },

//     phone: {
//       type: String,
//       required: true,
//       unique: true,
//     },

//     password: {
//       type: String,
//       required: true,
//     },

//     role: {
//       type: String,
//       default: "seller",
//     },

//     otp: {
//       type: String,
//       default: null,
//     },

//     otpExpiresAt: {
//       type: Date,
//       default: null,
//     },

//     isPhoneVerified: {
//       type: Boolean,
//       default: false,
//     },

//     // Admin verification
//     isVerified: {
//       type: Boolean,
//       default: false,
//       index: true,
//     },

//     verifiedAt: {
//       type: Date,
//       default: null,
//     },

//     verifiedBy: {
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

//     verificationRemarks: {
//       type: String,
//       default: "",
//       trim: true,
//     },

//     verificationHistory: {
//       type: [verificationHistorySchema],
//       default: [],
//     },

//     location: {
//       city: {
//         type: String,
//         default: "",
//       },

//       state: {
//         type: String,
//         default: "",
//       },

//       country: {
//         type: String,
//         default: "India",
//       },

//       address: {
//         type: String,
//         default: "",
//       },

//       coordinates: {
//         type: {
//           type: String,
//           enum: ["Point"],
//           default: "Point",
//         },

//         coordinates: {
//           type: [Number],
//           default: [0, 0],
//         },
//       },
//     },
//   },
//   {
//     timestamps: true,
//   }
// );

// // ======================================================
// // AUTO GENERATE SELLER ID
// // ======================================================

// sellerSchema.pre("save", async function () {
//   if (!this.sellerId) {
//     const randomSuffix = Math.random()
//       .toString(36)
//       .substring(2, 7)
//       .toUpperCase();

//     this.sellerId = `SEL-${randomSuffix}`;
//   }
// });

// // ======================================================
// // GEO INDEX
// // ======================================================

// sellerSchema.index({
//   "location.coordinates": "2dsphere",
// });

// export default mongoose.model("Seller", sellerSchema);


import mongoose from "mongoose";

const verificationHistorySchema = new mongoose.Schema(
  {
    action: {
      type: String,
      enum: [
        "APPLICATION_CREATED",
        "EMAIL_OTP_SENT",
        "EMAIL_VERIFIED",
        "PHONE_OTP_SENT",
        "PHONE_VERIFIED",
        "SUBMITTED",
        "UNDER_REVIEW",
        "ACTION_REQUIRED",
        "APPROVED",
        "REJECTED",
        "SUSPENDED",
        "REACTIVATED",
        "PASSWORD_CHANGED",
      ],
      required: true,
    },
    remarks: {
      type: String,
      default: "",
      trim: true,
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
        default: "System",
      },
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

const sellerSchema = new mongoose.Schema(
  {
    sellerId: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    phone: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },

    // Password is created after email and phone verification.
    password: {
      type: String,
      default: null,
      select: false,
    },

    role: {
      type: String,
      default: "seller",
      immutable: true,
    },

    // ======================================================
    // EMAIL OTP
    // ======================================================
    emailVerification: {
      isVerified: {
        type: Boolean,
        default: false,
        index: true,
      },
      otpHash: {
        type: String,
        default: null,
        select: false,
      },
      otpExpiresAt: {
        type: Date,
        default: null,
        select: false,
      },
      verifiedAt: {
        type: Date,
        default: null,
      },
    },

    // ======================================================
    // PHONE OTP
    // ======================================================
    phoneVerification: {
      isVerified: {
        type: Boolean,
        default: false,
        index: true,
      },
      otpHash: {
        type: String,
        default: null,
        select: false,
      },
      otpExpiresAt: {
        type: Date,
        default: null,
        select: false,
      },
      verifiedAt: {
        type: Date,
        default: null,
      },
    },

    // Compatibility with existing UI/code.
    isPhoneVerified: {
      type: Boolean,
      default: false,
    },

    loginOtp: {
  otpHash: {
    type: String,
    default: null,
    select: false,
  },

  otpExpiresAt: {
    type: Date,
    default: null,
    select: false,
  },
},

    // ======================================================
    // APPLICATION WORKFLOW
    // ======================================================
    applicationStatus: {
      type: String,
      enum: [
        "EMAIL_VERIFICATION_PENDING",
        "PHONE_VERIFICATION_PENDING",
        "SUBMITTED",
        "UNDER_REVIEW",
        "ACTION_REQUIRED",
        "APPROVED",
        "REJECTED",
        "WITHDRAWN",
      ],
      default: "EMAIL_VERIFICATION_PENDING",
      index: true,
    },

    applicationSubmittedAt: {
      type: Date,
      default: null,
    },

    adminRemarks: {
      type: String,
      default: "",
      trim: true,
    },

    // ======================================================
    // ACCOUNT / ADMIN APPROVAL
    // ======================================================
    isVerified: {
      type: Boolean,
      default: false,
      index: true,
    },

    accountStatus: {
      type: String,
      enum: ["PENDING", "ACTIVE", "SUSPENDED", "BLOCKED"],
      default: "PENDING",
      index: true,
    },

    approvedAt: {
      type: Date,
      default: null,
    },

    approvedBy: {
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

    rejectedAt: {
      type: Date,
      default: null,
    },

    mustChangePassword: {
      type: Boolean,
      default: false,
    },

    lastPasswordChangedAt: {
      type: Date,
      default: null,
    },

    lastLoginAt: {
      type: Date,
      default: null,
    },

    // ======================================================
    // LOCATION
    // ======================================================
    location: {
      city: {
        type: String,
        default: "",
        trim: true,
      },
      state: {
        type: String,
        default: "",
        trim: true,
      },
      country: {
        type: String,
        default: "India",
        trim: true,
      },
      address: {
        type: String,
        default: "",
        trim: true,
      },
      pinCode: {
        type: String,
        default: "",
        trim: true,
      },
      coordinates: {
        type: {
          type: String,
          enum: ["Point"],
          default: "Point",
        },
        coordinates: {
          type: [Number],
          default: [0, 0],
        },
      },
    },

    verificationHistory: {
      type: [verificationHistorySchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// ======================================================
// AUTO GENERATE SELLER ID
// ======================================================
sellerSchema.pre("save", async function () {
  if (!this.sellerId) {
    const randomSuffix = Math.random()
      .toString(36)
      .substring(2, 7)
      .toUpperCase();

    this.sellerId = `SEL-${randomSuffix}`;
  }
});

// ======================================================
// GEO INDEX
// ======================================================
sellerSchema.index({
  "location.coordinates": "2dsphere",
});

export default mongoose.model("Seller", sellerSchema);
