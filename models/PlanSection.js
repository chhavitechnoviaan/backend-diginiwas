import mongoose from "mongoose";

const planSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      required: true,
    },

    price: {
      type: String,
      required: true,
    },

    duration: {
      type: String,
      default: "/month",
    },

    badge: {
      type: String,
      default: "",
    },

    buttonText: {
      type: String,
      required: true,
    },

    buttonType: {
      type: String,
      enum: ["filled", "outline"],
      default: "outline",
    },

    features: {
      type: [String],
      default: [],
    },
  },
  { _id: false }
);

const planSectionSchema = new mongoose.Schema(
  {
    topTitle: {
      type: String,
      default: "PARTNERSHIP PLANS",
    },

    heading: {
      type: String,
      default: "Choose Your Growth Path",
    },

    plans: {
      type: [planSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("PlanSection", planSectionSchema);