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

const heroSectionSchema = new mongoose.Schema(
  {
    headingLine1: {
      type: String,
      default: "",
    },

    headingLine2: {
      type: String,
      default: "",
    },

    heroImage1: {
      type: imageSchema,
      default: () => ({}),
    },

    heroImage2: {
      type: imageSchema,
      default: () => ({}),
    },

    heroImage3: {
      type: imageSchema,
      default: () => ({}),
    },

    verifiedAgents: {
        type: String,
        default: "150+",
      },
      
      propertiesListed: {
        type: String,
        default: "500+",
      },
      
      happyCustomers: {
        type: String,
        default: "1000+",
      },
      
      localitiesCovered: {
        type: String,
        default: "25+",
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

export default mongoose.model("HeroSection", heroSectionSchema);



