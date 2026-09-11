import mongoose from "mongoose";

const aboutGenesisSchema = new mongoose.Schema(
  {
    topTitle: {
      type: String,
      default: "THE GENESIS",
    },

    heading: {
      type: String,
      default: "Beyond the Fragmented Market.",
    },

    paragraph1: {
      type: String,
      default: "",
    },

    paragraph2: {
      type: String,
      default: "",
    },

    quote: {
      type: String,
      default: "",
    },

    image: {
      url: String,
      public_id: String,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model(
  "AboutGenesis",
  aboutGenesisSchema
);