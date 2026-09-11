// import mongoose from "mongoose";

// const creditProductSchema = new mongoose.Schema(
//   {
//     code: {
//       type: String,
//       required: true,
//       trim: true,
//     },

//     label: {
//       type: String,
//       required: true,
//       trim: true,
//     },

//     credits: {
//       type: Number,
//       required: true,
//       min: 0,
//     },

//     durationDays: {
//       type: Number,
//       default: null,
//     },

//     targetType: {
//       type: String,
//       enum: ["Partner", "Property", "Lead", "System"],
//       required: true,
//     },

//     isActive: {
//       type: Boolean,
//       default: true,
//     },
//   },
//   { _id: false }
// );

// const creditSettingSchema = new mongoose.Schema(
//   {
//     settingKey: {
//       type: String,
//       unique: true,
//       default: "GLOBAL_CREDIT_SETTING",
//     },

//     // Example:
//     // 1 = ₹1 gives 1 credit
//     // 2 = ₹1 gives 2 credits
//     creditsPerRupee: {
//       type: Number,
//       default: 1,
//       min: 0.01,
//     },

//     products: {
//       type: [creditProductSchema],
//       default: [],
//     },

//     version: {
//       type: Number,
//       default: 1,
//     },

//     updatedBy: {
//       userId: {
//         type: mongoose.Schema.Types.ObjectId,
//         default: null,
//       },

//       name: {
//         type: String,
//         default: "System",
//       },

//       role: {
//         type: String,
//         default: "Admin",
//       },
//     },
//   },
//   {
//     timestamps: true,
//   }
// );

// const CreditSetting =
//   mongoose.models.CreditSetting ||
//   mongoose.model(
//     "CreditSetting",
//     creditSettingSchema
//   );

// export default CreditSetting;


import mongoose from "mongoose";

const creditProductSchema = new mongoose.Schema({
  code: { type: String, required: true, trim: true },
  label: { type: String, required: true, trim: true },
  credits: { type: Number, required: true, min: 0 },
  durationDays: { type: Number, default: null },
  targetType: { type: String, enum: ["Partner", "Property", "Lead", "System"], required: true },
  isActive: { type: Boolean, default: true },
}, { _id: false });

const creditSettingSchema = new mongoose.Schema({
  settingKey: { type: String, unique: true, default: "GLOBAL_CREDIT_SETTING" },
  creditsPerRupee: { type: Number, default: 1, min: 0.01 },
  products: { type: [creditProductSchema], default: [] },
  version: { type: Number, default: 1 },
  updatedBy: {
    userId: { type: mongoose.Schema.Types.ObjectId, default: null },
    name: { type: String, default: "System" },
    role: { type: String, default: "Admin" },
  },
}, { timestamps: true });

export default mongoose.models.CreditSetting || mongoose.model("CreditSetting", creditSettingSchema);
