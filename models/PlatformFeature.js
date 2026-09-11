import mongoose from "mongoose";

const featureCardSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
});

const platformFeatureSchema = new mongoose.Schema(
  {
    topTitle: {
      type: String,
      default: "MORE THAN A PLATFORM",
    },
    features: {
      type: [featureCardSchema],
      default: [
        {
          title: "AI Real Estate Assistant",
          description: "Personalized property recommendations...",
        },
        {
          title: "Verified Listings",
          description:
            "Every property undergoes a 42-point background check...",
        },
        {
          title: "NRI Priority Support",
          description: "Seamless digital documentation...",
        },
      ],
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model(
  "PlatformFeature",
  platformFeatureSchema
);