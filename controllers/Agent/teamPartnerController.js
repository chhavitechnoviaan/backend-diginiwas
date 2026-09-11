// import mongoose from "mongoose";
// import Partner from "../../models/Partner.js";
// import TeamWallet from "../../models/TeamWallet.js";
// import CreditTransaction from "../../models/CreditTransaction.js";
import Property from "../../models/NewProperty.js";
// import { generateSixCharacterTemporaryPassword, hashPassword } from "../../services/partnerCredentialService.js";
// import { sendPartnerCredentials } from "../../services/partnerNotificationService.js";
// import {
//   generateOtp,
//   hashOtp,
// } from "../../services/partnerCredentialService.js";
// import {
//   sendEmailOtp,
//   sendMobileOtp,
// } from "../../services/partnerNotificationService.js";
// const SAFE = "-password -emailVerification.otpHash -phoneVerification.otpHash";
// const txId = () => `CTX-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

// export const getTeamPartners = async (req, res) => {
//   try {
//     const owners = await Partner.find({ accountType: "team", isSubPartner: false, isApproved: true }).select(SAFE).sort({ createdAt: -1 }).lean();
//     const data = await Promise.all(owners.map(async owner => {
//       const [wallet, members] = await Promise.all([
//         TeamWallet.findOne({ ownerPartnerId: owner._id }).lean(),
//         Partner.find({ parentPartnerId: owner._id, isSubPartner: true }).select(SAFE).sort({ createdAt: -1 }).lean(),
//       ]);
//       const balance = Number(wallet?.balance || 0), allocated = Number(wallet?.allocatedToMembers || 0);
//       return { ...owner, teamWallet: wallet, members, summary: { members: members.length, verifiedMembers: members.filter(x => x.isVerified).length, sharedBalance: balance, allocatedToMembers: allocated, unallocatedCredits: Math.max(0, balance - allocated) } };
//     }));
//     return res.json({ success: true, count: data.length, data });
//   } catch (error) { return res.status(500).json({ success: false, message: "Unable to fetch team partners", error: error.message }); }
// };

// export const addTeamMember = async (req, res) => {
//   try {
//     const owner = await Partner.findById(req.params.ownerId);
//     if (!owner || owner.accountType !== "team" || owner.isSubPartner) return res.status(404).json({ success: false, message: "Team owner not found" });
//     if (!owner.isVerified) return res.status(403).json({ success: false, message: "Only verified team owners can add members" });
//     const { name, email, phone, teamRole = "AGENT", approvalThreshold = null } = req.body;
//     if (!name || !email || !phone) return res.status(400).json({ success: false, message: "name, email and phone required" });
//     if (await Partner.findOne({ $or: [{ email: email.toLowerCase() }, { phone }] })) return res.status(409).json({ success: false, message: "Email or phone already exists" });
//     const temp = generateSixCharacterTemporaryPassword();
//     const member = await Partner.create({
//       partnerId: `PRT-${Date.now().toString().slice(-6)}${Math.floor(10 + Math.random() * 90)}`,
//       name, email: email.toLowerCase(), phone, password: await hashPassword(temp), accountType: "team",
//       parentPartnerId: owner._id, isSubPartner: true, teamRole, role: teamRole === "MANAGER" ? "team_manager" : "agent",
//       applicationStatus: "Verified", isApproved: true, isVerified: true, approvedAt: new Date(), verifiedAt: new Date(),
//       emailVerification: { isVerified: true, verifiedAt: new Date() }, phoneVerification: { isVerified: true, verifiedAt: new Date() },
//       credentials: { temporaryPasswordIssued: true, temporaryPasswordIssuedAt: new Date(), temporaryPasswordExpiresAt: new Date(Date.now() + 24*60*60*1000), mustChangePassword: true },
//       permissions: { canReceiveAssignments: true, canCreateVisitRequest: true, canUnlockLead: true, canSpendCredits: true, canManageTeam: teamRole === "MANAGER", canAllocateCredits: false, canVerifyProperty: true, canSubmitPropertyForAdminApproval: true },
//       teamCreditAllocation: { allocatedLimit: 0, availableLimit: 0, approvalThreshold, requiresApprovalAboveThreshold: approvalThreshold != null },
//     });
//     await sendPartnerCredentials({ to: member.email, name: member.name, partnerId: member.partnerId, temporaryPassword: temp });
//     return res.status(201).json({ success: true, message: "Sub partner created and credentials emailed", data: member });
//   } catch (error) { return res.status(500).json({ success: false, message: "Unable to add team member", error: error.message }); }
// };

// export const allocateTeamCredits = async (req, res) => {
//   const session = await mongoose.startSession();
//   try {
//     let output;
//     await session.withTransaction(async () => {
//       const qty = Number(req.body.credits);
//       if (!Number.isFinite(qty) || qty <= 0) throw new Error("credits must be greater than 0");
//       const [owner, member, wallet] = await Promise.all([
//         Partner.findById(req.params.ownerId).session(session),
//         Partner.findById(req.params.memberId).session(session),
//         TeamWallet.findOne({ ownerPartnerId: req.params.ownerId }).session(session),
//       ]);
//       if (!owner || !wallet) throw new Error("Team wallet not found");
//       if (!member || String(member.parentPartnerId) !== String(owner._id)) throw new Error("Member does not belong to this team");
//       const unallocated = Number(wallet.balance || 0) - Number(wallet.allocatedToMembers || 0);
//       if (unallocated < qty) { const e = new Error(`Only ${unallocated} unallocated credits available`); e.code = "INSUFFICIENT_CREDITS"; throw e; }
//       member.teamCreditAllocation.allocatedLimit += qty;
//       member.teamCreditAllocation.availableLimit += qty;
//       member.teamCreditAllocation.lastAllocatedAt = new Date();
//       if (req.body.approvalThreshold != null) { member.teamCreditAllocation.approvalThreshold = Number(req.body.approvalThreshold); member.teamCreditAllocation.requiresApprovalAboveThreshold = true; }
//       wallet.allocatedToMembers += qty;
//       await member.save({ session }); await wallet.save({ session });
//       const [transaction] = await CreditTransaction.create([{ transactionId: txId(), walletType: "TEAM_SHARED", walletOwnerPartnerId: owner._id, attributedPartnerId: member._id, partnerCode: member.partnerId, partnerName: member.name, type: "TEAM_ALLOCATION", direction: "NEUTRAL", creditBucket: "NONE", credits: qty, balanceBefore: wallet.balance, balanceAfter: wallet.balance, referenceType: "TeamAllocation", description: `${qty} credits allocated to ${member.name}`, performedBy: { userId: req.user?._id || null, name: req.user?.name || owner.name, role: req.user?.role || "Agency Owner" } }], { session });
//       output = { wallet, member, transaction };
//     });
//     return res.json({ success: true, message: "Credits allocated successfully", data: output });
//   } catch (error) { return res.status(error.code === "INSUFFICIENT_CREDITS" ? 400 : 500).json({ success: false, message: "Unable to allocate credits", error: error.message }); }
//   finally { await session.endSession(); }
// };

// export const getTeamMemberCreditHistory = async (req, res) => {
//   try {
//     const member = await Partner.findById(req.params.memberId).select(SAFE).lean();
//     if (!member) return res.status(404).json({ success: false, message: "Member not found" });
//     const transactions = await CreditTransaction.find({ attributedPartnerId: member._id }).sort({ createdAt: -1 }).lean();
//     return res.json({ success: true, data: { member, transactions } });
//   } catch (error) { return res.status(500).json({ success: false, message: "Unable to fetch history", error: error.message }); }
// };



import mongoose from "mongoose";
import Partner from "../../models/Partner.js";
import TeamWallet from "../../models/TeamWallet.js";
import CreditTransaction from "../../models/CreditTransaction.js";
import { generateOtp, hashOtp } from "../../services/partnerCredentialService.js";
import { sendEmailOtp, sendMobileOtp } from "../../services/partnerNotificationService.js";

const SAFE = "-password -emailVerification.otpHash -phoneVerification.otpHash";
const txId = () => `CTX-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
const generatePartnerId = () =>
  `PRT-${Date.now().toString().slice(-6)}${Math.floor(10 + Math.random() * 90)}`;

export const getTeamPartners = async (req, res) => {
  try {
    const owners = await Partner.find({
      accountType: "team",
      isSubPartner: false,
      isApproved: true,
      isVerified: true,
      isBlocked: { $ne: true },
      applicationStatus: "Verified",
    })
      .select(SAFE)
      .sort({ createdAt: -1 })
      .lean();

    const data = await Promise.all(
      owners.map(async (owner) => {
        const [wallet, members] = await Promise.all([
          TeamWallet.findOne({ ownerPartnerId: owner._id }).lean(),
          Partner.find({
            parentPartnerId: owner._id,
            accountType: "subagent",
            isSubPartner: true,
            isApproved: true,
          })
            .select(SAFE)
            .sort({ createdAt: -1 })
            .lean(),
        ]);

        const balance = Number(wallet?.balance || 0);
        const allocated = Number(wallet?.allocatedToMembers || 0);

        return {
          ...owner,
          teamWallet: wallet,
          members,
          summary: {
            totalMembers: members.length,
            pendingMembers: members.filter((m) => !m.isApproved).length,
            approvedNotVerified: members.filter((m) => m.isApproved && !m.isVerified).length,
            verifiedMembers: members.filter((m) => m.isVerified && !m.isBlocked).length,
            suspendedMembers: members.filter((m) => m.isBlocked).length,
            sharedBalance: balance,
            allocatedToMembers: allocated,
            unallocatedCredits: Math.max(0, balance - allocated),
          },
        };
      })
    );

    return res.json({ success: true, count: data.length, data });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to fetch team partners",
      error: error.message,
    });
  }
};

export const addTeamMember = async (req, res) => {
  try {
    const owner = await Partner.findById(req.params.ownerId);

    if (
      !owner ||
      owner.accountType !== "team" ||
      owner.isSubPartner ||
      owner.role !== "agency_owner"
    ) {
      return res.status(404).json({
        success: false,
        message: "Valid Team / Agency Owner not found",
      });
    }

    if (
      !owner.isApproved ||
      !owner.isVerified ||
      owner.isBlocked ||
      owner.applicationStatus !== "Verified"
    ) {
      return res.status(403).json({
        success: false,
        message: "Only an approved and verified Agency Owner can add Sub-Agents",
      });
    }

    const {
      name,
      email,
      phone,
      teamRole = "AGENT",
      business = {},
      location = {},
      rera = {},
      identityDocuments = [],
      privacyConsent = {},
    } = req.body;

    if (!name || !email || !phone) {
      return res.status(400).json({
        success: false,
        message: "name, email and phone are required",
      });
    }

    if (!["AGENT", "MANAGER"].includes(teamRole)) {
      return res.status(400).json({
        success: false,
        message: "teamRole must be AGENT or MANAGER",
      });
    }

    if (!privacyConsent?.accepted) {
      return res.status(400).json({
        success: false,
        message: "Privacy consent is required",
      });
    }

    if (!identityDocuments.length) {
      return res.status(400).json({
        success: false,
        message: "At least one identity document is required",
      });
    }

    for (const doc of identityDocuments) {
      if (!doc.documentType || !doc.frontUrl || !doc.backUrl) {
        return res.status(400).json({
          success: false,
          message: "Each identity document requires documentType, frontUrl and backUrl",
        });
      }
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const normalizedPhone = String(phone).trim();

    const duplicate = await Partner.findOne({
      $or: [{ email: normalizedEmail }, { phone: normalizedPhone }],
    });

    if (duplicate) {
      return res.status(409).json({
        success: false,
        message: "Email or phone already registered",
      });
    }

    const emailOtp = generateOtp();
    const phoneOtp = generateOtp();

    const member = await Partner.create({
      partnerId: generatePartnerId(),
      name: String(name).trim(),
      email: normalizedEmail,
      phone: normalizedPhone,

      accountType: "subagent",
      role: teamRole === "MANAGER" ? "team_manager" : "agent",
      teamRole,
      isSubPartner: true,
      parentPartnerId: owner._id,

      agencyDetails: {
        agencyOwnerId: owner._id,
        agencyPartnerCode: owner.partnerId || "",
        agencyName: owner.business?.businessName || `${owner.name} Agency`,
        agencyOwnerName: owner.name || "",
        agencyEmail: owner.email || "",
        agencyPhone: owner.phone || "",
        joinedAt: new Date(),
      },

      business: {
        ...business,
        businessName: business?.businessName || owner.business?.businessName || "",
      },

      location,
      identityDocuments,

      rera: {
        ...rera,
        verificationStatus: rera?.applicable ? "Pending" : "Not_Applicable",
      },

      privacyConsent: {
        accepted: true,
        acceptedAt: new Date(),
        privacyNoticeVersion: privacyConsent?.privacyNoticeVersion || "v1",
      },

      emailVerification: {
        isVerified: false,
        otpHash: hashOtp(emailOtp),
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      },

      phoneVerification: {
        isVerified: false,
        otpHash: hashOtp(phoneOtp),
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      },

      applicationStatus: "Pending_Email_Verification",
      isApproved: false,
      isVerified: false,
      isBlocked: false,
      isRejected: false,

      permissions: {
        canReceiveAssignments: false,
        canCreateVisitRequest: false,
        canUnlockLead: false,
        canSpendCredits: false,
        canManageTeam: false,
        canAllocateCredits: false,
        canVerifyProperty: false,
        canSubmitPropertyForAdminApproval: false,
      },

      teamCreditAllocation: {
        allocatedLimit: 0,
        availableLimit: 0,
        totalSpent: 0,
        totalRefunded: 0,
        approvalThreshold: null,
        requiresApprovalAboveThreshold: false,
        lastAllocatedAt: null,
      },

      verificationHistory: [
        {
          status: "Sub_Agent_Application_Created",
          remarks: `Sub-Agent application created under ${
            owner.business?.businessName || owner.name
          }`,
          actor: {
            userId: owner._id,
            name: owner.name,
            role: "agency_owner",
          },
          createdAt: new Date(),
        },
      ],
    });

    await Promise.all([
      sendEmailOtp({ to: member.email, name: member.name, otp: emailOtp }),
      sendMobileOtp({ phone: member.phone, otp: phoneOtp }),
    ]);

    return res.status(201).json({
      success: true,
      message:
        "Sub-Agent application created. Email and mobile verification required before Admin review.",
      data: {
        _id: member._id,
        partnerId: member.partnerId,
        name: member.name,
        email: member.email,
        phone: member.phone,
        accountType: member.accountType,
        role: member.role,
        teamRole: member.teamRole,
        parentPartnerId: member.parentPartnerId,
        agencyDetails: member.agencyDetails,
        applicationStatus: member.applicationStatus,
        isApproved: member.isApproved,
        isVerified: member.isVerified,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to create Sub-Agent application",
      error: error.message,
    });
  }
};

export const allocateTeamCredits = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    let output;

    await session.withTransaction(async () => {
      const qty = Number(req.body.credits);

      if (!Number.isFinite(qty) || qty <= 0) {
        const e = new Error("credits must be greater than 0");
        e.code = "INVALID_CREDITS";
        throw e;
      }

      const [owner, member, wallet] = await Promise.all([
        Partner.findById(req.params.ownerId).session(session),
        Partner.findById(req.params.memberId).session(session),
        TeamWallet.findOne({ ownerPartnerId: req.params.ownerId }).session(session),
      ]);

      if (
        !owner ||
        owner.accountType !== "team" ||
        owner.isSubPartner ||
        !owner.isApproved ||
        !owner.isVerified ||
        owner.isBlocked
      ) {
        const e = new Error("Agency Owner must be active and verified");
        e.code = "OWNER_NOT_VERIFIED";
        throw e;
      }

      if (!wallet) {
        const e = new Error("Team wallet not found");
        e.code = "TEAM_WALLET_NOT_FOUND";
        throw e;
      }

      if (
        !member ||
        member.accountType !== "subagent" ||
        !member.isSubPartner ||
        String(member.parentPartnerId) !== String(owner._id)
      ) {
        const e = new Error("Sub-Agent does not belong to this agency");
        e.code = "INVALID_MEMBER";
        throw e;
      }

      if (!member.isApproved) {
        const e = new Error("Sub-Agent is not approved by DigiNiwas Admin");
        e.code = "SUB_AGENT_NOT_APPROVED";
        throw e;
      }

      if (
        !member.isVerified ||
        member.applicationStatus !== "Verified" ||
        member.isBlocked
      ) {
        const e = new Error(
          "Sub-Agent must be finally verified and active before credit allocation"
        );
        e.code = "SUB_AGENT_NOT_VERIFIED";
        throw e;
      }

      const unallocated =
        Number(wallet.balance || 0) - Number(wallet.allocatedToMembers || 0);

      if (unallocated < qty) {
        const e = new Error(`Only ${unallocated} unallocated credits available`);
        e.code = "INSUFFICIENT_CREDITS";
        throw e;
      }

      member.teamCreditAllocation.allocatedLimit =
        Number(member.teamCreditAllocation?.allocatedLimit || 0) + qty;

      member.teamCreditAllocation.availableLimit =
        Number(member.teamCreditAllocation?.availableLimit || 0) + qty;

      member.teamCreditAllocation.lastAllocatedAt = new Date();

      if (req.body.approvalThreshold !== undefined) {
        const threshold = Number(req.body.approvalThreshold);

        if (!Number.isFinite(threshold) || threshold < 0) {
          const e = new Error("Invalid approvalThreshold");
          e.code = "INVALID_THRESHOLD";
          throw e;
        }

        member.teamCreditAllocation.approvalThreshold = threshold;
        member.teamCreditAllocation.requiresApprovalAboveThreshold = true;
      }

      wallet.allocatedToMembers = Number(wallet.allocatedToMembers || 0) + qty;

      await member.save({ session });
      await wallet.save({ session });

      const [transaction] = await CreditTransaction.create(
        [
          {
            transactionId: txId(),
            walletType: "TEAM_SHARED",
            walletOwnerPartnerId: owner._id,
            attributedPartnerId: member._id,
            partnerCode: member.partnerId || "",
            partnerName: member.name || "",
            type: "TEAM_ALLOCATION",
            direction: "NEUTRAL",
            creditBucket: "NONE",
            credits: qty,
            balanceBefore: wallet.balance,
            balanceAfter: wallet.balance,
            referenceType: "TeamAllocation",
            description: `${qty} credits allocated to ${member.name}`,
            metadata: {
              agencyOwnerId: owner._id,
              agencyPartnerCode: owner.partnerId,
              subAgentId: member._id,
              subAgentPartnerCode: member.partnerId,
            },
            performedBy: {
              userId: req.user?._id || owner._id,
              name: req.user?.name || owner.name,
              role: req.user?.role || "agency_owner",
            },
          },
        ],
        { session }
      );

      output = { wallet, member, transaction };
    });

    return res.json({
      success: true,
      message: "Credits allocated successfully",
      data: output,
    });
  } catch (error) {
    const clientCodes = [
      "INVALID_CREDITS",
      "OWNER_NOT_VERIFIED",
      "TEAM_WALLET_NOT_FOUND",
      "INVALID_MEMBER",
      "SUB_AGENT_NOT_APPROVED",
      "SUB_AGENT_NOT_VERIFIED",
      "INSUFFICIENT_CREDITS",
      "INVALID_THRESHOLD",
    ];

    return res.status(clientCodes.includes(error.code) ? 400 : 500).json({
      success: false,
      message: "Unable to allocate credits",
      error: error.message,
      code: error.code || "SERVER_ERROR",
    });
  } finally {
    await session.endSession();
  }
};

export const getTeamMemberCreditHistory = async (req, res) => {
  try {
    const member = await Partner.findOne({
      _id: req.params.memberId,
      parentPartnerId: req.params.ownerId,
      accountType: "subagent",
      isSubPartner: true,
    })
      .select(SAFE)
      .lean();

    if (!member) {
      return res.status(404).json({
        success: false,
        message: "Sub-Agent not found in this agency",
      });
    }

    const transactions = await CreditTransaction.find({
      walletOwnerPartnerId: req.params.ownerId,
      attributedPartnerId: member._id,
    })
      .sort({ createdAt: -1 })
      .lean();

    return res.json({
      success: true,
      data: { member, transactions },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to fetch Sub-Agent history",
      error: error.message,
    });
  }
};


// ======================================================
// TEAM OWNER -> SUB-AGENT PROPERTY DELEGATION
// ======================================================
export const getVerifiedTeamMembers = async (req, res) => {
  try {
    const owner = await Partner.findById(req.params.ownerId).select(SAFE).lean();
    if (!owner || owner.accountType !== "team" || owner.isSubPartner) {
      return res.status(404).json({ success: false, message: "Team / Agency Owner not found" });
    }

    const data = await Partner.find({
      parentPartnerId: owner._id,
      accountType: "subagent",
      isSubPartner: true,
      isApproved: true,
      isVerified: true,
      isBlocked: { $ne: true },
      applicationStatus: "Verified",
    }).select(SAFE).sort({ name: 1 }).lean();

    return res.json({ success: true, count: data.length, data });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Unable to fetch verified Sub-Agents", error: error.message });
  }
};

export const getTeamAssignedProperties = async (req, res) => {
  try {
    const owner = await Partner.findById(req.params.ownerId).lean();
    if (!owner || owner.accountType !== "team" || owner.isSubPartner) {
      return res.status(404).json({ success: false, message: "Team / Agency Owner not found" });
    }

    const data = await Property.find({ "assignedPartner.partnerId": owner._id })
      .populate("delegatedSubPartner.subPartnerId", "partnerId name email phone teamRole applicationStatus isVerified")
      .sort({ updatedAt: -1 })
      .lean();

    return res.json({ success: true, count: data.length, data });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Unable to fetch Team properties", error: error.message });
  }
};

export const delegatePropertyToSubAgent = async (req, res) => {
  try {
    const { ownerId, propertyId } = req.params;
    const { subPartnerId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(ownerId) || !mongoose.Types.ObjectId.isValid(propertyId) || !mongoose.Types.ObjectId.isValid(subPartnerId)) {
      return res.status(400).json({ success: false, message: "Invalid owner, property or Sub-Agent ID" });
    }

    const [owner, member, property] = await Promise.all([
      Partner.findById(ownerId),
      Partner.findById(subPartnerId),
      Property.findById(propertyId),
    ]);

    if (!owner || owner.accountType !== "team" || owner.isSubPartner || !owner.isApproved || !owner.isVerified || owner.isBlocked || owner.applicationStatus !== "Verified") {
      return res.status(403).json({ success: false, message: "Only an active verified Team Owner can delegate properties" });
    }

    if (String(property?.assignedPartner?.partnerId || "") !== String(owner._id)) {
      return res.status(403).json({ success: false, message: "This property is not assigned to this Team Owner" });
    }

    if (!member || member.accountType !== "subagent" || !member.isSubPartner || String(member.parentPartnerId) !== String(owner._id)) {
      return res.status(400).json({ success: false, message: "Sub-Agent does not belong to this Team" });
    }

    if (!member.isApproved || !member.isVerified || member.isBlocked || member.applicationStatus !== "Verified") {
      return res.status(403).json({ success: false, message: "Property can be delegated only to an approved and verified Sub-Agent" });
    }

    property.delegatedSubPartner = {
      subPartnerId: member._id,
      partnerCode: member.partnerId || "",
      name: member.name || "",
      email: member.email || "",
      phone: member.phone || "",
      teamRole: member.teamRole || "AGENT",
      delegatedBy: { partnerId: owner._id, partnerCode: owner.partnerId || "", name: owner.name || "" },
      delegatedAt: new Date(),
    };
    await property.save();

    if (!member.assignedProperties.some((x) => String(x.propertyId) === String(property._id))) {
      member.assignedProperties.push({ propertyId: property._id, propertyCode: property.propertyId, status: "Assigned" });
      await member.save();
    }

    return res.json({ success: true, message: "Property delegated to verified Sub-Agent successfully", data: { property, member } });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Unable to delegate property", error: error.message });
  }
};

export const removeSubAgentPropertyDelegation = async (req, res) => {
  try {
    const { ownerId, propertyId } = req.params;
    const property = await Property.findById(propertyId);
    if (!property) return res.status(404).json({ success: false, message: "Property not found" });
    if (String(property.assignedPartner?.partnerId || "") !== String(ownerId)) {
      return res.status(403).json({ success: false, message: "Property does not belong to this Team Owner" });
    }

    const previous = property.delegatedSubPartner?.subPartnerId;
    property.delegatedSubPartner = undefined;
    await property.save();
    if (previous) {
      await Partner.updateOne({ _id: previous }, { $pull: { assignedProperties: { propertyId: property._id } } });
    }
    return res.json({ success: true, message: "Sub-Agent delegation removed", data: property });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Unable to remove delegation", error: error.message });
  }
};
