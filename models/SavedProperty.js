import mongoose from "mongoose";

const savedPropertySchema = new mongoose.Schema(
  {
    buyerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Buyer",
      required: true,
      index: true,
    },

    propertyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "NewProperty",
      required: true,
      index: true,
    },

    propertySnapshot: {
      propertyCode: { type: String, default: "" },
      title: { type: String, default: "" },
      projectName: { type: String, default: "" },
      city: { type: String, default: "" },
      locality: { type: String, default: "" },
      price: { type: Number, default: 0 },
      image: { type: String, default: "" },
      bedrooms: { type: String, default: "" },
      bathrooms: { type: String, default: "" },
      propertySize: { type: Number, default: 0 },
      transactionType: { type: String, default: "" },
      category: { type: String, default: "" },
    },
  },
  {
    timestamps: true,
  }
);

savedPropertySchema.index(
  { buyerId: 1, propertyId: 1 },
  { unique: true }
);

savedPropertySchema.index({
  buyerId: 1,
  createdAt: -1,
});

export default mongoose.model("SavedProperty", savedPropertySchema);
