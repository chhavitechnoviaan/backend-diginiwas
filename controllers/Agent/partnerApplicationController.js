// import mongoose from "mongoose";
// import Partner from "../../models/Partner.js";
// import TeamWallet from "../../models/TeamWallet.js";
// import {
//   generateOtp,
//   hashOtp,
//   verifyOtpHash,
//   generateSixCharacterTemporaryPassword,
//   hashPassword,
// } from "../../services/partnerCredentialService.js";
// import {
//   sendEmailOtp,
//   sendMobileOtp,
//   sendPartnerCredentials,
// } from "../../services/partnerNotificationService.js";

// const generatePartnerId = () =>
//   `PRT-${Date.now().toString().slice(-6)}${Math.floor(10 + Math.random() * 90)}`;
// const makeActor = (req) => ({
//   userId: req.user?._id || null,
//   name: req.user?.name || "Admin",
//   role: req.user?.role || "Admin",
// });
// const sanitize = (doc) => {
//   const x = doc?.toObject ? doc.toObject() : { ...doc };
//   delete x.password;
//   if (x.emailVerification) delete x.emailVerification.otpHash;
//   if (x.phoneVerification) delete x.phoneVerification.otpHash;
//   return x;
// };

// export const registerPartnerApplication = async (req, res) => {
//   try {
//     const {
//       name,
//       email,
//       phone,
//       accountType,
//       business = {},
//       location = {},
//       rera = {},
//       identityDocuments = [],
//       privacyConsent = {},
//     } = req.body;
//     if (
//       !name ||
//       !email ||
//       !phone ||
//       !["single", "team"].includes(accountType)
//     ) {
//       return res
//         .status(400)
//         .json({
//           success: false,
//           message:
//             "name, email, phone and accountType(single/team) are required",
//         });
//     }
//     if (!privacyConsent.accepted)
//       return res
//         .status(400)
//         .json({ success: false, message: "Privacy consent is required" });
//     const exists = await Partner.findOne({
//       $or: [{ email: email.toLowerCase() }, { phone }],
//     });
//     if (exists)
//       return res
//         .status(409)
//         .json({ success: false, message: "Email or phone already registered" });

//     const emailOtp = generateOtp();
//     const phoneOtp = generateOtp();
//     const partner = await Partner.create({
//       partnerId: generatePartnerId(),
//       name,
//       email: email.toLowerCase(),
//       phone,
//       accountType,
//       role: accountType === "team" ? "agency_owner" : "partner",
//       teamRole: accountType === "team" ? "OWNER" : "NONE",
//       business,
//       location,
//       identityDocuments,
//       rera: {
//         ...rera,
//         verificationStatus: rera?.applicable ? "Pending" : "Not_Applicable",
//       },
//       privacyConsent: {
//         accepted: true,
//         acceptedAt: new Date(),
//         privacyNoticeVersion: privacyConsent.privacyNoticeVersion || "v1",
//       },
//       applicationStatus: "Pending_Email_Verification",
//       emailVerification: {
//         isVerified: false,
//         otpHash: hashOtp(emailOtp),
//         expiresAt: new Date(Date.now() + 10 * 60 * 1000),
//       },
//       phoneVerification: {
//         isVerified: false,
//         otpHash: hashOtp(phoneOtp),
//         expiresAt: new Date(Date.now() + 10 * 60 * 1000),
//       },
//       verificationHistory: [
//         {
//           status: "Application_Created",
//           remarks: "Partner application created",
//           actor: { name, role: "Applicant" },
//         },
//       ],
//     });

//     await Promise.all([
//       sendEmailOtp({ to: partner.email, name: partner.name, otp: emailOtp }),
//       sendMobileOtp({ phone: partner.phone, otp: phoneOtp }),
//     ]);
//     return res
//       .status(201)
//       .json({
//         success: true,
//         message: "Application created. Verify email and mobile OTP.",
//         data: sanitize(partner),
//       });
//   } catch (error) {
//     return res
//       .status(500)
//       .json({
//         success: false,
//         message: "Unable to create partner application",
//         error: error.message,
//       });
//   }
// };

// export const resendPartnerOtp = async (req, res) => {
//   try {
//     const partner = await Partner.findById(req.params.id);
//     if (!partner)
//       return res
//         .status(404)
//         .json({ success: false, message: "Application not found" });
//     const otp = generateOtp();
//     if (req.body.channel === "email") {
//       partner.emailVerification.otpHash = hashOtp(otp);
//       partner.emailVerification.expiresAt = new Date(
//         Date.now() + 10 * 60 * 1000,
//       );
//       await sendEmailOtp({ to: partner.email, name: partner.name, otp });
//     } else if (req.body.channel === "phone") {
//       partner.phoneVerification.otpHash = hashOtp(otp);
//       partner.phoneVerification.expiresAt = new Date(
//         Date.now() + 10 * 60 * 1000,
//       );
//       await sendMobileOtp({ phone: partner.phone, otp });
//     } else
//       return res
//         .status(400)
//         .json({ success: false, message: "channel must be email or phone" });
//     await partner.save();
//     return res.json({ success: true, message: "OTP resent successfully" });
//   } catch (error) {
//     return res
//       .status(500)
//       .json({
//         success: false,
//         message: "Unable to resend OTP",
//         error: error.message,
//       });
//   }
// };

// export const verifyPartnerEmailOtp = async (req, res) => {
//   try {
//     const partner = await Partner.findById(req.params.id);
//     if (!partner)
//       return res
//         .status(404)
//         .json({ success: false, message: "Application not found" });
//     if (
//       !partner.emailVerification?.otpHash ||
//       partner.emailVerification.expiresAt < new Date() ||
//       !verifyOtpHash(req.body.otp, partner.emailVerification.otpHash)
//     ) {
//       return res
//         .status(400)
//         .json({ success: false, message: "Invalid or expired email OTP" });
//     }
//     partner.emailVerification.isVerified = true;
//     partner.emailVerification.verifiedAt = new Date();
//     partner.emailVerification.otpHash = "";
//     partner.applicationStatus = partner.phoneVerification.isVerified
//       ? "Submitted"
//       : "Pending_Phone_Verification";
//     await partner.save();
//     return res.json({
//       success: true,
//       message: "Email verified",
//       data: sanitize(partner),
//     });
//   } catch (error) {
//     return res
//       .status(500)
//       .json({
//         success: false,
//         message: "Unable to verify email",
//         error: error.message,
//       });
//   }
// };

// export const verifyPartnerPhoneOtp = async (req, res) => {
//   try {
//     const partner = await Partner.findById(req.params.id);
//     if (!partner)
//       return res
//         .status(404)
//         .json({ success: false, message: "Application not found" });
//     if (
//       !partner.phoneVerification?.otpHash ||
//       partner.phoneVerification.expiresAt < new Date() ||
//       !verifyOtpHash(req.body.otp, partner.phoneVerification.otpHash)
//     ) {
//       return res
//         .status(400)
//         .json({ success: false, message: "Invalid or expired mobile OTP" });
//     }
//     partner.phoneVerification.isVerified = true;
//     partner.phoneVerification.verifiedAt = new Date();
//     partner.phoneVerification.otpHash = "";
//     partner.applicationStatus = partner.emailVerification.isVerified
//       ? "Submitted"
//       : "Pending_Email_Verification";
//     await partner.save();
//     return res.json({
//       success: true,
//       message: "Mobile verified",
//       data: sanitize(partner),
//     });
//   } catch (error) {
//     return res
//       .status(500)
//       .json({
//         success: false,
//         message: "Unable to verify mobile",
//         error: error.message,
//       });
//   }
// };

// export const getPartnerApplications = async (req, res) => {
//   try {
//     // const query = { isSubPartner: false };
//     const query = {};
//     // if (req.query.status && req.query.status !== "All") query.applicationStatus = req.query.status;
//     if (req.query.status && req.query.status !== "All") {
//       query.applicationStatus = req.query.status;
//     }

//     if (req.query.accountType && req.query.accountType !== "All") {
//       query.accountType = req.query.accountType;
//     }

//     if (
//       req.query.agencyOwnerId &&
//       mongoose.Types.ObjectId.isValid(req.query.agencyOwnerId)
//     ) {
//       query.parentPartnerId = req.query.agencyOwnerId;
//     }
//     if (req.query.search?.trim()) {
//       const rx = new RegExp(req.query.search.trim(), "i");
//       query.$or = [
//         { name: rx },
//         { email: rx },
//         { phone: rx },
//         { partnerId: rx },
//         { "business.businessName": rx },
//       ];
//     }
//     const data = await Partner.find(query)
//       .select("-password -emailVerification.otpHash -phoneVerification.otpHash")
//       .sort({ createdAt: -1 })
//       .lean();
//     return res.json({ success: true, count: data.length, data });
//   } catch (error) {
//     return res
//       .status(500)
//       .json({
//         success: false,
//         message: "Unable to fetch applications",
//         error: error.message,
//       });
//   }
// };

// export const getPartnerApplicationById = async (req, res) => {
//   const partner = await Partner.findById(req.params.id)
//     .select("-password -emailVerification.otpHash -phoneVerification.otpHash")
//     .lean();
//   if (!partner)
//     return res
//       .status(404)
//       .json({ success: false, message: "Application not found" });
//   return res.json({ success: true, data: partner });
// };

// export const approvePartnerApplication = async (req, res) => {
//   const session = await mongoose.startSession();
//   let result;
//   try {
//     await session.withTransaction(async () => {
//       const partner = await Partner.findById(req.params.id).session(session);
//       if (!partner) throw new Error("Application not found");
//       if (
//         !partner.emailVerification.isVerified ||
//         !partner.phoneVerification.isVerified
//       )
//         throw new Error(
//           "Email and mobile must both be verified before approval",
//         );
//       if (
//         !["Submitted", "Under_Review", "Action_Required"].includes(
//           partner.applicationStatus,
//         )
//       )
//         throw new Error(`Cannot approve ${partner.applicationStatus}`);
// if (partner.accountType === "subagent") {
//   const owner = await Partner.findById(partner.parentPartnerId);
//   if (!owner || owner.accountType !== "team" ||
//       !owner.isApproved || !owner.isVerified || owner.isBlocked) {
//     return res.status(400).json({
//       success:false,
//       message:"Sub-Agent Agency Owner is not active/verified"
//     });
//   }
// }
//       const temp = generateSixCharacterTemporaryPassword();
//       partner.password = await hashPassword(temp);
//       partner.isApproved = true;
//       partner.approvedAt = new Date();
//       partner.approvedBy = makeActor(req);
//       partner.applicationStatus = "Approved_Not_Verified";
//       partner.credentials.temporaryPasswordIssued = true;
//       partner.credentials.temporaryPasswordIssuedAt = new Date();
//       partner.credentials.temporaryPasswordExpiresAt = new Date(
//         Date.now() + 24 * 60 * 60 * 1000,
//       );
//       partner.credentials.mustChangePassword = true;
//       partner.verificationHistory.push({
//         status: "Approved_Not_Verified",
//         remarks: req.body.remarks || "Approved by admin",
//         actor: makeActor(req),
//       });

//       // if (partner.accountType === "team") {
//       if (partner.accountType === "team" && !partner.isSubPartner) {
//         await TeamWallet.findOneAndUpdate(
//           { ownerPartnerId: partner._id },
//           {
//             $setOnInsert: {
//               ownerPartnerId: partner._id,
//               ownerPartnerCode: partner.partnerId,
//               teamName:
//                 partner.business?.businessName || `${partner.name} Team`,
//             },
//           },
//           { upsert: true, new: true, session },
//         );
//       }
//       await partner.save({ session });
//       result = { partner, temp };
//     });
//     await sendPartnerCredentials({
//       to: result.partner.email,
//       name: result.partner.name,
//       partnerId: result.partner.partnerId,
//       temporaryPassword: result.temp,
//     });
//     return res.json({
//       success: true,
//       message:
//         "Partner approved. Temporary credentials sent to registered email.",
//       data: sanitize(result.partner),
//     });
//   } catch (error) {
//     return res
//       .status(400)
//       .json({
//         success: false,
//         message: "Unable to approve partner",
//         error: error.message,
//       });
//   } finally {
//     await session.endSession();
//   }
// };

// export const markPartnerVerified = async (req, res) => {
//   try {
//     const partner = await Partner.findById(req.params.id);
//     if (!partner)
//       return res
//         .status(404)
//         .json({ success: false, message: "Partner not found" });
//     if (!partner.isApproved)
//       return res
//         .status(400)
//         .json({ success: false, message: "Approve partner first" });
        
// if (partner.accountType === "subagent") {
//   const owner = await Partner.findById(partner.parentPartnerId);
//   if (!owner || !owner.isApproved || !owner.isVerified || owner.isBlocked) {
//     return res.status(400).json({
//       success:false,
//       message:"Agency Owner is not active/verified"
//     });
//   }
// }
//     partner.isVerified = true;
//     partner.verifiedAt = new Date();
//     partner.verifiedBy = makeActor(req);
//     partner.applicationStatus = "Verified";
//     partner.permissions = {
//       canReceiveAssignments: true,
//       canCreateVisitRequest: true,
//       canUnlockLead: true,
//       canSpendCredits: true,
//       canManageTeam: partner.accountType === "team" && !partner.isSubPartner,
//       canAllocateCredits:
//         partner.accountType === "team" && !partner.isSubPartner,
//       canVerifyProperty: true,
//       canSubmitPropertyForAdminApproval: true,
//     };
//     partner.verificationHistory.push({
//       status: "Verified",
//       remarks: req.body.remarks || "Partner verified by admin",
//       actor: makeActor(req),
//     });
//     await partner.save();
//     return res.json({
//       success: true,
//       message: "Partner verified successfully",
//       data: sanitize(partner),
//     });
//   } catch (error) {
//     return res
//       .status(500)
//       .json({
//         success: false,
//         message: "Unable to verify partner",
//         error: error.message,
//       });
//   }
// };

// export const requestPartnerAction = async (req, res) => {
//   const partner = await Partner.findById(req.params.id);
//   if (!partner)
//     return res
//       .status(404)
//       .json({ success: false, message: "Partner not found" });
//   partner.applicationStatus = "Action_Required";
//   partner.verificationHistory.push({
//     status: "Action_Required",
//     remarks: req.body.remarks || "Additional information required",
//     actor: makeActor(req),
//   });
//   await partner.save();
//   return res.json({
//     success: true,
//     message: "Action required",
//     data: sanitize(partner),
//   });
// };

// export const rejectPartnerApplication = async (req, res) => {
//   const partner = await Partner.findById(req.params.id);
//   if (!partner)
//     return res
//       .status(404)
//       .json({ success: false, message: "Partner not found" });
//   partner.applicationStatus = "Rejected";
//   partner.isRejected = true;
//   partner.isApproved = false;
//   partner.isVerified = false;
//   partner.verificationHistory.push({
//     status: "Rejected",
//     remarks: req.body.remarks || "Rejected by admin",
//     actor: makeActor(req),
//   });
//   await partner.save();
//   return res.json({
//     success: true,
//     message: "Application rejected",
//     data: sanitize(partner),
//   });
// };


import mongoose from "mongoose";

import Partner from "../../models/Partner.js";

import TeamWallet from "../../models/TeamWallet.js";

import {
  generateOtp,
  hashOtp,
  verifyOtpHash,
  generateSixCharacterTemporaryPassword,
  generateNameBasedTemporaryPassword,
  hashPassword,
} from "../../services/partnerCredentialService.js";

import {
  sendEmailOtp,
  sendMobileOtp,
  sendPartnerCredentials,
} from "../../services/partnerNotificationService.js";
import { notifyAdmins } from "../../services/adminNotificationService.js";

const generatePartnerId = () =>
  `PRT-${Date.now()
    .toString()
    .slice(-6)}${Math.floor(
    10 + Math.random() * 90
  )}`;

const makeActor = (req) => ({
  userId: req.user?._id || null,

  name:
    req.user?.name ||
    "Admin",

  role:
    req.user?.role ||
    "Admin",
});

const sanitize = (doc) => {
  const x =
    doc?.toObject
      ? doc.toObject()
      : { ...doc };

  delete x.password;

  if (x.emailVerification) {
    delete x.emailVerification.otpHash;
  }

  if (x.phoneVerification) {
    delete x.phoneVerification.otpHash;
  }

  return x;
};

const getDeliveryError = (settledResult) => {
  if (!settledResult || settledResult.status === "fulfilled") return null;

  const reason = settledResult.reason || {};
  const rawMessage = String(
    reason.response?.data?.message || reason.message || "Email OTP delivery failed"
  );

  return {
    code: reason.code || reason.response?.data?.code || "EMAIL_DELIVERY_FAILED",
    message: rawMessage.replace(/password|secret|token|api[-_ ]?key/gi, "credential").slice(0, 300),
    retryable: true,
  };
};

// ======================================================
// REGISTER PARTNER APPLICATION
// ONLY single / team
// SUBAGENT IS NOT ALLOWED HERE
// ======================================================

export const registerPartnerApplication =
  async (req, res) => {
    try {
      const {
        name,
        email,
        phone,
        accountType,
        business = {},
        location = {},
        rera = {},
        identityDocuments = [],
        privacyConsent = {},
      } = req.body;

      if (
        !name ||
        !email ||
        !phone ||
        ![
          "single",
          "team",
        ].includes(
          accountType
        )
      ) {
        return res
          .status(400)
          .json({
            success: false,

            message:
              "name, email, phone and accountType(single/team) are required",
          });
      }

      if (
        !privacyConsent
          ?.accepted
      ) {
        return res
          .status(400)
          .json({
            success: false,

            message:
              "Privacy consent is required",
          });
      }

      if (!Array.isArray(identityDocuments) || identityDocuments.length === 0) {
        return res.status(400).json({
          success: false,
          message: "At least one identity document with front and back proof is required",
        });
      }

      for (const doc of identityDocuments) {
        if (!doc?.documentType || !doc?.frontUrl || !doc?.backUrl) {
          return res.status(400).json({
            success: false,
            message: "Each identity document requires documentType, frontUrl and backUrl",
          });
        }
      }

      const normalizedEmail =
        String(email)
          .trim()
          .toLowerCase();

      const normalizedPhone =
        String(phone).trim();

      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
      if (!emailPattern.test(normalizedEmail)) {
        return res.status(400).json({
          success: false,
          message: "Please provide a valid email address",
          error: {
            field: "email",
            code: "INVALID_EMAIL",
            value: normalizedEmail,
          },
        });
      }

      const indianPhonePattern = /^[6-9]\d{9}$/;
      if (!indianPhonePattern.test(normalizedPhone)) {
        return res.status(400).json({
          success: false,
          message: "Please provide a valid 10-digit Indian phone number",
          error: {
            field: "phone",
            code: "INVALID_PHONE",
            value: normalizedPhone,
          },
        });
      }

      const exists =
        await Partner.findOne({
          $or: [
            {
              email:
                normalizedEmail,
            },

            {
              phone:
                normalizedPhone,
            },
          ],
        });

      if (exists) {
        return res
          .status(409)
          .json({
            success: false,

            message:
              "Email or phone already registered",
          });
      }

      const emailOtp =
        generateOtp();

      const partner =
        await Partner.create({
          partnerId:
            generatePartnerId(),

          name:
            String(name).trim(),

          email:
            normalizedEmail,

          phone:
            normalizedPhone,

          accountType,

          role:
            accountType ===
            "team"
              ? "agency_owner"
              : "partner",

          teamRole:
            accountType ===
            "team"
              ? "OWNER"
              : "NONE",

          isSubPartner:
            false,

          parentPartnerId:
            null,

          business,

          location,

          identityDocuments,

          rera: {
            ...rera,

            verificationStatus:
              rera?.applicable
                ? "Pending"
                : "Not_Applicable",
          },

          privacyConsent: {
            accepted:
              true,

            acceptedAt:
              new Date(),

            privacyNoticeVersion:
              privacyConsent
                ?.privacyNoticeVersion ||
              "v1",
          },

          applicationStatus:
            "Pending_Email_Verification",

          isApproved:
            false,

          isVerified:
            false,

          isRejected:
            false,

          isBlocked:
            false,

          permissions: {
            canReceiveAssignments:
              false,

            canCreateVisitRequest:
              false,

            canUnlockLead:
              false,

            canSpendCredits:
              false,

            canManageTeam:
              false,

            canAllocateCredits:
              false,

            canVerifyProperty:
              false,

            canSubmitPropertyForAdminApproval:
              false,
          },

          emailVerification: {
            isVerified:
              false,

            otpHash:
              hashOtp(
                emailOtp
              ),

            expiresAt:
              new Date(
                Date.now() +
                  10 *
                    60 *
                    1000
              ),

            verifiedAt:
              null,
          },

          phoneVerification: {
            isVerified:
              false,

            otpHash:
              "",

            expiresAt:
              null,

            verifiedAt:
              null,
          },

          verificationHistory:
            [
              {
                status:
                  "Application_Created",

                remarks:
                  "Partner application created",

                actor: {
                  name:
                    String(name).trim(),

                  role:
                    "Applicant",
                },

                createdAt:
                  new Date(),
              },
            ],
        });

      // Verification is sequential: email first, then mobile. A provider
      // failure must not turn a successfully saved application into a 500.
      const [emailDelivery] = await Promise.allSettled([
        sendEmailOtp({
          to: partner.email,
          name: partner.name,
          otp: emailOtp,
        }),
      ]);

      const emailDeliveryError = getDeliveryError(emailDelivery);

      await Promise.allSettled([notifyAdmins({
        title: "New partner application",
        message: `${partner.name} registered as ${partner.accountType || "partner"}. Approval and verification are pending.`,
        type: "PARTNER_APPLICATION",
        actionUrl: `/partnerdashboard?tab=applications&applicationId=${partner._id}`,
        entityType: "Partner",
        entityId: partner._id,
        data: { partnerId: partner.partnerId, accountType: partner.accountType },
      })]);

      return res
        .status(201)
        .json({
          success: true,

          message:
            "Partner application created successfully. Please verify your email first, then verify your phone.",

          data: {
            mongoId: partner._id,
            applicationId: partner._id,
            partnerId: partner.partnerId,
            name: partner.name,
            email: partner.email,
            phone: partner.phone,
            accountType: partner.accountType,
            applicationStatus: partner.applicationStatus,
            emailOtpSent: emailDelivery.status === "fulfilled",
            emailDelivery: {
              status: emailDelivery.status === "fulfilled" ? "SENT" : "FAILED",
              error: emailDeliveryError,
            },
            warning: emailDeliveryError
              ? "Application is saved, but email OTP could not be delivered. Please use the resend OTP API."
              : null,
            nextStep: "VERIFY_EMAIL",
            nextApi: `PATCH /api/partner-applications/${partner._id}/verify-email`,
            resendOtpApi: `POST /api/partner-applications/${partner._id}/resend-otp`,
            verificationOrder: ["VERIFY_EMAIL", "VERIFY_PHONE"],
          },
        });
    } catch (error) {
      console.error(
        "REGISTER PARTNER APPLICATION ERROR:",
        error
      );

      const isValidationError = error?.name === "ValidationError";
      const isDuplicateError = error?.code === 11000;

      return res
        .status(isValidationError ? 400 : isDuplicateError ? 409 : 500)
        .json({
          success: false,

          message:
            isValidationError
              ? "Partner application validation failed"
              : isDuplicateError
                ? "Email or phone already registered"
                : "Unable to create partner application",

          error: {
            code: isValidationError
              ? "VALIDATION_ERROR"
              : isDuplicateError
                ? "DUPLICATE_PARTNER"
                : "PARTNER_REGISTRATION_FAILED",
            message: error.message,
          },
        });
    }
  };

// ======================================================
// RESEND OTP
// SAME API FOR single/team/subagent
// ======================================================

export const resendPartnerOtp =
  async (req, res) => {
    try {
      const partner =
        await Partner.findById(
          req.params.id
        );

      if (!partner) {
        return res
          .status(404)
          .json({
            success: false,

            message:
              "Application not found",
          });
      }

      const {
        channel,
      } = req.body;

      const otp =
        generateOtp();

      if (
        channel === "email"
      ) {
        if (
          partner
            .emailVerification
            ?.isVerified
        ) {
          return res
            .status(400)
            .json({
              success:
                false,

              message:
                "Email is already verified",
            });
        }

        partner.emailVerification.otpHash =
          hashOtp(
            otp
          );

        partner.emailVerification.expiresAt =
          new Date(
            Date.now() +
              10 *
                60 *
                1000
          );

        await sendEmailOtp({
          to:
            partner.email,

          name:
            partner.name,

          otp,
        });
      } else if (
        channel === "phone"
      ) {
        if (!partner.emailVerification?.isVerified) {
          return res.status(400).json({
            success: false,
            message: "Please verify email before requesting phone OTP",
            data: {
              applicationId: partner._id,
              nextStep: "VERIFY_EMAIL",
            },
          });
        }

        if (
          partner
            .phoneVerification
            ?.isVerified
        ) {
          return res
            .status(400)
            .json({
              success:
                false,

              message:
                "Mobile is already verified",
            });
        }

        partner.phoneVerification.otpHash =
          hashOtp(
            otp
          );

        partner.phoneVerification.expiresAt =
          new Date(
            Date.now() +
              10 *
                60 *
                1000
          );

        await sendMobileOtp({
          phone:
            partner.phone,

          otp,
        });
      } else {
        return res
          .status(400)
          .json({
            success: false,

            message:
              "channel must be email or phone",
          });
      }

      await partner.save();

      return res.json({
        success: true,

        message:
          "OTP resent successfully",

        data: {
          applicationId:
            partner._id,

          channel,

          expiresIn:
            "10 minutes",
        },
      });
    } catch (error) {
      return res
        .status(500)
        .json({
          success: false,

          message:
            "Unable to resend OTP",

          error:
            error.message,
        });
    }
  };

// ======================================================
// VERIFY EMAIL OTP
// SAME FOR SUBAGENT
// ======================================================

export const verifyPartnerEmailOtp =
  async (req, res) => {
    try {
      const partner =
        await Partner.findById(
          req.params.id
        );

      if (!partner) {
        return res
          .status(404)
          .json({
            success: false,

            message:
              "Application not found",
          });
      }

      if (
        partner
          .emailVerification
          ?.isVerified
      ) {
        return res.json({
          success: true,

          message:
            "Email already verified",

          data:
            sanitize(
              partner
            ),
        });
      }

      if (
        !partner
          .emailVerification
          ?.otpHash ||
        !partner
          .emailVerification
          ?.expiresAt ||
        partner
          .emailVerification
          .expiresAt <
          new Date()
      ) {
        return res
          .status(400)
          .json({
            success: false,

            message:
              "Invalid or expired email OTP",
          });
      }

      if (
        !verifyOtpHash(
          req.body.otp,

          partner
            .emailVerification
            .otpHash
        )
      ) {
        return res
          .status(400)
          .json({
            success: false,

            message:
              "Invalid or expired email OTP",
          });
      }

      partner.emailVerification.isVerified =
        true;

      partner.emailVerification.verifiedAt =
        new Date();

      partner.emailVerification.otpHash =
        "";

      partner.emailVerification.expiresAt =
        null;

      partner.applicationStatus =
        partner
          .phoneVerification
          ?.isVerified
          ? "Submitted"
          : "Pending_Phone_Verification";

      let phoneOtpSent = Boolean(partner.phoneVerification?.isVerified);

      // Email is verified, so now generate and send the phone OTP.
      if (!partner.phoneVerification?.isVerified) {
        const nextPhoneOtp = generateOtp();
        partner.phoneVerification.otpHash = hashOtp(nextPhoneOtp);
        partner.phoneVerification.expiresAt = new Date(
          Date.now() + 10 * 60 * 1000
        );

        const [phoneDelivery] = await Promise.allSettled([
          sendMobileOtp({ phone: partner.phone, otp: nextPhoneOtp }),
        ]);
        phoneOtpSent = phoneDelivery.status === "fulfilled";
      }

      await partner.save();

      return res.json({
        success: true,

        message:
          "Email verified successfully. Now verify your phone number.",

        data: {
          mongoId: partner._id,
          applicationId: partner._id,
          email: partner.email,
          phone: partner.phone,
          emailVerified: true,
          phoneVerified: Boolean(partner.phoneVerification?.isVerified),
          phoneOtpSent,
          applicationStatus: partner.applicationStatus,
          nextStep: partner.phoneVerification?.isVerified
            ? "COMPLETED"
            : "VERIFY_PHONE",
          nextApi: partner.phoneVerification?.isVerified
            ? null
            : `PATCH /api/partner-applications/${partner._id}/verify-phone`,
        },
      });
    } catch (error) {
      return res
        .status(500)
        .json({
          success: false,

          message:
            "Unable to verify email",

          error:
            error.message,
        });
    }
  };

// ======================================================
// VERIFY MOBILE OTP
// SAME FOR SUBAGENT
// ======================================================

export const verifyPartnerPhoneOtp =
  async (req, res) => {
    try {
      const partner =
        await Partner.findById(
          req.params.id
        );

      if (!partner) {
        return res
          .status(404)
          .json({
            success: false,

            message:
              "Application not found",
          });
      }

      if (
        partner
          .phoneVerification
          ?.isVerified
      ) {
        return res.json({
          success: true,

          message:
            "Mobile already verified",

          data:
            sanitize(
              partner
            ),
        });
      }

      if (!partner.emailVerification?.isVerified) {
        return res.status(400).json({
          success: false,
          message: "Please verify email before verifying phone",
          data: {
            mongoId: partner._id,
            applicationId: partner._id,
            email: partner.email,
            phone: partner.phone,
            nextStep: "VERIFY_EMAIL",
            nextApi: `PATCH /api/partner-applications/${partner._id}/verify-email`,
          },
        });
      }

      if (
        !partner
          .phoneVerification
          ?.otpHash ||
        !partner
          .phoneVerification
          ?.expiresAt ||
        partner
          .phoneVerification
          .expiresAt <
          new Date()
      ) {
        return res
          .status(400)
          .json({
            success: false,

            message:
              "Invalid or expired mobile OTP",
          });
      }

      if (
        !verifyOtpHash(
          req.body.otp,

          partner
            .phoneVerification
            .otpHash
        )
      ) {
        return res
          .status(400)
          .json({
            success: false,

            message:
              "Invalid or expired mobile OTP",
          });
      }

      partner.phoneVerification.isVerified =
        true;

      partner.phoneVerification.verifiedAt =
        new Date();

      partner.phoneVerification.otpHash =
        "";

      partner.phoneVerification.expiresAt =
        null;

      partner.applicationStatus =
        partner
          .emailVerification
          ?.isVerified
          ? "Submitted"
          : "Pending_Email_Verification";

      await partner.save();

      return res.json({
        success: true,

        message:
          "Phone verified successfully. Partner application is now submitted for admin review.",

        data: {
          mongoId: partner._id,
          applicationId: partner._id,
          partnerId: partner.partnerId,
          email: partner.email,
          phone: partner.phone,
          emailVerified: Boolean(partner.emailVerification?.isVerified),
          phoneVerified: true,
          applicationStatus: partner.applicationStatus,
          nextStep: "ADMIN_REVIEW",
        },
      });
    } catch (error) {
      return res
        .status(500)
        .json({
          success: false,

          message:
            "Unable to verify mobile",

          error:
            error.message,
        });
    }
  };

// ======================================================
// GET ALL APPLICATIONS
// ADMIN
//
// single + team + subagent ALL COME HERE
// ======================================================

export const getPartnerApplications =
  async (req, res) => {
    try {
      const query = {};

      if (
        req.query.status &&
        req.query.status !==
          "All"
      ) {
        query.applicationStatus =
          req.query.status;
      }

      if (
        req.query
          .accountType &&
        req.query
          .accountType !==
          "All"
      ) {
        query.accountType =
          req.query.accountType;
      }

      if (
        req.query
          .agencyOwnerId &&
        mongoose.Types.ObjectId.isValid(
          req.query
            .agencyOwnerId
        )
      ) {
        query.parentPartnerId =
          req.query.agencyOwnerId;
      }

      if (
        req.query.search?.trim()
      ) {
        const rx =
          new RegExp(
            req.query.search.trim(),

            "i"
          );

        query.$or = [
          {
            name:
              rx,
          },

          {
            email:
              rx,
          },

          {
            phone:
              rx,
          },

          {
            partnerId:
              rx,
          },

          {
            "business.businessName":
              rx,
          },

          {
            "agencyDetails.agencyName":
              rx,
          },

          {
            "agencyDetails.agencyOwnerName":
              rx,
          },
        ];
      }

      const data =
        await Partner.find(
          query
        )
          .select(
            "-password -emailVerification.otpHash -phoneVerification.otpHash"
          )
          .sort({
            createdAt: -1,
          })
          .lean();

      return res.json({
        success: true,

        count:
          data.length,

        data,
      });
    } catch (error) {
      return res
        .status(500)
        .json({
          success: false,

          message:
            "Unable to fetch applications",

          error:
            error.message,
        });
    }
  };

// ======================================================
// GET APPLICATION BY ID
// ======================================================

export const getPartnerApplicationById =
  async (req, res) => {
    try {
      const partner =
        await Partner.findById(
          req.params.id
        )
          .select(
            "-password -emailVerification.otpHash -phoneVerification.otpHash"
          )
          .populate(
            "parentPartnerId",

            "partnerId name email phone accountType role business isApproved isVerified applicationStatus"
          )
          .lean();

      if (!partner) {
        return res
          .status(404)
          .json({
            success: false,

            message:
              "Application not found",
          });
      }

      return res.json({
        success: true,

        data:
          partner,
      });
    } catch (error) {
      return res
        .status(500)
        .json({
          success: false,

          message:
            "Unable to fetch application",

          error:
            error.message,
        });
    }
  };

// ======================================================
// APPROVE PARTNER / TEAM OWNER / SUBAGENT
// ADMIN
//
// TEMP PASSWORD IS GENERATED ONLY HERE
// ======================================================

export const approvePartnerApplication =
  async (req, res) => {
    const session =
      await mongoose.startSession();

    let result;

    try {
      await session.withTransaction(
        async () => {
          const partner =
            await Partner.findById(
              req.params.id
            ).session(
              session
            );

          if (!partner) {
            const error =
              new Error(
                "Application not found"
              );

            error.statusCode =
              404;

            throw error;
          }

          // --------------------------------------------
          // EMAIL + MOBILE MUST BOTH BE VERIFIED
          // --------------------------------------------

          if (
            !partner
              .emailVerification
              ?.isVerified ||
            !partner
              .phoneVerification
              ?.isVerified
          ) {
            const error =
              new Error(
                "Email and mobile must be verified before approval"
              );

            error.statusCode =
              400;

            throw error;
          }

          // --------------------------------------------
          // VALID STATUS
          // --------------------------------------------

          if (
            ![
              "Submitted",

              "Under_Review",

              "Action_Required",
            ].includes(
              partner
                .applicationStatus
            )
          ) {
            const error =
              new Error(
                `Cannot approve application in ${partner.applicationStatus} status`
              );

            error.statusCode =
              400;

            throw error;
          }

          // --------------------------------------------
          // SUBAGENT PARENT AGENCY CHECK
          // --------------------------------------------

          if (
            partner.accountType ===
            "subagent"
          ) {
            const owner =
              await Partner.findById(
                partner
                  .parentPartnerId
              ).session(
                session
              );

            if (
              !owner ||
              owner.accountType !==
                "team" ||
              owner.isSubPartner ||
              !owner.isApproved ||
              !owner.isVerified ||
              owner.isBlocked ||
              owner.applicationStatus !==
                "Verified"
            ) {
              const error =
                new Error(
                  "Sub-Agent Agency Owner is not active/verified"
                );

              error.statusCode =
                400;

              throw error;
            }
          }

          // --------------------------------------------
          // GENERATE TEMP PASSWORD ONLY NOW
          // --------------------------------------------

          const temp =
            generateNameBasedTemporaryPassword(partner.name);

          partner.password =
            await hashPassword(
              temp
            );

          partner.isApproved =
            true;

          partner.isVerified =
            false;

          partner.isRejected =
            false;

          partner.approvedAt =
            new Date();

          partner.approvedBy =
            makeActor(
              req
            );

          partner.applicationStatus =
            "Approved_Not_Verified";

          partner.credentials.temporaryPasswordIssued =
            true;

          partner.credentials.temporaryPasswordIssuedAt =
            new Date();

          partner.credentials.temporaryPasswordExpiresAt =
            new Date(
              Date.now() +
                24 *
                  60 *
                  60 *
                  1000
            );

          partner.credentials.mustChangePassword =
            true;

          // --------------------------------------------
          // ALL PERMISSIONS FALSE UNTIL FINAL VERIFY
          // --------------------------------------------

          partner.permissions = {
            canReceiveAssignments:
              false,

            canCreateVisitRequest:
              false,

            canUnlockLead:
              false,

            canSpendCredits:
              false,

            canManageTeam:
              false,

            canAllocateCredits:
              false,

            canVerifyProperty:
              false,

            canSubmitPropertyForAdminApproval:
              false,
          };

          partner.verificationHistory.push(
            {
              status:
                "Approved_Not_Verified",

              remarks:
                req.body
                  ?.remarks ||
                "Approved by Admin",

              actor:
                makeActor(
                  req
                ),

              createdAt:
                new Date(),
            }
          );

          // --------------------------------------------
          // CREATE WALLET ONLY FOR TEAM OWNER
          // NOT SUBAGENT
          // --------------------------------------------

          if (
            partner.accountType ===
              "team" &&
            !partner.isSubPartner
          ) {
            await TeamWallet.findOneAndUpdate(
              {
                ownerPartnerId:
                  partner._id,
              },

              {
                $setOnInsert:
                  {
                    ownerPartnerId:
                      partner._id,

                    ownerPartnerCode:
                      partner.partnerId,

                    teamName:
                      partner
                        .business
                        ?.businessName ||
                      `${partner.name} Team`,
                  },
              },

              {
                upsert:
                  true,

                new:
                  true,

                session,
              }
            );
          }

          await partner.save({
            session,
          });

          result = {
            partner,

            temp,
          };
        }
      );

      // --------------------------------------------
      // SEND LOGIN CREDENTIALS
      // --------------------------------------------

      await sendPartnerCredentials(
        {
          to:
            result
              .partner
              .email,

          name:
            result
              .partner
              .name,

          partnerId:
            result
              .partner
              .partnerId,

          temporaryPassword:
            result.temp,
        }
      );

      return res.json({
        success: true,

        message:
          result.partner
            .accountType ===
          "subagent"
            ? "Sub-Agent approved. Temporary credentials sent to registered email."
            : "Partner approved. Temporary credentials sent to registered email.",

        data:
          sanitize(
            result.partner
          ),
      });
    } catch (error) {
      return res
        .status(
          error.statusCode ||
            500
        )
        .json({
          success: false,

          message:
            "Unable to approve partner",

          error:
            error.message,
        });
    } finally {
      await session.endSession();
    }
  };

// ======================================================
// FINAL VERIFY
// ADMIN
//
// PERMISSIONS ARE ENABLED ONLY HERE
// ======================================================

export const markPartnerVerified =
  async (req, res) => {
    try {
      const partner =
        await Partner.findById(
          req.params.id
        );

      if (!partner) {
        return res
          .status(404)
          .json({
            success: false,

            message:
              "Partner not found",
          });
      }

      if (
        !partner.isApproved
      ) {
        return res
          .status(400)
          .json({
            success: false,

            message:
              "Approve partner first",
          });
      }

      if (
        partner.isBlocked ||
        partner.applicationStatus ===
          "Suspended"
      ) {
        return res
          .status(400)
          .json({
            success: false,

            message:
              "Suspended partner cannot be verified",
          });
      }

      // --------------------------------------------
      // SUBAGENT PARENT AGENCY CHECK
      // --------------------------------------------

      if (
        partner.accountType ===
        "subagent"
      ) {
        const owner =
          await Partner.findById(
            partner
              .parentPartnerId
          );

        if (
          !owner ||
          owner.accountType !==
            "team" ||
          owner.isSubPartner ||
          !owner.isApproved ||
          !owner.isVerified ||
          owner.isBlocked ||
          owner.applicationStatus !==
            "Verified"
        ) {
          return res
            .status(400)
            .json({
              success:
                false,

              message:
                "Agency Owner is not active/verified",
            });
        }
      }

      // --------------------------------------------
      // FINAL VERIFY
      // --------------------------------------------

      partner.isVerified =
        true;

      partner.verifiedAt =
        new Date();

      partner.verifiedBy =
        makeActor(
          req
        );

      partner.applicationStatus =
        "Verified";

      // --------------------------------------------
      // TEAM OWNER
      // --------------------------------------------

      if (
        partner.accountType ===
          "team" &&
        !partner.isSubPartner
      ) {
        partner.permissions = {
          canReceiveAssignments:
            true,

          canCreateVisitRequest:
            true,

          canUnlockLead:
            true,

          canSpendCredits:
            true,

          canManageTeam:
            true,

          canAllocateCredits:
            true,

          canVerifyProperty:
            true,

          canSubmitPropertyForAdminApproval:
            true,
        };
      }

      // --------------------------------------------
      // SUBAGENT
      // --------------------------------------------

      else if (
        partner.accountType ===
        "subagent"
      ) {
        partner.permissions = {
          // A Sub-Agent can work only inside the parent Team.
          // Admin never assigns a property directly to a Sub-Agent.
          canReceiveAssignments:
            true,

          canCreateVisitRequest:
            true,

          canUnlockLead:
            true,

          // IMPORTANT: Sub-Agents cannot purchase/spend from an independent wallet.
          // Credits are allocated by the verified Team / Agency Owner.
          canSpendCredits:
            false,

          canManageTeam:
            false,

          canAllocateCredits:
            false,

          canVerifyProperty:
            true,

          canSubmitPropertyForAdminApproval:
            true,
        };
      }

      // --------------------------------------------
      // SINGLE PARTNER
      // --------------------------------------------

      else {
        partner.permissions = {
          canReceiveAssignments:
            true,

          canCreateVisitRequest:
            true,

          canUnlockLead:
            true,

          canSpendCredits:
            true,

          canManageTeam:
            false,

          canAllocateCredits:
            false,

          canVerifyProperty:
            true,

          canSubmitPropertyForAdminApproval:
            true,
        };
      }

      partner.verificationHistory.push(
        {
          status:
            "Verified",

          remarks:
            req.body
              ?.remarks ||
            "Partner verified by Admin",

          actor:
            makeActor(
              req
            ),

          createdAt:
            new Date(),
        }
      );

      await partner.save();

      return res.json({
        success: true,

        message:
          partner.accountType ===
          "subagent"
            ? "Sub-Agent verified successfully. Team Owner can now allocate credits."
            : "Partner verified successfully",

        data:
          sanitize(
            partner
          ),
      });
    } catch (error) {
      return res
        .status(500)
        .json({
          success: false,

          message:
            "Unable to verify partner",

          error:
            error.message,
        });
    }
  };

// ======================================================
// ACTION REQUIRED
// ======================================================

export const requestPartnerAction =
  async (req, res) => {
    try {
      const partner =
        await Partner.findById(
          req.params.id
        );

      if (!partner) {
        return res
          .status(404)
          .json({
            success: false,

            message:
              "Partner not found",
          });
      }

      partner.applicationStatus =
        "Action_Required";

      partner.verificationHistory.push(
        {
          status:
            "Action_Required",

          remarks:
            req.body
              ?.remarks ||
            "Additional information required",

          actor:
            makeActor(
              req
            ),

          createdAt:
            new Date(),
        }
      );

      await partner.save();

      return res.json({
        success: true,

        message:
          "Action required",

        data:
          sanitize(
            partner
          ),
      });
    } catch (error) {
      return res
        .status(500)
        .json({
          success: false,

          message:
            "Unable to update application",

          error:
            error.message,
        });
    }
  };

// ======================================================
// REJECT APPLICATION
// ======================================================

export const rejectPartnerApplication =
  async (req, res) => {
    try {
      const partner =
        await Partner.findById(
          req.params.id
        );

      if (!partner) {
        return res
          .status(404)
          .json({
            success: false,

            message:
              "Partner not found",
          });
      }

      partner.applicationStatus =
        "Rejected";

      partner.isRejected =
        true;

      partner.isApproved =
        false;

      partner.isVerified =
        false;

      partner.permissions = {
        canReceiveAssignments:
          false,

        canCreateVisitRequest:
          false,

        canUnlockLead:
          false,

        canSpendCredits:
          false,

        canManageTeam:
          false,

        canAllocateCredits:
          false,

        canVerifyProperty:
          false,

        canSubmitPropertyForAdminApproval:
          false,
      };

      partner.verificationHistory.push(
        {
          status:
            "Rejected",

          remarks:
            req.body
              ?.remarks ||
            "Rejected by Admin",

          actor:
            makeActor(
              req
            ),

          createdAt:
            new Date(),
        }
      );

      await partner.save();

      return res.json({
        success: true,

        message:
          "Application rejected",

        data:
          sanitize(
            partner
          ),
      });
    } catch (error) {
      return res
        .status(500)
        .json({
          success: false,

          message:
            "Unable to reject application",

          error:
            error.message,
        });
    }
  };
