
// import mongoose from "mongoose";
// import Seller from "../../models/Seller.js";
// import Property from "../../models/NewProperty.js";

// /* ======================================================
//    HELPERS
// ====================================================== */

// const safeSellerSelect =
//   "-password -otp -otpExpiresAt";

// const buildSellerPropertyQuery = (seller) => ({
//   $or: [
//     {
//       "addedBy.userId": seller._id,
//       "addedBy.role": {
//         $regex: /^seller$/i,
//       },
//     },
//     {
//       "addedBy.sellerId": seller.sellerId,
//     },
//   ],
// });

// const buildPropertyStats = (properties = []) => {
//   const statusCount = (statuses) =>
//     properties.filter((property) =>
//       statuses.includes(property.status)
//     ).length;

//   const visitScheduled = properties.filter(
//     (property) =>
//       Boolean(
//         property.assignedPartner?.visitDate
//       )
//   ).length;

//   const uniquePartners = [
//     ...new Map(
//       properties
//         .filter(
//           (property) =>
//             property.assignedPartner?.partnerId
//         )
//         .map((property) => [
//           String(
//             property.assignedPartner.partnerId
//           ),
//           property.assignedPartner,
//         ])
//     ).values(),
//   ];

//   return {
//     total: properties.length,
//     draft: statusCount(["Draft"]),
//     submitted: statusCount(["Submitted"]),
//     assigned: statusCount([
//       "Assigned_To_Partner",
//     ]),
//     reviewing: statusCount(["Reviewing"]),
//     verified: statusCount(["Verified"]),
//     live: statusCount(["Live"]),
//     rejected: statusCount(["Rejected"]),
//     sold: statusCount(["Sold"]),
//     rented: statusCount(["Rented"]),

//     // In your current property schema these exact statuses do not exist,
//     // so these safely remain 0 unless you later add them.
//     pending: statusCount([
//       "Submitted",
//       "Assigned_To_Partner",
//       "Reviewing",
//     ]),
//     actionRequired: statusCount([
//       "Rejected",
//     ]),
//     withdrawn: statusCount(["Withdrawn"]),
//     expired: statusCount(["Expired"]),

//     visitScheduled,
//     assignedPartnerCount:
//       uniquePartners.length,
//   };
// };

// const decorateProperty = (property) => {
//   const raw =
//     property?.toObject?.() || property;

//   const history =
//     Array.isArray(raw.statusHistory)
//       ? raw.statusHistory
//       : [];

//   const lifecycleOrder = [
//     "Draft",
//     "Submitted",
//     "Assigned_To_Partner",
//     "Reviewing",
//     "Verified",
//     "Live",
//   ];

//   const currentIndex =
//     lifecycleOrder.indexOf(raw.status);

//   const lifecycle = lifecycleOrder.map(
//     (status, index) => ({
//       key: status,
//       label:
//         status === "Assigned_To_Partner"
//           ? "Partner Review"
//           : status === "Verified"
//           ? "Approved"
//           : status === "Live"
//           ? "Published"
//           : status,
//       completed:
//         currentIndex >= 0 &&
//         index < currentIndex,
//       active:
//         raw.status === status,
//       pending:
//         currentIndex >= 0 &&
//         index > currentIndex,
//     })
//   );

//   return {
//     ...raw,
//     lifecycle,
//     currentVerificationStatus:
//       raw.assignedPartner
//         ?.verificationStatus || "Pending",
//     latestStatusHistory:
//       history.length
//         ? history[history.length - 1]
//         : null,
//   };
// };

// /* ======================================================
//    GET ALL SELLERS
//    GET /api/sellers
//    query: search, verified, city
// ====================================================== */

// export const getAllSellers = async (
//   req,
//   res
// ) => {
//   try {
//     const {
//       search = "",
//       verified = "All",
//       city = "",
//     } = req.query;

//     const query = {};

//     if (verified === "true") {
//       query.isVerified = true;
//     }

//     if (verified === "false") {
//       query.isVerified = false;
//     }

//     if (city.trim()) {
//       query["location.city"] =
//         new RegExp(
//           `^${city.trim()}$`,
//           "i"
//         );
//     }

//     if (search.trim()) {
//       const regex = new RegExp(
//         search.trim(),
//         "i"
//       );

//       query.$or = [
//         { sellerId: regex },
//         { name: regex },
//         { email: regex },
//         { phone: regex },
//         { "location.city": regex },
//         { "location.state": regex },
//       ];
//     }

//     const sellers =
//       await Seller.find(query)
//         .select(safeSellerSelect)
//         .sort({ createdAt: -1 })
//         .lean();

//     const data =
//       await Promise.all(
//         sellers.map(async (seller) => {
//           const properties =
//             await Property.find(
//               buildSellerPropertyQuery(
//                 seller
//               )
//             )
//               .select(
//                 "_id status assignedPartner"
//               )
//               .lean();

//           return {
//             ...seller,
//             propertyStats:
//               buildPropertyStats(
//                 properties
//               ),
//           };
//         })
//       );

//     return res.status(200).json({
//       success: true,
//       message:
//         "Sellers fetched successfully",
//       count: data.length,
//       data,
//     });
//   } catch (error) {
//     console.error(
//       "Get All Sellers Error:",
//       error
//     );

//     return res.status(500).json({
//       success: false,
//       message:
//         "Failed to fetch sellers",
//       error: error.message,
//     });
//   }
// };

// /* ======================================================
//    GET SELLER BY ID + ALL PROPERTIES
//    GET /api/sellers/:id
// ====================================================== */

// export const getSellerById = async (
//   req,
//   res
// ) => {
//   try {
//     const { id } = req.params;

//     if (
//       !mongoose.Types.ObjectId.isValid(
//         id
//       )
//     ) {
//       return res.status(400).json({
//         success: false,
//         message:
//           "Invalid seller ID",
//       });
//     }

//     const seller =
//       await Seller.findById(id)
//         .select(safeSellerSelect)
//         .lean();

//     if (!seller) {
//       return res.status(404).json({
//         success: false,
//         message: "Seller not found",
//       });
//     }

//     const properties =
//       await Property.find(
//         buildSellerPropertyQuery(
//           seller
//         )
//       )
//         .populate(
//           "assignedPartner.partnerId",
//           "partnerId name email phone partnerType location isVerified isBlocked"
//         )
//         .sort({ createdAt: -1 });

//     const decoratedProperties =
//       properties.map(
//         decorateProperty
//       );

//     const propertyStats =
//       buildPropertyStats(
//         decoratedProperties
//       );

//     const assignedPartners = [
//       ...new Map(
//         decoratedProperties
//           .filter(
//             (property) =>
//               property.assignedPartner
//                 ?.partnerId
//           )
//           .map((property) => {
//             const partnerDoc =
//               property.assignedPartner
//                 .partnerId;

//             const key =
//               partnerDoc?._id
//                 ? String(partnerDoc._id)
//                 : String(
//                     property
//                       .assignedPartner
//                       .partnerId
//                   );

//             return [
//               key,
//               {
//                 ...property.assignedPartner,
//                 partnerDoc:
//                   partnerDoc?._id
//                     ? partnerDoc
//                     : null,
//               },
//             ];
//           })
//       ).values(),
//     ];

//     return res.status(200).json({
//       success: true,
//       message:
//         "Seller detail fetched successfully",
//       data: {
//         seller,
//         propertyStats,
//         assignedPartners,
//         properties:
//           decoratedProperties,
//       },
//     });
//   } catch (error) {
//     console.error(
//       "Get Seller By ID Error:",
//       error
//     );

//     return res.status(500).json({
//       success: false,
//       message:
//         "Failed to fetch seller",
//       error: error.message,
//     });
//   }
// };

// /* ======================================================
//    ADMIN VERIFY / UNVERIFY SELLER
//    PATCH /api/sellers/:id/verify
//    body: { isVerified: true, remarks: "..." }
// ====================================================== */

// export const verifySeller = async (
//   req,
//   res
// ) => {
//   try {
//     const { id } = req.params;

//     const {
//       isVerified,
//       remarks = "",
//     } = req.body || {};

//     if (
//       !mongoose.Types.ObjectId.isValid(
//         id
//       )
//     ) {
//       return res.status(400).json({
//         success: false,
//         message:
//           "Invalid seller ID",
//       });
//     }

//     if (
//       typeof isVerified !==
//       "boolean"
//     ) {
//       return res.status(400).json({
//         success: false,
//         message:
//           "isVerified must be true or false",
//       });
//     }

//     const seller =
//       await Seller.findById(id);

//     if (!seller) {
//       return res.status(404).json({
//         success: false,
//         message: "Seller not found",
//       });
//     }

//     seller.isVerified =
//       isVerified;

//     seller.verifiedAt =
//       isVerified
//         ? new Date()
//         : null;

//     seller.verificationRemarks =
//       remarks;

//     seller.verifiedBy =
//       isVerified
//         ? {
//             userId:
//               req.user?._id ||
//               null,

//             name:
//               req.user?.name ||
//               "Admin",

//             role:
//               req.user?.role ||
//               "Admin",
//           }
//         : {
//             userId: null,
//             name: "",
//             role: "",
//           };

//     seller.verificationHistory.push({
//       action:
//         isVerified
//           ? "Verified"
//           : "Unverified",

//       remarks,

//       updatedBy: {
//         userId:
//           req.user?._id || null,

//         name:
//           req.user?.name ||
//           "Admin",

//         role:
//           req.user?.role ||
//           "Admin",
//       },
//     });

//     await seller.save();

//     const safeSeller =
//       seller.toObject();

//     delete safeSeller.password;
//     delete safeSeller.otp;
//     delete safeSeller.otpExpiresAt;

//     return res.status(200).json({
//       success: true,
//       message: isVerified
//         ? "Seller verified successfully"
//         : "Seller verification removed successfully",
//       data: safeSeller,
//     });
//   } catch (error) {
//     console.error(
//       "Verify Seller Error:",
//       error
//     );

//     return res.status(500).json({
//       success: false,
//       message:
//         "Failed to update seller verification",
//       error: error.message,
//     });
//   }
// };

// /* ======================================================
//    GET ALL PROPERTIES OF ONE SELLER
//    GET /api/sellers/:id/properties
// ====================================================== */

// export const getSellerProperties = async (
//   req,
//   res
// ) => {
//   try {
//     const { id } = req.params;

//     if (
//       !mongoose.Types.ObjectId.isValid(
//         id
//       )
//     ) {
//       return res.status(400).json({
//         success: false,
//         message:
//           "Invalid seller ID",
//       });
//     }

//     const seller =
//       await Seller.findById(id)
//         .select(
//           "_id sellerId name email phone"
//         )
//         .lean();

//     if (!seller) {
//       return res.status(404).json({
//         success: false,
//         message: "Seller not found",
//       });
//     }

//     const properties =
//       await Property.find(
//         buildSellerPropertyQuery(
//           seller
//         )
//       )
//         .populate(
//           "assignedPartner.partnerId",
//           "partnerId name email phone partnerType location isVerified isBlocked"
//         )
//         .sort({ createdAt: -1 });

//     const data =
//       properties.map(
//         decorateProperty
//       );

//     return res.status(200).json({
//       success: true,
//       count: data.length,
//       data,
//     });
//   } catch (error) {
//     console.error(
//       "Get Seller Properties Error:",
//       error
//     );

//     return res.status(500).json({
//       success: false,
//       message:
//         "Failed to fetch seller properties",
//       error: error.message,
//     });
//   }
// };

// /* ======================================================
//    GET ONE PROPERTY OF ONE SELLER
//    GET /api/sellers/:sellerId/properties/:propertyId
// ====================================================== */

// export const getSellerPropertyById =
//   async (req, res) => {
//     try {
//       const {
//         sellerId,
//         propertyId,
//       } = req.params;

//       if (
//         !mongoose.Types.ObjectId.isValid(
//           sellerId
//         ) ||
//         !mongoose.Types.ObjectId.isValid(
//           propertyId
//         )
//       ) {
//         return res
//           .status(400)
//           .json({
//             success: false,
//             message:
//               "Invalid seller or property ID",
//           });
//       }

//       const seller =
//         await Seller.findById(
//           sellerId
//         )
//           .select(
//             "_id sellerId name email phone"
//           )
//           .lean();

//       if (!seller) {
//         return res
//           .status(404)
//           .json({
//             success: false,
//             message:
//               "Seller not found",
//           });
//       }

//       const property =
//         await Property.findOne({
//           _id: propertyId,
//           ...buildSellerPropertyQuery(
//             seller
//           ),
//         }).populate(
//           "assignedPartner.partnerId",
//           "partnerId name email phone partnerType location isVerified isBlocked"
//         );

//       if (!property) {
//         return res
//           .status(404)
//           .json({
//             success: false,
//             message:
//               "Property not found for this seller",
//           });
//       }

//       return res
//         .status(200)
//         .json({
//           success: true,
//           data:
//             decorateProperty(
//               property
//             ),
//         });
//     } catch (error) {
//       console.error(
//         "Get Seller Property By ID Error:",
//         error
//       );

//       return res
//         .status(500)
//         .json({
//           success: false,
//           message:
//             "Failed to fetch property",
//           error: error.message,
//         });
//     }
//   };

// /* ======================================================
//    SELLER SUMMARY
//    GET /api/sellers/:id/summary
// ====================================================== */

// export const getSellerSummary = async (
//   req,
//   res
// ) => {
//   try {
//     const { id } = req.params;

//     if (
//       !mongoose.Types.ObjectId.isValid(
//         id
//       )
//     ) {
//       return res.status(400).json({
//         success: false,
//         message:
//           "Invalid seller ID",
//       });
//     }

//     const seller =
//       await Seller.findById(id)
//         .select(
//           "_id sellerId name isVerified"
//         )
//         .lean();

//     if (!seller) {
//       return res.status(404).json({
//         success: false,
//         message: "Seller not found",
//       });
//     }

//     const properties =
//       await Property.find(
//         buildSellerPropertyQuery(
//           seller
//         )
//       )
//         .select(
//           "status assignedPartner"
//         )
//         .lean();

//     return res.status(200).json({
//       success: true,
//       data: buildPropertyStats(
//         properties
//       ),
//     });
//   } catch (error) {
//     return res.status(500).json({
//       success: false,
//       message:
//         "Failed to fetch seller summary",
//       error: error.message,
//     });
//   }
// };


import mongoose from "mongoose";
import Seller from "../../models/Seller.js";
import Property from "../../models/NewProperty.js";

/* ======================================================
   HELPERS
====================================================== */


import {
  generateOtp,
  hashOtp,
  otpExpiry,
  isOtpValid,
} from "../../utils/otpUtils.js";

import {
  sendSellerEmailOtp,
} from "../../services/selleremailService.js";



const safeSellerSelect =
  "-password -emailVerification.otpHash -emailVerification.otpExpiresAt -phoneVerification.otpHash -phoneVerification.otpExpiresAt";

const buildSellerPropertyQuery = (seller) => ({
  $or: [
    {
      "addedBy.userId": seller._id,
      "addedBy.role": {
        $regex: /^seller$/i,
      },
    },
    {
      "addedBy.sellerId": seller.sellerId,
    },
  ],
});

const buildPropertyStats = (properties = []) => {
  const statusCount = (statuses) =>
    properties.filter((property) =>
      statuses.includes(property.status)
    ).length;

  const visitScheduled = properties.filter(
    (property) =>
      Boolean(
        property.assignedPartner?.visitDate
      )
  ).length;

  const uniquePartners = [
    ...new Map(
      properties
        .filter(
          (property) =>
            property.assignedPartner?.partnerId
        )
        .map((property) => [
          String(
            property.assignedPartner.partnerId
          ),
          property.assignedPartner,
        ])
    ).values(),
  ];

  return {
    total: properties.length,
    draft: statusCount(["Draft"]),
    submitted: statusCount(["Submitted"]),
    assigned: statusCount([
      "Assigned_To_Partner",
    ]),
    reviewing: statusCount(["Reviewing"]),
    verified: statusCount(["Verified"]),
    live: statusCount(["Live"]),
    rejected: statusCount(["Rejected"]),
    sold: statusCount(["Sold"]),
    rented: statusCount(["Rented"]),

    // In your current property schema these exact statuses do not exist,
    // so these safely remain 0 unless you later add them.
    pending: statusCount([
      "Submitted",
      "Assigned_To_Partner",
      "Reviewing",
    ]),
    actionRequired: statusCount([
      "Rejected",
    ]),
    withdrawn: statusCount(["Withdrawn"]),
    expired: statusCount(["Expired"]),

    visitScheduled,
    assignedPartnerCount:
      uniquePartners.length,
  };
};

const decorateProperty = (property) => {
  const raw =
    property?.toObject?.() || property;

  const history =
    Array.isArray(raw.statusHistory)
      ? raw.statusHistory
      : [];

  const lifecycleOrder = [
    "Draft",
    "Submitted",
    "Assigned_To_Partner",
    "Reviewing",
    "Verified",
    "Live",
  ];

  const currentIndex =
    lifecycleOrder.indexOf(raw.status);

  const lifecycle = lifecycleOrder.map(
    (status, index) => ({
      key: status,
      label:
        status === "Assigned_To_Partner"
          ? "Partner Review"
          : status === "Verified"
          ? "Approved"
          : status === "Live"
          ? "Published"
          : status,
      completed:
        currentIndex >= 0 &&
        index < currentIndex,
      active:
        raw.status === status,
      pending:
        currentIndex >= 0 &&
        index > currentIndex,
    })
  );

  return {
    ...raw,
    lifecycle,
    currentVerificationStatus:
      raw.assignedPartner
        ?.verificationStatus || "Pending",
    latestStatusHistory:
      history.length
        ? history[history.length - 1]
        : null,
  };
};

/* ======================================================
   GET ALL SELLERS
   GET /api/sellers
   query: search, verified, city
====================================================== */

export const getAllSellers = async (
  req,
  res
) => {
  try {
    const {
      search = "",
      verified = "All",
      city = "",
    } = req.query;

    const query = {
      applicationStatus: "APPROVED",
      accountStatus: { $in: ["ACTIVE", "SUSPENDED", "BLOCKED"] },
    };

    if (verified === "true") {
      query.isVerified = true;
    }

    if (verified === "false") {
      query.isVerified = false;
    }

    if (city.trim()) {
      query["location.city"] =
        new RegExp(
          `^${city.trim()}$`,
          "i"
        );
    }

    if (search.trim()) {
      const regex = new RegExp(
        search.trim(),
        "i"
      );

      query.$or = [
        { sellerId: regex },
        { name: regex },
        { email: regex },
        { phone: regex },
        { "location.city": regex },
        { "location.state": regex },
      ];
    }

    const sellers =
      await Seller.find(query)
        .select(safeSellerSelect)
        .sort({ createdAt: -1 })
        .lean();

    const data =
      await Promise.all(
        sellers.map(async (seller) => {
          const properties =
            await Property.find(
              buildSellerPropertyQuery(
                seller
              )
            )
              .select(
                "_id status assignedPartner"
              )
              .lean();

          return {
            ...seller,
            propertyStats:
              buildPropertyStats(
                properties
              ),
          };
        })
      );

    return res.status(200).json({
      success: true,
      message:
        "Sellers fetched successfully",
      count: data.length,
      data,
    });
  } catch (error) {
    console.error(
      "Get All Sellers Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch sellers",
      error: error.message,
    });
  }
};

/* ======================================================
   GET SELLER BY ID + ALL PROPERTIES
   GET /api/sellers/:id
====================================================== */

export const getSellerById = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    if (
      !mongoose.Types.ObjectId.isValid(
        id
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid seller ID",
      });
    }

    const seller =
      await Seller.findById(id)
        .select(safeSellerSelect)
        .lean();

    if (!seller) {
      return res.status(404).json({
        success: false,
        message: "Seller not found",
      });
    }

    const properties =
      await Property.find(
        buildSellerPropertyQuery(
          seller
        )
      )
        .populate(
          "assignedPartner.partnerId",
          "partnerId name email phone partnerType location isVerified isBlocked"
        )
        .sort({ createdAt: -1 });

    const decoratedProperties =
      properties.map(
        decorateProperty
      );

    const propertyStats =
      buildPropertyStats(
        decoratedProperties
      );

    const assignedPartners = [
      ...new Map(
        decoratedProperties
          .filter(
            (property) =>
              property.assignedPartner
                ?.partnerId
          )
          .map((property) => {
            const partnerDoc =
              property.assignedPartner
                .partnerId;

            const key =
              partnerDoc?._id
                ? String(partnerDoc._id)
                : String(
                    property
                      .assignedPartner
                      .partnerId
                  );

            return [
              key,
              {
                ...property.assignedPartner,
                partnerDoc:
                  partnerDoc?._id
                    ? partnerDoc
                    : null,
              },
            ];
          })
      ).values(),
    ];

    return res.status(200).json({
      success: true,
      message:
        "Seller detail fetched successfully",
      data: {
        seller,
        propertyStats,
        assignedPartners,
        properties:
          decoratedProperties,
      },
    });
  } catch (error) {
    console.error(
      "Get Seller By ID Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch seller",
      error: error.message,
    });
  }
};

/* ======================================================
   ADMIN VERIFY / UNVERIFY SELLER
   PATCH /api/sellers/:id/verify
   body: { isVerified: true, remarks: "..." }
====================================================== */

export const verifySeller = async (
  req,
  res
) => {
  try {
    const { id } = req.params;
    const {
      isVerified,
      remarks = "",
    } = req.body || {};

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid seller ID",
      });
    }

    const seller = await Seller.findById(id);

    if (!seller) {
      return res.status(404).json({
        success: false,
        message: "Seller not found",
      });
    }

    // Seller Management contains approved sellers only.
    // Application approval belongs to /applications/:id/review.
    if (seller.applicationStatus !== "APPROVED") {
      return res.status(400).json({
        success: false,
        message:
          "Use Seller Application review to approve this seller first",
      });
    }

    seller.isVerified = Boolean(isVerified);
    seller.accountStatus = isVerified
      ? "ACTIVE"
      : "SUSPENDED";

    seller.verificationHistory.push({
      action: isVerified
        ? "REACTIVATED"
        : "SUSPENDED",
      remarks,
      updatedBy: {
        userId: req.user?._id || req.user?.id || null,
        name: req.user?.name || "Admin",
        role: req.user?.role || "Admin",
      },
    });

    await seller.save();

    return res.json({
      success: true,
      message: isVerified
        ? "Seller account activated"
        : "Seller account suspended",
      data: seller,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to update seller account status",
      error: error.message,
    });
  }
};


/* ======================================================
   GET ALL PROPERTIES OF ONE SELLER
   GET /api/sellers/:id/properties
====================================================== */

export const getSellerProperties = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    if (
      !mongoose.Types.ObjectId.isValid(
        id
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid seller ID",
      });
    }

    const seller =
      await Seller.findById(id)
        .select(
          "_id sellerId name email phone"
        )
        .lean();

    if (!seller) {
      return res.status(404).json({
        success: false,
        message: "Seller not found",
      });
    }

    const properties =
      await Property.find(
        buildSellerPropertyQuery(
          seller
        )
      )
        .populate(
          "assignedPartner.partnerId",
          "partnerId name email phone partnerType location isVerified isBlocked"
        )
        .sort({ createdAt: -1 });

    const data =
      properties.map(
        decorateProperty
      );

    return res.status(200).json({
      success: true,
      count: data.length,
      data,
    });
  } catch (error) {
    console.error(
      "Get Seller Properties Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch seller properties",
      error: error.message,
    });
  }
};

/* ======================================================
   GET ONE PROPERTY OF ONE SELLER
   GET /api/sellers/:sellerId/properties/:propertyId
====================================================== */

export const getSellerPropertyById =
  async (req, res) => {
    try {
      const {
        sellerId,
        propertyId,
      } = req.params;

      if (
        !mongoose.Types.ObjectId.isValid(
          sellerId
        ) ||
        !mongoose.Types.ObjectId.isValid(
          propertyId
        )
      ) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "Invalid seller or property ID",
          });
      }

      const seller =
        await Seller.findById(
          sellerId
        )
          .select(
            "_id sellerId name email phone"
          )
          .lean();

      if (!seller) {
        return res
          .status(404)
          .json({
            success: false,
            message:
              "Seller not found",
          });
      }

      const property =
        await Property.findOne({
          _id: propertyId,
          ...buildSellerPropertyQuery(
            seller
          ),
        }).populate(
          "assignedPartner.partnerId",
          "partnerId name email phone partnerType location isVerified isBlocked"
        );

      if (!property) {
        return res
          .status(404)
          .json({
            success: false,
            message:
              "Property not found for this seller",
          });
      }

      return res
        .status(200)
        .json({
          success: true,
          data:
            decorateProperty(
              property
            ),
        });
    } catch (error) {
      console.error(
        "Get Seller Property By ID Error:",
        error
      );

      return res
        .status(500)
        .json({
          success: false,
          message:
            "Failed to fetch property",
          error: error.message,
        });
    }
  };

/* ======================================================
   SELLER SUMMARY
   GET /api/sellers/:id/summary
====================================================== */

export const getSellerSummary = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    if (
      !mongoose.Types.ObjectId.isValid(
        id
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid seller ID",
      });
    }

    const seller =
      await Seller.findById(id)
        .select(
          "_id sellerId name isVerified"
        )
        .lean();

    if (!seller) {
      return res.status(404).json({
        success: false,
        message: "Seller not found",
      });
    }

    const properties =
      await Property.find(
        buildSellerPropertyQuery(
          seller
        )
      )
        .select(
          "status assignedPartner"
        )
        .lean();

    return res.status(200).json({
      success: true,
      data: buildPropertyStats(
        properties
      ),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch seller summary",
      error: error.message,
    });
  }
};

// ======================================================
// SELLER LOGIN - SEND EMAIL OTP
// POST /api/sellers/auth/send-login-otp
// ======================================================

export const sendSellerLoginOtp = async (
  req,
  res
) => {
  try {
    const { email } =
      req.body || {};

    if (!email) {
      return res.status(400).json({
        success: false,
        message:
          "Email is required",
      });
    }

    const normalizedEmail =
      String(email)
        .trim()
        .toLowerCase();

    const seller =
      await Seller.findOne({
        email:
          normalizedEmail,
      });

    if (!seller) {
      return res.status(404).json({
        success: false,
        message:
          "Seller account not found",
      });
    }

    // ================================
    // SELLER MUST BE APPROVED
    // ================================

    if (
      seller.applicationStatus !==
      "APPROVED"
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Your seller application is not approved yet",
        applicationStatus:
          seller.applicationStatus,
      });
    }

    // ================================
    // ACCOUNT ACTIVE CHECK
    // ================================

    if (
      seller.accountStatus !==
      "ACTIVE"
    ) {
      return res.status(403).json({
        success: false,
        message:
          `Seller account is ${seller.accountStatus}`,
      });
    }

    // ================================
    // EMAIL VERIFIED CHECK
    // ================================

    if (
      !seller.emailVerification
        ?.isVerified
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Email is not verified",
      });
    }

    // ================================
    // GENERATE LOGIN OTP
    // ================================

    const otp =
      generateOtp();

    seller.loginOtp = {
      otpHash:
        hashOtp(otp),

      otpExpiresAt:
        otpExpiry(10),
    };

    await seller.save();

    // ================================
    // SEND OTP
    // ================================

    await sendSellerEmailOtp({
      to:
        seller.email,

      name:
        seller.name,

      otp,
    });

    return res.status(200).json({
      success: true,

      message:
        "Login OTP sent to your email.",

      data: {
        email:
          seller.email,
      },
    });
  } catch (error) {
    console.error(
      "SEND SELLER LOGIN OTP ERROR:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        "Unable to send login OTP",
    });
  }
};


// ======================================================
// SELLER LOGIN - VERIFY EMAIL OTP
// POST /api/sellers/auth/login-with-otp
// ======================================================

export const sellerLoginWithOtp = async (
  req,
  res
) => {
  try {
    const {
      email,
      otp,
    } = req.body || {};

    if (
      !email ||
      !otp
    ) {
      return res.status(400).json({
        success: false,

        message:
          "Email and OTP are required",
      });
    }

    const normalizedEmail =
      String(email)
        .trim()
        .toLowerCase();

    const seller =
      await Seller.findOne({
        email:
          normalizedEmail,
      }).select(
        "+loginOtp.otpHash +loginOtp.otpExpiresAt"
      );

    if (!seller) {
      return res.status(404).json({
        success: false,
        message:
          "Seller account not found",
      });
    }

    // ================================
    // APPROVAL CHECK
    // ================================

    if (
      seller.applicationStatus !==
      "APPROVED"
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Seller application is not approved",
      });
    }

    // ================================
    // ACCOUNT CHECK
    // ================================

    if (
      seller.accountStatus !==
      "ACTIVE"
    ) {
      return res.status(403).json({
        success: false,
        message:
          `Seller account is ${seller.accountStatus}`,
      });
    }

    // ================================
    // OTP VERIFY
    // ================================

    const validOtp =
      isOtpValid({
        enteredOtp:
          otp,

        otpHash:
          seller.loginOtp
            ?.otpHash,

        otpExpiresAt:
          seller.loginOtp
            ?.otpExpiresAt,
      });

    if (!validOtp) {
      return res.status(400).json({
        success: false,

        message:
          "Invalid or expired OTP",
      });
    }

    // ================================
    // CLEAR OTP AFTER USE
    // ================================

    seller.loginOtp.otpHash =
      null;

    seller.loginOtp.otpExpiresAt =
      null;

    seller.lastLoginAt =
      new Date();

    await seller.save();

    // ================================
    // JWT
    // ================================

    const token =
      signSellerToken(
        seller
      );

    return res.status(200).json({
      success: true,

      message:
        "Login successful",

      token,

      data: {
        id:
          seller._id,

        sellerId:
          seller.sellerId,

        name:
          seller.name,

        email:
          seller.email,

        role:
          seller.role,

        mustChangePassword:
          seller.mustChangePassword,
      },
    });
  } catch (error) {
    console.error(
      "SELLER OTP LOGIN ERROR:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        "Unable to login with OTP",
    });
  }
};