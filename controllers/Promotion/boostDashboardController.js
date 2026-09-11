// import mongoose from "mongoose";
// import PromotionRequest from "../../models/PromotionRequest.js";
// import CreditTransaction from "../../models/CreditTransaction.js";
// import Partner from "../../models/Partner.js";

// const normalizeStatus = (status) => {
//   if (!status || status === "All") return null;
//   return status;
// };

// const makeSearchQuery = (search = "") => {
//   const value = String(search || "").trim();

//   if (!value) return null;

//   return [
//     { requestId: { $regex: value, $options: "i" } },
//     { propertyCode: { $regex: value, $options: "i" } },
//     { propertyTitle: { $regex: value, $options: "i" } },
//     { partnerCode: { $regex: value, $options: "i" } },
//     { partnerName: { $regex: value, $options: "i" } },
//     { locality: { $regex: value, $options: "i" } },
//     { city: { $regex: value, $options: "i" } },
//   ];
// };

// export const getBoostOperationsDashboard = async (req, res) => {
//   try {
//     const {
//       status = "",
//       promotionType = "",
//       partnerId = "",
//       propertyId = "",
//       search = "",
//       page = 1,
//       limit = 50,
//     } = req.query;

//     const query = {};

//     const normalizedStatus = normalizeStatus(status);
//     if (normalizedStatus) {
//       query.status = normalizedStatus;
//     }

//     if (promotionType && promotionType !== "All") {
//       query.promotionType = promotionType;
//     }

//     if (
//       partnerId &&
//       mongoose.Types.ObjectId.isValid(partnerId)
//     ) {
//       query.partnerMongoId = partnerId;
//     }

//     if (
//       propertyId &&
//       mongoose.Types.ObjectId.isValid(propertyId)
//     ) {
//       query.propertyMongoId = propertyId;
//     }

//     const searchQuery = makeSearchQuery(search);

//     if (searchQuery) {
//       query.$or = searchQuery;
//     }

//     const safePage = Math.max(Number(page) || 1, 1);
//     const safeLimit = Math.min(
//       Math.max(Number(limit) || 50, 1),
//       100
//     );

//     const now = new Date();

//     const [
//       requests,
//       total,
//       activeBoosts,
//       expiredBoosts,
//       pendingBoosts,
//       approvedTotal,
//       creditsSpentAgg,
//       partnerStats,
//     ] = await Promise.all([
//       PromotionRequest.find(query)
//         .populate(
//           "partnerMongoId",
//           "partnerId name email phone partnerType isVerified isBlocked creditWallet location"
//         )
//         .populate(
//           "propertyMongoId",
//           "propertyId title status city locality price images boost"
//         )
//         .sort({
//           approvedAt: -1,
//           requestedAt: -1,
//           createdAt: -1,
//         })
//         .skip((safePage - 1) * safeLimit)
//         .limit(safeLimit)
//         .lean(),

//       PromotionRequest.countDocuments(query),

//       PromotionRequest.countDocuments({
//         status: "Approved",
//         $or: [
//           { expiresAt: null },
//           { expiresAt: { $gt: now } },
//         ],
//       }),

//       PromotionRequest.countDocuments({
//         $or: [
//           { status: "Expired" },
//           {
//             status: "Approved",
//             expiresAt: { $lte: now },
//           },
//         ],
//       }),

//       PromotionRequest.countDocuments({
//         status: "Pending",
//       }),

//       PromotionRequest.countDocuments({
//         status: "Approved",
//       }),

//       CreditTransaction.aggregate([
//         {
//           $match: {
//             type: "PROMOTION_DEBIT",
//             direction: "DEBIT",
//             status: {
//               $in: ["SUCCESS", "REFUNDED"],
//             },
//           },
//         },
//         {
//           $group: {
//             _id: null,
//             credits: { $sum: "$credits" },
//           },
//         },
//       ]),

//       PromotionRequest.aggregate([
//         {
//           $group: {
//             _id: "$partnerMongoId",
//             partnerCode: {
//               $first: "$partnerCode",
//             },
//             partnerName: {
//               $first: "$partnerName",
//             },
//             totalRequests: { $sum: 1 },
//             approvedBoosts: {
//               $sum: {
//                 $cond: [
//                   { $eq: ["$status", "Approved"] },
//                   1,
//                   0,
//                 ],
//               },
//             },
//             activeBoosts: {
//               $sum: {
//                 $cond: [
//                   {
//                     $and: [
//                       { $eq: ["$status", "Approved"] },
//                       {
//                         $or: [
//                           { $eq: ["$expiresAt", null] },
//                           { $gt: ["$expiresAt", now] },
//                         ],
//                       },
//                     ],
//                   },
//                   1,
//                   0,
//                 ],
//               },
//             },
//             expiredBoosts: {
//               $sum: {
//                 $cond: [
//                   {
//                     $or: [
//                       { $eq: ["$status", "Expired"] },
//                       {
//                         $and: [
//                           { $eq: ["$status", "Approved"] },
//                           { $lte: ["$expiresAt", now] },
//                         ],
//                       },
//                     ],
//                   },
//                   1,
//                   0,
//                 ],
//               },
//             },
//             creditsSpent: {
//               $sum: {
//                 $cond: [
//                   {
//                     $in: [
//                       "$status",
//                       ["Approved", "Expired"],
//                     ],
//                   },
//                   "$creditsCharged",
//                   0,
//                 ],
//               },
//             },
//             lastBoostAt: {
//               $max: {
//                 $ifNull: [
//                   "$approvedAt",
//                   "$requestedAt",
//                 ],
//               },
//             },
//           },
//         },
//         {
//           $sort: {
//             activeBoosts: -1,
//             creditsSpent: -1,
//             totalRequests: -1,
//           },
//         },
//         { $limit: 50 },
//       ]),
//     ]);

//     const partnerIds = partnerStats
//       .map((item) => item._id)
//       .filter(Boolean);

//     const partnerDocs = await Partner.find({
//       _id: { $in: partnerIds },
//     })
//       .select(
//         "partnerId name email phone partnerType isVerified isBlocked creditWallet location"
//       )
//       .lean();

//     const partnerMap = new Map(
//       partnerDocs.map((item) => [
//         String(item._id),
//         item,
//       ])
//     );

//     const partnerPerformance = partnerStats.map(
//       (item) => ({
//         partnerMongoId: item._id,
//         partnerCode: item.partnerCode,
//         partnerName: item.partnerName,
//         totalRequests: item.totalRequests,
//         approvedBoosts: item.approvedBoosts,
//         activeBoosts: item.activeBoosts,
//         expiredBoosts: item.expiredBoosts,
//         creditsSpent: item.creditsSpent,
//         lastBoostAt: item.lastBoostAt,
//         partner:
//           partnerMap.get(String(item._id)) ||
//           null,
//       })
//     );

//     const formattedRequests = requests.map(
//       (request) => {
//         const effectiveExpired =
//           request.status === "Expired" ||
//           (
//             request.status === "Approved" &&
//             request.expiresAt &&
//             new Date(request.expiresAt) <= now
//           );

//         return {
//           ...request,
//           effectiveStatus: effectiveExpired
//             ? "Expired"
//             : request.status,
//           isActive:
//             request.status === "Approved" &&
//             (
//               !request.expiresAt ||
//               new Date(request.expiresAt) > now
//             ),
//         };
//       }
//     );

//     return res.status(200).json({
//       success: true,
//       data: {
//         summary: {
//           totalRequests:
//             await PromotionRequest.countDocuments(),
//           activeBoosts,
//           approvedTotal,
//           pendingBoosts,
//           expiredBoosts,
//           creditsSpent:
//             creditsSpentAgg?.[0]?.credits || 0,
//         },
//         boosts: formattedRequests,
//         partnerPerformance,
//         pagination: {
//           page: safePage,
//           limit: safeLimit,
//           total,
//           totalPages: Math.max(
//             1,
//             Math.ceil(total / safeLimit)
//           ),
//         },
//       },
//     });
//   } catch (error) {
//     console.error(
//       "BOOST OPERATIONS DASHBOARD ERROR:",
//       error
//     );

//     return res.status(500).json({
//       success: false,
//       message:
//         "Unable to fetch boost operations dashboard.",
//       error: error.message,
//     });
//   }
// };

// export const getBoostRequestById = async (
//   req,
//   res
// ) => {
//   try {
//     const { id } = req.params;

//     if (
//       !mongoose.Types.ObjectId.isValid(id)
//     ) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid promotion request ID.",
//       });
//     }

//     const request =
//       await PromotionRequest.findById(id)
//         .populate(
//           "partnerMongoId",
//           "partnerId name email phone partnerType isVerified isBlocked creditWallet location assignedProperties promotionStats"
//         )
//         .populate(
//           "propertyMongoId",
//           "propertyId title status category transactionType city locality address price propertySize sizeUnit images boost projectName developerName"
//         )
//         .lean();

//     if (!request) {
//       return res.status(404).json({
//         success: false,
//         message:
//           "Promotion request not found.",
//       });
//     }

//     const transaction =
//       await CreditTransaction.findById(
//         request.debitTransactionId
//       ).lean();

//     return res.status(200).json({
//       success: true,
//       data: {
//         request,
//         partner:
//           request.partnerMongoId || null,
//         property:
//           request.propertyMongoId || null,
//         transaction,
//       },
//     });
//   } catch (error) {
//     return res.status(500).json({
//       success: false,
//       message:
//         "Unable to fetch boost detail.",
//       error: error.message,
//     });
//   }
// };

import mongoose from "mongoose";
import PromotionRequest from "../../models/PromotionRequest.js";
import CreditTransaction from "../../models/CreditTransaction.js";
import Partner from "../../models/Partner.js";

const normalizeStatus = (status) => {
  if (!status || status === "All") return null;
  return status;
};

const makeSearchQuery = (search = "") => {
  const value = String(search || "").trim();

  if (!value) return null;

  return [
    { requestId: { $regex: value, $options: "i" } },
    { propertyCode: { $regex: value, $options: "i" } },
    { propertyTitle: { $regex: value, $options: "i" } },
    { partnerCode: { $regex: value, $options: "i" } },
    { partnerName: { $regex: value, $options: "i" } },
    { locality: { $regex: value, $options: "i" } },
    { city: { $regex: value, $options: "i" } },
  ];
};

export const getBoostOperationsDashboard = async (req, res) => {
  try {
    const {
      status = "",
      promotionType = "",
      partnerId = "",
      propertyId = "",
      requestId = "",
      search = "",
      page = 1,
      limit = 50,
    } = req.query;

    const query = {};

    if (requestId && mongoose.Types.ObjectId.isValid(requestId)) {
      query._id = requestId;
    }

    const normalizedStatus = normalizeStatus(status);
    if (normalizedStatus) {
      query.status = normalizedStatus;
    }

    if (promotionType && promotionType !== "All") {
      query.promotionType = promotionType;
    }

    if (
      partnerId &&
      mongoose.Types.ObjectId.isValid(partnerId)
    ) {
      query.partnerMongoId = partnerId;
    }

    if (
      propertyId &&
      mongoose.Types.ObjectId.isValid(propertyId)
    ) {
      query.propertyMongoId = propertyId;
    }

    const searchQuery = makeSearchQuery(search);

    if (searchQuery) {
      query.$or = searchQuery;
    }

    const safePage = Math.max(Number(page) || 1, 1);
    const safeLimit = Math.min(
      Math.max(Number(limit) || 50, 1),
      100
    );

    const now = new Date();

    const [
      requests,
      total,
      activeBoosts,
      expiredBoosts,
      pendingBoosts,
      approvedTotal,
      creditsSpentAgg,
      partnerStats,
    ] = await Promise.all([
      PromotionRequest.find(query)
        .populate(
          "partnerMongoId",
          "partnerId name email phone partnerType isVerified isBlocked creditWallet location"
        )
        .populate(
          "propertyMongoId",
          "propertyId title status city locality price images boost"
        )
        .sort({
          approvedAt: -1,
          requestedAt: -1,
          createdAt: -1,
        })
        .skip((safePage - 1) * safeLimit)
        .limit(safeLimit)
        .lean(),

      PromotionRequest.countDocuments(query),

      PromotionRequest.countDocuments({
        status: "Approved",
        $or: [
          { expiresAt: null },
          { expiresAt: { $gt: now } },
        ],
      }),

      PromotionRequest.countDocuments({
        $or: [
          { status: "Expired" },
          {
            status: "Approved",
            expiresAt: { $lte: now },
          },
        ],
      }),

      PromotionRequest.countDocuments({
        status: "Pending",
      }),

      PromotionRequest.countDocuments({
        status: "Approved",
      }),

      PromotionRequest.aggregate([
        { $match: { status: { $in: ["Approved", "Expired"] } } },
        { $group: { _id: null, credits: { $sum: "$creditsCharged" } } },
      ]),

      PromotionRequest.aggregate([
        {
          $group: {
            _id: "$partnerMongoId",
            partnerCode: {
              $first: "$partnerCode",
            },
            partnerName: {
              $first: "$partnerName",
            },
            totalRequests: { $sum: 1 },
            approvedBoosts: {
              $sum: {
                $cond: [
                  { $eq: ["$status", "Approved"] },
                  1,
                  0,
                ],
              },
            },
            activeBoosts: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      { $eq: ["$status", "Approved"] },
                      {
                        $or: [
                          { $eq: ["$expiresAt", null] },
                          { $gt: ["$expiresAt", now] },
                        ],
                      },
                    ],
                  },
                  1,
                  0,
                ],
              },
            },
            expiredBoosts: {
              $sum: {
                $cond: [
                  {
                    $or: [
                      { $eq: ["$status", "Expired"] },
                      {
                        $and: [
                          { $eq: ["$status", "Approved"] },
                          { $lte: ["$expiresAt", now] },
                        ],
                      },
                    ],
                  },
                  1,
                  0,
                ],
              },
            },
            creditsSpent: {
              $sum: {
                $cond: [
                  {
                    $in: [
                      "$status",
                      ["Approved", "Expired"],
                    ],
                  },
                  "$creditsCharged",
                  0,
                ],
              },
            },
            lastBoostAt: {
              $max: {
                $ifNull: [
                  "$approvedAt",
                  "$requestedAt",
                ],
              },
            },
          },
        },
        {
          $sort: {
            activeBoosts: -1,
            creditsSpent: -1,
            totalRequests: -1,
          },
        },
        { $limit: 50 },
      ]),
    ]);

    const partnerIds = partnerStats
      .map((item) => item._id)
      .filter(Boolean);

    const partnerDocs = await Partner.find({
      _id: { $in: partnerIds },
    })
      .select(
        "partnerId name email phone partnerType isVerified isBlocked creditWallet location"
      )
      .lean();

    const partnerMap = new Map(
      partnerDocs.map((item) => [
        String(item._id),
        item,
      ])
    );

    const partnerPerformance = partnerStats.map(
      (item) => ({
        partnerMongoId: item._id,
        partnerCode: item.partnerCode,
        partnerName: item.partnerName,
        totalRequests: item.totalRequests,
        approvedBoosts: item.approvedBoosts,
        activeBoosts: item.activeBoosts,
        expiredBoosts: item.expiredBoosts,
        creditsSpent: item.creditsSpent,
        lastBoostAt: item.lastBoostAt,
        partner:
          partnerMap.get(String(item._id)) ||
          null,
      })
    );

    const formattedRequests = requests.map(
      (request) => {
        const effectiveExpired =
          request.status === "Expired" ||
          (
            request.status === "Approved" &&
            request.expiresAt &&
            new Date(request.expiresAt) <= now
          );

        return {
          ...request,
          effectiveStatus: effectiveExpired
            ? "Expired"
            : request.status,
          isActive:
            request.status === "Approved" &&
            (
              !request.expiresAt ||
              new Date(request.expiresAt) > now
            ),
        };
      }
    );

    return res.status(200).json({
      success: true,
      data: {
        summary: {
          totalRequests:
            await PromotionRequest.countDocuments(),
          activeBoosts,
          approvedTotal,
          pendingBoosts,
          expiredBoosts,
          creditsSpent:
            creditsSpentAgg?.[0]?.credits || 0,
        },
        boosts: formattedRequests,
        partnerPerformance,
        pagination: {
          page: safePage,
          limit: safeLimit,
          total,
          totalPages: Math.max(
            1,
            Math.ceil(total / safeLimit)
          ),
        },
      },
    });
  } catch (error) {
    console.error(
      "BOOST OPERATIONS DASHBOARD ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to fetch boost operations dashboard.",
      error: error.message,
    });
  }
};

export const getBoostRequestById = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    if (
      !mongoose.Types.ObjectId.isValid(id)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid promotion request ID.",
      });
    }

    const request =
      await PromotionRequest.findById(id)
        .populate(
          "partnerMongoId",
          "partnerId name email phone partnerType isVerified isBlocked creditWallet location assignedProperties promotionStats"
        )
        .populate(
          "propertyMongoId",
          "propertyId title status category transactionType city locality address price propertySize sizeUnit images boost projectName developerName"
        )
        .lean();

    if (!request) {
      return res.status(404).json({
        success: false,
        message:
          "Promotion request not found.",
      });
    }

    const transaction =
      await CreditTransaction.findById(
        request.debitTransactionId
      ).lean();

    return res.status(200).json({
      success: true,
      data: {
        request,
        partner:
          request.partnerMongoId || null,
        property:
          request.propertyMongoId || null,
        transaction,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message:
        "Unable to fetch boost detail.",
      error: error.message,
    });
  }
};
