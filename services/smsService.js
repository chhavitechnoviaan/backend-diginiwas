import axios from "axios";

/**
 * Provider-neutral OTP sender.
 *
 * Production:
 * Configure SMS_API_URL + SMS_API_KEY and adapt the payload/header below
 * to your SMS vendor (MSG91, Twilio proxy, Gupshup, etc.).
 *
 * Development:
 * If SMS_API_URL is missing, OTP is logged only in non-production mode.
 */
export const sendSellerPhoneOtp = async ({
  phone,
  otp,
}) => {
  if (!process.env.SMS_API_URL) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("SMS provider is not configured");
    }

    console.log(`[DEV SELLER OTP] ${phone}: ${otp}`);
    return;
  }

  await axios.post(
    process.env.SMS_API_URL,
    {
      phone,
      otp,
      message: `Your DigiNiwas seller verification OTP is ${otp}. It expires in 10 minutes.`,
    },
    {
      headers: {
        Authorization: process.env.SMS_API_KEY
          ? `Bearer ${process.env.SMS_API_KEY}`
          : undefined,
        "Content-Type": "application/json",
      },
    }
  );
};
