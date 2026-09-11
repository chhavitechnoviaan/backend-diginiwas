// // import mongoose from 'mongoose';

// // const buyerSchema = new mongoose.Schema({
// //   name: { type: String, required: true },
// //   email: { type: String, required: true, unique: true },
// //   phone: { type: String, required: true, unique: true },
// //   password: { type: String, required: true },
// //   role: { type: String, default: 'buyer' },
// //   otp: { type: String, default: null },
// //   otpExpiresAt: { type: Date, default: null },
// //   isPhoneVerified: { type: Boolean, default: false }
// // }, { timestamps: true });

// // export default mongoose.model('Buyer', buyerSchema);


// import mongoose from 'mongoose';

// const buyerSchema = new mongoose.Schema({
//   buyerId: { type: String, unique: true },
//   name: { type: String, required: true },
//   email: { type: String, required: true, unique: true },
//   phone: { type: String, required: true, unique: true },
//   password: { type: String, required: true },
//   role: { type: String, default: 'buyer' },
  
//   // Location Fields
//   location: {
//     city: { type: String, default: '' },
//     state: { type: String, default: '' },
//     country: { type: String, default: 'India' },
//     address: { type: String, default: '' },
//     coordinates: {
//       type: { type: String, enum: ['Point'], default: 'Point' },
//       coordinates: { type: [Number], default: [0, 0] } // [longitude, latitude]
//     }
//   },

//   status: { type: String, default: 'Active' },
//   otp: { type: String, default: null },
//   otpExpiresAt: { type: Date, default: null },
//   isPhoneVerified: { type: Boolean, default: false }
// }, { timestamps: true });

// // ✅ FIXED: Removed 'next' parameter to prevent "next is not a function" error
// buyerSchema.pre('save', function () {
//   if (!this.buyerId) {
//     this.buyerId = `BUY-${this._id.toString().slice(-5).toUpperCase()}`;
//   }
// });

// // Spatial index for location queries
// buyerSchema.index({ "location.coordinates": "2dsphere" });

// export default mongoose.model('Buyer', buyerSchema);


import mongoose from "mongoose";

const buyerSchema = new mongoose.Schema(
  {
    buyerId: {
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
    },

    phone: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      default: "buyer",
      index: true,
    },

    avatar: {
      type: String,
      default: "",
    },

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

    status: {
      type: String,
      enum: ["Active", "Pending", "Suspended", "Blocked"],
      default: "Active",
      index: true,
    },

    privacy: {
      contactSharingConsent: {
        type: Boolean,
        default: true,
      },
      privacyNoticeAccepted: {
        type: Boolean,
        default: true,
      },
      privacyNoticeAcceptedAt: {
        type: Date,
        default: Date.now,
      },
    },

    otp: {
      type: String,
      default: null,
    },

    otpExpiresAt: {
      type: Date,
      default: null,
    },

    isPhoneVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

buyerSchema.pre("save", function () {
  if (!this.buyerId) {
    this.buyerId = `BUY-${this._id.toString().slice(-5).toUpperCase()}`;
  }
});

buyerSchema.index({ "location.coordinates": "2dsphere" });

export default mongoose.model("Buyer", buyerSchema);
