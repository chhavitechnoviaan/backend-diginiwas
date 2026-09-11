import mongoose from "mongoose";
import SavedProperty from "../../models/SavedProperty.js";
import Buyer from "../../models/Buyer.js";
import Property from "../../models/NewProperty.js";

export const saveProperty = async (req, res) => {
  try {
    const { buyerId, propertyId } = req.body;

    if (!buyerId || !propertyId) {
      return res.status(400).json({
        success: false,
        message: "buyerId and propertyId are required.",
      });
    }

    if (
      !mongoose.Types.ObjectId.isValid(buyerId) ||
      !mongoose.Types.ObjectId.isValid(propertyId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid buyer or property ID.",
      });
    }

    const [buyer, property] = await Promise.all([
      Buyer.findById(buyerId).lean(),
      Property.findById(propertyId).lean(),
    ]);

    if (!buyer) {
      return res.status(404).json({
        success: false,
        message: "Buyer not found.",
      });
    }

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found.",
      });
    }

    const existing = await SavedProperty.findOne({
      buyerId,
      propertyId,
    }).lean();

    if (existing) {
      return res.status(200).json({
        success: true,
        alreadySaved: true,
        message: "Property already saved.",
        data: existing,
      });
    }

    const saved = await SavedProperty.create({
      buyerId: buyer._id,
      propertyId: property._id,
      propertySnapshot: {
        propertyCode: property.propertyId || "",
        title: property.title || property.projectName || "",
        projectName: property.projectName || "",
        city: property.city || "",
        locality: property.locality || "",
        price: Number(property.price || 0),
        image: property.images?.[0]?.url || "",
        bedrooms: property.bedrooms || "",
        bathrooms: property.bathrooms || "",
        propertySize: Number(
          property.propertySize ||
          property.carpetArea ||
          property.superBuiltupArea ||
          0
        ),
        transactionType: property.transactionType || "",
        category: property.category || "",
      },
    });

    return res.status(201).json({
      success: true,
      message: "Property saved successfully.",
      data: saved,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(200).json({
        success: true,
        alreadySaved: true,
        message: "Property already saved.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Unable to save property.",
      error: error.message,
    });
  }
};

export const getBuyerSavedProperties = async (req, res) => {
  try {
    const { buyerId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(buyerId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid buyer ID.",
      });
    }

    const properties = await SavedProperty.find({
      buyerId,
    })
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      count: properties.length,
      data: properties,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to fetch saved properties.",
      error: error.message,
    });
  }
};

export const checkSavedProperty = async (req, res) => {
  try {
    const { buyerId, propertyId } = req.params;

    if (
      !mongoose.Types.ObjectId.isValid(buyerId) ||
      !mongoose.Types.ObjectId.isValid(propertyId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid buyer or property ID.",
      });
    }

    const saved = await SavedProperty.findOne({
      buyerId,
      propertyId,
    }).lean();

    return res.status(200).json({
      success: true,
      saved: Boolean(saved),
      data: saved || null,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to check saved property.",
      error: error.message,
    });
  }
};

export const removeSavedProperty = async (req, res) => {
  try {
    const { buyerId, propertyId } = req.params;

    if (
      !mongoose.Types.ObjectId.isValid(buyerId) ||
      !mongoose.Types.ObjectId.isValid(propertyId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid buyer or property ID.",
      });
    }

    const removed = await SavedProperty.findOneAndDelete({
      buyerId,
      propertyId,
    });

    if (!removed) {
      return res.status(404).json({
        success: false,
        message: "Saved property not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Property removed from saved properties.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to remove saved property.",
      error: error.message,
    });
  }
};
