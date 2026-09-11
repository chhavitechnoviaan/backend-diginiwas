import Buyer from "../../models/Buyer.js";
import Seller from "../../models/Seller.js";
import Partner from "../../models/Partner.js";
import NewProperty from "../../models/NewProperty.js";
import Lead from "../../models/Lead.js";

const periodConfig = (period) => {
  const now = new Date();
  const istNow = new Date(now.getTime() + 330 * 60 * 1000);
  if (period === "year") {
    const start = new Date(Date.UTC(now.getUTCFullYear() - 4, 0, 1));
    return { start, format: "%Y", buckets: 5, step: "year" };
  }
  if (period === "month") {
    const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 11, 1));
    return { start, format: "%Y-%m", buckets: 12, step: "month" };
  }
  const start = new Date(istNow);
  start.setUTCHours(0, 0, 0, 0);
  start.setUTCDate(start.getUTCDate() - 6);
  return { start: new Date(start.getTime() - 330 * 60 * 1000), keyStart: start, format: "%Y-%m-%d", buckets: 7, step: "day" };
};

const bucketKeys = ({ start, keyStart, buckets, step }) => {
  const keys = [];
  for (let index = 0; index < buckets; index += 1) {
    const base = keyStart || start;
    const date = new Date(base);
    if (step === "year") date.setUTCFullYear(base.getUTCFullYear() + index);
    else if (step === "month") date.setUTCMonth(base.getUTCMonth() + index);
    else date.setUTCDate(base.getUTCDate() + index);
    keys.push(step === "year" ? String(date.getUTCFullYear()) : step === "month" ? date.toISOString().slice(0, 7) : date.toISOString().slice(0, 10));
  }
  return keys;
};

const qualityLabel = (accuracy) => {
  if (accuracy >= 80) return "Excellent";
  if (accuracy >= 60) return "Good";
  if (accuracy >= 40) return "Average";
  return "Needs Attention";
};

// GET /api/admin/dashboard/summary
export const getAdminDashboardSummary = async (req, res) => {
  try {
    const [liveProperties, activePartners, totalBuyers, totalSellers, totalPartners] =
      await Promise.all([
        NewProperty.countDocuments({ status: "Live" }),
        Partner.countDocuments({ isVerified: true, isBlocked: { $ne: true } }),
        Buyer.countDocuments({}),
        Seller.countDocuments({}),
        Partner.countDocuments({}),
      ]);

    return res.json({
      success: true,
      data: {
        liveProperties,
        activePartners,
        registeredUsers: totalBuyers + totalSellers + totalPartners,
        totalBuyers,
        totalSellers,
        totalPartners,
      },
    });
  } catch (error) {
    console.error("ADMIN DASHBOARD SUMMARY ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to load dashboard summary",
    });
  }
};

// GET /api/admin/dashboard/lead-analytics?period=day|month|year
export const getLeadAnalytics = async (req, res) => {
  try {
    const period = ["day", "month", "year"].includes(req.query.period) ? req.query.period : "day";
    const config = periodConfig(period);
    const rows = await Lead.aggregate([
      { $match: { createdAt: { $gte: config.start } } },
      { $group: {
        _id: { $dateToString: { format: config.format, date: "$createdAt", timezone: "Asia/Kolkata" } },
        received: { $sum: 1 },
        verified: { $sum: { $cond: [{ $eq: ["$leadVerificationStatus", "Verified"] }, 1, 0] } },
      } },
      { $sort: { _id: 1 } },
    ]);

    const rowMap = new Map(rows.map((row) => [row._id, row]));
    const trend = bucketKeys(config).map((key) => {
      const row = rowMap.get(key) || { received: 0, verified: 0 };
      const accuracy = row.received ? Math.round((row.verified / row.received) * 100) : 0;
      return { key, received: row.received, verified: row.verified, accuracy };
    });

    const now = new Date();
    const istToday = new Date(now.getTime() + 330 * 60 * 1000);
    istToday.setUTCHours(0, 0, 0, 0);
    const todayStart = new Date(istToday.getTime() - 330 * 60 * 1000);
    const [todayReceived, todayVerifiedFromTodayLeads, verifiedActionsToday] = await Promise.all([
      Lead.countDocuments({ createdAt: { $gte: todayStart } }),
      Lead.countDocuments({ createdAt: { $gte: todayStart }, leadVerificationStatus: "Verified" }),
      Lead.countDocuments({ "verification.verifiedAt": { $gte: todayStart } }),
    ]);
    const todayAccuracy = todayReceived ? Math.round((todayVerifiedFromTodayLeads / todayReceived) * 100) : 0;

    return res.json({
      success: true,
      data: {
        period,
        trend,
        todayQuality: {
          received: todayReceived,
          verified: todayVerifiedFromTodayLeads,
          verifiedActions: verifiedActionsToday,
          accuracy: todayAccuracy,
          label: todayReceived ? qualityLabel(todayAccuracy) : "No Data",
        },
      },
    });
  } catch (error) {
    console.error("LEAD ANALYTICS ERROR:", error);
    return res.status(500).json({ success: false, message: "Unable to load lead analytics" });
  }
};
