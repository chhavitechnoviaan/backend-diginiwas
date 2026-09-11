import mongoose from "mongoose";

const teamWalletSchema = new mongoose.Schema({
  ownerPartnerId: { type: mongoose.Schema.Types.ObjectId, ref: "Partner", required: true, unique: true, index: true },
  ownerPartnerCode: { type: String, default: "", index: true },
  teamName: { type: String, default: "" },
  paidBalance: { type: Number, default: 0, min: 0 },
  promotionalBalance: { type: Number, default: 0, min: 0 },
  balance: { type: Number, default: 0, min: 0 },
  allocatedToMembers: { type: Number, default: 0, min: 0 },
  totalPurchased: { type: Number, default: 0, min: 0 },
  totalSpent: { type: Number, default: 0, min: 0 },
  totalRefunded: { type: Number, default: 0, min: 0 },
  lowBalanceThreshold: { type: Number, default: 500, min: 0 },
  isFrozen: { type: Boolean, default: false },
  freezeReason: { type: String, default: "" },
}, { timestamps: true });

export default mongoose.models.TeamWallet || mongoose.model("TeamWallet", teamWalletSchema);
