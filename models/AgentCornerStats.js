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

const agentCornerSchema = new mongoose.Schema(
  {
    stats: {
      type: [statSchema],
      default: [],
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

export default mongoose.model("AgentCorner", agentCornerSchema);