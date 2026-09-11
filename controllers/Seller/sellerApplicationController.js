import bcrypt from "bcryptjs";
import mongoose from "mongoose";

import Seller from "../../models/Seller.js";
import {
  generateOtp,
  hashOtp,
  otpExpiry,
  isOtpValid,
} from "../../utils/otpUtils.js";
import {
  generateSellerTemporaryPassword,
} from "../../utils/generateSellerTemporaryPassword.js";
// import {
//   uploadSellerKycImage,
// } from "../../config/cloudinary.js";
import {
  sendSellerEmailOtp,
  sendSellerApprovalCredentials,
  sendSellerApplicationRejectedEmail,
} from "../../services/selleremailService.js";
import {
  sendSellerPhoneOtp,
} from "../../services/smsService.js";

const publicSellerSelect =
  "-password -emailVerification.otpHash -emailVerification.otpExpiresAt -phoneVerification.otpHash -phoneVerification.otpExpiresAt";

const pushHistory = (
  seller,
  action,
  remarks = "",
  actor = {}
) => {
  seller.verificationHistory.push({
    action,
    remarks,
    updatedBy: {
      userId: actor?.userId || null,
      name: actor?.name || "System",
      role: actor?.role || "System",
    },
  });
};

const getAdminActor = (req) => ({
  userId: req.user?._id || req.user?.id || null,
  name: req.user?.name || "Admin",
  role: req.user?.role || "Admin",
});

// ======================================================
// PUBLIC - CREATE SELLER APPLICATION
// POST /api/sellers/applications/register
// application/json
// ======================================================
export const createSellerApplication =
  async (req, res) => {
    try {
      const {
        name,
        email,
        phone,

        city = "",
        state = "",
        country = "India",
        address = "",
        pinCode = "",

        latitude,
        longitude,
      } = req.body || {};

      // ==========================================
      // BASIC VALIDATION
      // ==========================================

      if (
        !name ||
        !email ||
        !phone
      ) {
        return res
          .status(400)
          .json({
            success: false,

            message:
              "Name, email and phone are required",
          });
      }

      const normalizedEmail =
        String(email)
          .trim()
          .toLowerCase();

      const normalizedPhone =
        String(phone).trim();

      // ==========================================
      // DUPLICATE SELLER CHECK
      // ==========================================

      const existingSeller =
        await Seller.findOne({
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

      if (
        existingSeller
      ) {
        return res
          .status(409)
          .json({
            success: false,

            message:
              "Seller application already exists with this email or phone number",
          });
      }

      // ==========================================
      // EMAIL OTP
      // ==========================================

      const emailOtp =
        generateOtp();

      // ==========================================
      // CREATE SELLER APPLICATION
      // ==========================================

      const seller =
        await Seller.create({
          name:
            String(
              name
            ).trim(),

          email:
            normalizedEmail,

          phone:
            normalizedPhone,

          role:
            "seller",

          // ==============================
          // EMAIL VERIFICATION
          // ==============================

          emailVerification: {
            isVerified:
              false,

            otpHash:
              hashOtp(
                emailOtp
              ),

            otpExpiresAt:
              otpExpiry(
                10
              ),
          },

          // ==============================
          // PHONE VERIFICATION
          // ==============================

          phoneVerification: {
            isVerified:
              false,

            otpHash:
              null,

            otpExpiresAt:
              null,
          },

          isPhoneVerified:
            false,

          // ==============================
          // APPLICATION
          // ==============================

          applicationStatus:
            "EMAIL_VERIFICATION_PENDING",

          accountStatus:
            "PENDING",

          // ==============================
          // LOCATION
          // ==============================

          location: {
            city:
              city || "",

            state:
              state || "",

            country:
              country ||
              "India",

            address:
              address || "",

            pinCode:
              pinCode || "",

            coordinates: {
              type:
                "Point",

              coordinates: [
                Number(
                  longitude ||
                    0
                ),

                Number(
                  latitude ||
                    0
                ),
              ],
            },
          },

          // ==============================
          // HISTORY
          // ==============================

          verificationHistory:
            [
              {
                action:
                  "APPLICATION_CREATED",

                remarks:
                  "Seller application created",
              },
            ],
        });

      // ==========================================
      // SEND EMAIL OTP
      // IMPORTANT: seller is already created.
      // Email failure must NOT convert a successful
      // DB registration into HTTP 500.
      // ==========================================

      let emailSent = false;
      let emailErrorMessage = null;

      try {
        await sendSellerEmailOtp({
          to:
            seller.email,

          name:
            seller.name,

          otp:
            emailOtp,
        });

        emailSent = true;

        // Only record EMAIL_OTP_SENT after the mailer
        // confirms that sendMail completed successfully.
        pushHistory(
          seller,
          "EMAIL_OTP_SENT",
          "Email verification OTP sent"
        );

        // History is useful, but a history-save problem
        // should not make registration look failed.
        try {
          await seller.save();
        } catch (historyError) {
          console.error(
            "SELLER EMAIL OTP HISTORY SAVE ERROR:",
            historyError
          );
        }
      } catch (emailError) {
        emailErrorMessage =
          emailError?.message ||
          "Unable to send verification email";

        console.error(
          "SELLER REGISTRATION EMAIL OTP ERROR:",
          emailError
        );
      }

      // ==========================================
      // RESPONSE
      // ==========================================

      return res
        .status(201)
        .json({
          success: true,

          message: emailSent
            ? "Seller application created successfully. Email OTP sent."
            : "Seller application created successfully, but the email OTP could not be sent. Please use resend email OTP.",

          data: {
            applicationId:
              seller._id,

            sellerId:
              seller.sellerId,

            name:
              seller.name,

            email:
              seller.email,

            phone:
              seller.phone,

            applicationStatus:
              seller.applicationStatus,

            emailSent,

            // Safe diagnostic for frontend/logs; never expose
            // SMTP credentials or stack traces.
            emailError:
              emailSent
                ? null
                : emailErrorMessage,
          },
        });
    } catch (
      error
    ) {
      console.error(
        "CREATE SELLER APPLICATION ERROR:",
        error
      );

      return res
        .status(500)
        .json({
          success: false,

          message:
            error?.message ||
            "Unable to create seller application",
        });
    }
  };

// ======================================================
// PUBLIC - VERIFY EMAIL OTP
// POST /api/sellers/applications/verify-email
// ======================================================
export const verifySellerEmailOtp = async (
  req,
  res
) => {
  try {
    const { applicationId, otp } =
      req.body || {};

    const seller = await Seller.findById(
      applicationId
    ).select(
      "+emailVerification.otpHash +emailVerification.otpExpiresAt"
    );

    if (!seller) {
      return res.status(404).json({
        success: false,
        message: "Seller application not found",
      });
    }

    if (
      !isOtpValid({
        enteredOtp: otp,
        otpHash:
          seller.emailVerification.otpHash,
        otpExpiresAt:
          seller.emailVerification.otpExpiresAt,
      })
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired email OTP",
      });
    }

    seller.emailVerification.isVerified =
      true;
    seller.emailVerification.verifiedAt =
      new Date();
    seller.emailVerification.otpHash = null;
    seller.emailVerification.otpExpiresAt =
      null;

    seller.applicationStatus =
      "PHONE_VERIFICATION_PENDING";

    pushHistory(
      seller,
      "EMAIL_VERIFIED",
      "Email address verified"
    );

    const phoneOtp = generateOtp();

    seller.phoneVerification.otpHash =
      hashOtp(phoneOtp);
    seller.phoneVerification.otpExpiresAt =
      otpExpiry(10);

    pushHistory(
      seller,
      "PHONE_OTP_SENT",
      "Phone verification OTP sent"
    );

    await seller.save();

    await sendSellerPhoneOtp({
      phone: seller.phone,
      otp: phoneOtp,
    });

    return res.status(200).json({
      success: true,
      message:
        "Email verified. Phone OTP sent.",
      data: {
        applicationId: seller._id,
        applicationStatus:
          seller.applicationStatus,
      },
    });
  } catch (error) {
    console.error(
      "Verify Seller Email OTP Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Unable to verify email OTP",
    });
  }
};

// ======================================================
// PUBLIC - VERIFY PHONE OTP
// POST /api/sellers/applications/verify-phone
// ======================================================
export const verifySellerPhoneOtp = async (
  req,
  res
) => {
  try {
    const { applicationId, otp } =
      req.body || {};

    const seller = await Seller.findById(
      applicationId
    ).select(
      "+phoneVerification.otpHash +phoneVerification.otpExpiresAt"
    );

    if (!seller) {
      return res.status(404).json({
        success: false,
        message: "Seller application not found",
      });
    }

    if (!seller.emailVerification.isVerified) {
      return res.status(400).json({
        success: false,
        message:
          "Email must be verified first",
      });
    }

    if (
      !isOtpValid({
        enteredOtp: otp,
        otpHash:
          seller.phoneVerification.otpHash,
        otpExpiresAt:
          seller.phoneVerification.otpExpiresAt,
      })
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired phone OTP",
      });
    }

    seller.phoneVerification.isVerified =
      true;
    seller.phoneVerification.verifiedAt =
      new Date();
    seller.phoneVerification.otpHash = null;
    seller.phoneVerification.otpExpiresAt =
      null;

    const temporaryPassword =
      generateSellerTemporaryPassword(seller.name);

    seller.password = await bcrypt.hash(temporaryPassword, 12);
    seller.isPhoneVerified = true;
    seller.applicationStatus = "APPROVED";
    seller.accountStatus = "ACTIVE";
    seller.isVerified = true;
    seller.applicationSubmittedAt =
      new Date();
    seller.approvedAt = new Date();
    seller.approvedBy = {
      userId: null,
      name: "System",
      role: "System",
    };
    seller.mustChangePassword = true;

    pushHistory(
      seller,
      "PHONE_VERIFIED",
      "Phone number verified"
    );

    pushHistory(
      seller,
      "APPROVED",
      "Seller account activated automatically after email and phone verification"
    );

    await seller.save();

    let credentialsEmailSent = true;
    try {
      await sendSellerApprovalCredentials({
        to: seller.email,
        name: seller.name,
        sellerId: seller.sellerId,
        temporaryPassword,
      });
    } catch (emailError) {
      credentialsEmailSent = false;
      console.error("SELLER CREDENTIAL EMAIL ERROR:", emailError);
    }

    return res.status(200).json({
      success: true,
      message:
        credentialsEmailSent
          ? "Phone verified. Seller account created and login credentials sent by email."
          : "Phone verified and seller account created, but the credentials email could not be sent. Please contact support.",
      data: {
        applicationId: seller._id,
        sellerId: seller.sellerId,
        applicationStatus:
          seller.applicationStatus,
        accountStatus: seller.accountStatus,
        mustChangePassword: seller.mustChangePassword,
        credentialsEmailSent,
      },
    });
  } catch (error) {
    console.error(
      "Verify Seller Phone OTP Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to verify phone OTP",
    });
  }
};

// ======================================================
// PUBLIC - RESEND EMAIL OTP
// POST /api/sellers/applications/resend-email-otp
// ======================================================
export const resendSellerEmailOtp = async (
  req,
  res
) => {
  try {
    const { applicationId } =
      req.body || {};

    const seller =
      await Seller.findById(applicationId);

    if (!seller) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    if (seller.emailVerification.isVerified) {
      return res.status(400).json({
        success: false,
        message: "Email is already verified",
      });
    }

    const otp = generateOtp();

    seller.emailVerification.otpHash =
      hashOtp(otp);
    seller.emailVerification.otpExpiresAt =
      otpExpiry(10);

    pushHistory(
      seller,
      "EMAIL_OTP_SENT",
      "Email OTP resent"
    );

    await seller.save();

    await sendSellerEmailOtp({
      to: seller.email,
      name: seller.name,
      otp,
    });

    return res.json({
      success: true,
      message: "Email OTP resent",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to resend email OTP",
    });
  }
};

// ======================================================
// PUBLIC - RESEND PHONE OTP
// POST /api/sellers/applications/resend-phone-otp
// ======================================================
export const resendSellerPhoneOtp = async (
  req,
  res
) => {
  try {
    const { applicationId } =
      req.body || {};

    const seller =
      await Seller.findById(applicationId);

    if (!seller) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    if (!seller.emailVerification.isVerified) {
      return res.status(400).json({
        success: false,
        message:
          "Verify email before phone verification",
      });
    }

    if (seller.phoneVerification.isVerified) {
      return res.status(400).json({
        success: false,
        message: "Phone is already verified",
      });
    }

    const otp = generateOtp();

    seller.phoneVerification.otpHash =
      hashOtp(otp);
    seller.phoneVerification.otpExpiresAt =
      otpExpiry(10);

    pushHistory(
      seller,
      "PHONE_OTP_SENT",
      "Phone OTP resent"
    );

    await seller.save();

    await sendSellerPhoneOtp({
      phone: seller.phone,
      otp,
    });

    return res.json({
      success: true,
      message: "Phone OTP resent",
      data: {
        applicationId: seller._id,
        phone: seller.phone,
        otp,
        expiresIn: "10 minutes",
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to resend phone OTP",
    });
  }
};

// ======================================================
// ADMIN - LIST APPLICATIONS
// GET /api/sellers/applications
// ======================================================
export const getSellerApplications = async (
  req,
  res
) => {
  try {
    const {
      status = "All",
      search = "",
    } = req.query;

    const query = {
      applicationStatus: {
        $ne: "APPROVED",
      },
    };

    if (status !== "All") {
      query.applicationStatus = status;
    }

    if (search.trim()) {
      const regex = new RegExp(
        search.trim(),
        "i"
      );

      query.$or = [
        { sellerId: regex },
        { name: regex },
        { email: regex },
        { phone: regex },
        { "location.city": regex },
        { "location.state": regex },
      ];
    }

    const applications =
      await Seller.find(query)
        .select(publicSellerSelect)
        .sort({ createdAt: -1 })
        .lean();

    const summaryRows =
      await Seller.aggregate([
        {
          $match: {
            applicationStatus: {
              $ne: "APPROVED",
            },
          },
        },
        {
          $group: {
            _id: "$applicationStatus",
            count: { $sum: 1 },
          },
        },
      ]);

    const summary = {
      total: 0,
      submitted: 0,
      underReview: 0,
      actionRequired: 0,
      rejected: 0,
      verificationPending: 0,
    };

    summaryRows.forEach((item) => {
      summary.total += item.count;

      if (item._id === "SUBMITTED") {
        summary.submitted += item.count;
      }

      if (item._id === "UNDER_REVIEW") {
        summary.underReview += item.count;
      }

      if (item._id === "ACTION_REQUIRED") {
        summary.actionRequired += item.count;
      }

      if (item._id === "REJECTED") {
        summary.rejected += item.count;
      }

      if (
        [
          "EMAIL_VERIFICATION_PENDING",
          "PHONE_VERIFICATION_PENDING",
        ].includes(item._id)
      ) {
        summary.verificationPending +=
          item.count;
      }
    });

    return res.json({
      success: true,
      count: applications.length,
      summary,
      data: applications,
    });
  } catch (error) {
    console.error(
      "Get Seller Applications Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to fetch seller applications",
    });
  }
};

// ======================================================
// ADMIN - APPLICATION DETAIL
// GET /api/sellers/applications/:id
// ======================================================
export const getSellerApplicationById =
  async (req, res) => {
    try {
      const { id } = req.params;

      if (
        !mongoose.Types.ObjectId.isValid(id)
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid application ID",
        });
      }

      const seller =
        await Seller.findById(id)
          .select(publicSellerSelect)
          .lean();

      if (!seller) {
        return res.status(404).json({
          success: false,
          message: "Application not found",
        });
      }

      return res.json({
        success: true,
        data: seller,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message:
          "Unable to fetch application detail",
      });
    }
  };

// ======================================================
// ADMIN - REVIEW APPLICATION
// PATCH /api/sellers/applications/:id/review
// body: { action: approve | reject | action_required | under_review, remarks }
// ======================================================
export const reviewSellerApplication = async (
  req,
  res
) => {
  try {
    const { id } = req.params;
    const {
      action,
      remarks = "",
    } = req.body || {};

    if (
      !mongoose.Types.ObjectId.isValid(id)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid application ID",
      });
    }

    const seller =
      await Seller.findById(id);

    if (!seller) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    const actor = getAdminActor(req);

    if (action === "under_review") {
      seller.applicationStatus =
        "UNDER_REVIEW";

      pushHistory(
        seller,
        "UNDER_REVIEW",
        remarks ||
          "Application moved under review",
        actor
      );

      await seller.save();

      return res.json({
        success: true,
        message:
          "Application marked under review",
        data: seller,
      });
    }

    if (action === "action_required") {
      seller.applicationStatus =
        "ACTION_REQUIRED";
      seller.adminRemarks = remarks;

      pushHistory(
        seller,
        "ACTION_REQUIRED",
        remarks,
        actor
      );

      await seller.save();

      await sendSellerApplicationRejectedEmail({
        to: seller.email,
        name: seller.name,
        remarks,
        actionRequired: true,
      });

      return res.json({
        success: true,
        message:
          "Action required sent to seller",
        data: seller,
      });
    }

    if (action === "reject") {
      seller.applicationStatus =
        "REJECTED";
      seller.accountStatus = "PENDING";
      seller.isVerified = false;
      seller.rejectedAt = new Date();
      seller.adminRemarks = remarks;

      pushHistory(
        seller,
        "REJECTED",
        remarks,
        actor
      );

      await seller.save();

      await sendSellerApplicationRejectedEmail({
        to: seller.email,
        name: seller.name,
        remarks,
      });

      return res.json({
        success: true,
        message:
          "Seller application rejected",
        data: seller,
      });
    }

    if (action !== "approve") {
      return res.status(400).json({
        success: false,
        message:
          "action must be approve, reject, action_required or under_review",
      });
    }

    if (
      !seller.emailVerification.isVerified ||
      !seller.phoneVerification.isVerified
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Email and phone must both be verified before admin approval",
      });
    }

    if (seller.applicationStatus === "APPROVED") {
      return res.status(409).json({
        success: false,
        message:
          "Seller application is already approved",
      });
    }

    const temporaryPassword =
      generateSellerTemporaryPassword(
        seller.name
      );

    const hashedPassword =
      await bcrypt.hash(
        temporaryPassword,
        12
      );

    seller.password = hashedPassword;
    seller.applicationStatus = "APPROVED";
    seller.isVerified = true;
    seller.accountStatus = "ACTIVE";
    seller.approvedAt = new Date();
    seller.approvedBy = actor;
    seller.adminRemarks = remarks;
    seller.mustChangePassword = true;

    pushHistory(
      seller,
      "APPROVED",
      remarks || "Seller approved by admin",
      actor
    );

    await seller.save();

    try {
      await sendSellerApprovalCredentials({
        to: seller.email,
        name: seller.name,
        sellerId: seller.sellerId,
        temporaryPassword,
      });
    } catch (mailError) {
      // Account remains approved. Do not roll back approval after DB success.
      // Admin can trigger credential re-issue using a future explicit endpoint.
      console.error(
        "Seller approval email error:",
        mailError
      );

      return res.status(207).json({
        success: true,
        warning:
          "Seller approved, but credential email could not be delivered. Check SMTP and re-issue credentials.",
        data: {
          _id: seller._id,
          sellerId: seller.sellerId,
          applicationStatus:
            seller.applicationStatus,
          accountStatus:
            seller.accountStatus,
        },
      });
    }

    return res.json({
      success: true,
      message:
        "Seller approved. Login credentials were emailed to the seller.",
      data: {
        _id: seller._id,
        sellerId: seller.sellerId,
        applicationStatus:
          seller.applicationStatus,
        accountStatus:
          seller.accountStatus,
      },
    });
  } catch (error) {
    console.error(
      "Review Seller Application Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error?.message ||
        "Unable to review seller application",
    });
  }
};
