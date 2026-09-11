// import jwt from "jsonwebtoken";
// import Partner from "../../models/Partner.js";
// import { comparePassword, hashPassword } from "../../services/partnerCredentialService.js";

// const tokenFor = (p) => jwt.sign({ id: p._id, role: p.role, partnerId: p.partnerId, accountType: p.accountType }, process.env.JWT_SECRET, { expiresIn: "7d" });

// export const partnerLogin = async (req, res) => {
//   try {
//     const partner = await Partner.findOne({ email: String(req.body.email || "").toLowerCase() });
//     if (!partner || !partner.password || !(await comparePassword(req.body.password, partner.password))) return res.status(401).json({ success: false, message: "Invalid credentials" });
//     if (!partner.isApproved) return res.status(403).json({ success: false, message: "Your account is waiting for DigiNiwas Admin approval" });
//     if (partner.isBlocked || partner.applicationStatus === "Suspended") return res.status(403).json({ success: false, message: "Partner account is suspended" });
//     if (partner.credentials?.temporaryPasswordExpiresAt && partner.credentials.mustChangePassword && partner.credentials.temporaryPasswordExpiresAt < new Date()) return res.status(403).json({ success: false, message: "Temporary password expired. Contact admin." });
//     partner.credentials.lastLoginAt = new Date(); await partner.save();
//     return res.json({ success: true, token: tokenFor(partner), mustChangePassword: !!partner.credentials.mustChangePassword, data: { _id: partner._id, partnerId: partner.partnerId, name: partner.name, email: partner.email, accountType: partner.accountType, role: partner.role, isApproved: partner.isApproved, isVerified: partner.isVerified, applicationStatus: partner.applicationStatus, permissions: partner.permissions } });
//   } catch (error) { return res.status(500).json({ success: false, message: "Unable to login", error: error.message }); }
// };

// export const changePartnerPassword = async (req, res) => {
//   try {
//     const partner = await Partner.findById(req.user._id);
//     if (!partner) return res.status(404).json({ success: false, message: "Partner not found" });
//     if (!(await comparePassword(req.body.currentPassword, partner.password))) return res.status(400).json({ success: false, message: "Current password is incorrect" });
//     if (!req.body.newPassword || req.body.newPassword.length < 8) return res.status(400).json({ success: false, message: "New password must be at least 8 characters" });
//     partner.password = await hashPassword(req.body.newPassword);
//     partner.credentials.mustChangePassword = false; partner.credentials.passwordChangedAt = new Date(); partner.credentials.temporaryPasswordExpiresAt = null;
//     await partner.save();
//     return res.json({ success: true, message: "Password changed successfully" });
//   } catch (error) { return res.status(500).json({ success: false, message: "Unable to change password", error: error.message }); }
// };

import jwt from "jsonwebtoken";
import Partner from "../../models/Partner.js";
import {
  comparePassword,
  hashPassword,
} from "../../services/partnerCredentialService.js";

const tokenFor = (p) =>
  jwt.sign(
    {
      id: p._id,
      role: p.role,
      partnerId: p.partnerId,
      accountType: p.accountType,
      parentPartnerId: p.parentPartnerId || null,
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

export const partnerLogin = async (req, res) => {
  try {
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");

    const partner = await Partner.findOne({ email });

    if (
      !partner ||
      !partner.password ||
      !(await comparePassword(password, partner.password))
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    if (!partner.isApproved) {
      return res.status(403).json({
        success: false,
        code: "ADMIN_APPROVAL_PENDING",
        message:
          partner.accountType === "subagent"
            ? "Your Sub-Agent application is waiting for DigiNiwas Admin approval"
            : "Your account is waiting for DigiNiwas Admin approval",
      });
    }

    if (partner.isRejected || partner.applicationStatus === "Rejected") {
      return res.status(403).json({
        success: false,
        message: "Your application was rejected",
      });
    }

    if (partner.isBlocked || partner.applicationStatus === "Suspended") {
      return res.status(403).json({
        success: false,
        message: "Partner account is suspended",
      });
    }

    if (
      partner.credentials?.temporaryPasswordExpiresAt &&
      partner.credentials?.mustChangePassword &&
      partner.credentials.temporaryPasswordExpiresAt < new Date()
    ) {
      return res.status(403).json({
        success: false,
        message: "Temporary password expired. Contact Admin.",
      });
    }

    partner.credentials.lastLoginAt = new Date();
    await partner.save();

    return res.json({
      success: true,
      token: tokenFor(partner),
      mustChangePassword: Boolean(partner.credentials?.mustChangePassword),
      data: {
        _id: partner._id,
        partnerId: partner.partnerId,
        name: partner.name,
        email: partner.email,
        phone: partner.phone,
        accountType: partner.accountType,
        role: partner.role,
        teamRole: partner.teamRole,
        parentPartnerId: partner.parentPartnerId,
        agencyDetails: partner.agencyDetails,
        isApproved: partner.isApproved,
        isVerified: partner.isVerified,
        applicationStatus: partner.applicationStatus,
        permissions: partner.permissions,
        teamCreditAllocation: partner.teamCreditAllocation,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to login",
      error: error.message,
    });
  }
};

export const changePartnerPassword = async (req, res) => {
  try {
    const partner = await Partner.findById(req.user?._id || req.user?.id);

    if (!partner) {
      return res.status(404).json({
        success: false,
        message: "Partner not found",
      });
    }

    if (!(await comparePassword(req.body.currentPassword, partner.password))) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    if (!req.body.newPassword || req.body.newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 8 characters",
      });
    }

    partner.password = await hashPassword(req.body.newPassword);
    partner.credentials.mustChangePassword = false;
    partner.credentials.passwordChangedAt = new Date();
    partner.credentials.temporaryPasswordExpiresAt = null;

    await partner.save();

    return res.json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to change password",
      error: error.message,
    });
  }
};
