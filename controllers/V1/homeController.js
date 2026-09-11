import HeroSection from "../../models/HeroSection.js";
import NewProperty from "../../models/NewProperty.js";
import Partner from "../../models/Partner.js";
import Notification from "../../models/Notification.js";
import {
  getRankedLiveProperties,
  rankPartners,
  resolveBuyerContext,
  livePropertyFilter,
  rankProperties,
  propertyPromotionInfo,
} from "../../services/V1/discoveryService.js";

const ok = (res, data, message = "Success") => res.status(200).json({ success: true, message, data });
const fail = (res, error) => {
  console.error(error);
  return res.status(error.statusCode || 500).json({ success: false, message: error.message || "Server error" });
};

const greetingForNow = () => {
  const hour = Number(new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    hour12: false,
  }).format(new Date()));
  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  return "Good Evening";
};

const propertyCard = (p) => ({
  _id: p._id,
  propertyId: p.propertyId,
  title: p.title,
  transactionType: p.transactionType,
  category: p.category,
  price: p.price,
  pricePerSqft: p.pricePerSqft,
  city: p.city,
  locality: p.locality,
  address: p.address,
  latitude: p.latitude,
  longitude: p.longitude,
  bedrooms: p.bedrooms,
  bathrooms: p.bathrooms,
  furnishing: p.furnishing,
  images: p.images || [],
  createdAt: p.createdAt,
  promotion: p.promotion || propertyPromotionInfo(p),
  distanceKm: p.distanceKm == null ? null : Number(p.distanceKm.toFixed(2)),
  sameCity: Boolean(p.sameCity),
});

const agentCard = (a) => ({
  _id: a._id,
  partnerId: a.partnerId,
  name: a.name,
  avatar: a.avatar || "",
  phone: a.phone,
  email: a.email,
  accountType: a.accountType,
  role: a.role,
  business: a.business,
  rera: a.rera,
  location: a.location,
  isVerified: a.isVerified,
  promotion: a.promotion || {},
  distanceKm: a.distanceKm == null ? null : Number(a.distanceKm.toFixed(2)),
  sameCity: Boolean(a.sameCity),
  serviceLocalityMatch: Boolean(a.serviceLocalityMatch),
  contact: {
    canCall: Boolean(a.phone),
    canChat: true,
    phone: a.phone,
    partnerMongoId: a._id,
  },
});

export const getDashboardHeader = async (req, res) => {
  try {
    const { buyer, location } = await resolveBuyerContext(req);
    const notifications = await Notification.find({ userId: buyer._id, userRole: "buyer" })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();
    const unreadCount = await Notification.countDocuments({
      userId: buyer._id,
      userRole: "buyer",
      isRead: false,
    });

    return ok(res, {
      greeting: `${greetingForNow()}, ${buyer.name}`,
      user: {
        _id: buyer._id,
        buyerId: buyer.buyerId,
        name: buyer.name,
        avatar: buyer.avatar || "",
      },
      location,
      unreadNotificationsCount: unreadCount,
      notifications,
    }, "Dashboard header loaded");
  } catch (error) {
    return fail(res, error);
  }
};

const buildCategoryFilter = (tab, category) => {
  if (category) return { category };
  switch (String(tab || "").toLowerCase()) {
    case "buy":
      return { transactionType: "Sale", category: { $in: ["Residential", "Sell"] } };
    case "rent":
      return { $or: [{ transactionType: "Rent" }, { category: "Rental" }] };
    case "plot":
      return { category: "Plot/Land" };
    case "commercial":
      return { category: "Commercial" };
    default:
      return {};
  }
};

export const getPropertyCategories = async (req, res) => {
  try {
    const { location } = await resolveBuyerContext(req);
    const filter = buildCategoryFilter(req.query.tab, req.query.category);
    const limit = Math.min(Number(req.query.limit || 20), 50);
    const properties = await getRankedLiveProperties(location, filter, limit);

    const counts = await NewProperty.aggregate([
      { $match: livePropertyFilter },
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    return ok(res, {
      location,
      tabs: ["Buy", "Rent", "Plot", "Commercial"],
      categories: ["Residential", "Commercial", "Rental", "Sell", "Plot/Land"].map((name) => ({
        name,
        count: counts.find((x) => x._id === name)?.count || 0,
      })),
      selected: { tab: req.query.tab || null, category: req.query.category || null },
      properties: properties.map(propertyCard),
    }, "Property categories loaded");
  } catch (error) {
    return fail(res, error);
  }
};

export const getBoostedProperties = async (req, res) => {
  try {
    const { location } = await resolveBuyerContext(req);
    const now = new Date();
    const rows = await NewProperty.find({
      ...livePropertyFilter,
      $or: [
        { "promotions.boost.isActive": true, $or: [{ "promotions.boost.expiresAt": null }, { "promotions.boost.expiresAt": { $gt: now } }] },
        { "promotions.featured.isActive": true, $or: [{ "promotions.featured.expiresAt": null }, { "promotions.featured.expiresAt": { $gt: now } }] },
        { "promotions.localityTop.isActive": true, $or: [{ "promotions.localityTop.expiresAt": null }, { "promotions.localityTop.expiresAt": { $gt: now } }] },
      ],
    }).lean();

    const ranked = rankProperties(rows, location).slice(0, Math.min(Number(req.query.limit || 20), 50));
    return ok(res, { location, count: ranked.length, properties: ranked.map(propertyCard) }, "Boosted properties loaded");
  } catch (error) {
    return fail(res, error);
  }
};

export const getNewListings = async (req, res) => {
  try {
    const { location } = await resolveBuyerContext(req);
    const limit = Math.min(Number(req.query.limit || 20), 50);
    const rows = await NewProperty.find(livePropertyFilter).sort({ createdAt: -1 }).limit(200).lean();
    const ranked = rankProperties(rows, location)
      .sort((a, b) => {
        if (a.sameCity !== b.sameCity) return a.sameCity ? -1 : 1;
        return new Date(b.createdAt) - new Date(a.createdAt);
      })
      .slice(0, limit)
      .map((p) => {
        const ageMs = Date.now() - new Date(p.createdAt).getTime();
        const mins = Math.max(0, Math.floor(ageMs / 60000));
        const listedAgo = mins < 60 ? `${mins} min ago` : mins < 1440 ? `${Math.floor(mins / 60)} hours ago` : `${Math.floor(mins / 1440)} days ago`;
        return { ...propertyCard(p), listedAgo };
      });
    return ok(res, { location, count: ranked.length, properties: ranked }, "New listings loaded");
  } catch (error) {
    return fail(res, error);
  }
};

// export const getPopularLocations = async (req, res) => {
//   try {
//     const { location } = await resolveBuyerContext(req);
//     const rows = await NewProperty.find(livePropertyFilter).select("city locality price images promotions createdAt").lean();
//     const map = new Map();
//     for (const p of rows) {
//       const key = `${String(p.city || "").toLowerCase()}|${String(p.locality || "").toLowerCase()}`;
//       if (!key || key === "|") continue;
//       const item = map.get(key) || { city: p.city, locality: p.locality, propertyCount: 0, promotedCount: 0, sampleImage: p.images?.[0]?.url || "" };
//       item.propertyCount += 1;
//       if (propertyPromotionInfo(p).sponsored) item.promotedCount += 1;
//       if (!item.sampleImage && p.images?.[0]?.url) item.sampleImage = p.images[0].url;
//       map.set(key, item);
//     }
//     const areas = [...map.values()]
//       .sort((a, b) => {
//         const aCity = location.city && String(a.city).toLowerCase() === location.city.toLowerCase();
//         const bCity = location.city && String(b.city).toLowerCase() === location.city.toLowerCase();
//         if (aCity !== bCity) return aCity ? -1 : 1;
//         if (b.promotedCount !== a.promotedCount) return b.promotedCount - a.promotedCount;
//         return b.propertyCount - a.propertyCount;
//       })
//       .slice(0, Math.min(Number(req.query.limit || 15), 50));
//     return ok(res, { title: `Popular${location.city ? ` near ${location.city}` : " locations"}`, location, areas }, "Popular locations loaded");
//   } catch (error) {
//     return fail(res, error);
//   }
// };

export const getPopularLocations = async (req, res) => {
  try {
    const { location } = await resolveBuyerContext(req);

    const rows = await NewProperty.find(livePropertyFilter)
      .select(
        "_id propertyId title city locality price images promotions createdAt"
      )
      .lean();

    const map = new Map();

    for (const p of rows) {
      const key = `${String(p.city || "").toLowerCase()}|${String(
        p.locality || ""
      ).toLowerCase()}`;

      if (!key || key === "|") continue;

      const item = map.get(key) || {
        city: p.city,
        locality: p.locality,
        propertyCount: 0,
        promotedCount: 0,
        sampleImage: p.images?.[0]?.url || "",
        properties: [],
      };

      // total properties in this locality
      item.propertyCount += 1;

      // promoted property count
      if (propertyPromotionInfo(p).sponsored) {
        item.promotedCount += 1;
      }

      // first available property image
      if (!item.sampleImage && p.images?.[0]?.url) {
        item.sampleImage = p.images[0].url;
      }

      // property details
      item.properties.push({
        mongoId: p._id,
        _id: p._id,
        propertyId: p.propertyId,
        title: p.title,
        price: p.price,
        image: p.images?.[0]?.url || "",
      });

      map.set(key, item);
    }

    const areas = [...map.values()]
      .sort((a, b) => {
        const aCity =
          location.city &&
          String(a.city || "").toLowerCase() ===
            String(location.city).toLowerCase();

        const bCity =
          location.city &&
          String(b.city || "").toLowerCase() ===
            String(location.city).toLowerCase();

        // logged-in/current user city first
        if (aCity !== bCity) {
          return aCity ? -1 : 1;
        }

        // promoted locality first
        if (b.promotedCount !== a.promotedCount) {
          return b.promotedCount - a.promotedCount;
        }

        // then locality having more properties
        return b.propertyCount - a.propertyCount;
      })
      .slice(
        0,
        Math.min(Number(req.query.limit || 15), 50)
      );

    return ok(
      res,
      {
        title: `Popular${
          location.city
            ? ` near ${location.city}`
            : " locations"
        }`,
        location,
        areas,
      },
      "Popular locations loaded"
    );
  } catch (error) {
    return fail(res, error);
  }
};

export const getNearbyAgents = async (req, res) => {
  try {
    const { location } = await resolveBuyerContext(req);
    const agents = await Partner.find({
      isVerified: true,
      isApproved: true,
      isBlocked: false,
      isRejected: false,
      applicationStatus: "Verified",
    }).select("-password -identityDocuments -emailVerification.otpHash -phoneVerification.otpHash").lean();
    const ranked = (await rankPartners(agents, location)).slice(0, Math.min(Number(req.query.limit || 20), 50));
    return ok(res, { location, count: ranked.length, agents: ranked.map(agentCard) }, "Nearby verified agents loaded");
  } catch (error) {
    return fail(res, error);
  }
};

export const getHomeFeed = async (req, res) => {
  try {
    const { location } = await resolveBuyerContext(req);
    const [hero, allLive, agents] = await Promise.all([
      HeroSection.findOne({ isActive: true }).lean(),
      NewProperty.find(livePropertyFilter).lean(),
      Partner.find({ isVerified: true, isApproved: true, isBlocked: false, isRejected: false, applicationStatus: "Verified" })
        .select("-password -identityDocuments -emailVerification.otpHash -phoneVerification.otpHash")
        .lean(),
    ]);

    const rankedProperties = rankProperties(allLive, location);
    const sponsored = rankedProperties.filter((p) => p.promotion.sponsored);
    const rankedAgents = await rankPartners(agents, location);

    const areaMap = new Map();
    for (const p of rankedProperties) {
      const key = `${p.city}|${p.locality}`;
      const item = areaMap.get(key) || { city: p.city, locality: p.locality, propertyCount: 0, image: p.images?.[0]?.url || "" };
      item.propertyCount += 1;
      areaMap.set(key, item);
    }
    const popularAreas = [...areaMap.values()].sort((a, b) => {
      const aCity = location.city && String(a.city).toLowerCase() === location.city.toLowerCase();
      const bCity = location.city && String(b.city).toLowerCase() === location.city.toLowerCase();
      if (aCity !== bCity) return aCity ? -1 : 1;
      return b.propertyCount - a.propertyCount;
    }).slice(0, 10);

    const heroImages = [hero?.heroImage1?.url, hero?.heroImage2?.url, hero?.heroImage3?.url].filter(Boolean);
    const propertyBanners = sponsored.slice(0, 5).map((p) => ({
      type: "PROPERTY_PROMOTION",
      image: p.images?.[0]?.url || "",
      title: p.title,
      propertyId: p.propertyId,
      promotion: p.promotion,
    }));

    return ok(res, {
      location,
      banners: [
        ...heroImages.map((image) => ({ type: "CMS_HERO", image })),
        ...propertyBanners,
      ],
      recommendedProperties: rankedProperties.slice(0, 12).map(propertyCard),
      boostedProperties: sponsored.slice(0, 10).map(propertyCard),
      newListings: [...rankedProperties].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 10).map(propertyCard),
      popularAreas,
      agents: rankedAgents.slice(0, 10).map(agentCard),
    }, "Home feed loaded");
  } catch (error) {
    return fail(res, error);
  }
};
