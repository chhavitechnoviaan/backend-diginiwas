// import authService from '../services/authService.js';

// export const register = async (req, res) => {
//   try {
//     const { name, email, phone, password, role } = req.body;

//     if (!name || !email || !phone || !password || !role) {
//       return res.status(400).json({ success: false, message: 'All fields are required' });
//     }

//     const user = await authService.registerUser({ name, email, phone, password, role });
//     res.status(201).json({
//       success: true,
//       message: 'Registration successful',
//       data: { id: user._id, name: user.name, phone: user.phone, role: user.role }
//     });
//   } catch (error) {
//     res.status(400).json({ success: false, message: error.message });
//   }
// };

// export const loginWithPassword = async (req, res) => {
//   try {
//     const { phone, password, role } = req.body;

//     if (!phone || !password || !role) {
//       return res.status(400).json({ success: false, message: 'Phone, password and role are required' });
//     }

//     const { user, token } = await authService.loginWithPassword({ phone, password, role });
//     res.status(200).json({
//       success: true,
//       message: 'Login successful',
//       token,
//       data: { id: user._id, name: user.name, phone: user.phone, role: user.role }
//     });
//   } catch (error) {
//     res.status(401).json({ success: false, message: error.message });
//   }
// };

// export const sendOTP = async (req, res) => {
//   try {
//     const { phone, role } = req.body;

//     if (!phone || !role) {
//       return res.status(400).json({ success: false, message: 'Phone number and role are required' });
//     }

//     const result = await authService.sendOTP({ phone, role });
//     res.status(200).json({
//       success: true,
//       message: 'OTP sent successfully',
//       data: result
//     });
//   } catch (error) {
//     res.status(400).json({ success: false, message: error.message });
//   }
// };

// export const loginWithOTP = async (req, res) => {
//   try {
//     const { phone, otp, role } = req.body;

//     if (!phone || !otp || !role) {
//       return res.status(400).json({ success: false, message: 'Phone, OTP, and role are required' });
//     }

//     const { user, token } = await authService.loginWithOTP({ phone, otp, role });
//     res.status(200).json({
//       success: true,
//       message: 'OTP Login successful',
//       token,
//       data: { id: user._id, name: user.name, phone: user.phone, role: user.role }
//     });
//   } catch (error) {
//     res.status(400).json({ success: false, message: error.message });
//   }
// };


import authService from "../services/authService.js";

const isBuyerRole = (role) =>
  ["buyer", "tenant"].includes(String(role || "").trim().toLowerCase());

export const register = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      password,
      role,
      location,
      partnerType,
    } = req.body;

    if (
      !name ||
      !email ||
      !phone ||
      !password ||
      !role
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    if (!isBuyerRole(role)) {
      return res.status(400).json({
        success: false,
        message:
          "This endpoint supports buyer/tenant registration only. Use the dedicated seller or partner application API.",
      });
    }

    // Partner ke liye team/single required
    if (
      role.toLowerCase() === "partner" &&
      !partnerType
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Partner type is required: team or single",
      });
    }

    if (
      role.toLowerCase() === "partner" &&
      !["team", "single"].includes(
        partnerType.toLowerCase()
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Partner type must be team or single",
      });
    }

    const user =
      await authService.registerUser({
        name,
        email,
        phone,
        password,
        role,
        location,
        partnerType,
      });

    res.status(201).json({
      success: true,
      message: "Registration successful",
      data: {
        id: user._id,

        sellerId:
          user.sellerId || null,

        partnerId:
          user.partnerId || null,

        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,

        partnerType:
          user.partnerType || null,

        location:
          user.location || null,
      },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};


export const loginWithPassword = async (
  req,
  res
) => {
  try {
    const {
      phone,
      password,
      role,
    } = req.body;

    if (
      !phone ||
      !password ||
      !role
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Phone, password and role are required",
      });
    }

    if (!isBuyerRole(role)) {
      return res.status(400).json({
        success: false,
        message:
          "This endpoint supports buyer/tenant login only. Use the dedicated seller or partner login API.",
      });
    }

    const { user, token } =
      await authService.loginWithPassword({
        phone,
        password,
        role,
      });

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      data: {
        id: user._id,

        sellerId:
          user.sellerId || null,

        partnerId:
          user.partnerId || null,

        name: user.name,
        phone: user.phone,
        role: user.role,

        partnerType:
          user.partnerType || null,

        location:
          user.location || null,
      },
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: error.message,
    });
  }
};


export const sendOTP = async (
  req,
  res
) => {
  try {
    const { phone, role } =
      req.body;

    if (!phone || !role) {
      return res.status(400).json({
        success: false,
        message:
          "Phone number and role are required",
      });
    }

    if (!isBuyerRole(role)) {
      return res.status(400).json({
        success: false,
        message:
          "This endpoint supports buyer/tenant OTP only.",
      });
    }

    const result =
      await authService.sendOTP({
        phone,
        role,
      });

    res.status(200).json({
      success: true,
      message:
        "OTP sent successfully",
      data: result,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};


export const loginWithOTP = async (
  req,
  res
) => {
  try {
    const {
      phone,
      otp,
      role,
    } = req.body;

    if (
      !phone ||
      !otp ||
      !role
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Phone, OTP, and role are required",
      });
    }

    if (!isBuyerRole(role)) {
      return res.status(400).json({
        success: false,
        message:
          "This endpoint supports buyer/tenant OTP login only.",
      });
    }

    const { user, token } =
      await authService.loginWithOTP({
        phone,
        otp,
        role,
      });

    res.status(200).json({
      success: true,
      message:
        "OTP Login successful",
      token,
      data: {
        id: user._id,

        sellerId:
          user.sellerId || null,

        partnerId:
          user.partnerId || null,

        name: user.name,
        phone: user.phone,
        role: user.role,

        partnerType:
          user.partnerType || null,

        location:
          user.location || null,
      },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
