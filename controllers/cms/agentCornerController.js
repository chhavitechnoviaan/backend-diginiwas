import AgentCorner from "../../models/AgentCornerStats.js";
import cloudinary from "../../config/cloudinary.js";

// Get
export const getAgentCorner = async (req, res) => {
  try {
    let data = await AgentCorner.findOne();

    if (!data) {
      data = await AgentCorner.create({
        stats: [
          {
            value: "10,000+",
            label: "VERIFIED LEADS",
          },
          {
            value: "2,500+",
            label: "ACTIVE AGENTS",
          },
          {
            value: "₹500Cr+",
            label: "TRANSACTIONS",
          },
        ],
      });
    }

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update
export const updateAgentCorner = async (req, res) => {
  try {
    let section = await AgentCorner.findOne();

    if (!section) {
      section = new AgentCorner();
    }

    if (req.body.stats) {
      section.stats = JSON.parse(req.body.stats);
    }

    if (req.file) {
      if (section.image?.public_id) {
        await cloudinary.uploader.destroy(section.image.public_id);
      }

      section.image = {
        url: req.file.path,
        public_id: req.file.filename,
      };
    }

    await section.save();

    res.json({
      success: true,
      section,
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};