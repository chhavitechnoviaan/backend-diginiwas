import RoundSection from "../../models/RoundSection.js";
import cloudinary from "../../config/cloudinary.js";

export const saveRoundSection = async (req, res) => {
  try {
    let roundSection = await RoundSection.findOne();

    if (!roundSection) {
      roundSection = new RoundSection();
    }

    if (req.files.image1) {
      roundSection.image1 = {
        url: req.files.image1[0].path,
        public_id: req.files.image1[0].filename,
      };
    }

    if (req.files.image2) {
      roundSection.image2 = {
        url: req.files.image2[0].path,
        public_id: req.files.image2[0].filename,
      };
    }

    if (req.files.image3) {
      roundSection.image3 = {
        url: req.files.image3[0].path,
        public_id: req.files.image3[0].filename,
      };
    }

    if (req.files.image4) {
      roundSection.image4 = {
        url: req.files.image4[0].path,
        public_id: req.files.image4[0].filename,
      };
    }

    if (req.files.image5) {
      roundSection.image5 = {
        url: req.files.image5[0].path,
        public_id: req.files.image5[0].filename,
      };
    }

    await roundSection.save();

    res.status(200).json({
      success: true,
      message: "Round Section Updated Successfully",
      roundSection,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getRoundSection = async (req, res) => {
  try {
    const roundSection = await RoundSection.findOne();

    res.status(200).json({
      success: true,
      roundSection,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteRoundImage = async (req, res) => {
  try {
    const { imageNo } = req.body;

    const roundSection = await RoundSection.findOne();

    if (!roundSection) {
      return res.status(404).json({
        success: false,
        message: "Round Section not found",
      });
    }

    const key = `image${imageNo}`;

    if (roundSection[key]?.public_id) {
      await cloudinary.uploader.destroy(roundSection[key].public_id);
    }

    roundSection[key] = {
      url: "",
      public_id: "",
    };

    await roundSection.save();

    res.status(200).json({
      success: true,
      message: "Image Deleted Successfully",
      roundSection,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};