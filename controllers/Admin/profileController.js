import User from "../../models/User.js";

const safeFields = "name email phone profileImage role permissions isActive createdAt";

export const getAdminProfile = async (req, res) => {
  const user = await User.findOne({ _id: req.user.id, role: "admin" }).select(safeFields).lean();
  if (!user) return res.status(404).json({ success: false, message: "Admin profile not found" });
  return res.json({ success: true, data: user });
};

export const updateAdminProfile = async (req, res) => {
  const updates = {};
  ["name", "phone", "profileImage"].forEach((key) => {
    if (req.body[key] !== undefined) updates[key] = String(req.body[key]).trim();
  });
  const user = await User.findOneAndUpdate({ _id: req.user.id, role: "admin" }, updates, { new: true, runValidators: true }).select(safeFields);
  if (!user) return res.status(404).json({ success: false, message: "Admin profile not found" });
  return res.json({ success: true, message: "Profile updated", data: user });
};

export const changeAdminPassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body || {};
  if (!currentPassword || !newPassword || String(newPassword).length < 6) {
    return res.status(400).json({ success: false, message: "Current password and a new password of at least 6 characters are required" });
  }
  const user = await User.findOne({ _id: req.user.id, role: "admin" });
  if (!user || !(await user.comparePassword(currentPassword))) return res.status(400).json({ success: false, message: "Current password is incorrect" });
  user.password = newPassword;
  await user.save();
  return res.json({ success: true, message: "Password changed successfully" });
};
