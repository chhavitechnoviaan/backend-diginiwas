import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
    userRole: { type: String, default: "buyer", index: true },
    title: { type: String, required: true, trim: true },
    message: { type: String, default: "", trim: true },
    type: { type: String, default: "GENERAL", index: true },
    data: { type: mongoose.Schema.Types.Mixed, default: {} },
    actionUrl: { type: String, default: "", trim: true },
    entityType: { type: String, default: "", index: true },
    entityId: { type: mongoose.Schema.Types.ObjectId, default: null, index: true },
    isRead: { type: Boolean, default: false, index: true },
    readAt: { type: Date, default: null },
  },
  { timestamps: true },
);

notificationSchema.index({ userId: 1, userRole: 1, isRead: 1, createdAt: -1 });

export default mongoose.models.Notification ||
  mongoose.model("Notification", notificationSchema);
