import AboutStats from "../../models/AboutStats.js";

// ================= GET =================

export const getAboutStats = async (req, res) => {

  try {

    let section = await AboutStats.findOne();

    if (!section) {

      section = await AboutStats.create({

        stats: [

          {
            value: "10,000+",
            label: "VERIFIED LISTINGS",
          },

          {
            value: "500+",
            label: "EXPERT AGENTS",
          },

          {
            value: "500+",
            label: "PORTFOLIO VALUE",
          },

          {
            value: "24/7",
            label: "AI CONCIERGE",
          },

        ],

      });

    }

    res.json(section);

  }

  catch(error){

    res.status(500).json({

      message:error.message,

    });

  }

};

// ================= UPDATE =================

export const updateAboutStats = async(req,res)=>{

  try{

    let section=await AboutStats.findOne();

    if(!section){

      section=new AboutStats();

    }

    section.stats=req.body.stats;

    await section.save();

    res.json({

      success:true,

      message:"About Stats Updated",

      section,

    });

  }

  catch(error){

    res.status(500).json({

      message:error.message,

    });

  }

};