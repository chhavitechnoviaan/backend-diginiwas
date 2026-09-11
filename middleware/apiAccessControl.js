import { protect, requireAdmin } from "./authMiddleware.js";

const PUBLIC_ROUTES = [
  ["POST", /^\/auth\/login\/?$/],
  ["POST", /^\/auths\/(register|login-password|send-otp|login-otp)\/?$/],
  ["POST", /^\/partner-auth\/login\/?$/],
  ["POST", /^\/partner-applications\/register\/?$/],
  ["POST", /^\/partner-applications\/[^/]+\/resend-otp\/?$/],
  ["PATCH", /^\/partner-applications\/[^/]+\/(verify-email|verify-phone)\/?$/],
  ["POST", /^\/sellers\/applications\/(register|verify-email|verify-phone|resend-email-otp|resend-phone-otp)\/?$/],
  ["POST", /^\/sellers\/auth\/(login|send-login-otp|login-with-otp)\/?$/],
  ["GET", /^\/properties(?:\/filter)?\/?$/],
  ["GET", /^\/properties\/(?!admin\/?$|all\/?$|partner\/)[^/]+\/?$/],
  ["GET", /^\/newproperties(?:\/filter)?\/?$/],
  ["GET", /^\/newproperties\/(?!admin\/?$|all\/?$|partner\/)[^/]+\/?$/],
  ["GET", /^\/cms\/(hero|round-section|testimonials|agentcorner|plan-section|agent-network|network-density|about-stats|about-genesis|about-mission-vision|about-visionaries|platform-features)(?:\/[^/]+)?\/?$/],
  ["GET", /^\/blog\/public\/?$/],
  ["GET", /^\/blog\/articles\/slug\/[^/]+\/?$/],
];

const ADMIN_ONLY_ROUTES = [
  /^\/admin(?:\/|$)/,
  /^\/partner-applications(?:\/|$)/,
  /^\/partners(?:\/|$)/,
  /^\/buyers(?:\/|$)/,
  /^\/boost-operations(?:\/|$)/,
  /^\/property-publishing(?:\/|$)/,
];

const ADMIN_ONLY_MUTATIONS = [
  /^\/cms(?:\/|$)/,
  /^\/credit-settings(?:\/|$)/,
  /^\/blog(?:\/|$)/,
];

const matches = (rules, method, path) =>
  rules.some(([allowedMethod, pattern]) =>
    allowedMethod === method && pattern.test(path)
  );

const isAdminOnly = (method, path) =>
  ADMIN_ONLY_ROUTES.some((pattern) => pattern.test(path)) ||
  (method !== "GET" &&
    ADMIN_ONLY_MUTATIONS.some((pattern) => pattern.test(path)));

export const apiAccessControl = (req, res, next) => {
  const method = req.method.toUpperCase();
  const path = req.path;

  if (matches(PUBLIC_ROUTES, method, path)) {
    return next();
  }

  return protect(req, res, () => {
    if (isAdminOnly(method, path)) {
      return requireAdmin(req, res, next);
    }

    return next();
  });
};

export const versionedApiHeaders = (_req, res, next) => {
  res.setHeader("X-API-Version", "1");
  next();
};

export const legacyApiHeaders = (_req, res, next) => {
  res.setHeader("Deprecation", "true");
  res.setHeader("Sunset", "Wed, 31 Dec 2027 23:59:59 GMT");
  res.setHeader("Link", '</api/v1>; rel="successor-version"');
  next();
};
