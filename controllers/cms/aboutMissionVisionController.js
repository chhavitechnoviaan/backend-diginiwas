import AboutMissionVision from "../../models/AboutMissionVision.js";

// ================= GET =================

export const getAboutMissionVision = async (req, res) => {

  try {

    let section = await AboutMissionVision.findOne();

    if (!section) {

      section = await AboutMissionVision.create({

        mission: {

          title: "Our Mission",

          heading:
            "Modernize property discovery through intelligent automation.",

          description:
            "We are committed to removing the friction from real estate transactions by providing instantly accessible, verified, and AI-vetted data.",

        },

        vision: {

          title: "Our Vision",

          heading:
            "India's most trusted AI-driven property ecosystem.",

          description:
            "To define the next century of Indian real estate by becoming the gold standard for asset valuation and ownership transparency.",

        },

      });

    }

    res.json(section);

  }

  catch (error) {

    res.status(500).json({

      message: error.message,

    });

  }

};

// ================= UPDATE =================

export const updateAboutMissionVision = async (req, res) => {

  try {

    let section = await AboutMissionVision.findOne();

    if (!section) {

      section = new AboutMissionVision();

    }

    section.mission = req.body.mission;

    section.vision = req.body.vision;

    await section.save();

    res.json({

      success: true,

      message: "Mission & Vision Updated Successfully",

      section,

    });

  }

  catch (error) {

    res.status(500).json({

      message: error.message,

    });

  }

};