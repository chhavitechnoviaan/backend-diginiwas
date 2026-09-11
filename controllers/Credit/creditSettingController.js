// import mongoose from "mongoose";

// import CreditSetting from "../../models/CreditSetting.js";

// import {
//   DEFAULT_CREDIT_SETTINGS,
// } from "../../config/creditPlans.js";

// import {
//   getOrCreateCreditSettings,
// } from "../../services/creditPricingService.js";

// const makeActor = (req) => ({
//   userId:
//     req.user?._id &&
//     mongoose.Types.ObjectId.isValid(
//       req.user._id
//     )
//       ? req.user._id
//       : null,

//   name:
//     req.user?.name ||
//     req.body?.actor?.name ||
//     "Admin",

//   role:
//     req.user?.role ||
//     req.body?.actor?.role ||
//     "Admin",
// });

// // ==========================================
// // GET CREDIT SETTINGS
// // GET /api/credit-settings
// // ==========================================

// export const getCreditSettings =
//   async (req, res) => {
//     try {
//       const settings =
//         await getOrCreateCreditSettings();

//       return res.status(200).json({
//         success: true,

//         message:
//           "Credit settings fetched successfully",

//         data: settings,
//       });
//     } catch (error) {
//       console.error(
//         "GET CREDIT SETTINGS ERROR:",
//         error
//       );

//       return res.status(500).json({
//         success: false,
//         message:
//           "Unable to fetch credit settings",
//         error: error.message,
//       });
//     }
//   };

// // ==========================================
// // UPDATE ALL CREDIT SETTINGS
// // PATCH /api/credit-settings
// // ==========================================

// export const updateCreditSettings =
//   async (req, res) => {
//     try {
//       const {
//         creditsPerRupee,
//         products,
//       } = req.body;

//       const settings =
//         await getOrCreateCreditSettings();

//       if (
//         creditsPerRupee !== undefined
//       ) {
//         const rate =
//           Number(creditsPerRupee);

//         if (
//           !Number.isFinite(rate) ||
//           rate <= 0
//         ) {
//           return res
//             .status(400)
//             .json({
//               success: false,
//               message:
//                 "creditsPerRupee must be greater than 0",
//             });
//         }

//         settings.creditsPerRupee =
//           rate;
//       }

//       if (Array.isArray(products)) {
//         for (const incoming of products) {
//           const existing =
//             settings.products.find(
//               (product) =>
//                 product.code ===
//                 incoming.code
//             );

//           if (!existing) {
//             return res
//               .status(400)
//               .json({
//                 success: false,
//                 message: `Invalid credit product: ${incoming.code}`,
//               });
//           }

//           if (
//             incoming.credits !==
//             undefined
//           ) {
//             const credits =
//               Number(
//                 incoming.credits
//               );

//             if (
//               !Number.isFinite(
//                 credits
//               ) ||
//               credits < 0
//             ) {
//               return res
//                 .status(400)
//                 .json({
//                   success: false,
//                   message: `Invalid credits for ${incoming.code}`,
//                 });
//             }

//             existing.credits =
//               credits;
//           }

//           if (
//             incoming.durationDays !==
//             undefined
//           ) {
//             existing.durationDays =
//               incoming.durationDays ===
//               null ||
//             incoming.durationDays ===
//               ""
//                 ? null
//                 : Number(
//                     incoming.durationDays
//                   );
//           }

//           if (
//             typeof incoming.isActive ===
//             "boolean"
//           ) {
//             existing.isActive =
//               incoming.isActive;
//           }
//         }
//       }

//       settings.version =
//         Number(
//           settings.version || 0
//         ) + 1;

//       settings.updatedBy =
//         makeActor(req);

//       await settings.save();

//       return res.status(200).json({
//         success: true,

//         message:
//           "Credit pricing updated successfully",

//         data: settings,
//       });
//     } catch (error) {
//       console.error(
//         "UPDATE CREDIT SETTINGS ERROR:",
//         error
//       );

//       return res.status(500).json({
//         success: false,
//         message:
//           "Unable to update credit settings",
//         error: error.message,
//       });
//     }
//   };

// // ==========================================
// // UPDATE SINGLE PRODUCT
// // PATCH /api/credit-settings/product/:code
// // ==========================================

// export const updateCreditProduct =
//   async (req, res) => {
//     try {
//       const { code } = req.params;

//       const {
//         credits,
//         durationDays,
//         isActive,
//       } = req.body;

//       const settings =
//         await getOrCreateCreditSettings();

//       const product =
//         settings.products.find(
//           (item) =>
//             item.code === code
//         );

//       if (!product) {
//         return res
//           .status(404)
//           .json({
//             success: false,
//             message:
//               "Credit product not found",
//           });
//       }

//       if (credits !== undefined) {
//         const value =
//           Number(credits);

//         if (
//           !Number.isFinite(value) ||
//           value < 0
//         ) {
//           return res
//             .status(400)
//             .json({
//               success: false,
//               message:
//                 "Invalid credit price",
//             });
//         }

//         product.credits = value;
//       }

//       if (
//         durationDays !== undefined
//       ) {
//         product.durationDays =
//           durationDays === null ||
//           durationDays === ""
//             ? null
//             : Number(durationDays);
//       }

//       if (
//         typeof isActive ===
//         "boolean"
//       ) {
//         product.isActive =
//           isActive;
//       }

//       settings.version += 1;

//       settings.updatedBy =
//         makeActor(req);

//       await settings.save();

//       return res.status(200).json({
//         success: true,
//         message:
//           `${product.label} updated successfully`,
//         data: product,
//       });
//     } catch (error) {
//       return res
//         .status(500)
//         .json({
//           success: false,
//           message:
//             "Unable to update product",
//           error: error.message,
//         });
//     }
//   };

// // ==========================================
// // RESET DEFAULT PRICING
// // ==========================================

// export const resetCreditSettings =
//   async (req, res) => {
//     try {
//       const settings =
//         await CreditSetting.findOneAndUpdate(
//           {
//             settingKey:
//               "GLOBAL_CREDIT_SETTING",
//           },
//           {
//             creditsPerRupee:
//               DEFAULT_CREDIT_SETTINGS
//                 .creditsPerRupee,

//             products:
//               DEFAULT_CREDIT_SETTINGS
//                 .products,

//             updatedBy:
//               makeActor(req),

//             $inc: {
//               version: 1,
//             },
//           },
//           {
//             new: true,
//             upsert: true,
//           }
//         );

//       return res.json({
//         success: true,
//         message:
//           "Default credit pricing restored",
//         data: settings,
//       });
//     } catch (error) {
//       return res
//         .status(500)
//         .json({
//           success: false,
//           message:
//             "Unable to reset settings",
//           error: error.message,
//         });
//     }
//   };


import mongoose from "mongoose";
import CreditSetting from "../../models/CreditSetting.js";
import { DEFAULT_CREDIT_SETTINGS } from "../../config/creditPlans.js";
import { getOrCreateCreditSettings } from "../../services/creditPricingService.js";
const actor = req => ({ userId: req.user?._id && mongoose.Types.ObjectId.isValid(req.user._id) ? req.user._id : null, name: req.user?.name || "Admin", role: req.user?.role || "Admin" });

export const getCreditSettings = async (req,res) => { try { const data = await getOrCreateCreditSettings(); res.json({success:true,data}); } catch(e){res.status(500).json({success:false,message:"Unable to fetch credit settings",error:e.message});} };
export const updateCreditSettings = async (req,res) => { try { const settings=await getOrCreateCreditSettings(); if(req.body.creditsPerRupee!==undefined){const r=Number(req.body.creditsPerRupee); if(!Number.isFinite(r)||r<=0)return res.status(400).json({success:false,message:"creditsPerRupee must be > 0"}); settings.creditsPerRupee=r;} if(Array.isArray(req.body.products)){for(const x of req.body.products){const p=settings.products.find(i=>i.code===x.code); if(!p)return res.status(400).json({success:false,message:`Invalid product ${x.code}`}); if(x.credits!==undefined)p.credits=Number(x.credits); if(x.durationDays!==undefined)p.durationDays=x.durationDays===""?null:Number(x.durationDays); if(typeof x.isActive==="boolean")p.isActive=x.isActive;}} settings.version+=1; settings.updatedBy=actor(req); await settings.save(); res.json({success:true,message:"Credit pricing updated",data:settings}); } catch(e){res.status(500).json({success:false,message:"Unable to update settings",error:e.message});} };
export const updateCreditProduct = async (req,res) => { try { const settings=await getOrCreateCreditSettings(); const p=settings.products.find(i=>i.code===req.params.code); if(!p)return res.status(404).json({success:false,message:"Product not found"}); if(req.body.credits!==undefined)p.credits=Number(req.body.credits); if(req.body.durationDays!==undefined)p.durationDays=req.body.durationDays===""?null:Number(req.body.durationDays); if(typeof req.body.isActive==="boolean")p.isActive=req.body.isActive; settings.version+=1; settings.updatedBy=actor(req); await settings.save(); res.json({success:true,message:`${p.label} updated`,data:p}); } catch(e){res.status(500).json({success:false,message:"Unable to update product",error:e.message});} };
export const resetCreditSettings = async (req,res) => { try { const data=await CreditSetting.findOneAndUpdate({settingKey:"GLOBAL_CREDIT_SETTING"},{$set:{creditsPerRupee:DEFAULT_CREDIT_SETTINGS.creditsPerRupee,products:DEFAULT_CREDIT_SETTINGS.products,updatedBy:actor(req)},$inc:{version:1}},{new:true,upsert:true}); res.json({success:true,message:"Default pricing restored",data}); } catch(e){res.status(500).json({success:false,message:"Unable to reset",error:e.message});} };
