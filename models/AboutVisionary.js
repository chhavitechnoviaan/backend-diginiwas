import mongoose from "mongoose";

const visionarySchema = new mongoose.Schema(
  {
    sectionTitle: {
      type: String,
      default: "The Visionaries",
    },

    sectionSubtitle: {
      type: String,
      default: "Expert in technology and real estate crafting the future",
    },

    members: [
      {
        name: String,

        designation: String,

        description: String,

        image: {
          url: String,
          public_id: String,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model(
  "AboutVisionary",
  visionarySchema
);