// import Buyer from '../../models/Buyer.js'; 

// // 1. Get All Buyers (Sabi Buyers ko fetch karne ke liye)
// export const getAllBuyers = async (req, res) => {
//   try {
//     // Password, OTP aur OTP Expiry ko response me nahi bhejenge (security ke liye)
//     const buyers = await Buyer.find().select('-password -otp -otpExpiresAt');

//     return res.status(200).json({
//       success: true,
//       count: buyers.length,
//       data: buyers,
//     });
//   } catch (error) {
//     return res.status(500).json({
//       success: false,
//       message: 'Buyers fetch karne me dikkat aayi.',
//       error: error.message,
//     });
//   }
// };

// // 2. Get Single Buyer By ID (Specific Buyer ko uski ID se fetch karne ke liye)
// export const getBuyerById = async (req, res) => {
//   try {
//     const { id } = req.params;

//     // Buyer ko ID se dhundhein
//     const buyer = await Buyer.findById(id).select('-password -otp -otpExpiresAt');

//     // Agar ID se buyer na mile
//     if (!buyer) {
//       return res.status(404).json({
//         success: false,
//         message: 'Buyer nahi mila.',
//       });
//     }

//     return res.status(200).json({
//       success: true,
//       data: buyer,
//     });
//   } catch (error) {
//     // Agar invalid ObjectId ki wajah se CastError aaye
//     if (error.kind === 'ObjectId') {
//       return res.status(400).json({
//         success: false,
//         message: 'Invalid Buyer ID format.',
//       });
//     }

//     return res.status(500).json({
//       success: false,
//       message: 'Buyer Details lane me dikkat aayi.',
//       error: error.message,
//     });
//   }
// };


import mongoose from "mongoose";
import Buyer from "../../models/Buyer.js";
import Lead from "../../models/Lead.js";
import Visit from "../../models/Visit.js";
import SavedProperty from "../../models/SavedProperty.js";

const safeBuyer = (buyer) => {
  if (!buyer) return null;
  const { password, otp, otpExpiresAt, ...rest } = buyer;
  return rest;
};

export const getAllBuyers = async (req, res) => {
  try {
    const buyers = await Buyer.find()
      .select("-password -otp -otpExpiresAt")
      .sort({ createdAt: -1 })
      .lean();

    const buyerIds = buyers.map((buyer) => buyer._id);

    if (!buyerIds.length) {
      return res.status(200).json({
        success: true,
        count: 0,
        data: [],
      });
    }

    const [leadCounts, visitCounts, savedCounts] = await Promise.all([
      Lead.aggregate([
        {
          $match: {
            "buyer.buyerMongoId": { $in: buyerIds },
          },
        },
        {
          $group: {
            _id: "$buyer.buyerMongoId",
            count: { $sum: 1 },
          },
        },
      ]),

      Visit.aggregate([
        {
          $match: {
            buyerId: { $in: buyerIds },
          },
        },
        {
          $group: {
            _id: "$buyerId",
            count: { $sum: 1 },
          },
        },
      ]),

      SavedProperty.aggregate([
        {
          $match: {
            buyerId: { $in: buyerIds },
          },
        },
        {
          $group: {
            _id: "$buyerId",
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    const leadMap = new Map(
      leadCounts.map((item) => [String(item._id), item.count])
    );

    const visitMap = new Map(
      visitCounts.map((item) => [String(item._id), item.count])
    );

    const savedMap = new Map(
      savedCounts.map((item) => [String(item._id), item.count])
    );

    const data = buyers.map((buyer) => ({
      ...buyer,
      inquiries: leadMap.get(String(buyer._id)) || 0,
      leads: leadMap.get(String(buyer._id)) || 0,
      visits: visitMap.get(String(buyer._id)) || 0,
      savedProperties: savedMap.get(String(buyer._id)) || 0,
    }));

    return res.status(200).json({
      success: true,
      count: data.length,
      data,
    });
  } catch (error) {
    console.error("Get All Buyers Error:", error);

    return res.status(500).json({
      success: false,
      message: "Buyers fetch karne me dikkat aayi.",
      error: error.message,
    });
  }
};

export const getBuyerById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Buyer ID format.",
      });
    }

    const buyer = await Buyer.findById(id)
      .select("-password -otp -otpExpiresAt")
      .lean();

    if (!buyer) {
      return res.status(404).json({
        success: false,
        message: "Buyer nahi mila.",
      });
    }

    return res.status(200).json({
      success: true,
      data: buyer,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Buyer Details lane me dikkat aayi.",
      error: error.message,
    });
  }
};

export const getBuyerDashboard = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Buyer ID.",
      });
    }

    const buyer = await Buyer.findById(id)
      .select("-password -otp -otpExpiresAt")
      .lean();

    if (!buyer) {
      return res.status(404).json({
        success: false,
        message: "Buyer not found.",
      });
    }

    const [leads, visits, savedProperties] = await Promise.all([
      Lead.find({
        "buyer.buyerMongoId": buyer._id,
      })
        .sort({ createdAt: -1 })
        .lean(),

      Visit.find({
        buyerId: buyer._id,
      })
        .sort({ requestedVisitAt: -1 })
        .lean(),

      SavedProperty.find({
        buyerId: buyer._id,
      })
        .sort({ createdAt: -1 })
        .lean(),
    ]);

    const completedVisits = visits.filter(
      (item) => item.status === "Completed"
    ).length;

    const upcomingVisits = visits.filter((item) =>
      ["Requested", "Upcoming", "Rescheduled"].includes(item.status)
    ).length;

    const convertedLeads = leads.filter(
      (item) => item.status === "Successfully_Converted"
    ).length;

    const leadActivities = leads.map((lead) => ({
      id: lead._id,
      type: "lead",
      title: `Enquired about ${lead.property?.title || "property"}`,
      description: lead.enquiryMessage || `Lead ${lead.leadId || ""}`.trim(),
      status: lead.status,
      property: lead.property,
      createdAt: lead.createdAt,
    }));

    const visitActivities = visits.map((visit) => ({
      id: visit._id,
      type: "visit",
      title: `${
        visit.status === "Completed" ? "Visit completed" : "Visit scheduled"
      } for ${visit.propertySnapshot?.title || "property"}`,
      description: [
        visit.visitId,
        visit.partnerSnapshot?.name
          ? `with ${visit.partnerSnapshot.name}`
          : "",
      ]
        .filter(Boolean)
        .join(" • "),
      status: visit.status,
      property: visit.propertySnapshot,
      createdAt: visit.requestedVisitAt || visit.createdAt,
    }));

    const savedActivities = savedProperties.map((item) => ({
      id: item._id,
      type: "saved",
      title: `Saved ${item.propertySnapshot?.title || "property"}`,
      description: item.propertySnapshot?.propertyCode || "",
      property: item.propertySnapshot,
      createdAt: item.createdAt,
    }));

    const recentInteractions = [
      ...leadActivities,
      ...visitActivities,
      ...savedActivities,
    ]
      .sort(
        (a, b) =>
          new Date(b.createdAt || 0).getTime() -
          new Date(a.createdAt || 0).getTime()
      )
      .slice(0, 10);

    return res.status(200).json({
      success: true,
      data: {
        buyer: safeBuyer(buyer),
        stats: {
          searches: 0,
          enquiries: leads.length,
          leads: leads.length,
          savedProperties: savedProperties.length,
          visits: visits.length,
          completedVisits,
          upcomingVisits,
          convertedLeads,
        },
        leads,
        visits,
        savedProperties,
        recentInteractions,
      },
    });
  } catch (error) {
    console.error("Buyer Dashboard Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to get buyer dashboard.",
      error: error.message,
    });
  }
};
