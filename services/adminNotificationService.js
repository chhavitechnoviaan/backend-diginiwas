import Notification from "../models/Notification.js";
import User from "../models/User.js";

export const notifyAdmins = async ({ title, message, type, actionUrl, entityType, entityId, data = {} }) => {
  try {
    const admins = await User.find({ role: "admin", isActive: { $ne: false } }).select("_id").lean();
    if (!admins.length) return [];

    return Notification.insertMany(
      admins.map((admin) => ({
        userId: admin._id,
        userRole: "admin",
        title,
        message,
        type,
        actionUrl,
        entityType,
        entityId,
        data,
      }))
    );
  } catch (error) {
    // A notification failure must never fail the main business operation.
    console.error("CREATE ADMIN NOTIFICATION ERROR:", error);
    return [];
  }
};
