import AgentNetwork from "../../models/AgentNetwork.js";
import cloudinary from "../../config/cloudinary.js";

export const getAgentNetwork = async (req, res) => {
    try {
  
      let section = await AgentNetwork.findOne();
  
      if (!section) {
  
        section = await AgentNetwork.create({
          topTitle: "THE NETWORK",
  
          heading: "Voices of Punjab's Top Agents",
  
          cards: [],
        });
  
      }
  
      res.json(section);
  
    } catch (error) {
  
      res.status(500).json({
        message: error.message,
      });
  
    }
  };

  export const updateHeading = async (req, res) => {

    try {
  
      let section = await AgentNetwork.findOne();
  
      if (!section) {
  
        section = new AgentNetwork();
  
      }
  
      section.topTitle = req.body.topTitle;
  
      section.heading = req.body.heading;
  
      await section.save();
  
      res.json({
        success: true,
        section,
      });
  
    }
  
    catch (error) {
  
      res.status(500).json({
        message: error.message,
      });
  
    }
  
  };

  export const addCard = async (req, res) => {

    try {
  
      const section = await AgentNetwork.findOne();
  
      const card = {
  
        name: req.body.name,
  
        designation: req.body.designation,
  
        review: req.body.review,
  
        image: req.file
          ? {
              url: req.file.path,
              public_id: req.file.filename,
            }
          : {},
  
      };
  
      section.cards.push(card);
  
      await section.save();
  
      res.json({
        success: true,
        section,
      });
  
    }
  
    catch (error) {
  
      res.status(500).json({
        message: error.message,
      });
  
    }
  
  };

  export const updateCard = async (req, res) => {

    try {
  
      const section = await AgentNetwork.findOne();
  
      const card = section.cards.id(req.params.id);
  
      if (!card) {
  
        return res.status(404).json({
          message: "Card not found",
        });
  
      }
  
      card.name = req.body.name;
  
      card.designation = req.body.designation;
  
      card.review = req.body.review;
  
      if (req.file) {
  
        if (card.image?.public_id) {
  
          await cloudinary.uploader.destroy(
            card.image.public_id
          );
  
        }
  
        card.image = {
  
          url: req.file.path,
  
          public_id: req.file.filename,
  
        };
  
      }
  
      await section.save();
  
      res.json({
        success: true,
        section,
      });
  
    }
  
    catch (error) {
  
      res.status(500).json({
        message: error.message,
      });
  
    }
  
  };

  export const deleteCard = async (req, res) => {

    try {
  
      const section = await AgentNetwork.findOne();
  
      const card = section.cards.id(req.params.id);
  
      if (!card) {
  
        return res.status(404).json({
          message: "Card not found",
        });
  
      }
  
      if (card.image?.public_id) {
  
        await cloudinary.uploader.destroy(
          card.image.public_id
        );
  
      }
  
      section.cards.pull(req.params.id);
  
      await section.save();
  
      res.json({
        success: true,
      });
  
    }
  
    catch (error) {
  
      res.status(500).json({
        message: error.message,
      });
  
    }
  
  };