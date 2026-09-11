import mongoose from "mongoose";

const aboutMissionVisionSchema = new mongoose.Schema(
  {
    mission: {
      title: {
        type: String,
        default: "Our Mission",
      },

      heading: {
        type: String,
        default: "",
      },

      description: {
        type: String,
        default: "",
      },
    },

    vision: {
      title: {
        type: String,
        default: "Our Vision",
      },

      heading: {
        type: String,
        default: "",
      },

      description: {
        type: String,
        default: "",
      },
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model(
  "AboutMissionVision",
  aboutMissionVisionSchema
);