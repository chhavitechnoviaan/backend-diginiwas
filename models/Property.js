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
      required: true,
    },

    status: {
      type: String,
      default: "Draft",
    },

    projectName: String,

    developerName: String,

    description: String,

    city: String,

    locality: String,

    pinCode: String,

    address: String,

    latitude: Number,

    longitude: Number,

    price: Number,

    pricePerSqft: Number,

    maintenance: Number,

    bookingAmount: Number,

    negotiable: {
      type: Boolean,
      default: false,
    },

    superBuiltupArea: Number,

    carpetArea: Number,

    bedrooms: String,

    bathrooms: String,

    balconies: String,

    parking: String,

    floorNo: Number,

    totalFloors: Number,

    facing: String,

    furnishing: String,

    amenities: [
      {
        type: String,
      },
    ],

    images: [
      {
        url: String,
        public_id: String,
      },
    ],

    floorPlan: String,

    reraCertificate: String,

    videoLink: String,
    video: String, 

    tags: [
      {
        type: String,
      },
    ],

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Property", propertySchema);