import Buyer from "../../models/Buyer.js";
import Seller from "../../models/Seller.js";
import Partner from "../../models/Partner.js";

const text = (value = "") => String(value || "").trim();

const locationLabel = (location = {}) =>
  [location.city, location.state, location.country]
    .map(text)
    .filter(Boolean)
    .join(", ") || "Not provided";

const initials = (name = "User") =>
  text(name)
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "U";

const partnerStatus = (partner) => {
  if (partner.isBlocked || partner.applicationStatus === "Suspended") return "Suspended";
  if (partner.isRejected || partner.applicationStatus === "Rejected") return "Rejected";
  if (partner.isVerified && partner.isApproved) return "Verified";
  if (partner.isApproved) return "Approved - Verification Pending";
  if (partner.applicationStatus === "Submitted") return "Approval Pending";
  if (partner.applicationStatus === "Pending_Phone_Verification") return "Phone Verification Pending";
  if (partner.applicationStatus === "Pending_Email_Verification") return "Email Verification Pending";
  return partner.applicationStatus || "Pending";
};

const mapBuyer = (buyer) => ({
  _id: buyer._id,
  userCode: buyer.buyerId || String(buyer._id),
  name: buyer.name,
  email: buyer.email,
  phone: buyer.phone,
  type: "Buyer",
  status: buyer.status || "Active",
  location: locationLabel(buyer.location),
  avatar: buyer.avatar || "",
  initials: initials(buyer.name),
  emailVerified: Boolean(buyer.emailVerification?.isVerified),
  phoneVerified: Boolean(buyer.isPhoneVerified),
  approved: true,
  verified: Boolean(buyer.isPhoneVerified),
  createdAt: buyer.createdAt,
  updatedAt: buyer.updatedAt,
});

const mapSeller = (seller) => ({
  _id: seller._id,
  userCode: seller.sellerId || String(seller._id),
  name: seller.name,
  email: seller.email,
  phone: seller.phone,
  type: "Seller",
  status: seller.accountStatus || seller.applicationStatus || "Pending",
  applicationStatus: seller.applicationStatus,
  location: locationLabel(seller.location),
  avatar: seller.avatar || "",
  initials: initials(seller.name),
  emailVerified: Boolean(seller.emailVerification?.isVerified),
  phoneVerified: Boolean(seller.phoneVerification?.isVerified),
  approved: seller.applicationStatus === "APPROVED",
  verified: Boolean(seller.isVerified),
  createdAt: seller.createdAt,
  updatedAt: seller.updatedAt,
});

const mapPartner = (partner) => ({
  _id: partner._id,
  userCode: partner.partnerId || String(partner._id),
  name: partner.name,
  email: partner.email,
  phone: partner.phone,
  type: partner.isSubPartner ? "Sub Partner" : "Partner",
  accountType: partner.accountType,
  status: partnerStatus(partner),
  applicationStatus: partner.applicationStatus,
  location: locationLabel(partner.location),
  avatar: partner.profileImage || partner.avatar || "",
  initials: initials(partner.name),
  emailVerified: Boolean(partner.emailVerification?.isVerified),
  phoneVerified: Boolean(partner.phoneVerification?.isVerified),
  approved: Boolean(partner.isApproved),
  verified: Boolean(partner.isVerified),
  blocked: Boolean(partner.isBlocked),
  createdAt: partner.createdAt,
  updatedAt: partner.updatedAt,
});

// GET /api/v1/admin/users
// Includes every buyer, seller and partner application, irrespective of approval.
export const getUnifiedUsers = async (req, res) => {
  try {
    const page = Math.max(Number(req.query.page || 1), 1);
    const limit = Math.min(Math.max(Number(req.query.limit || 20), 1), 100);
    const type = text(req.query.type || "All").toLowerCase();
    const status = text(req.query.status || "All").toLowerCase();
    const search = text(req.query.search).toLowerCase();

    const [buyers, sellers, partners] = await Promise.all([
      Buyer.find().select("-password -otp -otpExpiresAt").lean(),
      Seller.find().select("-password -emailVerification.otpHash -phoneVerification.otpHash").lean(),
      Partner.find().select("-password -emailVerification.otpHash -phoneVerification.otpHash").lean(),
    ]);

    const allUsers = [
      ...buyers.map(mapBuyer),
      ...sellers.map(mapSeller),
      ...partners.map(mapPartner),
    ].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

    const filtered = allUsers.filter((user) => {
      const matchesType =
        type === "all" ||
        user.type.toLowerCase() === type ||
        (type === "partner" && user.type === "Sub Partner");
      const matchesStatus = status === "all" || user.status.toLowerCase() === status;
      const haystack = `${user.name} ${user.email} ${user.phone} ${user.userCode} ${user.location}`.toLowerCase();
      return matchesType && matchesStatus && (!search || haystack.includes(search));
    });

    const start = (page - 1) * limit;
    const stats = {
      total: allUsers.length,
      buyers: buyers.length,
      sellers: sellers.length,
      partners: partners.length,
      pendingPartners: partners.filter((item) => !item.isApproved || !item.isVerified).length,
      verifiedPartners: partners.filter((item) => item.isApproved && item.isVerified).length,
      newUsers30Days: allUsers.filter(
        (item) => new Date(item.createdAt || 0) >= new Date(Date.now() - 30 * 86400000)
      ).length,
    };

    return res.json({
      success: true,
      data: filtered.slice(start, start + limit),
      stats,
      pagination: {
        page,
        limit,
        total: filtered.length,
        pages: Math.ceil(filtered.length / limit),
      },
    });
  } catch (error) {
    console.error("GET UNIFIED USERS ERROR:", error);
    return res.status(500).json({ success: false, message: "Unable to load users" });
  }
};
