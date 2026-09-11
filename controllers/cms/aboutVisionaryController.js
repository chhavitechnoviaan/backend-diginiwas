import AboutVisionary from "../../models/AboutVisionary.js";
import cloudinary from "../../config/cloudinary.js";

// ================= GET =================

export const getVisionaries = async (req, res) => {

  try {

    let section = await AboutVisionary.findOne();

    if (!section) {

      section = await AboutVisionary.create({

        sectionTitle: "The Visionaries",

        sectionSubtitle:
          "Expert in technology and real estate crafting the future",

        members: [],

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

export const addVisionary = async(req,res)=>{

    try{
  
      let section=await AboutVisionary.findOne();
  
      if(!section){
  
        section=new AboutVisionary();
  
      }
  
      section.members.push({
  
        name:req.body.name,
  
        designation:req.body.designation,
  
        description:req.body.description,
  
        image:req.file
        ?{
            url:req.file.path,
            public_id:req.file.filename,
         }
        :{},
  
      });
  
      await section.save();
  
      res.json({
  
        success:true,
  
        message:"Member Added",
  
        section,
  
      });
  
    }
  
    catch(error){
  
      res.status(500).json({
  
        message:error.message,
  
      });
  
    }
  
  };

  export const updateVisionaryHeader = async(req,res)=>{

    try{
  
      let section=await AboutVisionary.findOne();
  
      if(!section){
  
        section=new AboutVisionary();
  
      }
  
      section.sectionTitle=req.body.sectionTitle;
  
      section.sectionSubtitle=req.body.sectionSubtitle;
  
      await section.save();
  
      res.json({
  
        success:true,
  
        section,
  
      });
  
    }
  
    catch(error){
  
      res.status(500).json({
  
        message:error.message,
  
      });
  
    }
  
  };

  export const updateVisionary=async(req,res)=>{

    try{
    
    const section=await AboutVisionary.findOne();
    
    const member=section.members.id(req.params.id);
    
    member.name=req.body.name;
    
    member.designation=req.body.designation;
    
    member.description=req.body.description;
    
    if(req.file){
    
    if(member.image?.public_id){
    
    await cloudinary.uploader.destroy(member.image.public_id);
    
    }
    
    member.image={
    
    url:req.file.path,
    
    public_id:req.file.filename,
    
    };
    
    }
    
    await section.save();
    
    res.json({
    
    success:true,
    
    section,
    
    });
    
    }
    
    catch(error){
    
    res.status(500).json({
    
    message:error.message,
    
    });
    
    }
    
    };

    export const deleteVisionary=async(req,res)=>{

        try{
        
        const section=await AboutVisionary.findOne();
        
        const member=section.members.id(req.params.id);
        
        if(member.image?.public_id){
        
        await cloudinary.uploader.destroy(member.image.public_id);
        
        }
        
        member.deleteOne();
        
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

        