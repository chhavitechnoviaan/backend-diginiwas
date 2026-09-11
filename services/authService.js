// import bcrypt from 'bcryptjs';
// import jwt from 'jsonwebtoken';
// import Buyer from '../models/Buyer.js';
// import Seller from '../models/Seller.js';
// import Partner from '../models/Partner.js';

// const getModelByRole = (role) => {
//   const normalizedRole = role ? role.toLowerCase() : '';
//   if (normalizedRole === 'buyer' || normalizedRole === 'tenant') return Buyer;
//   if (normalizedRole === 'seller' || normalizedRole === 'owner') return Seller;
//   if (normalizedRole === 'partner') return Partner;
//   throw new Error('Invalid role specified');
// };

// class AuthService {
//   // 1. User Registration with Location
//   async registerUser({ name, email, phone, password, role, location }) {
//     const Model = getModelByRole(role);

//     // Explicit Duplication Checks
//     const existingPhone = await Model.findOne({ phone });
//     if (existingPhone) {
//       throw new Error('Phone number is already registered');
//     }

//     const existingEmail = await Model.findOne({ email });
//     if (existingEmail) {
//       throw new Error('Email address is already registered');
//     }

//     // Password Hashing
//     const hashedPassword = await bcrypt.hash(password, 10);

//     // Format Location Data safely
//     const formattedLocation = {
//       city: location?.city || '',
//       state: location?.state || '',
//       country: location?.country || 'India',
//       address: location?.address || '',
//       coordinates: {
//         type: 'Point',
//         // GeoJSON uses [Longitude, Latitude] format
//         coordinates: [
//           Number(location?.longitude) || 0,
//           Number(location?.latitude) || 0
//         ]
//       }
//     };

//     const newUser = new Model({
//       name,
//       email,
//       phone,
//       password: hashedPassword,
//       role: role.toLowerCase(),
//       location: formattedLocation
//     });

//     await newUser.save();
//     return newUser;
//   }

//   // 2. Password Login
//   async loginWithPassword({ phone, password, role }) {
//     const Model = getModelByRole(role);

//     const user = await Model.findOne({ phone });
//     if (!user) {
//       throw new Error('User not found');
//     }

//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) {
//       throw new Error('Invalid credentials');
//     }

//     const token = jwt.sign(
//       { userId: user._id, role: user.role },
//       process.env.JWT_SECRET || 'secretKey',
//       { expiresIn: '7d' }
//     );

//     return { user, token };
//   }

//   // 3. Send OTP
//   async sendOTP({ phone, role }) {
//     const Model = getModelByRole(role);

//     const user = await Model.findOne({ phone });
//     if (!user) {
//       throw new Error('User not found with this phone number');
//     }

//     const otp = Math.floor(100000 + Math.random() * 900000).toString();
//     const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

//     user.otp = otp;
//     user.otpExpiresAt = otpExpiresAt;
//     await user.save();

//     return { phone, otp };
//   }

//   // 4. OTP Login
//   async loginWithOTP({ phone, otp, role }) {
//     const Model = getModelByRole(role);

//     const user = await Model.findOne({ phone });
//     if (!user) {
//       throw new Error('User not found');
//     }

//     if (!user.otp || user.otp !== otp) {
//       throw new Error('Invalid OTP');
//     }

//     if (new Date() > new Date(user.otpExpiresAt)) {
//       throw new Error('OTP has expired');
//     }

//     user.otp = null;
//     user.otpExpiresAt = null;
//     user.isPhoneVerified = true;
//     await user.save();

//     const token = jwt.sign(
//       { userId: user._id, role: user.role },
//       process.env.JWT_SECRET || 'secretKey',
//       { expiresIn: '7d' }
//     );

//     return { user, token };
//   }
// }

// export default new AuthService();

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import Buyer from "../models/Buyer.js";
import Seller from "../models/Seller.js";
import Partner from "../models/Partner.js";


const getModelByRole = (role) => {
  const normalizedRole =
    role?.toLowerCase() || "";

  if (
    normalizedRole === "buyer" ||
    normalizedRole === "tenant"
  ) {
    return Buyer;
  }

  if (
    normalizedRole === "seller" ||
    normalizedRole === "owner"
  ) {
    return Seller;
  }

  if (normalizedRole === "partner") {
    return Partner;
  }

  throw new Error(
    "Invalid role specified"
  );
};


// ======================================================
// UNIQUE ID GENERATOR
// ======================================================

const generateUniqueId = async (
  Model,
  field,
  prefix
) => {
  let unique = false;
  let generatedId = "";

  while (!unique) {
    const randomNumber =
      Math.floor(
        100000 +
          Math.random() * 900000
      );

    generatedId =
      `${prefix}${randomNumber}`;

    const existing =
      await Model.findOne({
        [field]: generatedId,
      });

    if (!existing) {
      unique = true;
    }
  }

  return generatedId;
};


class AuthService {

  // ======================================================
  // REGISTER
  // ======================================================

  async registerUser({
    name,
    email,
    phone,
    password,
    role,
    location,
    partnerType,
  }) {
    const Model =
      getModelByRole(role);

    const normalizedRole =
      role.toLowerCase();

    // ==========================================
    // DUPLICATE PHONE
    // ==========================================

    const existingPhone =
      await Model.findOne({
        phone,
      });

    if (existingPhone) {
      throw new Error(
        "Phone number is already registered"
      );
    }

    // ==========================================
    // DUPLICATE EMAIL
    // ==========================================

    const existingEmail =
      await Model.findOne({
        email,
      });

    if (existingEmail) {
      throw new Error(
        "Email address is already registered"
      );
    }

    // ==========================================
    // PASSWORD HASH
    // ==========================================

    const hashedPassword =
      await bcrypt.hash(
        password,
        10
      );

    // ==========================================
    // LOCATION
    // ==========================================

    const formattedLocation = {
      city:
        location?.city || "",

      state:
        location?.state || "",

      country:
        location?.country ||
        "India",

      address:
        location?.address || "",

      coordinates: {
        type: "Point",

        // MongoDB GeoJSON:
        // [longitude, latitude]
        coordinates: [
          Number(
            location?.longitude
          ) || 0,

          Number(
            location?.latitude
          ) || 0,
        ],
      },
    };

    // ==========================================
    // COMMON DATA
    // ==========================================

    const userData = {
      name,
      email,
      phone,
      password:
        hashedPassword,
      role:
        normalizedRole,
      location:
        formattedLocation,
    };

    // ==========================================
    // SELLER ID
    // ==========================================

    if (
      normalizedRole ===
        "seller" ||
      normalizedRole ===
        "owner"
    ) {
      userData.sellerId =
        await generateUniqueId(
          Seller,
          "sellerId",
          "SEL-"
        );
    }

    // ==========================================
    // PARTNER ID + TYPE
    // ==========================================

    if (
      normalizedRole ===
      "partner"
    ) {
      userData.partnerId =
        await generateUniqueId(
          Partner,
          "partnerId",
          "PTR-"
        );

      userData.partnerType =
        partnerType.toLowerCase();
    }

    // ==========================================
    // CREATE USER
    // ==========================================

    const newUser =
      new Model(userData);

    await newUser.save();

    return newUser;
  }


  // ======================================================
  // PASSWORD LOGIN
  // ======================================================

  async loginWithPassword({
    phone,
    password,
    role,
  }) {
    const Model =
      getModelByRole(role);

    const user =
      await Model.findOne({
        phone,
      });

    if (!user) {
      throw new Error(
        "User not found"
      );
    }

    const isMatch =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!isMatch) {
      throw new Error(
        "Invalid credentials"
      );
    }

    const token =
      jwt.sign(
        {
          userId: user._id,
          role: user.role,
        },

        process.env.JWT_SECRET ||
          "secretKey",

        {
          expiresIn: "7d",
        }
      );

    return {
      user,
      token,
    };
  }


  // ======================================================
  // SEND OTP
  // ======================================================

  async sendOTP({
    phone,
    role,
  }) {
    const Model =
      getModelByRole(role);

    const user =
      await Model.findOne({
        phone,
      });

    if (!user) {
      throw new Error(
        "User not found with this phone number"
      );
    }

    const otp =
      Math.floor(
        100000 +
          Math.random() * 900000
      ).toString();

    const otpExpiresAt =
      new Date(
        Date.now() +
          10 * 60 * 1000
      );

    user.otp = otp;

    user.otpExpiresAt =
      otpExpiresAt;

    await user.save();

    return {
      phone,
      otp,
    };
  }


  // ======================================================
  // OTP LOGIN
  // ======================================================

  async loginWithOTP({
    phone,
    otp,
    role,
  }) {
    const Model =
      getModelByRole(role);

    const user =
      await Model.findOne({
        phone,
      });

    if (!user) {
      throw new Error(
        "User not found"
      );
    }

    if (
      !user.otp ||
      user.otp !== otp
    ) {
      throw new Error(
        "Invalid OTP"
      );
    }

    if (
      new Date() >
      new Date(
        user.otpExpiresAt
      )
    ) {
      throw new Error(
        "OTP has expired"
      );
    }

    user.otp = null;

    user.otpExpiresAt =
      null;

    user.isPhoneVerified =
      true;

    await user.save();

    const token =
      jwt.sign(
        {
          userId: user._id,
          role: user.role,
        },

        process.env.JWT_SECRET ||
          "secretKey",

        {
          expiresIn: "7d",
        }
      );

    return {
      user,
      token,
    };
  }
}


export default new AuthService();