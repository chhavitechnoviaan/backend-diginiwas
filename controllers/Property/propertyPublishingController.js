import mongoose from "mongoose";
import Property from "../../models/NewProperty.js";

const hasAssignedPartner = (property) =>
  Boolean(property?.assignedPartner?.partnerId);

const makeBaseReadyQuery = () => ({
  status: "Verified",
  propertyVerificationStatus: "Verified",
  "assignedPartner.partnerId": { $ne: null },
});

export const getPropertyPublishingSummary = async (req, res) => {
  try {
    const [
      readyForFinalReview,
      live,
      verifiedWithoutPartner,
      totalVerified,
    ] = await Promise.all([
      Property.countDocuments(makeBaseReadyQuery()),

      Property.countDocuments({
        status: "Live",
        propertyVerificationStatus: "Verified",
      }),

      Property.countDocuments({
        status: "Verified",
        propertyVerificationStatus: "Verified",
        $or: [
          { "assignedPartner.partnerId": null },
          { "assignedPartner.partnerId": { $exists: false } },
        ],
      }),

      Property.countDocuments({
        propertyVerificationStatus: "Verified",
      }),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        readyForFinalReview,
        live,
        verifiedWithoutPartner,
        totalVerified,
      },
    });
  } catch (error) {
    console.error("PROPERTY PUBLISHING SUMMARY ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch property publishing summary.",
      error: error.message,
    });
  }
};

export const getReadyForFinalReviewProperties = async (req, res) => {
  try {
    const {
      search = "",
      city = "",
      category = "",
      transactionType = "",
    } = req.query;

    const query = makeBaseReadyQuery();

    if (city && city !== "All") {
      query.city = {
        $regex: `^${city.trim()}$`,
        $options: "i",
      };
    }

    if (category && category !== "All") {
      query.category = category;
    }

    if (
      transactionType &&
      transactionType !== "All"
    ) {
      query.transactionType = transactionType;
    }

    if (search.trim()) {
      const value = search.trim();

      query.$or = [
        {
          propertyId: {
            $regex: value,
            $options: "i",
          },
        },
        {
          title: {
            $regex: value,
            $options: "i",
          },
        },
        {
          projectName: {
            $regex: value,
            $options: "i",
          },
        },
        {
          developerName: {
            $regex: value,
            $options: "i",
          },
        },
        {
          city: {
            $regex: value,
            $options: "i",
          },
        },
        {
          locality: {
            $regex: value,
            $options: "i",
          },
        },
        {
          "assignedPartner.name": {
            $regex: value,
            $options: "i",
          },
        },
        {
          "assignedPartner.partnerCode": {
            $regex: value,
            $options: "i",
          },
        },
      ];
    }

    const properties = await Property.find(query)
      .populate(
        "assignedPartner.partnerId",
        "partnerId name email phone partnerType isVerified isBlocked"
      )
      .sort({ updatedAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      count: properties.length,
      data: properties,
    });
  } catch (error) {
    console.error("READY FINAL REVIEW PROPERTY ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch final review properties.",
      error: error.message,
    });
  }
};

export const getLivePublishingProperties = async (req, res) => {
  try {
    const {
      search = "",
      city = "",
      category = "",
      transactionType = "",
    } = req.query;

    const query = {
      status: "Live",
      propertyVerificationStatus: "Verified",
    };

    if (city && city !== "All") {
      query.city = {
        $regex: `^${city.trim()}$`,
        $options: "i",
      };
    }

    if (category && category !== "All") {
      query.category = category;
    }

    if (
      transactionType &&
      transactionType !== "All"
    ) {
      query.transactionType = transactionType;
    }

    if (search.trim()) {
      const value = search.trim();

      query.$or = [
        {
          propertyId: {
            $regex: value,
            $options: "i",
          },
        },
        {
          title: {
            $regex: value,
            $options: "i",
          },
        },
        {
          projectName: {
            $regex: value,
            $options: "i",
          },
        },
        {
          city: {
            $regex: value,
            $options: "i",
          },
        },
        {
          locality: {
            $regex: value,
            $options: "i",
          },
        },
      ];
    }

    const properties = await Property.find(query)
      .populate(
        "assignedPartner.partnerId",
        "partnerId name email phone partnerType isVerified isBlocked"
      )
      .sort({ updatedAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      count: properties.length,
      data: properties,
    });
  } catch (error) {
    console.error("LIVE PROPERTY LIST ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch live properties.",
      error: error.message,
    });
  }
};

export const getFinalReviewPropertyById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid property ID.",
      });
    }

    const property = await Property.findById(id)
      .populate(
        "assignedPartner.partnerId",
        "partnerId name email phone partnerType isVerified isBlocked location"
      )
      .lean();

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found.",
      });
    }

    const assignedPartner =
      property?.assignedPartner?.partnerId || null;

    const checks = {
      propertyVerified:
        property.propertyVerificationStatus === "Verified",
      statusEligible:
        ["Verified", "Live"].includes(property.status),
      partnerAssigned:
        Boolean(assignedPartner || property?.assignedPartner?.partnerCode),
      partnerVerified:
        assignedPartner
          ? Boolean(assignedPartner.isVerified)
          : Boolean(property?.assignedPartner?.partnerId),
      partnerNotBlocked:
        assignedPartner
          ? !assignedPartner.isBlocked
          : true,
      hasImages:
        Array.isArray(property.images) &&
        property.images.length > 0,
      hasFloorPlan:
        Boolean(property.floorPlan),
      hasReraCertificate:
        Boolean(property.reraCertificate),
      hasVideo:
        Boolean(property.video || property.videoLink),
    };

    const canMakeLive =
      checks.propertyVerified &&
      checks.statusEligible &&
      checks.partnerAssigned &&
      checks.partnerVerified &&
      checks.partnerNotBlocked &&
      property.status !== "Live";

    return res.status(200).json({
      success: true,
      data: {
        property,
        checks,
        canMakeLive,
      },
    });
  } catch (error) {
    console.error("FINAL REVIEW DETAIL ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch final review detail.",
      error: error.message,
    });
  }
};

export const makePropertyLiveAfterFinalReview = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      notes = "Final review completed. Property made live.",
    } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid property ID.",
      });
    }

    const property = await Property.findById(id)
      .populate(
        "assignedPartner.partnerId",
        "partnerId name email phone partnerType isVerified isBlocked"
      );

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found.",
      });
    }

    if (property.status === "Live") {
      return res.status(200).json({
        success: true,
        alreadyLive: true,
        message: "Property is already Live.",
        data: property,
      });
    }

    if (
      property.propertyVerificationStatus !== "Verified" ||
      property.status !== "Verified"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Only a Verified property can proceed to final publishing.",
      });
    }

    if (!property?.assignedPartner?.partnerId) {
      return res.status(400).json({
        success: false,
        message:
          "A verified assigned partner is required before making the property Live.",
      });
    }

    const partnerDoc =
      property.assignedPartner.partnerId;

    if (
      typeof partnerDoc === "object" &&
      partnerDoc !== null
    ) {
      if (!partnerDoc.isVerified) {
        return res.status(400).json({
          success: false,
          message:
            "Assigned partner must be verified before the property can be made Live.",
        });
      }

      if (partnerDoc.isBlocked) {
        return res.status(400).json({
          success: false,
          message:
            "Assigned partner is blocked. Property cannot be made Live.",
        });
      }
    }

    const previousStatus = property.status;

    property.status = "Live";
    property.propertyVerificationStatus = "Verified";

    property.review.notes = notes;
    property.review.reviewedAt = new Date();
    property.review.reviewedBy = {
      userId: req.user?._id || null,
      name: req.user?.name || "Admin",
      role: req.user?.role || "Admin",
    };

    property.statusHistory.push({
      status: "Live",
      updatedBy: {
        userId: req.user?._id || null,
        name: req.user?.name || "Admin",
        role: req.user?.role || "Admin",
      },
      remarks:
        notes ||
        `Final review completed. Property status changed from ${previousStatus} to Live.`,
    });

    await property.save();

    return res.status(200).json({
      success: true,
      message: "Final review completed. Property is now Live.",
      data: property,
    });
  } catch (error) {
    console.error("MAKE PROPERTY LIVE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to make property Live.",
      error: error.message,
    });
  }
};
