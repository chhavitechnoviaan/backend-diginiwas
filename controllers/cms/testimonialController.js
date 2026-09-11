import Testimonial from "../../models/Testimonial.js";
import cloudinary from "../../config/cloudinary.js";

/* ===========================
   Add Testimonial
=========================== */

export const createTestimonial = async (req, res) => {
  try {
    const { name, designation, review, videoLink } = req.body;

    const image = req.file
      ? {
          url: req.file.path,
          public_id: req.file.filename,
        }
      : {
          url: "",
          public_id: "",
        };

    const testimonial = await Testimonial.create({
      name,
      designation,
      review,
      videoLink,
      image,
    });

    res.status(201).json({
      success: true,
      message: "Testimonial Added Successfully",
      testimonial,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ===========================
   Get All Testimonials
=========================== */

export const getTestimonials = async (req, res) => {
  try {
    const testimonials = await Testimonial.find().sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      testimonials,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ===========================
   Get Single Testimonial
=========================== */

export const getSingleTestimonial = async (req, res) => {
  try {
    const testimonial = await Testimonial.findById(req.params.id);

    if (!testimonial) {
      return res.status(404).json({
        success: false,
        message: "Testimonial Not Found",
      });
    }

    res.status(200).json({
      success: true,
      testimonial,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ===========================
   Update Testimonial
=========================== */

export const updateTestimonial = async (req, res) => {
  try {
    const { name, designation, review, videoLink } = req.body;

    const testimonial = await Testimonial.findById(req.params.id);

    if (!testimonial) {
      return res.status(404).json({
        success: false,
        message: "Testimonial Not Found",
      });
    }

    testimonial.name = name;
    testimonial.designation = designation;
    testimonial.review = review;
    testimonial.videoLink = videoLink;

    if (req.file) {
      if (testimonial.image?.public_id) {
        await cloudinary.uploader.destroy(testimonial.image.public_id);
      }

      testimonial.image = {
        url: req.file.path,
        public_id: req.file.filename,
      };
    }

    await testimonial.save();

    res.status(200).json({
      success: true,
      message: "Testimonial Updated Successfully",
      testimonial,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ===========================
   Delete Testimonial
=========================== */

export const deleteTestimonial = async (req, res) => {
  try {
    const testimonial = await Testimonial.findById(req.params.id);

    if (!testimonial) {
      return res.status(404).json({
        success: false,
        message: "Testimonial Not Found",
      });
    }

    if (testimonial.image?.public_id) {
      await cloudinary.uploader.destroy(testimonial.image.public_id);
    }

    await testimonial.deleteOne();

    res.status(200).json({
      success: true,
      message: "Testimonial Deleted Successfully",
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};