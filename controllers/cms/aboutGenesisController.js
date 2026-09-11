import AboutGenesis from "../../models/AboutGenesis.js";
import cloudinary from "../../config/cloudinary.js";

// ================= GET =================

export const getAboutGenesis = async (req, res) => {

  try {

    let section = await AboutGenesis.findOne();

    if (!section) {

      section = await AboutGenesis.create({

        topTitle: "THE GENESIS",

        heading: "Beyond the Fragmented Market.",

        paragraph1:
          "For decades, the real estate landscape in Punjab was defined by word-of-mouth, lack of transparency, and immense challenges for the global Punjabi diaspora (NRIs).",

        paragraph2:
          "We saw a market rich in value but poor in accessibility. Niwas AI was born from the necessity to digitize trust. By integrating advanced machine learning with local ground intelligence, we created a single point of truth.",

        quote:
          "Our mission is simple: To ensure that every brick laid in Punjab is a brick built on data and trust.",

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

export const updateAboutGenesis = async(req,res)=>{

    try{
  
      let section=await AboutGenesis.findOne();
  
      if(!section){
  
        section=new AboutGenesis();
  
      }
  
      section.topTitle=req.body.topTitle;
  
      section.heading=req.body.heading;
  
      section.paragraph1=req.body.paragraph1;
  
      section.paragraph2=req.body.paragraph2;
  
      section.quote=req.body.quote;
  
      if(req.file){
  
        if(section.image?.public_id){
  
          await cloudinary.uploader.destroy(
            section.image.public_id
          );
  
        }
  
        section.image={
  
          url:req.file.path,
  
          public_id:req.file.filename,
  
        };
  
      }
  
      await section.save();
  
      res.json({
  
        success:true,
  
        message:"About Genesis Updated",
  
        section,
  
      });
  
    }
  
    catch(error){
  
      res.status(500).json({
  
        message:error.message,
  
      });
  
    }
  
  };

export const deleteAboutGenesisImage = async(req,res)=>{

    try{
  
      const section=await AboutGenesis.findOne();
  
      if(!section?.image?.public_id){
  
        return res.json({
  
          success:true,
  
        });
  
      }
  
      await cloudinary.uploader.destroy(
        section.image.public_id
      );
  
      section.image={};
  
      await section.save();
  
      res.json({
  
        success:true,
  
      });
  
    }
  
    catch(error){
  
      res.status(500).json({
  
        message:error.message,
  
      });
  
    }
  
  };