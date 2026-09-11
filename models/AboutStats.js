import mongoose from "mongoose";

const statSchema = new mongoose.Schema(
  {
    value: {
      type: String,
      required: true,
    },

    label: {
      type: String,
      required: true,
    },
  },
  { _id: false }
);

const aboutStatsSchema = new mongoose.Schema(
  {
    stats: {
      type: [statSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("AboutStats", aboutStatsSchema);