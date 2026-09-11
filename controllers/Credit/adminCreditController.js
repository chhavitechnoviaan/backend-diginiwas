import mongoose from "mongoose";
import Partner from "../../models/Partner.js";
import TeamWallet from "../../models/TeamWallet.js";
import CreditTransaction from "../../models/CreditTransaction.js";
import {
  creditPartnerWallet,
  debitPartnerWallet,
} from "../../services/creditWalletService.js";

const MAX_BULK_PARTNERS = 1000;

const positiveCredits = (value) => {
  const credits = Number(value);
  return Number.isInteger(credits) && credits > 0 ? credits : null;
};

const cleanReason = (value) => String(value || "").trim();

const adminActor = (req) => ({
  userId: req.user.id,
  name: "DigiNiwas Admin",
  role: "admin",
});

const partnerLookup = (identifier) => {
  const value = String(identifier || "").trim();
  if (!value) return null;
  return mongoose.Types.ObjectId.isValid(value)
    ? { $or: [{ _id: value }, { partnerId: value }] }
    : { partnerId: value };
};

const resolvePartner = async (identifier) => {
  const query = partnerLookup(identifier);
  return query ? Partner.findOne(query).select("_id partnerId name accountType isSubPartner") : null;
};

const ensureWalletOwner = (partner) => {
  if (partner.accountType === "subagent" || partner.isSubPartner) {
    const error = new Error(
      "Credits cannot be adjusted directly for a Sub-Agent. Select the Team/Agency Owner wallet."
    );
    error.code = "SUB_AGENT_WALLET_NOT_ALLOWED";
    throw error;
  }
};

const idempotencyValue = (req, suffix = "") => {
  const supplied = String(req.body.idempotencyKey || req.get("Idempotency-Key") || "").trim();
  return supplied ? `ADMIN:${supplied}${suffix}` : "";
};

const statusForError = (error) => {
  if (error.code === "INSUFFICIENT_CREDITS" || error.code === "SUB_AGENT_WALLET_NOT_ALLOWED") return 400;
  if (error.message === "Partner not found") return 404;
  return 500;
};

// GET /api/credits/admin/adjustments
// Persistent admin ledger used by the Admin Credit Management screen.
export const getAdminAdjustments = async (req, res) => {
  try {
    const page = Math.max(Number(req.query.page || 1), 1);
    const limit = Math.min(Math.max(Number(req.query.limit || 20), 1), 100);
    const query = {
      type: { $in: ["ADMIN_ADJUSTMENT_CREDIT", "ADMIN_ADJUSTMENT_DEBIT"] },
      status: "SUCCESS",
    };

    if (req.query.partnerId) {
      const partner = await resolvePartner(req.query.partnerId);
      if (!partner) return res.status(404).json({ success: false, message: "Partner not found." });
      query.$or = [
        { walletOwnerPartnerId: partner._id },
        { attributedPartnerId: partner._id },
      ];
    }

    const [rows, total] = await Promise.all([
      CreditTransaction.find(query)
        .populate("walletOwnerPartnerId", "partnerId name email accountType creditWallet")
        .populate("attributedPartnerId", "partnerId name email accountType")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      CreditTransaction.countDocuments(query),
    ]);

    const data = rows.map((transaction) => {
      const account = transaction.attributedPartnerId || transaction.walletOwnerPartnerId;
      return {
        _id: transaction._id,
        transactionId: transaction.transactionId,
        operation: transaction.direction === "DEBIT" ? "WITHDRAW" : "ADD",
        credits: Number(transaction.credits || 0),
        balanceBefore: Number(transaction.balanceBefore || 0),
        balanceAfter: Number(transaction.balanceAfter || 0),
        source: transaction.metadata?.source || transaction.productCode || "ADMIN_ADJUSTMENT",
        reason: transaction.metadata?.userVisibleReason || transaction.description || "",
        reference: transaction.metadata?.reference || "",
        partnerMongoId: account?._id || transaction.attributedPartnerId,
        partnerId: account?.partnerId || transaction.partnerCode || "",
        partnerName: account?.name || transaction.partnerName || "",
        partnerEmail: account?.email || "",
        walletType: transaction.walletType,
        performedBy: transaction.performedBy,
        createdAt: transaction.createdAt,
      };
    });

    return res.json({
      success: true,
      data,
      pagination: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Unable to fetch admin adjustments.", error: error.message });
  }
};

// POST /api/credits/admin/withdraw
// Deducts credits and stores the mandatory user-visible reason in the ledger.
export const withdrawCreditsByAdmin = async (req, res) => {
  const credits = positiveCredits(req.body.credits ?? req.body.amount);
  const reason = cleanReason(req.body.reason);

  if (!req.body.partnerId) {
    return res.status(400).json({ success: false, message: "partnerId is required." });
  }
  if (!credits) {
    return res.status(400).json({ success: false, message: "credits must be a positive whole number." });
  }
  if (reason.length < 3 || reason.length > 250) {
    return res.status(400).json({ success: false, message: "reason must contain 3 to 250 characters." });
  }

  const session = await mongoose.startSession();
  try {
    const partner = await resolvePartner(req.body.partnerId);
    if (!partner) return res.status(404).json({ success: false, message: "Partner not found." });
    ensureWalletOwner(partner);

    let result;
    await session.withTransaction(async () => {
      result = await debitPartnerWallet({
        partnerId: partner._id,
        credits,
        type: "ADMIN_ADJUSTMENT_DEBIT",
        productCode: "ADMIN_WITHDRAWAL",
        referenceType: "Manual",
        description: reason,
        metadata: {
          source: String(req.body.source || "ADMIN_WITHDRAWAL").toUpperCase(),
          reference: cleanReason(req.body.reference),
          userVisibleReason: reason,
        },
        actor: adminActor(req),
        idempotencyKey: idempotencyValue(req),
        skipEligibilityCheck: true,
        session,
      });
    });

    return res.json({
      success: true,
      message: `DigiNiwas deducted ${credits} credits: ${reason}`,
      data: { creditsDeducted: credits, wallet: result.wallet, transaction: result.transaction },
    });
  } catch (error) {
    return res.status(statusForError(error)).json({ success: false, message: error.message });
  } finally {
    await session.endSession();
  }
};

// POST /api/credits/admin/add
// CASH_PAYMENT becomes paid credits; PROMOTIONAL is free/admin-issued credit.
export const addCreditsByAdmin = async (req, res) => {
  const credits = positiveCredits(req.body.credits ?? req.body.amount);
  const reason = cleanReason(req.body.reason);
  const source = String(req.body.source || "PROMOTIONAL").toUpperCase();
  const isCashPayment = source === "CASH_PAYMENT";
  const amountInRupees = Number(req.body.amountInRupees || 0);

  if (!req.body.partnerId) return res.status(400).json({ success: false, message: "partnerId is required." });
  if (!credits) return res.status(400).json({ success: false, message: "credits must be a positive whole number." });
  if (reason.length < 3 || reason.length > 250) return res.status(400).json({ success: false, message: "reason must contain 3 to 250 characters." });
  if (!Number.isFinite(amountInRupees) || amountInRupees < 0 || (isCashPayment && amountInRupees <= 0)) {
    return res.status(400).json({ success: false, message: "A positive amountInRupees is required for CASH_PAYMENT." });
  }

  const session = await mongoose.startSession();
  try {
    const partner = await resolvePartner(req.body.partnerId);
    if (!partner) return res.status(404).json({ success: false, message: "Partner not found." });
    ensureWalletOwner(partner);

    let result;
    await session.withTransaction(async () => {
      result = await creditPartnerWallet({
        partnerId: partner._id,
        credits,
        type: "ADMIN_ADJUSTMENT_CREDIT",
        amountInRupees: isCashPayment ? amountInRupees : 0,
        bucket: isCashPayment ? "PAID" : "PROMOTIONAL",
        productCode: isCashPayment ? "ADMIN_CASH_CREDIT" : "ADMIN_PROMOTIONAL_CREDIT",
        referenceType: "Manual",
        description: reason,
        metadata: { source, reference: cleanReason(req.body.reference), userVisibleReason: reason, paymentCollectedOffline: isCashPayment },
        actor: adminActor(req),
        idempotencyKey: idempotencyValue(req),
        session,
      });
    });

    return res.status(201).json({
      success: true,
      message: `DigiNiwas added ${credits} credits: ${reason}`,
      data: { creditsAdded: credits, source, wallet: result.wallet, transaction: result.transaction },
    });
  } catch (error) {
    return res.status(statusForError(error)).json({ success: false, message: error.message });
  } finally {
    await session.endSession();
  }
};

// POST /api/credits/admin/bulk-add
// Provide partnerIds, or allPartners=true for a festive/platform-wide grant.
export const bulkAddCreditsByAdmin = async (req, res) => {
  const credits = positiveCredits(req.body.credits ?? req.body.amount);
  const reason = cleanReason(req.body.reason);
  const allPartners = req.body.allPartners === true;
  const requestedIds = [...new Set((Array.isArray(req.body.partnerIds) ? req.body.partnerIds : []).map(String))];

  if (!credits) return res.status(400).json({ success: false, message: "credits must be a positive whole number." });
  if (reason.length < 3 || reason.length > 250) return res.status(400).json({ success: false, message: "reason must contain 3 to 250 characters." });
  if (!allPartners && requestedIds.length === 0) return res.status(400).json({ success: false, message: "Provide partnerIds or set allPartners to true." });
  if (requestedIds.length > MAX_BULK_PARTNERS) return res.status(400).json({ success: false, message: `A maximum of ${MAX_BULK_PARTNERS} partnerIds is allowed.` });

  const query = allPartners
    ? { accountType: { $in: ["single", "team"] }, isSubPartner: { $ne: true } }
    : { $or: requestedIds.map(partnerLookup).filter(Boolean) };
  const partners = await Partner.find(query).select("_id partnerId name accountType isSubPartner").limit(MAX_BULK_PARTNERS + 1);
  if (partners.length > MAX_BULK_PARTNERS) return res.status(400).json({ success: false, message: `Bulk grants are limited to ${MAX_BULK_PARTNERS} wallet owners per request.` });
  if (!partners.length) return res.status(404).json({ success: false, message: "No eligible partners found." });

  const results = [];
  for (const partner of partners) {
    const session = await mongoose.startSession();
    try {
      let result;
      await session.withTransaction(async () => {
        result = await creditPartnerWallet({
          partnerId: partner._id,
          credits,
          type: "ADMIN_ADJUSTMENT_CREDIT",
          bucket: "PROMOTIONAL",
          productCode: "ADMIN_BULK_PROMOTIONAL_CREDIT",
          referenceType: "Manual",
          description: reason,
          metadata: {
            source: String(req.body.source || "PROMOTIONAL").toUpperCase(),
            reference: cleanReason(req.body.reference),
            grantType: allPartners ? "ALL_PARTNERS" : "SELECTED_PARTNERS",
            userVisibleReason: reason,
          },
          actor: adminActor(req),
          idempotencyKey: idempotencyValue(req, `:${partner._id}`),
          session,
        });
      });
      results.push({ partnerId: partner.partnerId, partnerMongoId: partner._id, success: true, balanceAfter: result.transaction.balanceAfter, transactionId: result.transaction.transactionId });
    } catch (error) {
      results.push({ partnerId: partner.partnerId, partnerMongoId: partner._id, success: false, error: error.message });
    } finally {
      await session.endSession();
    }
  }

  const successful = results.filter((item) => item.success).length;
  return res.status(successful ? 201 : 500).json({
    success: successful === results.length,
    message: `${credits} promotional credits granted to ${successful} of ${results.length} partners.`,
    data: { creditsPerPartner: credits, totalCreditsGranted: successful * credits, successful, failed: results.length - successful, results },
  });
};

// POST /api/credits/admin/sync-wallets
// One-time/backfill utility for team credits created before wallet mirroring.
export const syncTeamWalletsByAdmin = async (req, res) => {
  try {
    const wallets = await TeamWallet.find({}).lean();
    const results = [];

    for (const wallet of wallets) {
      const updateResult = await Partner.updateOne(
        { _id: wallet.ownerPartnerId },
        {
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
            "creditWallet.totalRefunded": Number(
              wallet.totalRefunded || 0
            ),
          },
        }
      );

      results.push({
        ownerPartnerId: wallet.ownerPartnerId,
        ownerPartnerCode: wallet.ownerPartnerCode,
        balance: Number(wallet.balance || 0),
        updated: updateResult.modifiedCount > 0,
      });
    }

    return res.json({
      success: true,
      message: `${results.length} team wallet(s) synchronized with partner creditWallet.`,
      data: {
        processed: results.length,
        updated: results.filter((item) => item.updated).length,
        results,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to synchronize team wallets.",
      error: error.message,
    });
  }
};
