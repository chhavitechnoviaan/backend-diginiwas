import PlanSection from "../../models/PlanSection.js";

// ================= GET =================

export const getPlanSection = async (req, res) => {
  try {

    let section = await PlanSection.findOne();

    if (!section) {

      section = await PlanSection.create({

        topTitle: "PARTNERSHIP PLANS",

        heading: "Choose Your Growth Path",

        plans: [

          {
            title: "Starter Agent",

            description:
              "For individuals beginning their luxury real estate journey.",

            price: "₹2,499",

            duration: "/month",

            badge: "",

            buttonText: "Get Started",

            buttonType: "outline",

            features: [

              "Up to 5 Premium Listings",

              "Standard CRM Access",

              "10 Verified Leads / Mo",

            ],

          },

          {

            title: "Pro Agent",

            description:
              "Full-suite AI tools for the career-driven professional.",

            price: "₹5,999",

            duration: "/month",

            badge: "MOST POPULAR",

            buttonText: "Start 14-Day Free Trial",

            buttonType: "filled",

            features: [

              "Unlimited Listings",

              "Advanced AI Intent Scoring",

              "50 Verified Leads / Mo",

              "Priority Listing Support",

            ],

          },

          {

            title: "Elite Partner",

            description:
              "Bespoke solutions for established agencies and brokerages.",

            price: "Custom Pricing",

            duration: "",

            badge: "",

            buttonText: "Contact Sales",

            buttonType: "outline",

            features: [

              "Multi-Agent CRM Console",

              "Featured Network Exclusivity",

              "White-label Property Portal",

              "Dedicated Account Manager",

            ],

          },

        ],

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

export const updatePlanSection = async (req, res) => {

  try {

    let section = await PlanSection.findOne();

    if (!section) {

      section = new PlanSection();

    }

    section.topTitle = req.body.topTitle;

    section.heading = req.body.heading;

    section.plans = req.body.plans;

    await section.save();

    res.json({

      success: true,

      message: "Plan Section Updated",

      section,

    });

  }

  catch (error) {

    res.status(500).json({

      message: error.message,

    });

  }

};