import mongoose from "mongoose";
import Notification from "../../models/Notification.js";

const ownerQuery = (req) => ({ userId: req.user.id, userRole: "admin" });

export const getAdminNotifications = async (req, res) => {
  try {
    const page = Math.max(Number(req.query.page || 1), 1);
    const limit = Math.min(Math.max(Number(req.query.limit || 20), 1), 100);
    const query = ownerQuery(req);
    if (req.query.unread === "true") query.isRead = false;
    if (req.query.type && req.query.type !== "All") query.type = req.query.type;

    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find(query).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
      Notification.countDocuments(query),
      Notification.countDocuments({ ...ownerQuery(req), isRead: false }),
    ]);

    return res.json({ success: true, data: notifications, pagination: { page, limit, total, pages: Math.ceil(total / limit) }, unreadCount });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Unable to load notifications" });
  }
};

export const markAdminNotificationRead = async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ success: false, message: "Invalid notification ID" });
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, ...ownerQuery(req) },
    { isRead: true, readAt: new Date() },
    { new: true }
  );
  if (!notification) return res.status(404).json({ success: false, message: "Notification not found" });
  return res.json({ success: true, data: notification });
};

export const markAllAdminNotificationsRead = async (req, res) => {
  await Notification.updateMany({ ...ownerQuery(req), isRead: false }, { isRead: true, readAt: new Date() });
  return res.json({ success: true, message: "All notifications marked as read" });
};
