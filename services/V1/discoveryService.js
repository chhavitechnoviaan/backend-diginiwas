import Buyer from "../../models/Buyer.js";
import NewProperty from "../../models/NewProperty.js";
import Partner from "../../models/Partner.js";
import CreditTransaction from "../../models/CreditTransaction.js";
import CreditSetting from "../../models/CreditSetting.js";

export const PROPERTY_PROMOTION_CODES = [
  "PROPERTY_BOOST",
  "FEATURED_7_DAYS",
  "LOCALITY_TOP_30_DAYS",
];

export const PARTNER_PROMOTION_CODES = [
  "PARTNER_BOOST",
  "PARTNER_FEATURED",
  "PARTNER_LOCALITY_TOP",
];

export const isUsableCoordinate = (value) =>
  Number.isFinite(Number(value)) && Number(value) !== 0;

export const haversineKm = (lat1, lon1, lat2, lon2) => {
  if (![lat1, lon1, lat2, lon2].every((x) => Number.isFinite(Number(x)))) return null;
  const toRad = (deg) => (Number(deg) * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(Number(lat2) - Number(lat1));
  const dLon = toRad(Number(lon2) - Number(lon1));
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

export const resolveBuyerContext = async (req) => {
  const buyer = await Buyer.findById(req.user.id).select("-password -otp -otpExpiresAt").lean();
  if (!buyer) throw Object.assign(new Error("Buyer not found"), { statusCode: 404 });

  const requestLat = Number(req.query.lat ?? req.headers["x-user-latitude"]);
  const requestLng = Number(req.query.lng ?? req.headers["x-user-longitude"]);
  const hasCurrent = isUsableCoordinate(requestLat) && isUsableCoordinate(requestLng);

  const [savedLng, savedLat] = buyer.location?.coordinates?.coordinates || [];
  const hasSaved = isUsableCoordinate(savedLat) && isUsableCoordinate(savedLng);

  return {
    buyer,
    location: {
      source: hasCurrent ? "current" : "saved",
      latitude: hasCurrent ? requestLat : hasSaved ? Number(savedLat) : null,
      longitude: hasCurrent ? requestLng : hasSaved ? Number(savedLng) : null,
      city: String(req.query.city || buyer.location?.city || "").trim(),
      state: String(buyer.location?.state || "").trim(),
      country: String(buyer.location?.country || "India").trim(),
      address: hasCurrent ? "Current location" : String(buyer.location?.address || "").trim(),
    },
  };
};

export const livePropertyFilter = {
  status: "Live",
  propertyVerificationStatus: "Verified",
};

const getPromotionDurationMap = async () => {
  const setting = await CreditSetting.findOne({ settingKey: "GLOBAL_CREDIT_SETTING" }).lean();
  const map = {};
  for (const item of setting?.products || []) map[item.code] = Number(item.durationDays || 0);
  return map;
};

export const getActivePromotionTransactions = async (codes) => {
  const durationMap = await getPromotionDurationMap();
  const txns = await CreditTransaction.find({
    productCode: { $in: codes },
    status: "SUCCESS",
    direction: "DEBIT",
    type: "PROMOTION_DEBIT",
  })
    .sort({ createdAt: -1 })
    .lean();

  const now = Date.now();
  return txns.filter((txn) => {
    const days = durationMap[txn.productCode] || Number(txn.metadata?.durationDays || 0);
    if (!days) return true;
    return new Date(txn.createdAt).getTime() + days * 86400000 > now;
  });
};

export const getPartnerPromotionMap = async () => {
  const txns = await getActivePromotionTransactions(PARTNER_PROMOTION_CODES);
  const map = new Map();
  for (const txn of txns) {
    const id = String(txn.attributedPartnerId || txn.walletOwnerPartnerId || "");
    if (!id) continue;
    const current = map.get(id) || { boost: false, featured: false, localityTop: false, codes: [] };
    if (txn.productCode === "PARTNER_BOOST") current.boost = true;
    if (txn.productCode === "PARTNER_FEATURED") current.featured = true;
    if (txn.productCode === "PARTNER_LOCALITY_TOP") current.localityTop = true;
    if (!current.codes.includes(txn.productCode)) current.codes.push(txn.productCode);
    map.set(id, current);
  }
  return map;
};

export const propertyPromotionInfo = (property, now = new Date()) => {
  const active = (node) =>
    Boolean(node?.isActive) && (!node?.expiresAt || new Date(node.expiresAt) > now);
  const boost = active(property.promotions?.boost);
  const featured = active(property.promotions?.featured);
  const localityTop = active(property.promotions?.localityTop);
  return {
    boost,
    featured,
    localityTop,
    sponsored: boost || featured || localityTop,
    score: (localityTop ? 30 : 0) + (featured ? 20 : 0) + (boost ? 10 : 0),
  };
};

export const rankProperties = (items, location) =>
  items
    .map((p) => {
      const promotion = propertyPromotionInfo(p);
      const distanceKm =
        location.latitude != null && location.longitude != null
          ? haversineKm(location.latitude, location.longitude, p.latitude, p.longitude)
          : null;
      const sameCity =
        location.city && p.city && location.city.toLowerCase() === String(p.city).toLowerCase();
      return { ...p, promotion, distanceKm, sameCity };
    })
    .sort((a, b) => {
      if (a.sameCity !== b.sameCity) return a.sameCity ? -1 : 1;
      if (b.promotion.score !== a.promotion.score) return b.promotion.score - a.promotion.score;
      if (a.distanceKm != null && b.distanceKm != null && a.distanceKm !== b.distanceKm)
        return a.distanceKm - b.distanceKm;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

export const getRankedLiveProperties = async (location, extraFilter = {}, limit = 20) => {
  const rows = await NewProperty.find({ ...livePropertyFilter, ...extraFilter }).lean();
  return rankProperties(rows, location).slice(0, limit);
};

export const rankPartners = async (items, location) => {
  const promotionMap = await getPartnerPromotionMap();
  return items
    .map((partner) => {
      const promoFromTxn = promotionMap.get(String(partner._id)) || {};
      const active = (node) =>
        Boolean(node?.isActive) && (!node?.expiresAt || new Date(node.expiresAt) > new Date());
      const promotion = {
        boost: active(partner.promotions?.boost) || Boolean(promoFromTxn.boost),
        featured: active(partner.promotions?.featured) || Boolean(promoFromTxn.featured),
        localityTop: active(partner.promotions?.localityTop) || Boolean(promoFromTxn.localityTop),
      };
      promotion.codes = [
        ...(promotion.boost ? ["PARTNER_BOOST"] : []),
        ...(promotion.featured ? ["PARTNER_FEATURED"] : []),
        ...(promotion.localityTop ? ["PARTNER_LOCALITY_TOP"] : []),
      ];
      promotion.score =
        (promotion.localityTop ? 30 : 0) + (promotion.featured ? 20 : 0) + (promotion.boost ? 10 : 0);

      const [lng, lat] = partner.location?.coordinates?.coordinates || [];
      const validPartnerCoords = isUsableCoordinate(lat) && isUsableCoordinate(lng);
      const distanceKm =
        validPartnerCoords && location.latitude != null && location.longitude != null
          ? haversineKm(location.latitude, location.longitude, lat, lng)
          : null;
      const sameCity =
        location.city && partner.location?.city &&
        location.city.toLowerCase() === String(partner.location.city).toLowerCase();
      const serviceLocalityMatch = (partner.location?.serviceLocalities || []).some((x) =>
        String(location.address || "").toLowerCase().includes(String(x).toLowerCase()),
      );
      return { ...partner, promotion, distanceKm, sameCity, serviceLocalityMatch };
    })
    .sort((a, b) => {
      if (a.sameCity !== b.sameCity) return a.sameCity ? -1 : 1;
      if (a.serviceLocalityMatch !== b.serviceLocalityMatch) return a.serviceLocalityMatch ? -1 : 1;
      if (b.promotion.score !== a.promotion.score) return b.promotion.score - a.promotion.score;
      if (a.distanceKm != null && b.distanceKm != null && a.distanceKm !== b.distanceKm)
        return a.distanceKm - b.distanceKm;
      return new Date(b.verifiedAt || b.createdAt) - new Date(a.verifiedAt || a.createdAt);
    });
};
