import PlatformFeature from "../../models/PlatformFeature.js";

// Get Features
export const getPlatformFeatures = async (req, res) => {
  try {
    let data = await PlatformFeature.findOne();

    if (!data) {
      data = await PlatformFeature.create({});
    }

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Save / Update Features
export const savePlatformFeatures = async (req, res) => {
  try {
    const { topTitle, features } = req.body;

    let data = await PlatformFeature.findOne();

    if (data) {
      data.topTitle = topTitle;
      data.features = features;
      await data.save();
    } else {
      data = await PlatformFeature.create({
        topTitle,
        features,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Features saved successfully!",
      data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};