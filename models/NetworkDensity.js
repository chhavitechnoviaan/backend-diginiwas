import mongoose from "mongoose";

const citySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    count: {
      type: String,
      required: true,
    },
  },
  { _id: false }
);

const networkDensitySchema = new mongoose.Schema(
  {
    headingLine1: {
      type: String,
      default: "Explore the Agent",
    },

    headingHighlight: {
      type: String,
      default: "Network Density",
    },

    description: {
      type: String,
      default: "",
    },

    cities: {
      type: [citySchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model(
  "NetworkDensity",
  networkDensitySchema
);