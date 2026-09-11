import mongoose from "mongoose";

const imageSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      default: "",
    },

    public_id: {
      type: String,
      default: "",
    },
  },
  { _id: false }
);

const roundSectionSchema = new mongoose.Schema(
  {
    image1: imageSchema,

    image2: imageSchema,

    image3: imageSchema,

    image4: imageSchema,

    image5: imageSchema,

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("RoundSection", roundSectionSchema);