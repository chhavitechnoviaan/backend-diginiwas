// import User from '../../models/User.js'; // Model file ka extension (.js) zaroori hai
// import jwt from 'jsonwebtoken';

// export const login = async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     // 1. Check if email and password exist
//     if (!email || !password) {
//       return res.status(400).json({ message: 'Please provide email and password' });
//     }

//     // 2. Check if user exists & password is correct
//     const user = await User.findOne({ email });
//     if (!user || !(await user.comparePassword(password))) {
//       return res.status(401).json({ message: 'Incorrect email or password' });
//     }

//     // 3. Generate JWT Token (Fix: user._index ki jagah user._id kar diya hai)
//     const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'fallback_secret', {
//       expiresIn: '1d'
//     });

//     res.status(200).json({
//       status: 'success',
//       token,
//       user: {
//         id: user._id,
//         name: user.name,
//         email: user.email,
//         role: user.role, // Frontend par redirection ke liye helpful hoga
//         permissions: user.permissions
//       }
//     });
//   } catch (error) {
//     res.status(500).json({ message: 'Internal Server Error', error: error.message });
//   }
// };


import User from "../../models/User.js";
import jwt from "jsonwebtoken";

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password",
      });
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase(),
    });

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        message: "Incorrect email or password",
      });
    }

    if (user.isActive === false) {
      return res.status(403).json({
        success: false,
        message: "Your account is inactive.",
      });
    }

    // Role aur permissions ko JWT ke andar bhi add kiya
    const token = jwt.sign(
      {
        id: user._id.toString(),
        role: user.role,
        permissions: user.permissions || [],
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    return res.status(200).json({
      success: true,
      status: "success",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        permissions: user.permissions || [],
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};