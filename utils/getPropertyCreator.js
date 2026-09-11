import mongoose from "mongoose";

import Seller from "../models/Seller.js";
import Partner from "../models/Partner.js";
import Admin from "../models/User.js";

export const getPropertyCreator = async (
  userId,
  role
) => {
  try {
    console.log(
      "======================================"
    );

    console.log(
      "PROPERTY CREATOR LOOKUP"
    );

    console.log(
      "Received userId:",
      userId
    );

    console.log(
      "Received role:",
      role
    );

    const normalizedRole =
      String(role || "")
        .trim()
        .toLowerCase();

    console.log(
      "Normalized role:",
      normalizedRole
    );

    // ==========================================
    // VALIDATE MONGO ID
    // ==========================================

    if (
      !mongoose.Types.ObjectId.isValid(
        userId
      )
    ) {
      console.log(
        "Invalid MongoDB ObjectId:",
        userId
      );

      return null;
    }

    let user = null;

    // ==========================================
    // ADMIN
    // ==========================================

    if (
      normalizedRole === "admin"
    ) {
      console.log(
        "Searching Admin in User collection..."
      );

      user =
        await Admin.findById(
          userId
        ).select(
          "name email phone role"
        );

      console.log(
        "Admin Found:",
        user
      );
    }

    // ==========================================
    // SELLER
    // ==========================================

    else if (
      normalizedRole === "seller" ||
      normalizedRole === "owner"
    ) {
      console.log(
        "Searching Seller..."
      );

      user =
        await Seller.findById(
          userId
        ).select(
          "sellerId name email phone role"
        );

      console.log(
        "Seller Found:",
        user
      );
    }

    // ==========================================
    // PARTNER
    // ==========================================

    else if (
      normalizedRole ===
      "partner"
    ) {
      console.log(
        "Searching Partner..."
      );

      user =
        await Partner.findById(
          userId
        ).select(
          "partnerId partnerType name email phone role"
        );

      console.log(
        "Partner Found:",
        user
      );
    }

    // ==========================================
    // INVALID ROLE
    // ==========================================

    else {
      console.log(
        "Unsupported Role:",
        normalizedRole
      );

      return null;
    }

    // ==========================================
    // USER NOT FOUND
    // ==========================================

    if (!user) {
      console.log(
        `No ${normalizedRole} found with ID ${userId}`
      );

      return null;
    }

    // ==========================================
    // RETURN CREATOR
    // ==========================================

    const creator = {
      userId:
        user._id,

      sellerId:
        user.sellerId ||
        null,

      partnerId:
        user.partnerId ||
        null,

      partnerType:
        user.partnerType ||
        null,

      role:
        normalizedRole ===
          "admin"
          ? "Admin"
          : normalizedRole ===
              "partner"
          ? "Partner"
          : "Seller",

      name:
        user.name || "",

      email:
        user.email || "",

      phone:
        user.phone || "",
    };

    console.log(
      "Final Creator:",
      creator
    );

    console.log(
      "======================================"
    );

    return creator;
  } catch (error) {
    console.error(
      "GET PROPERTY CREATOR ERROR:",
      error
    );

    return null;
  }
};