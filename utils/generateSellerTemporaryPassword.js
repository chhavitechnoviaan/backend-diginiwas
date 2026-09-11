import crypto from "crypto";

const SPECIALS = "!@#$%&*";
const LETTERS = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
const DIGITS = "23456789";
const ALL = `${LETTERS}${DIGITS}${SPECIALS}`;

const randomChar = (source) =>
  source[crypto.randomInt(0, source.length)];

const shuffle = (value) => {
  const chars = value.split("");

  for (let i = chars.length - 1; i > 0; i -= 1) {
    const j = crypto.randomInt(0, i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }

  return chars.join("");
};

/**
 * Requirement:
 * - temporary credential is emailed only after admin approval
 * - random combination is 6 characters
 * - it contains letters, a number and a special character
 * - seller must change it after first login
 *
 * Final password format:
 * <first-name>@<6-character-random-combination>
 *
 * Example shape only: Rahul@A7#kP2
 */
export const generateSellerTemporaryPassword = (name = "Seller") => {
  const cleanName =
    String(name)
      .trim()
      .split(/\s+/)[0]
      .replace(/[^a-zA-Z]/g, "") || "Seller";

  let randomPart =
    randomChar(LETTERS) +
    randomChar(LETTERS) +
    randomChar(DIGITS) +
    randomChar(SPECIALS);

  while (randomPart.length < 6) {
    randomPart += randomChar(ALL);
  }

  return `${cleanName}@${shuffle(randomPart)}`;
};
