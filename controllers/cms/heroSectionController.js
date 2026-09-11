import HeroSection from "../../models/HeroSection.js";
import cloudinary from "../../config/cloudinary.js";

export const saveHeroSection = async (req, res) => {
  try {
    const {
        headingLine1,
        headingLine2,
        verifiedAgents,
        propertiesListed,
        happyCustomers,
        localitiesCovered,
      } = req.body;
    

    let hero = await HeroSection.findOne();

    if (!hero) {
      hero = new HeroSection();
    }

    hero.headingLine1 = headingLine1;
    hero.headingLine2 = headingLine2;
    hero.verifiedAgents = verifiedAgents;
hero.propertiesListed = propertiesListed;
hero.happyCustomers = happyCustomers;
hero.localitiesCovered = localitiesCovered;

    if (req.files && req.files.heroImage1?.length > 0) {
      if (hero.heroImage1?.public_id) {
        await cloudinary.uploader.destroy(hero.heroImage1.public_id);
      }

      hero.heroImage1 = {
        url: req.files.heroImage1[0].path,
        public_id: req.files.heroImage1[0].filename,
      };
    }

    if (req.files && req.files.heroImage2?.length > 0) {
      if (hero.heroImage2?.public_id) {
        await cloudinary.uploader.destroy(hero.heroImage2.public_id);
      }

      hero.heroImage2 = {
        url: req.files.heroImage2[0].path,
        public_id: req.files.heroImage2[0].filename,
      };
    }

    if (req.files && req.files.heroImage3?.length > 0) {
      if (hero.heroImage3?.public_id) {
        await cloudinary.uploader.destroy(hero.heroImage3.public_id);
      }

      hero.heroImage3 = {
        url: req.files.heroImage3[0].path,
        public_id: req.files.heroImage3[0].filename,
      };
    }

    await hero.save();

    res.status(200).json({
      success: true,
      message: "Hero Section Updated Successfully",
      hero,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getHeroSection = async (req, res) => {
  try {
    const hero = await HeroSection.findOne();

    res.status(200).json({
      success: true,
      hero,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteHeroImage = async (req, res) => {
  try {
    const { imageNo } = req.body;

    const hero = await HeroSection.findOne();

    if (!hero) {
      return res.status(404).json({
        success: false,
        message: "Hero Section Not Found",
      });
    }

    const field = `heroImage${imageNo}`;

    if (hero[field]?.public_id) {
      await cloudinary.uploader.destroy(hero[field].public_id);
    }

    hero[field] = {
      url: "",
      public_id: "",
    };

    await hero.save();

    res.status(200).json({
      success: true,
      message: "Image Deleted Successfully",
      hero,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

