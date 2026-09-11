import NetworkDensity from "../../models/NetworkDensity.js";

// GET
export const getNetworkDensity = async (req, res) => {
  try {

    let section = await NetworkDensity.findOne();

    if (!section) {

      section = await NetworkDensity.create({
        headingLine1: "Explore the Agent",
        headingHighlight: "Network Density",

        description:
          "Our network is expanding rapidly across Punjab's major hubs. Join the movement and dominate your local market with Niwas AI's local intelligence.",

        cities: [
          {
            name: "Chandigarh",
            count: "850+",
          },
          {
            name: "Mohali",
            count: "600+",
          },
          {
            name: "Ludhiana",
            count: "450+",
          },
          {
            name: "Jalandhar",
            count: "300+",
          },
        ],
      });

    }

    res.json(section);

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }
};

// UPDATE
export const updateNetworkDensity = async (req, res) => {

  try {

    let section = await NetworkDensity.findOne();

    if (!section) {

      section = new NetworkDensity();

    }

    section.headingLine1 = req.body.headingLine1;

    section.headingHighlight = req.body.headingHighlight;

    section.description = req.body.description;

    section.cities = req.body.cities;

    await section.save();

    res.json({
      success: true,
      message: "Network Density Updated",
      section,
    });

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }

};