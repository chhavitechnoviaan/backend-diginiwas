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
  {
    _id: false,
  }
);

const testimonialSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      default: "",
    },

    designation: {
      type: String,
      default: "",
    },

    review: {
      type: String,
      default: "",
    },

    image: {
      type: imageSchema,
      default: () => ({}),
    },

    videoLink: {
      type: String,
      default: "",
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Testimonial", testimonialSchema);