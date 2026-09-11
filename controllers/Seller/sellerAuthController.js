import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import Seller
  from "../../models/Seller.js";

import {
  generateOtp,
  hashOtp,
  otpExpiry,
  isOtpValid,
} from "../../utils/otpUtils.js";

import {
  sendSellerLoginOtpEmail,
} from "../../services/selleremailService.js";


// ======================================================
// JWT
// ======================================================

const signSellerToken =
  (seller) =>
    jwt.sign(
      {
        id:
          seller._id,

        role:
          "seller",

        sellerId:
          seller.sellerId,
      },

      process.env.JWT_SECRET,

      {
        expiresIn:
          process.env
            .JWT_EXPIRES_IN ||
          "7d",
      }
    );


// ======================================================
// SELLER PASSWORD LOGIN
// POST /api/sellers/auth/login
// ======================================================

export const sellerLogin =
  async (
    req,
    res
  ) => {
    try {
      const {
        email,
        password,
      } = req.body || {};

      if (
        !email ||
        !password
      ) {
        return res
          .status(400)
          .json({
            success: false,

            message:
              "Email and password are required",
          });
      }

      const normalizedEmail =
        String(email)
          .trim()
          .toLowerCase();

      const seller =
        await Seller.findOne({
          email:
            normalizedEmail,
        }).select(
          "+password"
        );

      if (
        !seller ||
        !seller.password
      ) {
        return res
          .status(401)
          .json({
            success: false,

            message:
              "Invalid email or password",
          });
      }

      // ================================
      // ADMIN APPROVAL
      // ================================

      if (
        seller.applicationStatus !==
        "APPROVED"
      ) {
        return res
          .status(403)
          .json({
            success: false,

            message:
              "Your seller application is not approved yet",

            applicationStatus:
              seller.applicationStatus,
          });
      }

      // ================================
      // ACCOUNT ACTIVE
      // ================================

      if (
        seller.accountStatus !==
        "ACTIVE"
      ) {
        return res
          .status(403)
          .json({
            success: false,

            message:
              `Seller account is ${seller.accountStatus}`,
          });
      }

      // ================================
      // VERIFICATION
      // ================================

      if (
        !seller.emailVerification
          ?.isVerified ||
        !seller.phoneVerification
          ?.isVerified
      ) {
        return res
          .status(403)
          .json({
            success: false,

            message:
              "Email and phone verification are required",
          });
      }

      // ================================
      // PASSWORD
      // ================================

      const validPassword =
        await bcrypt.compare(
          password,
          seller.password
        );

      if (
        !validPassword
      ) {
        return res
          .status(401)
          .json({
            success: false,

            message:
              "Invalid email or password",
          });
      }

      seller.lastLoginAt =
        new Date();

      await seller.save();

      const token =
        signSellerToken(
          seller
        );

      return res.json({
        success: true,

        message:
          "Login successful",

        token,

        data: {
          id:
            seller._id,

          sellerId:
            seller.sellerId,

          name:
            seller.name,

          email:
            seller.email,

          role:
            seller.role,

          mustChangePassword:
            seller.mustChangePassword,
        },
      });
    } catch (
      error
    ) {
      console.error(
        "SELLER LOGIN ERROR:",
        error
      );

      return res
        .status(500)
        .json({
          success: false,

          message:
            "Unable to login",
        });
    }
  };


// ======================================================
// SEND SELLER LOGIN OTP
// POST /api/sellers/auth/send-login-otp
// ======================================================

export const sendSellerLoginOtp =
  async (
    req,
    res
  ) => {
    try {
      const {
        email,
      } = req.body || {};

      if (!email) {
        return res
          .status(400)
          .json({
            success: false,

            message:
              "Email is required",
          });
      }

      const normalizedEmail =
        String(email)
          .trim()
          .toLowerCase();

      const seller =
        await Seller.findOne({
          email:
            normalizedEmail,
        });

      if (!seller) {
        return res
          .status(404)
          .json({
            success: false,

            message:
              "Seller account not found",
          });
      }

      // ================================
      // APPROVAL CHECK
      // ================================

      if (
        seller.applicationStatus !==
        "APPROVED"
      ) {
        return res
          .status(403)
          .json({
            success: false,

            message:
              "Your seller application is not approved yet",

            applicationStatus:
              seller.applicationStatus,
          });
      }

      // ================================
      // ACTIVE ACCOUNT
      // ================================

      if (
        seller.accountStatus !==
        "ACTIVE"
      ) {
        return res
          .status(403)
          .json({
            success: false,

            message:
              `Seller account is ${seller.accountStatus}`,
          });
      }

      // ================================
      // EMAIL VERIFIED
      // ================================

      if (
        !seller.emailVerification
          ?.isVerified
      ) {
        return res
          .status(403)
          .json({
            success: false,

            message:
              "Email is not verified",
          });
      }

      // ================================
      // GENERATE OTP
      // ================================

      const otp =
        generateOtp();

      seller.loginOtp = {
        otpHash:
          hashOtp(
            otp
          ),

        otpExpiresAt:
          otpExpiry(
            10
          ),
      };

      await seller.save();

      // ================================
      // SEND LOGIN OTP EMAIL
      // ================================

      await sendSellerLoginOtpEmail({
        to:
          seller.email,

        name:
          seller.name,

        otp,
      });

      return res
        .status(200)
        .json({
          success: true,

          message:
            "Login OTP sent to your email.",

          data: {
            email:
              seller.email,

            expiresIn:
              "10 minutes",
          },
        });
    } catch (
      error
    ) {
      console.error(
        "SEND SELLER LOGIN OTP ERROR:",
        error
      );

      return res
        .status(500)
        .json({
          success: false,

          message:
            error?.message ||
            "Unable to send login OTP",
        });
    }
  };


// ======================================================
// VERIFY LOGIN OTP
// POST /api/sellers/auth/login-with-otp
// ======================================================

export const sellerLoginWithOtp =
  async (
    req,
    res
  ) => {
    try {
      const {
        email,
        otp,
      } = req.body || {};

      if (
        !email ||
        !otp
      ) {
        return res
          .status(400)
          .json({
            success: false,

            message:
              "Email and OTP are required",
          });
      }

      const normalizedEmail =
        String(email)
          .trim()
          .toLowerCase();

      const seller =
        await Seller.findOne({
          email:
            normalizedEmail,
        }).select(
          "+loginOtp.otpHash +loginOtp.otpExpiresAt"
        );

      if (!seller) {
        return res
          .status(404)
          .json({
            success: false,

            message:
              "Seller account not found",
          });
      }

      // ================================
      // APPROVED
      // ================================

      if (
        seller.applicationStatus !==
        "APPROVED"
      ) {
        return res
          .status(403)
          .json({
            success: false,

            message:
              "Seller application is not approved",
          });
      }

      // ================================
      // ACTIVE
      // ================================

      if (
        seller.accountStatus !==
        "ACTIVE"
      ) {
        return res
          .status(403)
          .json({
            success: false,

            message:
              `Seller account is ${seller.accountStatus}`,
          });
      }

      // ================================
      // VERIFY OTP
      // ================================

      const validOtp =
        isOtpValid({
          enteredOtp:
            otp,

          otpHash:
            seller.loginOtp
              ?.otpHash,

          otpExpiresAt:
            seller.loginOtp
              ?.otpExpiresAt,
        });

      if (!validOtp) {
        return res
          .status(400)
          .json({
            success: false,

            message:
              "Invalid or expired OTP",
          });
      }

      // ================================
      // SINGLE USE OTP
      // ================================

      seller.loginOtp.otpHash =
        null;

      seller.loginOtp.otpExpiresAt =
        null;

      seller.lastLoginAt =
        new Date();

      await seller.save();

      // ================================
      // TOKEN
      // ================================

      const token =
        signSellerToken(
          seller
        );

      return res
        .status(200)
        .json({
          success: true,

          message:
            "Login successful",

          token,

          data: {
            id:
              seller._id,

            sellerId:
              seller.sellerId,

            name:
              seller.name,

            email:
              seller.email,

            role:
              seller.role,

            mustChangePassword:
              seller.mustChangePassword,
          },
        });
    } catch (
      error
    ) {
      console.error(
        "SELLER OTP LOGIN ERROR:",
        error
      );

      return res
        .status(500)
        .json({
          success: false,

          message:
            "Unable to login with OTP",
        });
    }
  };


// ======================================================
// CHANGE PASSWORD
// PATCH /api/sellers/auth/change-password
// ======================================================

export const changeSellerPassword =
  async (
    req,
    res
  ) => {
    try {
      const sellerId =
        req.user?._id ||
        req.user?.id;

      const {
        currentPassword,
        newPassword,
      } = req.body || {};

      if (
        !currentPassword ||
        !newPassword
      ) {
        return res
          .status(400)
          .json({
            success: false,

            message:
              "Current password and new password are required",
          });
      }

      if (
        String(
          newPassword
        ).length < 8
      ) {
        return res
          .status(400)
          .json({
            success: false,

            message:
              "New password must be at least 8 characters",
          });
      }

      const seller =
        await Seller.findById(
          sellerId
        ).select(
          "+password"
        );

      if (
        !seller ||
        !seller.password
      ) {
        return res
          .status(404)
          .json({
            success: false,

            message:
              "Seller not found",
          });
      }

      const currentValid =
        await bcrypt.compare(
          currentPassword,
          seller.password
        );

      if (
        !currentValid
      ) {
        return res
          .status(400)
          .json({
            success: false,

            message:
              "Current password is incorrect",
          });
      }

      seller.password =
        await bcrypt.hash(
          newPassword,
          12
        );

      seller.mustChangePassword =
        false;

      seller.lastPasswordChangedAt =
        new Date();

      seller.verificationHistory.push({
        action:
          "PASSWORD_CHANGED",

        remarks:
          "Seller changed account password",

        updatedBy: {
          userId:
            seller._id,

          name:
            seller.name,

          role:
            "Seller",
        },
      });

      await seller.save();

      return res.json({
        success: true,

        message:
          "Password changed successfully",
      });
    } catch (
      error
    ) {
      console.error(
        "CHANGE SELLER PASSWORD ERROR:",
        error
      );

      return res
        .status(500)
        .json({
          success: false,

          message:
            "Unable to change password",
        });
    }
  };