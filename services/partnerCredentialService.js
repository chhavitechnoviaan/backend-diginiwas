import crypto from "crypto";
import bcrypt from "bcryptjs";

const LETTERS = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
const NUMBERS = "23456789";
const SPECIALS = "!@#$%";
const ALL = LETTERS + NUMBERS + SPECIALS;
const pick = (source) => source[crypto.randomInt(0, source.length)];

export const generateSixCharacterTemporaryPassword = () => {
  const chars = [pick(LETTERS), pick(NUMBERS), pick(SPECIALS)];
  while (chars.length < 6) chars.push(pick(ALL));
  for (let i = chars.length - 1; i > 0; i--) {
    const j = crypto.randomInt(0, i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join("");
};

export const generateNameBasedTemporaryPassword = (name = "Partner") => {
  const prefix = String(name)
    .trim()
    .split(/\s+/)[0]
    .replace(/[^A-Za-z]/g, "")
    .slice(0, 8) || "Partner";

  return `${prefix}${generateSixCharacterTemporaryPassword()}`;
};

export const hashPassword = (plain) => bcrypt.hash(plain, 12);
export const comparePassword = (plain, hash) => bcrypt.compare(plain, hash);
export const generateOtp = () => String(crypto.randomInt(100000, 1000000));
export const hashOtp = (otp) => crypto.createHash("sha256").update(String(otp)).digest("hex");
export const verifyOtpHash = (otp, hash) => hashOtp(otp) === hash;
