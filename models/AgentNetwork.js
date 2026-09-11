import mongoose from "mongoose";

const networkCardSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    designation: {
      type: String,
      required: true,
    },

    review: {
      type: String,
      required: true,
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

const agentNetworkSchema = new mongoose.Schema(
  {
    topTitle: {
      type: String,
      default: "THE NETWORK",
    },

    heading: {
      type: String,
      default: "Voices of Punjab's Top Agents",
    },

    cards: [networkCardSchema],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model(
  "AgentNetwork",
  agentNetworkSchema
);