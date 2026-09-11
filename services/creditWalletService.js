// // // import mongoose from "mongoose";
// // // import Partner from "../models/Partner.js";
// // // import CreditTransaction from "../models/CreditTransaction.js";

// // // const generateTransactionId = () =>
// // //   `CTX-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

// // // export const makeActor = (actor = {}) => ({
// // //   userId:
// // //     actor?.userId && mongoose.Types.ObjectId.isValid(actor.userId)
// // //       ? actor.userId
// // //       : null,
// // //   name: actor?.name || "System",
// // //   role: actor?.role || "System",
// // // });

// // // export const creditPartnerWallet = async ({
// // //   partnerId,
// // //   credits,
// // //   type,
// // //   amountInRupees = 0,
// // //   productCode = "",
// // //   referenceType = "",
// // //   referenceId = null,
// // //   relatedTransactionId = null,
// // //   payment = {},
// // //   description = "",
// // //   metadata = {},
// // //   actor = {},
// // //   session = null,
// // // }) => {
// // //   const qty = Number(credits);

// // //   if (!Number.isFinite(qty) || qty <= 0) {
// // //     throw new Error("Credits must be greater than 0");
// // //   }

// // //   const partner = await Partner.findById(partnerId).session(session);

// // //   if (!partner) throw new Error("Partner not found");

// // //   const before = Number(partner.creditWallet?.balance || 0);
// // //   const after = before + qty;

// // //   partner.creditWallet.balance = after;
// // //   partner.creditWallet.totalCredited =
// // //     Number(partner.creditWallet.totalCredited || 0) + qty;

// // //   if (type === "PURCHASE") {
// // //     partner.creditWallet.totalPurchased =
// // //       Number(partner.creditWallet.totalPurchased || 0) + qty;
// // //   }

// // //   if (type === "REFUND") {
// // //     partner.creditWallet.totalRefunded =
// // //       Number(partner.creditWallet.totalRefunded || 0) + qty;
// // //   }

// // //   await partner.save({ session });

// // //   const [txn] = await CreditTransaction.create(
// // //     [
// // //       {
// // //         transactionId: generateTransactionId(),
// // //         partnerMongoId: partner._id,
// // //         partnerCode: partner.partnerId || "",
// // //         partnerName: partner.name || "",
// // //         type,
// // //         direction: "CREDIT",
// // //         credits: qty,
// // //         amountInRupees: Number(amountInRupees || 0),
// // //         balanceBefore: before,
// // //         balanceAfter: after,
// // //         productCode,
// // //         status: "SUCCESS",
// // //         referenceType,
// // //         referenceId,
// // //         relatedTransactionId,
// // //         payment,
// // //         description,
// // //         metadata,
// // //         performedBy: makeActor(actor),
// // //       },
// // //     ],
// // //     { session }
// // //   );

// // //   return { partner, transaction: txn };
// // // };

// // // export const debitPartnerWallet = async ({
// // //   partnerId,
// // //   credits,
// // //   type,
// // //   productCode = "",
// // //   referenceType = "",
// // //   referenceId = null,
// // //   description = "",
// // //   metadata = {},
// // //   actor = {},
// // //   session = null,
// // // }) => {
// // //   const qty = Number(credits);

// // //   if (!Number.isFinite(qty) || qty <= 0) {
// // //     throw new Error("Credits must be greater than 0");
// // //   }

// // //   // Atomic balance guard: two parallel requests cannot overspend the same wallet.
// // //   const partnerBefore = await Partner.findById(partnerId).session(session);
// // //   if (!partnerBefore) throw new Error("Partner not found");

// // //   const before = Number(partnerBefore.creditWallet?.balance || 0);
// // //   if (before < qty) {
// // //     const error = new Error(
// // //       `Insufficient credits. Required ${qty}, available ${before}`
// // //     );
// // //     error.code = "INSUFFICIENT_CREDITS";
// // //     throw error;
// // //   }

// // //   const partner = await Partner.findOneAndUpdate(
// // //     {
// // //       _id: partnerId,
// // //       "creditWallet.balance": { $gte: qty },
// // //     },
// // //     {
// // //       $inc: {
// // //         "creditWallet.balance": -qty,
// // //         "creditWallet.totalDebited": qty,
// // //         "creditWallet.totalSpent": qty,
// // //       },
// // //     },
// // //     { new: true, session }
// // //   );

// // //   if (!partner) {
// // //     const error = new Error("Insufficient credits");
// // //     error.code = "INSUFFICIENT_CREDITS";
// // //     throw error;
// // //   }

// // //   const after = Number(partner.creditWallet.balance || 0);

// // //   const [txn] = await CreditTransaction.create(
// // //     [
// // //       {
// // //         transactionId: generateTransactionId(),
// // //         partnerMongoId: partner._id,
// // //         partnerCode: partner.partnerId || "",
// // //         partnerName: partner.name || "",
// // //         type,
// // //         direction: "DEBIT",
// // //         credits: qty,
// // //         amountInRupees: 0,
// // //         balanceBefore: before,
// // //         balanceAfter: after,
// // //         productCode,
// // //         status: "SUCCESS",
// // //         referenceType,
// // //         referenceId,
// // //         description,
// // //         metadata,
// // //         performedBy: makeActor(actor),
// // //       },
// // //     ],
// // //     { session }
// // //   );

// // //   return { partner, transaction: txn };
// // // };


// // import mongoose from "mongoose";
// // import Partner from "../models/Partner.js";
// // import TeamWallet from "../models/TeamWallet.js";
// // import CreditTransaction from "../models/CreditTransaction.js";

// // const txId = () => `CTX-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

// // export const makeActor = (actor = {}) => ({
// //   userId: actor?.userId && mongoose.Types.ObjectId.isValid(actor.userId) ? actor.userId : null,
// //   name: actor?.name || "System",
// //   role: actor?.role || "System",
// // });

// // const getWalletOwner = async (partner, session) => {
// //   if (partner.parentPartnerId) {
// //     const owner = await Partner.findById(partner.parentPartnerId).session(session);
// //     if (!owner) throw new Error("Team owner not found");
// //     return owner;
// //   }
// //   return partner;
// // };

// // const getOrCreateTeamWallet = async (owner, session) => {
// //   let wallet = await TeamWallet.findOne({ ownerPartnerId: owner._id }).session(session);
// //   if (!wallet) {
// //     [wallet] = await TeamWallet.create([{
// //       ownerPartnerId: owner._id,
// //       ownerPartnerCode: owner.partnerId || "",
// //       teamName: owner.business?.businessName || `${owner.name} Team`,
// //     }], { session });
// //   }
// //   return wallet;
// // };

// // const splitDebit = (paidBalance, promotionalBalance, credits) => {
// //   const promotionalUsed = Math.min(Number(promotionalBalance || 0), credits);
// //   return { promotionalUsed, paidUsed: credits - promotionalUsed };
// // };

// // export const creditPartnerWallet = async ({
// //   partnerId,
// //   credits,
// //   type,
// //   amountInRupees = 0,
// //   bucket = "PAID",
// //   productCode = "",
// //   referenceType = "",
// //   referenceId = null,
// //   relatedTransactionId = null,
// //   payment = {},
// //   description = "",
// //   metadata = {},
// //   actor = {},
// //   idempotencyKey = "",
// //   session = null,
// // }) => {
// //   const qty = Number(credits);
// //   if (!Number.isFinite(qty) || qty <= 0) throw new Error("Credits must be greater than 0");

// //   if (idempotencyKey) {
// //     const existing = await CreditTransaction.findOne({ idempotencyKey }).session(session);
// //     if (existing) return { duplicate: true, transaction: existing };
// //   }

// //   const partner = await Partner.findById(partnerId).session(session);
// //   if (!partner) throw new Error("Partner not found");

// //   // if (partner.accountType === "team") {
// //   if (partner.accountType === "team" || partner.accountType === "subagent"){
// //     const owner = await getWalletOwner(partner, session);
// //     const wallet = await getOrCreateTeamWallet(owner, session);
    
// //     const before = Number(wallet.balance || 0);

// //     if (bucket === "PROMOTIONAL") wallet.promotionalBalance += qty;
// //     else wallet.paidBalance += qty;
// //     wallet.balance = Number(wallet.paidBalance || 0) + Number(wallet.promotionalBalance || 0);
// //     if (type === "PURCHASE") wallet.totalPurchased += qty;
// //     if (type === "REFUND") wallet.totalRefunded += qty;
// //     await wallet.save({ session });

// //     const [transaction] = await CreditTransaction.create([{
// //       transactionId: txId(), walletType: "TEAM_SHARED", walletOwnerPartnerId: owner._id,
// //       attributedPartnerId: partner._id, partnerCode: partner.partnerId || "", partnerName: partner.name || "",
// //       type, direction: "CREDIT", creditBucket: bucket, credits: qty,
// //       paidCredits: bucket === "PAID" ? qty : 0,
// //       promotionalCredits: bucket === "PROMOTIONAL" ? qty : 0,
// //       amountInRupees: Number(amountInRupees || 0), balanceBefore: before, balanceAfter: wallet.balance,
// //       productCode, status: "SUCCESS", idempotencyKey, referenceType, referenceId, relatedTransactionId,
// //       payment, description, metadata, performedBy: makeActor(actor),
// //     }], { session });

// //     return { partner: owner, wallet, transaction };
// //   }

// //   const before = Number(partner.creditWallet.balance || 0);
// //   if (bucket === "PROMOTIONAL") partner.creditWallet.promotionalBalance += qty;
// //   else partner.creditWallet.paidBalance += qty;
// //   partner.creditWallet.balance = Number(partner.creditWallet.paidBalance || 0) + Number(partner.creditWallet.promotionalBalance || 0);
// //   partner.creditWallet.totalCredited += qty;
// //   if (type === "PURCHASE") partner.creditWallet.totalPurchased += qty;
// //   if (type === "REFUND") partner.creditWallet.totalRefunded += qty;
// //   await partner.save({ session });

// //   const [transaction] = await CreditTransaction.create([{
// //     transactionId: txId(), walletType: "SINGLE", walletOwnerPartnerId: partner._id,
// //     attributedPartnerId: partner._id, partnerCode: partner.partnerId || "", partnerName: partner.name || "",
// //     type, direction: "CREDIT", creditBucket: bucket, credits: qty,
// //     paidCredits: bucket === "PAID" ? qty : 0,
// //     promotionalCredits: bucket === "PROMOTIONAL" ? qty : 0,
// //     amountInRupees: Number(amountInRupees || 0), balanceBefore: before, balanceAfter: partner.creditWallet.balance,
// //     productCode, status: "SUCCESS", idempotencyKey, referenceType, referenceId, relatedTransactionId,
// //     payment, description, metadata, performedBy: makeActor(actor),
// //   }], { session });

// //   return { partner, wallet: partner.creditWallet, transaction };
// // };

// // export const debitPartnerWallet = async ({
// //   partnerId,
// //   credits,
// //   type,
// //   productCode = "",
// //   referenceType = "",
// //   referenceId = null,
// //   description = "",
// //   metadata = {},
// //   actor = {},
// //   idempotencyKey = "",
// //   session = null,
// // }) => {
// //   const qty = Number(credits);
// //   if (!Number.isFinite(qty) || qty <= 0) throw new Error("Credits must be greater than 0");

// //   if (idempotencyKey) {
// //     const existing = await CreditTransaction.findOne({ idempotencyKey }).session(session);
// //     if (existing) return { duplicate: true, transaction: existing };
// //   }

// //   const partner = await Partner.findById(partnerId).session(session);
// //   if (!partner) throw new Error("Partner not found");
// //   if (!partner.isApproved || !partner.isVerified || partner.isBlocked || !partner.permissions?.canSpendCredits) {
// //     throw new Error("Only approved and verified active partners can spend credits");
// //   }

// //   if (partner.accountType === "team") {
// //     const owner = await getWalletOwner(partner, session);
// //     const wallet = await getOrCreateTeamWallet(owner, session);
// //     if (wallet.isFrozen) throw new Error("Team wallet is frozen");

// //     if (partner.parentPartnerId) {
// //       const available = Number(partner.teamCreditAllocation?.availableLimit || 0);
// //       if (available < qty) {
// //         const e = new Error(`Member spending limit exceeded. Available ${available}`);
// //         e.code = "INSUFFICIENT_CREDITS";
// //         throw e;
// //       }
// //       const threshold = partner.teamCreditAllocation?.approvalThreshold;
// //       if (partner.teamCreditAllocation?.requiresApprovalAboveThreshold && threshold != null && qty > Number(threshold) && metadata?.spendingApproved !== true) {
// //         const e = new Error(`Owner/manager approval required above ${threshold} credits`);
// //         e.code = "SPENDING_APPROVAL_REQUIRED";
// //         throw e;
// //       }
// //     }

// //     if (Number(wallet.balance || 0) < qty) {
// //       const e = new Error("Insufficient team wallet credits");
// //       e.code = "INSUFFICIENT_CREDITS";
// //       throw e;
// //     }

// //     const before = Number(wallet.balance || 0);
// //     const { paidUsed, promotionalUsed } = splitDebit(wallet.paidBalance, wallet.promotionalBalance, qty);
// //     wallet.promotionalBalance -= promotionalUsed;
// //     wallet.paidBalance -= paidUsed;
// //     wallet.balance -= qty;
// //     wallet.totalSpent += qty;

// //     if (partner.parentPartnerId) {
// //       partner.teamCreditAllocation.availableLimit -= qty;
// //       partner.teamCreditAllocation.totalSpent += qty;
// //       wallet.allocatedToMembers = Math.max(0, Number(wallet.allocatedToMembers || 0) - qty);
// //       await partner.save({ session });
// //     }
// //     await wallet.save({ session });

// //     const [transaction] = await CreditTransaction.create([{
// //       transactionId: txId(), walletType: "TEAM_SHARED", walletOwnerPartnerId: owner._id,
// //       attributedPartnerId: partner._id, partnerCode: partner.partnerId || "", partnerName: partner.name || "",
// //       type, direction: "DEBIT", creditBucket: paidUsed && promotionalUsed ? "MIXED" : paidUsed ? "PAID" : "PROMOTIONAL",
// //       credits: qty, paidCredits: paidUsed, promotionalCredits: promotionalUsed,
// //       balanceBefore: before, balanceAfter: wallet.balance, productCode, status: "SUCCESS", idempotencyKey,
// //       referenceType, referenceId, description, metadata, performedBy: makeActor(actor),
// //     }], { session });
// //     return { partner, wallet, transaction };
// //   }

// //   if (Number(partner.creditWallet.balance || 0) < qty) {
// //     const e = new Error(`Insufficient credits. Available ${partner.creditWallet.balance || 0}`);
// //     e.code = "INSUFFICIENT_CREDITS";
// //     throw e;
// //   }
// //   const before = Number(partner.creditWallet.balance || 0);
// //   const { paidUsed, promotionalUsed } = splitDebit(partner.creditWallet.paidBalance, partner.creditWallet.promotionalBalance, qty);
// //   partner.creditWallet.promotionalBalance -= promotionalUsed;
// //   partner.creditWallet.paidBalance -= paidUsed;
// //   partner.creditWallet.balance -= qty;
// //   partner.creditWallet.totalDebited += qty;
// //   partner.creditWallet.totalSpent += qty;
// //   await partner.save({ session });

// //   const [transaction] = await CreditTransaction.create([{
// //     transactionId: txId(), walletType: "SINGLE", walletOwnerPartnerId: partner._id,
// //     attributedPartnerId: partner._id, partnerCode: partner.partnerId || "", partnerName: partner.name || "",
// //     type, direction: "DEBIT", creditBucket: paidUsed && promotionalUsed ? "MIXED" : paidUsed ? "PAID" : "PROMOTIONAL",
// //     credits: qty, paidCredits: paidUsed, promotionalCredits: promotionalUsed,
// //     balanceBefore: before, balanceAfter: partner.creditWallet.balance, productCode, status: "SUCCESS", idempotencyKey,
// //     referenceType, referenceId, description, metadata, performedBy: makeActor(actor),
// //   }], { session });
// //   return { partner, wallet: partner.creditWallet, transaction };
// // };


// import mongoose from "mongoose";

// import Partner from "../models/Partner.js";
// import TeamWallet from "../models/TeamWallet.js";
// import CreditTransaction from "../models/CreditTransaction.js";

// // ======================================================
// // TRANSACTION ID
// // ======================================================

// const txId = () =>
//   `CTX-${Date.now()}-${Math.floor(
//     1000 + Math.random() * 9000
//   )}`;

// // ======================================================
// // ACTOR
// // ======================================================

// export const makeActor = (actor = {}) => ({
//   userId:
//     actor?.userId &&
//     mongoose.Types.ObjectId.isValid(actor.userId)
//       ? actor.userId
//       : null,

//   name: actor?.name || "System",

//   role: actor?.role || "System",
// });

// // ======================================================
// // GET WALLET OWNER
// //
// // single    -> self
// // team      -> self
// // subagent  -> parent Agency Owner
// // ======================================================

// const getWalletOwner = async (partner, session) => {
//   // SUB AGENT
//   if (partner.accountType === "subagent") {
//     if (!partner.parentPartnerId) {
//       const error = new Error(
//         "Sub-Agent is not linked to an Agency Owner"
//       );

//       error.code = "AGENCY_OWNER_NOT_FOUND";

//       throw error;
//     }

//     const owner = await Partner.findById(
//       partner.parentPartnerId
//     ).session(session);

//     if (!owner) {
//       const error = new Error(
//         "Agency Owner not found"
//       );

//       error.code = "AGENCY_OWNER_NOT_FOUND";

//       throw error;
//     }

//     if (
//       owner.accountType !== "team" ||
//       owner.isSubPartner
//     ) {
//       const error = new Error(
//         "Invalid Agency Owner linked to Sub-Agent"
//       );

//       error.code = "INVALID_AGENCY_OWNER";

//       throw error;
//     }

//     return owner;
//   }

//   // TEAM OWNER / SINGLE
//   return partner;
// };

// // ======================================================
// // GET OR CREATE TEAM WALLET
// // ======================================================

// const getOrCreateTeamWallet = async (
//   owner,
//   session
// ) => {
//   let wallet = await TeamWallet.findOne({
//     ownerPartnerId: owner._id,
//   }).session(session);

//   if (!wallet) {
//     [wallet] = await TeamWallet.create(
//       [
//         {
//           ownerPartnerId: owner._id,

//           ownerPartnerCode:
//             owner.partnerId || "",

//           teamName:
//             owner.business?.businessName ||
//             `${owner.name} Team`,
//         },
//       ],
//       {
//         session,
//       }
//     );
//   }

//   return wallet;
// };

// // ======================================================
// // PAID / PROMOTIONAL CREDIT SPLIT
// //
// // Promotional credits will be consumed first.
// // ======================================================

// const splitDebit = (
//   paidBalance,
//   promotionalBalance,
//   credits
// ) => {
//   const promotionalUsed = Math.min(
//     Number(promotionalBalance || 0),
//     credits
//   );

//   const paidUsed =
//     credits - promotionalUsed;

//   return {
//     promotionalUsed,
//     paidUsed,
//   };
// };

// // ======================================================
// // CREDIT PARTNER WALLET
// //
// // SINGLE:
// // credits -> own wallet
// //
// // TEAM OWNER:
// // credits -> TeamWallet
// //
// // SUBAGENT:
// // direct purchase BLOCKED
// // Agency Owner must purchase and allocate credits.
// // ======================================================

// export const creditPartnerWallet = async ({
//   partnerId,

//   credits,

//   type,

//   amountInRupees = 0,

//   bucket = "PAID",

//   productCode = "",

//   referenceType = "",

//   referenceId = null,

//   relatedTransactionId = null,

//   payment = {},

//   description = "",

//   metadata = {},

//   actor = {},

//   idempotencyKey = "",

//   session = null,
// }) => {
//   const qty = Number(credits);

//   // ====================================================
//   // VALIDATE CREDITS
//   // ====================================================

//   if (
//     !Number.isFinite(qty) ||
//     qty <= 0
//   ) {
//     throw new Error(
//       "Credits must be greater than 0"
//     );
//   }

//   // ====================================================
//   // DUPLICATE TRANSACTION PROTECTION
//   // ====================================================

//   if (idempotencyKey) {
//     const existing =
//       await CreditTransaction.findOne({
//         idempotencyKey,
//       }).session(session);

//     if (existing) {
//       return {
//         duplicate: true,
//         transaction: existing,
//       };
//     }
//   }

//   // ====================================================
//   // FIND PARTNER
//   // ====================================================

//   const partner =
//     await Partner.findById(
//       partnerId
//     ).session(session);

//   if (!partner) {
//     throw new Error(
//       "Partner not found"
//     );
//   }

//   // ====================================================
//   // SUB AGENT CANNOT PURCHASE DIRECTLY
//   // ====================================================

//   if (
//     partner.accountType ===
//     "subagent"
//   ) {
//     const error = new Error(
//       "Sub-Agents cannot purchase credits directly. Agency Owner must purchase shared credits."
//     );

//     error.code =
//       "SUB_AGENT_DIRECT_PURCHASE_NOT_ALLOWED";

//     throw error;
//   }

//   // ====================================================
//   // TEAM OWNER PURCHASE
//   // ====================================================

//   if (
//     partner.accountType === "team"
//   ) {
//     if (partner.isSubPartner) {
//       const error = new Error(
//         "Invalid Team Partner account"
//       );

//       error.code =
//         "INVALID_TEAM_OWNER";

//       throw error;
//     }

//     const owner =
//       await getWalletOwner(
//         partner,
//         session
//       );

//     const wallet =
//       await getOrCreateTeamWallet(
//         owner,
//         session
//       );

//     const before =
//       Number(
//         wallet.balance || 0
//       );

//     // ==================================================
//     // ADD PAID / PROMOTIONAL CREDIT
//     // ==================================================

//     if (
//       bucket === "PROMOTIONAL"
//     ) {
//       wallet.promotionalBalance =
//         Number(
//           wallet.promotionalBalance ||
//             0
//         ) + qty;
//     } else {
//       wallet.paidBalance =
//         Number(
//           wallet.paidBalance || 0
//         ) + qty;
//     }

//     wallet.balance =
//       Number(
//         wallet.paidBalance || 0
//       ) +
//       Number(
//         wallet.promotionalBalance ||
//           0
//       );

//     // ==================================================
//     // TOTAL PURCHASE
//     // ==================================================

//     if (type === "PURCHASE") {
//       wallet.totalPurchased =
//         Number(
//           wallet.totalPurchased ||
//             0
//         ) + qty;
//     }

//     // ==================================================
//     // TOTAL REFUND
//     // ==================================================

//     if (type === "REFUND") {
//       wallet.totalRefunded =
//         Number(
//           wallet.totalRefunded ||
//             0
//         ) + qty;
//     }

//     await wallet.save({
//       session,
//     });

//     // ==================================================
//     // TRANSACTION
//     // ==================================================

//     const [transaction] =
//       await CreditTransaction.create(
//         [
//           {
//             transactionId:
//               txId(),

//             walletType:
//               "TEAM_SHARED",

//             walletOwnerPartnerId:
//               owner._id,

//             attributedPartnerId:
//               owner._id,

//             partnerCode:
//               owner.partnerId || "",

//             partnerName:
//               owner.name || "",

//             type,

//             direction:
//               "CREDIT",

//             creditBucket:
//               bucket,

//             credits:
//               qty,

//             paidCredits:
//               bucket === "PAID"
//                 ? qty
//                 : 0,

//             promotionalCredits:
//               bucket ===
//               "PROMOTIONAL"
//                 ? qty
//                 : 0,

//             amountInRupees:
//               Number(
//                 amountInRupees ||
//                   0
//               ),

//             balanceBefore:
//               before,

//             balanceAfter:
//               wallet.balance,

//             productCode,

//             status:
//               "SUCCESS",

//             idempotencyKey,

//             referenceType,

//             referenceId,

//             relatedTransactionId,

//             payment,

//             description,

//             metadata: {
//               ...metadata,

//               accountType:
//                 "team",

//               agencyOwnerId:
//                 owner._id,

//               agencyPartnerCode:
//                 owner.partnerId ||
//                 "",
//             },

//             performedBy:
//               makeActor(actor),
//           },
//         ],
//         {
//           session,
//         }
//       );

//     return {
//       partner: owner,
//       wallet,
//       transaction,
//     };
//   }

//   // ====================================================
//   // SINGLE PARTNER WALLET
//   // ====================================================

//   const before =
//     Number(
//       partner.creditWallet?.balance ||
//         0
//     );

//   if (
//     bucket === "PROMOTIONAL"
//   ) {
//     partner.creditWallet.promotionalBalance =
//       Number(
//         partner.creditWallet
//           ?.promotionalBalance ||
//           0
//       ) + qty;
//   } else {
//     partner.creditWallet.paidBalance =
//       Number(
//         partner.creditWallet
//           ?.paidBalance ||
//           0
//       ) + qty;
//   }

//   partner.creditWallet.balance =
//     Number(
//       partner.creditWallet
//         .paidBalance || 0
//     ) +
//     Number(
//       partner.creditWallet
//         .promotionalBalance || 0
//     );

//   partner.creditWallet.totalCredited =
//     Number(
//       partner.creditWallet
//         .totalCredited || 0
//     ) + qty;

//   if (type === "PURCHASE") {
//     partner.creditWallet.totalPurchased =
//       Number(
//         partner.creditWallet
//           .totalPurchased || 0
//       ) + qty;
//   }

//   if (type === "REFUND") {
//     partner.creditWallet.totalRefunded =
//       Number(
//         partner.creditWallet
//           .totalRefunded || 0
//       ) + qty;
//   }

//   await partner.save({
//     session,
//   });

//   // ====================================================
//   // SINGLE PARTNER TRANSACTION
//   // ====================================================

//   const [transaction] =
//     await CreditTransaction.create(
//       [
//         {
//           transactionId:
//             txId(),

//           walletType:
//             "SINGLE",

//           walletOwnerPartnerId:
//             partner._id,

//           attributedPartnerId:
//             partner._id,

//           partnerCode:
//             partner.partnerId || "",

//           partnerName:
//             partner.name || "",

//           type,

//           direction:
//             "CREDIT",

//           creditBucket:
//             bucket,

//           credits:
//             qty,

//           paidCredits:
//             bucket === "PAID"
//               ? qty
//               : 0,

//           promotionalCredits:
//             bucket ===
//             "PROMOTIONAL"
//               ? qty
//               : 0,

//           amountInRupees:
//             Number(
//               amountInRupees || 0
//             ),

//           balanceBefore:
//             before,

//           balanceAfter:
//             partner.creditWallet
//               .balance,

//           productCode,

//           status:
//             "SUCCESS",

//           idempotencyKey,

//           referenceType,

//           referenceId,

//           relatedTransactionId,

//           payment,

//           description,

//           metadata: {
//             ...metadata,
//             accountType:
//               "single",
//           },

//           performedBy:
//             makeActor(actor),
//         },
//       ],
//       {
//         session,
//       }
//     );

//   return {
//     partner,

//     wallet:
//       partner.creditWallet,

//     transaction,
//   };
// };

// // ======================================================
// // DEBIT PARTNER WALLET
// //
// // SINGLE
// // Own wallet debit.
// //
// // TEAM OWNER
// // Shared Agency wallet debit.
// //
// // SUBAGENT
// // Shared Agency wallet debit.
// // Subagent allocation also decreases.
// // ======================================================

// export const debitPartnerWallet = async ({
//   partnerId,

//   credits,

//   type,

//   productCode = "",

//   referenceType = "",

//   referenceId = null,

//   description = "",

//   metadata = {},

//   actor = {},

//   idempotencyKey = "",

//   session = null,
// }) => {
//   const qty = Number(credits);

//   // ====================================================
//   // VALIDATION
//   // ====================================================

//   if (
//     !Number.isFinite(qty) ||
//     qty <= 0
//   ) {
//     throw new Error(
//       "Credits must be greater than 0"
//     );
//   }

//   // ====================================================
//   // DUPLICATE DEDUCTION PROTECTION
//   // ====================================================

//   if (idempotencyKey) {
//     const existing =
//       await CreditTransaction.findOne({
//         idempotencyKey,
//       }).session(session);

//     if (existing) {
//       return {
//         duplicate: true,
//         transaction: existing,
//       };
//     }
//   }

//   // ====================================================
//   // FIND PARTNER
//   // ====================================================

//   const partner =
//     await Partner.findById(
//       partnerId
//     ).session(session);

//   if (!partner) {
//     throw new Error(
//       "Partner not found"
//     );
//   }

//   // ====================================================
//   // PARTNER MUST BE FULLY VERIFIED
//   // ====================================================

//   if (
//     !partner.isApproved ||
//     !partner.isVerified ||
//     partner.isBlocked ||
//     partner.applicationStatus !==
//       "Verified" ||
//     !partner.permissions
//       ?.canSpendCredits
//   ) {
//     const error = new Error(
//       "Only approved and verified active partners can spend credits"
//     );

//     error.code =
//       "PARTNER_NOT_ALLOWED_TO_SPEND";

//     throw error;
//   }

//   // ====================================================
//   // TEAM / SUBAGENT SHARED WALLET
//   // ====================================================

//   if (
//     partner.accountType ===
//       "team" ||
//     partner.accountType ===
//       "subagent"
//   ) {
//     // ==================================================
//     // GET AGENCY OWNER
//     // ==================================================

//     const owner =
//       await getWalletOwner(
//         partner,
//         session
//       );

//     // ==================================================
//     // OWNER MUST ALSO BE ACTIVE
//     // ==================================================

//     if (
//       !owner.isApproved ||
//       !owner.isVerified ||
//       owner.isBlocked ||
//       owner.applicationStatus !==
//         "Verified"
//     ) {
//       const error = new Error(
//         "Agency Owner is not active and verified"
//       );

//       error.code =
//         "AGENCY_OWNER_NOT_ACTIVE";

//       throw error;
//     }

//     // ==================================================
//     // TEAM WALLET
//     // ==================================================

//     const wallet =
//       await TeamWallet.findOne({
//         ownerPartnerId:
//           owner._id,
//       }).session(session);

//     if (!wallet) {
//       const error = new Error(
//         "Team wallet not found"
//       );

//       error.code =
//         "TEAM_WALLET_NOT_FOUND";

//       throw error;
//     }

//     // ==================================================
//     // FROZEN WALLET
//     // ==================================================

//     if (wallet.isFrozen) {
//       const error = new Error(
//         "Team wallet is frozen"
//       );

//       error.code =
//         "TEAM_WALLET_FROZEN";

//       throw error;
//     }

//     // ==================================================
//     // SUB AGENT VALIDATION
//     // ==================================================

//     if (
//       partner.accountType ===
//       "subagent"
//     ) {
//       const available =
//         Number(
//           partner
//             .teamCreditAllocation
//             ?.availableLimit ||
//             0
//         );

//       // ================================================
//       // ALLOCATION LIMIT
//       // ================================================

//       if (available < qty) {
//         const error =
//           new Error(
//             `Sub-Agent spending limit exceeded. Available ${available}`
//           );

//         error.code =
//           "INSUFFICIENT_CREDITS";

//         throw error;
//       }

//       // ================================================
//       // APPROVAL THRESHOLD
//       // ================================================

//       const threshold =
//         partner
//           .teamCreditAllocation
//           ?.approvalThreshold;

//       if (
//         partner
//           .teamCreditAllocation
//           ?.requiresApprovalAboveThreshold &&
//         threshold != null &&
//         qty >
//           Number(threshold) &&
//         metadata
//           ?.spendingApproved !==
//           true
//       ) {
//         const error =
//           new Error(
//             `Agency approval required above ${threshold} credits`
//           );

//         error.code =
//           "SPENDING_APPROVAL_REQUIRED";

//         throw error;
//       }
//     }

//     // ==================================================
//     // CHECK SHARED WALLET BALANCE
//     // ==================================================

//     if (
//       Number(
//         wallet.balance || 0
//       ) < qty
//     ) {
//       const error =
//         new Error(
//           "Insufficient team wallet credits"
//         );

//       error.code =
//         "INSUFFICIENT_CREDITS";

//       throw error;
//     }

//     const before =
//       Number(
//         wallet.balance || 0
//       );

//     // ==================================================
//     // CALCULATE PAID/PROMOTIONAL USAGE
//     // ==================================================

//     const {
//       paidUsed,
//       promotionalUsed,
//     } = splitDebit(
//       wallet.paidBalance,
//       wallet.promotionalBalance,
//       qty
//     );

//     // ==================================================
//     // DEBIT PROMOTIONAL
//     // ==================================================

//     wallet.promotionalBalance =
//       Math.max(
//         0,

//         Number(
//           wallet.promotionalBalance ||
//             0
//         ) -
//           promotionalUsed
//       );

//     // ==================================================
//     // DEBIT PAID
//     // ==================================================

//     wallet.paidBalance =
//       Math.max(
//         0,

//         Number(
//           wallet.paidBalance ||
//             0
//         ) -
//           paidUsed
//       );

//     // ==================================================
//     // TOTAL BALANCE
//     // ==================================================

//     wallet.balance =
//       Math.max(
//         0,

//         Number(
//           wallet.balance || 0
//         ) - qty
//       );

//     wallet.totalSpent =
//       Number(
//         wallet.totalSpent || 0
//       ) + qty;

//     // ==================================================
//     // SUB AGENT ALLOCATION DEBIT
//     // ==================================================

//     if (
//       partner.accountType ===
//       "subagent"
//     ) {
//       partner.teamCreditAllocation.availableLimit =
//         Math.max(
//           0,

//           Number(
//             partner
//               .teamCreditAllocation
//               ?.availableLimit ||
//               0
//           ) - qty
//         );

//       partner.teamCreditAllocation.totalSpent =
//         Number(
//           partner
//             .teamCreditAllocation
//             ?.totalSpent ||
//             0
//         ) + qty;

//       // ================================================
//       // allocatedToMembers means currently reserved
//       // unused member credits.
//       // ================================================

//       wallet.allocatedToMembers =
//         Math.max(
//           0,

//           Number(
//             wallet.allocatedToMembers ||
//               0
//           ) - qty
//         );

//       await partner.save({
//         session,
//       });
//     }

//     await wallet.save({
//       session,
//     });

//     // ==================================================
//     // SHARED WALLET TRANSACTION
//     //
//     // IMPORTANT:
//     //
//     // walletOwnerPartnerId = Agency Owner
//     //
//     // attributedPartnerId = actual spender
//     //
//     // If Rahul Sub-Agent spends:
//     // attributedPartnerId = Rahul._id
//     // ==================================================

//     const [transaction] =
//       await CreditTransaction.create(
//         [
//           {
//             transactionId:
//               txId(),

//             walletType:
//               "TEAM_SHARED",

//             walletOwnerPartnerId:
//               owner._id,

//             attributedPartnerId:
//               partner._id,

//             partnerCode:
//               partner.partnerId ||
//               "",

//             partnerName:
//               partner.name || "",

//             type,

//             direction:
//               "DEBIT",

//             creditBucket:
//               paidUsed &&
//               promotionalUsed
//                 ? "MIXED"
//                 : paidUsed
//                 ? "PAID"
//                 : "PROMOTIONAL",

//             credits:
//               qty,

//             paidCredits:
//               paidUsed,

//             promotionalCredits:
//               promotionalUsed,

//             balanceBefore:
//               before,

//             balanceAfter:
//               wallet.balance,

//             productCode,

//             status:
//               "SUCCESS",

//             idempotencyKey,

//             referenceType,

//             referenceId,

//             description,

//             metadata: {
//               ...metadata,

//               accountType:
//                 partner.accountType,

//               agencyOwnerId:
//                 owner._id,

//               agencyPartnerCode:
//                 owner.partnerId ||
//                 "",

//               agencyName:
//                 owner.business
//                   ?.businessName ||
//                 owner.name,

//               subAgentId:
//                 partner.accountType ===
//                 "subagent"
//                   ? partner._id
//                   : null,

//               availableLimitAfter:
//                 partner.accountType ===
//                 "subagent"
//                   ? partner
//                       .teamCreditAllocation
//                       ?.availableLimit
//                   : null,
//             },

//             performedBy:
//               makeActor(actor),
//           },
//         ],
//         {
//           session,
//         }
//       );

//     return {
//       partner,
//       wallet,
//       transaction,
//     };
//   }

//   // ====================================================
//   // SINGLE PARTNER
//   // ====================================================

//   if (
//     Number(
//       partner.creditWallet
//         ?.balance || 0
//     ) < qty
//   ) {
//     const error = new Error(
//       `Insufficient credits. Available ${
//         partner.creditWallet
//           ?.balance || 0
//       }`
//     );

//     error.code =
//       "INSUFFICIENT_CREDITS";

//     throw error;
//   }

//   const before =
//     Number(
//       partner.creditWallet
//         .balance || 0
//     );

//   const {
//     paidUsed,
//     promotionalUsed,
//   } = splitDebit(
//     partner.creditWallet
//       .paidBalance,

//     partner.creditWallet
//       .promotionalBalance,

//     qty
//   );

//   // ====================================================
//   // SINGLE PROMOTIONAL DEBIT
//   // ====================================================

//   partner.creditWallet.promotionalBalance =
//     Math.max(
//       0,

//       Number(
//         partner.creditWallet
//           .promotionalBalance ||
//           0
//       ) -
//         promotionalUsed
//     );

//   // ====================================================
//   // SINGLE PAID DEBIT
//   // ====================================================

//   partner.creditWallet.paidBalance =
//     Math.max(
//       0,

//       Number(
//         partner.creditWallet
//           .paidBalance ||
//           0
//       ) -
//         paidUsed
//     );

//   // ====================================================
//   // SINGLE BALANCE
//   // ====================================================

//   partner.creditWallet.balance =
//     Math.max(
//       0,

//       Number(
//         partner.creditWallet
//           .balance || 0
//       ) - qty
//     );

//   partner.creditWallet.totalDebited =
//     Number(
//       partner.creditWallet
//         .totalDebited || 0
//     ) + qty;

//   partner.creditWallet.totalSpent =
//     Number(
//       partner.creditWallet
//         .totalSpent || 0
//     ) + qty;

//   await partner.save({
//     session,
//   });

//   // ====================================================
//   // SINGLE TRANSACTION
//   // ====================================================

//   const [transaction] =
//     await CreditTransaction.create(
//       [
//         {
//           transactionId:
//             txId(),

//           walletType:
//             "SINGLE",

//           walletOwnerPartnerId:
//             partner._id,

//           attributedPartnerId:
//             partner._id,

//           partnerCode:
//             partner.partnerId ||
//             "",

//           partnerName:
//             partner.name || "",

//           type,

//           direction:
//             "DEBIT",

//           creditBucket:
//             paidUsed &&
//             promotionalUsed
//               ? "MIXED"
//               : paidUsed
//               ? "PAID"
//               : "PROMOTIONAL",

//           credits:
//             qty,

//           paidCredits:
//             paidUsed,

//           promotionalCredits:
//             promotionalUsed,

//           balanceBefore:
//             before,

//           balanceAfter:
//             partner.creditWallet
//               .balance,

//           productCode,

//           status:
//             "SUCCESS",

//           idempotencyKey,

//           referenceType,

//           referenceId,

//           description,

//           metadata: {
//             ...metadata,

//             accountType:
//               "single",
//           },

//           performedBy:
//             makeActor(actor),
//         },
//       ],
//       {
//         session,
//       }
//     );

//   return {
//     partner,

//     wallet:
//       partner.creditWallet,

//     transaction,
//   };
// };



import mongoose from "mongoose";

import Partner from "../models/Partner.js";
import TeamWallet from "../models/TeamWallet.js";
import CreditTransaction from "../models/CreditTransaction.js";

// ======================================================
// TRANSACTION ID
// ======================================================

const txId = () =>
  `CTX-${Date.now()}-${Math.floor(
    1000 + Math.random() * 9000
  )}`;

// ======================================================
// ACTOR
// ======================================================

export const makeActor = (actor = {}) => ({
  userId:
    actor?.userId &&
    mongoose.Types.ObjectId.isValid(actor.userId)
      ? actor.userId
      : null,

  name: actor?.name || "System",

  role: actor?.role || "System",
});

// ======================================================
// GET WALLET OWNER
//
// single    -> self
// team      -> self
// subagent  -> parent Agency Owner
// ======================================================

const getWalletOwner = async (partner, session) => {
  // SUB AGENT
  if (partner.accountType === "subagent") {
    if (!partner.parentPartnerId) {
      const error = new Error(
        "Sub-Agent is not linked to an Agency Owner"
      );

      error.code = "AGENCY_OWNER_NOT_FOUND";

      throw error;
    }

    const owner = await Partner.findById(
      partner.parentPartnerId
    ).session(session);

    if (!owner) {
      const error = new Error(
        "Agency Owner not found"
      );

      error.code = "AGENCY_OWNER_NOT_FOUND";

      throw error;
    }

    if (
      owner.accountType !== "team" ||
      owner.isSubPartner
    ) {
      const error = new Error(
        "Invalid Agency Owner linked to Sub-Agent"
      );

      error.code = "INVALID_AGENCY_OWNER";

      throw error;
    }

    return owner;
  }

  // TEAM OWNER / SINGLE
  return partner;
};

// ======================================================
// GET OR CREATE TEAM WALLET
// ======================================================

const getOrCreateTeamWallet = async (
  owner,
  session
) => {
  let wallet = await TeamWallet.findOne({
    ownerPartnerId: owner._id,
  }).session(session);

  if (!wallet) {
    [wallet] = await TeamWallet.create(
      [
        {
          ownerPartnerId: owner._id,

          ownerPartnerCode:
            owner.partnerId || "",

          teamName:
            owner.business?.businessName ||
            `${owner.name} Team`,
        },
      ],
      {
        session,
      }
    );
  }

  return wallet;
};

// Keep the Agency/Team Owner's embedded creditWallet in sync with TeamWallet.
// TeamWallet remains the source of truth for shared-team spending, while the
// embedded mirror is required by admin wallet lists and partner profile APIs.
const syncTeamWalletOwnerMirror = async ({
  ownerId,
  wallet,
  creditedDelta = 0,
  debitedDelta = 0,
  session,
}) => {
  const update = {
    $set: {
      "creditWallet.paidBalance": Number(wallet.paidBalance || 0),
      "creditWallet.promotionalBalance": Number(
        wallet.promotionalBalance || 0
      ),
      "creditWallet.balance": Number(wallet.balance || 0),
      "creditWallet.totalPurchased": Number(
        wallet.totalPurchased || 0
      ),
      "creditWallet.totalSpent": Number(wallet.totalSpent || 0),
      "creditWallet.totalRefunded": Number(wallet.totalRefunded || 0),
    },
  };

  const increment = {};
  if (creditedDelta > 0) {
    increment["creditWallet.totalCredited"] = Number(creditedDelta);
  }
  if (debitedDelta > 0) {
    increment["creditWallet.totalDebited"] = Number(debitedDelta);
  }
  if (Object.keys(increment).length) update.$inc = increment;

  await Partner.updateOne({ _id: ownerId }, update, { session });
};

// ======================================================
// PAID / PROMOTIONAL CREDIT SPLIT
//
// Promotional credits will be consumed first.
// ======================================================

const splitDebit = (
  paidBalance,
  promotionalBalance,
  credits
) => {
  const promotionalUsed = Math.min(
    Number(promotionalBalance || 0),
    credits
  );

  const paidUsed =
    credits - promotionalUsed;

  return {
    promotionalUsed,
    paidUsed,
  };
};

// ======================================================
// CREDIT PARTNER WALLET
//
// SINGLE:
// credits -> own wallet
//
// TEAM OWNER:
// credits -> TeamWallet
//
// SUBAGENT:
// direct purchase BLOCKED
// Agency Owner must purchase and allocate credits.
// ======================================================

export const creditPartnerWallet = async ({
  partnerId,

  credits,

  type,

  amountInRupees = 0,

  bucket = "PAID",

  productCode = "",

  referenceType = "",

  referenceId = null,

  relatedTransactionId = null,

  payment = {},

  description = "",

  metadata = {},

  actor = {},

  idempotencyKey = "",

  session = null,
}) => {
  const qty = Number(credits);

  // ====================================================
  // VALIDATE CREDITS
  // ====================================================

  if (
    !Number.isFinite(qty) ||
    qty <= 0
  ) {
    throw new Error(
      "Credits must be greater than 0"
    );
  }

  // ====================================================
  // DUPLICATE TRANSACTION PROTECTION
  // ====================================================

  if (idempotencyKey) {
    const existing =
      await CreditTransaction.findOne({
        idempotencyKey,
      }).session(session);

    if (existing) {
      return {
        duplicate: true,
        transaction: existing,
      };
    }
  }

  // ====================================================
  // FIND PARTNER
  // ====================================================

  const partner =
    await Partner.findById(
      partnerId
    ).session(session);

  if (!partner) {
    throw new Error(
      "Partner not found"
    );
  }

  // ====================================================
  // SUB AGENT CANNOT PURCHASE DIRECTLY
  // ====================================================

  if (
    partner.accountType ===
    "subagent"
  ) {
    const error = new Error(
      "Sub-Agents cannot purchase credits directly. Agency Owner must purchase shared credits."
    );

    error.code =
      "SUB_AGENT_DIRECT_PURCHASE_NOT_ALLOWED";

    throw error;
  }

  // ====================================================
  // TEAM OWNER PURCHASE
  // ====================================================

  if (
    partner.accountType === "team"
  ) {
    if (partner.isSubPartner) {
      const error = new Error(
        "Invalid Team Partner account"
      );

      error.code =
        "INVALID_TEAM_OWNER";

      throw error;
    }

    const owner =
      await getWalletOwner(
        partner,
        session
      );

    const wallet =
      await getOrCreateTeamWallet(
        owner,
        session
      );

    const before =
      Number(
        wallet.balance || 0
      );

    // ==================================================
    // ADD PAID / PROMOTIONAL CREDIT
    // ==================================================

    if (
      bucket === "PROMOTIONAL"
    ) {
      wallet.promotionalBalance =
        Number(
          wallet.promotionalBalance ||
            0
        ) + qty;
    } else {
      wallet.paidBalance =
        Number(
          wallet.paidBalance || 0
        ) + qty;
    }

    wallet.balance =
      Number(
        wallet.paidBalance || 0
      ) +
      Number(
        wallet.promotionalBalance ||
          0
      );

    // ==================================================
    // TOTAL PURCHASE
    // ==================================================

    if (type === "PURCHASE") {
      wallet.totalPurchased =
        Number(
          wallet.totalPurchased ||
            0
        ) + qty;
    }

    // ==================================================
    // TOTAL REFUND
    // ==================================================

    if (type === "REFUND") {
      wallet.totalRefunded =
        Number(
          wallet.totalRefunded ||
            0
        ) + qty;
    }

    await wallet.save({
      session,
    });

    await syncTeamWalletOwnerMirror({
      ownerId: owner._id,
      wallet,
      creditedDelta: qty,
      session,
    });

    // ==================================================
    // TRANSACTION
    // ==================================================

    const [transaction] =
      await CreditTransaction.create(
        [
          {
            transactionId:
              txId(),

            walletType:
              "TEAM_SHARED",

            walletOwnerPartnerId:
              owner._id,

            attributedPartnerId:
              owner._id,

            partnerCode:
              owner.partnerId || "",

            partnerName:
              owner.name || "",

            type,

            direction:
              "CREDIT",

            creditBucket:
              bucket,

            credits:
              qty,

            paidCredits:
              bucket === "PAID"
                ? qty
                : 0,

            promotionalCredits:
              bucket ===
              "PROMOTIONAL"
                ? qty
                : 0,

            amountInRupees:
              Number(
                amountInRupees ||
                  0
              ),

            balanceBefore:
              before,

            balanceAfter:
              wallet.balance,

            productCode,

            status:
              "SUCCESS",

            idempotencyKey,

            referenceType,

            referenceId,

            relatedTransactionId,

            payment,

            description,

            metadata: {
              ...metadata,

              accountType:
                "team",

              agencyOwnerId:
                owner._id,

              agencyPartnerCode:
                owner.partnerId ||
                "",
            },

            performedBy:
              makeActor(actor),
          },
        ],
        {
          session,
        }
      );

    return {
      partner: owner,
      wallet,
      transaction,
    };
  }

  // ====================================================
  // SINGLE PARTNER WALLET
  // ====================================================

  const before =
    Number(
      partner.creditWallet?.balance ||
        0
    );

  if (
    bucket === "PROMOTIONAL"
  ) {
    partner.creditWallet.promotionalBalance =
      Number(
        partner.creditWallet
          ?.promotionalBalance ||
          0
      ) + qty;
  } else {
    partner.creditWallet.paidBalance =
      Number(
        partner.creditWallet
          ?.paidBalance ||
          0
      ) + qty;
  }

  partner.creditWallet.balance =
    Number(
      partner.creditWallet
        .paidBalance || 0
    ) +
    Number(
      partner.creditWallet
        .promotionalBalance || 0
    );

  partner.creditWallet.totalCredited =
    Number(
      partner.creditWallet
        .totalCredited || 0
    ) + qty;

  if (type === "PURCHASE") {
    partner.creditWallet.totalPurchased =
      Number(
        partner.creditWallet
          .totalPurchased || 0
      ) + qty;
  }

  if (type === "REFUND") {
    partner.creditWallet.totalRefunded =
      Number(
        partner.creditWallet
          .totalRefunded || 0
      ) + qty;
  }

  await partner.save({
    session,
  });

  // ====================================================
  // SINGLE PARTNER TRANSACTION
  // ====================================================

  const [transaction] =
    await CreditTransaction.create(
      [
        {
          transactionId:
            txId(),

          walletType:
            "SINGLE",

          walletOwnerPartnerId:
            partner._id,

          attributedPartnerId:
            partner._id,

          partnerCode:
            partner.partnerId || "",

          partnerName:
            partner.name || "",

          type,

          direction:
            "CREDIT",

          creditBucket:
            bucket,

          credits:
            qty,

          paidCredits:
            bucket === "PAID"
              ? qty
              : 0,

          promotionalCredits:
            bucket ===
            "PROMOTIONAL"
              ? qty
              : 0,

          amountInRupees:
            Number(
              amountInRupees || 0
            ),

          balanceBefore:
            before,

          balanceAfter:
            partner.creditWallet
              .balance,

          productCode,

          status:
            "SUCCESS",

          idempotencyKey,

          referenceType,

          referenceId,

          relatedTransactionId,

          payment,

          description,

          metadata: {
            ...metadata,
            accountType:
              "single",
          },

          performedBy:
            makeActor(actor),
        },
      ],
      {
        session,
      }
    );

  return {
    partner,

    wallet:
      partner.creditWallet,

    transaction,
  };
};

// ======================================================
// DEBIT PARTNER WALLET
//
// SINGLE
// Own wallet debit.
//
// TEAM OWNER
// Shared Agency wallet debit.
//
// SUBAGENT
// Shared Agency wallet debit.
// Subagent allocation also decreases.
// ======================================================

export const debitPartnerWallet = async ({
  partnerId,

  credits,

  type,

  productCode = "",

  referenceType = "",

  referenceId = null,

  description = "",

  metadata = {},

  actor = {},

  idempotencyKey = "",

  skipEligibilityCheck = false,

  session = null,
}) => {
  const qty = Number(credits);

  // ====================================================
  // VALIDATION
  // ====================================================

  if (
    !Number.isFinite(qty) ||
    qty <= 0
  ) {
    throw new Error(
      "Credits must be greater than 0"
    );
  }

  // ====================================================
  // DUPLICATE DEDUCTION PROTECTION
  // ====================================================

  if (idempotencyKey) {
    const existing =
      await CreditTransaction.findOne({
        idempotencyKey,
      }).session(session);

    if (existing) {
      return {
        duplicate: true,
        transaction: existing,
      };
    }
  }

  // ====================================================
  // FIND PARTNER
  // ====================================================

  const partner =
    await Partner.findById(
      partnerId
    ).session(session);

  if (!partner) {
    throw new Error(
      "Partner not found"
    );
  }

  // ====================================================
  // PARTNER MUST BE FULLY VERIFIED
  // ====================================================

  const isSubAgent =
    partner.accountType === "subagent" || partner.isSubPartner;

  // All spenders must be finally verified and active.
  // Single/Team owners additionally need canSpendCredits=true.
  // Sub-Agents intentionally keep canSpendCredits=false because they cannot
  // buy/use an independent wallet; they may spend ONLY Team Owner allocated credits.
  if (
    !skipEligibilityCheck &&
    (
      !partner.isApproved ||
      !partner.isVerified ||
      partner.isBlocked ||
      partner.isRejected ||
      partner.applicationStatus !== "Verified" ||
      (!isSubAgent && !partner.permissions?.canSpendCredits)
    )
  ) {
    const error = new Error(
      "Only approved and verified active partners can spend credits"
    );

    error.code = "PARTNER_NOT_ALLOWED_TO_SPEND";
    throw error;
  }

  // ====================================================
  // TEAM / SUBAGENT SHARED WALLET
  // ====================================================

  if (
    partner.accountType ===
      "team" ||
    partner.accountType ===
      "subagent"
  ) {
    // ==================================================
    // GET AGENCY OWNER
    // ==================================================

    const owner =
      await getWalletOwner(
        partner,
        session
      );

    // ==================================================
    // OWNER MUST ALSO BE ACTIVE
    // ==================================================

    if (
      !skipEligibilityCheck &&
      (
      !owner.isApproved ||
      !owner.isVerified ||
      owner.isBlocked ||
      owner.applicationStatus !==
        "Verified"
      )
    ) {
      const error = new Error(
        "Agency Owner is not active and verified"
      );

      error.code =
        "AGENCY_OWNER_NOT_ACTIVE";

      throw error;
    }

    // ==================================================
    // TEAM WALLET
    // ==================================================

    const wallet =
      await TeamWallet.findOne({
        ownerPartnerId:
          owner._id,
      }).session(session);

    if (!wallet) {
      const error = new Error(
        "Team wallet not found"
      );

      error.code =
        "TEAM_WALLET_NOT_FOUND";

      throw error;
    }

    // ==================================================
    // FROZEN WALLET
    // ==================================================

    if (wallet.isFrozen) {
      const error = new Error(
        "Team wallet is frozen"
      );

      error.code =
        "TEAM_WALLET_FROZEN";

      throw error;
    }

    // ==================================================
    // SUB AGENT VALIDATION
    // ==================================================

    if (
      partner.accountType ===
      "subagent"
    ) {
      const available =
        Number(
          partner
            .teamCreditAllocation
            ?.availableLimit ||
            0
        );

      // ================================================
      // ALLOCATION LIMIT
      // ================================================

      if (available < qty) {
        const error =
          new Error(
            `Sub-Agent spending limit exceeded. Available ${available}`
          );

        error.code =
          "INSUFFICIENT_CREDITS";

        throw error;
      }

      // ================================================
      // APPROVAL THRESHOLD
      // ================================================

      const threshold =
        partner
          .teamCreditAllocation
          ?.approvalThreshold;

      if (
        partner
          .teamCreditAllocation
          ?.requiresApprovalAboveThreshold &&
        threshold != null &&
        qty >
          Number(threshold) &&
        metadata
          ?.spendingApproved !==
          true
      ) {
        const error =
          new Error(
            `Agency approval required above ${threshold} credits`
          );

        error.code =
          "SPENDING_APPROVAL_REQUIRED";

        throw error;
      }
    }

    // ==================================================
    // CHECK SHARED WALLET BALANCE
    // ==================================================

    if (
      Number(
        wallet.balance || 0
      ) < qty
    ) {
      const error =
        new Error(
          "Insufficient team wallet credits"
        );

      error.code =
        "INSUFFICIENT_CREDITS";

      throw error;
    }

    const before =
      Number(
        wallet.balance || 0
      );

    // ==================================================
    // CALCULATE PAID/PROMOTIONAL USAGE
    // ==================================================

    const {
      paidUsed,
      promotionalUsed,
    } = splitDebit(
      wallet.paidBalance,
      wallet.promotionalBalance,
      qty
    );

    // ==================================================
    // DEBIT PROMOTIONAL
    // ==================================================

    wallet.promotionalBalance =
      Math.max(
        0,

        Number(
          wallet.promotionalBalance ||
            0
        ) -
          promotionalUsed
      );

    // ==================================================
    // DEBIT PAID
    // ==================================================

    wallet.paidBalance =
      Math.max(
        0,

        Number(
          wallet.paidBalance ||
            0
        ) -
          paidUsed
      );

    // ==================================================
    // TOTAL BALANCE
    // ==================================================

    wallet.balance =
      Math.max(
        0,

        Number(
          wallet.balance || 0
        ) - qty
      );

    wallet.totalSpent =
      Number(
        wallet.totalSpent || 0
      ) + qty;

    // ==================================================
    // SUB AGENT ALLOCATION DEBIT
    // ==================================================

    if (
      partner.accountType ===
      "subagent"
    ) {
      partner.teamCreditAllocation.availableLimit =
        Math.max(
          0,

          Number(
            partner
              .teamCreditAllocation
              ?.availableLimit ||
              0
          ) - qty
        );

      partner.teamCreditAllocation.totalSpent =
        Number(
          partner
            .teamCreditAllocation
            ?.totalSpent ||
            0
        ) + qty;

      // ================================================
      // allocatedToMembers means currently reserved
      // unused member credits.
      // ================================================

      wallet.allocatedToMembers =
        Math.max(
          0,

          Number(
            wallet.allocatedToMembers ||
              0
          ) - qty
        );

      await partner.save({
        session,
      });
    }

    await wallet.save({
      session,
    });

    await syncTeamWalletOwnerMirror({
      ownerId: owner._id,
      wallet,
      debitedDelta: qty,
      session,
    });

    // ==================================================
    // SHARED WALLET TRANSACTION
    //
    // IMPORTANT:
    //
    // walletOwnerPartnerId = Agency Owner
    //
    // attributedPartnerId = actual spender
    //
    // If Rahul Sub-Agent spends:
    // attributedPartnerId = Rahul._id
    // ==================================================

    const [transaction] =
      await CreditTransaction.create(
        [
          {
            transactionId:
              txId(),

            walletType:
              "TEAM_SHARED",

            walletOwnerPartnerId:
              owner._id,

            attributedPartnerId:
              partner._id,

            partnerCode:
              partner.partnerId ||
              "",

            partnerName:
              partner.name || "",

            type,

            direction:
              "DEBIT",

            creditBucket:
              paidUsed &&
              promotionalUsed
                ? "MIXED"
                : paidUsed
                ? "PAID"
                : "PROMOTIONAL",

            credits:
              qty,

            paidCredits:
              paidUsed,

            promotionalCredits:
              promotionalUsed,

            balanceBefore:
              before,

            balanceAfter:
              wallet.balance,

            productCode,

            status:
              "SUCCESS",

            idempotencyKey,

            referenceType,

            referenceId,

            description,

            metadata: {
              ...metadata,

              accountType:
                partner.accountType,

              agencyOwnerId:
                owner._id,

              agencyPartnerCode:
                owner.partnerId ||
                "",

              agencyName:
                owner.business
                  ?.businessName ||
                owner.name,

              subAgentId:
                partner.accountType ===
                "subagent"
                  ? partner._id
                  : null,

              availableLimitAfter:
                partner.accountType ===
                "subagent"
                  ? partner
                      .teamCreditAllocation
                      ?.availableLimit
                  : null,
            },

            performedBy:
              makeActor(actor),
          },
        ],
        {
          session,
        }
      );

    return {
      partner,
      wallet,
      transaction,
    };
  }

  // ====================================================
  // SINGLE PARTNER
  // ====================================================

  if (
    Number(
      partner.creditWallet
        ?.balance || 0
    ) < qty
  ) {
    const error = new Error(
      `Insufficient credits. Available ${
        partner.creditWallet
          ?.balance || 0
      }`
    );

    error.code =
      "INSUFFICIENT_CREDITS";

    throw error;
  }

  const before =
    Number(
      partner.creditWallet
        .balance || 0
    );

  const {
    paidUsed,
    promotionalUsed,
  } = splitDebit(
    partner.creditWallet
      .paidBalance,

    partner.creditWallet
      .promotionalBalance,

    qty
  );

  // ====================================================
  // SINGLE PROMOTIONAL DEBIT
  // ====================================================

  partner.creditWallet.promotionalBalance =
    Math.max(
      0,

      Number(
        partner.creditWallet
          .promotionalBalance ||
          0
      ) -
        promotionalUsed
    );

  // ====================================================
  // SINGLE PAID DEBIT
  // ====================================================

  partner.creditWallet.paidBalance =
    Math.max(
      0,

      Number(
        partner.creditWallet
          .paidBalance ||
          0
      ) -
        paidUsed
    );

  // ====================================================
  // SINGLE BALANCE
  // ====================================================

  partner.creditWallet.balance =
    Math.max(
      0,

      Number(
        partner.creditWallet
          .balance || 0
      ) - qty
    );

  partner.creditWallet.totalDebited =
    Number(
      partner.creditWallet
        .totalDebited || 0
    ) + qty;

  partner.creditWallet.totalSpent =
    Number(
      partner.creditWallet
        .totalSpent || 0
    ) + qty;

  await partner.save({
    session,
  });

  // ====================================================
  // SINGLE TRANSACTION
  // ====================================================

  const [transaction] =
    await CreditTransaction.create(
      [
        {
          transactionId:
            txId(),

          walletType:
            "SINGLE",

          walletOwnerPartnerId:
            partner._id,

          attributedPartnerId:
            partner._id,

          partnerCode:
            partner.partnerId ||
            "",

          partnerName:
            partner.name || "",

          type,

          direction:
            "DEBIT",

          creditBucket:
            paidUsed &&
            promotionalUsed
              ? "MIXED"
              : paidUsed
              ? "PAID"
              : "PROMOTIONAL",

          credits:
            qty,

          paidCredits:
            paidUsed,

          promotionalCredits:
            promotionalUsed,

          balanceBefore:
            before,

          balanceAfter:
            partner.creditWallet
              .balance,

          productCode,

          status:
            "SUCCESS",

          idempotencyKey,

          referenceType,

          referenceId,

          description,

          metadata: {
            ...metadata,

            accountType:
              "single",
          },

          performedBy:
            makeActor(actor),
        },
      ],
      {
        session,
      }
    );

  return {
    partner,

    wallet:
      partner.creditWallet,

    transaction,
  };
};
