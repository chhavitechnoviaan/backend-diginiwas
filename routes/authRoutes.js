import express from 'express';
import {
  register,
  loginWithPassword,
  sendOTP,
  loginWithOTP
} from '../controllers/authController.js'; 

const router = express.Router();

// 1. User Registration Route
router.post('/register', register);

// 2. Password Login Route
router.post('/login-password', loginWithPassword);

// 3. Request OTP Route
router.post('/send-otp', sendOTP);

// 4. OTP Login Route
router.post('/login-otp', loginWithOTP);

export default router;