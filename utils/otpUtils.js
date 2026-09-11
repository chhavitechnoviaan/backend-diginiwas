import crypto from "crypto";

export const generateOtp = () =>
  String(crypto.randomInt(100000, 1000000));

export const hashOtp = (otp) =>
  crypto
    .createHash("sha256")
    .update(String(otp))
    .digest("hex");

export const otpExpiry = (minutes = 10) =>
  new Date(Date.now() + minutes * 60 * 1000);

export const isOtpValid = ({
  enteredOtp,
  otpHash,
  otpExpiresAt,
}) => {
  if (!enteredOtp || !otpHash || !otpExpiresAt) return false;

  if (new Date(otpExpiresAt).getTime() < Date.now()) {
    return false;
  }

  return hashOtp(enteredOtp) === otpHash;
};
