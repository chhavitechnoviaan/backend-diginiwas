// import Property from "../../models/NewProperty.js";
// import { getPropertyCreator } from "../../utils/getPropertyCreator.js";
// import Partner from "../../models/Partner.js";
// const generatePropertyId = async () => {
//   const lastProperty =
//     await Property.findOne()
//       .sort({ createdAt: -1 })
//       .select("propertyId");

//   let nextNumber = 1001;

//   if (lastProperty?.propertyId) {
//     const currentNumber =
//       parseInt(
//         lastProperty.propertyId.replace(
//           "DW-",
//           ""
//         )
//       ) || 1000;

//     nextNumber =
//       currentNumber + 1;
//   }

//   return `DW-${nextNumber}`;
// };

// // export const createProperty = async (
// //   req,
// //   res
// // ) => {
// //   try {
// //     // ==================================================
// //     // CREATOR FROM FRONTEND
// //     // ==================================================

// //     const {
// //       creatorId,
// //       creatorRole,
// //     } = req.body;

// //     if (
// //       !creatorId ||
// //       !creatorRole
// //     ) {
// //       return res
// //         .status(400)
// //         .json({
// //           success: false,
// //           message:
// //             "Property creator ID and role are required.",
// //         });
// //     }

// //     // ==================================================
// //     // FETCH REAL USER DETAILS FROM DB
// //     // ==================================================

// //     const creator =
// //       await getPropertyCreator(
// //         creatorId,
// //         creatorRole
// //       );

// //     if (!creator) {
// //       return res
// //         .status(404)
// //         .json({
// //           success: false,
// //           message:
// //             "Property creator account not found.",
// //         });
// //     }

// //     // ==================================================
// //     // PROPERTY BODY
// //     // ==================================================

// //     const {
// //       title,
// //       transactionType,
// //       category,
// //       status,

// //       propertySize,
// //       sizeUnit,

// //       price,

// //       projectName,
// //       developerName,
// //       description,

// //       city,
// //       locality,
// //       pinCode,
// //       address,
// //       latitude,
// //       longitude,

// //       maintenance,
// //       bookingAmount,
// //       negotiable,

// //       superBuiltupArea,
// //       carpetArea,

// //       bedrooms,
// //       bathrooms,
// //       balconies,
// //       parking,

// //       floorNo,
// //       totalFloors,
// //       facing,
// //       furnishing,

// //       amenities,
// //       images,

// //       floorPlan,
// //       reraCertificate,

// //       videoLink,
// //       video,

// //       tags,
// //     } = req.body;

// //     // ==================================================
// //     // VALIDATION
// //     // ==================================================

// //     if (!title?.trim()) {
// //       return res
// //         .status(400)
// //         .json({
// //           success: false,
// //           message:
// //             "Property title is required.",
// //         });
// //     }

// //     if (!transactionType) {
// //       return res
// //         .status(400)
// //         .json({
// //           success: false,
// //           message:
// //             "Transaction type is required.",
// //         });
// //     }

// //     if (!category) {
// //       return res
// //         .status(400)
// //         .json({
// //           success: false,
// //           message:
// //             "Property category is required.",
// //         });
// //     }

// //     if (
// //       !propertySize ||
// //       Number(propertySize) <= 0
// //     ) {
// //       return res
// //         .status(400)
// //         .json({
// //           success: false,
// //           message:
// //             "Valid property size is required.",
// //         });
// //     }

// //     if (
// //       !price ||
// //       Number(price) <= 0
// //     ) {
// //       return res
// //         .status(400)
// //         .json({
// //           success: false,
// //           message:
// //             "Valid property price is required.",
// //         });
// //     }

// //     // ==================================================
// //     // PROPERTY ID
// //     // ==================================================

// //     const propertyId =
// //       await generatePropertyId();

// //     // ==================================================
// //     // CREATE PROPERTY
// //     // ==================================================

// //     const property =
// //       await Property.create({
// //         propertyId,

// //         title:
// //           title.trim(),

// //         transactionType,
// //         category,

// //         status:
// //           status || "Draft",

// //         propertySize:
// //           Number(propertySize),

// //         sizeUnit:
// //           sizeUnit || "sqft",

// //         price:
// //           Number(price),

// //         projectName:
// //           projectName || "",

// //         developerName:
// //           developerName || "",

// //         description:
// //           description || "",

// //         city:
// //           city || "",

// //         locality:
// //           locality || "",

// //         pinCode:
// //           pinCode || "",

// //         address:
// //           address || "",

// //         latitude:
// //           latitude !==
// //             undefined &&
// //           latitude !== ""
// //             ? Number(latitude)
// //             : undefined,

// //         longitude:
// //           longitude !==
// //             undefined &&
// //           longitude !== ""
// //             ? Number(longitude)
// //             : undefined,

// //         maintenance:
// //           maintenance !==
// //             undefined &&
// //           maintenance !== ""
// //             ? Number(
// //                 maintenance
// //               )
// //             : undefined,

// //         bookingAmount:
// //           bookingAmount !==
// //             undefined &&
// //           bookingAmount !== ""
// //             ? Number(
// //                 bookingAmount
// //               )
// //             : undefined,

// //         negotiable:
// //           Boolean(negotiable),

// //         superBuiltupArea:
// //           superBuiltupArea !==
// //             undefined &&
// //           superBuiltupArea !== ""
// //             ? Number(
// //                 superBuiltupArea
// //               )
// //             : undefined,

// //         carpetArea:
// //           carpetArea !==
// //             undefined &&
// //           carpetArea !== ""
// //             ? Number(
// //                 carpetArea
// //               )
// //             : undefined,

// //         bedrooms:
// //           bedrooms || "",

// //         bathrooms:
// //           bathrooms || "",

// //         balconies:
// //           balconies || "",

// //         parking:
// //           parking || "",

// //         floorNo:
// //           floorNo !==
// //             undefined &&
// //           floorNo !== ""
// //             ? Number(floorNo)
// //             : undefined,

// //         totalFloors:
// //           totalFloors !==
// //             undefined &&
// //           totalFloors !== ""
// //             ? Number(
// //                 totalFloors
// //               )
// //             : undefined,

// //         facing:
// //           facing || "",

// //         furnishing:
// //           furnishing || "",

// //         amenities:
// //           Array.isArray(
// //             amenities
// //           )
// //             ? amenities
// //             : [],

// //         images:
// //           Array.isArray(
// //             images
// //           )
// //             ? images
// //             : [],

// //         floorPlan:
// //           floorPlan || "",

// //         reraCertificate:
// //           reraCertificate || "",

// //         videoLink:
// //           videoLink || "",

// //         video:
// //           video || "",

// //         tags:
// //           Array.isArray(
// //             tags
// //           )
// //             ? tags
// //             : [],

// //         // ==================================================
// //         // CREATOR
// //         // ==================================================

// //         addedBy: {
// //           userId:
// //             creator.userId,

// //           sellerId:
// //             creator.sellerId ||
// //             null,

// //           partnerId:
// //             creator.partnerId ||
// //             null,

// //           partnerType:
// //             creator.partnerType ||
// //             null,

// //           role:
// //             creator.role,

// //           name:
// //             creator.name,

// //           email:
// //             creator.email ||
// //             "",

// //           phone:
// //             creator.phone ||
// //             "",
// //         },

// //         // ==================================================
// //         // STATUS HISTORY
// //         // ==================================================

// //         statusHistory: [
// //           {
// //             status:
// //               status ||
// //               "Draft",

// //             updatedBy: {
// //               userId:
// //                 creator.userId,

// //               name:
// //                 creator.name,

// //               role:
// //                 creator.role,
// //             },

// //             remarks:
// //               "Property created",
// //           },
// //         ],
// //       });

// //     return res
// //       .status(201)
// //       .json({
// //         success: true,

// //         message:
// //           "Property added successfully.",

// //         data: property,
// //       });
// //   } catch (error) {
// //     console.error(
// //       "Create Property Error:",
// //       error
// //     );

// //     if (
// //       error.name ===
// //       "ValidationError"
// //     ) {
// //       return res
// //         .status(400)
// //         .json({
// //           success: false,

// //           message:
// //             "Property validation failed.",

// //           errors:
// //             Object.values(
// //               error.errors
// //             ).map(
// //               (item) =>
// //                 item.message
// //             ),
// //         });
// //     }

// //     if (
// //       error.code === 11000
// //     ) {
// //       return res
// //         .status(409)
// //         .json({
// //           success: false,
// //           message:
// //             "Duplicate property ID. Please try again.",
// //         });
// //     }

// //     return res
// //       .status(500)
// //       .json({
// //         success: false,

// //         message:
// //           "Failed to add property.",

// //         error:
// //           error.message,
// //       });
// //   }
// // };

// export const createProperty =
//   async (req, res) => {
//     try {
//       console.log(
//         "PROPERTY BODY:",
//         req.body
//       );

//       console.log(
//         "PROPERTY FILES:",
//         req.files
//       );

//       // ==================================================
//       // CREATOR
//       // ==================================================

//       const {
//         creatorId,
//         creatorRole,
//       } = req.body;

//       if (
//         !creatorId ||
//         !creatorRole
//       ) {
//         return res
//           .status(400)
//           .json({
//             success: false,

//             message:
//               "Property creator ID and role are required.",
//           });
//       }


//       const creator =
//         await getPropertyCreator(
//           creatorId,
//           creatorRole
//         );


//       if (!creator) {
//         return res
//           .status(404)
//           .json({
//             success: false,

//             message:
//               "Property creator account not found.",
//           });
//       }


//       // ==================================================
//       // VALIDATION
//       // ==================================================

//       if (
//         !req.body.title
//           ?.trim()
//       ) {
//         return res
//           .status(400)
//           .json({
//             success: false,

//             message:
//               "Property title is required.",
//           });
//       }


//       if (
//         !req.body
//           .transactionType
//       ) {
//         return res
//           .status(400)
//           .json({
//             success: false,

//             message:
//               "Transaction type is required.",
//           });
//       }


//       if (
//         !req.body.category
//       ) {
//         return res
//           .status(400)
//           .json({
//             success: false,

//             message:
//               "Property category is required.",
//           });
//       }


//       if (
//         !req.body
//           .propertySize ||
//         Number(
//           req.body
//             .propertySize
//         ) <= 0
//       ) {
//         return res
//           .status(400)
//           .json({
//             success: false,

//             message:
//               "Valid property size is required.",
//           });
//       }


//       if (
//         !req.body.price ||
//         Number(
//           req.body.price
//         ) <= 0
//       ) {
//         return res
//           .status(400)
//           .json({
//             success: false,

//             message:
//               "Valid property price is required.",
//           });
//       }


//       // ==================================================
//       // PARSE FORM DATA JSON
//       // ==================================================

//       const parseJSON = (
//         value,
//         fallback
//       ) => {
//         if (
//           typeof value ===
//           "string"
//         ) {
//           try {
//             return JSON.parse(
//               value
//             );
//           } catch {
//             return fallback;
//           }
//         }

//         return (
//           value ??
//           fallback
//         );
//       };


//       const amenities =
//         parseJSON(
//           req.body.amenities,
//           []
//         );


//       const tags =
//         parseJSON(
//           req.body.tags,
//           []
//         );


//       // ==================================================
//       // IMAGES
//       // ==================================================

//       const images =
//         Array.isArray(
//           req.files?.images
//         )
//           ? req.files.images.map(
//               (
//                 file
//               ) => ({
//                 url:
//                   file.path ||
//                   file.secure_url ||
//                   "",

//                 public_id:
//                   file.filename ||
//                   file.public_id ||
//                   "",
//               })
//             )
//           : [];


//       // ==================================================
//       // FLOOR PLAN
//       // ==================================================

//       const floorPlanUrl =
//         req.files
//           ?.floorPlan?.[0]
//           ?.path ||
//         req.files
//           ?.floorPlan?.[0]
//           ?.secure_url ||
//         "";


//       // ==================================================
//       // RERA
//       // ==================================================

//       const reraCertificateUrl =
//         req.files
//           ?.reraCertificate?.[0]
//           ?.path ||
//         req.files
//           ?.reraCertificate?.[0]
//           ?.secure_url ||
//         "";


//       // ==================================================
//       // VIDEO FILE
//       // ==================================================

//       const videoUrl =
//         req.files
//           ?.video?.[0]
//           ?.path ||
//         req.files
//           ?.video?.[0]
//           ?.secure_url ||
//         "";


//       // ==================================================
//       // PROPERTY ID
//       // ==================================================

//       const propertyId =
//         await generatePropertyId();


//       // ==================================================
//       // BOOLEAN FIX
//       // FormData me "false" bhi string hota hai.
//       // Boolean("false") => true hota hai.
//       // ==================================================

//       const negotiable =
//         String(
//           req.body.negotiable
//         ).toLowerCase() ===
//         "true";


//       // ==================================================
//       // CREATE
//       // ==================================================

//       const property =
//         await Property.create({
//           propertyId,

//           title:
//             req.body.title.trim(),

//           transactionType:
//             req.body
//               .transactionType,

//           category:
//             req.body.category,

//           status:
//             req.body.status ||
//             "Draft",

//           propertySize:
//             Number(
//               req.body
//                 .propertySize
//             ),

//           sizeUnit:
//             req.body
//               .sizeUnit ||
//             "sqft",

//           price:
//             Number(
//               req.body.price
//             ),

//           projectName:
//             req.body
//               .projectName ||
//             "",

//           developerName:
//             req.body
//               .developerName ||
//             "",

//           description:
//             req.body
//               .description ||
//             "",

//           // LOCATION
//           city:
//             req.body.city ||
//             "",

//           locality:
//             req.body
//               .locality ||
//             "",

//           pinCode:
//             req.body
//               .pinCode ||
//             "",

//           address:
//             req.body
//               .address ||
//             "",

//           latitude:
//             req.body
//               .latitude !==
//               undefined &&
//             req.body
//               .latitude !==
//               ""
//               ? Number(
//                   req.body
//                     .latitude
//                 )
//               : undefined,

//           longitude:
//             req.body
//               .longitude !==
//               undefined &&
//             req.body
//               .longitude !==
//               ""
//               ? Number(
//                   req.body
//                     .longitude
//                 )
//               : undefined,

//           // PRICING
//           maintenance:
//             req.body
//               .maintenance !==
//               undefined &&
//             req.body
//               .maintenance !==
//               ""
//               ? Number(
//                   req.body
//                     .maintenance
//                 )
//               : undefined,

//           bookingAmount:
//             req.body
//               .bookingAmount !==
//               undefined &&
//             req.body
//               .bookingAmount !==
//               ""
//               ? Number(
//                   req.body
//                     .bookingAmount
//                 )
//               : undefined,

//           negotiable,

//           // SPECS
//           superBuiltupArea:
//             req.body
//               .superBuiltupArea !==
//               undefined &&
//             req.body
//               .superBuiltupArea !==
//               ""
//               ? Number(
//                   req.body
//                     .superBuiltupArea
//                 )
//               : undefined,

//           carpetArea:
//             req.body
//               .carpetArea !==
//               undefined &&
//             req.body
//               .carpetArea !==
//               ""
//               ? Number(
//                   req.body
//                     .carpetArea
//                 )
//               : undefined,

//           bedrooms:
//             req.body
//               .bedrooms ||
//             "",

//           bathrooms:
//             req.body
//               .bathrooms ||
//             "",

//           balconies:
//             req.body
//               .balconies ||
//             "",

//           parking:
//             req.body
//               .parking ||
//             "",

//           floorNo:
//             req.body
//               .floorNo !==
//               undefined &&
//             req.body
//               .floorNo !==
//               ""
//               ? Number(
//                   req.body
//                     .floorNo
//                 )
//               : undefined,

//           totalFloors:
//             req.body
//               .totalFloors !==
//               undefined &&
//             req.body
//               .totalFloors !==
//               ""
//               ? Number(
//                   req.body
//                     .totalFloors
//                 )
//               : undefined,

//           facing:
//             req.body
//               .facing ||
//             "",

//           furnishing:
//             req.body
//               .furnishing ||
//             "",

//           amenities:
//             Array.isArray(
//               amenities
//             )
//               ? amenities
//               : [],

//           tags:
//             Array.isArray(
//               tags
//             )
//               ? tags
//               : [],

//           // FILES
//           images,

//           floorPlan:
//             floorPlanUrl,

//           reraCertificate:
//             reraCertificateUrl,

//           videoLink:
//             req.body
//               .videoLink ||
//             "",

//           video:
//             videoUrl,

//           // CREATOR
//           addedBy: {
//             userId:
//               creator.userId,

//             sellerId:
//               creator.sellerId ||
//               null,

//             partnerId:
//               creator.partnerId ||
//               null,

//             partnerType:
//               creator.partnerType ||
//               null,

//             role:
//               creator.role,

//             name:
//               creator.name,

//             email:
//               creator.email ||
//               "",

//             phone:
//               creator.phone ||
//               "",
//           },

//           // HISTORY
//           statusHistory: [
//             {
//               status:
//                 req.body
//                   .status ||
//                 "Draft",

//               updatedBy: {
//                 userId:
//                   creator.userId,

//                 name:
//                   creator.name,

//                 role:
//                   creator.role,
//               },

//               remarks:
//                 "Property created",
//             },
//           ],
//         });


//       return res
//         .status(201)
//         .json({
//           success: true,

//           message:
//             "Property added successfully.",

//           data: property,
//         });

//     } catch (error) {
//       console.error(
//         "CREATE PROPERTY ERROR:",
//         error
//       );


//       if (
//         error.name ===
//         "MulterError"
//       ) {
//         return res
//           .status(400)
//           .json({
//             success: false,

//             message:
//               error.message,
//           });
//       }


//       if (
//         error.name ===
//         "ValidationError"
//       ) {
//         return res
//           .status(400)
//           .json({
//             success: false,

//             message:
//               "Property validation failed.",

//             errors:
//               Object.values(
//                 error.errors
//               ).map(
//                 (item) =>
//                   item.message
//               ),
//           });
//       }


//       if (
//         error.code ===
//         11000
//       ) {
//         return res
//           .status(409)
//           .json({
//             success: false,

//             message:
//               "Duplicate property ID. Please try again.",
//           });
//       }


//       return res
//         .status(500)
//         .json({
//           success: false,

//           message:
//             "Failed to add property.",

//           error:
//             error.message,
//         });
//     }
//   };
// export const updateProperty = async (req, res) => {
//   try {
//     const { id } = req.params;

//     // Find Property
//     let property = await Property.findById(id);

//     if (!property) {
//       return res.status(404).json({
//         success: false,
//         message: "Property not found.",
//       });
//     }

//     // Helper to safely parse JSON strings from FormData
//     const parseJSON = (data, fallback) => {
//       if (typeof data === "string") {
//         try {
//           return JSON.parse(data);
//         } catch (e) {
//           return fallback;
//         }
//       }
//       return data !== undefined ? data : fallback;
//     };

//     // Extract updates
//     const updateData = { ...req.body };

//     // Format & Parse Arrays
//     if (updateData.amenities) updateData.amenities = parseJSON(updateData.amenities, property.amenities);
//     if (updateData.tags) updateData.tags = parseJSON(updateData.tags, property.tags);

//     // Number Conversions
//     if (updateData.propertySize) updateData.propertySize = Number(updateData.propertySize);
//     if (updateData.price) updateData.price = Number(updateData.price);
//     if (updateData.latitude) updateData.latitude = Number(updateData.latitude);
//     if (updateData.longitude) updateData.longitude = Number(updateData.longitude);

//     // Image Handling
//     let updatedImages = property.images || [];

//     // Agar frontend se 'existingImages' bhej rahe hain to unko maintain karein
//     if (req.body.existingImages) {
//       updatedImages = parseJSON(req.body.existingImages, property.images);
//     }

//     // Handle Nayi Uploaded Files
//     if (req.files) {
//       if (Array.isArray(req.files) && req.files.length > 0) {
//         const newImages = req.files.map((file) => ({
//           url: file.path || file.secure_url,
//           public_id: file.filename || file.public_id,
//         }));
//         updatedImages = [...updatedImages, ...newImages];
//       } else {
//         // Agar multer fields setup hai
//         if (req.files.images && req.files.images.length > 0) {
//           const newImages = req.files.images.map((file) => ({
//             url: file.path || file.secure_url,
//             public_id: file.filename || file.public_id,
//           }));
//           updatedImages = [...updatedImages, ...newImages];
//         }
//         if (req.files.floorPlan && req.files.floorPlan[0]) {
//           updateData.floorPlan = req.files.floorPlan[0].path || req.files.floorPlan[0].secure_url;
//         }
//         if (req.files.reraCertificate && req.files.reraCertificate[0]) {
//           updateData.reraCertificate = req.files.reraCertificate[0].path || req.files.reraCertificate[0].secure_url;
//         }
//       }
//     }

//     updateData.images = updatedImages;

//     // Maintain Status History (Agar status update ho raha ho)
//     if (req.body.status && req.body.status !== property.status) {
//       const statusLog = {
//         status: req.body.status,
//         updatedBy: {
//           userId: req.body.updatedByUserId || property.addedBy?.userId,
//           name: req.body.updatedByName || property.addedBy?.name,
//           role: req.body.updatedByRole || property.addedBy?.role,
//         },
//         remarks: req.body.statusRemarks || "Property status updated",
//       };

//       updateData.statusHistory = [...(property.statusHistory || []), statusLog];
//     }

//     // Apply updates and Save
//     const updatedProperty = await Property.findByIdAndUpdate(
//       id,
//       { $set: updateData },
//       { new: true, runValidators: true }
//     );

//     return res.status(200).json({
//       success: true,
//       message: "Property updated successfully.",
//       data: updatedProperty,
//     });
//   } catch (error) {
//     console.error("Update Property Error:", error);

//     return res.status(500).json({
//       success: false,
//       message: "Failed to update property.",
//       error: error.message,
//     });
//   }
// };
// export const getAdminProperties = async (req, res) => {
//   try {
//     const {
//       status,
//       search,
//       partnerId,
//       boosted,
//     } = req.query;

//     const query = {};

//     if (status && status !== "All") {
//       query.status = status;
//     }

//     if (partnerId) {
//       query["addedBy.partnerId"] = partnerId;
//     }

//     if (boosted === "true") {
//       query["boost.isBoosted"] = true;
//     }

//     if (search) {
//       query.$or = [
//         {
//           title: {
//             $regex: search,
//             $options: "i",
//           },
//         },

//         {
//           propertyId: {
//             $regex: search,
//             $options: "i",
//           },
//         },

//         {
//           city: {
//             $regex: search,
//             $options: "i",
//           },
//         },

//         {
//           locality: {
//             $regex: search,
//             $options: "i",
//           },
//         },

//         {
//           "addedBy.name": {
//             $regex: search,
//             $options: "i",
//           },
//         },

//         {
//           "addedBy.partnerId": {
//             $regex: search,
//             $options: "i",
//           },
//         },
//       ];
//     }

//     const properties = await Property.find(query)
//       .populate(
//         "assignedPartner.partnerId",
//         "name email phone partnerCode partnerType"
//       )
//       .sort({
//         "boost.isBoosted": -1,
//         createdAt: -1,
//       });

//     return res.status(200).json({
//       success: true,
//       count: properties.length,
//       data: properties,
//     });
//   } catch (error) {
//     console.error(error);

//     return res.status(500).json({
//       success: false,
//       message: "Failed to fetch properties",
//       error: error.message,
//     });
//   }
// };

// export const getAdminPropertyById = async (
//   req,
//   res
// ) => {
//   try {
//     const property = await Property.findById(
//       req.params.id
//     ).populate(
//       "assignedPartner.partnerId",
//       "name email phone partnerCode partnerType"
//     );

//     if (!property) {
//       return res.status(404).json({
//         success: false,
//         message: "Property not found",
//       });
//     }

//     return res.status(200).json({
//       success: true,
//       data: property,
//     });
//   } catch (error) {
//     return res.status(500).json({
//       success: false,
//       message: "Failed to get property",
//       error: error.message,
//     });
//   }
// };

// export const updatePropertyStatus = async (
//   req,
//   res
// ) => {
//   try {
//     const {
//       status,
//       notes = "",
//       rejectionReason = "",
//     } = req.body;

//     const allowedStatuses = [
//       "Reviewing",
//       "Verified",
//       "Live",
//       "Rejected",
//       "Sold",
//       "Rented",
//     ];

//     if (!allowedStatuses.includes(status)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid property status",
//       });
//     }

//     const property = await Property.findById(
//       req.params.id
//     );

//     if (!property) {
//       return res.status(404).json({
//         success: false,
//         message: "Property not found",
//       });
//     }

//     property.status = status;

//     property.review.notes = notes;

//     property.review.reviewedBy = {
//       userId: req.user._id,
//       name: req.user.name,
//       role: req.user.role,
//     };

//     property.review.reviewedAt = new Date();

//     if (status === "Rejected") {
//       property.review.rejectionReason =
//         rejectionReason;
//     } else {
//       property.review.rejectionReason = "";
//     }

//     /*
//       Audit history
//     */

//     property.statusHistory.push({
//       status,

//       updatedBy: {
//         userId: req.user._id,
//         name: req.user.name,
//         role: req.user.role,
//       },

//       remarks:
//         status === "Rejected"
//           ? rejectionReason
//           : notes,
//     });

//     /*
//       Sold / Rented / Rejected hua to
//       boost automatically remove
//     */

//     if (
//       ["Sold", "Rented", "Rejected"].includes(
//         status
//       )
//     ) {
//       property.boost.isBoosted = false;
//       property.boost.startDate = null;
//       property.boost.endDate = null;
//     }

//     await property.save();

//     return res.status(200).json({
//       success: true,
//       message: `Property status changed to ${status}`,
//       data: property,
//     });
//   } catch (error) {
//     console.error(error);

//     return res.status(500).json({
//       success: false,
//       message: "Unable to update status",
//       error: error.message,
//     });
//   }
// };

// export const boostProperty = async (
//   req,
//   res
// ) => {
//   try {
//     const {
//       boostType = "Featured",
//       days = 7,
//     } = req.body;

//     const property = await Property.findById(
//       req.params.id
//     );

//     if (!property) {
//       return res.status(404).json({
//         success: false,
//         message: "Property not found",
//       });
//     }

//     /*
//       Recommended:
//       only LIVE properties boost hon
//     */

//     if (property.status !== "Live") {
//       return res.status(400).json({
//         success: false,
//         message:
//           "Only Live property can be boosted",
//       });
//     }

//     const startDate = new Date();

//     const endDate = new Date();

//     endDate.setDate(
//       endDate.getDate() + Number(days)
//     );

//     property.boost = {
//       isBoosted: true,

//       boostType,

//       startDate,

//       endDate,

//       boostedBy: {
//         userId: req.user._id,
//         name: req.user.name,
//         role: req.user.role,
//       },
//     };

//     await property.save();

//     return res.status(200).json({
//       success: true,
//       message: "Property boosted successfully",
//       data: property,
//     });
//   } catch (error) {
//     return res.status(500).json({
//       success: false,
//       message: "Property boost failed",
//       error: error.message,
//     });
//   }
// };

// export const removePropertyBoost = async (
//   req,
//   res
// ) => {
//   try {
//     const property = await Property.findById(
//       req.params.id
//     );

//     if (!property) {
//       return res.status(404).json({
//         success: false,
//         message: "Property not found",
//       });
//     }

//     property.boost = {
//       isBoosted: false,
//       boostType: null,
//       startDate: null,
//       endDate: null,

//       boostedBy: {
//         userId: null,
//         name: "",
//         role: "",
//       },
//     };

//     await property.save();

//     return res.status(200).json({
//       success: true,
//       message: "Property boost removed",
//       data: property,
//     });
//   } catch (error) {
//     return res.status(500).json({
//       success: false,
//       message: "Unable to remove boost",
//       error: error.message,
//     });
//   }
// };

// export const getPropertiesByPartner = async (
//   req,
//   res
// ) => {
//   try {
//     const properties = await Property.find({
//       "addedBy.partnerId":
//         req.params.partnerId,
//     }).sort({
//       createdAt: -1,
//     });

//     return res.status(200).json({
//       success: true,
//       count: properties.length,
//       data: properties,
//     });
//   } catch (error) {
//     return res.status(500).json({
//       success: false,
//       message:
//         "Unable to get partner properties",
//       error: error.message,
//     });
//   }
// };

// export const getAllProperties = async (req, res) => {
//   try {
//     const {
//       role,
//       status,
//       city,
//       search,
//     } = req.query;

//     const query = {};

//     // ==================================================
//     // FILTER BY WHO ADDED PROPERTY
//     // Admin | Partner | Seller
//     // ==================================================

//     if (
//       role &&
//       role !== "All"
//     ) {
//       const normalizedRole =
//         String(role)
//           .trim()
//           .toLowerCase();

//       if (
//         normalizedRole ===
//         "admin"
//       ) {
//         query["addedBy.role"] =
//           "Admin";
//       }

//       if (
//         normalizedRole ===
//         "partner"
//       ) {
//         query["addedBy.role"] =
//           "Partner";
//       }

//       if (
//         normalizedRole ===
//         "seller"
//       ) {
//         query["addedBy.role"] =
//           "Seller";
//       }
//     }

//     // ==================================================
//     // STATUS FILTER
//     // ==================================================

//     if (
//       status &&
//       status !== "All"
//     ) {
//       query.status = status;
//     }

//     // ==================================================
//     // CITY FILTER
//     // ==================================================

//     if (
//       city &&
//       city !== "All"
//     ) {
//       query.city = {
//         $regex: city,
//         $options: "i",
//       };
//     }

//     // ==================================================
//     // SEARCH
//     // ==================================================

//     if (
//       search &&
//       search.trim()
//     ) {
//       query.$or = [
//         {
//           title: {
//             $regex:
//               search.trim(),
//             $options: "i",
//           },
//         },

//         {
//           propertyId: {
//             $regex:
//               search.trim(),
//             $options: "i",
//           },
//         },

//         {
//           projectName: {
//             $regex:
//               search.trim(),
//             $options: "i",
//           },
//         },

//         {
//           developerName: {
//             $regex:
//               search.trim(),
//             $options: "i",
//           },
//         },

//         {
//           city: {
//             $regex:
//               search.trim(),
//             $options: "i",
//           },
//         },

//         {
//           locality: {
//             $regex:
//               search.trim(),
//             $options: "i",
//           },
//         },

//         {
//           address: {
//             $regex:
//               search.trim(),
//             $options: "i",
//           },
//         },

//         {
//           "addedBy.name": {
//             $regex:
//               search.trim(),
//             $options: "i",
//           },
//         },

//         {
//           "addedBy.sellerId": {
//             $regex:
//               search.trim(),
//             $options: "i",
//           },
//         },

//         {
//           "addedBy.partnerId": {
//             $regex:
//               search.trim(),
//             $options: "i",
//           },
//         },
//       ];
//     }

//     console.log(
//       "GET ALL PROPERTY QUERY:",
//       query
//     );

//     // ==================================================
//     // GET PROPERTIES
//     // ==================================================

//     const properties =
//       await Property.find(
//         query
//       )
//         .populate(
//           "assignedPartner.partnerId",
//           "partnerId name email phone partnerType isVerified"
//         )
//         .sort({
//           createdAt: -1,
//         })
//         .lean();

//     // ==================================================
//     // COUNTS
//     // ==================================================

//     const [
//       total,
//       adminCount,
//       partnerCount,
//       sellerCount,
//     ] = await Promise.all([
//       Property.countDocuments(),

//       Property.countDocuments({
//         "addedBy.role":
//           "Admin",
//       }),

//       Property.countDocuments({
//         "addedBy.role":
//           "Partner",
//       }),

//       Property.countDocuments({
//         "addedBy.role":
//           "Seller",
//       }),
//     ]);

//     return res
//       .status(200)
//       .json({
//         success: true,

//         message:
//           "Properties fetched successfully",

//         count:
//           properties.length,

//         total,

//         counts: {
//           all: total,
//           admin:
//             adminCount,
//           partner:
//             partnerCount,
//           seller:
//             sellerCount,
//         },

//         data: properties,
//       });
//   } catch (error) {
//     console.error(
//       "GET ALL PROPERTY ERROR:",
//       error
//     );

//     return res
//       .status(500)
//       .json({
//         success: false,

//         message:
//           "Failed to fetch properties",

//         error:
//           error.message,
//       });
//   }
// };
// export const deleteProperty = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const property = await Property.findById(id);

//     if (!property) {
//       return res.status(404).json({
//         success: false,
//         message: "Property not found",
//       });
//     }

//     await Property.findByIdAndDelete(id);

//     return res.status(200).json({
//       success: true,
//       message: "Property deleted successfully",
//       data: {
//         _id: id,
//       },
//     });

//   } catch (error) {
//     console.error(
//       "DELETE PROPERTY ERROR:",
//       error
//     );

//     return res.status(500).json({
//       success: false,
//       message: "Failed to delete property",
//       error: error.message,
//     });
//   }
// };

import Property from "../../models/NewProperty.js";
import { getPropertyCreator } from "../../utils/getPropertyCreator.js";
import Partner from "../../models/Partner.js";
const generatePropertyId = async () => {
  const lastProperty =
    await Property.findOne()
      .sort({ createdAt: -1 })
      .select("propertyId");

  let nextNumber = 1001;

  if (lastProperty?.propertyId) {
    const currentNumber =
      parseInt(
        lastProperty.propertyId.replace(
          "DW-",
          ""
        )
      ) || 1000;

    nextNumber =
      currentNumber + 1;
  }

  return `DW-${nextNumber}`;
};

// export const createProperty = async (
//   req,
//   res
// ) => {
//   try {
//     // ==================================================
//     // CREATOR FROM FRONTEND
//     // ==================================================

//     const {
//       creatorId,
//       creatorRole,
//     } = req.body;

//     if (
//       !creatorId ||
//       !creatorRole
//     ) {
//       return res
//         .status(400)
//         .json({
//           success: false,
//           message:
//             "Property creator ID and role are required.",
//         });
//     }

//     // ==================================================
//     // FETCH REAL USER DETAILS FROM DB
//     // ==================================================

//     const creator =
//       await getPropertyCreator(
//         creatorId,
//         creatorRole
//       );

//     if (!creator) {
//       return res
//         .status(404)
//         .json({
//           success: false,
//           message:
//             "Property creator account not found.",
//         });
//     }

//     // ==================================================
//     // PROPERTY BODY
//     // ==================================================

//     const {
//       title,
//       transactionType,
//       category,
//       status,

//       propertySize,
//       sizeUnit,

//       price,

//       projectName,
//       developerName,
//       description,

//       city,
//       locality,
//       pinCode,
//       address,
//       latitude,
//       longitude,

//       maintenance,
//       bookingAmount,
//       negotiable,

//       superBuiltupArea,
//       carpetArea,

//       bedrooms,
//       bathrooms,
//       balconies,
//       parking,

//       floorNo,
//       totalFloors,
//       facing,
//       furnishing,

//       amenities,
//       images,

//       floorPlan,
//       reraCertificate,

//       videoLink,
//       video,

//       tags,
//     } = req.body;

//     // ==================================================
//     // VALIDATION
//     // ==================================================

//     if (!title?.trim()) {
//       return res
//         .status(400)
//         .json({
//           success: false,
//           message:
//             "Property title is required.",
//         });
//     }

//     if (!transactionType) {
//       return res
//         .status(400)
//         .json({
//           success: false,
//           message:
//             "Transaction type is required.",
//         });
//     }

//     if (!category) {
//       return res
//         .status(400)
//         .json({
//           success: false,
//           message:
//             "Property category is required.",
//         });
//     }

//     if (
//       !propertySize ||
//       Number(propertySize) <= 0
//     ) {
//       return res
//         .status(400)
//         .json({
//           success: false,
//           message:
//             "Valid property size is required.",
//         });
//     }

//     if (
//       !price ||
//       Number(price) <= 0
//     ) {
//       return res
//         .status(400)
//         .json({
//           success: false,
//           message:
//             "Valid property price is required.",
//         });
//     }

//     // ==================================================
//     // PROPERTY ID
//     // ==================================================

//     const propertyId =
//       await generatePropertyId();

//     // ==================================================
//     // CREATE PROPERTY
//     // ==================================================

//     const property =
//       await Property.create({
//         propertyId,

//         title:
//           title.trim(),

//         transactionType,
//         category,

//         status:
//           status || "Draft",

//         propertySize:
//           Number(propertySize),

//         sizeUnit:
//           sizeUnit || "sqft",

//         price:
//           Number(price),

//         projectName:
//           projectName || "",

//         developerName:
//           developerName || "",

//         description:
//           description || "",

//         city:
//           city || "",

//         locality:
//           locality || "",

//         pinCode:
//           pinCode || "",

//         address:
//           address || "",

//         latitude:
//           latitude !==
//             undefined &&
//           latitude !== ""
//             ? Number(latitude)
//             : undefined,

//         longitude:
//           longitude !==
//             undefined &&
//           longitude !== ""
//             ? Number(longitude)
//             : undefined,

//         maintenance:
//           maintenance !==
//             undefined &&
//           maintenance !== ""
//             ? Number(
//                 maintenance
//               )
//             : undefined,

//         bookingAmount:
//           bookingAmount !==
//             undefined &&
//           bookingAmount !== ""
//             ? Number(
//                 bookingAmount
//               )
//             : undefined,

//         negotiable:
//           Boolean(negotiable),

//         superBuiltupArea:
//           superBuiltupArea !==
//             undefined &&
//           superBuiltupArea !== ""
//             ? Number(
//                 superBuiltupArea
//               )
//             : undefined,

//         carpetArea:
//           carpetArea !==
//             undefined &&
//           carpetArea !== ""
//             ? Number(
//                 carpetArea
//               )
//             : undefined,

//         bedrooms:
//           bedrooms || "",

//         bathrooms:
//           bathrooms || "",

//         balconies:
//           balconies || "",

//         parking:
//           parking || "",

//         floorNo:
//           floorNo !==
//             undefined &&
//           floorNo !== ""
//             ? Number(floorNo)
//             : undefined,

//         totalFloors:
//           totalFloors !==
//             undefined &&
//           totalFloors !== ""
//             ? Number(
//                 totalFloors
//               )
//             : undefined,

//         facing:
//           facing || "",

//         furnishing:
//           furnishing || "",

//         amenities:
//           Array.isArray(
//             amenities
//           )
//             ? amenities
//             : [],

//         images:
//           Array.isArray(
//             images
//           )
//             ? images
//             : [],

//         floorPlan:
//           floorPlan || "",

//         reraCertificate:
//           reraCertificate || "",

//         videoLink:
//           videoLink || "",

//         video:
//           video || "",

//         tags:
//           Array.isArray(
//             tags
//           )
//             ? tags
//             : [],

//         // ==================================================
//         // CREATOR
//         // ==================================================

//         addedBy: {
//           userId:
//             creator.userId,

//           sellerId:
//             creator.sellerId ||
//             null,

//           partnerId:
//             creator.partnerId ||
//             null,

//           partnerType:
//             creator.partnerType ||
//             null,

//           role:
//             creator.role,

//           name:
//             creator.name,

//           email:
//             creator.email ||
//             "",

//           phone:
//             creator.phone ||
//             "",
//         },

//         // ==================================================
//         // STATUS HISTORY
//         // ==================================================

//         statusHistory: [
//           {
//             status:
//               status ||
//               "Draft",

//             updatedBy: {
//               userId:
//                 creator.userId,

//               name:
//                 creator.name,

//               role:
//                 creator.role,
//             },

//             remarks:
//               "Property created",
//           },
//         ],
//       });

//     return res
//       .status(201)
//       .json({
//         success: true,

//         message:
//           "Property added successfully.",

//         data: property,
//       });
//   } catch (error) {
//     console.error(
//       "Create Property Error:",
//       error
//     );

//     if (
//       error.name ===
//       "ValidationError"
//     ) {
//       return res
//         .status(400)
//         .json({
//           success: false,

//           message:
//             "Property validation failed.",

//           errors:
//             Object.values(
//               error.errors
//             ).map(
//               (item) =>
//                 item.message
//             ),
//         });
//     }

//     if (
//       error.code === 11000
//     ) {
//       return res
//         .status(409)
//         .json({
//           success: false,
//           message:
//             "Duplicate property ID. Please try again.",
//         });
//     }

//     return res
//       .status(500)
//       .json({
//         success: false,

//         message:
//           "Failed to add property.",

//         error:
//           error.message,
//       });
//   }
// };

export const createProperty =
  async (req, res) => {
    try {
      console.log(
        "PROPERTY BODY:",
        req.body
      );

      console.log(
        "PROPERTY FILES:",
        req.files
      );

      // ==================================================
      // CREATOR
      // ==================================================

      const {
        creatorId,
        creatorRole,
      } = req.body;

      if (
        !creatorId ||
        !creatorRole
      ) {
        return res
          .status(400)
          .json({
            success: false,

            message:
              "Property creator ID and role are required.",
          });
      }


      const creator =
        await getPropertyCreator(
          creatorId,
          creatorRole
        );


      if (!creator) {
        return res
          .status(404)
          .json({
            success: false,

            message:
              "Property creator account not found.",
          });
      }


      // ==================================================
      // VALIDATION
      // ==================================================

      if (
        !req.body.title
          ?.trim()
      ) {
        return res
          .status(400)
          .json({
            success: false,

            message:
              "Property title is required.",
          });
      }


      if (
        !req.body
          .transactionType
      ) {
        return res
          .status(400)
          .json({
            success: false,

            message:
              "Transaction type is required.",
          });
      }


      if (
        !req.body.category
      ) {
        return res
          .status(400)
          .json({
            success: false,

            message:
              "Property category is required.",
          });
      }


      if (
        !req.body
          .propertySize ||
        Number(
          req.body
            .propertySize
        ) <= 0
      ) {
        return res
          .status(400)
          .json({
            success: false,

            message:
              "Valid property size is required.",
          });
      }


      if (
        !req.body.price ||
        Number(
          req.body.price
        ) <= 0
      ) {
        return res
          .status(400)
          .json({
            success: false,

            message:
              "Valid property price is required.",
          });
      }


      // ==================================================
      // PARSE FORM DATA JSON
      // ==================================================

      const parseJSON = (
        value,
        fallback
      ) => {
        if (
          typeof value ===
          "string"
        ) {
          try {
            return JSON.parse(
              value
            );
          } catch {
            return fallback;
          }
        }

        return (
          value ??
          fallback
        );
      };


      const amenities =
        parseJSON(
          req.body.amenities,
          []
        );


      const tags =
        parseJSON(
          req.body.tags,
          []
        );


      // ==================================================
      // IMAGES
      // ==================================================

      const images =
        Array.isArray(
          req.files?.images
        )
          ? req.files.images.map(
              (
                file
              ) => ({
                url:
                  file.path ||
                  file.secure_url ||
                  "",

                public_id:
                  file.filename ||
                  file.public_id ||
                  "",
              })
            )
          : [];


      // ==================================================
      // FLOOR PLAN
      // ==================================================

      const floorPlanUrl =
        req.files
          ?.floorPlan?.[0]
          ?.path ||
        req.files
          ?.floorPlan?.[0]
          ?.secure_url ||
        "";


      // ==================================================
      // RERA
      // ==================================================

      const reraCertificateUrl =
        req.files
          ?.reraCertificate?.[0]
          ?.path ||
        req.files
          ?.reraCertificate?.[0]
          ?.secure_url ||
        "";


      // ==================================================
      // VIDEO FILE
      // ==================================================

      const videoUrl =
        req.files
          ?.video?.[0]
          ?.path ||
        req.files
          ?.video?.[0]
          ?.secure_url ||
        "";


      // ==================================================
      // PROPERTY ID
      // ==================================================

      const propertyId =
        await generatePropertyId();


      // ==================================================
      // BOOLEAN FIX
      // FormData me "false" bhi string hota hai.
      // Boolean("false") => true hota hai.
      // ==================================================

      const negotiable =
        String(
          req.body.negotiable
        ).toLowerCase() ===
        "true";


      // ==================================================
      // CREATE
      // ==================================================

      const property =
        await Property.create({
          propertyId,

          title:
            req.body.title.trim(),

          transactionType:
            req.body
              .transactionType,

          category:
            req.body.category,

          status:
            req.body.status ||
            "Draft",

          propertySize:
            Number(
              req.body
                .propertySize
            ),

          sizeUnit:
            req.body
              .sizeUnit ||
            "sqft",

          price:
            Number(
              req.body.price
            ),

          projectName:
            req.body
              .projectName ||
            "",

          developerName:
            req.body
              .developerName ||
            "",

          description:
            req.body
              .description ||
            "",

          // LOCATION
          city:
            req.body.city ||
            "",

          locality:
            req.body
              .locality ||
            "",

          pinCode:
            req.body
              .pinCode ||
            "",

          address:
            req.body
              .address ||
            "",

          latitude:
            req.body
              .latitude !==
              undefined &&
            req.body
              .latitude !==
              ""
              ? Number(
                  req.body
                    .latitude
                )
              : undefined,

          longitude:
            req.body
              .longitude !==
              undefined &&
            req.body
              .longitude !==
              ""
              ? Number(
                  req.body
                    .longitude
                )
              : undefined,

          // PRICING
          maintenance:
            req.body
              .maintenance !==
              undefined &&
            req.body
              .maintenance !==
              ""
              ? Number(
                  req.body
                    .maintenance
                )
              : undefined,

          bookingAmount:
            req.body
              .bookingAmount !==
              undefined &&
            req.body
              .bookingAmount !==
              ""
              ? Number(
                  req.body
                    .bookingAmount
                )
              : undefined,

          negotiable,

          // SPECS
          superBuiltupArea:
            req.body
              .superBuiltupArea !==
              undefined &&
            req.body
              .superBuiltupArea !==
              ""
              ? Number(
                  req.body
                    .superBuiltupArea
                )
              : undefined,

          carpetArea:
            req.body
              .carpetArea !==
              undefined &&
            req.body
              .carpetArea !==
              ""
              ? Number(
                  req.body
                    .carpetArea
                )
              : undefined,

          bedrooms:
            req.body
              .bedrooms ||
            "",

          bathrooms:
            req.body
              .bathrooms ||
            "",

          balconies:
            req.body
              .balconies ||
            "",

          parking:
            req.body
              .parking ||
            "",

          floorNo:
            req.body
              .floorNo !==
              undefined &&
            req.body
              .floorNo !==
              ""
              ? Number(
                  req.body
                    .floorNo
                )
              : undefined,

          totalFloors:
            req.body
              .totalFloors !==
              undefined &&
            req.body
              .totalFloors !==
              ""
              ? Number(
                  req.body
                    .totalFloors
                )
              : undefined,

          facing:
            req.body
              .facing ||
            "",

          furnishing:
            req.body
              .furnishing ||
            "",

          amenities:
            Array.isArray(
              amenities
            )
              ? amenities
              : [],

          tags:
            Array.isArray(
              tags
            )
              ? tags
              : [],

          // FILES
          images,

          floorPlan:
            floorPlanUrl,

          reraCertificate:
            reraCertificateUrl,

          videoLink:
            req.body
              .videoLink ||
            "",

          video:
            videoUrl,

          // CREATOR
          addedBy: {
            userId:
              creator.userId,

            sellerId:
              creator.sellerId ||
              null,

            partnerId:
              creator.partnerId ||
              null,

            partnerType:
              creator.partnerType ||
              null,

            role:
              creator.role,

            name:
              creator.name,

            email:
              creator.email ||
              "",

            phone:
              creator.phone ||
              "",
          },

          // HISTORY
          statusHistory: [
            {
              status:
                req.body
                  .status ||
                "Draft",

              updatedBy: {
                userId:
                  creator.userId,

                name:
                  creator.name,

                role:
                  creator.role,
              },

              remarks:
                "Property created",
            },
          ],
        });


      return res
        .status(201)
        .json({
          success: true,

          message:
            "Property added successfully.",

          data: property,
        });

    } catch (error) {
      console.error(
        "CREATE PROPERTY ERROR:",
        error
      );


      if (
        error.name ===
        "MulterError"
      ) {
        return res
          .status(400)
          .json({
            success: false,

            message:
              error.message,
          });
      }


      if (
        error.name ===
        "ValidationError"
      ) {
        return res
          .status(400)
          .json({
            success: false,

            message:
              "Property validation failed.",

            errors:
              Object.values(
                error.errors
              ).map(
                (item) =>
                  item.message
              ),
          });
      }


      if (
        error.code ===
        11000
      ) {
        return res
          .status(409)
          .json({
            success: false,

            message:
              "Duplicate property ID. Please try again.",
          });
      }


      return res
        .status(500)
        .json({
          success: false,

          message:
            "Failed to add property.",

          error:
            error.message,
        });
    }
  };
export const updateProperty = async (req, res) => {
  try {
    const { id } = req.params;

    // Find Property
    let property = await Property.findById(id);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found.",
      });
    }

    // Helper to safely parse JSON strings from FormData
    const parseJSON = (data, fallback) => {
      if (typeof data === "string") {
        try {
          return JSON.parse(data);
        } catch (e) {
          return fallback;
        }
      }
      return data !== undefined ? data : fallback;
    };

    // Extract updates
    const updateData = { ...req.body };

    // Format & Parse Arrays
    if (updateData.amenities) updateData.amenities = parseJSON(updateData.amenities, property.amenities);
    if (updateData.tags) updateData.tags = parseJSON(updateData.tags, property.tags);

    // Number Conversions
    if (updateData.propertySize) updateData.propertySize = Number(updateData.propertySize);
    if (updateData.price) updateData.price = Number(updateData.price);
    if (updateData.latitude) updateData.latitude = Number(updateData.latitude);
    if (updateData.longitude) updateData.longitude = Number(updateData.longitude);

    // Image Handling
    let updatedImages = property.images || [];

    // Agar frontend se 'existingImages' bhej rahe hain to unko maintain karein
    if (req.body.existingImages) {
      updatedImages = parseJSON(req.body.existingImages, property.images);
    }

    // Handle Nayi Uploaded Files
    if (req.files) {
      if (Array.isArray(req.files) && req.files.length > 0) {
        const newImages = req.files.map((file) => ({
          url: file.path || file.secure_url,
          public_id: file.filename || file.public_id,
        }));
        updatedImages = [...updatedImages, ...newImages];
      } else {
        // Agar multer fields setup hai
        if (req.files.images && req.files.images.length > 0) {
          const newImages = req.files.images.map((file) => ({
            url: file.path || file.secure_url,
            public_id: file.filename || file.public_id,
          }));
          updatedImages = [...updatedImages, ...newImages];
        }
        if (req.files.floorPlan && req.files.floorPlan[0]) {
          updateData.floorPlan = req.files.floorPlan[0].path || req.files.floorPlan[0].secure_url;
        }
        if (req.files.reraCertificate && req.files.reraCertificate[0]) {
          updateData.reraCertificate = req.files.reraCertificate[0].path || req.files.reraCertificate[0].secure_url;
        }
      }
    }

    updateData.images = updatedImages;

    // Maintain Status History (Agar status update ho raha ho)
    if (req.body.status && req.body.status !== property.status) {
      const statusLog = {
        status: req.body.status,
        updatedBy: {
          userId: req.body.updatedByUserId || property.addedBy?.userId,
          name: req.body.updatedByName || property.addedBy?.name,
          role: req.body.updatedByRole || property.addedBy?.role,
        },
        remarks: req.body.statusRemarks || "Property status updated",
      };

      updateData.statusHistory = [...(property.statusHistory || []), statusLog];
    }

    // Apply updates and Save
    const updatedProperty = await Property.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    return res.status(200).json({
      success: true,
      message: "Property updated successfully.",
      data: updatedProperty,
    });
  } catch (error) {
    console.error("Update Property Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update property.",
      error: error.message,
    });
  }
};
export const getAdminProperties = async (req, res) => {
  try {
    const {
      status,
      search,
      partnerId,
      boosted,
    } = req.query;

    const query = {};

    if (status && status !== "All") {
      query.status = status;
    }

    if (partnerId) {
      query["addedBy.partnerId"] = partnerId;
    }

    if (boosted === "true") {
      query["boost.isBoosted"] = true;
    }

    if (search) {
      query.$or = [
        {
          title: {
            $regex: search,
            $options: "i",
          },
        },

        {
          propertyId: {
            $regex: search,
            $options: "i",
          },
        },

        {
          city: {
            $regex: search,
            $options: "i",
          },
        },

        {
          locality: {
            $regex: search,
            $options: "i",
          },
        },

        {
          "addedBy.name": {
            $regex: search,
            $options: "i",
          },
        },

        {
          "addedBy.partnerId": {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    const properties = await Property.find(query)
      .populate(
        "assignedPartner.partnerId",
        "name email phone partnerCode partnerType"
      )
      .sort({
        "boost.isBoosted": -1,
        createdAt: -1,
      });

    return res.status(200).json({
      success: true,
      count: properties.length,
      data: properties,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch properties",
      error: error.message,
    });
  }
};

export const getAdminPropertyById = async (
  req,
  res
) => {
  try {
    const property = await Property.findById(
      req.params.id
    ).populate(
      "assignedPartner.partnerId",
      "name email phone partnerCode partnerType"
    );

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: property,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to get property",
      error: error.message,
    });
  }
};

// export const updatePropertyStatus = async (
//   req,
//   res
// ) => {
//   try {
//     const {
//       status,
//       notes = "",
//       rejectionReason = "",
//     } = req.body;

//     const allowedStatuses = [
//       "Reviewing",
//       "Verified",
//       "Live",
//       "Rejected",
//       "Sold",
//       "Rented",
//     ];

//     if (!allowedStatuses.includes(status)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid property status",
//       });
//     }

//     const property = await Property.findById(
//       req.params.id
//     );

//     if (!property) {
//       return res.status(404).json({
//         success: false,
//         message: "Property not found",
//       });
//     }

//     property.status = status;

//     property.review.notes = notes;

//     property.review.reviewedBy = {
//       userId: req.user._id,
//       name: req.user.name,
//       role: req.user.role,
//     };

//     property.review.reviewedAt = new Date();

//     if (status === "Rejected") {
//       property.review.rejectionReason =
//         rejectionReason;
//     } else {
//       property.review.rejectionReason = "";
//     }

//     /*
//       Audit history
//     */

//     property.statusHistory.push({
//       status,

//       updatedBy: {
//         userId: req.user._id,
//         name: req.user.name,
//         role: req.user.role,
//       },

//       remarks:
//         status === "Rejected"
//           ? rejectionReason
//           : notes,
//     });

//     /*
//       Sold / Rented / Rejected hua to
//       boost automatically remove
//     */

//     if (
//       ["Sold", "Rented", "Rejected"].includes(
//         status
//       )
//     ) {
//       property.boost.isBoosted = false;
//       property.boost.startDate = null;
//       property.boost.endDate = null;
//     }

//     await property.save();

//     return res.status(200).json({
//       success: true,
//       message: `Property status changed to ${status}`,
//       data: property,
//     });
//   } catch (error) {
//     console.error(error);

//     return res.status(500).json({
//       success: false,
//       message: "Unable to update status",
//       error: error.message,
//     });
//   }
// };


export const updatePropertyStatus = async (
  req,
  res
) => {
  try {
    const {
      status,
      notes = "",
      rejectionReason = "",
    } = req.body;

    // ======================================================
    // ALLOWED PROPERTY STATUSES
    // ======================================================

    const allowedStatuses = [
      "Reviewing",
      "Verified",
      "Live",
      "Rejected",
      "Sold",
      "Rented",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid property status",
      });
    }

    // ======================================================
    // FIND PROPERTY
    // ======================================================

    const property =
      await Property.findById(
        req.params.id
      );

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }

    // Previous status history / validation ke liye
    const previousStatus =
      property.status;

    // ======================================================
    // PROPERTY STATUS UPDATE
    // ======================================================

    property.status = status;

    // ======================================================
    // PROPERTY VERIFICATION STATUS
    // ======================================================

    /*
      IMPORTANT:

      status = Reviewing
          ↓
      propertyVerificationStatus = In_Progress

      status = Verified
          ↓
      propertyVerificationStatus = Verified

      status = Rejected
          ↓
      propertyVerificationStatus = Rejected

      status = Live / Sold / Rented
          ↓
      verification status ko change nahi karna
    */

    if (status === "Reviewing") {
      property.propertyVerificationStatus =
        "In_Progress";
    }

    if (status === "Verified") {
      property.propertyVerificationStatus =
        "Verified";
    }

    if (status === "Rejected") {
      property.propertyVerificationStatus =
        "Rejected";
    }

    // ======================================================
    // OPTIONAL SAFETY:
    // LIVE PROPERTY MUST ALREADY BE VERIFIED
    // ======================================================

    if (
      status === "Live" &&
      property.propertyVerificationStatus !==
        "Verified"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Property must be verified before making it Live.",
      });
    }

    // ======================================================
    // ADMIN REVIEW
    // ======================================================

    property.review.notes = notes;

    property.review.reviewedBy = {
      userId: req.user._id,
      name: req.user.name,
      role: req.user.role,
    };

    property.review.reviewedAt =
      new Date();

    // ======================================================
    // REJECTION
    // ======================================================

    if (status === "Rejected") {
      property.review.rejectionReason =
        rejectionReason;
    } else {
      property.review.rejectionReason =
        "";
    }

    // ======================================================
    // STATUS HISTORY
    // ======================================================

    property.statusHistory.push({
      status,

      updatedBy: {
        userId: req.user._id,
        name: req.user.name,
        role: req.user.role,
      },

      remarks:
        status === "Rejected"
          ? rejectionReason
          : notes ||
            `Property status changed from ${previousStatus} to ${status}`,
    });

    // ======================================================
    // REMOVE BOOST
    // Sold / Rented / Rejected
    // ======================================================

    if (
      [
        "Sold",
        "Rented",
        "Rejected",
      ].includes(status)
    ) {
      property.boost.isBoosted =
        false;

      property.boost.boostType =
        null;

      property.boost.startDate =
        null;

      property.boost.endDate =
        null;

      property.boost.boostedBy = {
        userId: null,
        name: "",
        role: "",
      };
    }

    // ======================================================
    // SAVE
    // ======================================================

    await property.save();

    return res.status(200).json({
      success: true,

      message:
        `Property status changed from ${previousStatus} to ${status}`,

      data: property,
    });

  } catch (error) {
    console.error(
      "UPDATE PROPERTY STATUS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to update property status",
      error: error.message,
    });
  }
};

export const boostProperty = async (
  req,
  res
) => {
  try {
    const {
      boostType = "Featured",
      days = 7,
    } = req.body;

    const property = await Property.findById(
      req.params.id
    );

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }

    /*
      Recommended:
      only LIVE properties boost hon
    */

    if (property.status !== "Live") {
      return res.status(400).json({
        success: false,
        message:
          "Only Live property can be boosted",
      });
    }

    const startDate = new Date();

    const endDate = new Date();

    endDate.setDate(
      endDate.getDate() + Number(days)
    );

    property.boost = {
      isBoosted: true,

      boostType,

      startDate,

      endDate,

      boostedBy: {
        userId: req.user._id,
        name: req.user.name,
        role: req.user.role,
      },
    };

    await property.save();

    return res.status(200).json({
      success: true,
      message: "Property boosted successfully",
      data: property,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Property boost failed",
      error: error.message,
    });
  }
};

export const removePropertyBoost = async (
  req,
  res
) => {
  try {
    const property = await Property.findById(
      req.params.id
    );

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }

    property.boost = {
      isBoosted: false,
      boostType: null,
      startDate: null,
      endDate: null,

      boostedBy: {
        userId: null,
        name: "",
        role: "",
      },
    };

    await property.save();

    return res.status(200).json({
      success: true,
      message: "Property boost removed",
      data: property,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to remove boost",
      error: error.message,
    });
  }
};

export const getPropertiesByPartner = async (
  req,
  res
) => {
  try {
    const properties = await Property.find({
      "addedBy.partnerId":
        req.params.partnerId,
    }).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      count: properties.length,
      data: properties,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message:
        "Unable to get partner properties",
      error: error.message,
    });
  }
};

export const getAllProperties = async (req, res) => {
  try {
    const {
      role,
      status,
      city,
      search,
    } = req.query;

    const query = {};

    // ==================================================
    // FILTER BY WHO ADDED PROPERTY
    // Admin | Partner | Seller
    // ==================================================

    if (
      role &&
      role !== "All"
    ) {
      const normalizedRole =
        String(role)
          .trim()
          .toLowerCase();

      if (
        normalizedRole ===
        "admin"
      ) {
        query["addedBy.role"] =
          "Admin";
      }

      if (
        normalizedRole ===
        "partner"
      ) {
        query["addedBy.role"] =
          "Partner";
      }

      if (
        normalizedRole ===
        "seller"
      ) {
        query["addedBy.role"] =
          "Seller";
      }
    }

    // ==================================================
    // STATUS FILTER
    // ==================================================

    if (
      status &&
      status !== "All"
    ) {
      query.status = status;
    }

    // ==================================================
    // CITY FILTER
    // ==================================================

    if (
      city &&
      city !== "All"
    ) {
      query.city = {
        $regex: city,
        $options: "i",
      };
    }

    // ==================================================
    // SEARCH
    // ==================================================

    if (
      search &&
      search.trim()
    ) {
      query.$or = [
        {
          title: {
            $regex:
              search.trim(),
            $options: "i",
          },
        },

        {
          propertyId: {
            $regex:
              search.trim(),
            $options: "i",
          },
        },

        {
          projectName: {
            $regex:
              search.trim(),
            $options: "i",
          },
        },

        {
          developerName: {
            $regex:
              search.trim(),
            $options: "i",
          },
        },

        {
          city: {
            $regex:
              search.trim(),
            $options: "i",
          },
        },

        {
          locality: {
            $regex:
              search.trim(),
            $options: "i",
          },
        },

        {
          address: {
            $regex:
              search.trim(),
            $options: "i",
          },
        },

        {
          "addedBy.name": {
            $regex:
              search.trim(),
            $options: "i",
          },
        },

        {
          "addedBy.sellerId": {
            $regex:
              search.trim(),
            $options: "i",
          },
        },

        {
          "addedBy.partnerId": {
            $regex:
              search.trim(),
            $options: "i",
          },
        },
      ];
    }

    console.log(
      "GET ALL PROPERTY QUERY:",
      query
    );

    // ==================================================
    // GET PROPERTIES
    // ==================================================

    const properties =
      await Property.find(
        query
      )
        .populate(
          "assignedPartner.partnerId",
          "partnerId name email phone partnerType isVerified"
        )
        .sort({
          createdAt: -1,
        })
        .lean();

    // ==================================================
    // COUNTS
    // ==================================================

    const [
      total,
      adminCount,
      partnerCount,
      sellerCount,
    ] = await Promise.all([
      Property.countDocuments(),

      Property.countDocuments({
        "addedBy.role":
          "Admin",
      }),

      Property.countDocuments({
        "addedBy.role":
          "Partner",
      }),

      Property.countDocuments({
        "addedBy.role":
          "Seller",
      }),
    ]);

    return res
      .status(200)
      .json({
        success: true,

        message:
          "Properties fetched successfully",

        count:
          properties.length,

        total,

        counts: {
          all: total,
          admin:
            adminCount,
          partner:
            partnerCount,
          seller:
            sellerCount,
        },

        data: properties,
      });
  } catch (error) {
    console.error(
      "GET ALL PROPERTY ERROR:",
      error
    );

    return res
      .status(500)
      .json({
        success: false,

        message:
          "Failed to fetch properties",

        error:
          error.message,
      });
  }
};
export const deleteProperty = async (req, res) => {
  try {
    const { id } = req.params;

    const property = await Property.findById(id);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }

    await Property.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Property deleted successfully",
      data: {
        _id: id,
      },
    });

  } catch (error) {
    console.error(
      "DELETE PROPERTY ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to delete property",
      error: error.message,
    });
  }
};

export const getFilteredLiveProperties =
  async (req, res) => {
    try {
      const {
        city,
        category,
        propertyType,
        transactionType,

        minPrice,
        maxPrice,

        bedrooms,
        bathrooms,
        furnishing,
        negotiable,

        search,

        page = 1,
        limit = 100,
      } = req.query;

      // ======================================================
      // DEFAULT CONDITIONS
      // ======================================================
      // Public API me ONLY:
      //
      // status = Live
      // propertyVerificationStatus = Verified
      //
      // ======================================================

      const query = {
        status: "Live",

        propertyVerificationStatus:
          "Verified",
      };

      // ======================================================
      // CITY
      // ======================================================

      if (
        city &&
        city !== "All"
      ) {
        const safeCity = city.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        query.city = {
          $regex:
            `^${safeCity}$`,
          $options: "i",
        };
      }

      // ======================================================
      // CATEGORY
      // ======================================================

      const requestedCategory = category || propertyType;

      if (
        requestedCategory &&
        requestedCategory !== "All"
      ) {
        const allowedCategories = [
          "Residential",
          "Commercial",
          "Rental",
          "Sell",
          "Plot/Land",
        ];

        const canonicalCategory = allowedCategories.find(
          (item) =>
            item.toLowerCase() === requestedCategory.trim().toLowerCase(),
        );

        if (!canonicalCategory) {
          return res
            .status(400)
            .json({
              success: false,
              message:
                "Invalid property category",
            });
        }

        query.category = canonicalCategory;
      }

      // ======================================================
      // TRANSACTION TYPE
      // ======================================================

      if (
        transactionType &&
        transactionType !== "All"
      ) {
        const normalizedTransaction =
          transactionType.trim().toLowerCase() === "lease"
            ? "Rent"
            : transactionType.trim().toLowerCase() === "sale"
              ? "Sale"
              : transactionType.trim().toLowerCase() === "rent"
                ? "Rent"
                : null;

        if (!normalizedTransaction) {
          return res
            .status(400)
            .json({
              success: false,

              message:
                "Invalid transaction type. Use Sale or Rent.",
            });
        }

        query.transactionType = normalizedTransaction;
      }

      // ======================================================
      // PRICE RANGE
      // ======================================================

      if (
        minPrice ||
        maxPrice
      ) {
        query.price = {};

        if (minPrice) {
          const parsedMinPrice =
            Number(minPrice);

          if (
            Number.isNaN(
              parsedMinPrice
            ) ||
            parsedMinPrice < 0
          ) {
            return res
              .status(400)
              .json({
                success:
                  false,

                message:
                  "minPrice must be a valid number",
              });
          }

          query.price.$gte =
            parsedMinPrice;
        }

        if (maxPrice) {
          const parsedMaxPrice =
            Number(maxPrice);

          if (
            Number.isNaN(
              parsedMaxPrice
            ) ||
            parsedMaxPrice < 0
          ) {
            return res
              .status(400)
              .json({
                success:
                  false,

                message:
                  "maxPrice must be a valid number",
              });
          }

          query.price.$lte =
            parsedMaxPrice;
        }

        if (
          minPrice &&
          maxPrice &&
          Number(minPrice) >
            Number(maxPrice)
        ) {
          return res
            .status(400)
            .json({
              success: false,

              message:
                "minPrice cannot be greater than maxPrice",
            });
        }
      }

      // ======================================================
      // BEDROOMS
      // ======================================================

      if (
        bedrooms &&
        bedrooms !== "All"
      ) {
        query.bedrooms =
          bedrooms;
      }

      // ======================================================
      // BATHROOMS
      // ======================================================

      if (
        bathrooms &&
        bathrooms !== "All"
      ) {
        query.bathrooms =
          bathrooms;
      }

      // ======================================================
      // FURNISHING
      // ======================================================

      if (
        furnishing &&
        furnishing !== "All"
      ) {
        query.furnishing =
          furnishing;
      }

      // ======================================================
      // NEGOTIABLE
      // ======================================================

      if (
        negotiable !==
          undefined &&
        negotiable !== ""
      ) {
        if (
          negotiable ===
            "true" ||
          negotiable ===
            "false"
        ) {
          query.negotiable =
            negotiable ===
            "true";
        }
      }

      // ======================================================
      // SEARCH
      // ======================================================

      if (search?.trim()) {
        const searchText =
          search.trim();

        query.$or = [
          {
            title: {
              $regex:
                searchText,
              $options: "i",
            },
          },

          {
            propertyId: {
              $regex:
                searchText,
              $options: "i",
            },
          },

          {
            projectName: {
              $regex:
                searchText,
              $options: "i",
            },
          },

          {
            developerName: {
              $regex:
                searchText,
              $options: "i",
            },
          },

          {
            city: {
              $regex:
                searchText,
              $options: "i",
            },
          },

          {
            locality: {
              $regex:
                searchText,
              $options: "i",
            },
          },

          {
            address: {
              $regex:
                searchText,
              $options: "i",
            },
          },
        ];
      }

      // ======================================================
      // PAGINATION
      // ======================================================

      const currentPage =
        Math.max(
          Number(page) || 1,
          1
        );

      const pageLimit =
        Math.min(
          Math.max(
            Number(limit) || 20,
            1
          ),
          100
        );

      const skip =
        (currentPage - 1) *
        pageLimit;

      // ======================================================
      // FETCH
      // ======================================================

      const [
        properties,
        totalProperties,
      ] =
        await Promise.all([
          Property.find(query)
            .populate(
              "assignedPartner.partnerId",

              "name email phone partnerId partnerCode partnerType"
            )

            .sort({
              "boost.isBoosted":
                -1,

              createdAt: -1,
            })

            .skip(skip)

            .limit(
              pageLimit
            )

            .lean(),

          Property.countDocuments(
            query
          ),
        ]);

      // ======================================================
      // RESPONSE
      // ======================================================

      return res
        .status(200)
        .json({
          success: true,

          message:
            "Live verified properties fetched successfully",

          count:
            properties.length,

          total:
            totalProperties,

          pagination: {
            currentPage,

            totalPages:
              Math.ceil(
                totalProperties /
                  pageLimit
              ),

            limit:
              pageLimit,
          },

          appliedFilters: {
            status: "Live",

            propertyVerificationStatus:
              "Verified",

            city:
              city || "All",

            category:
              query.category ||
              "All",

            transactionType:
              query.transactionType ||
              "All",

            minPrice:
              minPrice
                ? Number(
                    minPrice
                  )
                : null,

            maxPrice:
              maxPrice
                ? Number(
                    maxPrice
                  )
                : null,
          },

          data:
            properties,

          // Backward-compatible key used by the existing web frontend.
          properties,
        });

    } catch (error) {
      console.error(
        "GET FILTERED LIVE PROPERTIES ERROR:",
        error
      );

      return res
        .status(500)
        .json({
          success: false,

          message:
            "Failed to fetch properties",

          error:
            error.message,
        });
    }
  };
